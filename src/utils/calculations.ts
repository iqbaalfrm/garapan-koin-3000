export const RATES = {
  BEA_OTP: 915,
  BEA_REGIS: 500,
  OMSET: 3000,
} as const;

export interface CalculationResult {
  beaOtpRp: number;
  beaRegisRp: number;
  omsetRp: number;
  bersihRp: number;
}

/**
 * Menghitung nilai rupiah secara otomatis dari kuantitas (qty) input pengguna.
 */
export function calculateTransaction(
  jumlahBeaOtp: number,
  jumlahBeaRegis: number,
  jumlahOmset: number
): CalculationResult {
  const beaOtpRp = (jumlahBeaOtp || 0) * RATES.BEA_OTP;
  const beaRegisRp = (jumlahBeaRegis || 0) * RATES.BEA_REGIS;
  const omsetRp = (jumlahOmset || 0) * RATES.OMSET;
  const bersihRp = omsetRp - beaOtpRp - beaRegisRp;

  return {
    beaOtpRp,
    beaRegisRp,
    omsetRp,
    bersihRp,
  };
}

/**
 * Format angka ke dalam standar rupiah (Rp 1.000.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format tanggal YYYY-MM-DD ke format tampilan Indonesia (misal: 13 Agustus 2026)
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD (local timezone)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
