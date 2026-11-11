import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Search,
  CheckCircle2,
  FileText,
  Upload,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Building2,
  SlidersHorizontal,
  ExternalLink,
  Award,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { LokerItem } from '../types';
import { smartCityApi } from '../api/smartCityApi';
import {
  getStoredLokerList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance,
  formatGajiJt
} from '../smartCityStorage';

export const LokerPage: React.FC = () => {
  const navigate = useNavigate();
  const [lokerList, setLokerList] = useState<LokerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [quickFilter, setQuickFilter] = useState<'all' | 'tetap' | 'jasa' | 'umk'>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    smartCityApi.getLokerList()
      .then((data) => {
        if (isMounted) {
          setLokerList(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLokerList(getStoredLokerList());
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter logic
  const filteredList = useMemo(() => {
    return lokerList.filter((item) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = item.posisi.toLowerCase().includes(q);
        const matchComp = item.perusahaan.toLowerCase().includes(q);
        const matchCat = item.kategori.toLowerCase().includes(q);
        const matchLoc = item.lokasi.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        const matchDesc = item.ringkasan?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchComp && !matchCat && !matchLoc && !matchTags && !matchDesc) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'Semua') {
        if (!item.kategori.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 3. Location
      if (selectedLocation !== 'Semua') {
        if (!item.lokasi.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 4. Job Type
      if (selectedType !== 'Semua') {
        if (!item.tipeKerja.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }
      }

      // 5. Quick Filter Pills
      if (quickFilter === 'tetap') {
        if (!item.tipeKerja.toLowerCase().includes('penuh waktu') && !item.tipeKerja.toLowerCase().includes('full-time')) {
          return false;
        }
      } else if (quickFilter === 'jasa') {
        if (!item.isJasaMitra && !item.tipeKerja.toLowerCase().includes('jasa') && !item.tipeKerja.toLowerCase().includes('freelance')) {
          return false;
        }
      } else if (quickFilter === 'umk') {
        if (item.gajiMin < 3000000) {
          return false;
        }
      }

      return true;
    });
  }, [lokerList, searchQuery, selectedCategory, selectedLocation, selectedType, quickFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedLocation('Semua');
    setSelectedType('Semua');
    setQuickFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="w-full pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Peluang Kerja & Jasa Keahlian Warga
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Temukan lowongan formal dan kemitraan jasa mandiri terverifikasi di wilayah kota dengan standar gaji transparan, penempatan terdekat, serta jaminan bebas biaya perantara.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/smart-city/loker/profil"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/70 text-blue-700 text-sm font-semibold transition-all shadow-xs"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload CV & Profil</span>
            </Link>
            <Link
              to="/dashboard/smart-city?tab=loker"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-xs hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Pasang Lowongan / Jasa</span>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar (Matching Stitch Screen 2 Filter Controls) */}
        <div className="mt-6 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari posisi, keahlian, atau nama perusahaan..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Dropdown Kategori */}
            <div className="lg:col-span-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Administrasi">Administrasi & Kantor</option>
                <option value="Teknik">Teknik & Bengkel</option>
                <option value="F&B">F&B / Kuliner</option>
                <option value="Perdagangan">Logistik & Retail</option>
                <option value="IT">IT & Digital</option>
              </select>
            </div>

            {/* Dropdown Lokasi */}
            <div className="lg:col-span-2">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Semua">Seluruh Kota</option>
                <option value="Kecamatan Pusat">Kecamatan Pusat</option>
                <option value="Sukamaju">Kecamatan Sukamaju</option>
                <option value="Kaliurang">Jl. Kaliurang</option>
                <option value="Kawasan Industri">Kawasan Industri Timur</option>
              </select>
            </div>

            {/* Dropdown Tipe Kerja */}
            <div className="lg:col-span-2">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Semua">Semua Tipe Kerja</option>
                <option value="Penuh Waktu">Penuh Waktu</option>
                <option value="Jasa Mandiri">Jasa Mandiri / Freelance</option>
                <option value="Shift">Shift Fleksibel</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="lg:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors"
                title="Reset Filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="lg:hidden">Reset</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Pills (Matching Stitch Screen 2) */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => {
                setQuickFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                quickFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Semua Lowongan (128)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('tetap');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                quickFilter === 'tetap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Pekerjaan Tetap
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('jasa');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                quickFilter === 'jasa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Jasa Mandiri / Teknisi
            </button>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('umk');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                quickFilter === 'umk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              Gaji 3jt+
            </button>
          </div>
        </div>

        {/* Job Cards List (Matching Stitch Screen 2 High Fidelity Layout) */}
        <div className="mt-6 space-y-4">
          {paginatedList.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mb-3">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tidak ada lowongan yang sesuai kriteria</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau reset filter untuk melihat lowongan lain yang tersedia.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-100 transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            paginatedList.map((job) => {
              const isJasa = job.isJasaMitra || job.tipeKerja.includes('Freelance');
              return (
                <div
                  key={job.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Column: Job Info */}
                    <div className="flex-1 space-y-2.5">
                      {/* Tags Bar */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Job Type Pill */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                          {job.tipeKerja}
                        </span>

                        {/* Distance / Location */}
                        <span className="inline-flex items-center text-slate-500 font-medium">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {job.lokasi} • {job.distanceText || 'Dekat Anda'}
                        </span>
                      </div>

                      {/* Title & Company */}
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          <Link to={`/smart-city/loker/${job.id}`}>
                            {job.posisi}
                          </Link>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{job.perusahaan}</span>
                          {job.mitraStatus && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{job.mitraStatus}</span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Summary Description */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl line-clamp-2">
                        {job.ringkasan || job.deskripsi[0]}
                      </p>

                      {/* Skill Tags */}
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {job.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Required Documents Tags */}
                      {job.syaratDokumen && job.syaratDokumen.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Syarat Berkas:</span>
                          {job.syaratDokumen.slice(0, 3).map((dok, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-sky-50 text-blue-700 text-[10px] font-bold border border-sky-200"
                            >
                              {dok}
                            </span>
                          ))}
                          {job.syaratDokumen.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-bold">
                              +{job.syaratDokumen.length - 3} berkas
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Salary Block & Actions */}
                    <div className="lg:w-72 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 flex flex-col justify-center items-start lg:items-end">
                      <div className="lg:text-right">
                        <div className="text-lg sm:text-xl font-extrabold text-blue-600">
                          {formatGajiJt(job.gajiMin, job.gajiMax)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 w-full flex items-center justify-start lg:justify-end gap-2.5">
                        <Link
                          to={`/smart-city/loker/${job.id}`}
                          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors text-center"
                        >
                          Lihat Detail
                        </Link>
                        <Link
                          to={`/smart-city/loker/${job.id}/lamar`}
                          className="flex-1 lg:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md text-center"
                        >
                          {isJasa ? 'Daftar Mitra' : 'Lamar Sekarang'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Section (Matching Stitch Screen 2) */}
        {filteredList.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {Math.min((currentPage - 1) * itemsPerPage + 1, filteredList.length)} – {Math.min(currentPage * itemsPerPage, filteredList.length)} dari total {filteredList.length} lowongan terverifikasi
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};