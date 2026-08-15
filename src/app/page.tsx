'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { TabType } from '@/components/Sidebar';
import Header from '@/components/Header';
import SummaryCards from '@/components/SummaryCards';
import EntryForm from '@/components/EntryForm';
import FilterBar from '@/components/FilterBar';
import EntryTable from '@/components/EntryTable';
import EditModal from '@/components/EditModal';
import VATumbalView from '@/components/VATumbalView';
import { EntryItem, SummaryData, FilterParams } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterParams>({
    tanggal: '',
    sesi: '',
    search: '',
  });

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [entries, setEntries] = useState<EntryItem[]>([]);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(true);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [editingEntry, setEditingEntry] = useState<EntryItem | null>(null);

  // Fetch summary data (Akumulasi Seluruh Data)
  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/entries/summary`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  // Fetch list entries dari API
  const fetchEntries = useCallback(async (currentFilters: FilterParams) => {
    setLoadingEntries(true);
    try {
      const query = new URLSearchParams();
      if (currentFilters.tanggal) query.append('tanggal', currentFilters.tanggal);
      if (currentFilters.startDate) query.append('startDate', currentFilters.startDate);
      if (currentFilters.endDate) query.append('endDate', currentFilters.endDate);
      if (currentFilters.sesi) query.append('sesi', currentFilters.sesi);
      if (currentFilters.search) query.append('search', currentFilters.search);

      const res = await fetch(`/api/entries?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  // Sync fetch data saat filter berubah
  useEffect(() => {
    fetchEntries(filters);
    fetchSummary();
  }, [filters, fetchEntries, fetchSummary]);

  const handleRefreshAll = () => {
    fetchEntries(filters);
    fetchSummary();
  };

  const handleResetFilters = () => {
    setFilters({
      tanggal: '',
      sesi: '',
      search: '',
    });
  };

  const tabTitles = {
    dashboard: 'Dashboard Rekap & Ringkasan',
    input: 'Input Transaksi Baru',
    riwayat: 'Riwayat Transaksi Harian',
    'va-tumbal': 'Manajemen Virtual Account (VA Tumbal)',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-shopee-500 selection:text-white">
      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Right Content Layout */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(true)}
          activeTabTitle={tabTitles[activeTab]}
        />

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Menu Dashboard: 4 Summary Cards + Tabel Transaksi Terakhir di Bawahnya */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 Card Info Penting (Akumulasi Seluruh Data) */}
              <SummaryCards
                summary={summary}
                loading={loadingSummary}
              />

              {/* Tabel Transaksi Terakhir dengan Pagination */}
              <div className="space-y-4">
                <EntryTable
                  title="Tabel Transaksi Terakhir"
                  entries={entries}
                  loading={loadingEntries}
                  onEdit={(item) => setEditingEntry(item)}
                  onDeleteSuccess={handleRefreshAll}
                  defaultPageSize={5}
                />
              </div>
            </div>
          )}

          {/* Menu Input Transaksi: Form Input Transaksi Baru Full Width */}
          {activeTab === 'input' && (
            <div className="space-y-6">
              <div className="w-full">
                <EntryForm onSuccess={handleRefreshAll} />
              </div>

              {/* Preview Tabel Entri Terbaru */}
              <div className="pt-2">
                <EntryTable
                  title="Transaksi Terinput Hari Ini"
                  entries={entries}
                  loading={loadingEntries}
                  onEdit={(item) => setEditingEntry(item)}
                  onDeleteSuccess={handleRefreshAll}
                  defaultPageSize={5}
                />
              </div>
            </div>
          )}

          {/* Menu Riwayat Transaksi: Filter Bar & Full Table dengan Pagination */}
          {activeTab === 'riwayat' && (
            <div className="space-y-4">
              <SummaryCards
                summary={summary}
                loading={loadingSummary}
              />

              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={handleResetFilters}
                entries={entries}
                loading={loadingEntries}
                onRefresh={handleRefreshAll}
              />

              <EntryTable
                title="Daftar Lengkap Riwayat Transaksi"
                entries={entries}
                loading={loadingEntries}
                onEdit={(item) => setEditingEntry(item)}
                onDeleteSuccess={handleRefreshAll}
                defaultPageSize={10}
              />
            </div>
          )}

          {/* Menu VA Tumbal */}
          {activeTab === 'va-tumbal' && <VATumbalView />}
        </main>


        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
          <p>Garapan Koin 3.000 &copy; {new Date().getFullYear()} — Dashboard Transaksi</p>
        </footer>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSuccess={handleRefreshAll}
        />
      )}
    </div>
  );
}
