"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getServiceBySlug, SERVICES } from "@/lib/servicesData";
import { notFound } from "next/navigation";
import { use } from "react";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function ServiceDetailPage({ params }) {
  const { slug } = use(params);
  const item = getServiceBySlug(slug);
  if (!item) return notFound();

  const msg = `Halo, saya ingin memesan layanan "${item.title}".`;

  return (
    <div style={{ padding: "2rem 2rem 4rem", maxWidth: "1020px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <motion.div
        style={{ fontSize: "0.84rem", color: "#94a3b8", marginBottom: "1.75rem", display: "flex", gap: "0.4rem", alignItems: "center" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <a href="/" style={{ color: "#94a3b8", textDecoration: "none" }}>Beranda</a>
        <span>/</span>
        <a href="/services" style={{ color: "#94a3b8", textDecoration: "none" }}>Services</a>
        <span>/</span>
        <span style={{ color: "#12233f", fontWeight: 600 }}>{item.title}</span>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2.5rem", alignItems: "start" }}>
        {/* ── Left column ── */}
        <div>
          <motion.span
            style={{
              display: "inline-block",
              backgroundColor: "#e0f2fe",
              color: "#075985",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.8rem",
              borderRadius: "999px",
              marginBottom: "0.75rem",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {item.category}
          </motion.span>

          <motion.h1
            style={{ fontSize: "1.9rem", color: "#12233f", margin: "0 0 1.5rem", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {item.title}
          </motion.h1>

          {/* Hero image */}
          <motion.div
            style={{
              width: "100%", aspectRatio: "16/9",
              backgroundColor: "#f1f5f9", borderRadius: "14px",
              overflow: "hidden", marginBottom: "2rem",
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.img
              src={item.image}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Sections */}
          <AnimSection title="Deskripsi Layanan" delay={0.3}>
            <p style={{ color: "#475569", lineHeight: 1.75 }}>{item.deskripsiLengkap}</p>
          </AnimSection>

          <AnimSection title="✅ Yang Anda Dapatkan" delay={0.4}>
            <ul style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {item.yangDidapat.map((line, i) => (
                <motion.li
                  key={i}
                  style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", color: "#475569", fontSize: "0.92rem" }}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                >
                  <span style={{ color: "#e8823c", fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>→</span>
                  {line}
                </motion.li>
              ))}
            </ul>
          </AnimSection>

          <AnimSection title="📋 Yang Perlu Anda Siapkan" delay={0.5}>
            <ol style={{ paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {item.yangDisiapkan.map((line, i) => (
                <motion.li
                  key={i}
                  style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start", color: "#475569", fontSize: "0.92rem" }}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 + i * 0.07 }}
                >
                  <span style={{
                    minWidth: "22px", height: "22px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e8823c, #d9702a)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "1px",
                  }}>
                    {i + 1}
                  </span>
                  {line}
                </motion.li>
              ))}
            </ol>
          </AnimSection>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <motion.div
            style={{
              border: "1px solid rgba(18,35,63,0.08)",
              borderRadius: "14px",
              padding: "1.75rem",
              backgroundColor: "#fff",
              position: "sticky",
              top: "5.5rem",
              boxShadow: "0 8px 30px rgba(18,35,63,0.08)",
            }}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.2rem" }}>Mulai dari</div>
            <motion.div
              style={{ fontSize: "1.8rem", fontWeight: 800, color: "#12233f", marginBottom: "1.25rem" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 200 }}
            >
              {item.price}
            </motion.div>

            {/* Meta info */}
            {[
              { icon: "⏱", label: "Pengerjaan", value: item.eta },
              { icon: "🔄", label: "Revisi", value: item.revisi },
            ].map(({ icon, label, value }, i) => (
              <motion.div
                key={label}
                style={{
                  display: "flex", alignItems: "flex-start", gap: "0.6rem",
                  padding: "0.65rem 0",
                  borderBottom: i === 0 ? "1px solid #f1f5f9" : "none",
                  marginBottom: i === 0 ? 0 : "1.25rem",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "0.88rem", color: "#334155", fontWeight: 600 }}>{value}</div>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.a
              href={waLink(msg)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "#12233f",
                color: "#fff",
                padding: "0.85rem",
                borderRadius: "10px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.95rem",
                boxShadow: "0 4px 14px rgba(18,35,63,0.25)",
                marginBottom: "0.75rem",
              }}
              whileHover={{ scale: 1.03, backgroundColor: "#1a3358", boxShadow: "0 8px 24px rgba(18,35,63,0.35)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
            >
              Minta Layanan Ini
            </motion.a>

            <motion.a
              href={waLink(`Halo, saya ingin tanya tentang layanan "${item.title}".`)}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                backgroundColor: "#f0fdf4",
                color: "#16a34a",
                border: "1.5px solid #bbf7d0",
                padding: "0.75rem",
                borderRadius: "10px",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.88rem",
              }}
              whileHover={{ scale: 1.02, backgroundColor: "#dcfce7" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Tanya Dulu via WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnimSection({ title, delay = 0, children }) {
  return (
    <motion.div
      style={{ marginBottom: "2rem" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay }}
    >
      <h2 style={{
        fontSize: "1.05rem", fontWeight: 700,
        color: "#12233f", marginBottom: "0.85rem",
        paddingBottom: "0.5rem",
        borderBottom: "2px solid #f1f5f9",
      }}>
        {title}
      </h2>
      {children}
    </motion.div>
  );
}
