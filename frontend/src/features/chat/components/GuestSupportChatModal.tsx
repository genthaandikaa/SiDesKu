import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  X,
  Send,
  Lock,
  ShieldCheck,
  User,
  Phone,
  CreditCard,
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

interface GuestMessage {
  id: number;
  sender_type: 'user' | 'warga_guest';
  sender_name: string;
  message_encrypted: string;
  created_at: string;
}

interface GuestSupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuestSupportChatModal: React.FC<GuestSupportChatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<'form' | 'chat'>('form');
  const [nik, setNik] = useState<string>('');
  const [nama, setNama] = useState<string>('');
  const [noHp, setNoHp] = useState<string>('');
  const [initialKeluhan, setInitialKeluhan] = useState<string>('');
  const [ticketNumber, setTicketNumber] = useState<string>('');
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [replyInput, setReplyInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for replies when in chat step
  useEffect(() => {
    let interval: any;
    if (step === 'chat' && ticketNumber && isOpen) {
      const fetchReplies = async () => {
        try {
          const res = await axios.get(`/api/chat/support/${ticketNumber}/messages`);
          if (res.data.success) {
            setMessages(res.data.data);
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } catch (err) {
          console.error('Error fetching support replies:', err);
        }
      };
      fetchReplies();
      interval = setInterval(fetchReplies, 4000);
    }
    return () => clearInterval(interval);
  }, [step, ticketNumber, isOpen]);

  if (!isOpen) return null;

  const handleStartSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || nik.length !== 16) {
      setErrorMsg('NIK harus berjumlah 16 digit angka.');
      return;
    }
    if (!nama.trim() || !initialKeluhan.trim()) {
      setErrorMsg('Nama dan rincian kendala wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await axios.post('/api/chat/support/initiate', {
        nik,
        nama,
        no_hp: noHp,
        initial_message: initialKeluhan,
      });

      if (res.data.success) {
        setTicketNumber(res.data.ticket_number);
        setMessages([res.data.message]);
        setStep('chat');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal memulai sesi bantuan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !ticketNumber) return;

    const text = replyInput.trim();
    setReplyInput('');

    try {
      const res = await axios.post(`/api/chat/support/${ticketNumber}/messages`, {
        message_encrypted: text,
        sender_name: nama,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim balasan. Silakan periksa koneksi.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight">Pusat Bantuan Desa</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saluran resmi bantuan akun & pelayanan warga</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Step */}
        {step === 'form' ? (
          <form onSubmit={handleStartSupport} className="p-5 space-y-4 overflow-y-auto">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Lupa Akun atau Butuh Bantuan?</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Masukkan NIK untuk verifikasi. Pesan Anda langsung terhubung ke administrator balai desa.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="16 digit NIK sesuai KTP"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp yang Dapat Dihubungi
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rincian Kendala / Permohonan Bantuan <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Contoh: Saya lupa kata sandi akun saya, atau ingin konfirmasi jadwal bantuan sosial..."
                value={initialKeluhan}
                onChange={(e) => setInitialKeluhan(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                {loading ? 'Menghubungkan...' : 'Mulai Obrolan Bantuan'}
              </button>
            </div>
          </form>
        ) : (
          /* Chat Step */
          <div className="flex-1 flex flex-col min-h-[380px] bg-slate-50/60">
            {/* Ticket Info */}
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-700">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tiket Bantuan:</span>
                <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{ticketNumber}</strong>
              </span>
              <span className="text-[10px] text-slate-400">
                Simpan nomor tiket ini
              </span>
            </div>

            {errorMsg && (
              <div className="mx-4 mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => {
                const isGuest = m.sender_type === 'warga_guest';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                      {isGuest ? `${m.sender_name} (Anda)` : 'Petugas Balai Desa'}
                    </span>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs break-words shadow-xs ${
                        isGuest
                          ? 'bg-emerald-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{m.message_encrypted}</p>
                      <span
                        className={`text-[9px] block text-right mt-1 ${
                          isGuest ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <form
              onSubmit={handleSendReply}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Tulis balasan untuk petugas..."
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!replyInput.trim()}
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

