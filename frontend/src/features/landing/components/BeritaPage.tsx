import React, { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Eye, 
  Tag, 
  ChevronRight, 
  Sparkles, 
  Building2, 
  BellRing,
  X
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Berita, Pengumuman } from '@/shared/types';

export const BeritaPage: React.FC = () => {
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [pengumumans, setPengumumans] = useState<Pengumuman[]>([]);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);

  const categories = ['Semua', 'Pemerintahan', 'Pembangunan', 'Kesehatan', 'UMKM', 'Sosial'];

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const [beritaRes, pengumumanRes] = await Promise.all([
          api.get('/public/beritas'),
          api.get('/public/pengumumans'),
        ]);

        if (beritaRes.data.success) setBeritas(beritaRes.data.data);
        if (pengumumanRes.data.success) setPengumumans(pengumumanRes.data.data);
      } catch {
        // Fallback
      }
    };
    fetchBerita();
  }, []);

  const filteredBeritas = beritas.filter((b) => {
    const matchCat = selectedKategori === 'Semua' || b.kategori?.toLowerCase() === selectedKategori.toLowerCase();
    const matchSearch = b.judul.toLowerCase().includes(searchQuery.toLowerCase()) || (b.ringkasan || b.konten).toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-14 py-8 page-enter">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0b3323] via-[#0f442f] to-[#072418] text-white shadow-xl relative overflow-hidden border border-emerald-800/80">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-extrabold border border-emerald-600/60 shadow-xs">
              <Newspaper className="w-4 h-4 text-emerald-300" />
              <span>Media Publikasi & Informasi Warta</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Warta & Informasi Terkini
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              Kanal berita resmi, agenda pembangunan desa, serta pengumuman penting bagi seluruh masyarakat di Kabupaten Kediri.
            </p>
          </div>
        </div>
      </section>

      {/* Pengumuman Khusus */}
      {pengumumans.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-surface p-6 bg-emerald-50/60 border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm uppercase tracking-wider">
              <BellRing className="w-4 h-4" /> Pengumuman Resmi Pemerintah Desa
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pengumumans.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {p.level_target || 'Seluruh Warga'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {new Date(p.tanggal_mulai).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{p.judul}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.isi}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search & Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = cat === 'Semua' ? beritas.length : beritas.filter(b => b.kategori?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedKategori(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedKategori === cat
                      ? 'bg-emerald-700 text-white shadow-xs scale-102'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedKategori === cat ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari judul atau topik berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-2xs"
            />
          </div>
        </div>
      </section>

      {/* Featured Headline Article (If on 'Semua' and not searching) */}
      {selectedKategori === 'Semua' && !searchQuery && filteredBeritas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-lg hover:border-emerald-300 transition-all grid grid-cols-1 lg:grid-cols-12 gap-0 group">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full overflow-hidden bg-slate-900">
              <img
                src="/images/event.jpg"
                alt={filteredBeritas[0].judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                ⭐ Berita Utama Terkini
              </div>
            </div>

            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {filteredBeritas[0].kategori}
                  </span>
                  <span>•</span>
                  <span>{new Date(filteredBeritas[0].published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                  {filteredBeritas[0].judul}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                  {filteredBeritas[0].ringkasan || filteredBeritas[0].konten}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedBerita(filteredBeritas[0])}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs press-down flex items-center gap-2 cursor-pointer"
                >
                  <span>Baca Artikel Utama</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Berita Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredBeritas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBeritas.map((b, idx) => {
              const thumb = idx % 3 === 0 ? '/images/event.jpg' : idx % 3 === 1 ? '/images/kursus.jpg' : '/images/landing/about_img.webp';
              return (
                <div key={b.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover-lift group">
                  <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                    <img
                      src={thumb}
                      alt={b.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-black text-emerald-950 bg-white/95 px-2.5 py-1 rounded-full shadow-2xs">
                      {b.kategori}
                    </span>
                  </div>

                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {new Date(b.published_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {b.view_count || 120} views
                      </span>
                    </div>

                    <h3 className="font-black text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {b.judul}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {b.ringkasan || b.konten}
                    </p>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      onClick={() => setSelectedBerita(b)}
                      className="w-full py-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 text-xs font-black transition-colors flex items-center justify-center gap-1 border border-slate-200/80 cursor-pointer shadow-2xs"
                    >
                      Baca Berita Lengkap <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-2">
            <Newspaper className="w-8 h-8 mx-auto text-slate-300" />
            <div>Tidak ada berita yang sesuai dengan pencarian atau filter kategori.</div>
          </div>
        )}
      </section>

      {/* Modal Baca Artikel Lengkap */}
      {selectedBerita && (
        <div className="modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {selectedBerita.kategori}
              </span>
              <button 
                onClick={() => setSelectedBerita(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {selectedBerita.judul}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-100 pb-3">
                <span>📅 {new Date(selectedBerita.published_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                <span>👁 {selectedBerita.view_count || 120} pembaca</span>
                <span>✍ Humas Pemdes Doko</span>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden bg-slate-100">
                <img 
                  src="/images/event.jpg" 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {selectedBerita.konten}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBerita(null)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
              >
                Tutup Berita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
