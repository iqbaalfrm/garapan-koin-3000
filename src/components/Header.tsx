'use client';

import React from 'react';
import { Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeTabTitle: string;
}

export default function Header({
  onToggleSidebar,
  activeTabTitle,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3 sm:px-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-shopee-600 hover:bg-shopee-50 border border-slate-200 lg:hidden transition"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {activeTabTitle}
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-shopee-50 text-shopee-600 border border-shopee-200 rounded-full">
              <Sparkles className="w-2.5 h-2.5" /> Garapan Koin 3.000
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
