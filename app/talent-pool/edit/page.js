"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import PhotoCropper from "../PhotoCropper";
import { BIDANG_MINAT_OPTIONS } from "@/lib/bidangMinat";

function sanitizeFileName(fileName) {
    const ext = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    return `${cleaned}.${ext}`;
}

const emptyExperience = { role: "", tempat: "" };

export default function EditTalentPage() {
    const [step, setStep] = useState("lookup"); // lookup | form
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");
    const [lookupError, setLookupError] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);

    const [recordId, setRecordId] = useState(null);
    const [form, setForm] = useState(null);
    const [bidangMinat, setBidangMinat] = useState([]);
    const [experiences, setExperiences] = useState([{ ...emptyExperience }]);

    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);
    const [cvFile, setCvFile] = useState(null);

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    async function handleLookup(e) {
        e.preventDefault();
        setLookupError("");
        setLookupLoading(true);

        const { data, error } = await supabase
            .from("talent_pool")
            .select("*")
            .eq("email", email.trim())
            .eq("edit_pin", pin.trim())
            .maybeSingle();

        setLookupLoading(false);

        if (error || !data) {
            setLookupError("Email atau kode PIN tidak cocok. Coba periksa lagi.");
            return;
        }

        setRecordId(data.id);
        setForm({
            nama: data.nama || "",
            email: data.email || "",
            no_hp: data.no_hp || "",
            wa_number: data.wa_number || "",
            deskripsi_diri: data.deskripsi_diri || "",
            final_project: data.final_project || "",
            portfolio: data.portfolio || "",
            linkedin_url: data.linkedin_url || "",
            instagram_url: data.instagram_url || "",
        });
        setBidangMinat(Array.isArray(data.bidang_minat) ? data.bidang_minat : []);
        setExperiences(
            Array.isArray(data.experience) && data.experience.length > 0
                ? data.experience
                : [{ ...emptyExperience }]
        );
        setFotoPreview(data.foto_url || null);
        setStep("form");
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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

    async function handleSave(e) {
        e.preventDefault();
        setSaveMessage("");
        setSaving(true);

        try {
            let foto_url = undefined; // undefined = jangan diubah kalau tidak ganti foto

            if (fotoFile) {
                const fotoName = `talent_${Date.now()}_foto.jpg`;
                const { error: fotoError } = await supabase.storage
                    .from("Photo")
                    .upload(fotoName, fotoFile, { contentType: "image/jpeg" });
                if (fotoError) throw fotoError;
                const { data: fotoPublicUrl } = supabase.storage.from("Photo").getPublicUrl(fotoName);
                foto_url = fotoPublicUrl.publicUrl;
            }

            let cv_url = undefined;
            if (cvFile) {
                const cvName = `${Date.now()}_${sanitizeFileName(cvFile.name)}`;
                const { error: cvError } = await supabase.storage.from("CV").upload(cvName, cvFile);
                if (cvError) throw cvError;
                const { data: cvPublicUrl } = supabase.storage.from("CV").getPublicUrl(cvName);
                cv_url = cvPublicUrl.publicUrl;
            }

            const cleanedExperiences = experiences.filter(
                (exp) => exp.role.trim() !== "" || exp.tempat.trim() !== ""
            ).slice(0, 4);

            const updatePayload = {
                ...form,
                bidang_minat: bidangMinat,
                experience: cleanedExperiences,
            };
            if (foto_url !== undefined) updatePayload.foto_url = foto_url;
            if (cv_url !== undefined) updatePayload.cv_url = cv_url;

            const { error: updateError } = await supabase
                .from("talent_pool")
                .update(updatePayload)
                .eq("id", recordId);

            if (updateError) throw updateError;

            setSaveMessage("Perubahan berhasil disimpan!");
        } catch (err) {
            console.error(err);
            setSaveMessage("Terjadi kesalahan: " + err.message);
        } finally {
            setSaving(false);
        }
    }

    if (step === "lookup") {
        return (
            <div>
                <div className="hero">
                    <div className="hero-breadcrumb">Beranda / Talent Pool / Edit</div>
                    <h1 className="hero-title">Edit Profil Talent</h1>
                    <p className="hero-subtitle">Masukkan email dan kode PIN yang kamu terima saat mendaftar</p>
                </div>

                <div style={{ padding: "3rem 2rem", maxWidth: "420px", margin: "0 auto" }}>
                    <form onSubmit={handleLookup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label>Kode PIN (6 digit)</label>
                            <input
                                type="text"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                required
                                maxLength={6}
                                style={inputStyle}
                            />
                        </div>
                        <button type="submit" disabled={lookupLoading} className="btn-primary">
                            {lookupLoading ? "Memeriksa..." : "Lanjutkan"}
                        </button>
                        {lookupError && <p style={{ color: "#c00" }}>{lookupError}</p>}
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="hero">
                <div className="hero-breadcrumb">Beranda / Talent Pool / Edit</div>
                <h1 className="hero-title">Edit Profil Talent</h1>
                <p className="hero-subtitle">Ubah data kamu di bawah ini, lalu simpan</p>
            </div>

            <div style={{ padding: "3rem 2rem", maxWidth: "480px", margin: "0 auto" }}>
                <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label>Nama Lengkap *</label>
                        <input type="text" name="nama" value={form.nama} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label>Email *</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label>No HP *</label>
                        <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label>Nomor WhatsApp *</label>
                        <input type="text" name="wa_number" value={form.wa_number} onChange={handleChange} required style={inputStyle} />
                        <p style={hintStyle}>Format 62xxxxxxxxxx (tanpa + atau 0 di depan)</p>
                    </div>

                    <div>
                        <label>Bidang Minat (bisa lebih dari satu)</label>
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
                    </div>

                    <div>
                        <label>Portfolio (opsional)</label>
                        <textarea
                            name="portfolio"
                            value={form.portfolio}
                            onChange={handleChange}
                            rows={2}
                            maxLength={200}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Pengalaman (maks 4)</label>
                        {experiences.map((exp, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", alignItems: "center" }}>
                                <input
                                    type="text"
                                    placeholder="Peran"
                                    value={exp.role}
                                    onChange={(e) => handleExpChange(i, "role", e.target.value)}
                                    style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                                    maxLength={60}
                                />
                                <input
                                    type="text"
                                    placeholder="Tempat"
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
                        <label>Foto Profil</label>
                        {fotoPreview && (
                            <div style={{ margin: "0.5rem 0" }}>
                                <img
                                    src={fotoPreview}
                                    alt="Foto saat ini"
                                    style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
                                />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoSelect} />
                        <p style={hintStyle}>Upload foto baru hanya jika ingin menggantinya</p>
                    </div>

                    <div>
                        <label>Ganti CV (PDF, opsional)</label>
                        <input type="file" accept=".pdf" onChange={(e) => setCvFile(e.target.files[0])} />
                    </div>

                    <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>

                    {saveMessage && <p>{saveMessage}</p>}
                </form>
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
};