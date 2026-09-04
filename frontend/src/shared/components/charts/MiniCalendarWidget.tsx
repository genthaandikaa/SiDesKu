import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, HeartPulse, Building2, HandHeart } from 'lucide-react';

interface AgendaItem {
  id: string;
  title: string;
  date: number; // day of month e.g. 24
  time?: string;
  category?: string;
  location?: string;
  color?: 'emerald' | 'amber' | 'sky';
}

interface MiniCalendarWidgetProps {
  initialDate?: Date;
  agendas?: AgendaItem[];
  title?: string;
}

export const MiniCalendarWidget: React.FC<MiniCalendarWidgetProps> = ({
  initialDate = new Date(),
  agendas = [
    {
      id: '1',
      title: 'Layanan Posyandu Balita & Lansia',
      date: 24,
      time: '08.30 WIB',
      category: 'Kesehatan',
      location: 'Poskesdes Doko',
      color: 'emerald',
    },
    {
      id: '2',
      title: 'Penyaluran Bansos PKH Tahap 3',
      date: 26,
      time: '09.00 WIB',
      category: 'Bansos',
      location: 'Balai Desa Doko',
      color: 'amber',
    },
    {
      id: '3',
      title: 'Rapat Koordinasi & Validasi RT/RW',
      date: 28,
      time: '19.30 WIB',
      category: 'Pemerintahan',
      location: 'Ruang Rapat Desa',
      color: 'sky',
    },
  ],
  title = 'Agenda Kegiatan Desa',
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & days in month
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const eventDays = new Set(agendas.map((a) => a.date));

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
      {/* Calendar Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">
              {monthNames[month]} {year}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Day Grid */}
      <div className="pt-1">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 mb-1.5">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>

        {/* Date Numbers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="py-1.5" />
          ))}

          {/* Actual Month Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const hasEvent = eventDays.has(dayNum);
            const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`relative py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs scale-105'
                    : isToday
                    ? 'bg-emerald-100 text-emerald-900 font-black'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{dayNum}</span>
                {hasEvent && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda Items */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
          Agenda Mendatang
        </div>

        {agendas.slice(0, 3).map((a) => {
          const getCategoryIcon = (cat?: string, title?: string) => {
            const str = `${cat || ''} ${title || ''}`.toLowerCase();
            if (str.includes('kesehatan') || str.includes('posyandu')) {
              return <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
            }
            if (str.includes('pemerintahan') || str.includes('rapat') || str.includes('koordinasi')) {
              return <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
            }
            if (str.includes('sosial') || str.includes('bansos') || str.includes('pkh') || str.includes('blt')) {
              return <HandHeart className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
            }
            return <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
          };

          return (
            <div
              key={a.id}
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 truncate pr-2 flex items-center gap-1.5">
                  {getCategoryIcon(a.category, a.title)}
                  <span className="truncate">{a.title}</span>
                </span>
                <span className="text-[9px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md shrink-0">
                  Tgl {a.date}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                {a.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{a.time}</span>
                  </span>
                )}
                {a.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{a.location}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
