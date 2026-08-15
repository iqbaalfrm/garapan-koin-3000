import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vaTumbal } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// PUT: Edit VA Tumbal
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID VA tidak valid.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nomor_va, bank, label, catatan, status } = body;

    if (!nomor_va || String(nomor_va).trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Nomor Virtual Account (VA) wajib diisi.' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(vaTumbal)
      .set({
        nomor_va: String(nomor_va).trim(),
        bank: bank ? String(bank).trim() : 'SeaBank',
        label: label ? String(label).trim() : null,
        catatan: catatan ? String(catatan).trim() : null,
        status: status && ['aktif', 'penuh', 'nonaktif'].includes(status) ? status : 'aktif',
      })
      .where(eq(vaTumbal.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data VA tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data VA Tumbal berhasil diperbarui.',
      data: updated[0],
    });
  } catch (error: any) {
    console.error('Error updating VA Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal mengupdate Virtual Account Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus VA Tumbal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID VA tidak valid.' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(vaTumbal)
      .where(eq(vaTumbal.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data VA tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nomor VA Tumbal berhasil dihapus.',
      data: deleted[0],
    });
  } catch (error: any) {
    console.error('Error deleting VA Tumbal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal menghapus Virtual Account Tumbal.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
