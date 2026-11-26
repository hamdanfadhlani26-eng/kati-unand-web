"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const AlumniBusinessMap = dynamic(
  () => import("@/components/AlumniBusinessMap"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          height: "650px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          color: "#94a3b8",
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>🗺️</div>
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>Memuat Peta Interaktif Jaringan Bisnis Alumni...</div>
      </div>
    ),
  }
);

const WA_ADMIN = "6281261739191";

export default function ProdukAlumniPage() {
  // Backward compatibility: If accessed with ?id= or ?product=, redirect to /services?tab=alumni&id=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get("id") || params.get("product");
      if (targetId) {
        window.location.replace(`/services?tab=alumni&id=${targetId}`);
      }
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b1120", color: "#f8fafc" }}>
      {/* ── HERO SECTION ── */}
      <section
        style={{
          position: "relative",
          paddingTop: "7.5rem",
          paddingBottom: "3.5rem",
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
            <span>🌐</span> Peta Sebaran & Jaringan Bisnis Alumni
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
            Business Networks{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Alumni & Sebaran Usaha
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
            Peta interaktif persebaran 109 titik usaha alumni di berbagai provinsi di Indonesia. Dukung pertumbuhan ekonomi dan jejaring bisnis sesama alumni. Dari alumni, oleh alumni, untuk kemajuan bersama.
          </motion.p>

          {/* Quick Stats & Action Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>📍</span>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                <strong style={{ color: "#38bdf8" }}>109</strong> Titik Usaha Terdaftar
              </span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "0.6rem 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1.1rem" }}>🗺️</span>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                Persebaran Nasional Multi-Provinsi
              </span>
            </div>

            <a
              href="/services?tab=alumni"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.35)",
                color: "#60a5fa",
                padding: "0.6rem 1.25rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
              }}
            >
              <span>🛍️</span> Lihat Katalog Produk Alumni ➔
            </a>

            <a
              href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin Alumnova, saya ingin mendaftarkan unit usaha saya ke Peta Jaringan Usaha Alumni.")}`}
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
              <span>＋</span> Daftarkan Usaha Anda ke Peta
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE BUSINESS MAP SECTION ── */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
        <AlumniBusinessMap />
      </section>
    </div>
  );
}
