<?php

namespace Tests\Feature;

use App\Models\SuratRequest;
use App\Models\User;
use App\Services\FileUploadSecurityService;
use App\Services\IdempotencyService;
use Tests\TestCase;

class SecurityPhase3IntegrationTest extends TestCase
{
    /**
     * 1. Public tracking: Validasi keyword dan masking PII.
     */
    public function test_public_tracking_requires_keyword_and_masks_pii(): void
    {
        // Tanpa keyword -> 422
        $responseEmpty = $this->getJson('/api/public/surat/track');
        $responseEmpty->assertStatus(422)
            ->assertJson(['success' => false]);

        // Keyword resi valid -> 200 dan PII aman
        $responseValid = $this->getJson('/api/public/surat/track?keyword=REQ-20260818-001');
        $responseValid->assertStatus(200)
            ->assertJson(['success' => true]);

        $data = $responseValid->json('data');
        if (!empty($data)) {
            $first = $data[0];
            $this->assertArrayNotHasKey('form_data_json', $first);
            $this->assertArrayNotHasKey('file_lampiran', $first);

            if (isset($first['warga_profile'])) {
                $this->assertStringContainsString('*', $first['warga_profile']['nama_lengkap']);
                $this->assertArrayNotHasKey('nik', $first['warga_profile']);
                $this->assertArrayNotHasKey('no_hp_wa', $first['warga_profile']);
                $this->assertArrayNotHasKey('alamat_ktp', $first['warga_profile']);
                $this->assertArrayNotHasKey('foto_ktp', $first['warga_profile']);
            }
        }
    }

    /**
     * 2. Barcode SVG: Sanitasi tag dan karakter khusus untuk mencegah SVG/XML Injection.
     */
    public function test_barcode_svg_sanitizes_xml_special_characters(): void
    {
        $payload = '<script>alert("xss")</script>';
        $response = $this->get('/api/public/surat/barcode?data=' . urlencode($payload));

        $response->assertStatus(200);
        $this->assertEquals('image/svg+xml', $response->headers->get('Content-Type'));

        $content = $response->getContent();
        // Memastikan tag <script> mentah tidak di-render ke dalam SVG
        $this->assertStringNotContainsString('<script>alert("xss")</script>', $content);
    }

    /**
     * 3. FileUploadSecurityService: Menolak PDF yang mengandung skrip aktif (/JavaScript).
     */
    public function test_file_upload_security_rejects_active_javascript_in_pdf(): void
    {
        $maliciousPdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /Names << /JavaScript 3 0 R >> >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Names [(JS) 5 0 R] >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\n5 0 obj\n<< /S /JavaScript /JS (app.alert('pwned');) >>\nendobj\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n250\n%%EOF";

        $result = FileUploadSecurityService::processBase64Upload(
            base64_encode($maliciousPdf),
            ['application/pdf'],
            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
            'test_audit',
            'test_pdf'
        );

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('script aktif', $result['message']);
    }

    /**
     * 4. FileUploadSecurityService: Menerima PDF bersih tanpa skrip aktif.
     */
    public function test_file_upload_security_accepts_clean_pdf(): void
    {
        $cleanPdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n150\n%%EOF";

        $result = FileUploadSecurityService::processBase64Upload(
            base64_encode($cleanPdf),
            ['application/pdf'],
            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
            'test_audit',
            'test_clean_pdf'
        );

        $this->assertTrue($result['success']);
        $this->assertNotEmpty($result['url']);

        // Bersihkan file testing yang dibuat
        if (!empty($result['filename'])) {
            $createdPath = public_path('uploads/test_audit/' . $result['filename']);
            if (file_exists($createdPath)) {
                @unlink($createdPath);
            }
        }
    }

    /**
     * 5. IdempotencyService: Normalisasi payload kanonikal mengabaikan field acak non-semantik.
     */
    public function test_idempotency_service_normalizes_payload_consistently(): void
    {
        $payload1 = [
            'keperluan' => 'Permohonan surat keterangan',
            'surat_type_id' => 1,
            '_token' => 'random_csrf_1',
            'idempotency_key' => 'client_key_1',
        ];

        $payload2 = [
            'idempotency_key' => 'client_key_different',
            'surat_type_id' => 1,
            '_token' => 'random_csrf_2',
            'keperluan' => 'Permohonan surat keterangan',
        ];

        $norm1 = IdempotencyService::normalizePayload($payload1);
        $norm2 = IdempotencyService::normalizePayload($payload2);

        $this->assertEquals($norm1, $norm2);
        $this->assertArrayNotHasKey('_token', $norm1);
        $this->assertArrayNotHasKey('idempotency_key', $norm1);
    }
}
