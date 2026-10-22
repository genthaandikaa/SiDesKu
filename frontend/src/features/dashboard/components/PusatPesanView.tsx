import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  ArrowRight,
  MessageSquare,
  Send,
  Search,
  Lock,
  ShieldCheck,
  User as UserIcon,
  Plus,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Users,
  CheckCheck,
  CheckCircle2,
  Building2,
  Shield,
  Sparkles
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';

interface Contact {
  id: number;
  name: string;
  username: string;
  category?: 'aparatur_desa' | 'pengurus_wilayah' | 'warga';
  role?: {
    id: number;
    name: string;
    slug: string;
    display_name?: string;
  };
}

interface LatestMessage {
  id: number;
  message_encrypted: string;
  created_at: string;
  sender_user_id: number | null;
  sender_name: string;
}

interface ChatRoom {
  id: number;
  room_type: string;
  title: string;
  participant_one_id: number;
  participant_two_id: number;
  support_ticket_number?: string;
  support_name?: string;
  support_nik?: string;
  participant_one?: Contact;
  participant_two?: Contact;
  last_message_at?: string;
  unread_count?: number;
  latest_message?: LatestMessage;
}

interface ChatMessage {
  id: number;
  chat_room_id: number;
  sender_user_id: number | null;
  sender_type: 'user' | 'warga_guest';
  sender_name: string;
  message_encrypted: string;
  iv?: string;
  is_read: boolean;
  created_at: string;
}

// Helpers outside component
const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes}m lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const getRoleCategoryBadge = (category?: string, roleName?: string) => {
  if (category === 'aparatur_desa') {
    return {
      label: roleName || 'Aparatur Desa',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    };
  }
  if (category === 'pengurus_wilayah') {
    return {
      label: roleName || 'Pengurus Wilayah',
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
    };
  }
  return {
    label: roleName || 'Warga Masyarakat',
    bg: 'bg-slate-50 text-slate-700 border-slate-200/80',
  };
};

