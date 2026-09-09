"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const TYPE_COLORS = {
  "Full-time":          { bg: "#dcfce7", text: "#166534" },
  "Part-time":          { bg: "#fef9c3", text: "#854d0e" },
  "Freelance":          { bg: "#ede9fe", text: "#5b21b6" },
  "Magang / Internship":{ bg: "#dbeafe", text: "#1d4ed8" },
  "Contract":           { bg: "#fee2e2", text: "#991b1b" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function JobDetailPage({ params }) {
  const { id } = use(params);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("job_posts")
          .select("*")
          .eq("id", id)
          .single();
        if (error || !data) { setNotFound(true); return; }
        setJob(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function handleWA() {
    if (!job) return;
    const url = window.location.href;
    const text = `🔥 Ada loker menarik nih!\n\n*${job.judul_posisi}* di *${job.nama_perusahaan}*${job.lokasi ? ` · ${job.lokasi}` : ""}\n\nLihat detail & apply di sini:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function handleTwitter() {
    if (!job) return;
    const url = window.location.href;
    const text = `Loker: ${job.judul_posisi} di ${job.nama_perusahaan}${job.lokasi ? ` · ${job.lokasi}` : ""}\n\nvia @alumnova_id`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  }

  const typeColor = job ? (TYPE_COLORS[job.tipe_pekerjaan] || { bg: "#f1f5f9", text: "#475569" }) : null;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 1rem" }} />
        <p style={{ color: "#64748b", fontFamily: "var(--font-body), sans-serif", fontSize: "0.9rem" }}>Memuat detail loker…</p>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  /* ── Not found ── */
  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", maxWidth: "400px" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", fontFamily: "var(--font-body), sans-serif" }}>
          Loker Tidak Ditemukan
        </h1>
        <p style={{ color: "#64748b", marginBottom: "1.75rem", fontFamily: "var(--font-body), sans-serif" }}>
          Mungkin loker ini sudah dihapus atau linknya tidak valid.
        </p>
        <Link href="/job-post"
          style={{ background: "#2563eb", color: "#fff", padding: "0.75rem 1.75rem", borderRadius: "999px", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-body), sans-serif", fontSize: "0.9rem" }}>
          ← Lihat Semua Loker
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>

      {/* ── Hero banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e293b 100%)",
        paddingTop: "5.5rem", paddingBottom: "3.5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-30%", right: "-8%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-25%", left: "-5%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>

          {/* Back link */}
          <Link href="/job-post"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#93c5fd", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none", marginBottom: "1.5rem", fontFamily: "var(--font-body), sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Semua Loker
          </Link>

          {/* Badge tipe */}
          {job.tipe_pekerjaan && (
            <div style={{ marginBottom: "0.85rem" }}>
              <span style={{ background: typeColor.bg, color: typeColor.text, fontSize: "0.72rem", fontWeight: 700, padding: "0.3rem 0.8rem", borderRadius: "999px", letterSpacing: "0.02em" }}>
                {job.tipe_pekerjaan}
              </span>
            </div>
          )}

          <h1 style={{ margin: "0 0 0.4rem", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            {job.judul_posisi}
          </h1>
          <p style={{ margin: "0 0 1.25rem", fontSize: "1.05rem", color: "#93c5fd", fontWeight: 600 }}>
            {job.nama_perusahaan}
          </p>

          {/* Meta chips */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
            {job.lokasi && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "0.83rem", padding: "0.35rem 0.85rem", borderRadius: "999px", fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {job.lokasi}
              </span>
            )}
            {job.deadline && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "0.83rem", padding: "0.35rem 0.85rem", borderRadius: "999px", fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                Deadline: {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "0.83rem", padding: "0.35rem 0.85rem", borderRadius: "999px", fontWeight: 500 }}>
              🕐 {timeAgo(job.created_at)}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {job.link_daftar && (
              <motion.a href={job.link_daftar} target="_blank" rel="noreferrer"
                whileHover={{ scale: 1.05, boxShadow: "0 12px 32px rgba(37,99,235,0.5)" }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "#2563eb", color: "#fff", padding: "0.8rem 1.75rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}>
                Apply Sekarang →
              </motion.a>
            )}

            {/* Share dropdown */}
            <div style={{ position: "relative" }}>
              <motion.button
                onClick={() => setShareOpen(!shareOpen)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: shareOpen ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", padding: "0.78rem 1.4rem", borderRadius: "999px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif", transition: "all 0.18s" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
                </svg>
                Bagikan Loker
              </motion.button>

              <AnimatePresence>
                {shareOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{ duration: 0.18 }}
                    style={{ position: "absolute", top: "calc(100% + 10px)", left: 0, background: "#fff", borderRadius: "14px", boxShadow: "0 12px 40px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.08)", border: "1px solid rgba(15,23,42,0.07)", padding: "0.65rem", minWidth: "210px", zIndex: 60 }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", padding: "0.2rem 0.55rem 0.55rem" }}>Bagikan via</div>

                    {/* Copy */}
                    <button onClick={() => { handleCopy(); setShareOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.65rem", width: "100%", padding: "0.55rem 0.65rem", background: "none", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#0f172a", fontFamily: "var(--font-body), sans-serif", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <span style={{ width: "30px", height: "30px", background: "#f1f5f9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                      </span>
                      Salin Link
                    </button>

                    {/* WhatsApp */}
                    <button onClick={() => { handleWA(); setShareOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.65rem", width: "100%", padding: "0.55rem 0.65rem", background: "none", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#0f172a", fontFamily: "var(--font-body), sans-serif", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <span style={{ width: "30px", height: "30px", background: "#dcfce7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2h-.02C6.462 2 2 6.462 2 12c0 1.99.581 3.843 1.585 5.401L2.16 21.38a.5.5 0 00.613.613l3.979-1.424A9.95 9.95 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.99 2z"/></svg>
                      </span>
                      WhatsApp
                    </button>

                    {/* Twitter */}
                    <button onClick={() => { handleTwitter(); setShareOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: "0.65rem", width: "100%", padding: "0.55rem 0.65rem", background: "none", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", color: "#0f172a", fontFamily: "var(--font-body), sans-serif", fontWeight: 500 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8f8f8"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>
                      <span style={{ width: "30px", height: "30px", background: "#f1f5f9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#0f172a"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </span>
                      X (Twitter)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Diposting oleh */}
          {job.nama_poster && (
            <p style={{ margin: "1.25rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
              Diposting oleh <strong style={{ color: "#93c5fd" }}>{job.nama_poster}</strong>
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>

        {/* Poster image */}
        {job.poster_url && !imgError && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "2rem", boxShadow: "0 4px 24px rgba(15,23,42,0.1)" }}>
            <img src={job.poster_url} alt={`Poster ${job.judul_posisi}`} onError={() => setImgError(true)}
              style={{ width: "100%", display: "block", maxHeight: "460px", objectFit: "cover" }} />
          </motion.div>
        )}

        {/* Deskripsi card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ background: "#fff", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem", boxShadow: "0 2px 12px rgba(15,23,42,0.05)", border: "1px solid rgba(15,23,42,0.07)" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
            📋 Deskripsi Pekerjaan
          </h2>
          <p style={{ margin: 0, fontSize: "0.93rem", color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {job.deskripsi}
          </p>
        </motion.div>

        {/* Info card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem 2rem", marginBottom: "2rem", boxShadow: "0 2px 12px rgba(15,23,42,0.05)", border: "1px solid rgba(15,23,42,0.07)" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.05rem", fontWeight: 700, color: "#0f172a" }}>
            ℹ️ Info Loker
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
            {[
              { label: "Perusahaan", val: job.nama_perusahaan, icon: "🏢" },
              job.lokasi && { label: "Lokasi", val: job.lokasi, icon: "📍" },
              job.tipe_pekerjaan && { label: "Tipe", val: job.tipe_pekerjaan, icon: "💼" },
              job.deadline && { label: "Deadline", val: new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), icon: "📅" },
            ].filter(Boolean).map((item) => (
              <div key={item.label} style={{ background: "#f8fafc", borderRadius: "10px", padding: "0.9rem 1rem" }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                  {item.icon} {item.label}
                </div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{item.val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA apply */}
        {job.link_daftar && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)", borderRadius: "16px", padding: "2rem", textAlign: "center", boxShadow: "0 8px 32px rgba(37,99,235,0.25)" }}>
            <p style={{ margin: "0 0 1.25rem", color: "#bfdbfe", fontSize: "0.9rem" }}>
              Tertarik dengan posisi ini? Jangan tunda, segera lamar sekarang!
            </p>
            <motion.a href={job.link_daftar} target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.05, boxShadow: "0 12px 36px rgba(15,23,42,0.3)" }}
              whileTap={{ scale: 0.97 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#1d4ed8", padding: "0.9rem 2.25rem", borderRadius: "999px", fontWeight: 800, fontSize: "1rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(15,23,42,0.12)" }}>
              Apply Sekarang →
            </motion.a>
          </motion.div>
        )}

        {/* Share strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ marginTop: "2rem", background: "#fff", borderRadius: "14px", padding: "1.25rem 1.5rem", border: "1px solid rgba(15,23,42,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>Bagikan loker ini 🚀</div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.2rem" }}>Bantu teman-temanmu menemukan peluang ini</div>
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <motion.button onClick={handleCopy}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1rem", background: copied ? "#dcfce7" : "#f1f5f9", color: copied ? "#166534" : "#475569", border: "1px solid " + (copied ? "#bbf7d0" : "rgba(15,23,42,0.1)"), borderRadius: "999px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif", transition: "all 0.2s" }}>
              {copied ? "✅ Tersalin!" : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Salin Link</>
              )}
            </motion.button>
            <motion.button onClick={handleWA}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1rem", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "999px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2h-.02C6.462 2 2 6.462 2 12c0 1.99.581 3.843 1.585 5.401L2.16 21.38a.5.5 0 00.613.613l3.979-1.424A9.95 9.95 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 11.99 2z"/></svg>
              WA
            </motion.button>
            <motion.button onClick={handleTwitter}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1rem", background: "#f1f5f9", color: "#0f172a", border: "1px solid rgba(15,23,42,0.1)", borderRadius: "999px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.733-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </motion.button>
          </div>
        </motion.div>

        {/* Back to list */}
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/job-post"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#2563eb", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Lihat Semua Loker Lainnya
          </Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
