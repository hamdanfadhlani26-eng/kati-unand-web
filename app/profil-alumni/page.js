"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(fileName) {
    const ext = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    return `${cleaned}.${ext}`;
}

export default function ProfilAlumni() {
    const [form, setForm] = useState({
        nama: "",
        angkatan: "",
        tempat_kerja: "",
        jabatan: "",
        deskripsi: "",
        linkedin_url: "",
        instagram_url: "",
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [alumniList, setAlumniList] = useState([]);
    const [loadingList, setLoadingList] = useState(true);

    useEffect(() => {
        fetchAlumni();
    }, []);

    async function fetchAlumni() {
        setLoadingList(true);
        const { data, error } = await supabase
            .from("alumni_profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setAlumniList(data);
        setLoadingList(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            let foto_url = null;

            if (fotoFile) {
                const fotoName = `alumni_${Date.now()}_${sanitizeFileName(fotoFile.name)}`;
                const { error: fotoError } = await supabase.storage
                    .from("Photo")
                    .upload(fotoName, fotoFile);
                if (fotoError) throw fotoError;

                const { data: fotoPublicUrl } = supabase.storage
                    .from("Photo")
                    .getPublicUrl(fotoName);
                foto_url = fotoPublicUrl.publicUrl;
            }

            const { error: insertError } = await supabase.from("alumni_profiles").insert([
                { ...form, foto_url },
            ]);
            if (insertError) throw insertError;

            setMessage("Berhasil! Profil kamu sudah ditambahkan.");
            setForm({
                nama: "",
                angkatan: "",
                tempat_kerja: "",
                jabatan: "",
                deskripsi: "",
                linkedin_url: "",
                instagram_url: "",
            });
            setFotoFile(null);
            fetchAlumni();
        } catch (err) {
            console.error(err);
            setMessage("Terjadi kesalahan: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="hero">
                <div className="hero-breadcrumb">Beranda / Profil Alumni</div>
                <h1 className="hero-title">Profil Alumni</h1>
                <p className="hero-subtitle">
                    Lihat sebaran alumni Teknik Industri Unand di berbagai perusahaan
                </p>
            </div>

            <div style={{ padding: "3rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
                <details style={{ marginBottom: "2.5rem" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#12233f" }}>
                        + Daftarkan Profil Saya
                    </summary>

                    <form
                        onSubmit={handleSubmit}
                        style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem", maxWidth: "480px" }}
                    >
                        <div>
                            <label>Nama Lengkap *</label>
                            <input type="text" name="nama" value={form.nama} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div>
                            <label>Angkatan</label>
                            <input type="text" name="angkatan" value={form.angkatan} onChange={handleChange} style={inputStyle} placeholder="misal: 2018" />
                        </div>

                        <div>
                            <label>Tempat Kerja Sekarang</label>
                            <input type="text" name="tempat_kerja" value={form.tempat_kerja} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div>
                            <label>Jabatan</label>
                            <input type="text" name="jabatan" value={form.jabatan} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div>
                            <label>Deskripsi Singkat</label>
                            <textarea name="deskripsi" value={form.deskripsi} onChange={handleChange} rows={3} style={inputStyle} />
                        </div>

                        <div>
                            <label>LinkedIn (opsional)</label>
                            <input type="text" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div>
                            <label>Instagram (opsional)</label>
                            <input type="text" name="instagram_url" value={form.instagram_url} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div>
                            <label>Upload Foto</label>
                            <input type="file" accept="image/*" onChange={(e) => setFotoFile(e.target.files[0])} />
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? "Mengirim..." : "Kirim"}
                        </button>

                        {message && <p>{message}</p>}
                    </form>
                </details>

                {loadingList ? (
                    <p>Memuat data alumni...</p>
                ) : alumniList.length === 0 ? (
                    <p style={{ color: "#666" }}>Belum ada alumni yang terdaftar.</p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {alumniList.map((a) => (
                            <AlumniCard key={a.id} alumni={a} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function AlumniCard({ alumni }) {
    const [expanded, setExpanded] = useState(false);
    const desc = alumni.deskripsi || "";
    const isLong = desc.length > 140;
    const shownText = expanded || !isLong ? desc : desc.slice(0, 140).trim() + "...";

    return (
        <div
            style={{
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#fff",
            }}
        >
            <div
                style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    backgroundColor: "#e5e7eb",
                    overflow: "hidden",
                }}
            >
                {alumni.foto_url ? (
                    <img
                        src={alumni.foto_url}
                        alt={alumni.nama}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            fontSize: "0.85rem",
                        }}
                    >
                        Tidak ada foto
                    </div>
                )}
            </div>

            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#12233f" }}>
                    {alumni.nama}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.15rem" }}>
                    {alumni.jabatan}
                    {alumni.tempat_kerja ? ` · ${alumni.tempat_kerja}` : ""}
                </div>
                {alumni.angkatan && (
                    <div className="eyebrow" style={{ marginTop: "0.5rem" }}>
                        Angkatan {alumni.angkatan}
                    </div>
                )}

                {desc && (
                    <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.6, marginTop: "0.75rem", flex: 1 }}>
                        {shownText}
                        {isLong && (
                            <span
                                onClick={() => setExpanded(!expanded)}
                                style={{ color: "#e8823c", fontWeight: 600, cursor: "pointer", marginLeft: "4px" }}
                            >
                                {expanded ? " Tampilkan lebih sedikit" : " Baca selengkapnya"}
                            </span>
                        )}
                    </p>
                )}

                {(alumni.linkedin_url || alumni.instagram_url) && (
                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "1rem" }}>
                        {alumni.linkedin_url && (
                            <a href={alumni.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.82rem", color: "#12233f", fontWeight: 600 }}>
                                LinkedIn
                            </a>
                        )}
                        {alumni.instagram_url && (
                            <a href={alumni.instagram_url} target="_blank" rel="noreferrer" style={{ fontSize: "0.82rem", color: "#12233f", fontWeight: 600 }}>
                                Instagram
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "0.55rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginTop: "0.25rem",
};