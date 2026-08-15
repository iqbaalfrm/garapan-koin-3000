'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, Loader2, QrCode } from 'lucide-react';
import { QrisTumbalItem, QrisTumbalStatus } from '@/types';

interface QrisTumbalEditModalProps {
  item: QrisTumbalItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QrisTumbalEditModal({
  item,
  onClose,
  onSuccess,
}: QrisTumbalEditModalProps) {
  const [rawQris, setRawQris] = useState(item.raw_qris || '');
  const [namaQris, setNamaQris] = useState(item.nama_qris || '');
  const [provider, setProvider] = useState(item.provider || 'ShopeePay');
  const [catatan, setCatatan] = useState(item.catatan || '');
  const [status, setStatus] = useState<QrisTumbalStatus>(item.status || 'aktif');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const providerOptions = ['ShopeePay', 'DANA', 'GoPay', 'OVO', 'BCA', 'Nobu Bank', 'Mandiri', 'BRI', 'Lainnya'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawQris.trim()) {
      setErrorMsg('Kode Raw QRIS wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/qris-tumbal/${item.id}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Gagal mengupdate data Raw QRIS Tumbal.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-shopee-500/20 text-shopee-400 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Edit Raw QRIS Tumbal</h3>
              <p className="text-xs text-slate-400">ID QRIS #{item.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kode Raw QRIS (Payload String) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={rawQris}
              onChange={(e) => setRawQris(e.target.value)}
              placeholder="Contoh: 00020101021126620016ID.CO.SHOPEE.WWW..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Merchant / Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                {providerOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status QRIS
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QrisTumbalStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
              >
                <option value="aktif">🟢 Aktif</option>
                <option value="penuh">🟡 Penuh</option>
                <option value="nonaktif">🔴 Nonaktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Merchant / Label (Opsional)
            </label>
            <input
              type="text"
              value={namaQris}
              onChange={(e) => setNamaQris(e.target.value)}
              placeholder="Contoh: QRIS Koin Shopee #1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-shopee-500 focus:bg-white transition"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-shopee-500 hover:bg-shopee-600 rounded-xl shadow-md shadow-shopee-500/20 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
