"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEmailGate } from "@/lib/emailGate";
import EmailGateScreen from "@/components/EmailGateScreen";
import PhotoCropper from "./PhotoCropper";
import { WhatsAppIcon, LinkedInIcon } from "./SocialIcons";

// Pilihan level jabatan
const LEVEL_OPTIONS = [
    "CEO / Founder / Co-Founder",
    "Direktur / Director",
    "Vice President (VP)",
    "General Manager",
    "Senior Manager / Manager",
    "Head of Department",
    "Senior Specialist / Lead",
];

const INDUSTRI_OPTIONS = [
    "Manufaktur & Produksi",
    "Supply Chain & Logistik",
    "Teknologi & IT",
    "Perbankan & Keuangan",
    "Energi & Pertambangan",
    "Konsultan & Profesional",
    "FMCG & Retail",
    "Pendidikan & Riset",
    "Pemerintahan & BUMN",
    "Kesehatan & Farmasi",
    "Properti & Konstruksi",
    "Media & Kreatif",
    "Lainnya",
];

const LEVEL_COLORS = {
    "CEO / Founder / Co-Founder": { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    "Direktur / Director": { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
    "Vice President (VP)": { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
    "General Manager": { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
    "Senior Manager / Manager": { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
    "Head of Department": { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
    "Senior Specialist / Lead": { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
};

function getLevelStyle(level) {
    return LEVEL_COLORS[level] || { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
}

export default function JaringanAlumni() {
    const { isUnlocked, checking, submitEmail } = useEmailGate("jaringan-alumni");

    const [alumniList, setAlumniList] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filterLevel, setFilterLevel] = useState("");
    const [filterIndustri, setFilterIndustri] = useState("");
    const [searchNama, setSearchNama] = useState("");

    // Form state
    const [form, setForm] = useState({
        nama: "", email: "", no_hp: "", angkatan: "",
        jabatan: "", level: "", tempat_kerja: "", industri: "",
        kota: "", deskripsi: "", wa_number: "", linkedin_url: "",
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [formOpen, setFormOpen] = useState(false);

    useEffect(() => {
        if (isUnlocked) fetchAlumni();
    }, [isUnlocked]);

    async function fetchAlumni() {
        setLoadingList(true);
        const { data, error } = await supabase
            .from("alumni_profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setAlumniList(data || []);
        setLoadingList(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handlePhotoSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setRawImageForCrop(reader.result);
        reader.readAsDataURL(file);
    }

    function handleCropDone(blob) {
        setFotoFile(blob);
        setFotoPreview(URL.createObjectURL(blob));
        setRawImageForCrop(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            let foto_url = null;
            if (fotoFile) {
                const fotoName = `alumni_${Date.now()}_foto.jpg`;
                const { error: fotoError } = await supabase.storage
                    .from("Photo").upload(fotoName, fotoFile, { contentType: "image/jpeg" });
                if (fotoError) throw fotoError;
                const { data: pub } = supabase.storage.from("Photo").getPublicUrl(fotoName);
                foto_url = pub.publicUrl;
            }
            const { error: insertError } = await supabase.from("alumni_profiles").insert([{ ...form, foto_url }]);
            if (insertError) throw insertError;
            setMessage("Profil kamu berhasil ditambahkan ke Jaringan Alumni!");
            setForm({ nama: "", email: "", no_hp: "", angkatan: "", jabatan: "", level: "", tempat_kerja: "", industri: "", kota: "", deskripsi: "", wa_number: "", linkedin_url: "" });
            setFotoFile(null); setFotoPreview(null);
            setFormOpen(false);
            fetchAlumni();
        } catch (err) {
            setMessage("Terjadi kesalahan: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    const filtered = alumniList.filter((a) => {
        const matchNama = a.nama?.toLowerCase().includes(searchNama.toLowerCase());
        const matchLevel = !filterLevel || a.level === filterLevel;
        const matchIndustri = !filterIndustri || a.industri === filterIndustri;
        return matchNama && matchLevel && matchIndustri;
    });

    if (checking) return <div style={{ minHeight: "60vh" }} />;
    if (!isUnlocked) return (
        <EmailGateScreen
            page="jaringan-alumni"
            onUnlock={submitEmail}
            title="Akses Jaringan Alumni"
            description="Masukkan emailmu untuk menjelajahi jaringan alumni KATI Unand — CEO, Direktur, VP, dan pemimpin industri yang siap terhubung denganmu."
        />
    );

    return (
        <div style={{ minHeight: "100vh", background: "#f8faff" }}>
            {/* ── Hero ── */}
            <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%)",
                paddingTop: "5.5rem", paddingBottom: "4.5rem",
                textAlign: "center", position: "relative", overflow: "hidden",
            }}>
                {/* Decorative orbs */}
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

                <div style={{ position: "relative", zIndex: 1, padding: "0 1.5rem" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: "999px", padding: "0.35rem 1rem", marginBottom: "1.25rem" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>Jaringan Alumni Eksklusif</span>
                    </div>

                    <h1 style={{ margin: "0 0 1rem", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
                        Terhubung dengan{" "}
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Pemimpin Industri
                        </span>
                    </h1>
                    <p style={{ margin: "0 auto 2rem", maxWidth: "560px", color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7 }}>
                        Jaringan CEO, Direktur, VP, dan Manajer alumni Teknik Industri Unand yang tersebar di berbagai industri terkemuka di Indonesia.
                    </p>

                    <div style={{ display: "flex", gap: "0.85rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <button
                            onClick={() => setFormOpen(true)}
                            style={{
                                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                color: "#fff", border: "none", borderRadius: "999px",
                                padding: "0.85rem 2rem", fontWeight: 700, fontSize: "0.95rem",
                                cursor: "pointer", boxShadow: "0 8px 24px rgba(124,58,237,0.4)",
                                fontFamily: "var(--font-body), sans-serif",
                            }}
                        >
                            + Daftarkan Profil Alumni Saya
                        </button>
                        <a href="/profil-alumni/edit" style={{
                            background: "rgba(255,255,255,0.08)", color: "#e2e8f0",
                            border: "1px solid rgba(255,255,255,0.2)", borderRadius: "999px",
                            padding: "0.85rem 2rem", fontWeight: 600, fontSize: "0.95rem",
                            textDecoration: "none",
                        }}>
                            ✎ Edit Profil Saya
                        </a>
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginTop: "2.5rem", flexWrap: "wrap" }}>
                        {[
                            { num: alumniList.length, label: "Alumni Terdaftar" },
                            { num: new Set(alumniList.map(a => a.industri).filter(Boolean)).size, label: "Industri" },
                            { num: new Set(alumniList.map(a => a.kota).filter(Boolean)).size, label: "Kota" },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff" }}>{s.num}+</div>
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Filter & List ── */}
            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "3rem 1.5rem 5rem" }}>

                {/* Filter bar */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    <input
                        type="text"
                        placeholder="🔍  Cari nama alumni..."
                        value={searchNama}
                        onChange={(e) => setSearchNama(e.target.value)}
                        style={filterInputStyle}
                    />
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={filterSelectStyle}>
                        <option value="">Semua Level</option>
                        {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <select value={filterIndustri} onChange={(e) => setFilterIndustri(e.target.value)} style={filterSelectStyle}>
                        <option value="">Semua Industri</option>
                        {INDUSTRI_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>

                {/* Result count */}
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.5rem", fontWeight: 500 }}>
                    Menampilkan <strong>{filtered.length}</strong> dari {alumniList.length} alumni
                </p>

                {/* Grid */}
                {loadingList ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ height: "260px", background: "#e2e8f0", borderRadius: "16px", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "5rem 2rem", color: "#94a3b8" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                        <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#64748b", marginBottom: "0.5rem" }}>
                            {searchNama || filterLevel || filterIndustri ? "Tidak ada alumni yang cocok" : "Belum ada alumni yang terdaftar"}
                        </div>
                        <p style={{ fontSize: "0.9rem" }}>
                            {searchNama || filterLevel || filterIndustri ? "Coba ubah filter pencarian" : "Jadilah yang pertama mendaftar!"}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                        {filtered.map((a) => (
                            <AlumniCard key={a.id} alumni={a} onSelect={() => setSelected(a)} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Modal Daftar ── */}
            {formOpen && (
                <div onClick={() => setFormOpen(false)} style={modalOverlayStyle}>
                    <div onClick={(e) => e.stopPropagation()} style={modalBoxStyle}>
                        <button onClick={() => setFormOpen(false)} style={closeBtnStyle}>✕</button>
                        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.3rem", color: "#0f172a", fontWeight: 800 }}>Daftarkan Profil Alumni</h2>
                        <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: "#64748b" }}>Khusus untuk alumni yang sudah berkarier di posisi manajerial ke atas.</p>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                            <FormRow label="Nama Lengkap *">
                                <input type="text" name="nama" value={form.nama} onChange={handleChange} required style={inp} />
                            </FormRow>
                            <FormRow label="Email * (untuk edit profil)">
                                <input type="email" name="email" value={form.email} onChange={handleChange} required style={inp} />
                            </FormRow>
                            <FormRow label="No HP * (untuk edit profil)">
                                <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} required style={inp} />
                            </FormRow>
                            <FormRow label="Angkatan">
                                <input type="text" name="angkatan" value={form.angkatan} onChange={handleChange} placeholder="misal: 2010" style={inp} />
                            </FormRow>
                            <FormRow label="Level Jabatan *">
                                <select name="level" value={form.level} onChange={handleChange} required style={inp}>
                                    <option value="">-- Pilih Level --</option>
                                    {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Jabatan / Posisi *">
                                <input type="text" name="jabatan" value={form.jabatan} onChange={handleChange} required placeholder="misal: Head of Supply Chain" style={inp} />
                            </FormRow>
                            <FormRow label="Perusahaan *">
                                <input type="text" name="tempat_kerja" value={form.tempat_kerja} onChange={handleChange} required style={inp} />
                            </FormRow>
                            <FormRow label="Industri">
                                <select name="industri" value={form.industri} onChange={handleChange} style={inp}>
                                    <option value="">-- Pilih Industri --</option>
                                    {INDUSTRI_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </FormRow>
                            <FormRow label="Kota">
                                <input type="text" name="kota" value={form.kota} onChange={handleChange} placeholder="misal: Jakarta" style={inp} />
                            </FormRow>
                            <FormRow label="Deskripsi Singkat">
                                <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3} maxLength={300} style={inp} placeholder="Ceritakan perjalanan kariermu..." />
                            </FormRow>
                            <FormRow label="WhatsApp (untuk dihubungi)">
                                <input type="text" name="wa_number" value={form.wa_number} onChange={handleChange} placeholder="62812xxxxxxxx" style={inp} />
                            </FormRow>
                            <FormRow label="LinkedIn">
                                <input type="text" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} style={inp} />
                            </FormRow>
                            <FormRow label="Foto Profil">
                                <input type="file" accept="image/*" onChange={handlePhotoSelect} />
                                {fotoPreview && (
                                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <img src={fotoPreview} alt="Preview" style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }} />
                                        <span style={{ fontSize: "0.8rem", color: "#666" }}>Foto siap diunggah</span>
                                    </div>
                                )}
                            </FormRow>

                            <button type="submit" disabled={loading} style={{
                                padding: "0.85rem", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700,
                                fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer",
                                fontFamily: "var(--font-body), sans-serif", marginTop: "0.5rem",
                            }}>
                                {loading ? "Mengirim..." : "Daftarkan Profil"}
                            </button>

                            {message && (
                                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: message.startsWith("Profil") ? "#15803d" : "#b91c1c", textAlign: "center" }}>
                                    {message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal Detail Alumni ── */}
            {selected && <AlumniDetailModal alumni={selected} onClose={() => setSelected(null)} />}

            {rawImageForCrop && (
                <PhotoCropper imageSrc={rawImageForCrop} onCancel={() => setRawImageForCrop(null)} onCropDone={handleCropDone} />
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

// ── Alumni Card ────────────────────────────────────────────────────────────────
function AlumniCard({ alumni, onSelect }) {
    const levelStyle = getLevelStyle(alumni.level);
    return (
        <div
            onClick={onSelect}
            style={{
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex",
                flexDirection: "column",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,23,42,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(15,23,42,0.06)"; }}
        >
            {/* Photo header */}
            <div style={{ position: "relative", background: "linear-gradient(135deg, #1e1b4b, #312e81)", padding: "1.75rem 1.5rem 3.5rem", textAlign: "center" }}>
                <div style={{
                    width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto",
                    border: "3px solid rgba(255,255,255,0.3)", overflow: "hidden",
                    background: "#4c1d95", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {alumni.foto_url ? (
                        <img src={alumni.foto_url} alt={alumni.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#a78bfa" }}>
                            {alumni.nama?.charAt(0)?.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: "0 1.25rem 1.25rem", marginTop: "-2.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                {alumni.level && (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <span style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: levelStyle.bg,
                            color: levelStyle.text,
                            border: `1px solid ${levelStyle.border}`,
                        }}>
                            {alumni.level}
                        </span>
                    </div>
                )}

                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#0f172a", marginBottom: "0.2rem" }}>
                    {alumni.nama}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#7c3aed", fontWeight: 600, marginBottom: "0.15rem" }}>
                    {alumni.jabatan}
                </div>
                <div style={{ fontSize: "0.83rem", color: "#64748b", marginBottom: "0.5rem" }}>
                    {alumni.tempat_kerja}{alumni.kota ? ` · ${alumni.kota}` : ""}
                </div>

                {alumni.angkatan && (
                    <div style={{ display: "inline-block", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", background: "#f8faff", border: "1px solid #e2e8f0", borderRadius: "999px", padding: "0.2rem 0.65rem", marginBottom: "0.75rem" }}>
                        Angkatan {alumni.angkatan}
                    </div>
                )}

                {alumni.industri && (
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.5rem" }}>
                        🏭 {alumni.industri}
                    </div>
                )}

                <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                        {alumni.wa_number && (
                            <a href={`https://wa.me/${alumni.wa_number}`} target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={socialBtnStyle("#25D366")}>
                                <WhatsAppIcon />
                            </a>
                        )}
                        {alumni.linkedin_url && (
                            <a href={alumni.linkedin_url} target="_blank" rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                style={socialBtnStyle("#0A66C2")}>
                                <LinkedInIcon />
                            </a>
                        )}
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }}>Lihat Profil →</span>
                </div>
            </div>
        </div>
    );
}

// ── Alumni Detail Modal ────────────────────────────────────────────────────────
function AlumniDetailModal({ alumni, onClose }) {
    const levelStyle = getLevelStyle(alumni.level);
    return (
        <div onClick={onClose} style={{ ...modalOverlayStyle, backdropFilter: "blur(4px)" }}>
            <div onClick={e => e.stopPropagation()} style={{ ...modalBoxStyle, maxWidth: "520px" }}>
                <button onClick={onClose} style={closeBtnStyle}>✕</button>

                {/* Header */}
                <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: "12px", padding: "2rem", textAlign: "center", marginBottom: "1.5rem" }}>
                    <div style={{ width: "90px", height: "90px", borderRadius: "50%", margin: "0 auto 1rem", border: "3px solid rgba(255,255,255,0.3)", overflow: "hidden", background: "#4c1d95", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {alumni.foto_url ? (
                            <img src={alumni.foto_url} alt={alumni.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <span style={{ fontSize: "2.2rem", fontWeight: 800, color: "#a78bfa" }}>{alumni.nama?.charAt(0)?.toUpperCase()}</span>
                        )}
                    </div>
                    {alumni.level && (
                        <span style={{ display: "inline-block", padding: "0.25rem 0.85rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 700, background: levelStyle.bg, color: levelStyle.text, marginBottom: "0.75rem" }}>
                            {alumni.level}
                        </span>
                    )}
                    <h2 style={{ margin: 0, color: "#fff", fontSize: "1.35rem", fontWeight: 800 }}>{alumni.nama}</h2>
                    <p style={{ margin: "0.3rem 0 0", color: "#a78bfa", fontWeight: 600, fontSize: "0.95rem" }}>{alumni.jabatan}</p>
                    <p style={{ margin: "0.2rem 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>{alumni.tempat_kerja}{alumni.kota ? ` · ${alumni.kota}` : ""}</p>
                </div>

                {/* Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {alumni.angkatan && <InfoRow icon="🎓" label="Angkatan" value={alumni.angkatan} />}
                    {alumni.industri && <InfoRow icon="🏭" label="Industri" value={alumni.industri} />}
                    {alumni.deskripsi && (
                        <div>
                            <div style={detailLabel}>Tentang</div>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#374151", lineHeight: 1.65 }}>{alumni.deskripsi}</p>
                        </div>
                    )}
                </div>

                {/* Contact */}
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                    {alumni.wa_number && (
                        <a href={`https://wa.me/${alumni.wa_number}`} target="_blank" rel="noreferrer" style={contactChipStyle("#25D366")}>
                            <WhatsAppIcon /> WhatsApp
                        </a>
                    )}
                    {alumni.linkedin_url && (
                        <a href={alumni.linkedin_url} target="_blank" rel="noreferrer" style={contactChipStyle("#0A66C2")}>
                            <LinkedInIcon /> LinkedIn
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline" }}>
            <span style={{ fontSize: "0.9rem" }}>{icon}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#94a3b8", minWidth: "70px" }}>{label}</span>
            <span style={{ fontSize: "0.9rem", color: "#374151", fontWeight: 600 }}>{value}</span>
        </div>
    );
}

function FormRow({ label, children }) {
    return (
        <div>
            <label style={{ display: "block", fontSize: "0.83rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>{label}</label>
            {children}
        </div>
    );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const inp = {
    width: "100%", padding: "0.6rem 0.75rem",
    border: "1.5px solid #e2e8f0", borderRadius: "8px",
    fontSize: "0.9rem", fontFamily: "var(--font-body), sans-serif",
    outline: "none", boxSizing: "border-box", color: "#0f172a",
};

const filterInputStyle = {
    ...inp, flex: "1 1 200px", background: "#fff",
    boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
};

const filterSelectStyle = {
    ...inp, width: "auto", minWidth: "180px", background: "#fff",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
};

const modalOverlayStyle = {
    position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "1rem", zIndex: 1000,
};

const modalBoxStyle = {
    background: "#fff", borderRadius: "16px", padding: "2rem",
    maxWidth: "480px", width: "100%", maxHeight: "90vh",
    overflowY: "auto", position: "relative",
    boxShadow: "0 24px 64px rgba(15,23,42,0.25)",
};

const closeBtnStyle = {
    position: "absolute", top: "1rem", right: "1rem",
    border: "none", background: "#f1f5f9", borderRadius: "50%",
    width: "32px", height: "32px", fontSize: "1rem",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
};

const detailLabel = {
    fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem",
};

const socialBtnStyle = (color) => ({
    width: "32px", height: "32px", borderRadius: "50%",
    backgroundColor: color, color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    textDecoration: "none",
});

const contactChipStyle = (color) => ({
    display: "flex", alignItems: "center", gap: "0.4rem",
    background: color, color: "#fff", borderRadius: "999px",
    padding: "0.5rem 1rem", fontWeight: 600, fontSize: "0.85rem",
    textDecoration: "none",
});