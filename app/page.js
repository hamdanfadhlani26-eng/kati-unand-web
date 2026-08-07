"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function IconTarget() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="#2563eb" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" strokeLinecap="round" />
    </svg>
  );
}
function IconCoin() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M9.5 9.5c0-1.4 1.2-2 2.5-2s2.5.7 2.5 2-1.2 1.8-2.5 1.8-2.5.5-2.5 2 1.2 2 2.5 2 2.5-.6 2.5-2" strokeLinecap="round" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" strokeLinecap="round" />
    </svg>
  );
}

function IconMahasiswa() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <path d="M2 9l10-5 10 5-10 5-10-5z" strokeLinejoin="round" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 9v6" strokeLinecap="round" />
    </svg>
  );
}
function IconAlumni() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13h18" />
    </svg>
  );
}
function IconKampus() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6">
      <path d="M3 10l9-6 9 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 19v-6h4v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AudienceCard({ icon, tag, desc, cta, href, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.07)",
        borderRadius: "14px",
        padding: "1.5rem",
      }}
    >
      <div style={{ marginBottom: "0.6rem" }}>{icon}</div>
      <span
        style={{
          display: "inline-block",
          backgroundColor: "#eef2ff",
          color: "#2563eb",
          fontSize: "0.75rem",
          fontWeight: 700,
          padding: "0.25rem 0.7rem",
          borderRadius: "999px",
          marginBottom: "0.75rem",
        }}
      >
        {tag}
      </span>
      <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.65, marginBottom: "1rem" }}>{desc}</p>
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}>
        {cta} →
      </a>
    </motion.div>
  );
}

/* ── ValueCard ── */
function ValueCard({ Icon, title, desc, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.07)",
        borderRadius: "14px",
        padding: "1.5rem 1.25rem",
        transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
        boxShadow: hovered ? "0 16px 40px rgba(37,99,235,0.12)" : "0 2px 8px rgba(15,23,42,0.03)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        borderColor: hovered ? "rgba(37,99,235,0.3)" : "rgba(15,23,42,0.07)",
      }}
    >
      <div style={{ marginBottom: "0.75rem" }}><Icon /></div>
      <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: "0.4rem" }}>{title}</div>
      <div style={{ fontSize: "0.87rem", color: "#64748b", lineHeight: 1.65 }}>{desc}</div>
    </motion.div>
  );
}

function AnimatedNumber({ target, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function StatItem({ value, suffix, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
        <AnimatedNumber target={value} suffix={suffix} />
      </div>
      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.3rem" }}>{label}</div>
    </div>
  );
}

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
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 300 }}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "1rem",
          margin: "0 auto 0.75rem",
          boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
        }}
      >
        {number}
      </motion.div>
      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem", marginBottom: "0.3rem" }}>{title}</div>
      <div style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
    </motion.div>
  );
}

