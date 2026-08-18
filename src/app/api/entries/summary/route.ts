import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entries } from '@/db/schema';
import { getTodayDateString, RATES } from '@/utils/calculations';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetTanggal = searchParams.get('tanggal');

    // SQL Expression Agregat
    const calcOtpSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_otp} * ${RATES.BEA_OTP}), 0)`;
    const calcRegisSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_regis} * ${RATES.BEA_REGIS}), 0)`;
    const calcTopupSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_topup} * ${RATES.BEA_TOPUP}), 0)`;
    const calcOmsetSql = sql<number>`COALESCE(SUM(${entries.jumlah_omset} * ${RATES.OMSET}), 0)`;
    const calcBersihSql = sql<number>`
      COALESCE(
        SUM(
          (${entries.jumlah_omset} * ${RATES.OMSET}) -
          (${entries.jumlah_bea_otp} * ${RATES.BEA_OTP}) -
          (${entries.jumlah_bea_regis} * ${RATES.BEA_REGIS}) -
          (${entries.jumlah_bea_topup} * ${RATES.BEA_TOPUP})
        ), 0
      )
    `;

    const calcQtyOtpSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_otp}), 0)`;
    const calcQtyRegisSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_regis}), 0)`;
    const calcQtyTopupSql = sql<number>`COALESCE(SUM(${entries.jumlah_bea_topup}), 0)`;
    const calcQtyOmsetSql = sql<number>`COALESCE(SUM(${entries.jumlah_omset}), 0)`;

    // 1. Akumulasi Seluruh Data (All Time Total jika targetTanggal tidak dikirim/diinginkan)
    const condition = targetTanggal ? eq(entries.tanggal, targetTanggal) : undefined;

    const summaryResult = await db
      .select({
        totalOtp: calcOtpSql,
        totalRegis: calcRegisSql,
        totalTopup: calcTopupSql,
        totalOmset: calcOmsetSql,
        totalBersih: calcBersihSql,
        totalQtyOtp: calcQtyOtpSql,
        totalQtyRegis: calcQtyRegisSql,
        totalQtyTopup: calcQtyTopupSql,
        totalQtyOmset: calcQtyOmsetSql,
        totalCount: sql<number>`COUNT(${entries.id})`,
      })
      .from(entries)
      .where(condition);

    const row = summaryResult[0] || {};
    const totalBeaOtpHariIni = Number(row.totalOtp || 0);
    const totalBeaRegisHariIni = Number(row.totalRegis || 0);
    const totalBeaTopupHariIni = Number(row.totalTopup || 0);
    const totalOmsetHariIni = Number(row.totalOmset || 0);
    const totalBersihHariIni = Number(row.totalBersih || 0);

    const totalQtyOtpHariIni = Number(row.totalQtyOtp || 0);
    const totalQtyRegisHariIni = Number(row.totalQtyRegis || 0);
    const totalQtyTopupHariIni = Number(row.totalQtyTopup || 0);
    const totalQtyOmsetHariIni = Number(row.totalQtyOmset || 0);
    const totalEntriHariIni = Number(row.totalCount || 0);

    return NextResponse.json({
      success: true,
      data: {
        tanggalTarget: targetTanggal || 'Semua Data',
        totalBeaOtpHariIni,
        totalBeaRegisHariIni,
        totalBeaTopupHariIni,
        totalOmsetHariIni,
        totalBersihHariIni,

        totalQtyOtpHariIni,
        totalQtyRegisHariIni,
        totalQtyTopupHariIni,
        totalQtyOmsetHariIni,
        totalEntriHariIni,
      },
    });
  } catch (error: any) {
    console.error('Error calculating aggregate summary:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghitung rekapitulasi data.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
