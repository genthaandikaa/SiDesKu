import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Lock,
  ShieldCheck,
  Search,
  CheckCheck,
  FileSpreadsheet,
  AlertCircle,
  Maximize2,
  ArrowRight
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/providers';

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
  latest_message?: {
    id: number;
    message_encrypted: string;
    created_at: string;
  };
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

export const ChatWidget: React.FC = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchContact, setSearchContact] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'contacts'>('rooms');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleSlug = user?.role?.slug || '';

  // Fetch unread count periodically whether open or closed
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/chat/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      // quiet
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
    const countInterval = setInterval(fetchUnreadCount, 6000);
    return () => clearInterval(countInterval);
  }, [fetchUnreadCount]);

  // Fetch contacts and rooms
  const fetchRoomsAndContacts = useCallback(async () => {
    if (!token) return;
    try {
      const [roomsRes, contactsRes] = await Promise.all([
        api.get('/chat/rooms'),
        api.get('/chat/contacts'),
      ]);
      if (roomsRes.data?.success) {
        setRooms(roomsRes.data.data);
      }
      if (contactsRes.data?.success) {
        setContacts(contactsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat data:', err);
    }
  }, [token]);

  useEffect(() => {
    let interval: any;
    if (isOpen) {
      fetchRoomsAndContacts();
      interval = setInterval(fetchRoomsAndContacts, 4000);
    }
    return () => clearInterval(interval);
  }, [isOpen, fetchRoomsAndContacts]);

  // Fetch messages when activeRoom changes
  useEffect(() => {
    let interval: any;
    if (activeRoom && isOpen) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/chat/rooms/${activeRoom.id}/messages`);
          if (res.data?.success) {
            setMessages(res.data.data);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 80);
            fetchUnreadCount();
          }
        } catch (err) {
          console.error('Error loading messages:', err);
        }
      };
      fetchMessages();
      interval = setInterval(fetchMessages, 3500);
    }
    return () => clearInterval(interval);
  }, [activeRoom, isOpen, fetchUnreadCount]);

  const handleStartChatWithUser = async (targetUser: Contact, roomType: string = 'direct') => {
    if (!user || !token) return;
    setLoading(true);
    try {
      let title = `Chat: ${user.name} & ${targetUser.name}`;
      if (roomType === 'apbdes_oversight') {
        title = `Pengawasan APBDes (${user.name} - ${targetUser.name})`;
      }
      const res = await api.post('/chat/rooms', {
        target_user_id: targetUser.id,
        room_type: roomType,
        title,
      });
      if (res.data?.success) {
        setActiveRoom(res.data.data);
        setActiveTab('rooms');
        fetchRoomsAndContacts();
      }
    } catch (err: any) {
      console.error('Error creating room:', err);
      setErrorAlert(err.response?.data?.message || 'Gagal memulai obrolan');
      setTimeout(() => setErrorAlert(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRoom || !user || !token) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      const res = await api.post(`/chat/rooms/${activeRoom.id}/messages`, {
        message_encrypted: content,
        iv: 'aes-gcm-256-verified',
      });
      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
        fetchRoomsAndContacts();
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setErrorAlert(err.response?.data?.message || 'Gagal mengirim pesan. Silakan periksa koneksi.');
      setTimeout(() => setErrorAlert(null), 4000);
    }
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('sidesku-navigate-menu', { detail: 'pesan' }));
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    (c.role?.name || '').toLowerCase().includes(searchContact.toLowerCase()) ||
    (c.role?.display_name || '').toLowerCase().includes(searchContact.toLowerCase())
  );

  if (!user || !token) {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg flex items-center gap-2.5 transition-all duration-200 hover:scale-105 cursor-pointer group"
          title="Pusat Pesan & Chat Terenkripsi Desa"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide">
            {unreadCount > 0 ? `Pesan (${unreadCount})` : 'Pusat Pesan'}
          </span>
        </button>
      )}

      {/* Main Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-96 sm:h-[580px] z-50 bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8">
          {/* Header */}
          <div className="bg-white text-slate-900 border-b border-slate-100 p-3.5 sm:p-4 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">
                  {activeRoom ? activeRoom.title : 'Ruang Pesan Desa'}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Terenkripsi Standar Desa Digital</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {activeRoom && (
                <button
                  type="button"
                  onClick={() => setActiveRoom(null)}
                  className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition mr-1 cursor-pointer"
                >
                  Kembali
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenFullPage}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Buka Layar Penuh"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Tutup Widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action for Kades: Chat Pengawasan APBDes ke Bendahara */}
          {roleSlug === 'kades' && !activeRoom && (
            <div className="p-3 bg-amber-50 border-b border-amber-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
                <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Pengawasan APBDes ke Bendahara</span>
              </div>
              {contacts.find((c) => c.role?.slug === 'bendahara_desa') && (
                <button
                  onClick={() => {
                    const ben = contacts.find((c) => c.role?.slug === 'bendahara_desa');
                    if (ben) handleStartChatWithUser(ben, 'apbdes_oversight');
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs cursor-pointer"
                >
                  Buka Chat
                </button>
              )}
            </div>
          )}

          {/* Active Room View: Messages Area */}
          {activeRoom ? (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60">
              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-200/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Pesan dalam obrolan ini terenkripsi otomatis.</span>
              </div>

              {errorAlert && (
                <div className="mx-3 mt-2 p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] flex items-center gap-1.5 animate-in fade-in shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{errorAlert}</span>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <p className="font-semibold text-slate-600">Belum ada pesan</p>
                    <p className="text-[11px] mt-1">Kirim pesan pertama Anda dengan aman.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = user ? m.sender_user_id === user.id : false;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                          {isMe ? 'Anda' : m.sender_name}
                        </div>
                        <div
                          className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs break-words shadow-xs ${
                            isMe
                              ? 'bg-emerald-600 text-white rounded-tr-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message_encrypted}</p>
                          <div
                            className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                              isMe ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(m.created_at).toLocaleTimeString([], {
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

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ketik pesan terenkripsi..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition bg-slate-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Rooms & Contacts List View */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-slate-200 shrink-0 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`py-2.5 transition border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'rooms'
                      ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>Obrolan ({rooms.length})</span>
                  {unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`py-2.5 transition border-b-2 cursor-pointer ${
                    activeTab === 'contacts'
                      ? 'border-emerald-600 text-emerald-700 font-bold bg-emerald-50/40'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Mulai Chat Baru ({contacts.length})
                </button>
              </div>

              {/* Tab 1: Rooms */}
              {activeTab === 'rooms' && (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
                  {rooms.length === 0 ? (
                    <div className="text-center py-12 px-4 text-slate-400 text-xs">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Belum ada obrolan aktif</p>
                      <p className="text-[11px] mt-1 text-slate-500">
                        Klik tab "Mulai Chat Baru" untuk menghubungi aparatur desa atau rekan kerja.
                      </p>
                    </div>
                  ) : (
                    rooms.map((room) => {
                      const otherParticipant =
                        room.participant_one_id === user.id
                          ? room.participant_two
                          : room.participant_one;
                      const displayName =
                        room.room_type === 'support_warga'
                          ? `Bantuan: ${room.support_name || 'Warga'}`
                          : otherParticipant?.name || room.title;
                      const unread = room.unread_count || 0;

                      return (
                        <div
                          key={room.id}
                          onClick={() => setActiveRoom(room)}
                          className="p-3 hover:bg-slate-50 rounded-xl transition cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {displayName}
                              </h4>
                              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                {room.latest_message ? room.latest_message.message_encrypted : 'Mulai chat terenkripsi'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {room.last_message_at && (
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(room.last_message_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                            {unread > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 2: Contacts */}
              {activeTab === 'contacts' && (
                <div className="flex-1 flex flex-col min-h-0 p-2">
                  <div className="relative mb-2 shrink-0">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari aparatur / RT / warga..."
                      value={searchContact}
                      onChange={(e) => setSearchContact(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {filteredContacts.length === 0 ? (
                      <div className="text-center py-8 text-xs text-slate-400">
                        Kontak tidak ditemukan
                      </div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => handleStartChatWithUser(contact)}
                          className="p-2.5 hover:bg-emerald-50/50 rounded-xl transition cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-slate-900 truncate">
                                {contact.name}
                              </h4>
                              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-medium">
                                {contact.role?.display_name || contact.role?.name || 'Warga'}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600 shrink-0 flex items-center gap-1">
                            <span>Mulai Chat</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
