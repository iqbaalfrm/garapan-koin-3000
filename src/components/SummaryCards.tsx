'use client';

import React from 'react';
import { SummaryData } from '@/types';
import { formatRupiah } from '@/utils/calculations';
import { Wallet, Key, UserCheck, DollarSign } from 'lucide-react';

interface SummaryCardsProps {
  summary: SummaryData | null;
  loading: boolean;
}

export default function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse h-32 shadow-sm"
          />
        ))}
      </div>
    );
  }

  const data = summary || {
    tanggalTarget: 'Semua Data',
    totalBeaOtpHariIni: 0,
    totalBeaRegisHariIni: 0,
    totalOmsetHariIni: 0,
    totalBersihHariIni: 0,
    totalQtyOtpHariIni: 0,
    totalQtyRegisHariIni: 0,
    totalQtyOmsetHariIni: 0,
    totalEntriHariIni: 0,
  };

  return (
    <div className="mb-6">
      {/* Grid 4 Cards Info Penting (Akumulasi Seluruh Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Bea OTP */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-red-500" />
              <span>Total Bea OTP</span>
            </span>
            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-mono">
              × Rp 915
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(data.totalBeaOtpHariIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Total Qty: <strong className="text-slate-800">{data.totalQtyOtpHariIni}</strong> transaksi
          </p>
        </div>

        {/* Card 2: Total Bea Regis */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-rose-500" />
              <span>Total Bea Regis</span>
            </span>
            <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-mono">
              × Rp 500
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(data.totalBeaRegisHariIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Total Qty: <strong className="text-slate-800">{data.totalQtyRegisHariIni}</strong> registrasi
          </p>
        </div>

        {/* Card 3: Total Omset */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-500" />
              <span>Total Omset</span>
            </span>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-mono">
              × Rp 3.000
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatRupiah(data.totalOmsetHariIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Total Qty: <strong className="text-slate-800">{data.totalQtyOmsetHariIni}</strong> koin
          </p>
        </div>

        {/* Card 4: Total Bersih (Shopee Orange Highlight) */}
        <div className="bg-white border-l-4 border-l-shopee-500 border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs font-bold text-shopee-600 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-shopee-500" />
              <span>Total Bersih</span>
            </span>
            <span className="text-[10px] bg-shopee-50 text-shopee-600 border border-shopee-200 px-2 py-0.5 rounded-full font-bold">
              Akumulasi Total
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-shopee-600 tracking-tight">
            {formatRupiah(data.totalBersihHariIni)}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium">
            Total Omset − OTP − Regis
          </p>
        </div>
      </div>
    </div>
  );
}
