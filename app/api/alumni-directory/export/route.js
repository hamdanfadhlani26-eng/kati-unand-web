import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    let alumniList = [];

    // 1. Coba ambil data terbaru dari Supabase
    try {
      const { data, error } = await supabase
        .from('alumni_database')
        .select('*')
        .order('angkatan', { ascending: false });

      if (!error && data && data.length > 0) {
        alumniList = data;
      }
    } catch (e) {
      console.warn("Supabase export fetch failed:", e);
    }

    // 2. Fallback ke local JSON jika Supabase tidak tersedia
    if (alumniList.length === 0) {
      const localFilePath = path.join(process.cwd(), 'data', 'alumni_database.json');
      if (fs.existsSync(localFilePath)) {
        alumniList = JSON.parse(fs.readFileSync(localFilePath, 'utf8'));
      }
    }

    const headers = [
      "No",
      "Angkatan",
      "Nama Lengkap",
      "Negara",
      "Provinsi",
      "Kota",
      "Jenis Pekerjaan",
      "Bidang Pekerjaan",
      "Nama Perusahaan",
      "Jabatan",
      "LinkedIn URL",
      "Instagram URL",
      "Email"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = alumniList.map((item, idx) => [
      idx + 1,
      escapeCsv(item.angkatan),
      escapeCsv(item.nama_lengkap),
      escapeCsv(item.negara || "Indonesia"),
      escapeCsv(item.provinsi),
      escapeCsv(item.kota),
      escapeCsv(item.jenis_pekerjaan),
      escapeCsv(item.bidang_pekerjaan),
      escapeCsv(item.nama_perusahaan),
      escapeCsv(item.jabatan),
      escapeCsv(item.linkedin_url),
      escapeCsv(item.instagram_url),
      escapeCsv(item.email)
    ]);

    // UTF-8 BOM agar Excel membukanya dengan rapi dan karakter terbaca sempurna
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `Database_Alumni_Alumnova_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
