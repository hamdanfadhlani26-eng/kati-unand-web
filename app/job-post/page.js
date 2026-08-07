"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* ── helpers ── */
function sanitizeFileName(fileName) {
  const ext = fileName.split(".").pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
  const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
  return `${cleaned}.${ext}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const TIPE_OPTIONS = ["Full-time", "Part-time", "Freelance", "Magang / Internship", "Contract"];

const TYPE_COLORS = {
  "Full-time": { bg: "#dcfce7", text: "#166534" },
  "Part-time": { bg: "#fef9c3", text: "#854d0e" },
  "Freelance": { bg: "#ede9fe", text: "#5b21b6" },
  "Magang / Internship": { bg: "#dbeafe", text: "#1d4ed8" },
  "Contract": { bg: "#fee2e2", text: "#991b1b" },
};

const inp = {
  width: "100%",
  padding: "0.65rem 0.9rem",
  border: "1px solid rgba(15,23,42,0.15)",
  borderRadius: "10px",
  fontSize: "0.92rem",
  fontFamily: "var(--font-body), sans-serif",
  background: "#fff",
  color: "#0f172a",
  outline: "none",
  transition: "border-color 0.2s",
};

/* ── JobCard ── */
function JobCard({ job, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const typeColor = TYPE_COLORS[job.tipe_pekerjaan] || { bg: "#f1f5f9", text: "#475569" };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 9) * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
      whileHover={{ boxShadow: "0 12px 36px rgba(37,99,235,0.1)", borderColor: "rgba(37,99,235,0.25)" }}
    >
      {job.poster_url && !imgError && (
        <div style={{ width: "100%", height: "180px", overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
          <img
            src={job.poster_url}
            alt="Poster Loker"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      <div style={{ padding: "1.25rem 1.4rem", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
              {job.judul_posisi}
            </h3>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.88rem", color: "#475569", fontWeight: 600 }}>
              {job.nama_perusahaan}
            </p>
          </div>
          {job.tipe_pekerjaan && (
            <span style={{
              flexShrink: 0,
              background: typeColor.bg,
              color: typeColor.text,
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.28rem 0.7rem",
              borderRadius: "999px",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}>
              {job.tipe_pekerjaan}
            </span>
          )}
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
          {job.lokasi && (
            <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {job.lokasi}
            </span>
          )}
          {job.deadline && (
            <span style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              Deadline: {new Date(job.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Deskripsi */}
        <div style={{ fontSize: "0.86rem", color: "#475569", lineHeight: 1.65, marginBottom: "0.85rem", flex: 1 }}>
          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.p key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                {job.deskripsi}
              </motion.p>
            ) : (
              <p key="short" style={{ margin: 0 }}>
                {job.deskripsi.length > 160 ? job.deskripsi.slice(0, 160) + "…" : job.deskripsi}
              </p>
            )}
          </AnimatePresence>
          {job.deskripsi.length > 160 && (
            <button onClick={() => setExpanded(!expanded)}
              style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", padding: "0.2rem 0 0", fontFamily: "inherit" }}>
              {expanded ? "Tutup ↑" : "Baca selengkapnya ↓"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.6rem", marginTop: "auto" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
            {job.nama_poster && (
              <span>Dishare oleh <strong style={{ color: "#64748b" }}>{job.nama_poster}</strong> · </span>
            )}
            {timeAgo(job.created_at)}
          </div>
          {job.link_daftar && (
            <motion.a href={job.link_daftar} target="_blank" rel="noreferrer"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.35rem",
                background: "#2563eb", color: "#fff",
                padding: "0.45rem 1rem", borderRadius: "999px",
                fontWeight: 700, fontSize: "0.82rem", textDecoration: "none",
                boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
              }}>
              Cek Info / Apply →
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function JobPostPage() {
  const [form, setForm] = useState({
    nama_poster: "", judul_posisi: "", nama_perusahaan: "",
    lokasi: "", tipe_pekerjaan: "", deskripsi: "", link_daftar: "", deadline: "",
  });
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  async function fetchJobs() {
    setLoadingJobs(true);
    try {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setJobs(data || []);
    } catch (err) {
      console.error("Gagal memuat loker:", err.message);
    } finally {
      setLoadingJobs(false);
    }
  }

  useEffect(() => { fetchJobs(); }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handlePosterChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setForm({
      nama_poster: "", judul_posisi: "", nama_perusahaan: "",
      lokasi: "", tipe_pekerjaan: "", deskripsi: "", link_daftar: "", deadline: "",
    });
    setPosterFile(null);
    setPosterPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.judul_posisi || !form.nama_perusahaan || !form.deskripsi) {
      setMessage({ type: "error", text: "Mohon isi field yang wajib (*)." });
      return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      let poster_url = null;
      if (posterFile) {
        const fileName = `loker_${Date.now()}_${sanitizeFileName(posterFile.name)}`;
        const { error: upErr } = await supabase.storage
          .from("JobPosters")
          .upload(fileName, posterFile, { contentType: posterFile.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("JobPosters").getPublicUrl(fileName);
        poster_url = pub.publicUrl;
      }
      const payload = {
        nama_poster: form.nama_poster || null,
        judul_posisi: form.judul_posisi.trim(),
        nama_perusahaan: form.nama_perusahaan.trim(),
        lokasi: form.lokasi || null,
        tipe_pekerjaan: form.tipe_pekerjaan || null,
        deskripsi: form.deskripsi.trim(),
        link_daftar: form.link_daftar || null,
        deadline: form.deadline || null,
        poster_url,
      };
      const { error: insertErr } = await supabase.from("job_posts").insert([payload]);
      if (insertErr) throw insertErr;
      setMessage({ type: "success", text: "Loker berhasil diposting! Terima kasih sudah berbagi 🙌" });
      resetForm();
      setFormOpen(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Gagal memposting: " + err.message });
    } finally {
      setLoading(false);
    }
  }

  const filtered = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      j.judul_posisi?.toLowerCase().includes(q) ||
      j.nama_perusahaan?.toLowerCase().includes(q) ||
      j.lokasi?.toLowerCase().includes(q) ||
      j.deskripsi?.toLowerCase().includes(q);
    const matchTipe = !filterTipe || j.tipe_pekerjaan === filterTipe;
    return matchSearch && matchTipe;
  });

  /* ── label style ── */
  const lbl = { fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.35rem" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1e293b 100%)",
        paddingTop: "5.5rem", paddingBottom: "4rem",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }} style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#93c5fd", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
            Job Post · Alumnova
          </div>
          <h1 style={{ margin: "0 0 0.85rem", fontSize: "clamp(2.2rem,5vw,3.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.08, letterSpacing: "-0.025em" }}>
            Sharing is{" "}
            <em style={{ fontFamily: "var(--font-accent)", fontStyle: "italic", color: "#93c5fd", fontWeight: 400 }}>Caring</em>
          </h1>
          <p style={{ margin: "0 auto", maxWidth: "520px", color: "#cbd5e1", fontSize: "1rem", lineHeight: 1.7, padding: "0 1.5rem" }}>
            Tahu ada lowongan bagus? Share ke sini! Bantu sesama alumni dan mahasiswa menemukan peluang karir yang tepat.
          </p>
          <motion.button
            onClick={() => setFormOpen(true)}
            whileHover={{ scale: 1.05, boxShadow: "0 12px 32px rgba(37,99,235,0.5)" }}
            whileTap={{ scale: 0.97 }}
            style={{
              marginTop: "2rem", background: "#2563eb", color: "#fff", border: "none",
              padding: "0.88rem 2.4rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.95rem",
              cursor: "pointer", fontFamily: "var(--font-body), sans-serif",
              boxShadow: "0 4px 20px rgba(37,99,235,0.45)",
            }}
          >
            + Share Loker Sekarang
          </motion.button>
        </motion.div>
        {/* Blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-30%", right: "-8%", width: "520px", height: "520px", borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-25%", left: "-5%", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        </div>
      </div>

      {/* ── Form Modal ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(6px)", zIndex: 200,
              display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
          >
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                background: "#fff", borderRadius: "20px", padding: "2rem 2rem 2.25rem",
                width: "100%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto",
                boxShadow: "0 40px 80px rgba(15,23,42,0.28)", position: "relative",
              }}
            >
              {/* Close btn */}
              <button onClick={() => setFormOpen(false)}
                style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  background: "#f1f5f9", border: "none", borderRadius: "50%",
                  width: "34px", height: "34px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.2rem", color: "#64748b", fontFamily: "inherit", lineHeight: 1,
                }}>×</button>

              {/* Modal header */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                  Share Loker
                </div>
                <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                  Post Lowongan Kerja
                </h2>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                  Bantu teman-temanmu dengan berbagi info loker yang kamu tahu 💙
                </p>
              </div>

              {/* Inline message */}
              {message.text && (
                <div style={{
                  padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.25rem",
                  background: message.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: message.type === "success" ? "#166534" : "#991b1b",
                  fontSize: "0.88rem", fontWeight: 600,
                }}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                {/* Nama poster */}
                <div>
                  <label style={lbl}>
                    Nama Kamu <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional — boleh anonymous)</span>
                  </label>
                  <input type="text" name="nama_poster" value={form.nama_poster} onChange={handleChange}
                    placeholder="misal: Andi Saputra atau Anonymous" style={inp} />
                </div>

                {/* Judul posisi */}
                <div>
                  <label style={lbl}>Judul Posisi <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" name="judul_posisi" value={form.judul_posisi} onChange={handleChange}
                    placeholder="misal: Frontend Developer, Data Analyst…" style={inp} required />
                </div>

                {/* Perusahaan */}
                <div>
                  <label style={lbl}>Nama Perusahaan / Institusi <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="text" name="nama_perusahaan" value={form.nama_perusahaan} onChange={handleChange}
                    placeholder="misal: PT Inovasi Nusantara" style={inp} required />
                </div>

                {/* Tipe + Lokasi */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={lbl}>Tipe Pekerjaan</label>
                    <select name="tipe_pekerjaan" value={form.tipe_pekerjaan} onChange={handleChange}
                      style={{ ...inp, cursor: "pointer" }}>
                      <option value="">— Pilih —</option>
                      {TIPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Lokasi</label>
                    <input type="text" name="lokasi" value={form.lokasi} onChange={handleChange}
                      placeholder="Remote / Padang / Jakarta" style={inp} />
                  </div>
                </div>

                {/* Deskripsi */}
                <div>
                  <label style={lbl}>Deskripsi Loker <span style={{ color: "#ef4444" }}>*</span></label>
                  <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange}
                    placeholder="Tulis detail loker: kualifikasi, benefit, cara apply, kontak, dll…"
                    rows={5} required style={{ ...inp, resize: "vertical", lineHeight: 1.65 }} />
                </div>

                {/* Link */}
                <div>
                  <label style={lbl}>Link Apply / Info Lebih Lanjut <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span></label>
                  <input type="url" name="link_daftar" value={form.link_daftar} onChange={handleChange}
                    placeholder="https://..." style={inp} />
                </div>

                {/* Deadline */}
                <div>
                  <label style={lbl}>Deadline <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span></label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleChange} style={inp} />
                </div>

                {/* Upload poster */}
                <div>
                  <label style={lbl}>Upload Poster Loker <span style={{ color: "#94a3b8", fontWeight: 400 }}>(opsional)</span></label>
                  <label htmlFor="poster-upload-input" style={{
                    display: "block",
                    border: "2px dashed rgba(37,99,235,0.3)",
                    borderRadius: "12px",
                    padding: posterPreview ? "0" : "1.75rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "rgba(37,99,235,0.025)",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}>
                    {posterPreview ? (
                      <img src={posterPreview} alt="Preview" style={{ width: "100%", maxHeight: "240px", objectFit: "cover", display: "block" }} />
                    ) : (
                      <>
                        <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>🖼️</div>
                        <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>Klik untuk upload gambar poster</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>JPG, PNG, WebP — maks 5 MB</div>
                      </>
                    )}
                  </label>
                  <input id="poster-upload-input" type="file" accept="image/*"
                    onChange={handlePosterChange} style={{ display: "none" }} />
                  {posterPreview && (
                    <button type="button" onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                      style={{ marginTop: "0.5rem", background: "none", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                      × Hapus poster
                    </button>
                  )}
                </div>

                {/* Submit */}
                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{
                    background: loading ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#fff", border: "none", borderRadius: "12px",
                    padding: "0.9rem", fontWeight: 700, fontSize: "0.95rem",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-body), sans-serif",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.35)", marginTop: "0.5rem",
                  }}>
                  {loading ? "Memposting…" : "🚀 Post Loker Sekarang"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Listing ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem 5rem" }}>

        {/* Success toast (after modal closes) */}
        <AnimatePresence>
          {message.type === "success" && !formOpen && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                background: "#dcfce7", color: "#166534",
                padding: "0.85rem 1.25rem", borderRadius: "12px",
                fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.75rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                border: "1px solid #bbf7d0",
              }}
            >
              {message.text}
              <button onClick={() => setMessage({ type: "", text: "" })}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", fontSize: "1.1rem" }}>×</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }} style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563eb", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Lowongan Tersedia
          </div>
          <h2 style={{ margin: 0, fontSize: "1.65rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Semua Loker dari Komunitas
          </h2>
          <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.9rem" }}>
            {loadingJobs ? "Memuat…" : `${jobs.length} loker dishare oleh alumni & mahasiswa`}
          </p>
        </motion.div>

        {/* Filter bar */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
          style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          <input type="text" placeholder="🔍  Cari posisi, perusahaan, atau lokasi…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inp, flex: "1", minWidth: "200px", padding: "0.65rem 1rem", background: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }} />
          <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}
            style={{ ...inp, width: "auto", minWidth: "170px", padding: "0.65rem 1rem", cursor: "pointer", background: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,0.05)" }}>
            <option value="">Semua Tipe</option>
            {TIPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </motion.div>

        {/* Cards grid */}
        {loadingJobs ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: "240px", background: "#f1f5f9", borderRadius: "16px", animation: "skelpulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "5rem 2rem", color: "#94a3b8" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b", marginBottom: "0.5rem" }}>
              {searchQuery || filterTipe ? "Tidak ada loker yang cocok" : "Belum ada loker yang dipost"}
            </div>
            <p style={{ fontSize: "0.88rem", margin: "0 0 1.5rem" }}>
              {searchQuery || filterTipe ? "Coba ubah kata kunci atau filter" : "Jadilah yang pertama berbagi! 🙌"}
            </p>
            {!(searchQuery || filterTipe) && (
              <motion.button onClick={() => setFormOpen(true)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  background: "#2563eb", color: "#fff", border: "none",
                  borderRadius: "999px", padding: "0.75rem 1.75rem",
                  fontWeight: 700, fontSize: "0.9rem", cursor: "pointer",
                  fontFamily: "var(--font-body), sans-serif", boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}>
                + Share Loker Pertama
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
            {filtered.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes skelpulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
