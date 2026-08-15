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

    const existing = await db.select().from(qrisTumbal).where(eq(qrisTumbal.id, id));
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data QRIS tidak ditemukan.' },
        { status: 404 }
      );
    }

    const currentData = existing[0];
    const newRawQris = raw_qris !== undefined && String(raw_qris).trim() !== '' ? String(raw_qris).trim() : currentData.raw_qris;
    const newStatus = status && ['aktif', 'terpakai', 'penuh', 'nonaktif'].includes(status) ? status : currentData.status;
    const newNamaQris = nama_qris !== undefined ? (nama_qris ? String(nama_qris).trim() : null) : currentData.nama_qris;
    const newProvider = provider !== undefined ? (provider ? String(provider).trim() : 'ShopeePay') : currentData.provider;
    const newCatatan = catatan !== undefined ? (catatan ? String(catatan).trim() : null) : currentData.catatan;

    const updated = await db
      .update(qrisTumbal)
      .set({
        raw_qris: newRawQris,
        nama_qris: newNamaQris,
        provider: newProvider,
        catatan: newCatatan,
        status: newStatus,
      })
      .where(eq(qrisTumbal.id, id))
      .returning();


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
