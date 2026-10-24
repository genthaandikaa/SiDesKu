<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get available chat contacts for the authenticated user.
     */
    public function getContacts(Request $request): JsonResponse
    {
        $user = $request->user();
        $desaId = $user->desa_id;

        $query = User::with('role')
            ->where('id', '!=', $user->id)
            ->where('is_active', true);

        if ($desaId) {
            $query->where('desa_id', $desaId);
        }

        $users = $query->get()->map(function ($u) {
            $roleSlug = $u->role ? $u->role->slug : 'warga';
            $category = 'warga';
            if (in_array($roleSlug, ['super_admin', 'admin', 'sekdes', 'kades', 'bendahara_desa', 'perangkat_desa', 'staf', 'kaur', 'kasi'])) {
                $category = 'aparatur_desa';
            } elseif (in_array($roleSlug, ['rt', 'rw', 'ketua_rt', 'ketua_rw'])) {
                $category = 'pengurus_wilayah';
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'username' => $u->username,
                'category' => $category,
                'role' => $u->role ? [
                    'id' => $u->role->id,
                    'name' => $u->role->name,
                    'slug' => $u->role->slug,
                    'display_name' => $u->role->display_name ?? $u->role->name,
                ] : null,
            ];
        })
        ->sortBy(function ($item) {
            $order = ['aparatur_desa' => 0, 'pengurus_wilayah' => 1, 'warga' => 2];
            return $order[$item['category']] ?? 3;
        })
        ->values();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Get active chat rooms for current user.
     */
    public function getRooms(Request $request): JsonResponse
    {
        $user = $request->user();
        $desaId = $user->desa_id;

        $rooms = ChatRoom::with([
            'participantOne.role',
            'participantTwo.role',
            'latestMessage',
        ])
        ->withCount(['messages as unread_count' => function ($q) use ($user) {
            $q->where('is_read', false)
              ->where(function ($sub) use ($user) {
                  $sub->where('sender_user_id', '!=', $user->id)
                      ->orWhereNull('sender_user_id');
              });
        }])
        ->where(function ($q) use ($user, $desaId) {
            $q->where('participant_one_id', $user->id)
              ->orWhere('participant_two_id', $user->id);

            // Admin desa, sekdes, kades also see support tickets within their desa
            if ($user->hasRole(['admin', 'super_admin', 'sekdes', 'kades'])) {
                $q->orWhere(function ($sq) use ($desaId) {
                    $sq->where('room_type', 'support_warga');
                    if ($desaId) {
                        $sq->where('desa_id', $desaId);
                    }
                });
            }
        })
        ->orderByDesc('last_message_at')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }

    /**
     * Get total unread messages count for current user.
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        $user = $request->user();
        $desaId = $user->desa_id;

        $roomsQuery = ChatRoom::where(function ($q) use ($user, $desaId) {
            $q->where('participant_one_id', $user->id)
              ->orWhere('participant_two_id', $user->id);

            if ($user->hasRole(['admin', 'super_admin', 'sekdes', 'kades'])) {
                $q->orWhere(function ($sq) use ($desaId) {
                    $sq->where('room_type', 'support_warga');
                    if ($desaId) {
                        $sq->where('desa_id', $desaId);
                    }
                });
            }
        });

        $roomIds = $roomsQuery->pluck('id');

        $unreadCount = ChatMessage::whereIn('chat_room_id', $roomIds)
            ->where('is_read', false)
            ->where(function ($sub) use ($user) {
                $sub->where('sender_user_id', '!=', $user->id)
                    ->orWhereNull('sender_user_id');
            })
            ->count();

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get or create a direct or topic-based chat room.
     */
    public function getOrCreateRoom(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'target_user_id' => 'required|exists:users,id',
            'room_type' => 'nullable|in:direct,apbdes_oversight,support_warga',
            'title' => 'nullable|string|max:150',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $user = $request->user();
        $targetUserId = (int)$request->target_user_id;
        $roomType = $request->room_type ?? 'direct';

        $room = ChatRoom::where(function ($q) use ($user, $targetUserId) {
            $q->where(function ($sub) use ($user, $targetUserId) {
                $sub->where('participant_one_id', $user->id)->where('participant_two_id', $targetUserId);
            })->orWhere(function ($sub) use ($user, $targetUserId) {
                $sub->where('participant_one_id', $targetUserId)->where('participant_two_id', $user->id);
            });
        })
        ->where('room_type', $roomType)
        ->first();

        if (!$room) {
            $targetUser = User::find($targetUserId);
            $room = ChatRoom::create([
                'desa_id' => $user->desa_id ?? $targetUser->desa_id,
                'room_type' => $roomType,
                'participant_one_id' => $user->id,
                'participant_two_id' => $targetUserId,
                'title' => $request->title ?? "Chat {$user->name} & {$targetUser->name}",
                'last_message_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $room->load(['participantOne.role', 'participantTwo.role']),
        ]);
    }

    /**
     * Get all messages in a room.
     */
    public function getMessages(Request $request, $roomId): JsonResponse
    {
        $user = $request->user();
        $room = ChatRoom::findOrFail($roomId);

        // Security check: verify user is participant or has permission if support ticket
        $isParticipant = ($room->participant_one_id === $user->id || $room->participant_two_id === $user->id);
        $isOfficial = $user->hasRole(['admin', 'super_admin', 'sekdes', 'kades']) && $room->room_type === 'support_warga';

        if (!$isParticipant && !$isOfficial) {
            return response()->json(['success' => false, 'message' => 'Akses percakapan tidak diizinkan.'], 403);
        }

        // Mark incoming messages as read
        ChatMessage::where('chat_room_id', $room->id)
            ->where('is_read', false)
            ->where(function ($sub) use ($user) {
                $sub->where('sender_user_id', '!=', $user->id)
                    ->orWhereNull('sender_user_id');
            })
            ->update(['is_read' => true]);

        $messages = ChatMessage::where('chat_room_id', $room->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Send a message to a room.
     */
    public function sendMessage(Request $request, $roomId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message_encrypted' => 'required|string',
            'iv' => 'nullable|string|max:64',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $user = $request->user();
        $room = ChatRoom::findOrFail($roomId);

        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_user_id' => $user->id,
            'sender_type' => 'user',
            'sender_name' => $user->name,
            'message_encrypted' => $request->message_encrypted,
            'iv' => $request->iv,
            'is_read' => false,
        ]);

        $room->update(['last_message_at' => now()]);

        // Trigger notification log for recipient
        try {
            $recipientId = null;
            if ($room->room_type === 'direct') {
                $recipientId = ($room->participant_one_id === $user->id)
                    ? $room->participant_two_id
                    : $room->participant_one_id;
            }

            if ($recipientId) {
                \App\Models\NotifikasiLog::create([
                    'desa_id' => $room->desa_id ?? $user->desa_id,
                    'user_id' => $recipientId,
                    'jenis_notifikasi' => 'chat',
                    'judul' => 'Pesan baru dari ' . $user->name,
                    'pesan' => Str::limit($request->message_encrypted, 90),
                    'status_pengiriman' => 'terkirim',
                    'payload_json' => [
                        'chat_room_id' => $room->id,
                        'sender_id' => $user->id,
                        'sender_name' => $user->name,
                    ],
                ]);

                // Web Push Notification ke Penerima Pesan
                $recipientUser = User::find($recipientId);
                if ($recipientUser) {
                    app(\App\Services\WebPushService::class)->sendToUser(
                        $recipientUser,
                        'Pesan Baru di Pusat Pesan',
                        'Anda menerima pesan baru dari ' . $user->name . ' di Pusat Pesan Desa.',
                        '/dashboard',
                        'chat-room-' . $room->id
                    );
                }
            } elseif ($room->room_type === 'support_warga') {
                if (!$user->hasRole(['admin', 'super_admin', 'sekdes', 'kades'])) {
                    $officials = User::where('desa_id', $room->desa_id ?? $user->desa_id)
                        ->whereHas('role', fn($r) => $r->whereIn('slug', ['admin', 'sekdes', 'kades']))
                        ->get();
                    foreach ($officials as $official) {
                        \App\Models\NotifikasiLog::create([
                            'desa_id' => $room->desa_id ?? $user->desa_id,
                            'user_id' => $official->id,
                            'jenis_notifikasi' => 'chat_support',
                            'judul' => 'Pesan Bantuan: ' . ($room->support_ticket_number ?? 'Tiket Warga'),
                            'pesan' => Str::limit($request->message_encrypted, 90),
                            'status_pengiriman' => 'terkirim',
                            'payload_json' => [
                                'chat_room_id' => $room->id,
                                'ticket' => $room->support_ticket_number,
                            ],
                        ]);
                    }
                }
            }
        } catch (\Throwable $th) {
            // Notification is best-effort and must not break the chat flow
        }

        return response()->json([
            'success' => true,
            'data' => $message,
        ], 201);
    }

    /**
     * Public Guest Warga Support: Initiate a helpdesk ticket/chat when forgot password or need help.
     */
    public function initiateGuestSupport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nik' => 'required|string|size:16',
            'nama' => 'required|string|max:150',
            'no_hp' => 'nullable|string|max:30',
            'initial_message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
        }

        $ticket = 'TIK-' . date('Ymd') . '-' . strtoupper(Str::random(5));

        // Attempt find desa by NIK profile if exists
        $profile = WargaProfile::where('nik', $request->nik)->first();
        $desaId = $profile ? $profile->desa_id : 1;

        $room = ChatRoom::create([
            'desa_id' => $desaId,
            'room_type' => 'support_warga',
            'support_ticket_number' => $ticket,
            'support_nik' => $request->nik,
            'support_name' => $request->nama,
            'support_phone' => $request->no_hp,
            'title' => "Bantuan Akun NIK {$request->nik} ({$request->nama})",
            'last_message_at' => now(),
        ]);

        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_user_id' => null,
            'sender_type' => 'warga_guest',
            'sender_name' => $request->nama,
            'message_encrypted' => $request->initial_message,
            'is_read' => false,
        ]);

        try {
            $officials = User::where('desa_id', $desaId)
                ->whereHas('role', fn($r) => $r->whereIn('slug', ['admin', 'sekdes', 'kades']))
                ->get();
            foreach ($officials as $official) {
                \App\Models\NotifikasiLog::create([
                    'desa_id' => $desaId,
                    'user_id' => $official->id,
                    'jenis_notifikasi' => 'chat_support',
                    'judul' => 'Pengajuan Bantuan NIK: ' . $request->nik,
                    'pesan' => Str::limit($request->initial_message, 90),
                    'status_pengiriman' => 'terkirim',
                    'payload_json' => [
                        'chat_room_id' => $room->id,
                        'ticket' => $ticket,
                    ],
                ]);
            }
        } catch (\Throwable $th) {}

        return response()->json([
            'success' => true,
            'ticket_number' => $ticket,
            'room' => $room,
            'message' => $message,
        ], 201);
    }

    /**
     * Public Guest Warga Support: Get messages by ticket.
     */
    public function getGuestSupportMessages($ticket): JsonResponse
    {
        $room = ChatRoom::where('support_ticket_number', $ticket)->firstOrFail();

        $messages = ChatMessage::where('chat_room_id', $room->id)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'room' => $room,
            'data' => $messages,
        ]);
    }

    /**
     * Public Guest Warga Support: Send message by ticket.
     */
    public function sendGuestSupportMessage(Request $request, $ticket): JsonResponse
    {
        $msgContent = $request->input('message_encrypted') ?? $request->input('message');
        if (empty($msgContent)) {
            return response()->json(['success' => false, 'message' => 'Pesan tidak boleh kosong.'], 422);
        }

        $room = ChatRoom::where('support_ticket_number', $ticket)->firstOrFail();

        $message = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_user_id' => null,
            'sender_type' => 'warga_guest',
            'sender_name' => $request->sender_name ?? $room->support_name ?? 'Warga',
            'message_encrypted' => $msgContent,
            'is_read' => false,
        ]);

        $room->update(['last_message_at' => now()]);

        try {
            $officials = User::where('desa_id', $room->desa_id)
                ->whereHas('role', fn($r) => $r->whereIn('slug', ['admin', 'sekdes', 'kades']))
                ->get();
            foreach ($officials as $official) {
                \App\Models\NotifikasiLog::create([
                    'desa_id' => $room->desa_id,
                    'user_id' => $official->id,
                    'jenis_notifikasi' => 'chat_support',
                    'judul' => 'Pesan Bantuan Tiket: ' . $ticket,
                    'pesan' => Str::limit($msgContent, 90),
                    'status_pengiriman' => 'terkirim',
                    'payload_json' => [
                        'chat_room_id' => $room->id,
                        'ticket' => $ticket,
                    ],
                ]);
            }
        } catch (\Throwable $th) {}

        return response()->json([
            'success' => true,
            'data' => $message,
        ], 201);
    }
}
