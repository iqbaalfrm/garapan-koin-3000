import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { entries } from '@/db/schema';
import { calculateTransaction } from '@/utils/calculations';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function formatEntryWithCalculations(entry: any) {
  const calc = calculateTransaction(
    entry.jumlah_bea_otp,
    entry.jumlah_bea_regis,
    entry.jumlah_bea_topup,
    entry.jumlah_omset
  );

  return {
    ...entry,
    bea_otp_rp: calc.beaOtpRp,
    bea_regis_rp: calc.beaRegisRp,
    bea_topup_rp: calc.beaTopupRp,
    omset_rp: calc.omsetRp,
    bersih_rp: calc.bersihRp,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = parseInt(params.id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json(
        { success: false, error: 'ID transaksi tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      tanggal,
      no_hp,
      jumlah_bea_otp,
      jumlah_bea_regis,
      jumlah_bea_topup,
      jumlah_omset,
    } = body;

    if (!tanggal || !no_hp) {
      return NextResponse.json(
        { success: false, error: 'Tanggal dan No HP wajib diisi.' },
        { status: 400 }
      );
    }

    const qtyOtp = Math.max(0, parseInt(jumlah_bea_otp, 10) || 0);
    const qtyRegis = Math.max(0, parseInt(jumlah_bea_regis, 10) || 0);
    const qtyTopup = Math.max(0, parseInt(jumlah_bea_topup, 10) || 0);
    const qtyOmset = Math.max(0, parseInt(jumlah_omset, 10) || 0);

    const updated = await db
      .update(entries)
      .set({
        tanggal,
        no_hp: String(no_hp).trim(),
        jumlah_bea_otp: qtyOtp,
        jumlah_bea_regis: qtyRegis,
        jumlah_bea_topup: qtyTopup,
        jumlah_omset: qtyOmset,
      })
      .where(eq(entries.id, entryId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data transaksi tidak ditemukan.' },
        { status: 404 }
      );
    }

    const updatedEntry = formatEntryWithCalculations(updated[0]);

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diperbarui.',
      data: updatedEntry,
    });
  } catch (error: any) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memperbarui transaksi.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryId = parseInt(params.id, 10);
    if (isNaN(entryId)) {
      return NextResponse.json(
        { success: false, error: 'ID transaksi tidak valid.' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(entries)
      .where(eq(entries.id, entryId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data transaksi tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus.',
      data: { id: entryId },
    });
  } catch (error: any) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus transaksi.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
