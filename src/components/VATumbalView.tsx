'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
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
  Sparkles,
  Wallet,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { VATumbalItem, VATumbalStatus } from '@/types';
import VATumbalEditModal from './VATumbalEditModal';

export default function VATumbalView() {
  const [items, setItems] = useState<VATumbalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Form input state
  const [nomorVa, setNomorVa] = useState<string>('');
  const [bank, setBank] = useState<string>('SeaBank');
  const [label, setLabel] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [status, setStatus] = useState<VATumbalStatus>('aktif');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formSuccess, setFormSuccess] = useState<string>('');

  // Editing state
  const [editingItem, setEditingItem] = useState<VATumbalItem | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const bankPresets = ['SeaBank', 'BCA', 'Mandiri', 'BRI', 'BNI', 'DANA', 'ShopeePay'];

  // Fetch list of VA Tumbal
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/va-tumbal${query}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data VA Tumbal:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle Add New VA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorVa.trim()) {
      setFormError('Nomor Virtual Account (VA) wajib diisi.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch('/api/va-tumbal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_va: nomorVa.trim(),
          bank,
          label: label.trim() || null,
          catatan: catatan.trim() || null,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan Nomor VA.');
      }

      setFormSuccess('Nomor VA Tumbal berhasil ditambahkan!');
      setNomorVa('');
      setLabel('');
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
  const handleCopy = (vaNumber: string, id: number) => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedId(id);
    setCopiedToast(`Nomor VA: ${vaNumber} tersalin ke clipboard!`);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);

    setTimeout(() => {
      setCopiedToast(null);
    }, 3000);
  };

  // Handle Delete Item
  const handleDelete = async (id: number, vaNum: string) => {
    if (!window.confirm(`Yakin ingin menghapus Nomor VA ${vaNum}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/va-tumbal/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchItems();
      } else {
        alert(data.error || 'Gagal menghapus data.');
      }
    } catch (err) {
      console.error('Error deleting VA:', err);
      alert('Terjadi kesalahan saat menghapus.');
    }
  };

  // Filtered & Paginated items
  const totalPages = Math.ceil(items.length / pageSize) || 1;
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getBankBadgeStyle = (bName: string) => {
    switch (bName.toLowerCase()) {
      case 'seabank':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bca':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'mandiri':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'bri':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'bni':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'dana':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'shopeepay':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (st: VATumbalStatus) => {
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
      {/* Toast Banner Notification */}
      {copiedToast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="p-1 bg-emerald-500 text-white rounded-full">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">{copiedToast}</p>
            <p className="text-[10px] text-slate-400">Siap untuk dipaste di mana saja.</p>
          </div>
        </div>
      )}

      {/* Header Info & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-shopee-50 text-shopee-500 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total VA Tumbal</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{items.length} <span className="text-xs font-normal text-slate-500">Nomor</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">VA Status Aktif</p>
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
            <p className="text-xs font-bold text-slate-700">1-Klik Salin Nomor VA</p>
          </div>
        </div>
      </div>

      {/* Form Input VA Tumbal Baru */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-shopee-500 text-white rounded-xl shadow-md shadow-shopee-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Tambah Nomor VA Tumbal Baru</h2>
              <p className="text-xs text-slate-500">Masukkan nomor virtual account untuk mempermudah transaksi</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-shopee-50 text-shopee-600 px-3 py-1 rounded-full border border-shopee-200">
            Form VA Tumbal
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Input Nomor VA */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Virtual Account <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nomorVa}
                  onChange={(e) => setNomorVa(e.target.value)}
                  placeholder="Masukkan Nomor VA..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
                  required
                />
                {nomorVa.trim() && (
                  <button
                    type="button"
                    onClick={() => handleCopy(nomorVa.trim(), -1)}
                    className="absolute right-2 top-2 px-2 py-1 bg-shopee-50 text-shopee-600 hover:bg-shopee-100 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                    title="Tes Salin"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Bank / Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bank / Provider
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                {bankPresets.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="Lainnya">Lainnya</option>
              </select>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1 mt-2">
                {bankPresets.slice(0, 5).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBank(b)}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition ${
                      bank === b
                        ? 'bg-shopee-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Status VA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VATumbalStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                <option value="aktif">🟢 Aktif (Siap Pakai)</option>
                <option value="penuh">🟡 Penuh (Limit Reached)</option>
                <option value="nonaktif">🔴 Nonaktif</option>
              </select>
            </div>

            {/* Label / Nama Akun */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Label / Nama Akun (Opsional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Contoh: VA Shopee #1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              />
            </div>

            {/* Catatan Keterangan */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: Digunakan untuk koin sesi pagi..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              />
            </div>
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
                  <span>Simpan Nomor VA Tumbal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Daftar VA Tumbal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Daftar Virtual Account Tumbal</h3>
            <p className="text-xs text-slate-500">Klik tombol salin untuk menyalin nomor VA secara langsung</p>
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
                placeholder="Cari VA, Label, Bank..."
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
                <th className="px-4 py-3">Nomor Virtual Account</th>
                <th className="px-4 py-3">Bank / Provider</th>
                <th className="px-4 py-3">Label / Nama Akun</th>
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
                    <span>Memuat daftar VA Tumbal...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Belum ada Nomor VA Tumbal.</p>
                    <p className="text-[11px]">Gunakan form di atas untuk menambahkan nomor VA pertama Anda.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isCopied = copiedId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {itemIndex}
                      </td>

                      {/* Nomor VA & Tombol Quick Copy */}
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm tracking-wide text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {item.nomor_va}
                          </span>

                          <button
                            onClick={() => handleCopy(item.nomor_va, item.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                              isCopied
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-shopee-50 text-shopee-600 hover:bg-shopee-500 hover:text-white border border-shopee-200'
                            }`}
                            title="Salin Nomor VA ke Clipboard"
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
                        </div>
                      </td>

                      {/* Bank Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${getBankBadgeStyle(
                            item.bank
                          )}`}
                        >
                          {item.bank}
                        </span>
                      </td>

                      {/* Label */}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {item.label || <span className="text-slate-400 italic">-</span>}
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
                            title="Edit VA"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.nomor_va)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus VA"
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
              {Math.min(currentPage * pageSize, items.length)} dari {items.length} VA
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
        <VATumbalEditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => fetchItems()}
        />
      )}
    </div>
  );
}
