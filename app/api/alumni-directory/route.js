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
    // Expected on Vercel (read-only filesystem)
    return false;
  }
}

// GET: Ambil seluruh data alumni
export async function GET() {
  try {
    const { data: supaData, error: supaErr } = await supabase
      .from('alumni_database')
      .select('*')
      .order('angkatan', { ascending: false });

    if (!supaErr && supaData && supaData.length > 0) {
      return NextResponse.json({ success: true, data: supaData, source: 'supabase' });
    }
  } catch (e) {
    console.warn("Supabase fetch failed, falling back to local JSON:", e);
  }

  const localData = readAlumniData();
  return NextResponse.json({ success: true, data: localData, source: 'local' });
}

// POST: Tambah alumni baru
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nama_lengkap || !String(body.nama_lengkap).trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }

    const insertData = {
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

    let savedEntry = null;

    // 1. Simpan ke Supabase sebagai primary source
    try {
      const { data: supaRes, error: supaErr } = await supabase
        .from('alumni_database')
        .insert([insertData])
        .select();

      if (!supaErr && supaRes && supaRes.length > 0) {
        savedEntry = supaRes[0];
      } else if (supaErr) {
        console.error("Supabase insert error:", supaErr);
      }
    } catch (e) {
      console.error("Supabase insert exception:", e);
    }

    const finalItem = savedEntry || { id: Date.now(), ...insertData, created_at: new Date().toISOString() };

    // 2. Fallback update local JSON jika bisa ditulis (misal di localhost)
    const localData = readAlumniData();
    localData.unshift(finalItem);
    writeAlumniData(localData);

    return NextResponse.json({ success: true, data: finalItem });
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

    // Bangun payload update tanpa kolom 'id' dan 'created_at' (Postgres melarang update identity column)
    const updateData = {};
    const allowedFields = [
      'angkatan', 'nama_lengkap', 'negara', 'provinsi', 'kota',
      'jenis_pekerjaan', 'bidang_pekerjaan', 'nama_perusahaan',
      'jabatan', 'linkedin_url', 'instagram_url', 'email'
    ];
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = String(body[key] ?? '').trim();
      }
    }

    let supaUpdated = null;

    // 1. Update ke Supabase
    try {
      if (targetId) {
        const { data, error } = await supabase
          .from('alumni_database')
          .update(updateData)
          .eq('id', targetId)
          .select();

        if (!error && data && data.length > 0) {
          supaUpdated = data[0];
        } else if (error) {
          console.error("Supabase update error by ID:", error);
        }
      }

      // Jika gagal by ID atau tidak ada ID, coba by nama
      if (!supaUpdated && (body.old_nama || body.nama_lengkap)) {
        const searchName = body.old_nama || body.nama_lengkap;
        const { data, error } = await supabase
          .from('alumni_database')
          .update(updateData)
          .eq('nama_lengkap', searchName)
          .select();

        if (!error && data && data.length > 0) {
          supaUpdated = data[0];
        }
      }
    } catch (e) {
      console.error("Supabase update exception:", e);
    }

    // 2. Fallback update local JSON jika bisa ditulis (misal di localhost)
    const localData = readAlumniData();
    const index = localData.findIndex(a =>
      (targetId && String(a.id) === String(targetId)) ||
      (a.nama_lengkap && a.nama_lengkap.toLowerCase() === (body.old_nama || body.nama_lengkap || '').toLowerCase())
    );

    let localUpdated = null;
    if (index !== -1) {
      localData[index] = { ...localData[index], ...updateData };
      localUpdated = localData[index];
      writeAlumniData(localData);
    }

    const result = supaUpdated || localUpdated || { id: targetId, ...updateData };
    return NextResponse.json({ success: true, data: result });
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

    // 1. Hapus di Supabase
    try {
      if (id) {
        const { error } = await supabase.from('alumni_database').delete().eq('id', id);
        if (error) console.error("Supabase delete by ID error:", error);
      } else if (nama) {
        const { error } = await supabase.from('alumni_database').delete().eq('nama_lengkap', nama);
        if (error) console.error("Supabase delete by name error:", error);
      }
    } catch (e) {
      console.error("Supabase delete exception:", e);
    }

    // 2. Hapus di local JSON jika bisa
    const localData = readAlumniData();
    const filtered = localData.filter(a => {
      if (id && String(a.id) === String(id)) return false;
      if (!id && nama && a.nama_lengkap && a.nama_lengkap.toLowerCase() === nama.toLowerCase()) return false;
      return true;
    });
    writeAlumniData(filtered);

    return NextResponse.json({ success: true, message: 'Data alumni berhasil dihapus' });
  } catch (err) {
    console.error("DELETE alumni error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
