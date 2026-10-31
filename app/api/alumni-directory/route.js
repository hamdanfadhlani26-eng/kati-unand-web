import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Ambil seluruh data alumni
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('alumni_database')
      .select('*')
      .order('angkatan', { ascending: false });

    if (error) {
      console.error('GET alumni_database error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('GET alumni_database exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Tambah alumni baru
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nama_lengkap || !String(body.nama_lengkap).trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    const newEntry = {
      angkatan: String(body.angkatan || '').trim(),
      nama_lengkap: String(body.nama_lengkap || '').trim(),
      negara: String(body.negara || 'Indonesia').trim(),
      provinsi: String(body.provinsi || '').trim(),
      kota: String(body.kota || '').trim(),
      jenis_pekerjaan: String(body.jenis_pekerjaan || 'Lainnya').trim(),
      bidang_pekerjaan: String(body.bidang_pekerjaan || '').trim(),
      nama_perusahaan: String(body.nama_perusahaan || '').trim(),
      jabatan: String(body.jabatan || '').trim(),
      linkedin_url: String(body.linkedin_url || '').trim(),
      instagram_url: String(body.instagram_url || '').trim(),
      email: String(body.email || '').trim(),
    };

    const { data, error } = await supabase
      .from('alumni_database')
      .insert([newEntry])
      .select();

    if (error) {
      console.error('POST alumni_database error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data[0] });
  } catch (err) {
    console.error('POST alumni_database exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update alumni yang sudah ada
export async function PUT(request) {
  try {
    const body = await request.json();
    const targetId = body.id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'ID alumni diperlukan' }, { status: 400 });
    }

    const updates = {
      angkatan: String(body.angkatan || '').trim(),
      nama_lengkap: String(body.nama_lengkap || '').trim(),
      negara: String(body.negara || 'Indonesia').trim(),
      provinsi: String(body.provinsi || '').trim(),
      kota: String(body.kota || '').trim(),
      jenis_pekerjaan: String(body.jenis_pekerjaan || 'Lainnya').trim(),
      bidang_pekerjaan: String(body.bidang_pekerjaan || '').trim(),
      nama_perusahaan: String(body.nama_perusahaan || '').trim(),
      jabatan: String(body.jabatan || '').trim(),
      linkedin_url: String(body.linkedin_url || '').trim(),
      instagram_url: String(body.instagram_url || '').trim(),
      email: String(body.email || '').trim(),
    };

    const { data, error } = await supabase
      .from('alumni_database')
      .update(updates)
      .eq('id', targetId)
      .select();

    if (error) {
      console.error('PUT alumni_database error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data?.[0] || { id: targetId, ...updates } });
  } catch (err) {
    console.error('PUT alumni_database exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus profil alumni
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID alumni diperlukan' }, { status: 400 });
    }

    const { error } = await supabase
      .from('alumni_database')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE alumni_database error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Data alumni berhasil dihapus' });
  } catch (err) {
    console.error('DELETE alumni_database exception:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
