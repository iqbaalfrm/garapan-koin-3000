import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { qrisTumbal } from '@/db/schema';
import { or, like, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar Raw QRIS Tumbal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select().from(qrisTumbal);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      const data = await query
        .where(
          or(
            like(qrisTumbal.raw_qris, term),
            like(qrisTumbal.nama_qris, term),
            like(qrisTumbal.provider, term),
            like(qrisTumbal.catatan, term)
          )
        )
        .orderBy(desc(qrisTumbal.id));

      return NextResponse.json({
        success: true,
        data,
      });
    }

    const data = await query.orderBy(desc(qrisTumbal.id));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching Raw QRIS Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data Raw QRIS Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Tambah Raw QRIS Tumbal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_qris, nama_qris, provider, catatan, status } = body;

    if (!raw_qris || String(raw_qris).trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Kode Raw QRIS wajib diisi.',
        },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(qrisTumbal)
      .values({
        raw_qris: String(raw_qris).trim(),
        nama_qris: nama_qris ? String(nama_qris).trim() : null,
        provider: provider ? String(provider).trim() : 'ShopeePay',
        catatan: catatan ? String(catatan).trim() : null,
        status: status && ['aktif', 'penuh', 'nonaktif'].includes(status) ? status : 'aktif',
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Raw QRIS Tumbal berhasil ditambahkan.',
        data: inserted[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating Raw QRIS Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyimpan Raw QRIS Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
