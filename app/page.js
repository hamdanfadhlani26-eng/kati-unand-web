"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/* ── Reusable animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

/* ── Animated SVG Icons ── */
function IconAhli() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <motion.circle
        cx="16" cy="10" r="6"
        stroke="#e8823c" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.path
        d="M6 26c0-5.523 4.477-10 10-10s10 4.477 10 10"
        stroke="#e8823c" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M12 10l2 2 4-5"
        stroke="#12233f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
    </svg>
  );
}

function IconKomunikasi() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <motion.rect
        x="3" y="5" width="26" height="18" rx="4"
        stroke="#e8823c" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.path
        d="M3 23l6-4M29 23l-6-4"
        stroke="#e8823c" strokeWidth="2" strokeLinecap="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      />
      <motion.circle cx="10" cy="14" r="2" fill="#12233f"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.9, type: "spring" }}
      />
      <motion.circle cx="16" cy="14" r="2" fill="#12233f"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1.0, type: "spring" }}
      />
      <motion.circle cx="22" cy="14" r="2" fill="#12233f"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 1.1, type: "spring" }}
      />
    </svg>
  );
}

function IconHarga() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <motion.circle
        cx="16" cy="16" r="13"
        stroke="#e8823c" strokeWidth="2"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.path
        d="M16 8v2M16 22v2M11 13.5c0-1.933 2.239-3.5 5-3.5s5 1.567 5 3.5S18.761 17 16 17s-5 1.567-5 3.5 2.239 3.5 5 3.5 5-1.567 5-3.5"
        stroke="#12233f" strokeWidth="2" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}

function IconBukti() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <motion.path
        d="M4 28V10l12-6 12 6v18"
        stroke="#e8823c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.rect
        x="11" y="18" width="10" height="10"
        stroke="#12233f" strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      />
      <motion.path
        d="M12 10l4-3 4 3"
        stroke="#e8823c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      />
    </svg>
  );
}

/* ── ValueCard with animated icon ── */
function ValueCard({ Icon, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useHoverState();

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid rgba(18,35,63,0.08)",
        borderRadius: "12px",
        padding: "1.5rem 1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        cursor: "default",
        transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
        boxShadow: hovered ? "0 16px 40px rgba(18,35,63,0.12)" : "0 2px 8px rgba(18,35,63,0.04)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        borderColor: hovered ? "rgba(232,130,60,0.35)" : "rgba(18,35,63,0.08)",
      }}
    >
      {/* Animated icon container */}
      <motion.div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #fff8f3 0%, #fde8d4 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(232,130,60,0.15)",
        }}
        animate={hovered ? { scale: 1.08, rotate: [0, -4, 4, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Icon />
      </motion.div>

      <div>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#12233f", marginBottom: "0.4rem" }}>
          {title}
        </div>
        <div style={{ fontSize: "0.87rem", color: "#64748b", lineHeight: 1.65 }}>
          {desc}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Small hook for hover state ── */
function useHoverState() {
  const [hovered, setHovered] = [
    typeof window !== "undefined" ? false : false,
    () => {},
  ];
  const [state, setState] = require("react").useState(false);
  return [state, setState];
}

/* ── Animated counter ── */
function AnimatedNumber({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const { useState, useEffect } = require("react");
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ── Step card ── */
function StepCard({ number, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ textAlign: "center" }}
    >
      <motion.div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #e8823c 0%, #d9702a 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "1rem",
          margin: "0 auto 0.75rem",
          boxShadow: "0 4px 14px rgba(232,130,60,0.35)",
        }}
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {number}
      </motion.div>
      <div style={{ fontWeight: 700, color: "#12233f", fontSize: "0.95rem", marginBottom: "0.3rem" }}>{title}</div>
      <div style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
    </motion.div>
  );
}

/* ── Service preview card ── */
function ServicePreviewCard({ title, desc, price, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hov, setHov] = require("react").useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        border: "1px solid rgba(18,35,63,0.08)",
        borderRadius: "12px",
        padding: "1.4rem",
        transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        boxShadow: hov ? "0 20px 40px rgba(18,35,63,0.13)" : "0 2px 8px rgba(18,35,63,0.04)",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        borderColor: hov ? "rgba(232,130,60,0.4)" : "rgba(18,35,63,0.08)",
        cursor: "default",
      }}
    >
      <div style={{ fontWeight: 700, color: "#12233f", marginBottom: "0.4rem", fontSize: "0.97rem" }}>{title}</div>
      <div style={{ fontSize: "0.87rem", color: "#64748b", lineHeight: 1.6, marginBottom: "0.85rem" }}>{desc}</div>
      <motion.div
        style={{ fontSize: "0.82rem", color: "#e8823c", fontWeight: 700 }}
        animate={hov ? { x: 4 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        {price} →
      </motion.div>
    </motion.div>
  );
}

