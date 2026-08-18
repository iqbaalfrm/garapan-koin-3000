'use client';

import React, { useState, useMemo } from 'react';
import { EntryItem } from '@/types';
import { formatRupiah, formatTanggalIndo } from '@/utils/calculations';
import { Edit2, Trash2, Phone, Inbox, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface EntryTableProps {
  entries: EntryItem[];
  loading: boolean;
  onEdit: (entry: EntryItem) => void;
  onDeleteSuccess: () => void;
  title?: string;
  defaultPageSize?: number;
}

export default function EntryTable({
  entries,
  loading,
  onEdit,
  onDeleteSuccess,
  title = 'Riwayat Transaksi Harian',
  defaultPageSize = 10,
}: EntryTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(entries.length / pageSize));
  }, [entries.length, pageSize]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, currentPage, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [entries.length, totalPages, currentPage]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menghapus entri.');
      }
      onDeleteSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data.');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-8 h-8 border-2 border-shopee-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Memuat data riwayat transaksi...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Belum Ada Data Transaksi</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Silakan isi form input transaksi di atas untuk menambahkan entri transaksi harian baru.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Total: {entries.length} entri
            </span>
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Tampilkan:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-shopee-500 font-semibold"
              >
                <option value={5}>5 per hal</option>
                <option value={10}>10 per hal</option>
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center">No</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">No HP</th>
                <th className="px-4 py-3 text-right">Bea OTP (Rp)</th>
                <th className="px-4 py-3 text-right">Bea Regis (Rp)</th>
                <th className="px-4 py-3 text-right">Bea Topup (Rp)</th>
                <th className="px-4 py-3 text-right">Omset (Rp)</th>
                <th className="px-4 py-3 text-right text-shopee-600">Bersih (Rp)</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.map((item, index) => {
                const globalIndex = (currentPage - 1) * pageSize + index + 1;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                      {globalIndex}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {formatTanggalIndo(item.tanggal)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-800 font-medium whitespace-nowrap">
                      {item.no_hp}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-slate-400 text-[10px] block">({item.jumlah_bea_otp} × 915)</span>
                      <span className="font-bold text-red-600">{formatRupiah(item.bea_otp_rp)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-slate-400 text-[10px] block">({item.jumlah_bea_regis} × 500)</span>
                      <span className="font-bold text-rose-600">{formatRupiah(item.bea_regis_rp)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-slate-400 text-[10px] block">({item.jumlah_bea_topup || 0} × 100)</span>
                      <span className="font-bold text-amber-600">{formatRupiah(item.bea_topup_rp || 0)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="text-slate-400 text-[10px] block">({item.jumlah_omset} × 3k)</span>
                      <span className="font-bold text-blue-600">{formatRupiah(item.omset_rp)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className="font-extrabold text-shopee-600 text-sm">
                        {formatRupiah(item.bersih_rp)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-shopee-600 hover:bg-shopee-50 border border-slate-200 transition"
                          title="Edit Entri"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border border-slate-200 transition"
                          title="Hapus Entri"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Desktop) */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * pageSize + 1}</span> s/d{' '}
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * pageSize, entries.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-900">{entries.length}</span> entri
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (
                totalPages > 5 &&
                Math.abs(pageNum - currentPage) > 2 &&
                pageNum !== 1 &&
                pageNum !== totalPages
              ) {
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition border ${
                    currentPage === pageNum
                      ? 'bg-shopee-500 text-white border-shopee-500 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 mb-2">
          <span className="font-bold text-slate-900">{title} ({entries.length})</span>
          <span className="text-[11px]">Hal {currentPage} dari {totalPages}</span>
        </div>

        {paginatedEntries.map((item, index) => {
          const globalIndex = (currentPage - 1) * pageSize + index + 1;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    #{globalIndex}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatTanggalIndo(item.tanggal)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-shopee-500" /> No HP:
                </span>
                <span className="font-mono font-bold text-slate-900">{item.no_hp}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 block">OTP ({item.jumlah_bea_otp})</span>
                  <span className="font-bold text-red-600">{formatRupiah(item.bea_otp_rp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Regis ({item.jumlah_bea_regis})</span>
                  <span className="font-bold text-rose-600">{formatRupiah(item.bea_regis_rp)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Topup ({item.jumlah_bea_topup || 0})</span>
                  <span className="font-bold text-amber-600">{formatRupiah(item.bea_topup_rp || 0)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Omset ({item.jumlah_omset})</span>
                  <span className="font-bold text-blue-600">{formatRupiah(item.omset_rp)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-shopee-600 font-bold block uppercase">Total Bersih</span>
                  <span className="text-base font-black text-slate-900">
                    {formatRupiah(item.bersih_rp)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="px-3 py-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mobile Pagination Controls */}
        <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-2xl text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold disabled:opacity-40"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Konfirmasi Hapus</h4>
                <p className="text-xs text-slate-500">Apakah Anda yakin ingin menghapus data ini?</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
                className="px-3.5 py-2 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-50"
              >
                {deletingId === confirmDeleteId ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
