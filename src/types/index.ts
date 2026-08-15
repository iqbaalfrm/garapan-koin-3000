export type SesiType = 'pagi' | 'siang' | 'sore' | 'malam';

export interface EntryItem {
  id: number;
  tanggal: string; // YYYY-MM-DD
  sesi: SesiType;
  no_hp: string;
  jumlah_bea_otp: number;
  jumlah_bea_regis: number;
  jumlah_omset: number;
  createdAt?: string;
  
  // Computed values (calculated on the fly)
  bea_otp_rp: number;
  bea_regis_rp: number;
  omset_rp: number;
  bersih_rp: number;
}

export interface SummaryData {
  tanggalTarget: string;
  totalBeaOtpHariIni: number;
  totalBeaRegisHariIni: number;
  totalOmsetHariIni: number;
  totalBersihHariIni: number;
  
  totalQtyOtpHariIni: number;
  totalQtyRegisHariIni: number;
  totalQtyOmsetHariIni: number;

  totalBersihPagi: number;
  totalBersihSiang: number;
  totalBersihSore: number;
  totalBersihMalam: number;
  totalBersihMingguIni: number;
  totalBersihBulanIni: number;
  totalEntriHariIni: number;
}

export interface FilterParams {
  tanggal?: string;
  startDate?: string;
  endDate?: string;
  sesi?: string;
  search?: string;
}

export type VATumbalStatus = 'aktif' | 'penuh' | 'nonaktif';

export interface VATumbalItem {
  id: number;
  nomor_va: string;
  bank: string;
  label?: string | null;
  catatan?: string | null;
  status: VATumbalStatus;
  createdAt?: string;
}

