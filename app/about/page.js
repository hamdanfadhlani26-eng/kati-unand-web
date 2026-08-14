"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ── Initiators data ── */
const INITIATORS = [
  { name: "Medy Yolanda Sari, S.T.", short: "Medi", angkatan: "Angkatan 2000", file: "medi.png" },
  { name: "Rodi Afriniko, S.T., M.E.", short: "Rodi", angkatan: "Angkatan 2005", file: "rodi.png" },
  { name: "Cresti Kalani, S.T., CPSp.", short: "Cresti", angkatan: "Angkatan 2007", file: "cresti.png" },
  { name: "Willy Januardi, S.T., M.T.", short: "Willy", angkatan: "Angkatan 2007", file: "willy.png" },
  { name: "Ivan, S.T., MBA.", short: "Ivan", angkatan: "Angkatan 2007", file: "ivan.png" },
  { name: "Muhammad Hamdan Fadhlani, S.T.", short: "Hamdan", angkatan: "Angkatan 2022", file: "hamdan.png" },
];

const PRINCIPLES = [
  {
    label: "Connection",
    desc: "Membangun hubungan lintas generasi, bidang, dan profesi.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
        <circle cx="9" cy="7" r="3" /><circle cx="17" cy="17" r="3" />
        <path d="M12 10c0 4 5 7 5 7M9 10s-5 3-5 7" />
      </svg>
    ),
  },
  {
    label: "Opportunity",
    desc: "Mengubah jaringan menjadi akses terhadap pekerjaan, project, talent, dan kolaborasi.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: "Contribution",
    desc: "Mendorong alumni untuk berbagi pengalaman, expertise, dan kesempatan.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Growth",
    desc: "Membangun ekosistem yang membuat mahasiswa dan alumni berkembang bersama.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

const ECOSYSTEM = [
  { label: "Mahasiswa", desc: "Talent opportunity, mentor, pekerjaan, akses ke dunia profesional." },
  { label: "Alumni", desc: "Network, berbagi peluang, menunjukkan expertise, berkolaborasi." },
  { label: "Organisasi Alumni", desc: "Mengelola jaringan dan mengubah koneksi menjadi manfaat nyata." },
  { label: "Kampus", desc: "Membangun hubungan berkelanjutan antara mahasiswa, alumni, dan industri." },
  { label: "Industri", desc: "Menemukan talent, expert, serta jaringan profesional berbasis komunitas." },
];

/* ── Fade-in wrapper ── */
function FadeIn({ children, delay = 0, y = 20 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafbff", color: "#0f172a" }}>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #1e293b 100%)",
        padding: "7rem 1.5rem 5rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#93c5fd", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "1.25rem" }}>
            Tentang Alumnova
          </div>
          <h1 style={{ margin: "0 0 1.25rem", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Jaringan Sudah Ada.{" "}
            <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#93c5fd", fontWeight: 400 }}>
              Kami Membantu Mengubahnya Menjadi Peluang.
            </em>
          </h1>
          <p style={{ margin: "0 auto", maxWidth: "560px", color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.75 }}>
            Alumnova adalah ekosistem yang menghubungkan mahasiswa, alumni, organisasi alumni, kampus, dan industri untuk membuka akses terhadap talent, expertise, services, pekerjaan, dan kolaborasi.
          </p>
        </motion.div>
        {/* blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-20%", right: "-5%", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-20%", left: "-5%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        </div>
      </section>

      {/* ── WHY WE EXIST ── */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <FadeIn>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
            Mengapa Alumnova Hadir
          </div>
          <h2 style={{ margin: "0 0 1.5rem", fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" }}>
            Dari Jaringan Alumni,{" "}
            <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#2563eb", fontWeight: 400 }}>
              Menjadi Jaringan Peluang
            </em>
          </h2>
          <div style={{ fontSize: "1rem", color: "#475569", lineHeight: 1.85, display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <p style={{ margin: 0 }}>
              Alumnova lahir dari sebuah kebutuhan sederhana: banyak potensi, informasi, dan peluang yang sebenarnya sudah ada di dalam jaringan alumni, tetapi belum terhubung dan terkelola dengan baik.
            </p>
            <p style={{ margin: 0 }}>
              Di berbagai komunitas alumni, informasi mengenai lowongan kerja, kebutuhan talent, jasa profesional, mentoring, project, hingga peluang kolaborasi masih banyak tersebar melalui grup WhatsApp atau jaringan informal. Informasi tersebut sering tenggelam, sulit dicari kembali, dan hanya menjangkau orang-orang yang kebetulan melihatnya pada saat itu.
            </p>
            <p style={{ margin: 0 }}>
              Di sisi lain, mahasiswa dan alumni muda memiliki kemampuan, portfolio, dan potensi yang besar, tetapi belum selalu memiliki akses langsung kepada jaringan profesional yang relevan.
            </p>
            <p style={{ margin: 0, fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>
              Alumnova hadir untuk menjembatani keduanya.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ── PROBLEM → SOLUTION ── */}
      <section style={{ background: "#f1f5f9", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Masalah yang Ingin Diselesaikan
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Jaringan ada. Tapi peluangnya belum terstruktur.
              </h2>
            </div>
          </FadeIn>

          {/* Flow diagram */}
          <FadeIn delay={0.1}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginBottom: "2.5rem",
            }}>
              {[
                { label: "WhatsApp Group", sub: "Info tersebar informal" },
                null,
                { label: "Informasi Tenggelam", sub: "Tidak bisa dicari ulang" },
                null,
                { label: "Peluang Hilang", sub: "Hanya yang kebetulan lihat" },
                null,
                { label: "Talent Tidak Ditemukan", sub: "Potensi tidak terkoneksi" },
              ].map((item, i) =>
                item === null ? (
                  <div key={i} style={{ color: "#94a3b8", fontSize: "1.2rem", fontWeight: 300 }}>→</div>
                ) : (
                  <div key={i} style={{
                    background: "#fff",
                    border: "1px solid rgba(15,23,42,0.08)",
                    borderRadius: "12px",
                    padding: "0.85rem 1.1rem",
                    textAlign: "center",
                    minWidth: "130px",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                  }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0f172a" }}>{item.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>{item.sub}</div>
                  </div>
                )
              )}
            </div>
          </FadeIn>

          {/* Solution pill */}
          <FadeIn delay={0.2}>
            <div style={{
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              borderRadius: "16px",
              padding: "2rem",
              textAlign: "center",
              color: "#fff",
            }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#93c5fd", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Alumnova
              </div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "1rem" }}>
                Satu ekosistem untuk semua peluang alumni
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center" }}>
                {["Talent", "Hiring", "Expert", "Services", "Network", "Job Post"].map((tag) => (
                  <span key={tag} style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "999px",
                    padding: "0.3rem 0.85rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#fff",
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <FadeIn>
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Ekosistem Alumnova
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Untuk Siapa Alumnova Hadir?
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {ECOSYSTEM.map((item, i) => (
            <FadeIn key={item.label} delay={i * 0.07}>
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1.25rem",
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.07)",
                borderRadius: "14px",
                padding: "1.25rem 1.4rem",
                boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
              }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(37,99,235,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "#2563eb",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: "0.25rem" }}>{item.label}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── PRINCIPLES ── */}
      <section style={{ background: "#f1f5f9", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                Prinsip Kami
              </div>
              <h2 style={{ margin: 0, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
                Principles of Alumnova
              </h2>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {PRINCIPLES.map((p, i) => (
              <FadeIn key={p.label} delay={i * 0.08}>
                <div style={{
                  background: "#fff",
                  border: "1px solid rgba(15,23,42,0.07)",
                  borderRadius: "16px",
                  padding: "1.5rem 1.4rem",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.03)",
                }}>
                  <div style={{ marginBottom: "0.85rem" }}>{p.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a", marginBottom: "0.5rem" }}>{p.label}</div>
                  <div style={{ fontSize: "0.83rem", color: "#64748b", lineHeight: 1.65 }}>{p.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── INITIATORS ── */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "5rem 1.5rem" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
              Dimulai dari Kolaborasi Alumni
            </div>
            <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Inisiator Alumnova
            </h2>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", maxWidth: "500px", marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
              Alumnova lahir sebagai inisiatif bersama untuk membangun ekosistem alumni yang lebih terhubung, produktif, dan memberikan manfaat nyata bagi generasi berikutnya.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {INITIATORS.map((person, i) => (
            <FadeIn key={person.short} delay={i * 0.07}>
              <div style={{
                background: "#fff",
                border: "1px solid rgba(15,23,42,0.07)",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
              }}>
                {/* Foto */}
                <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#f1f5f9" }}>
                  <img
                    src={`/initiators/${person.file}`}
                    alt={person.short}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                </div>
                {/* Info */}
                <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.3, marginBottom: "0.3rem" }}>
                    {person.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, letterSpacing: "0.03em" }}>
                    {person.angkatan}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: "0.2rem" }}>
                    Initiator
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Quote */}
        <FadeIn delay={0.2}>
          <div style={{
            marginTop: "3rem",
            background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
            borderRadius: "20px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            color: "#fff",
          }}>
            <div style={{
              fontSize: "clamp(1rem,2.5vw,1.2rem)",
              fontWeight: 400,
              lineHeight: 1.75,
              color: "#e2e8f0",
              fontStyle: "italic",
              fontFamily: "var(--font-accent)",
              marginBottom: "1.5rem",
            }}>
              "Kami percaya kekuatan sebuah jaringan bukan hanya ditentukan oleh berapa banyak orang yang terhubung, tetapi oleh berapa banyak peluang yang dapat tercipta dari hubungan tersebut."
            </div>
            <div style={{ fontSize: "0.82rem", color: "#93c5fd", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Inisiator Alumnova
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: "#fafbff",
        borderTop: "1px solid rgba(15,23,42,0.06)",
        padding: "5rem 1.5rem",
        textAlign: "center",
      }}>
        <FadeIn>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem,3.5vw,2.2rem)", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              Jaringan sudah ada.{" "}
              <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#2563eb", fontWeight: 400 }}>
                Sekarang saatnya mengubahnya menjadi peluang.
              </em>
            </h2>
            <p style={{ margin: "0 0 2rem", color: "#64748b", fontSize: "0.95rem", lineHeight: 1.7 }}>
              Alumnova dibangun dengan semangat kolaborasi — bukan hanya untuk menghubungkan alumni dengan alumni, tetapi untuk membuka jalan bagi mahasiswa, kampus, dan industri untuk bertumbuh bersama.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <motion.a href="/talent-pool"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "#2563eb", color: "#fff",
                  padding: "0.85rem 1.8rem", borderRadius: "999px",
                  fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                }}>
                Lihat Talent Pool
              </motion.a>
              <motion.a href="/job-post"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "#fff", color: "#0f172a",
                  padding: "0.85rem 1.8rem", borderRadius: "999px",
                  fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                  border: "1.5px solid rgba(15,23,42,0.12)",
                }}>
                Lihat Job Post
              </motion.a>
            </div>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
