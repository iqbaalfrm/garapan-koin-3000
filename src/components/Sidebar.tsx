'use client';

import React from 'react';
import { Coins, LayoutDashboard, PlusCircle, History, X, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'input' | 'riwayat';
  setActiveTab: (tab: 'dashboard' | 'input' | 'riwayat') => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Rekap',
      icon: LayoutDashboard,
    },
    {
      id: 'input',
      label: 'Input Transaksi',
      icon: PlusCircle,
    },
    {
      id: 'riwayat',
      label: 'Riwayat Transaksi',
      icon: History,
    },
  ] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header Logo */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-shopee-500 text-white flex items-center justify-center shadow-md shadow-shopee-500/20 font-bold">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                  Garapan Koin <span className="text-shopee-500">3.000</span>
                </h1>
                <span className="text-[10px] font-semibold text-shopee-600 bg-shopee-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-shopee-200">
                  <Sparkles className="w-2.5 h-2.5" /> v3.0
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <p className="px-3 pt-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Utama
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-shopee-50 text-shopee-600 font-bold border-l-4 border-shopee-500 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition ${
                      isActive ? 'text-shopee-500' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span className="text-xs leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info sederhana di bagian bawah sidebar */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Garapan Koin 3.000 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>
    </>
  );
}
