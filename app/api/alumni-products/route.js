import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

const dataFilePath = path.join(process.cwd(), 'data', 'alumni_products.json');

function readLocalProducts() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading alumni_products.json:", err);
  }
  return [];
}

function writeLocalProducts(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    // Expected on Vercel (read-only filesystem)
    return false;
  }
}

// GET: Ambil seluruh data produk & jasa alumni
export async function GET() {
  try {
    const { data: supaData, error: supaErr } = await supabase
      .from('alumni_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!supaErr && supaData && supaData.length > 0) {
      return NextResponse.json({ success: true, data: supaData, source: 'supabase' });
    }
  } catch (e) {
    console.warn("Supabase fetch products error, fallback to local:", e);
  }

  const localData = readLocalProducts();
  return NextResponse.json({ success: true, data: localData, source: 'local' });
}

// POST: Tambah produk baru
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nama_produk || !String(body.nama_produk).trim()) {
      return NextResponse.json({ success: false, message: 'Nama produk wajib diisi' }, { status: 400 });
    }

    const payload = {
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

    let supaSaved = null;
    try {
      const { data: supaRes, error: supaErr } = await supabase
        .from('alumni_products')
        .insert([payload])
        .select();

      if (!supaErr && supaRes && supaRes.length > 0) {
        supaSaved = supaRes[0];
      } else if (supaErr) {
        console.error("Supabase insert product error:", supaErr);
      }
    } catch (e) {
      console.error("Supabase insert product exception:", e);
    }

    const itemToSave = supaSaved || { id: Date.now(), ...payload, created_at: new Date().toISOString() };

    // Fallback simpan ke local file jika bisa (e.g. dev environment)
    const localData = readLocalProducts();
    localData.unshift(itemToSave);
    writeLocalProducts(localData);

    return NextResponse.json({ success: true, data: itemToSave });
  } catch (err) {
    console.error("POST product error:", err);
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

    const updates = {};
    const allowedFields = [
      'nama_produk', 'tipe', 'kategori', 'nama_owner', 'angkatan',
      'deskripsi', 'harga', 'lokasi', 'foto_url', 'whatsapp',
      'instagram', 'website_url'
    ];
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = String(body[key] ?? '').trim();
      }
    }

    let supaUpdated = null;
    try {
      const { data, error } = await supabase
        .from('alumni_products')
        .update(updates)
        .eq('id', id)
        .select();

      if (!error && data && data.length > 0) {
        supaUpdated = data[0];
      } else if (error) {
        console.error("Supabase update product error:", error);
      }
    } catch (e) {
      console.error("Supabase update product exception:", e);
    }

    // Update di local storage jika bisa
    const localData = readLocalProducts();
    const index = localData.findIndex((item) => String(item.id) === String(id));
    let localUpdated = null;
    if (index !== -1) {
      localData[index] = { ...localData[index], ...updates };
      localUpdated = localData[index];
      writeLocalProducts(localData);
    }

    const result = supaUpdated || localUpdated || { id, ...updates };
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("PUT product error:", err);
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

    // 1. Hapus di Supabase
    try {
      const { error } = await supabase.from('alumni_products').delete().eq('id', id);
      if (error) console.error("Supabase delete product error:", error);
    } catch (e) {
      console.error("Supabase delete product exception:", e);
    }

    // 2. Hapus di local JSON jika bisa
    const localData = readLocalProducts();
    const filtered = localData.filter((item) => String(item.id) !== String(id));
    writeLocalProducts(filtered);

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
