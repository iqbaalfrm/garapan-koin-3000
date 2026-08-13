import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entries } from '@/db/schema';
import { calculateTransaction } from '@/utils/calculations';
import { eq, and, gte, lte, like, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function formatEntryWithCalculations(entry: any) {
  const calc = calculateTransaction(
    entry.jumlah_bea_otp,
    entry.jumlah_bea_regis,
    entry.jumlah_omset
  );

  return {
    ...entry,
    bea_otp_rp: calc.beaOtpRp,
    bea_regis_rp: calc.beaRegisRp,
    omset_rp: calc.omsetRp,
    bersih_rp: calc.bersihRp,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tanggal = searchParams.get('tanggal');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const conditions = [];

    if (tanggal) {
      conditions.push(eq(entries.tanggal, tanggal));
    } else if (startDate && endDate) {
      conditions.push(gte(entries.tanggal, startDate));
      conditions.push(lte(entries.tanggal, endDate));
    } else if (startDate) {
      conditions.push(gte(entries.tanggal, startDate));
    } else if (endDate) {
      conditions.push(lte(entries.tanggal, endDate));
    }

    if (search && search.trim() !== '') {
      conditions.push(like(entries.no_hp, `%${search.trim()}%`));
    }

    const rawEntries = await db
      .select()
      .from(entries)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(entries.id));

    const formattedEntries = rawEntries.map(formatEntryWithCalculations);

    return NextResponse.json({
      success: true,
      data: formattedEntries,
    });
  } catch (error: any) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data entri transaksi.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tanggal,
      no_hp,
      jumlah_bea_otp,
      jumlah_bea_regis,
      jumlah_omset,
    } = body;

    // Validasi input wajib
    if (!tanggal || !no_hp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tanggal dan No HP wajib diisi.',
        },
        { status: 400 }
      );
    }

    const qtyOtp = Math.max(0, parseInt(jumlah_bea_otp, 10) || 0);
    const qtyRegis = Math.max(0, parseInt(jumlah_bea_regis, 10) || 0);
    const qtyOmset = Math.max(0, parseInt(jumlah_omset, 10) || 0);

    const inserted = await db
      .insert(entries)
      .values({
        tanggal,
        sesi: 'pagi',
        no_hp: String(no_hp).trim(),
        jumlah_bea_otp: qtyOtp,
        jumlah_bea_regis: qtyRegis,
        jumlah_omset: qtyOmset,
      })
      .returning();

    const newEntry = formatEntryWithCalculations(inserted[0]);

    return NextResponse.json(
      {
        success: true,
        message: 'Transaksi berhasil disimpan.',
        data: newEntry,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyimpan transaksi baru.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
