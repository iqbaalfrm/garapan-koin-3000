'use client';

import React, { useState, useMemo } from 'react';
import { getTodayDateString } from '@/utils/calculations';
import { PlusCircle, RotateCcw, Calendar, PhoneCall, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface EntryFormProps {
  onSuccess: () => void;
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [tanggal, setTanggal] = useState<string>(getTodayDateString());
  const [noHp, setNoHp] = useState<string>('');
  const [jumlahBeaOtp, setJumlahBeaOtp] = useState<string>('');
  const [jumlahBeaRegis, setJumlahBeaRegis] = useState<string>('');
  const [jumlahOmset, setJumlahOmset] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const parsedOtp = useMemo(() => Math.max(0, parseInt(jumlahBeaOtp, 10) || 0), [jumlahBeaOtp]);
  const parsedRegis = useMemo(() => Math.max(0, parseInt(jumlahBeaRegis, 10) || 0), [jumlahBeaRegis]);
  const parsedOmset = useMemo(() => Math.max(0, parseInt(jumlahOmset, 10) || 0), [jumlahOmset]);

  const handleReset = () => {
    setTanggal(getTodayDateString());
    setNoHp('');
    setJumlahBeaOtp('');
    setJumlahBeaRegis('');
    setJumlahOmset('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!noHp.trim()) {
      setErrorMsg('Nomor HP wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
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
        throw new Error(data.error || 'Gagal menyimpan entri transaksi.');
      }

      setSuccessMsg('Transaksi berhasil disimpan!');
      setNoHp('');
      setJumlahBeaOtp('');
      setJumlahBeaRegis('');
      setJumlahOmset('');

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal terhubung ke server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-shopee-50 text-shopee-600 border border-shopee-200 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">Input Transaksi Baru</h3>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Tanggal Transaksi & Nomor HP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-shopee-500" />
              <span>Tanggal Transaksi</span>
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 focus:ring-1 focus:ring-shopee-500 transition"
              required
            />
          </div>

          {/* No HP */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-shopee-500" />
              <span>Nomor HP / Pelanggan</span>
            </label>
            <input
              type="text"
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-shopee-500 focus:ring-1 focus:ring-shopee-500 transition"
              required
            />
          </div>
        </div>

        {/* Row 2: Inputs Qty Transaksi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Jumlah Bea OTP */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Jumlah Bea OTP (Qty)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={jumlahBeaOtp}
                onChange={(e) => setJumlahBeaOtp(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 transition"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">
                × 915
              </span>
            </div>
          </div>

          {/* Jumlah Bea Regis */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Jumlah Bea Regis (Qty)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={jumlahBeaRegis}
                onChange={(e) => setJumlahBeaRegis(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 transition"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">
                × 500
              </span>
            </div>
          </div>

          {/* Jumlah Omset */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Jumlah Omset (Qty)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={jumlahOmset}
                onChange={(e) => setJumlahOmset(e.target.value)}
                placeholder="0"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 font-bold transition"
              />
              <span className="absolute right-3 top-2 text-[10px] text-shopee-600 font-bold font-mono">
                × 3.000
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-3 py-3 px-4 bg-shopee-500 hover:bg-shopee-600 active:bg-shopee-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-shopee-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Menyimpan Transaksi...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Simpan Transaksi Baru</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
