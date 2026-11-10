import React, { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Building2, CalendarDays, CheckCircle2, Download, FileText, Megaphone, Phone, Users } from 'lucide-react';
import api from '@/shared/lib/axios';

interface VillageSummary {
  id: number; nama_desa: string; kecamatan: string; kabupaten: string; telepon?: string | null; email?: string | null;
  jumlah_pengguna_aktif: number; jumlah_warga: number; jumlah_surat: number; surat_selesai: number; surat_diproses: number;
  pengaduan_aktif: number; program_bansos_aktif: number;
}
interface RegionalOverview {
  scope: { role: string; nama_wilayah: string; tingkat: string };
  totals: Omit<VillageSummary, 'id' | 'nama_desa' | 'kecamatan' | 'kabupaten'> & { jumlah_desa: number };
  desa: VillageSummary[];
  pengumuman: { id: number; desa: string; judul: string; isi: string; level_target: string; tanggal_mulai: string; tanggal_selesai: string }[];
  agenda: { id: number; desa: string; judul: string; tipe: string; tanggal: string; waktu: string; tempat: string }[];
  program_sosial: { id: number; nama_desa: string; nama_bantuan: string; sumber_dana: string; tahun: number; tahap: string; kuota_penerima: number; tanggal_penyaluran: string }[];
  disposisi_pengaduan: { desa: string; disposisi_ke: string; status: string; jumlah: number }[];
}
interface Props { roleSlug: string; activeSubmenu: string }

