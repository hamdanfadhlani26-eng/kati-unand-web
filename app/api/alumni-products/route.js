import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Ambil seluruh data produk & jasa alumni
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('alumni_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET alumni_products error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [], source: 'supabase' });
  } catch (err) {
    console.error('GET alumni_products exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Tambah produk baru
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nama_produk || !String(body.nama_produk).trim()) {
      return NextResponse.json({ success: false, message: 'Nama produk wajib diisi' }, { status: 400 });
    }

    const newEntry = {
      nama_produk: String(body.nama_produk || '').trim(),
      tipe: String(body.tipe || 'Produk').trim(),
      kategori: String(body.kategori || 'Lainnya').trim(),
      nama_owner: String(body.nama_owner || '').trim(),
      angkatan: String(body.angkatan || '').trim(),
      deskripsi: String(body.deskripsi || '').trim(),
      harga: String(body.harga || '').trim(),
      lokasi: String(body.lokasi || '').trim(),
      foto_url: String(body.foto_url || '').trim(),
      whatsapp: String(body.whatsapp || '').trim(),
      instagram: String(body.instagram || '').trim(),
      website_url: String(body.website_url || '').trim(),
    };

    const { data, error } = await supabase
      .from('alumni_products')
      .insert([newEntry])
      .select();

    if (error) {
      console.error('POST alumni_products error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('POST alumni_products exception:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// PUT: Perbarui data produk
export async function PUT(request) {
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID produk dibutuhkan' }, { status: 400 });
    }

    const updates = {
      nama_produk: String(body.nama_produk || '').trim(),
      tipe: String(body.tipe || 'Produk').trim(),
      kategori: String(body.kategori || 'Lainnya').trim(),
      nama_owner: String(body.nama_owner || '').trim(),
      angkatan: String(body.angkatan || '').trim(),
      deskripsi: String(body.deskripsi || '').trim(),
      harga: String(body.harga || '').trim(),
      lokasi: String(body.lokasi || '').trim(),
      foto_url: String(body.foto_url || '').trim(),
      whatsapp: String(body.whatsapp || '').trim(),
      instagram: String(body.instagram || '').trim(),
      website_url: String(body.website_url || '').trim(),
    };

    const { data, error } = await supabase
      .from('alumni_products')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('PUT alumni_products error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data?.[0] || { id, ...updates } });
  } catch (err) {
    console.error('PUT alumni_products exception:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// DELETE: Hapus data produk
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID dibutuhkan' }, { status: 400 });
    }

    const { error } = await supabase
      .from('alumni_products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE alumni_products error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error('DELETE alumni_products exception:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
