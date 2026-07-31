"use client";

import { useState } from "react";

const WA_NUMBER = "6281234567890"; // GANTI dengan nomor WA kamu

const SERVICES = [
  {
    category: "Digital Presence",
    color: { bg: "#e0f2fe", text: "#075985" },
    items: [
      {
        title: "Landing Page",
        desc: "1 halaman fokus konversi — cocok untuk promo produk, event, atau personal branding.",
        price: "Mulai Rp400.000",
        eta: "3-5 hari",
      },
      {
        title: "Company Profile Website",
        desc: "Website multi-halaman: Beranda, Tentang, Layanan, Kontak — cocok untuk UMKM & organisasi.",
        price: "Mulai Rp1.200.000",
        eta: "7-10 hari",
      },
      {
        title: "Web App Sederhana",
        desc: "Sistem custom (pendaftaran, katalog, dashboard internal) — seperti website KATI ini sendiri.",
        price: "Mulai Rp2.500.000",
        eta: "14+ hari",
      },
    ],
  },
  {
    category: "Content & Creative",
    color: { bg: "#dcfce7", text: "#166534" },
    items: [
      {
        title: "Copywriting",
        desc: "Caption Instagram, deskripsi produk marketplace, teks iklan (paket 10 post).",
        price: "Mulai Rp150.000",
        eta: "2-3 hari",
      },
      {
        title: "Video Editing (Reels/TikTok)",
        desc: "Edit video pendek untuk konten sosial media — potong, transisi, musik, subtitle.",
        price: "Mulai Rp75.000",
        eta: "1-2 hari",
      },
      {
        title: "Video Promosi Produk",
        desc: "Video lebih kompleks untuk iklan/branding produk.",
        price: "Mulai Rp300.000",
        eta: "3-5 hari",
      },
      {
        title: "AI-Generated Content",
        desc: "Poster/visual produk menggunakan AI image generation.",
        price: "Mulai Rp50.000",
        eta: "1-2 hari",
      },
    ],
  },
];

function waLink(serviceTitle) {
  const text = encodeURIComponent(`Halo, saya tertarik dengan layanan "${serviceTitle}" dari KATI Services.`);
  return `https://wa.me/${WA_NUMBER}?text=${text}`;
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");

  const categories = ["Semua", ...SERVICES.map((s) => s.category)];
  const visibleGroups =
    activeCategory === "Semua" ? SERVICES : SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div>
      <div className="hero">
        <div className="hero-breadcrumb">Beranda / Services</div>
        <h1 className="hero-title">Services</h1>
        <p className="hero-subtitle">
          Layanan digital dari & untuk keluarga besar Teknik Industri Unand
        </p>
      </div>

      <div style={{ padding: "3rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "2.5rem" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "999px",
                border: activeCategory === cat ? "2px solid #12233f" : "1px solid #ddd",
                backgroundColor: activeCategory === cat ? "#12233f" : "#fff",
                color: activeCategory === cat ? "#fff" : "#444",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {visibleGroups.map((group) => (
          <section key={group.category} style={{ marginBottom: "3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
              <span
                style={{
                  backgroundColor: group.color.bg,
                  color: group.color.text,
                  padding: "0.3rem 0.9rem",
                  borderRadius: "999px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                {group.category}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {group.items.map((item) => (
                <ServiceCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        ))}

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 0.75rem", color: "#444" }}>
            Butuh layanan yang tidak ada di daftar? Konsultasikan langsung kebutuhanmu.
          </p>
          <a
            href={waLink("Konsultasi Layanan")}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#25D366",
              color: "#fff",
              padding: "0.7rem 1.5rem",
              borderRadius: "999px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ item }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1.25rem",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", color: "#12233f" }}>{item.title}</h3>
      <p style={{ margin: 0, fontSize: "0.87rem", color: "#555", lineHeight: 1.6, flex: 1 }}>{item.desc}</p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <div>
          <div style={{ fontSize: "0.78rem", color: "#999" }}>{item.price}</div>
          <div style={{ fontSize: "0.75rem", color: "#aaa" }}>Estimasi {item.eta}</div>
        </div>
      </div>

      <a
        href={waLink(item.title)}
        target="_blank"
        rel="noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: "1rem",
          backgroundColor: "#25D366",
          color: "#fff",
          padding: "0.6rem",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "0.88rem",
          textDecoration: "none",
        }}
      >
        Chat via WhatsApp
      </a>
    </div>
  );
}
