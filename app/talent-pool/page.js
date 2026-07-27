"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import TalentList from "./TalentList";
import PhotoCropper from "./PhotoCropper";
import { BIDANG_MINAT_OPTIONS } from "@/lib/bidangMinat";

function sanitizeFileName(fileName) {
    const ext = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    return `${cleaned}.${ext}`;
}

const emptyExperience = { role: "", tempat: "" };

export default function TalentPool() {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        no_hp: "",
        wa_number: "",
        angkatan: "",
        deskripsi_diri: "",
        final_project: "",
        portfolio: "",
        linkedin_url: "",
        instagram_url: "",
        consent: false,
    });

    const [bidangMinat, setBidangMinat] = useState([]);
    const [experiences, setExperiences] = useState([{ ...emptyExperience }]);

    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);
    const [cvFile, setCvFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }

    function toggleBidang(label) {
        setBidangMinat((prev) =>
            prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label]
        );
    }

    function handleExpChange(index, field, value) {
        setExperiences((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    }

    function addExperience() {
        if (experiences.length >= 4) return;
        setExperiences((prev) => [...prev, { ...emptyExperience }]);
    }

    function removeExperience(index) {
        setExperiences((prev) => prev.filter((_, i) => i !== index));
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

    function resetForm() {
        setForm({
            nama: "",
            email: "",
            no_hp: "",
            wa_number: "",
            angkatan: "",
            deskripsi_diri: "",
            final_project: "",
            portfolio: "",
            linkedin_url: "",
            instagram_url: "",
            consent: false,
        });
        setBidangMinat([]);
        setExperiences([{ ...emptyExperience }]);
        setFotoFile(null);
        setFotoPreview(null);
        setCvFile(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");

        if (!form.consent) {
            setMessage("Kamu harus menyetujui data ditampilkan publik terlebih dahulu.");
            return;
        }

        setLoading(true);

        try {
            let foto_url = null;
            let cv_url = null;

            if (fotoFile) {
                const fotoName = `talent_${Date.now()}_foto.jpg`;
                const { error: fotoError } = await supabase.storage
                    .from("Photo")
                    .upload(fotoName, fotoFile, { contentType: "image/jpeg" });
                if (fotoError) throw fotoError;
                const { data: fotoPublicUrl } = supabase.storage.from("Photo").getPublicUrl(fotoName);
                foto_url = fotoPublicUrl.publicUrl;
            }

            if (cvFile) {
                const cvName = `${Date.now()}_${sanitizeFileName(cvFile.name)}`;
                const { error: cvError } = await supabase.storage.from("CV").upload(cvName, cvFile);
                if (cvError) throw cvError;
                const { data: cvPublicUrl } = supabase.storage.from("CV").getPublicUrl(cvName);
                cv_url = cvPublicUrl.publicUrl;
            }

            const cleanedExperiences = experiences
                .filter((exp) => exp.role.trim() !== "" || exp.tempat.trim() !== "")
                .slice(0, 4);

            const { error: insertError } = await supabase.from("talent_pool").insert([
                {
                    ...form,
                    bidang_minat: bidangMinat,
                    experience: cleanedExperiences,
                    foto_url,
                    cv_url,
                },
            ]);
            if (insertError) throw insertError;

            setMessage("Berhasil! Profil kamu sudah masuk ke Talent Pool.");
            resetForm();
            setRefreshKey((k) => k + 1);
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
                <div className="hero-breadcrumb">Beranda / Talent Pool</div>
                <h1 className="hero-title">Talent Pool</h1>
                <p className="hero-subtitle">
                    Temukan talenta fresh graduate Teknik Industri Unand sesuai kebutuhan perusahaanmu
                </p>
            </div>

            <div style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
                <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                    Sudah pernah daftar dan mau ubah data?{" "}
                    <a href="/talent-pool/edit" style={{ color: "#e8823c", fontWeight: 600 }}>
                        Edit profil kamu di sini →
                    </a>
                </div>

                <details style={{ marginBottom: "2.5rem" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "#12233f" }}>
                        + Daftar ke Talent Pool
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
                            <label>No HP *</label>
                            <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} required style={inputStyle} />
                            <p style={hintStyle}>Ingat baik-baik, dipakai nanti untuk mengedit profil kamu</p>
                        </div>

                        <div>
                            <label>Nomor WhatsApp (untuk dihubungi langsung) *</label>
                            <input
                                type="text"
                                name="wa_number"
                                placeholder="Contoh: 6281234567890"
                                value={form.wa_number}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                            />
                            <p style={hintStyle}>Gunakan format 62xxxxxxxxxx (tanpa tanda + atau 0 di depan)</p>
                        </div>

                        <div>
                            <label>Angkatan (opsional)</label>
                            <input
                                type="text"
                                name="angkatan"
                                placeholder="misal: 2020"
                                value={form.angkatan}
                                onChange={handleChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Bidang Minat (bisa pilih lebih dari satu) *</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.4rem" }}>
                                {BIDANG_MINAT_OPTIONS.map((b) => {
                                    const active = bidangMinat.includes(b.label);
                                    return (
                                        <button
                                            type="button"
                                            key={b.label}
                                            onClick={() => toggleBidang(b.label)}
                                            style={{
                                                padding: "0.4rem 0.9rem",
                                                borderRadius: "999px",
                                                border: active ? `2px solid ${b.text}` : "1px solid #ddd",
                                                backgroundColor: active ? b.bg : "#fafafa",
                                                color: active ? b.text : "#666",
                                                fontSize: "0.82rem",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                            }}
                                        >
                                            {b.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label>Ceritakan Tentang Dirimu (maks 300 karakter)</label>
                            <textarea
                                name="deskripsi_diri"
                                value={form.deskripsi_diri}
                                onChange={handleChange}
                                rows={3}
                                maxLength={300}
                                style={inputStyle}
                            />
                            <p style={hintStyle}>{form.deskripsi_diri.length}/300</p>
                        </div>

                        <div>
                            <label>Final Project / Tugas Akhir (maks 300 karakter)</label>
                            <textarea
                                name="final_project"
                                value={form.final_project}
                                onChange={handleChange}
                                rows={3}
                                maxLength={300}
                                style={inputStyle}
                            />
                            <p style={hintStyle}>{form.final_project.length}/300</p>
                        </div>

                        <div>
                            <label>Portfolio (opsional) — link website, YouTube, dll</label>
                            <textarea
                                name="portfolio"
                                value={form.portfolio}
                                onChange={handleChange}
                                rows={2}
                                maxLength={200}
                                placeholder="Contoh: Dashboard Maintenance System — youtube.com/..."
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Pengalaman (maks 4)</label>
                            {experiences.map((exp, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
                                    <input
                                        type="text"
                                        placeholder="Peran (mis. Intern)"
                                        value={exp.role}
                                        onChange={(e) => handleExpChange(i, "role", e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                                        maxLength={60}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tempat (mis. PT Semen Padang)"
                                        value={exp.tempat}
                                        onChange={(e) => handleExpChange(i, "tempat", e.target.value)}
                                        style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                                        maxLength={60}
                                    />
                                    {experiences.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeExperience(i)}
                                            style={{ border: "none", background: "none", color: "#c00", cursor: "pointer", fontSize: "1.1rem" }}
                                            title="Hapus"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            {experiences.length < 4 && (
                                <button
                                    type="button"
                                    onClick={addExperience}
                                    style={{
                                        marginTop: "0.5rem",
                                        border: "1px dashed #12233f",
                                        background: "none",
                                        color: "#12233f",
                                        padding: "0.4rem 0.8rem",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    + Tambah Pengalaman
                                </button>
                            )}
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

                        <div>
                            <label>Upload CV (PDF)</label>
                            <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} id="consent" />
                            <label htmlFor="consent">
                                Saya setuju data ini ditampilkan secara publik di website KATI Unand
                            </label>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? "Mengirim..." : "Kirim"}
                        </button>

                        {message && <p>{message}</p>}
                    </form>
                </details>

                <TalentList key={refreshKey} />
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
    textAlign: "right",
};