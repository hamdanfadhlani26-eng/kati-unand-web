"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  return (
    <div>
      <div className="hero">
        <div className="hero-breadcrumb">Beranda</div>
        <h1 className="hero-title">
          Keluarga Alumni
          <br />
          Teknik Industri
        </h1>
        <p className="hero-subtitle">Universitas Andalas</p>
      </div>

      <div style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <section style={{ marginBottom: "3rem" }}>
          <div className="eyebrow">Tentang</div>
          <h2 style={sectionTitle}>Tentang KATI</h2>
          <p style={paragraph}>
            KATI Unand adalah wadah bagi seluruh alumni Teknik Industri Universitas Andalas
            untuk saling terhubung, berbagi informasi, dan mendukung generasi penerus dalam
            memasuki dunia kerja. Melalui platform ini, alumni dan mahasiswa/fresh graduate
            dapat saling terhubung untuk pengembangan karier dan jejaring profesional.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <div className="eyebrow">Arah</div>
          <h2 style={sectionTitle}>Visi</h2>
          <p style={paragraph}>
            Menjadi wadah pemersatu dan pengembang jejaring alumni Teknik Industri Universitas
            Andalas yang solid, profesional, dan memberikan kontribusi nyata bagi almamater,
            dunia industri, dan masyarakat.
          </p>
        </section>

        <section style={{ marginBottom: "3rem" }}>
          <div className="eyebrow">Langkah</div>
          <h2 style={sectionTitle}>Misi</h2>
          <ol style={{ paddingLeft: "1.2rem", color: "#333", lineHeight: "1.9" }}>
            <li>Mempererat tali silaturahmi dan membangun jejaring antar alumni Teknik Industri Unand dari berbagai angkatan.</li>
            <li>Menjembatani hubungan antara alumni dengan mahasiswa aktif, khususnya dalam hal informasi dunia kerja dan pengembangan karier.</li>
            <li>Memfasilitasi pertukaran informasi lowongan kerja dan kebutuhan talenta antara alumni/perusahaan dengan fresh graduate.</li>
            <li>Mendukung pengembangan kompetensi anggota melalui berbagi pengalaman, mentoring, dan kolaborasi profesional.</li>
            <li>Berkontribusi aktif terhadap almamater dan program studi Teknik Industri Universitas Andalas.</li>
          </ol>
        </section>



        <section>
          <div className="eyebrow">Dokumentasi</div>
          <h2 style={sectionTitle}>Galeri</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            <div style={photoPlaceholder}>Foto 1</div>
            <div style={photoPlaceholder}>Foto 2</div>
            <div style={photoPlaceholder}>Foto 3</div>
          </div>
        </section>
      </div>

      <FeaturedAlumni />
    </div>
  );
}

/* ── FEATURED ALUMNI ── */
function FeaturedAlumni() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("alumni_profiles")
        .select("id, nama, jabatan, tempat_kerja, angkatan, foto_url")
        .order("created_at", { ascending: false })
        .limit(3);
      if (data) setList(data);
      setLoading(false);
    }
    fetch();
  }, []);

  return (
    <section style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "3.5rem 2rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div className="eyebrow">Komunitas</div>
            <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Featured Alumni</h2>
          </div>
          <a
            href="/profil-alumni"
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#12233f",
              textDecoration: "none",
              border: "1px solid #12233f",
              padding: "0.45rem 1rem",
              borderRadius: "20px",
              whiteSpace: "nowrap",
            }}
          >
            Lihat Semua →
          </a>
        </div>

        {loading ? (
          <p style={{ color: "#888" }}>Memuat data alumni...</p>
        ) : list.length === 0 ? (
          <p style={{ color: "#888" }}>Belum ada alumni yang terdaftar.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {list.map((a) => (
              <FeaturedAlumniCard key={a.id} alumni={a} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedAlumniCard({ alumni }) {
  return (
    <div
      className="tech-card"
      style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.25rem" }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          flexShrink: 0,
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: "#e5e7eb",
        }}
      >
        {alumni.foto_url ? (
          <img
            src={alumni.foto_url}
            alt={alumni.nama}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#12233f",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {alumni.nama?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#12233f", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {alumni.nama}
        </div>
        {(alumni.jabatan || alumni.tempat_kerja) && (
          <div style={{ fontSize: "0.82rem", color: "#555", marginTop: "0.1rem" }}>
            {alumni.jabatan}{alumni.jabatan && alumni.tempat_kerja ? " · " : ""}{alumni.tempat_kerja}
          </div>
        )}
        {alumni.angkatan && (
          <div className="eyebrow" style={{ marginTop: "0.4rem" }}>
            Angkatan {alumni.angkatan}
          </div>
        )}
      </div>
    </div>
  );
}





const sectionTitle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginTop: "0.4rem",
  marginBottom: "1rem",
  color: "#12233f",
};

const paragraph = {
  fontSize: "1rem",
  lineHeight: "1.7",
  color: "#333",
};

const photoPlaceholder = {
  height: "150px",
  backgroundColor: "#f3f4f6",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  fontSize: "0.9rem",
};