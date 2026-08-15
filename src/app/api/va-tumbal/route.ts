import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vaTumbal } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar VA Tumbal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select().from(vaTumbal);

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      const data = await query
        .where(
          or(
            like(vaTumbal.nomor_va, term),
            like(vaTumbal.label, term),
            like(vaTumbal.bank, term),
            like(vaTumbal.catatan, term)
          )
        )
        .orderBy(desc(vaTumbal.id));

      return NextResponse.json({
        success: true,
        data,
      });
    }

    const data = await query.orderBy(desc(vaTumbal.id));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching VA Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengambil data Virtual Account Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Tambah VA Tumbal baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nomor_va, bank, label, catatan, status } = body;

    if (!nomor_va || String(nomor_va).trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Nomor Virtual Account (VA) wajib diisi.',
        },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(vaTumbal)
      .values({
        nomor_va: String(nomor_va).trim(),
        bank: bank ? String(bank).trim() : 'SeaBank',
        label: label ? String(label).trim() : null,
        catatan: catatan ? String(catatan).trim() : null,
        status: status && ['aktif', 'penuh', 'nonaktif'].includes(status) ? status : 'aktif',
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'Nomor VA Tumbal berhasil ditambahkan.',
        data: inserted[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating VA Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menyimpan Virtual Account Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
