"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WA_ADMIN = "6281261739191";

const KATEGORI_LIST = [
  "Semua",
  "F&B / Kuliner",
  "Jasa & Konsultasi",
  "Fashion & Apparel",
  "Teknologi & Digital",
  "Manufaktur & Kerajinan",
  "Agribisnis",
  "Lainnya",
];

const TIPE_LIST = ["Semua Tipe", "Produk", "Jasa"];

export default function ProdukAlumniPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("Semua");
  const [selectedTipe, setSelectedTipe] = useState("Semua Tipe");
  const [activeModal, setActiveModal] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/alumni-products");
        const json = await res.json();
        if (json.success && json.data) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat produk alumni:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter logic
  const filteredProducts = products.filter((item) => {
    const matchSearch =
      !search ||
      item.nama_produk?.toLowerCase().includes(search.toLowerCase()) ||
      item.nama_owner?.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(search.toLowerCase());

    const matchKategori =
      selectedKategori === "Semua" || item.kategori === selectedKategori;

    const matchTipe =
      selectedTipe === "Semua Tipe" || item.tipe === selectedTipe;

    return matchSearch && matchKategori && matchTipe;
  });

  function getWhatsAppUrl(phone, productName, ownerName) {
    const cleanPhone = (phone || WA_ADMIN).replace(/[^0-9]/g, "");
    const targetPhone = cleanPhone.startsWith("0")
      ? "62" + cleanPhone.slice(1)
      : cleanPhone;

    const text = `Halo ${ownerName ? `Kak ${ownerName}` : "Admin"}, saya melihat produk/jasa "${productName}" di platform Alumnova KATI UNAND. Boleh minta info lebih lanjut atau cara pemesanannya?`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  }

  function handleShare(product) {
    if (navigator.clipboard) {
      const url = typeof window !== "undefined" ? window.location.href : "";
      navigator.clipboard.writeText(
        `Lihat "${product.nama_produk}" oleh ${product.nama_owner} di Alumnova KATI UNAND: ${url}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1120", color: "#f8fafc" }}>
      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          paddingTop: "7.5rem",
          paddingBottom: "4rem",
          background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.22), transparent 75%), #0b1120",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1, textAlign: "center" }}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#60a5fa",
              padding: "0.4rem 1rem",
              borderRadius: "999px",
              fontSize: "0.82rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: "1.25rem",
            }}
          >
            <span>🛍️</span> Etalase Bisnis & Karya Alumni KATI UNAND
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 1.25rem",
              color: "#f8fafc",
            }}
          >
            Katalog Produk &amp; Layanan{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Karya Alumni
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "#94a3b8",
              maxWidth: "760px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            Dukung pertumbuhan usaha, inovasi mandiri, dan jasa profesional sesama alumni Teknik Industri Universitas Andalas. Dari alumni, oleh alumni, untuk kemajuan bersama.
          </motion.p>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
              marginTop: "1.5rem",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>📦</span>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                <strong style={{ color: "#38bdf8" }}>{products.length}</strong> Unit Usaha Terdaftar
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🤝</span>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                Hubungi Langsung <strong style={{ color: "#4ade80" }}>Pemilik Alumni</strong>
              </span>
            </div>
            <a
              href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Alumnova, saya alumni KATI UNAND dan ingin mendaftarkan produk/jasa saya di website Alumnova.")}`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                padding: "0.6rem 1.25rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              }}
            >
              <span>＋</span> Daftarkan Usaha Anda
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER & CONTROLS SECTION ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 1.5rem 1rem" }}>
        {/* Search bar & Type pills */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "1rem",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {/* Search Input */}
          <div style={{ position: "relative", flex: "1 1 300px", minWidth: "260px" }}>
            <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b", fontSize: "1rem" }}>
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk, jasa, nama alumni, atau kota..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.75rem",
                background: "#131c31",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "#f8fafc",
                fontSize: "0.92rem",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Tipe Selector (Semua / Produk / Jasa) */}
          <div style={{ display: "flex", gap: "0.4rem", background: "#131c31", padding: "0.3rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
            {TIPE_LIST.map((tipe) => {
              const active = selectedTipe === tipe;
              return (
                <button
                  key={tipe}
                  onClick={() => setSelectedTipe(tipe)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: active ? "#2563eb" : "transparent",
                    color: active ? "#fff" : "#94a3b8",
                  }}
                >
                  {tipe}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kategori Horizontal Scrollable Pills */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.75rem",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="kategori-pills-container"
        >
          {KATEGORI_LIST.map((kat) => {
            const active = selectedKategori === kat;
            return (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                style={{
                  padding: "0.45rem 1rem",
                  borderRadius: "999px",
                  border: `1px solid ${active ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
                  background: active ? "rgba(59,130,246,0.18)" : "#131c31",
                  color: active ? "#60a5fa" : "#94a3b8",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {kat}
              </button>
            );
          })}
        </div>

        {/* Results Counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Menampilkan <strong style={{ color: "#e2e8f0" }}>{filteredProducts.length}</strong> produk / jasa
          </span>
          {(search || selectedKategori !== "Semua" || selectedTipe !== "Semua Tipe") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedKategori("Semua");
                setSelectedTipe("Semua Tipe");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                fontSize: "0.82rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: "380px",
                  background: "#131c31",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animation: "pulse 1.5s infinite ease-in-out",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1.5rem",
              background: "#131c31",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontSize: "1.25rem", color: "#f8fafc", margin: "0 0 0.5rem", fontWeight: 700 }}>
              Tidak Ada Produk yang Cocok
            </h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
              Coba gunakan kata kunci pencarian yang berbeda atau ubah pilihan kategori dan tipe.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setSelectedKategori("Semua");
                setSelectedTipe("Semua Tipe");
              }}
              style={{
                padding: "0.6rem 1.25rem",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Lihat Semua Produk
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredProducts.map((item, idx) => (
              <ProductCard
                key={item.id || idx}
                product={item}
                onOpenModal={() => setActiveModal(item)}
                getWhatsAppUrl={getWhatsAppUrl}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA REGISTRATION BANNER ── */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 5rem" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(15,23,42,0.85) 100%)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "24px",
            padding: "3rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 48px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <span style={{ fontSize: "2.5rem", display: "inline-block", marginBottom: "0.75rem" }}>🚀</span>
            <h2 style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.1rem)", fontWeight: 800, margin: "0 0 1rem", color: "#f8fafc" }}>
              Punya Usaha, Produk, atau Jasa Sendiri?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 2rem" }}>
              Daftarkan produk dan layanan bisnis Anda ke katalog resmi Alumnova KATI UNAND. Dapatkan eksposur langsung ke jejaring ribuan alumni dan mahasiswa Teknik Industri.
            </p>
            <a
              href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Alumnova, saya alumni KATI UNAND dan ingin mendaftarkan produk/jasa saya di website Alumnova.")}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.9rem 2rem",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "0.98rem",
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <span>💬</span> Hubungi Admin untuk Pendaftaran
            </a>
          </div>
        </div>
      </section>

      {/* ── MODAL DETAIL PRODUK ── */}
      <AnimatePresence>
        {activeModal && (
          <div
            onClick={() => setActiveModal(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(3,7,18,0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "#101827",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "20px",
                maxWidth: "620px",
                width: "100%",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              {/* Modal Header Bar with Close Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span
                    style={{
                      background: activeModal.tipe === "Jasa" ? "rgba(168,85,247,0.15)" : "rgba(37,99,235,0.15)",
                      color: activeModal.tipe === "Jasa" ? "#c084fc" : "#60a5fa",
                      border: `1px solid ${activeModal.tipe === "Jasa" ? "rgba(168,85,247,0.3)" : "rgba(37,99,235,0.3)"}`,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px",
                    }}
                  >
                    {activeModal.tipe || "Produk"}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#94a3b8" }}>{activeModal.kategori}</span>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    color: "#94a3b8",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div style={{ overflowY: "auto", padding: "1.5rem" }}>
                {/* Photo */}
                <div
                  style={{
                    width: "100%",
                    height: "260px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    marginBottom: "1.25rem",
                    background: "#1e293b",
                    position: "relative",
                  }}
                >
                  {activeModal.foto_url ? (
                    <img
                      src={activeModal.foto_url}
                      alt={activeModal.nama_produk}
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
                        flexDirection: "column",
                        gap: "0.5rem",
                        color: "#64748b",
                      }}
                    >
                      <span style={{ fontSize: "3rem" }}>🛍️</span>
                      <span style={{ fontSize: "0.85rem" }}>Belum ada foto</span>
                    </div>
                  )}
                </div>

                {/* Title & Price */}
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#f8fafc", margin: "0 0 0.5rem", lineHeight: 1.3 }}>
                  {activeModal.nama_produk}
                </h2>

                {activeModal.harga && (
                  <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#38bdf8", marginBottom: "1rem" }}>
                    {activeModal.harga}
                  </div>
                )}

                {/* Owner info card */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    padding: "0.9rem 1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {activeModal.nama_owner ? activeModal.nama_owner.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: "0.95rem" }}>
                        {activeModal.nama_owner || "Alumni KATI Unand"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        {activeModal.angkatan ? `Alumni TI ${activeModal.angkatan}` : "Alumni TI Unand"}
                      </div>
                    </div>
                  </div>

                  {activeModal.lokasi && (
                    <div style={{ fontSize: "0.82rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <span>📍</span> {activeModal.lokasi}
                    </div>
                  )}
                </div>

                {/* Deskripsi */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", margin: "0 0 0.5rem", fontWeight: 700 }}>
                    Deskripsi Produk / Jasa
                  </h4>
                  <p style={{ color: "#cbd5e1", fontSize: "0.92rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
                    {activeModal.deskripsi || "Tidak ada deskripsi detail untuk produk ini."}
                  </p>
                </div>

                {/* Additional Links (Instagram / Website) */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {activeModal.instagram && (
                    <a
                      href={
                        activeModal.instagram.startsWith("http")
                          ? activeModal.instagram
                          : `https://instagram.com/${activeModal.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        background: "rgba(236,72,153,0.12)",
                        border: "1px solid rgba(236,72,153,0.3)",
                        color: "#f472b6",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <span>📸</span> Instagram
                    </a>
                  )}

                  {activeModal.website_url && (
                    <a
                      href={activeModal.website_url.startsWith("http") ? activeModal.website_url : `https://${activeModal.website_url}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.45rem 0.9rem",
                        borderRadius: "8px",
                        background: "rgba(59,130,246,0.12)",
                        border: "1px solid rgba(59,130,246,0.3)",
                        color: "#60a5fa",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <span>🌐</span> Kunjungi Website
                    </a>
                  )}

                  <button
                    onClick={() => handleShare(activeModal)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#cbd5e1",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <span>🔗</span> {copied ? "Tautan Tersalin!" : "Bagikan"}
                  </button>
                </div>

                {/* Primary Contact Action */}
                <a
                  href={getWhatsAppUrl(activeModal.whatsapp, activeModal.nama_produk, activeModal.nama_owner)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    padding: "0.9rem",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    boxShadow: "0 6px 20px rgba(22,163,74,0.35)",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>💬</span> Chat Pemilik via WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .kategori-pills-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// ── PRODUCT CARD COMPONENT ──
function ProductCard({ product, onOpenModal, getWhatsAppUrl }) {
  const isJasa = product.tipe === "Jasa";

  return (
    <div
      style={{
        background: "#101827",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        cursor: "pointer",
      }}
      onClick={onOpenModal}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(59,130,246,0.35)";
        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image Container with Badges */}
      <div
        style={{
          width: "100%",
          height: "190px",
          background: "#1e293b",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.foto_url ? (
          <img
            src={product.foto_url}
            alt={product.nama_produk}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.4rem",
              color: "#64748b",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🛍️</span>
          </div>
        )}

        {/* Tipe Badge */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            background: isJasa ? "rgba(147,51,234,0.85)" : "rgba(37,99,235,0.85)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "0.25rem 0.65rem",
            borderRadius: "6px",
            letterSpacing: "0.02em",
          }}
        >
          {product.tipe || "Produk"}
        </div>

        {/* Kategori Badge */}
        {product.kategori && (
          <div
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              background: "rgba(15,23,42,0.85)",
              backdropFilter: "blur(4px)",
              color: "#e2e8f0",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "0.25rem 0.65rem",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {product.kategori}
          </div>
        )}
      </div>

      {/* Content Body */}
      <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Title */}
        <h3
          style={{
            fontSize: "1.05rem",
            fontWeight: 700,
            color: "#f8fafc",
            margin: "0 0 0.5rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "2.8rem",
          }}
        >
          {product.nama_produk}
        </h3>

        {/* Price */}
        {product.harga && (
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#38bdf8", marginBottom: "0.6rem" }}>
            {product.harga}
          </div>
        )}

        {/* Owner & Batch */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
          <span>👤</span>
          <span style={{ fontWeight: 600, color: "#cbd5e1" }}>{product.nama_owner || "Alumni"}</span>
          {product.angkatan && (
            <span style={{ background: "rgba(255,255,255,0.06)", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.75rem" }}>
              TI {product.angkatan}
            </span>
          )}
        </div>

        {/* Lokasi */}
        {product.lokasi && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b", marginBottom: "0.75rem" }}>
            <span>📍</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.lokasi}</span>
          </div>
        )}

        {/* Description Snippet */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "#94a3b8",
            lineHeight: 1.5,
            margin: "0 0 1.25rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {product.deskripsi || "Hubungi pemilik untuk informasi lebih lengkap."}
        </p>

        {/* Card Action Buttons */}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#cbd5e1",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Detail
          </button>
          <a
            href={getWhatsAppUrl(product.whatsapp, product.nama_produk, product.nama_owner)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: "0.6rem",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.3rem",
            }}
          >
            <span>💬</span> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
