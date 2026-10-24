<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('idempotency_keys')) {
            Schema::create('idempotency_keys', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id');
                $table->string('idempotency_key', 64);
                $table->string('endpoint', 128);
                $table->char('request_hash', 64);
                $table->integer('response_code')->default(200);
                $table->longText('response_body')->nullable();
                $table->enum('status', ['processing', 'completed', 'failed'])->default('processing');
                $table->timestamps();

                $table->unique(['user_id', 'idempotency_key', 'endpoint'], 'idempotency_user_key_endpoint_unique');
                $table->index(['user_id', 'created_at']);
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
