"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PhotoCropper from "./PhotoCropper";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon } from "./SocialIcons";

export default function ProfilAlumni() {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        no_hp: "",
        angkatan: "",
        tempat_kerja: "",
        jabatan: "",
        deskripsi: "",
        wa_number: "",
        linkedin_url: "",
        instagram_url: "",
    });
    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);
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
                    .from("Photo")
                    .upload(fotoName, fotoFile, { contentType: "image/jpeg" });
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
                email: "",
                no_hp: "",
                angkatan: "",
                tempat_kerja: "",
                jabatan: "",
                deskripsi: "",
                wa_number: "",
                linkedin_url: "",
                instagram_url: "",
            });
            setFotoFile(null);
            setFotoPreview(null);
            fetchAlumni();
        } catch (err) {
            console.error(err);
            setMessage("Terjadi kesalahan: " + err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "relative" }}>
            <div className="hero">
                <div className="hero-breadcrumb">Beranda / Profil Alumni</div>
                <h1 className="hero-title">Profil Alumni</h1>
                <p className="hero-subtitle">
                    Lihat sebaran alumni Teknik Industri Unand di berbagai perusahaan
                </p>
            </div>

            <a href="/profil-alumni/edit" style={editCornerButton}>
                ✎ Edit Profil Saya
            </a>

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
                            <label>Email *</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                            <p style={hintStyle}>Ingat baik-baik, dipakai nanti untuk mengedit profil kamu</p>
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
                            <label>No HP *</label>
                            <input type="text" name="no_hp" value={form.no_hp || ""} onChange={handleChange} required style={inputStyle} />
                            <p style={hintStyle}>Ingat baik-baik, dipakai nanti untuk mengedit profil kamu</p>
                        </div>

                        <div>
                            <label>Nomor WhatsApp (untuk dihubungi langsung)</label>
                            <input
                                type="text"
                                name="wa_number"
                                placeholder="Contoh: 6281234567890"
                                value={form.wa_number}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                            <p style={hintStyle}>Format 62xxxxxxxxxx (tanpa + atau 0 di depan)</p>
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
                            <input type="file" accept="image/*" onChange={handlePhotoSelect} />
                            {fotoPreview && (
                                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover" }}
                                    />
                                    <span style={{ fontSize: "0.8rem", color: "#666" }}>Foto siap diunggah</span>
                                </div>
                            )}
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

            {rawImageForCrop && (
                <PhotoCropper
                    imageSrc={rawImageForCrop}
                    onCancel={() => setRawImageForCrop(null)}
                    onCropDone={handleCropDone}
                />
            )}
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
                                style={{ color: "#2563eb", fontWeight: 600, cursor: "pointer", marginLeft: "4px" }}
                            >
                                {expanded ? " Tampilkan lebih sedikit" : " Baca selengkapnya"}
                            </span>
                        )}
                    </p>
                )}

                {(alumni.wa_number || alumni.linkedin_url || alumni.instagram_url) && (
                    <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.6rem" }}>
                        {alumni.wa_number && (
                            <SocialIconLink href={`https://wa.me/${alumni.wa_number}`} title="WhatsApp" color="#25D366">
                                <WhatsAppIcon />
                            </SocialIconLink>
                        )}
                        {alumni.linkedin_url && (
                            <SocialIconLink href={alumni.linkedin_url} title="LinkedIn" color="#0A66C2">
                                <LinkedInIcon />
                            </SocialIconLink>
                        )}
                        {alumni.instagram_url && (
                            <SocialIconLink href={alumni.instagram_url} title="Instagram" color="#E1306C">
                                <InstagramIcon />
                            </SocialIconLink>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function SocialIconLink({ href, title, color, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            title={title}
            style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
            }}
        >
            {children}
        </a>
    );
}

const inputStyle = {
    width: "100%",
    padding: "0.55rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginTop: "0.25rem",
};

const hintStyle = {
    fontSize: "0.75rem",
    color: "#999",
    margin: "0.2rem 0 0",
};

const editCornerButton = {
    position: "absolute",
    top: "1rem",
    right: "1.25rem",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.4)",
    padding: "0.35rem 0.85rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    fontWeight: 600,
    textDecoration: "none",
    zIndex: 10,
};