"use client";

import { useState } from "react";
import { SERVICES, CATEGORIES } from "@/lib/servicesData";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = SERVICES.filter((s) => {
    const matchCat = activeCategory === "Semua" || s.category === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="hero">
        <div className="hero-breadcrumb">Beranda / Services</div>
        <h1 className="hero-title">Temukan Layanan yang Kamu Butuhkan</h1>
        <p className="hero-subtitle">
          Website, konten, hingga undangan digital — dikerjakan talenta Teknik Industri Unand
        </p>
      </div>

      <div style={{ padding: "2.5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <input
          type="text"
          placeholder="Cari layanan yang Anda butuhkan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchInput}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", margin: "1.25rem 0 2rem" }}>
          {CATEGORIES.map((cat) => (
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

        <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.25rem" }}>
          {filtered.length} layanan ditemukan
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((item) => (
            <ServiceCard key={item.slug} item={item} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: "#666", marginTop: "1rem" }}>Tidak ada layanan yang cocok dengan pencarian.</p>
        )}

        <div style={ctaBox}>
          <p style={{ margin: "0 0 0.75rem", color: "#444" }}>
            Butuh layanan yang tidak ada di daftar? Konsultasikan langsung kebutuhanmu.
          </p>
          <a href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")} target="_blank" rel="noreferrer" style={waButton}>
            Chat via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ item }) {
  return (
    <a
      href={`/services/${item.slug}`}
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "16 / 10", backgroundColor: "#e5e7eb", overflow: "hidden" }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>

      <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <span
          style={{
            alignSelf: "flex-start",
            backgroundColor: "#e0f2fe",
            color: "#075985",
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            marginBottom: "0.5rem",
          }}
        >
          {item.category}
        </span>

        <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", color: "#12233f" }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#555", lineHeight: 1.5, flex: 1 }}>{item.shortDesc}</p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "#999" }}>Mulai dari</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#12233f" }}>Rp {item.price.replace("Rp", "")}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#999" }}>⏱ {item.eta}</div>
        </div>
      </div>
    </a>
  );
}

const searchInput = {
  width: "100%",
  padding: "0.8rem 1rem",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
};

const ctaBox = {
  marginTop: "2.5rem",
  padding: "1.5rem",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  textAlign: "center",
};

const waButton = {
  display: "inline-block",
  backgroundColor: "#25D366",
  color: "#fff",
  padding: "0.7rem 1.5rem",
  borderRadius: "999px",
  fontWeight: 700,
  textDecoration: "none",
};