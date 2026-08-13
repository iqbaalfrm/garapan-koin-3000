'use client';

import React from 'react';
import { FilterParams, EntryItem } from '@/types';
import { Search, Download, Calendar, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  filters: FilterParams;
  onFilterChange: (newFilters: FilterParams) => void;
  onResetFilters: () => void;
  entries: EntryItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  entries,
  loading,
  onRefresh,
}: FilterBarProps) {
  // Export CSV
  const handleExportCSV = () => {
    if (!entries || entries.length === 0) {
      alert('Tidak ada data transaksi untuk diexport.');
      return;
    }

    const headers = [
      'No',
      'Tanggal',
      'No HP',
      'Jumlah Bea OTP (Qty)',
      'Bea OTP (Rp)',
      'Jumlah Bea Regis (Qty)',
      'Bea Regis (Rp)',
      'Jumlah Omset (Qty)',
      'Omset (Rp)',
      'Bersih (Rp)',
    ];

    const rows = entries.map((item, idx) => [
      idx + 1,
      item.tanggal,
      `"${item.no_hp}"`,
      item.jumlah_bea_otp,
      item.bea_otp_rp,
      item.jumlah_bea_regis,
      item.bea_regis_rp,
      item.jumlah_omset,
      item.omset_rp,
      item.bersih_rp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateSuffix = filters.tanggal || new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Garapan_Koin_3000_${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
          {/* Search No HP */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Cari No HP..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-shopee-500 transition"
            />
          </div>

          {/* Filter Tanggal */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="date"
              value={filters.tanggal || ''}
              onChange={(e) => onFilterChange({ ...filters, tanggal: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-shopee-500 transition"
            />
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(filters.search || filters.tanggal) && (
            <button
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              Reset
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-shopee-500 hover:bg-shopee-600 rounded-xl shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
