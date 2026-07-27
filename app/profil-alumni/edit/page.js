"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import PhotoCropper from "../PhotoCropper";

export default function EditAlumniPage() {
    const [step, setStep] = useState("lookup"); // lookup | form
    const [email, setEmail] = useState("");
    const [noHp, setNoHp] = useState("");
    const [lookupError, setLookupError] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);

    const [recordId, setRecordId] = useState(null);
    const [form, setForm] = useState(null);

    const [fotoFile, setFotoFile] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [rawImageForCrop, setRawImageForCrop] = useState(null);

    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    async function handleLookup(e) {
        e.preventDefault();
        setLookupError("");
        setLookupLoading(true);

        const { data, error } = await supabase
            .from("alumni_profiles")
            .select("*")
            .eq("email", email.trim())
            .eq("no_hp", noHp.trim())
            .maybeSingle();

        setLookupLoading(false);

        if (error || !data) {
            setLookupError("Email atau No HP tidak cocok dengan data yang terdaftar. Coba periksa lagi.");
            return;
        }

        setRecordId(data.id);
        setForm({
            nama: data.nama || "",
            email: data.email || "",
            no_hp: data.no_hp || "",
            angkatan: data.angkatan || "",
            tempat_kerja: data.tempat_kerja || "",
            jabatan: data.jabatan || "",
            deskripsi: data.deskripsi || "",
            wa_number: data.wa_number || "",
            linkedin_url: data.linkedin_url || "",
            instagram_url: data.instagram_url || "",
        });
        setFotoPreview(data.foto_url || null);
        setStep("form");
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

    async function handleSave(e) {
        e.preventDefault();
        setSaveMessage("");
        setSaving(true);

        try {
            let foto_url = undefined;

            if (fotoFile) {
                const fotoName = `alumni_${Date.now()}_foto.jpg`;
                const { error: fotoError } = await supabase.storage
                    .from("Photo")
                    .upload(fotoName, fotoFile, { contentType: "image/jpeg" });
                if (fotoError) throw fotoError;
                const { data: fotoPublicUrl } = supabase.storage.from("Photo").getPublicUrl(fotoName);
                foto_url = fotoPublicUrl.publicUrl;
            }

            const updatePayload = { ...form };
            if (foto_url !== undefined) updatePayload.foto_url = foto_url;

            const { error: updateError } = await supabase
                .from("alumni_profiles")
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
                    <div className="hero-breadcrumb">Beranda / Profil Alumni / Edit</div>
                    <h1 className="hero-title">Edit Profil Alumni</h1>
                    <p className="hero-subtitle">Masukkan email dan no HP yang kamu gunakan saat mendaftar</p>
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
                            <label>No HP</label>
                            <input
                                type="text"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                required
                                style={inputStyle}
                            />
                            <p style={hintStyle}>Isi persis seperti saat kamu mendaftar</p>
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
                <div className="hero-breadcrumb">Beranda / Profil Alumni / Edit</div>
                <h1 className="hero-title">Edit Profil Alumni</h1>
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
                        <p style={hintStyle}>Kalau email diganti, gunakan email baru ini saat edit berikutnya</p>
                    </div>

                    <div>
                        <label>No HP *</label>
                        <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} required style={inputStyle} />
                        <p style={hintStyle}>Kalau No HP diganti, gunakan nomor baru ini saat edit berikutnya</p>
                    </div>

                    <div>
                        <label>Angkatan</label>
                        <input type="text" name="angkatan" value={form.angkatan} onChange={handleChange} style={inputStyle} />
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
                        <label>Nomor WhatsApp</label>
                        <input type="text" name="wa_number" value={form.wa_number} onChange={handleChange} style={inputStyle} />
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