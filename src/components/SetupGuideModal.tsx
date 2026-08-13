'use client';

import React from 'react';
import { X, Database, ExternalLink, Key, CheckCircle, Server } from 'lucide-react';

interface SetupGuideModalProps {
  onClose: () => void;
}

export default function SetupGuideModal({ onClose }: SetupGuideModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">
              Panduan Setup Supabase Database & Vercel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          {/* Step 1: Create Supabase DB */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
              <span>Membuat Database di Supabase (Gratis)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Supabase menyediakan PostgreSQL Cloud gratis yang sangat stabil, aman, dan cocok untuk Vercel.
            </p>
            <ol className="list-decimal list-inside text-xs space-y-1.5 text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <li>
                Daftar & login di{' '}
                <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-1">
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>Klik **New Project**, beri nama `garapan-koin` dan masukkan password database.</li>
              <li>Pilih Region terdekat (misal: *Southeast Asia / Singapore*).</li>
              <li>Setelah project selesai dibuat, buka menu **Settings (ikon Roda Gigi) → Database**.</li>
              <li>Cari bagian **Connection String → URI** (atau **Transaction pooler**).</li>
              <li>Salin string koneksi tersebut (ganti `[YOUR-PASSWORD]` dengan password database Anda).</li>
            </ol>
          </section>

          {/* Step 2: Set Environment Variables */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
              <span>Pengaturan Environment Variables</span>
            </div>
            <p className="text-slate-400 text-xs">
              Buka file <code className="text-emerald-300 font-mono bg-slate-800 px-1 py-0.5 rounded">.env.local</code> di folder proyek Anda dan isi:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
              <p>DATABASE_URL="postgres://postgres.ref:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"</p>
            </div>
          </section>

          {/* Step 3: Run Drizzle Migration */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span>
              <span>Jalankan Migrasi Database Drizzle</span>
            </div>
            <p className="text-slate-400 text-xs">
              Jalankan perintah berikut di terminal untuk membuat tabel `entries` di Supabase:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-amber-300 border border-slate-800">
              <p>npx drizzle-kit push</p>
            </div>
          </section>

          {/* Step 4: Deploy to Vercel */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span>
              <span>Deploy ke Vercel (Serverless)</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>
                  Push kode ke GitHub, lalu hubungkan ke Vercel Dashboard (<a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-emerald-400 underline">vercel.com/new</a>).
                </span>
              </p>
              <p className="text-emerald-300/90 font-medium bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                ⚠️ <strong>Penting:</strong> Tambahkan variabel <code className="font-mono">DATABASE_URL</code> di Vercel Dashboard pada menu <em>Settings → Environment Variables</em>.
              </p>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-xs transition"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
