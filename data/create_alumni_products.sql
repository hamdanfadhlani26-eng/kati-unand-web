-- ==============================================================================
-- Script Pembuatan Tabel Produk & Jasa Alumni (alumni_products)
-- Jalankan skrip ini di Supabase SQL Editor:
-- Dashboard Supabase -> Project KATI Unand -> SQL Editor -> New Query -> Run
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.alumni_products (
  id bigint generated always as identity primary key,
  nama_produk text not null,
  tipe text default 'Produk', -- 'Produk' atau 'Jasa'
  kategori text default 'Lainnya',
  nama_owner text,
  angkatan text,
  deskripsi text,
  harga text,
  lokasi text,
  foto_url text,
  whatsapp text,
  instagram text,
  website_url text,
  created_at timestamptz default now()
);

-- Nonaktifkan RLS agar dapat dibaca dan dikelola langsung oleh website
ALTER TABLE public.alumni_products DISABLE ROW LEVEL SECURITY;

-- Berikan izin SELECT, INSERT, UPDATE, DELETE untuk role anon dan authenticated
GRANT ALL ON TABLE public.alumni_products TO anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.alumni_products_id_seq TO anon, authenticated, service_role;
