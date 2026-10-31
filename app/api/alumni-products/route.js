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
    console.error("Error writing alumni_products.json:", err);
    return false;
  }
}

// GET: Ambil seluruh data produk & jasa alumni
export async function GET() {
  try {
    // Coba ambil dari Supabase terlebih dahulu jika tabel sudah dibuat
    const { data: supaData, error: supaErr } = await supabase
      .from('alumni_products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!supaErr && supaData && supaData.length > 0) {
      return NextResponse.json({ success: true, data: supaData, source: 'supabase' });
    }
  } catch (e) {
    // Supabase belum siap, fallback ke local JSON
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

    const newEntry = {
      id: body.id || Date.now(),
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
      created_at: new Date().toISOString()
    };

    // Simpan ke Supabase jika ada tabel
    let supaSaved = null;
    try {
      const { data: supaRes, error: supaErr } = await supabase
        .from('alumni_products')
        .insert([{
          nama_produk: newEntry.nama_produk,
          tipe: newEntry.tipe,
          kategori: newEntry.kategori,
          nama_owner: newEntry.nama_owner,
          angkatan: newEntry.angkatan,
          deskripsi: newEntry.deskripsi,
          harga: newEntry.harga,
          lokasi: newEntry.lokasi,
          foto_url: newEntry.foto_url,
          whatsapp: newEntry.whatsapp,
          instagram: newEntry.instagram,
          website_url: newEntry.website_url,
        }])
        .select();

      if (!supaErr && supaRes && supaRes.length > 0) {
        supaSaved = supaRes[0];
      }
    } catch (e) {
      // Ignored if table not created
    }

    // Selalu simpan ke local file
    const localData = readLocalProducts();
    const itemToSave = supaSaved || newEntry;
    localData.unshift(itemToSave);
    writeLocalProducts(localData);

    return NextResponse.json({ success: true, data: itemToSave });
  } catch (err) {
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

    // Update di Supabase jika ada
    try {
      await supabase.from('alumni_products').update(updates).eq('id', id);
    } catch (e) {}

    // Update di local storage
    const localData = readLocalProducts();
    const index = localData.findIndex((item) => String(item.id) === String(id));
    if (index !== -1) {
      localData[index] = { ...localData[index], ...updates };
      writeLocalProducts(localData);
      return NextResponse.json({ success: true, data: localData[index] });
    }

    return NextResponse.json({ success: true, data: { id, ...updates } });
  } catch (err) {
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

    // Hapus di Supabase jika ada
    try {
      await supabase.from('alumni_products').delete().eq('id', id);
    } catch (e) {}

    // Hapus di local JSON
    const localData = readLocalProducts();
    const filtered = localData.filter((item) => String(item.id) !== String(id));
    writeLocalProducts(filtered);

    return NextResponse.json({ success: true, message: 'Produk berhasil dihapus' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
