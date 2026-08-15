import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { qrisTumbal } from '@/db/schema';

export const dynamic = 'force-dynamic';

// POST /api/qris-tumbal/bulk: Upload / Import Massal Kode Raw QRIS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Daftar item QRIS massal tidak boleh kosong.',
        },
        { status: 400 }
      );
    }

    // Clean & filter valid QRIS strings
    const validItems = items
      .map((str: any) => String(str).trim())
      .filter((str: string) => str.length >= 20);

    if (validItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tidak ada kode Raw QRIS valid yang ditemukan.',
        },
        { status: 400 }
      );
    }

    const recordsToInsert = validItems.map((qrisStr: string) => ({
      raw_qris: qrisStr,
      provider: 'ShopeePay',
      status: 'aktif' as const,
    }));

    const inserted = await db.insert(qrisTumbal).values(recordsToInsert).returning();

    return NextResponse.json(
      {
        success: true,
        message: `Berhasil mengimport ${inserted.length} Raw QRIS Tumbal secara massal.`,
        count: inserted.length,
        data: inserted,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error bulk inserting Raw QRIS:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengimport Raw QRIS secara massal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
