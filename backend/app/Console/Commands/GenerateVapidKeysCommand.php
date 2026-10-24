<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeysCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webpush:vapid {--force : Overwrite existing keys}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate VAPID keys for Web Push Notifications';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // On Windows with Herd or PHP, ensure OPENSSL_CONF is set if openssl_pkey_new fails
        if (!getenv('OPENSSL_CONF')) {
            $possiblePaths = [
                'C:\Users\genn\.config\herd\bin\php84\extras\ssl\openssl.cnf',
                'C:\Users\genn\.config\herd\openssl.cnf',
                dirname(PHP_BINARY) . '\extras\ssl\openssl.cnf',
            ];
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    putenv('OPENSSL_CONF=' . $path);
                    break;
                }
            }
        }

        $keys = VAPID::createVapidKeys();

        $envPath = base_path('.env');
        if (!file_exists($envPath)) {
            $this->error('.env file not found.');
            return self::FAILURE;
        }

        $envContent = file_get_contents($envPath);

        $hasPublicKey = str_contains($envContent, 'VAPID_PUBLIC_KEY=');
        $hasPrivateKey = str_contains($envContent, 'VAPID_PRIVATE_KEY=');

        if (($hasPublicKey || $hasPrivateKey) && !$this->option('force')) {
            $this->info('VAPID keys already exist in .env. Use --force to regenerate.');
            $this->line('Current Public Key: ' . config('services.webpush.public_key'));
            return self::SUCCESS;
        }

        if ($hasPublicKey) {
            $envContent = preg_replace('/^VAPID_PUBLIC_KEY=.*$/m', 'VAPID_PUBLIC_KEY=' . $keys['publicKey'], $envContent);
        } else {
            $envContent .= "\nVAPID_PUBLIC_KEY=" . $keys['publicKey'];
        }

        if ($hasPrivateKey) {
            $envContent = preg_replace('/^VAPID_PRIVATE_KEY=.*$/m', 'VAPID_PRIVATE_KEY=' . $keys['privateKey'], $envContent);
        } else {
            $envContent .= "\nVAPID_PRIVATE_KEY=" . $keys['privateKey'];
        }

        if (!str_contains($envContent, 'VAPID_SUBJECT=')) {
            $envContent .= "\nVAPID_SUBJECT=mailto:admin@sidesku.desa.id";
        }

        file_put_contents($envPath, $envContent);

        $this->info('VAPID keys generated and saved to .env successfully.');
        $this->line('Public Key: ' . $keys['publicKey']);

        return self::SUCCESS;
    }
}
