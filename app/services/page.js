"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SERVICES, CATEGORIES } from "@/lib/servicesData";

const WA_NUMBER = "6281261739191";

const ALUMNI_KATEGORI_LIST = [
  "Semua",
  "Kuliner & F&B",
  "Teknologi & Digital",
  "Manufaktur & Kerajinan",
  "Agribisnis",
  "Lainnya",
];

const ALUMNI_TIPE_LIST = ["Semua Tipe", "Produk", "Jasa"];

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function getAlumniWhatsAppUrl(phone, productName, ownerName) {
  const cleanPhone = (phone || WA_NUMBER).replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.slice(1)
    : cleanPhone;

  const text = `Halo ${ownerName ? `Kak ${ownerName}` : "Admin"}, saya melihat produk/jasa "${productName}" di platform Alumnova. Boleh minta info lebih lanjut atau cara pemesanannya?`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

function IconSearch() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      <path d="M9 9l4 4M13 9l-4 4" strokeLinecap="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicesPage() {
  // Tab switcher: "jasa" (Jasa Alumnova) | "alumni" (Produk Alumni)
  const [activeTab, setActiveTab] = useState("jasa");

  // State for Jasa Alumnova
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchJasa, setSearchJasa] = useState("");

  // State for Produk Alumni
  const [alumniProducts, setAlumniProducts] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(true);
  const [searchAlumni, setSearchAlumni] = useState("");
  const [selectedKategoriAlumni, setSelectedKategoriAlumni] = useState("Semua");
  const [selectedTipeAlumni, setSelectedTipeAlumni] = useState("Semua Tipe");
  const [activeModal, setActiveModal] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Check URL query on mount for deep-linking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const targetId = params.get("id") || params.get("product");

      if (tabParam === "alumni" || targetId) {
        setActiveTab("alumni");
      }
      if (targetId) {
        setHighlightedId(targetId);
      }
    }
  }, []);

  // Fetch alumni products
  useEffect(() => {
    async function loadAlumniProducts() {
      try {
        const res = await fetch("/api/alumni-products");
        const json = await res.json();
        if (json.success && json.data) {
          setAlumniProducts(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat produk alumni:", err);
      } finally {
        setLoadingAlumni(false);
      }
    }
    loadAlumniProducts();
  }, []);

  // When alumni products load, if deep-linked target exists, auto-open modal
  useEffect(() => {
    if (typeof window === "undefined" || alumniProducts.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id") || params.get("product");

    if (targetId) {
      const target = alumniProducts.find((p) => String(p.id) === String(targetId));
      if (target) {
        setActiveTab("alumni");
        setActiveModal(target);
        setHighlightedId(target.id);
        setSearchAlumni("");
        setSelectedKategoriAlumni("Semua");
        setSelectedTipeAlumni("Semua Tipe");

        setTimeout(() => {
          const el = document.getElementById(`alumni-product-${target.id}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 350);
      }
    }
  }, [alumniProducts]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const targetId = params.get("id") || params.get("product");

      if (tabParam === "alumni" || targetId) {
        setActiveTab("alumni");
      } else {
        setActiveTab("jasa");
      }

      if (targetId && alumniProducts.length > 0) {
        const found = alumniProducts.find((p) => String(p.id) === String(targetId));
        if (found) {
          setActiveModal(found);
          setHighlightedId(found.id);
          return;
        }
      }
      setActiveModal(null);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [alumniProducts]);

  // Switch tab and sync URL
  function handleTabChange(tab) {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      if (tab === "alumni") {
        window.history.replaceState({}, "", "/services?tab=alumni");
      } else {
        window.history.replaceState({}, "", "/services");
      }
    }
  }

  function openAlumniModal(product) {
    setActiveModal(product);
    setHighlightedId(product.id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "alumni");
      url.searchParams.set("id", product.id);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function closeAlumniModal() {
    setActiveModal(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      url.searchParams.delete("product");
      url.searchParams.set("tab", "alumni");
      window.history.replaceState({}, "", url.toString());
    }
  }

  function handleShareAlumni(product) {
    if (!product) return;
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://alumnova.vercel.app";
    const shareUrl = `${origin}/services?tab=alumni&id=${product.id}`;
    const shareText = `Lihat "${product.nama_produk}" oleh ${product.nama_owner || "Alumni & Komunitas"} di Alumnova: ${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${product.nama_produk} - Alumnova`,
          text: `Lihat "${product.nama_produk}" oleh ${product.nama_owner || "Alumni & Komunitas"} di Alumnova:`,
          url: shareUrl,
        })
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        })
        .catch((err) => {
          if (err.name !== "AbortError" && navigator.clipboard) {
            navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  // Filter Jasa Alumnova
  const filteredJasa = SERVICES.filter((s) => {
    const matchCat = activeCategory === "Semua" || s.category === activeCategory;
    const matchSearch = s.title.toLowerCase().includes(searchJasa.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filter Produk Alumni
  const filteredAlumni = alumniProducts.filter((item) => {
    const matchSearch =
      !searchAlumni ||
      item.nama_produk?.toLowerCase().includes(searchAlumni.toLowerCase()) ||
      item.nama_owner?.toLowerCase().includes(searchAlumni.toLowerCase()) ||
      item.deskripsi?.toLowerCase().includes(searchAlumni.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchAlumni.toLowerCase());

    const matchKategori =
      selectedKategoriAlumni === "Semua" || item.kategori === selectedKategoriAlumni;

    const matchTipe =
      selectedTipeAlumni === "Semua Tipe" || item.tipe === selectedTipeAlumni;

    return matchSearch && matchKategori && matchTipe;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* ── HERO SECTION ── */}
      <div className="hero">
        <motion.div
          className="hero-breadcrumb"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Beranda / Produk
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Temukan Layanan & Produk{" "}
          <motion.span
            style={{ color: "#2563eb", display: "inline-block" }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Terbaik
          </motion.span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {activeTab === "jasa"
            ? "Website, konten, hingga konsultasi digital — dikerjakan talenta terpercaya Alumnova"
            : "Katalog produk, jasa, dan unit usaha inovatif karya sesama rekan alumni & komunitas terverifikasi"}
        </motion.p>

        {/* ── SUB-PAGE TABS (JASA ALUMNOVA ⟷ PRODUK ALUMNI) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: "#ffffff",
              border: "1.5px solid #e2e8f0",
              borderRadius: "999px",
              padding: "0.35rem",
              gap: "0.4rem",
              boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
            }}
          >
            <button
              type="button"
              onClick={() => handleTabChange("jasa")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  activeTab === "jasa"
                    ? "linear-gradient(135deg, #0f172a, #1e293b)"
                    : "transparent",
                color: activeTab === "jasa" ? "#ffffff" : "#64748b",
                boxShadow:
                  activeTab === "jasa"
                    ? "0 4px 14px rgba(15,23,42,0.25)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>💼</span> Jasa Alumnova ({SERVICES.length})
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("alumni")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.4rem",
                borderRadius: "999px",
                border: "none",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  activeTab === "alumni"
                    ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                    : "transparent",
                color: activeTab === "alumni" ? "#ffffff" : "#64748b",
                boxShadow:
                  activeTab === "alumni"
                    ? "0 4px 16px rgba(37,99,235,0.35)"
                    : "none",
                transition: "all 0.2s ease",
              }}
            >
              <span>🛍️</span> Produk Alumni ({alumniProducts.length})
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── TAB 1: JASA ALUMNOVA ── */}
      {activeTab === "jasa" && (
        <div style={{ padding: "2.5rem 2rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{ position: "relative" }}
          >
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Cari layanan jasa Alumnova yang Anda butuhkan..."
              value={searchJasa}
              onChange={(e) => setSearchJasa(e.target.value)}
              style={{
                width: "100%",
                padding: "0.85rem 1rem 0.85rem 2.6rem",
                border: "1.5px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "0.95rem",
                outline: "none",
                backgroundColor: "#fff",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2563eb";
                e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "none";
              }}
            />
          </motion.div>

          {/* Categories */}
          <motion.div
            style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", margin: "1.25rem 0 2rem" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: "0.45rem 1.2rem",
                  borderRadius: "999px",
                  border: activeCategory === cat ? "2px solid #0f172a" : "1.5px solid #e2e8f0",
                  backgroundColor: activeCategory === cat ? "#0f172a" : "#fff",
                  color: activeCategory === cat ? "#fff" : "#555",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: activeCategory === cat ? "0 4px 12px rgba(15,23,42,0.2)" : "none",
                }}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>

          {/* Results count */}
          <motion.p
            style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem" }}
            animate={{ opacity: 1 }}
            key={filteredJasa.length}
            initial={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <span style={{ fontWeight: 700, color: "#2563eb" }}>{filteredJasa.length}</span> layanan jasa ditemukan
          </motion.p>

          {/* Services Grid */}
          <motion.div
            layout
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <AnimatePresence mode="popLayout">
              {filteredJasa.map((item, i) => (
                <ServiceCard key={item.slug} item={item} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredJasa.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: "center", padding: "3rem 0", color: "#999" }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
                <IconEmpty />
              </div>
              <p>Tidak ada layanan yang cocok dengan pencarian.</p>
            </motion.div>
          )}

          {/* Consultation CTA banner */}
          <motion.div
            style={{
              marginTop: "3.5rem",
              padding: "2rem",
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "16px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.2) 0%, transparent 65%)",
              }}
            />
            <p style={{ margin: "0 0 0.5rem", color: "#94a3b8", fontSize: "0.88rem", position: "relative" }}>
              Tidak menemukan layanan yang kamu cari?
            </p>
            <p style={{ margin: "0 0 1.25rem", color: "#fff", fontWeight: 700, fontSize: "1.1rem", position: "relative" }}>
              Konsultasikan langsung kebutuhan custom bisnismu — gratis!
            </p>
            <motion.a
              href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital di Alumnova.")}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#25D366",
                color: "#fff",
                padding: "0.75rem 1.75rem",
                borderRadius: "999px",
                fontWeight: 700,
                textDecoration: "none",
                position: "relative",
                boxShadow: "0 4px 18px rgba(37,211,102,0.35)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 28px rgba(37,211,102,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat via WhatsApp
            </motion.a>
          </motion.div>
        </div>
      )}

      {/* ── TAB 2: PRODUK ALUMNI ── */}
      {activeTab === "alumni" && (
        <div style={{ padding: "2.5rem 2rem 5rem", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Controls: Search & Type filters */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "1rem",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
            }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", flex: "1 1 320px" }}>
              <span
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Cari produk, jasa, pemilik, atau lokasi usaha alumni..."
                value={searchAlumni}
                onChange={(e) => setSearchAlumni(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.6rem",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "0.95rem",
                  outline: "none",
                  backgroundColor: "#fff",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2563eb";
                  e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Tipe Selector Pills */}
            <div
              style={{
                display: "flex",
                gap: "0.35rem",
                background: "#ffffff",
                padding: "0.3rem",
                borderRadius: "10px",
                border: "1.5px solid #e2e8f0",
              }}
            >
              {ALUMNI_TIPE_LIST.map((tipe) => {
                const active = selectedTipeAlumni === tipe;
                return (
                  <button
                    key={tipe}
                    type="button"
                    onClick={() => setSelectedTipeAlumni(tipe)}
                    style={{
                      padding: "0.45rem 1rem",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      background: active ? "#2563eb" : "transparent",
                      color: active ? "#fff" : "#64748b",
                    }}
                  >
                    {tipe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Horizontal Pills */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              overflowX: "auto",
              paddingBottom: "0.75rem",
              scrollbarWidth: "none",
            }}
          >
            {ALUMNI_KATEGORI_LIST.map((kat) => {
              const active = selectedKategoriAlumni === kat;
              return (
                <button
                  key={kat}
                  type="button"
                  onClick={() => setSelectedKategoriAlumni(kat)}
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: "999px",
                    border: active ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                    background: active ? "#2563eb" : "#ffffff",
                    color: active ? "#ffffff" : "#475569",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active ? "0 4px 12px rgba(37,99,235,0.25)" : "none",
                  }}
                >
                  {kat}
                </button>
              );
            })}
          </div>

          {/* Counter & Reset Filter */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Menampilkan{" "}
              <strong style={{ color: "#0f172a" }}>{filteredAlumni.length}</strong>{" "}
              produk / jasa karya alumni
            </span>
            {(searchAlumni ||
              selectedKategoriAlumni !== "Semua" ||
              selectedTipeAlumni !== "Semua Tipe") && (
              <button
                type="button"
                onClick={() => {
                  setSearchAlumni("");
                  setSelectedKategoriAlumni("Semua");
                  setSelectedTipeAlumni("Semua Tipe");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Alumni Products Grid */}
          {loadingAlumni ? (
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
                    height: "360px",
                    borderRadius: "14px",
                    background: "#e2e8f0",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1.5px dashed #cbd5e1",
                borderRadius: "16px",
                padding: "4rem 2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#0f172a" }}>
                Tidak Ada Produk yang Cocok
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: "420px", margin: "0 auto 1.5rem" }}>
                Coba gunakan kata kunci pencarian yang berbeda atau ubah pilihan kategori dan tipe.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchAlumni("");
                  setSelectedKategoriAlumni("Semua");
                  setSelectedTipeAlumni("Semua Tipe");
                }}
                style={{
                  padding: "0.6rem 1.4rem",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                }}
              >
                Lihat Semua Produk
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredAlumni.map((item, idx) => (
                <AlumniProductCard
                  key={item.id || idx}
                  product={item}
                  isHighlighted={String(item.id) === String(highlightedId)}
                  onOpenModal={() => openAlumniModal(item)}
                  onShare={handleShareAlumni}
                  getWhatsAppUrl={getAlumniWhatsAppUrl}
                />
              ))}
            </div>
          )}

          {/* CTA Banner: Punya Usaha Sendiri? */}
          <div
            style={{
              marginTop: "4rem",
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "3rem 2rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(15,23,42,0.15)",
            }}
          >
            <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 1 }}>
              <span style={{ fontSize: "2.5rem", display: "inline-block", marginBottom: "0.75rem" }}>🚀</span>
              <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, margin: "0 0 1rem", color: "#f8fafc" }}>
                Punya Usaha, Produk, atau Jasa Sendiri?
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 2rem" }}>
                Daftarkan produk dan layanan bisnis Anda ke katalog resmi Alumnova. Dapatkan eksposur langsung ke jejaring ribuan alumni, mahasiswa, dan profesional.
              </p>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Halo Admin Alumnova, saya ingin mendaftarkan produk/jasa saya di website Alumnova.")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.85rem 1.8rem",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.4)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <span>💬</span> Hubungi Admin untuk Pendaftaran
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL PRODUK ALUMNI ── */}
      <AnimatePresence>
        {activeModal && (
          <div
            onClick={closeAlumniModal}
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
              {/* Modal Header */}
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
                  type="button"
                  onClick={closeAlumniModal}
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

              {/* Modal Body */}
              <div style={{ overflowY: "auto", padding: "1.5rem" }}>
                {/* Photo Preview */}
                <div
                  style={{
                    width: "100%",
                    maxHeight: "500px",
                    minHeight: "220px",
                    borderRadius: "14px",
                    overflow: "hidden",
                    marginBottom: "1.25rem",
                    background: "radial-gradient(ellipse at center, #192339 0%, #090e1a 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {activeModal.foto_url ? (
                    <>
                      <img
                        src={activeModal.foto_url}
                        alt={activeModal.nama_produk}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "500px",
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                      <a
                        href={activeModal.foto_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Buka gambar ukuran penuh"
                        style={{
                          position: "absolute",
                          bottom: "0.75rem",
                          right: "0.75rem",
                          background: "rgba(15,23,42,0.85)",
                          backdropFilter: "blur(6px)",
                          color: "#cbd5e1",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          padding: "0.35rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.15)",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <span>🔍</span> Ukuran Penuh ↗
                      </a>
                    </>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
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
                        {activeModal.nama_owner || "Alumni Terdaftar"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                        {activeModal.angkatan ? `Alumni TI ${activeModal.angkatan}` : "Alumni & Komunitas"}
                      </div>
                    </div>
                  </div>

                  {activeModal.lokasi && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
                      <span>📍</span> {activeModal.lokasi}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>
                    Deskripsi Produk / Jasa
                  </h4>
                  <p style={{ fontSize: "0.92rem", color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                    {activeModal.deskripsi || "Tidak ada deskripsi detail untuk produk ini."}
                  </p>
                </div>

                {/* Extra Actions: Website & Share */}
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  {activeModal.website_url && (
                    <a
                      href={activeModal.website_url}
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
                    type="button"
                    onClick={() => handleShareAlumni(activeModal)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.45rem 0.9rem",
                      borderRadius: "8px",
                      background: copied ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: copied ? "#4ade80" : "#cbd5e1",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span>{copied ? "✅" : "🔗"}</span> {copied ? "Tautan Berhasil Disalin!" : "Bagikan"}
                  </button>
                </div>

                {/* Primary WhatsApp Action */}
                <a
                  href={getAlumniWhatsAppUrl(activeModal.whatsapp, activeModal.nama_produk, activeModal.nama_owner)}
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

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2500,
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.6), 0 0 16px rgba(56,189,248,0.25)",
              color: "#f8fafc",
              padding: "0.75rem 1.4rem",
              borderRadius: "999px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.88rem",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>✅</span> Tautan produk berhasil disalin!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SERVICE CARD COMPONENT (JASA ALUMNOVA) ──
function ServiceCard({ item, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.a
      ref={ref}
      href={`/services/${item.slug}`}
      layout
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
        boxShadow: hov ? "0 20px 40px rgba(15,23,42,0.12)" : "0 2px 8px rgba(15,23,42,0.04)",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        borderColor: hov ? "rgba(37,99,235,0.35)" : "rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ width: "100%", aspectRatio: "16 / 10", backgroundColor: "#f1f5f9", overflow: "hidden", position: "relative" }}>
        <motion.img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          animate={{ scale: hov ? 1.06 : 1 }}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <motion.span
          style={{
            position: "absolute",
            top: "0.7rem",
            left: "0.7rem",
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(6px)",
            color: "#075985",
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "0.2rem 0.65rem",
            borderRadius: "999px",
            border: "1px solid rgba(7,89,133,0.12)",
          }}
          initial={{ opacity: 0, x: -6 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: (index % 4) * 0.07 + 0.25 }}
        >
          {item.category}
        </motion.span>
      </div>

      <div style={{ padding: "1.1rem", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", color: "#0f172a", fontWeight: 700 }}>
          {item.title}
        </h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.55, flex: 1 }}>
          {item.shortDesc}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "#aaa", marginBottom: "2px" }}>Mulai dari</div>
            <div style={{ fontSize: "0.97rem", fontWeight: 800, color: "#0f172a" }}>{item.price}</div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "#888", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <IconClock /> {item.eta}
          </div>
        </div>

        <motion.div
          style={{
            marginTop: "0.85rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid #f1f5f9",
            fontSize: "0.8rem",
            color: "#2563eb",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          animate={{ x: hov ? 4 : 0 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Lihat Detail →
        </motion.div>
      </div>
    </motion.a>
  );
}

// ── ALUMNI PRODUCT CARD COMPONENT ──
function AlumniProductCard({ product, onOpenModal, onShare, isHighlighted, getWhatsAppUrl }) {
  const isJasa = product.tipe === "Jasa";

  return (
    <div
      id={`alumni-product-${product.id}`}
      onClick={onOpenModal}
      style={{
        background: "#ffffff",
        border: isHighlighted
          ? "2px solid #2563eb"
          : "1px solid rgba(15,23,42,0.08)",
        boxShadow: isHighlighted
          ? "0 0 25px rgba(37,99,235,0.25), 0 10px 30px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.04)",
        borderRadius: "16px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        if (!isHighlighted) e.currentTarget.style.borderColor = "rgba(37,99,235,0.35)";
        e.currentTarget.style.boxShadow = isHighlighted
          ? "0 0 30px rgba(37,99,235,0.35), 0 14px 30px rgba(15,23,42,0.12)"
          : "0 12px 28px rgba(15,23,42,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        if (!isHighlighted) e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
        e.currentTarget.style.boxShadow = isHighlighted
          ? "0 0 25px rgba(37,99,235,0.25), 0 10px 30px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.04)";
      }}
    >
      {/* Image Container with Badges */}
      <div
        style={{
          width: "100%",
          height: "190px",
          background: "#f1f5f9",
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
              color: "#94a3b8",
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
            background: isJasa ? "rgba(124,58,237,0.9)" : "rgba(37,99,235,0.9)",
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
              color: "#f8fafc",
              fontSize: "0.72rem",
              fontWeight: 600,
              padding: "0.25rem 0.65rem",
              borderRadius: "6px",
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
            fontSize: "1.02rem",
            fontWeight: 700,
            color: "#0f172a",
            margin: "0 0 0.4rem",
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
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.6rem" }}>
            {product.harga}
          </div>
        )}

        {/* Owner & Angkatan */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#64748b", marginBottom: "0.4rem" }}>
          <span>👤</span>
          <span style={{ fontWeight: 600, color: "#334155" }}>{product.nama_owner || "Alumni"}</span>
          {product.angkatan && (
            <span style={{ background: "#e2e8f0", color: "#334155", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.75rem" }}>
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
            color: "#64748b",
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
        <div style={{ display: "flex", gap: "0.45rem", marginTop: "auto" }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal();
            }}
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#334155",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Detail
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShare(product);
            }}
            title="Bagikan Tautan Produk"
            style={{
              padding: "0.6rem 0.75rem",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#2563eb",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            <span>🔗</span>
          </button>
          <a
            href={getWhatsAppUrl(product.whatsapp, product.nama_produk, product.nama_owner)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
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
