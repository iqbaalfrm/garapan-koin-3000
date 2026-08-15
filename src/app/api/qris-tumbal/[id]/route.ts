import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { qrisTumbal } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PUT: Edit Raw QRIS Tumbal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID QRIS tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { raw_qris, nama_qris, provider, catatan, status } = body;

    if (!raw_qris || String(raw_qris).trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Kode Raw QRIS wajib diisi.' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(qrisTumbal)
      .set({
        raw_qris: String(raw_qris).trim(),
        nama_qris: nama_qris ? String(nama_qris).trim() : null,
        provider: provider ? String(provider).trim() : 'ShopeePay',
        catatan: catatan ? String(catatan).trim() : null,
        status: status && ['aktif', 'penuh', 'nonaktif'].includes(status) ? status : 'aktif',
      })
      .where(eq(qrisTumbal.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data QRIS tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data Raw QRIS Tumbal berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error: any) {
    console.error('Error updating Raw QRIS Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengupdate Raw QRIS Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Raw QRIS Tumbal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID QRIS tidak valid.' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(qrisTumbal)
      .where(eq(qrisTumbal.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data QRIS tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Raw QRIS Tumbal berhasil dihapus.',
      data: deleted[0],
    });
  } catch (error: any) {
    console.error('Error deleting Raw QRIS Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus Raw QRIS Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
