'use client';

import React, { useState, useMemo } from 'react';
import { EntryItem } from '@/types';
import { X, Save, Calendar, PhoneCall } from 'lucide-react';

interface EditModalProps {
  entry: EntryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditModal({ entry, onClose, onSuccess }: EditModalProps) {
  const [tanggal, setTanggal] = useState<string>(entry.tanggal);
  const [noHp, setNoHp] = useState<string>(entry.no_hp);
  const [jumlahBeaOtp, setJumlahBeaOtp] = useState<string>(String(entry.jumlah_bea_otp));
  const [jumlahBeaRegis, setJumlahBeaRegis] = useState<string>(String(entry.jumlah_bea_regis));
  const [jumlahOmset, setJumlahOmset] = useState<string>(String(entry.jumlah_omset));

  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsedOtp = useMemo(() => Math.max(0, parseInt(jumlahBeaOtp, 10) || 0), [jumlahBeaOtp]);
  const parsedRegis = useMemo(() => Math.max(0, parseInt(jumlahBeaRegis, 10) || 0), [jumlahBeaRegis]);
  const parsedOmset = useMemo(() => Math.max(0, parseInt(jumlahOmset, 10) || 0), [jumlahOmset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!noHp.trim()) {
      setErrorMsg('Nomor HP wajib diisi.');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal,
          no_hp: noHp.trim(),
          jumlah_bea_otp: parsedOtp,
          jumlah_bea_regis: parsedRegis,
          jumlah_omset: parsedOmset,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memperbarui transaksi.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Edit Transaksi #{entry.id}</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Tanggal & No HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-shopee-500" />
                <span>Tanggal Transaksi</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-shopee-500" />
                <span>Nomor HP</span>
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 transition"
                required
              />
            </div>
          </div>

          {/* Row 2: Qty Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Bea OTP (Qty)</label>
              <input
                type="number"
                min="0"
                value={jumlahBeaOtp}
                onChange={(e) => setJumlahBeaOtp(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Bea Regis (Qty)</label>
              <input
                type="number"
                min="0"
                value={jumlahBeaRegis}
                onChange={(e) => setJumlahBeaRegis(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">Omset (Qty)</label>
              <input
                type="number"
                min="0"
                value={jumlahOmset}
                onChange={(e) => setJumlahOmset(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-bold"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-shopee-500 hover:bg-shopee-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Simpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
