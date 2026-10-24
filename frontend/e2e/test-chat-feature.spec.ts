import { test, expect } from '@playwright/test';

test.describe('Chat Feature Comprehensive End-to-End Test', () => {
  test('Warga chats with Sekdes, Sekdes uses Pusat Pesan, replies back', async ({ browser, isMobile }) => {
    // 1. Warga context
    const wargaContext = await browser.newContext();
    const wargaPage = await wargaContext.newPage();

    // Login as Warga
    await wargaPage.goto('http://localhost:5173/login');
    await wargaPage.fill('input[type="text"]', 'warga01');
    await wargaPage.fill('input[type="password"]', 'password123');
    await wargaPage.click('button[type="submit"]');
    await wargaPage.waitForURL('**/dashboard**');

    // Look for chat widget floating button
    const chatButton = wargaPage.locator('button[title*="Chat"]');
    await expect(chatButton).toBeVisible({ timeout: 5000 });
    await chatButton.click();

    // Check modal opens
    const chatDrawer = wargaPage.locator('text=Ruang Pesan Desa');
    await expect(chatDrawer).toBeVisible({ timeout: 5000 });

    // Click "Mulai Chat Baru"
    await wargaPage.click('button:has-text("Mulai Chat Baru")');

    // Find Sekdes contact
    const sekdesContact = wargaPage.locator('text=Ahmad Fauzi, S.Kom');
    await expect(sekdesContact).toBeVisible({ timeout: 5000 });
    await sekdesContact.click();

    // Send a message from Warga
    const msgInput = wargaPage.locator('input[placeholder*="Ketik pesan"]');
    await expect(msgInput).toBeVisible({ timeout: 5000 });
    const wargaMessage = `Halo Pak Sekdes mohon info KTP baru ${Date.now()}`;
    await msgInput.fill(wargaMessage);
    await wargaPage.click('button[type="submit"]:has(svg)');

    // Verify message sent in Warga view
    await expect(wargaPage.locator(`p.whitespace-pre-wrap:has-text("${wargaMessage}")`)).toBeVisible({ timeout: 5000 });
    console.log('Message sent successfully from Warga!');

    // 2. Sekdes context
    const sekdesContext = await browser.newContext();
    const sekdesPage = await sekdesContext.newPage();

    // Login as Sekdes
    await sekdesPage.goto('http://localhost:5173/login');
    await sekdesPage.fill('input[type="text"]', 'sekdes');
    await sekdesPage.fill('input[type="password"]', 'password123');
    await sekdesPage.click('button[type="submit"]');
    await sekdesPage.waitForURL('**/dashboard**');

    // Sekdes navigates to Pusat Pesan via Topbar button (works on desktop & mobile)
    const pesanTopbarButton = sekdesPage.locator('button[aria-label="Pusat Pesan & Chat"]');
    await expect(pesanTopbarButton).toBeVisible({ timeout: 5000 });
    await pesanTopbarButton.click();

    // Check that Pusat Pesan full page view renders
    await expect(sekdesPage.locator('text=Pusat Pesan & Komunikasi Desa')).toBeVisible({ timeout: 5000 });

    // Check if Warga room appears in conversation list
    const wargaRoom = sekdesPage.locator('text=Bambang Utomo').first();
    await expect(wargaRoom).toBeVisible({ timeout: 8000 });
    await wargaRoom.click();

    // Verify message sent by Warga is visible to Sekdes
    await expect(sekdesPage.locator(`p.whitespace-pre-wrap:has-text("${wargaMessage}")`)).toBeVisible({ timeout: 5000 });
    console.log('Message received and verified by Sekdes in Pusat Pesan!');

    // Sekdes replies back
    const sekdesReplyInput = sekdesPage.locator('input[placeholder*="Ketik pesan"]');
    await expect(sekdesReplyInput).toBeVisible({ timeout: 5000 });
    const sekdesReply = `Baik pak Bambang, berkas sedang kami proses di balai desa. ${Date.now()}`;
    await sekdesReplyInput.fill(sekdesReply);
    await sekdesPage.click('button[type="submit"]:has-text("Kirim")');

    // Verify reply visible in Sekdes view
    await expect(sekdesPage.locator(`p.whitespace-pre-wrap:has-text("${sekdesReply}")`)).toBeVisible({ timeout: 5000 });

    // 3. Verify reply arrives at Warga
    await expect(wargaPage.locator(`p.whitespace-pre-wrap:has-text("${sekdesReply}")`)).toBeVisible({ timeout: 8000 });
    console.log('Sekdes reply arrived and verified at Warga view!');

    await wargaContext.close();
    await sekdesContext.close();
  });
});