/* ── Stat item ── */
function StatItem({ value, suffix, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#12233f", lineHeight: 1 }}>
        <AnimatedNumber target={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}

/* ── Main page ── */
export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div>
      {/* HERO */}
      <div className="hero" ref={heroRef} style={{ overflow: "hidden" }}>
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div
            className="hero-breadcrumb"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Alumnova
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            Jasa Digital, Dikerjakan
            <br />
            <motion.span
              style={{ color: "#e8823c", display: "inline-block" }}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Talenta Terpercaya
            </motion.span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Website, dashboard, konten, hingga undangan digital — dikerjakan oleh talenta
            terseleksi berpengalaman.
          </motion.p>

          <motion.div
            style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <motion.a
              href="/services"
              style={ctaPrimary}
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(232,130,60,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              Lihat Semua Layanan
            </motion.a>
            <motion.a
              href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
              target="_blank"
              rel="noreferrer"
              style={ctaSecondary}
              whileHover={{ scale: 1.04, backgroundColor: "rgba(255,255,255,0.12)" }}
              whileTap={{ scale: 0.97 }}
            >
              Konsultasi Gratis
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* STATS BAR */}
      <motion.div
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(18,35,63,0.06)",
          padding: "1.75rem 2rem",
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          flexWrap: "wrap",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <StatItem value={50} suffix="+" label="Proyek Selesai" />
        <StatItem value={30} suffix="+" label="Klien Puas" />
        <StatItem value={3} suffix=" hari" label="Rata-rata Pengerjaan" />
        <StatItem value={100} suffix="%" label="Revisi Ditanggapi" />
      </motion.div>

      <div style={{ padding: "4rem 2rem", maxWidth: "1080px", margin: "0 auto" }}>

        {/* KENAPA ALUMNOVA */}
        <section style={{ marginBottom: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">Kenapa Kami</div>
            <h2 style={sectionTitle}>Kenapa Pilih Alumnova?</h2>
          </motion.div>

          <div
            className="value-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.25rem",
              marginTop: "1.75rem",
            }}
          >
            <ValueCard
              Icon={IconAhli}
              title="Dikerjakan Ahlinya"
              desc="Dikerjakan oleh talenta terseleksi yang paham proses bisnis, bukan cuma teknis."
              delay={0}
            />
            <ValueCard
              Icon={IconKomunikasi}
              title="Komunikasi Langsung"
              desc="Konsultasi dan revisi langsung via WhatsApp, cepat direspon, tanpa birokrasi rumit."
              delay={0.1}
            />
            <ValueCard
              Icon={IconHarga}
              title="Harga Terjangkau"
              desc="Cocok untuk UMKM & personal — kualitas tetap dijaga tanpa harga agency besar."
              delay={0.2}
            />
            <ValueCard
              Icon={IconBukti}
              title="Bukti Nyata"
              desc="Website ini sendiri, dari perencanaan sampai deploy, adalah hasil kerja tim kami."
              delay={0.3}
            />
          </div>
        </section>

        {/* LAYANAN UNGGULAN */}
        <section style={{ marginBottom: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">Layanan</div>
            <h2 style={sectionTitle}>Layanan Unggulan</h2>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginTop: "1.75rem",
            }}
          >
            <ServicePreviewCard
              title="Website & Web App"
              desc="Company profile, landing page, hingga sistem custom."
              price="Mulai Rp400.000"
              delay={0}
            />
            <ServicePreviewCard
              title="Undangan Digital"
              desc="Pernikahan, ulang tahun, wisuda, dengan RSVP online."
              price="Mulai Rp50.000"
              delay={0.1}
            />
            <ServicePreviewCard
              title="Video & Konten"
              desc="Video editing, copywriting, konten AI-generated."
              price="Mulai Rp75.000"
              delay={0.2}
            />
          </div>

          <motion.div
            style={{ textAlign: "center", marginTop: "2rem" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.a
              href="/services"
              style={ctaPrimary}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Lihat Semua Layanan →
            </motion.a>
          </motion.div>
        </section>

        {/* CARA KERJA */}
        <section style={{ marginBottom: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="eyebrow">Proses</div>
            <h2 style={sectionTitle}>Cara Kerja</h2>
          </motion.div>

          {/* Connecting line */}
          <div style={{ position: "relative", marginTop: "2rem" }}>
            <motion.div
              style={{
                position: "absolute",
                top: "22px",
                left: "12.5%",
                right: "12.5%",
                height: "2px",
                background: "linear-gradient(90deg, #e8823c, #f2a668)",
                transformOrigin: "left",
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.25rem",
                position: "relative",
                zIndex: 1,
              }}
            >
              <StepCard number="1" title="Konsultasi" desc="Chat via WhatsApp, ceritakan kebutuhanmu." delay={0} />
              <StepCard number="2" title="Penawaran" desc="Dapat estimasi harga & waktu pengerjaan." delay={0.12} />
              <StepCard number="3" title="Pengerjaan" desc="Tim kami kerjakan sesuai kesepakatan." delay={0.24} />
              <StepCard number="4" title="Selesai" desc="Revisi bila perlu, lalu hasil akhir diserahkan." delay={0.36} />
            </div>
          </div>
        </section>

        {/* CTA PENUTUP */}
        <motion.section
          style={{
            background: "linear-gradient(135deg, #0f1e38 0%, #12233f 60%, #1a3358 100%)",
            borderRadius: "16px",
            padding: "3rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative glow */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at 30% 50%, rgba(232,130,60,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(232,130,60,0.1) 0%, transparent 60%)",
          }} />

          <motion.h2
            style={{ color: "#fff", margin: "0 0 0.6rem", fontSize: "1.6rem", position: "relative" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            Siap mulai proyekmu?
          </motion.h2>
          <motion.p
            style={{ color: "#94a3b8", margin: "0 0 1.5rem", position: "relative" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
          >
            Konsultasi kebutuhanmu, gratis tanpa komitmen.
          </motion.p>
          <motion.a
            href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#25D366",
              color: "#fff",
              padding: "0.8rem 2rem",
              borderRadius: "999px",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.95rem",
              position: "relative",
              boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(37,211,102,0.5)" }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Chat via WhatsApp
          </motion.a>
        </motion.section>
      </div>
    </div>
  );
}

const sectionTitle = {
  fontSize: "1.6rem",
  fontWeight: 800,
  marginTop: "0.4rem",
  marginBottom: 0,
  color: "#12233f",
  letterSpacing: "-0.02em",
};

const ctaPrimary = {
  display: "inline-block",
  backgroundColor: "#e8823c",
  color: "#fff",
  padding: "0.75rem 1.6rem",
  borderRadius: "999px",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.92rem",
  boxShadow: "0 4px 14px rgba(232,130,60,0.35)",
  transition: "all 0.2s ease",
};

const ctaSecondary = {
  display: "inline-block",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "#fff",
  border: "1.5px solid rgba(255,255,255,0.25)",
  padding: "0.73rem 1.6rem",
  borderRadius: "999px",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.92rem",
  transition: "all 0.2s ease",
};