# Garapan Koin 3.000 — Catatan Transaksi Harian

Aplikasi web modern, ringan, dan responsif untuk mencatat transaksi harian berbasis sistem sesi (**Pagi**, **Siang**, **Sore**, **Malam**). Dibangun menggunakan **Next.js 14 (App Router)**, **Supabase PostgreSQL**, **Drizzle ORM**, dan **Tailwind CSS**.

---

## 🚀 Formulasi Kalkulasi Otomatis (Live Preview)

Semua angka Rupiah dihitung secara langsung (*on-the-fly*) dari kuantitas transaksi yang dimasukkan oleh pengguna:

1. **Bea OTP (Rp)** = `Jumlah Bea OTP` × **Rp 915**
2. **Bea Regis (Rp)** = `Jumlah Bea Regis` × **Rp 500**
3. **Bea Topup ShopeePay (Rp)** = `Jumlah Bea Topup` × **Rp 500**
4. **Omset (Rp)** = `Jumlah Omset` × **Rp 3.000**
5. **Bersih (Rp)** = `Omset (Rp)` − `Bea OTP (Rp)` − `Bea Regis (Rp)` − `Bea Topup (Rp)`

---

## 📖 Panduan Setup Supabase & Vercel Deploy

### 1. Membuat Database di Supabase (Gratis)

1. Daftar & login di **[supabase.com](https://supabase.com)**.
2. Klik **New Project**, beri nama `garapan-koin` dan tentukan password database.
3. Pilih Region terdekat (misal: *Southeast Asia / Singapore*).
4. Setelah project dibuat, buka **Settings (Roda Gigi) → Database**.
5. Salin **Connection String → URI** (ganti `[YOUR-PASSWORD]` dengan password database Anda).

---

### 2. Pengaturan Environment Variables

Buat file `.env.local` di root proyek:

```env
DATABASE_URL="postgresql://postgres.your-ref:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

---

### 3. Menjalankan Migrasi Database Drizzle

Jalankan perintah berikut untuk membuat tabel `entries` di Supabase PostgreSQL:

```bash
npx drizzle-kit push
```

---

### 4. Deploy ke Vercel

1. Push kode proyek Anda ke repositori **GitHub**.
2. Hubungkan repositori ke **[Vercel Dashboard](https://vercel.com/new)**.
3. Tambahkan Environment Variable di Vercel:
   - `DATABASE_URL` = *(connection string Supabase)*
4. Klik **Deploy**.

---

## 🛠️ Perintah Lokal

```bash
# Install dependensi
npm install

# Jalankan server pengembangan lokal
npm run dev

# Build produksi
npm run build
```
