'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  Plus,
  Copy,
  Check,
  Search,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ShieldCheck,
  Eye,
  X,
  ExternalLink,
  FileUp,
  FileText,
  Upload,
} from 'lucide-react';
import { QrisTumbalItem, QrisTumbalStatus } from '@/types';
import QrisTumbalEditModal from './QrisTumbalEditModal';

// Helper parser untuk mengekstrak SEMUA string Raw QRIS dari isi file/teks massal berapapun jumlahnya
function parseBulkQrisText(text: string): string[] {
  if (!text || !text.trim()) return [];

  const results: string[] = [];
  let pos = 0;

  while ((pos = text.indexOf('000201', pos)) !== -1) {
    // Ambil teks dari posisi '000201' sampai akhir baris
    let endPos = text.indexOf('\n', pos);
    if (endPos === -1) endPos = text.length;

    let candidate = text.substring(pos, endPos).replace(/\r$/, '').trim();

    // Jika candidate terpotong atau ada delimiter keyword lain, bersihkan
    const boundaryMatch = candidate.match(/^(000201[A-Za-z0-9\.\_\-\+\=\%\:\/\s]+?)(?=\s*(?:Item\s+\d+|Type\s*=|Data\s*=|RAW Data\s*=|$))/i);
    if (boundaryMatch && boundaryMatch[1]) {
      candidate = boundaryMatch[1].trim();
    }

    if (candidate.length >= 25) {
      results.push(candidate);
    }

    pos += 6; // Lanjut cari '000201' berikutnya di seluruh isi file
  }

  // Deduplikasi string unik (menjaga semua QRIS unik tetap ada)
  return Array.from(new Set(results));
}