function ServicePreviewCard({ title, desc, price, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hov, setHov] = useState(false);

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
        border: "1px solid rgba(15,23,42,0.07)",
        borderRadius: "14px",
        padding: "1.4rem",
        transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
        boxShadow: hov ? "0 20px 40px rgba(37,99,235,0.13)" : "0 2px 8px rgba(15,23,42,0.03)",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        borderColor: hov ? "rgba(37,99,235,0.35)" : "rgba(15,23,42,0.07)",
      }}
    >
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.4rem", fontSize: "0.97rem" }}>{title}</div>
      <div style={{ fontSize: "0.87rem", color: "#64748b", lineHeight: 1.6, marginBottom: "0.85rem" }}>{desc}</div>
      <motion.div
        animate={hov ? { x: 4 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400 }}
        style={{ fontSize: "0.82rem", color: "#2563eb", fontWeight: 700 }}
      >
        {price} →
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div>
      {/* ATMOSPHERE TOP SECTION - SKY PHOTO */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          aspectRatio: "16 / 7",   // ganti dari height: "340px"
          backgroundImage: "url('/sky-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* overlay gelap tipis biar teks kebaca */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.1) 50%, rgba(255,255,255,0.95) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 1.5rem" }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              color: "#fff",
              fontSize: "clamp(1.6rem, 4vw, 2.6rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 20px rgba(15,23,42,0.4)",
              margin: 0,
            }}
          >
            Building the Future with{" "}
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontWeight: 400 }}>
              Alumnova
            </span>
          </motion.h2>
        </div>
      </div>

      {/* HERO */}
      <div
        ref={heroRef}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #eef2ff 0%, #fafbff 100%)",
          padding: "3.5rem 2rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            alignItems: "center",
            gap: "2rem",
          }}
          className="hero-grid"
        >
          {/* Teks kiri */}
          <motion.div style={{ y: textY, opacity: heroOpacity, textAlign: "left" }}>
            <motion.div
              className="eyebrow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Alumnova
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                fontSize: "clamp(2rem, 4.2vw, 2.9rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                color: "#0f172a",
                margin: "0.5rem 0 1rem",
                letterSpacing: "-0.02em",
              }}
            >
              Dari Jaringan Kampus
              <br />
              <span
                style={{
                  color: "#2563eb",
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "1.08em",
                }}
              >
                Menjadi Jaringan Peluang
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              style={{ fontSize: "1.02rem", color: "#64748b", lineHeight: 1.65, maxWidth: "460px" }}
            >
              Temukan mahasiswa, alumni, expert, dan layanan profesional dari komunitas kampus yang terverifikasi
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ marginTop: "1.75rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
            >
              <motion.a
                href="/services"
                whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(37,99,235,0.4)" }}
                whileTap={{ scale: 0.97 }}
                style={{
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.92rem",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                Lihat Semua Layanan
              </motion.a>
              <motion.a
                href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  backgroundColor: "transparent",
                  color: "#0f172a",
                  border: "1.5px solid rgba(15,23,42,0.2)",
                  padding: "0.78rem 1.6rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "0.92rem",
                }}
              >
                Konsultasi Gratis
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Gambar kanan - parallax */}
          <motion.div
            style={{ y: imageY, opacity: heroOpacity }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src="/hero-illustration.png"
              alt="Ilustrasi layanan digital Alumnova"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </motion.div>
        </div>
      </div>

      {/* STATS BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        style={{
          background: "#fff",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          padding: "1.75rem 2rem",
          display: "flex",
          justifyContent: "center",
          gap: "4rem",
          flexWrap: "wrap",
        }}
      >
        <StatItem value={50} suffix="+" label="Proyek Selesai" />
        <StatItem value={30} suffix="+" label="Klien Puas" />
        <StatItem value={3} suffix=" hari" label="Rata-rata Pengerjaan" />
        <StatItem value={100} suffix="%" label="Revisi Ditanggapi" />
      </motion.div>

      <div style={{ padding: "4rem 2rem", maxWidth: "1080px", margin: "0 auto" }}>
        {/* UNTUK SIAPA */}
        <section style={{ marginBottom: "4rem" }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center" }}
          >
            <div className="eyebrow">Ekosistem</div>
            <h2 style={{ ...sectionTitle, textAlign: "center" }}>Untuk Siapa Alumnova?</h2>
            <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
              Ekosistem yang dirancang untuk tiga pihak yang saling mendukung
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
            <AudienceCard
              icon={<IconMahasiswa />}
              tag="Mahasiswa"
              desc="Bangun portofolio, dapatkan pengalaman nyata, dan buka peluang penghasilan dari keahlian yang kamu kembangkan di kampus."
              cta="Daftar sebagai Talent"
              href="/talent-pool"
              delay={0}
            />
            <AudienceCard
              icon={<IconAlumni />}
              tag="Alumni & Profesional"
              desc="Temukan talent tepercaya dari komunitas kampus, dapatkan layanan fleksibel, dan temukan partner kolaborasi yang ideal."
              cta="Cari Talent"
              href="/talent-pool"
              delay={0.1}
            />
            <AudienceCard
              icon={<IconKampus />}
              tag="Kampus"
              desc="Perkuat employability mahasiswa dan engagement alumni melalui ekosistem terukur yang terintegrasi dengan komunitas kampus."
              cta="Jadi Mitra Kampus"
              href={waLink("Halo, saya ingin diskusi kerja sama sebagai mitra kampus dengan Alumnova.")}
              delay={0.2}
            />
          </div>
        </section>

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

          <div className="value-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginTop: "1.75rem" }}>
            <ValueCard Icon={IconTarget} title="Dikerjakan Ahlinya" desc="Talenta terseleksi yang paham proses bisnis, bukan cuma teknis." delay={0} />
            <ValueCard Icon={IconChat} title="Komunikasi Langsung" desc="Konsultasi & revisi via WhatsApp, cepat direspon, tanpa birokrasi." delay={0.1} />
            <ValueCard Icon={IconCoin} title="Harga Terjangkau" desc="Kualitas terjaga tanpa harga agency besar." delay={0.2} />
            <ValueCard Icon={IconSpark} title="Bukti Nyata" desc="Website ini sendiri adalah hasil kerja tim kami." delay={0.3} />
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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginTop: "1.75rem" }}>
            <ServicePreviewCard title="Website & Web App" desc="Company profile, landing page, hingga sistem custom." price="Mulai Rp450.000" delay={0} />
            <ServicePreviewCard title="Undangan Digital" desc="Pernikahan, ulang tahun, wisuda, dengan RSVP online." price="Mulai Rp50.000" delay={0.1} />
            <ServicePreviewCard title="Video & Konten" desc="Video editing, copywriting, konten AI-generated." price="Mulai Rp85.000" delay={0.2} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: "center", marginTop: "2rem" }}
          >
            <motion.a
              href="/services"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-block",
                backgroundColor: "#2563eb",
                color: "#fff",
                padding: "0.75rem 1.6rem",
                borderRadius: "999px",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: "0.92rem",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
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

          <div style={{ position: "relative", marginTop: "2rem" }}>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: "22px",
                left: "12.5%",
                right: "12.5%",
                height: "2px",
                background: "linear-gradient(90deg, #2563eb, #93c5fd)",
                transformOrigin: "left",
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem", position: "relative", zIndex: 1 }}>
              <StepCard number="1" title="Konsultasi" desc="Chat via WhatsApp, ceritakan kebutuhanmu." delay={0} />
              <StepCard number="2" title="Penawaran" desc="Dapat estimasi harga & waktu pengerjaan." delay={0.12} />
              <StepCard number="3" title="Pengerjaan" desc="Tim kami kerjakan sesuai kesepakatan." delay={0.24} />
              <StepCard number="4" title="Selesai" desc="Revisi bila perlu, hasil akhir diserahkan." delay={0.36} />
            </div>
          </div>
        </section>

        {/* CTA PENUTUP */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a8a 100%)",
            borderRadius: "18px",
            padding: "3rem 2rem",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.12) 0%, transparent 60%)",
            }}
          />
          <h2 style={{ color: "#fff", margin: "0 0 0.6rem", fontSize: "1.6rem", position: "relative" }}>Siap mulai proyekmu?</h2>
          <p style={{ color: "#94a3b8", margin: "0 0 1.5rem", position: "relative" }}>Konsultasi kebutuhanmu, gratis tanpa komitmen.</p>
          <motion.a
            href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(37,211,102,0.5)" }}
            whileTap={{ scale: 0.97 }}
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
          >
            Chat via WhatsApp
          </motion.a>
        </motion.section>
      </div>

      <style jsx>{`
        @media (max-width: 800px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function cloudBlob(left, top, width, height, opacity) {
  return {
    position: "absolute",
    left,
    top,
    width,
    height,
    borderRadius: "50%",
    background: `rgba(255,255,255,${opacity})`,
    filter: "blur(6px)",
    pointerEvents: "none",
  };
}

const floatingPill = {
  backgroundColor: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(6px)",
  border: "1px solid rgba(37,99,235,0.15)",
  color: "#1e3a8a",
  padding: "0.45rem 1rem",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: 600,
  boxShadow: "0 4px 14px rgba(15,23,42,0.1)",
};

const sectionTitle = {
  fontSize: "1.6rem",
  fontWeight: 800,
  marginTop: "0.4rem",
  marginBottom: 0,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};