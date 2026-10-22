<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('desa_id')->nullable()->constrained('desas')->nullOnDelete();
            $table->string('room_type', 40)->default('direct'); // direct, apbdes_oversight, support_warga
            $table->foreignId('participant_one_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('participant_two_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('support_ticket_number', 50)->nullable()->unique();
            $table->string('support_nik', 20)->nullable();
            $table->string('support_name', 150)->nullable();
            $table->string('support_phone', 30)->nullable();
            $table->string('title', 150)->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chat_room_id')->constrained('chat_rooms')->cascadeOnDelete();
            $table->foreignId('sender_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('sender_type', ['user', 'warga_guest'])->default('user');
            $table->string('sender_name', 150);
            $table->longText('message_encrypted'); // Payload ciphertext terenkripsi E2EE / AES
            $table->string('iv', 64)->nullable(); // Initialization Vector untuk enkripsi
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_rooms');
    }
};