export default function QrisTumbalView() {
  const [items, setItems] = useState<QrisTumbalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Form input state
  const [inputMode, setInputMode] = useState<'single' | 'bulk'>('single');
  const [rawQris, setRawQris] = useState<string>('');
  const [bulkText, setBulkText] = useState<string>('');
  const [namaQris, setNamaQris] = useState<string>('');
  const [provider, setProvider] = useState<string>('ShopeePay');
  const [catatan, setCatatan] = useState<string>('');
  const [status, setStatus] = useState<QrisTumbalStatus>('aktif');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [bulkSubmitting, setBulkSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');


  // Editing & Preview QR State
  const [editingItem, setEditingItem] = useState<QrisTumbalItem | null>(null);
  const [previewQrItem, setPreviewQrItem] = useState<QrisTumbalItem | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);


  const providerPresets = ['ShopeePay', 'DANA', 'GoPay', 'OVO', 'BCA', 'Nobu Bank'];

  // Fetch list of Raw QRIS Tumbal
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/qris-tumbal${query}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data Raw QRIS Tumbal:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle Add New Raw QRIS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawQris.trim()) {
      setFormError('Kode Raw QRIS wajib diisi.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/qris-tumbal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_qris: rawQris.trim(),
          nama_qris: namaQris.trim() || null,
          provider,
          catatan: catatan.trim() || null,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan Raw QRIS.');
      }

      setFormSuccess('Raw QRIS Tumbal berhasil ditambahkan!');
      setRawQris('');
      setNamaQris('');
      setCatatan('');
      setStatus('aktif');
      fetchItems();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Mass / Bulk Import
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const extractedCodes = parseBulkQrisText(bulkText);

    if (extractedCodes.length === 0) {
      setFormError('Tidak ada kode Raw QRIS valid yang terdeteksi dalam teks/file.');
      return;
    }

    setBulkSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/qris-tumbal/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: extractedCodes }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengimport QRIS massal.');
      }

      setFormSuccess(`Berhasil mengimport ${data.count} Raw QRIS Tumbal secara massal!`);
      setBulkText('');
      fetchItems();
    } catch (err: any) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };



  // Handle Copy to Clipboard
  // Handle Copy to Clipboard & Auto Mark as Terpakai
  const handleCopy = async (qrisCode: string, id: number) => {
    navigator.clipboard.writeText(qrisCode);
    setCopiedId(id);

    if (id !== -1) {
      // Ubah status lokal secara langsung
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, status: 'terpakai' } : item))
      );

      setCopiedToast(`Raw QRIS tersalin & otomatis diubah menjadi Terpakai!`);

      try {
        await fetch(`/api/qris-tumbal/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'terpakai' }),
        });
      } catch (err) {
        console.error('Gagal mengupdate status terpakai:', err);
      }
    } else {
      setCopiedToast(`Raw QRIS ( ${qrisCode.substring(0, 18)}... ) tersalin!`);
    }

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);

    setTimeout(() => {
      setCopiedToast(null);
    }, 3000);
  };

  // Toggle status manual (Ready <-> Terpakai)
  const handleToggleStatus = async (item: QrisTumbalItem) => {
    const nextStatus: QrisTumbalStatus = item.status === 'aktif' ? 'terpakai' : 'aktif';

    setItems((prevItems) =>
      prevItems.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );

    try {
      await fetch(`/api/qris-tumbal/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error('Gagal mengubah status:', err);
      fetchItems();
    }
  };

  // Handle Delete Item
  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus data Raw QRIS ini?')) {
      return;
    }

    try {
      const res = await fetch(`/api/qris-tumbal/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert(data.error || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error('Error deleting QRIS:', err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Filtered & Paginated items
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (item: QrisTumbalItem) => {
    if (item.status === 'aktif') {
      return (
        <button
          onClick={() => handleToggleStatus(item)}
          className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 hover:bg-emerald-100 transition"
          title="Klik untuk ubah menjadi Terpakai"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Ready
        </button>
      );
    }
    return (
      <button
        onClick={() => handleToggleStatus(item)}
        className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1 hover:bg-rose-100 transition"
        title="Klik untuk ubah kembali menjadi Ready"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Terpakai
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="p-1 bg-emerald-500 text-white rounded-full">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">{copiedToast}</p>
            <p className="text-[10px] text-slate-400">Raw QRIS siap di-paste!</p>
          </div>
        </div>
      )}

      {/* Header Stats: 2 Cards (Raw QRIS Ready & Raw QRIS Terpakai) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Raw QRIS Ready */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw QRIS Ready</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {items.filter((i) => i.status === 'aktif').length} <span className="text-xs font-normal text-slate-500">Siap Pakai</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Raw QRIS Terpakai */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Raw QRIS Terpakai</p>
            <h3 className="text-2xl font-extrabold text-rose-600">
              {items.filter((i) => i.status === 'terpakai').length} <span className="text-xs font-normal text-slate-500">Sudah Dipakai</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Form Input Raw QRIS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-shopee-500 text-white rounded-xl shadow-md shadow-shopee-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tambah Raw QRIS Tumbal</h2>
              <p className="text-xs text-slate-500">Pilih mode single atau upload massal dari file .txt</p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setInputMode('single');
                setFormError('');
                setFormSuccess('');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                inputMode === 'single'
                  ? 'bg-white text-shopee-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Input
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('bulk');
                setFormError('');
                setFormSuccess('');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                inputMode === 'bulk'
                  ? 'bg-white text-shopee-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Upload TXT / Massal</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {formSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{formSuccess}</span>
          </div>
        )}

        {/* Single Mode Form */}
        {inputMode === 'single' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kode Raw QRIS (Payload String) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={rawQris}
                  onChange={(e) => setRawQris(e.target.value)}
                  placeholder="Paste kode Raw QRIS di sini... (Contoh: 00020101021126620016ID.CO.SHOPEE.WWW...)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
                  required
                />
                {rawQris.trim() && (
                  <button
                    type="button"
                    onClick={() => handleCopy(rawQris.trim(), -1)}
                    className="absolute right-2 top-2 px-2.5 py-1 bg-shopee-50 text-shopee-600 hover:bg-shopee-100 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    title="Tes Salin Kode"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Panjang Karakter: <span className="font-bold text-slate-600">{rawQris.trim().length}</span>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-shopee-500 hover:bg-shopee-600 rounded-xl shadow-md shadow-shopee-500/20 flex items-center space-x-2 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Simpan Raw QRIS Tumbal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Bulk / Massal Mode Form */
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload Zone with Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                  isDragging
                    ? 'border-shopee-500 bg-shopee-50/80 ring-4 ring-shopee-500/10 scale-[1.01]'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-shopee-400'
                }`}
              >
                <div
                  className={`p-3 rounded-full transition ${
                    isDragging
                      ? 'bg-shopee-500 text-white animate-bounce'
                      : 'bg-shopee-50 text-shopee-600'
                  }`}
                >
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isDragging ? 'Lepaskan File .TXT di Sini' : 'Drag & Drop / Upload File .TXT'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Tarik & lepas file .txt ke area ini atau klik tombol di bawah
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition">
                  <span>Pilih File .TXT</span>
                  <input
                    type="file"
                    accept=".txt,.log,.dat"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>


              {/* Status Detection Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Hasil Deteksi QRIS
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-shopee-500 text-white rounded-full">
                      {parseBulkQrisText(bulkText).length} Terdeteksi
                    </span>
                  </div>
                  {parseBulkQrisText(bulkText).length > 0 ? (
                    <div className="mt-3 space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {parseBulkQrisText(bulkText).map((code, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] font-mono text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded-lg truncate"
                        >
                          #{idx + 1}: {code.substring(0, 24)}...
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-4 italic">
                      Upload file .txt atau tempel teks pada kolom di bawah ini.
                    </p>
                  )}
                </div>

                {parseBulkQrisText(bulkText).length > 0 && (
                  <p className="text-[10px] text-emerald-400 font-medium">
                    ✅ Siap di-import secara otomatis ke database.
                  </p>
                )}
              </div>
            </div>

            {/* Textarea Paste Bulk Content */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Atau Tempel Isi File / Teks Massal di Sini
              </label>
              <textarea
                rows={5}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Paste isi file .txt di sini, contoh:\n\nItem 1:\nType = TEXT\nData = 000201010212...\nRAW Data = 000201010212...\n\nItem 2:\nType = TEXT\nData = 000201010212...`}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={bulkSubmitting || parseBulkQrisText(bulkText).length === 0}
                className="px-6 py-2.5 text-xs font-bold text-white bg-shopee-500 hover:bg-shopee-600 rounded-xl shadow-md shadow-shopee-500/20 flex items-center space-x-2 transition disabled:opacity-50"
              >
                {bulkSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengimport...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>
                      Import {parseBulkQrisText(bulkText).length} QRIS Massal
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}


      </div>

      {/* Tabel Daftar Raw QRIS Tumbal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Raw QRIS Tumbal</h3>
            <p className="text-xs text-slate-500">Klik tombol salin untuk mengambil string Raw QRIS secara langsung</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari Kode QRIS, Nama, Provider..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              />
            </div>

            <button
              onClick={() => fetchItems()}
              className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center w-12">No.</th>
                <th className="px-4 py-3">Kode Raw QRIS (Payload)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-shopee-500" />
                    <span>Memuat data Raw QRIS...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    <QrCode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Belum ada Raw QRIS Tumbal.</p>
                    <p className="text-[11px]">Gunakan form di atas untuk memasukkan string QRIS pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isCopied = copiedId === item.id;
                  const displayQris =
                    item.raw_qris.length > 40
                      ? `${item.raw_qris.substring(0, 20)}...${item.raw_qris.substring(item.raw_qris.length - 16)}`
                      : item.raw_qris;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {itemIndex}
                      </td>

                      {/* Kode Raw QRIS & Quick Copy */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-mono text-[11px] text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 truncate max-w-md"
                            title={item.raw_qris}
                          >
                            {displayQris}
                          </span>

                          <button
                            onClick={() => handleCopy(item.raw_qris, item.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                              isCopied
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : item.status === 'terpakai'
                                ? 'bg-slate-100 text-slate-500 hover:bg-shopee-500 hover:text-white border border-slate-200'
                                : 'bg-shopee-50 text-shopee-600 hover:bg-shopee-500 hover:text-white border border-shopee-200'
                            }`}
                            title="Salin Raw QRIS & Otomatis Tandai Terpakai"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setPreviewQrItem(item)}
                            className="p-1.5 text-slate-400 hover:text-shopee-600 transition"
                            title="Lihat Gambar QR Code"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Status (Clickable to toggle) */}
                      <td className="px-4 py-3 text-center">{getStatusBadge(item)}</td>

                      {/* Aksi Hapus */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus QRIS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>


        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-500">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-shopee-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>dari {items.length} Raw QRIS</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                  currentPage === pageNum
                    ? 'bg-shopee-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>

      {/* Edit Modal */}
      {editingItem && (
        <QrisTumbalEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => fetchItems()}
        />
      )}

      {/* Preview QR Code Modal */}
      {previewQrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Preview QR Code
              </span>
              <button
                onClick={() => setPreviewQrItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {/* Image QR Code generated from raw string */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  previewQrItem.raw_qris
                )}`}
                alt="QR Code Preview"
                className="w-52 h-52 mx-auto rounded-lg shadow-xs"
              />
            </div>

            <div>
              <p className="font-bold text-slate-900 text-sm">
                {previewQrItem.nama_qris || previewQrItem.provider}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-1 break-all max-h-16 overflow-y-auto bg-slate-100 p-2 rounded-lg text-[10px]">
                {previewQrItem.raw_qris}
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleCopy(previewQrItem.raw_qris, previewQrItem.id)}
                className="flex-1 py-2.5 bg-shopee-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-shopee-600 transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-4 h-4" />
                <span>Salin Raw QRIS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
