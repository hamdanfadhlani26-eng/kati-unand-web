"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import TalentList from "./TalentList";

function sanitizeFileName(fileName) {
    const ext = fileName.split(".").pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
    const cleaned = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 50);
    return `${cleaned}.${ext}`;
}

export default function TalentPool() {
    const [form, setForm] = useState({
        nama: "",
        email: "",
        no_hp: "",
        deskripsi_diri: "",
        final_project: "",
        experience: "",
        bidang_minat: "",
        linkedin_url: "",
        instagram_url: "",
        consent: false,
    });

    const [fotoFile, setFotoFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
                const fotoName = `talent_${Date.now()}_${sanitizeFileName(fotoFile.name)}`;
                const { error: fotoError } = await supabase.storage.from("Photo").upload(fotoName, fotoFile);
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

            const { error: insertError } = await supabase.from("talent_pool").insert([
                { ...form, foto_url, cv_url },
            ]);
            if (insertError) throw insertError;

            setMessage("Berhasil! Profil kamu sudah masuk ke Talent Pool.");
            setForm({
                nama: "",
                email: "",
                no_hp: "",
                deskripsi_diri: "",
                final_project: "",
                experience: "",
                bidang_minat: "",
                linkedin_url: "",
                instagram_url: "",
                consent: false,
            });
            setFotoFile(null);
            setCvFile(null);
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
                        </div>

                        <div>
                            <label>No HP *</label>
                            <input type="text" name="no_hp" value={form.no_hp} onChange={handleChange} required style={inputStyle} />
                        </div>

                        <div>
                            <label>Bidang Minat</label>
                            <select name="bidang_minat" value={form.bidang_minat} onChange={handleChange} style={inputStyle}>
                                <option value="">Pilih bidang minat</option>
                                <option value="PPIC">PPIC</option>
                                <option value="Lean / Continuous Improvement">Lean / Continuous Improvement</option>
                                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                                <option value="Quality Assurance / Quality Control">Quality Assurance / Quality Control</option>
                                <option value="Procurement / Purchasing">Procurement / Purchasing</option>
                                <option value="Manufacturing / Production Engineering">Manufacturing / Production Engineering</option>
                                <option value="Maintenance & Reliability Engineering">Maintenance & Reliability Engineering</option>
                                <option value="Ergonomi & K3">Ergonomi & K3</option>
                                <option value="Project Management">Project Management</option>
                                <option value="Business Development">Business Development</option>
                                <option value="Human Capital / HR">Human Capital / HR</option>
                                <option value="Data Analyst / Business Intelligence">Data Analyst / Business Intelligence</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label>Ceritakan Tentang Dirimu</label>
                            <textarea name="deskripsi_diri" value={form.deskripsi_diri} onChange={handleChange} rows={4} style={inputStyle} />
                        </div>

                        <div>
                            <label>Final Project / Tugas Akhir</label>
                            <textarea name="final_project" value={form.final_project} onChange={handleChange} rows={3} style={inputStyle} />
                        </div>

                        <div>
                            <label>Pengalaman (Magang/Kerja/Organisasi)</label>
                            <textarea name="experience" value={form.experience} onChange={handleChange} rows={3} style={inputStyle} />
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