const count = (value: number) => new Intl.NumberFormat('id-ID').format(value || 0);
const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : 'Tanggal belum tersedia';
const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const RegionalOverviewDashboard: React.FC<Props> = ({ roleSlug, activeSubmenu }) => {
  const [overview, setOverview] = useState<RegionalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  useEffect(() => {
    let active = true;
    api.get('/regional/overview').then((response) => { if (active) setOverview(response.data?.data || null); })
      .catch((e) => { if (active) setError(e.response?.data?.message || 'Ringkasan wilayah belum dapat dimuat.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const isDistrict = roleSlug === 'kecamatan';
  const title = overview ? `${overview.scope.tingkat} ${overview.scope.nama_wilayah}` : (isDistrict ? 'Dashboard Kecamatan' : 'Executive Dashboard Kabupaten/Kota');
  const totals = overview?.totals;
  const cards = [
    { label: 'Desa dalam cakupan', value: totals?.jumlah_desa, Icon: Building2 },
    { label: 'Warga terdata', value: totals?.jumlah_warga, Icon: Users },
    { label: 'Surat sedang diproses', value: totals?.surat_diproses, Icon: FileText },
    { label: 'Pengaduan aktif', value: totals?.pengaduan_aktif, Icon: AlertCircle },
  ];
  const heading: Record<string, string> = {
    beranda: isDistrict ? 'Dashboard Kecamatan' : 'Executive Dashboard', monitoring_desa: 'Desa dalam Cakupan', monitoring_kecamatan: 'Monitoring Kecamatan',
    struktur_wilayah: 'Struktur Wilayah Kabupaten/Kota', layanan_surat: 'Monitoring Pelayanan Publik', rekomendasi_layanan: 'Rekap Rekomendasi Layanan',
    pengaduan_warga: 'Aspirasi & Pengaduan Wilayah', disposisi_pengaduan: 'Rekap Disposisi Pengaduan', koordinasi_desa: 'Kontak Koordinasi Antar-Desa',
    pengumuman_regional: 'Pengumuman dari Desa dalam Cakupan', agenda_regional: 'Agenda Desa dalam Cakupan', evaluasi_pelayanan: 'Evaluasi Pelayanan Desa',
    program_sosial: 'Program Sosial Terpublikasi', analisis_kinerja: 'Analisis Kinerja Wilayah', laporan_wilayah: 'Laporan Terintegrasi',
  };
  const exportCsv = () => {
    if (!overview) return;
    const rows = [['Desa', 'Kecamatan', 'Kabupaten/Kota', 'Warga', 'Surat', 'Surat diproses', 'Surat selesai', 'Pengaduan aktif', 'Program sosial aktif'],
      ...overview.desa.map((d) => [d.nama_desa, d.kecamatan, d.kabupaten, d.jumlah_warga, d.jumlah_surat, d.surat_diproses, d.surat_selesai, d.pengaduan_aktif, d.program_bansos_aktif])];
    const blob = new Blob([`\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `laporan-${overview.scope.nama_wilayah.toLowerCase().replace(/\s+/g, '-')}.csv`; link.click(); URL.revokeObjectURL(url);
  };
  const showOverview = ['beranda', 'laporan_wilayah', 'analisis_kinerja', 'evaluasi_pelayanan'].includes(activeSubmenu);
  const allVillages = overview?.desa || [];
  const villages = selectedVillage === 'all' ? allVillages : allVillages.filter((v) => String(v.id) === selectedVillage);

  const Section = ({ title, icon: Icon, children }: React.PropsWithChildren<{ title: string; icon: React.ElementType }>) => (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-4 font-extrabold text-slate-900 sm:px-5"><Icon className="h-4 w-4 text-blue-600" />{title}</div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
  const villageRows = (mode: 'service' | 'complaint' | 'all' = 'all') => (
    <div className="divide-y divide-slate-100">
      {villages.map((v) => <div key={v.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="font-bold text-slate-800">{v.nama_desa}</div><div className="text-xs text-slate-500">{v.kecamatan} · {v.kabupaten}</div></div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          {(mode === 'all' || mode === 'service') && <span>{count(v.jumlah_surat)} surat · {count(v.surat_diproses)} diproses · {count(v.surat_selesai)} selesai</span>}
          {(mode === 'all' || mode === 'complaint') && <span>{count(v.pengaduan_aktif)} pengaduan aktif</span>}
          {mode === 'all' && <span>{count(v.jumlah_warga)} warga</span>}
        </div>
      </div>)}
      {!villages.length && <p className="text-sm text-slate-500">Belum ada desa aktif di cakupan wilayah ini.</p>}
    </div>
  );
  const regionalInfo = useMemo(() => {
    if (!overview) return null;
    return <div className="space-y-5">
      {activeSubmenu === 'pengumuman_regional' && <Section title="Pengumuman terpublikasi" icon={Megaphone}><div className="space-y-4">{overview.pengumuman.filter((item) => selectedVillage === 'all' || villages.some((v) => v.nama_desa === item.desa)).map((item) => <article key={item.id} className="border-b border-slate-100 pb-3 last:border-0"><h3 className="font-bold text-slate-800">{item.judul}</h3><p className="mt-1 line-clamp-3 text-sm text-slate-600">{item.isi}</p><p className="mt-2 text-xs text-slate-500">{item.desa} · {date(item.tanggal_mulai)} · Sasaran: {item.level_target}</p></article>)}{!overview.pengumuman.length && <p className="text-sm text-slate-500">Belum ada pengumuman terpublikasi.</p>}</div></Section>}
      {activeSubmenu === 'agenda_regional' && <Section title="Agenda terdaftar" icon={CalendarDays}><div className="space-y-3">{overview.agenda.filter((item) => selectedVillage === 'all' || villages.some((v) => v.nama_desa === item.desa)).map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3"><div className="font-bold text-slate-800">{item.judul}</div><div className="mt-1 text-xs text-slate-600">{item.desa} · {date(item.tanggal)} {item.waktu || ''} · {item.tempat || 'Lokasi belum dicantumkan'}</div></div>)}{!overview.agenda.length && <p className="text-sm text-slate-500">Belum ada agenda terdaftar.</p>}</div></Section>}
      {activeSubmenu === 'koordinasi_desa' && <Section title="Kontak kantor desa" icon={Phone}><div className="divide-y divide-slate-100">{villages.map((v) => <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"><strong className="text-sm text-slate-800">{v.nama_desa}</strong><span className="text-sm text-slate-600">{v.telepon || 'Telepon belum tersedia'}{v.email ? ` · ${v.email}` : ''}</span></div>)}</div></Section>}
      {activeSubmenu === 'program_sosial' && <Section title="Program bantuan yang dipublikasikan desa" icon={Users}><div className="space-y-3">{overview.program_sosial.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3"><div className="font-bold text-slate-800">{item.nama_bantuan}</div><div className="mt-1 text-xs text-slate-600">{item.nama_desa} · {item.tahun} · Tahap {item.tahap || '—'} · Kuota {count(item.kuota_penerima)} · {item.sumber_dana || 'Sumber dana tidak dicantumkan'}</div></div>) }{!overview.program_sosial.length && <p className="text-sm text-slate-500">Belum ada program terpublikasi.</p>}</div></Section>}
      {activeSubmenu === 'disposisi_pengaduan' && <Section title="Rekap distribusi pengaduan" icon={Activity}><div className="divide-y divide-slate-100">{overview.disposisi_pengaduan.filter((item) => selectedVillage === 'all' || villages.some((v) => v.nama_desa === item.desa)).map((item, i) => <div key={`${item.desa}-${item.disposisi_ke}-${item.status}-${i}`} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span className="text-slate-700">{item.desa} · {item.disposisi_ke} · {item.status}</span><strong>{count(item.jumlah)}</strong></div>)}{!overview.disposisi_pengaduan.length && <p className="text-slate-500">Belum ada data disposisi.</p>}</div></Section>}
      {activeSubmenu === 'monitoring_kecamatan' && <Section title="Kecamatan yang tercatat" icon={Building2}><div className="space-y-2">{Array.from(new Set(villages.map((v) => v.kecamatan))).map((name) => <div key={name} className="flex justify-between rounded-xl bg-slate-50 p-3 text-sm"><strong>{name || 'Belum ditentukan'}</strong><span>{villages.filter((v) => v.kecamatan === name).length} desa</span></div>)}</div></Section>}
      {activeSubmenu === 'struktur_wilayah' && <Section title="Susunan wilayah berdasarkan data desa" icon={Building2}><div className="space-y-3">{Array.from(new Set(villages.map((v) => v.kecamatan || 'Belum ditentukan'))).map((name) => <div key={name} className="rounded-xl bg-slate-50 p-3"><strong>{name}</strong><div className="mt-2 flex flex-wrap gap-2">{villages.filter((v) => (v.kecamatan || 'Belum ditentukan') === name).map((v) => <span key={v.id} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">{v.nama_desa}</span>)}</div></div>)}</div><p className="mt-3 text-xs text-slate-500">Peta geografis belum tersedia karena data koordinat wilayah belum tercatat.</p></Section>}
    </div>;
  }, [overview, activeSubmenu, selectedVillage, villages]);

  return <div className="space-y-5 sm:space-y-6">
    {!['beranda', 'laporan_wilayah', 'monitoring_kecamatan'].includes(activeSubmenu) && overview && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"><label htmlFor="regional-village-filter" className="text-sm font-bold text-slate-700">Filter data berdasarkan desa</label><select id="regional-village-filter" value={selectedVillage} onChange={(event) => setSelectedVillage(event.target.value)} className="min-w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><option value="all">Semua desa</option>{allVillages.map((v) => <option key={v.id} value={v.id}>{v.nama_desa}</option>)}</select></div>}
    <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700"><Activity className="h-3.5 w-3.5"/> Pemantauan baca-saja</div><h1 className="text-xl font-black text-slate-900 sm:text-2xl">{heading[activeSubmenu] || title}</h1><p className="mt-1 text-sm text-slate-500">{title} · data agregat dari desa aktif dalam cakupan akun.</p></div>{activeSubmenu === 'laporan_wilayah' && <button onClick={exportCsv} disabled={!overview} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Download className="h-4 w-4"/> Ekspor CSV</button>}</div></section>
    {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    {loading ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="h-28 animate-pulse rounded-2xl border bg-white" />)}</div> : overview && <>
      {showOverview && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, Icon }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Icon className="mb-3 h-5 w-5 text-blue-600"/><div className="text-2xl font-black text-slate-900">{count(value || 0)}</div><div className="mt-1 text-xs font-semibold text-slate-500">{label}</div></article>)}</div>}
      {['beranda', 'monitoring_desa', 'monitoring_kecamatan', 'struktur_wilayah'].includes(activeSubmenu) && <Section title="Desa dalam cakupan" icon={Building2}>{villageRows('all')}</Section>}
      {['beranda', 'layanan_surat', 'analisis_kinerja', 'laporan_wilayah'].includes(activeSubmenu) && <Section title="Layanan surat per desa" icon={CheckCircle2}>{villageRows('service')}</Section>}
      {activeSubmenu === 'rekomendasi_layanan' && <Section title="Desa yang perlu mendapat perhatian" icon={CheckCircle2}><div className="divide-y divide-slate-100">{villages.filter((v) => v.surat_diproses > 0 || v.pengaduan_aktif > 0).sort((a, b) => (b.surat_diproses + b.pengaduan_aktif) - (a.surat_diproses + a.pengaduan_aktif)).map((v) => <div key={v.id} className="py-3 first:pt-0"><strong className="text-sm text-slate-800">{v.nama_desa}</strong><p className="mt-1 text-xs text-slate-600">{v.surat_diproses > 0 ? `${count(v.surat_diproses)} surat masih diproses. ` : ''}{v.pengaduan_aktif > 0 ? `${count(v.pengaduan_aktif)} pengaduan masih aktif.` : ''} Prioritaskan pemantauan tindak lanjut.</p></div>)}{!villages.some((v) => v.surat_diproses > 0 || v.pengaduan_aktif > 0) && <p className="text-sm text-slate-500">Tidak ada antrean layanan atau pengaduan aktif pada filter ini.</p>}</div></Section>}
      {activeSubmenu === 'evaluasi_pelayanan' && <Section title="Indikator penyelesaian layanan" icon={Activity}><div className="grid gap-3 sm:grid-cols-3">{villages.map((v) => { const rate = v.jumlah_surat ? Math.round((v.surat_selesai / v.jumlah_surat) * 100) : 0; return <article key={v.id} className="rounded-xl bg-slate-50 p-4"><div className="font-bold text-slate-800">{v.nama_desa}</div><div className="mt-2 text-2xl font-black text-blue-700">{rate}%</div><p className="text-xs text-slate-500">{count(v.surat_selesai)} dari {count(v.jumlah_surat)} surat selesai</p><p className="mt-2 text-xs text-slate-600">{v.pengaduan_aktif ? `${count(v.pengaduan_aktif)} pengaduan aktif perlu ditinjau.` : 'Tidak ada pengaduan aktif.'}</p></article>})}{!villages.length && <p className="text-sm text-slate-500">Tidak ada data pada filter ini.</p>}</div></Section>}
      {['beranda', 'pengaduan_warga', 'disposisi_pengaduan', 'laporan_wilayah'].includes(activeSubmenu) && activeSubmenu !== 'disposisi_pengaduan' && <Section title="Pengaduan aktif per desa" icon={AlertCircle}>{villageRows('complaint')}</Section>}
      {regionalInfo}
      {['laporan_wilayah', 'evaluasi_pelayanan', 'analisis_kinerja'].includes(activeSubmenu) && <p className="flex items-center gap-2 text-xs text-slate-500"><Megaphone className="h-4 w-4"/>Rekap ini tidak menampilkan identitas atau rincian pribadi warga.</p>}
    </>}
  </div>;
};
