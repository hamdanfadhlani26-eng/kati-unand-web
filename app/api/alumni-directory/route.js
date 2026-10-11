import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const dataFilePath = path.join(process.cwd(), 'data', 'alumni_database.json');

function readAlumniData() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading alumni database JSON:", err);
  }
  return [];
}

function writeAlumniData(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error writing alumni database JSON:", err);
    return false;
  }
}

// GET: Ambil seluruh data alumni
export async function GET() {
  try {
    // Coba ambil dari Supabase jika ada
    const { data: supaData, error: supaErr } = await supabase
      .from('alumni_database')
      .select('*')
      .order('angkatan', { ascending: false });

    if (!supaErr && supaData && supaData.length > 0) {
      return NextResponse.json({ success: true, data: supaData });
    }
  } catch (e) {
    // Supabase table not created yet, continue to JSON
  }

  const localData = readAlumniData();
  return NextResponse.json({ success: true, data: localData });
}

// POST: Tambah alumni baru
export async function POST(request) {
  try {
    const body = await request.json();
    const newEntry = {
      id: body.id || Date.now(),
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
      created_at: new Date().toISOString()
    };

    if (!newEntry.nama_lengkap) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    // 1. Simpan ke local JSON
    const localData = readAlumniData();
    localData.unshift(newEntry); // tambah ke paling atas
    writeAlumniData(localData);

    // 2. Simpan ke Supabase jika tabel tersedia
    try {
      await supabase.from('alumni_database').insert([newEntry]);
    } catch (e) {
      // Abaikan jika tabel supabase belum ada
    }

    return NextResponse.json({ success: true, data: newEntry });
  } catch (err) {
    console.error("POST alumni error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Update alumni yang sudah ada
export async function PUT(request) {
  try {
    const body = await request.json();
    const targetId = body.id;

    if (!targetId && !body.nama_lengkap) {
      return NextResponse.json({ success: false, error: 'ID atau nama alumni diperlukan' }, { status: 400 });
    }

    // 1. Update di local JSON
    const localData = readAlumniData();
    const index = localData.findIndex(a => String(a.id) === String(targetId) || (a.nama_lengkap && a.nama_lengkap.toLowerCase() === (body.old_nama || body.nama_lengkap).toLowerCase()));

    let updatedRecord = null;
    if (index !== -1) {
      localData[index] = {
        ...localData[index],
        angkatan: String(body.angkatan ?? localData[index].angkatan ?? '').trim(),
        nama_lengkap: String(body.nama_lengkap ?? localData[index].nama_lengkap ?? '').trim(),
        negara: String(body.negara ?? localData[index].negara ?? 'Indonesia').trim(),
        provinsi: String(body.provinsi ?? localData[index].provinsi ?? '').trim(),
        kota: String(body.kota ?? localData[index].kota ?? '').trim(),
        jenis_pekerjaan: String(body.jenis_pekerjaan ?? localData[index].jenis_pekerjaan ?? 'Lainnya').trim(),
        bidang_pekerjaan: String(body.bidang_pekerjaan ?? localData[index].bidang_pekerjaan ?? '').trim(),
        nama_perusahaan: String(body.nama_perusahaan ?? localData[index].nama_perusahaan ?? '').trim(),
        jabatan: String(body.jabatan ?? localData[index].jabatan ?? '').trim(),
        linkedin_url: String(body.linkedin_url ?? localData[index].linkedin_url ?? '').trim(),
        instagram_url: String(body.instagram_url ?? localData[index].instagram_url ?? '').trim(),
        email: String(body.email ?? localData[index].email ?? '').trim(),
      };
      updatedRecord = localData[index];
      writeAlumniData(localData);
    }

    // 2. Update di Supabase jika ada
    try {
      if (targetId) {
        await supabase.from('alumni_database').update(body).eq('id', targetId);
      }
    } catch (e) {
      // Abaikan jika tabel supabase belum ada
    }

    return NextResponse.json({ success: true, data: updatedRecord || body });
  } catch (err) {
    console.error("PUT alumni error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Hapus profil alumni
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const nama = searchParams.get('nama');

    if (!id && !nama) {
      return NextResponse.json({ success: false, error: 'ID atau nama alumni diperlukan' }, { status: 400 });
    }

    // 1. Hapus dari local JSON
    const localData = readAlumniData();
    const filtered = localData.filter(a => {
      if (id && String(a.id) === String(id)) return false;
      if (!id && nama && a.nama_lengkap && a.nama_lengkap.toLowerCase() === nama.toLowerCase()) return false;
      return true;
    });
    writeAlumniData(filtered);

    // 2. Hapus dari Supabase jika ada
    try {
      if (id) {
        await supabase.from('alumni_database').delete().eq('id', id);
      } else if (nama) {
        await supabase.from('alumni_database').delete().eq('nama_lengkap', nama);
      }
    } catch (e) {
      // Abaikan jika tabel supabase belum ada
    }

    return NextResponse.json({ success: true, message: 'Data alumni berhasil dihapus' });
  } catch (err) {
    console.error("DELETE alumni error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
