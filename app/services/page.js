"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { SERVICES, CATEGORIES } from "@/lib/servicesData";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
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
        <motion.div className="hero-breadcrumb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Beranda / Services
        </motion.div>
        <motion.h1 className="hero-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}>
          Temukan Layanan yang{" "}
          <motion.span style={{ color: "#2563eb", display: "inline-block" }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            Kamu Butuhkan
          </motion.span>
        </motion.h1>
        <motion.p className="hero-subtitle" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
          Website, konten, hingga undangan digital — dikerjakan talenta terpercaya
        </motion.p>
      </div>

      <div style={{ padding: "2.5rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Cari layanan yang Anda butuhkan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.85rem 1rem 0.85rem 2.6rem",
              border: "1.5px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "0.95rem",
              outline: "none",
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

        <motion.div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", margin: "1.25rem 0 2rem" }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
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

        <motion.p style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.25rem" }} animate={{ opacity: 1 }} key={filtered.length} initial={{ opacity: 0.5 }} transition={{ duration: 0.2 }}>
          <span style={{ fontWeight: 700, color: "#2563eb" }}>{filtered.length}</span> layanan ditemukan
        </motion.p>

        <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.25rem" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <ServiceCard key={item.slug} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "3rem 0", color: "#999" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.6rem" }}>
                <IconEmpty />
              </div>
              <p>Tidak ada layanan yang cocok dengan pencarian.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          style={{ marginTop: "3rem", padding: "2rem", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", borderRadius: "14px", textAlign: "center", position: "relative", overflow: "hidden" }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 65%)" }} />
          <p style={{ margin: "0 0 0.5rem", color: "#94a3b8", fontSize: "0.88rem", position: "relative" }}>Tidak menemukan yang kamu cari?</p>
          <p style={{ margin: "0 0 1.25rem", color: "#fff", fontWeight: 700, fontSize: "1.05rem", position: "relative" }}>Konsultasikan langsung kebutuhanmu — gratis!</p>
          <motion.a
            href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
            target="_blank"
            rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#25D366", color: "#fff", padding: "0.75rem 1.75rem", borderRadius: "999px", fontWeight: 700, textDecoration: "none", position: "relative", boxShadow: "0 4px 18px rgba(37,211,102,0.35)" }}
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
    </div>
  );
}

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
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
        boxShadow: hov ? "0 20px 40px rgba(15,23,42,0.13)" : "0 2px 8px rgba(15,23,42,0.05)",
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
            position: "absolute", top: "0.7rem", left: "0.7rem",
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
        <h3 style={{ margin: "0 0 0.4rem", fontSize: "1rem", color: "#0f172a", fontWeight: 700 }}>{item.title}</h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", lineHeight: 1.55, flex: 1 }}>{item.shortDesc}</p>

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
          style={{ marginTop: "0.85rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", fontSize: "0.8rem", color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}
          animate={{ x: hov ? 4 : 0 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          Lihat Detail →
        </motion.div>
      </div>
    </motion.a>
  );
}