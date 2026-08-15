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
} from 'lucide-react';
import { QrisTumbalItem, QrisTumbalStatus } from '@/types';
import QrisTumbalEditModal from './QrisTumbalEditModal';

export default function QrisTumbalView() {
  const [items, setItems] = useState<QrisTumbalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Form input state
  const [rawQris, setRawQris] = useState<string>('');
  const [namaQris, setNamaQris] = useState<string>('');
  const [provider, setProvider] = useState<string>('ShopeePay');
  const [catatan, setCatatan] = useState<string>('');
  const [status, setStatus] = useState<QrisTumbalStatus>('aktif');
  const [submitting, setSubmitting] = useState<boolean>(false);
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
  const pageSize = 10;

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

  // Handle Copy to Clipboard
  const handleCopy = (qrisCode: string, id: number) => {
    navigator.clipboard.writeText(qrisCode);
    setCopiedId(id);
    setCopiedToast(`Raw QRIS ( ${qrisCode.substring(0, 18)}... ) tersalin!`);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);

    setTimeout(() => {
      setCopiedToast(null);
    }, 3000);
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

  const getProviderBadgeStyle = (pName: string) => {
    switch (pName.toLowerCase()) {
      case 'shopeepay':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'dana':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'gopay':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ovo':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'bca':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'nobu bank':
      case 'nobu':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (st: QrisTumbalStatus) => {
    switch (st) {
      case 'aktif':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Aktif
          </span>
        );
      case 'penuh':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Penuh
          </span>
        );
      case 'nonaktif':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Nonaktif
          </span>
        );
    }
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

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-shopee-50 text-shopee-500 rounded-xl">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Raw QRIS</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{items.length} <span className="text-xs font-normal text-slate-500">QRIS</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">QRIS Status Aktif</p>
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {items.filter((i) => i.status === 'aktif').length} <span className="text-xs font-normal text-slate-500">Siap Pakai</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fitur Utama</p>
            <p className="text-xs font-bold text-slate-700">1-Klik Salin Raw QRIS Code</p>
          </div>
        </div>
      </div>

      {/* Form Input Raw QRIS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-shopee-500 text-white rounded-xl shadow-md shadow-shopee-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tambah Raw QRIS Tumbal Baru</h2>
              <p className="text-xs text-slate-500">Masukkan kode string Raw QRIS untuk memudahkan pemindahan saldo koin</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-shopee-50 text-shopee-600 px-3 py-1 rounded-full border border-shopee-200">
            Form Raw QRIS
          </span>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Merchant / Provider */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Provider / Merchant
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                {providerPresets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 mt-2">
                {providerPresets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                      provider === p
                        ? 'bg-shopee-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Nama Merchant / Label */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama QRIS / Label (Opsional)
              </label>
              <input
                type="text"
                value={namaQris}
                onChange={(e) => setNamaQris(e.target.value)}
                placeholder="Contoh: QRIS Koin Sesi Pagi #1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              />
            </div>

            {/* Status QRIS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QrisTumbalStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                <option value="aktif">🟢 Aktif (Siap Pakai)</option>
                <option value="penuh">🟡 Penuh (Limit Reached)</option>
                <option value="nonaktif">🔴 Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan untuk QRIS ini..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
            />
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
                <th className="px-4 py-3 text-center">No.</th>
                <th className="px-4 py-3">Kode Raw QRIS (Payload)</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Nama QRIS / Label</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-shopee-500" />
                    <span>Memuat data Raw QRIS...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
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
                    item.raw_qris.length > 32
                      ? `${item.raw_qris.substring(0, 16)}...${item.raw_qris.substring(item.raw_qris.length - 12)}`
                      : item.raw_qris;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {itemIndex}
                      </td>

                      {/* Kode Raw QRIS & Quick Copy */}
                      <td className="px-4 py-3 max-w-sm">
                        <div className="flex items-center space-x-2">
                          <span
                            className="font-mono text-[11px] text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-[200px]"
                            title={item.raw_qris}
                          >
                            {displayQris}
                          </span>

                          <button
                            onClick={() => handleCopy(item.raw_qris, item.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                              isCopied
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-shopee-50 text-shopee-600 hover:bg-shopee-500 hover:text-white border border-shopee-200'
                            }`}
                            title="Salin Raw QRIS String"
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
                            className="p-1 text-slate-400 hover:text-shopee-600 transition"
                            title="Lihat Gambar QR Code"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Provider Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${getProviderBadgeStyle(
                            item.provider
                          )}`}
                        >
                          {item.provider}
                        </span>
                      </td>

                      {/* Nama QRIS */}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {item.nama_qris || <span className="text-slate-400 italic">-</span>}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>

                      {/* Catatan */}
                      <td className="px-4 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                        {item.catatan || <span className="text-slate-400 italic">-</span>}
                      </td>

                      {/* Aksi */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-500 hover:text-shopee-600 hover:bg-shopee-50 rounded-lg transition"
                            title="Edit QRIS"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus QRIS"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <p className="text-slate-500">
              Menampilkan {Math.min((currentPage - 1) * pageSize + 1, items.length)} -{' '}
              {Math.min(currentPage * pageSize, items.length)} dari {items.length} QRIS
            </p>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1 text-slate-600 font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold disabled:opacity-40 hover:bg-slate-200 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
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