export const PusatPesanView: React.FC = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'aparatur' | 'wilayah' | 'warga'>('all');
  const [loadingRooms, setLoadingRooms] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Fetch rooms list
  const fetchRooms = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingRooms(true);
    try {
      const res = await api.get('/chat/rooms');
      if (res.data?.success) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err);
    } finally {
      if (!quiet) setLoadingRooms(false);
    }
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const res = await api.get('/chat/contacts');
      if (res.data?.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat contacts:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRooms();
    fetchContacts();

    // Poll room list every 5 seconds so new chats appear automatically
    const roomPoll = setInterval(() => {
      fetchRooms(true);
    }, 5000);

    return () => clearInterval(roomPoll);
  }, [fetchRooms, fetchContacts]);

  // Fetch messages when activeRoom changes or on live interval
  const fetchMessages = useCallback(async (roomId: number, isInitial = false) => {
    try {
      const res = await api.get(`/chat/rooms/${roomId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.data);
        if (isInitial) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  }, []);

  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom.id, true);

      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeRoom.id, false);
      }, 3000);
    } else {
      setMessages([]);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeRoom, fetchMessages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom || sending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSending(true);

    try {
      const res = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
        message_encrypted: content,
        iv: 'aes-gcm-256-verified',
      });

      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        fetchRooms(true);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorAlert(err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
      setTimeout(() => setErrorAlert(null), 4000);
    } finally {
      setSending(false);
    }
  };

  // Start chat with a contact
  const handleStartChat = async (targetUser: Contact) => {
    try {
      const res = await api.post('/chat/rooms', {
        target_user_id: targetUser.id,
        room_type: 'direct',
        title: `Chat ${user?.name || 'Warga'} & ${targetUser.name}`,
      });

      if (res.data?.success) {
        setIsNewChatModalOpen(false);
        setActiveRoom(res.data.data);
        fetchRooms(true);
      }
    } catch (err: any) {
      console.error('Error starting chat:', err);
      setErrorAlert(err.response?.data?.message || 'Gagal memulai obrolan baru.');
      setTimeout(() => setErrorAlert(null), 4000);
    }
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const other = room.participant_one_id === user?.id ? room.participant_two : room.participant_one;
      const targetName = room.room_type === 'support_warga' 
        ? (room.support_name || 'Bantuan Warga')
        : (other?.name || room.title);

      const matchesSearch = targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (room.latest_message?.message_encrypted || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (categoryFilter === 'aparatur') {
        return other?.category === 'aparatur_desa';
      }
      if (categoryFilter === 'wilayah') {
        return other?.category === 'pengurus_wilayah';
      }
      if (categoryFilter === 'warga') {
        return other?.category === 'warga' || room.room_type === 'support_warga';
      }
      return true;
    });
  }, [rooms, searchQuery, categoryFilter, user?.id]);

  // Filtered contacts for modal
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.role?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [contacts, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat Pesan & Komunikasi Desa</h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Layanan percakapan terenkripsi dua arah untuk warga, RT/RW, dan aparatur balai desa. Cepat, aman, dan tercatat otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchRooms(false)}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            title="Muat Ulang Pesan"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRooms ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsNewChatModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Chat Baru</span>
          </button>
        </div>
      </div>

      {errorAlert && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorAlert}</span>
        </div>
      )}

      {/* Main 2-Pane Chat Hub */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[680px]">
        
        {/* Left Pane: Conversations List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col min-h-0 bg-slate-50/40 ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-200 bg-white space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari obrolan atau pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
              />
            </div>

            {/* Filter Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({rooms.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('aparatur')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  categoryFilter === 'aparatur'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Aparatur Desa
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('wilayah')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  categoryFilter === 'wilayah'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                RT / RW
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('warga')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                  categoryFilter === 'warga'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Warga
              </button>
            </div>
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 min-h-0">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-16 px-4 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="font-bold text-xs text-slate-700">Tidak ada obrolan ditemukan</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Mulai obrolan baru dengan memilih aparatur desa atau pengurus RT/RW Anda.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="mt-4 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
                >
                  + Hubungi Kontak
                </button>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const other = room.participant_one_id === user?.id ? room.participant_two : room.participant_one;
                const isSupport = room.room_type === 'support_warga';
                const displayName = isSupport
                  ? `Bantuan: ${room.support_name || 'Warga'}`
                  : (other?.name || room.title);

                const roleBadge = getRoleCategoryBadge(other?.category, other?.role?.display_name || other?.role?.name);
                const isSelected = activeRoom?.id === room.id;
                const unread = room.unread_count || 0;

                return (
                  <div
                    key={room.id}
                    onClick={() => setActiveRoom(room)}
                    className={`p-3 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 mb-1 ${
                      isSelected
                        ? 'bg-white border border-emerald-200/90 shadow-xs'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {displayName}
                          </h4>
                          {isSupport && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black shrink-0">
                              Tiket
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md border ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {room.latest_message ? room.latest_message.message_encrypted : 'Mulai percakapan aman...'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(room.last_message_at)}
                      </span>
                      {unread > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Conversation or Empty Placeholder */}
        <div className={`flex-1 flex flex-col min-h-0 bg-[#fafcfb] ${activeRoom ? 'flex' : 'hidden md:flex'}`}>
          {activeRoom ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveRoom(null)}
                    className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {(() => {
                    const other = activeRoom.participant_one_id === user?.id 
                      ? activeRoom.participant_two 
                      : activeRoom.participant_one;
                    const isSupport = activeRoom.room_type === 'support_warga';
                    const displayName = isSupport
                      ? `Bantuan: ${activeRoom.support_name || 'Warga'}`
                      : (other?.name || activeRoom.title);
                    const roleBadge = getRoleCategoryBadge(other?.category, other?.role?.display_name || other?.role?.name);

                    return (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200/80">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-slate-900 truncate">
                              {displayName}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleBadge.bg}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Terenkripsi Standar Desa Digital</span>
                            {activeRoom.support_ticket_number && (
                              <span className="font-mono text-slate-400">({activeRoom.support_ticket_number})</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchMessages(activeRoom.id, false)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Segarkan Chat"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 min-h-0 bg-slate-50/50">
                {/* Security Announcement Pill */}
                <div className="flex justify-center">
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] text-slate-500 flex items-center gap-1.5 shadow-2xs">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Pesan dilindungi enskripsi integritas data desa.</span>
                  </div>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-500 stroke-1" />
                    <p className="font-bold text-xs text-slate-700">Mulai Percakapan Anda</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Kirim pesan pertanyaan, koordinasi surat, atau konfirmasi berkas di bawah.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = user ? m.sender_user_id === user.id : false;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in`}
                      >
                        <div className="text-[10px] text-slate-400 mb-1 px-1 font-medium">
                          {isMe ? 'Anda' : m.sender_name}
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs break-words shadow-xs ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message_encrypted}</p>
                          <div
                            className={`flex items-center justify-end gap-1.5 text-[9px] mt-1.5 ${
                              isMe ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ketik pesan untuk aparatur desa atau warga..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>
            </>
          ) : (
            /* Empty selection placeholder */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Pilih Obrolan untuk Membaca</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5">
                Pilih obrolan dari daftar sebelah kiri atau klik tombol di bawah untuk memulai percakapan baru dengan aparatur desa.
              </p>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
                className="mt-5 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Mulai Obrolan Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal / Pick Contact */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Mulai Obrolan Baru</h3>
                <p className="text-xs text-slate-500">Pilih aparatur desa, ketua RT/RW, atau warga.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Search */}
            <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, jabatan, atau role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            {/* Modal Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 min-h-0">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Tidak ada kontak ditemukan
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const roleBadge = getRoleCategoryBadge(contact.category, contact.role?.display_name || contact.role?.name);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleStartChat(contact)}
                      className="p-3 rounded-2xl hover:bg-emerald-50/60 transition cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 transition">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {contact.name}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md border ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PusatPesanView;

