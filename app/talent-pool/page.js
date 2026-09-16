"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

// ─── OTP Step: Email Input ────────────────────────────────────────────────────
function StepEmailInput({ onOtpSent }) {
    const [emailInput, setEmailInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    async function handleSend(e) {
        e.preventDefault();
        setError("");
        setSending(true);
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email: emailInput.trim(),
                options: { shouldCreateUser: true },
            });
            if (otpError) throw otpError;
            onOtpSent(emailInput.trim());
        } catch (err) {
            setError("Gagal mengirim OTP: " + err.message);
        } finally {
            setSending(false);
        }
    }

    return (
        <div style={stepCardStyle}>
            <div style={stepIconStyle}>✉️</div>
            <h2 style={stepTitleStyle}>Verifikasi Email Kamu</h2>
            <p style={stepDescStyle}>
                Masukkan email aktifmu. Kami akan kirim kode OTP 6 digit untuk verifikasi sebelum kamu bisa mendaftar ke Talent Pool.
            </p>
            <form onSubmit={handleSend} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={labelStyle}>Alamat Email *</label>
                    <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        placeholder="contoh@email.com"
                        style={stepInputStyle}
                        autoFocus
                    />
                </div>
                {error && <p style={errorStyle}>{error}</p>}
                <button type="submit" disabled={sending} style={sending ? btnDisabledStyle : btnPrimaryStyle}>
                    {sending ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                            <span style={spinnerStyle} /> Mengirim OTP...
                        </span>
                    ) : (
                        "Kirim Kode OTP →"
                    )}
                </button>
            </form>
        </div>
    );
}

// ─── OTP Step: Verify Code ────────────────────────────────────────────────────
function StepOtpVerify({ email, onVerified, onBack }) {
    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    function handleDigitChange(index, value) {
        // Handle paste
        if (value.length > 1) {
            const pasted = value.replace(/\D/g, "").slice(0, 6);
            const newDigits = [...digits];
            for (let i = 0; i < 6; i++) {
                newDigits[i] = pasted[i] || "";
            }
            setDigits(newDigits);
            const nextIndex = Math.min(pasted.length, 5);
            inputRefs.current[nextIndex]?.focus();
            return;
        }

        const digit = value.replace(/\D/g, "");
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index, e) {
        if (e.key === "Backspace" && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    async function handleVerify(e) {
        e.preventDefault();
        const token = digits.join("");
        if (token.length < 6) {
            setError("Masukkan 6 digit kode OTP.");
            return;
        }
        setError("");
        setVerifying(true);
        try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token,
                type: "email",
            });
            if (verifyError) throw verifyError;
            // Sign out session setelah verify — kita hanya butuh konfirmasi email
            await supabase.auth.signOut();
            onVerified(email);
        } catch (err) {
            setError("Kode OTP salah atau sudah kedaluwarsa. Silakan coba lagi.");
        } finally {
            setVerifying(false);
        }
    }

    async function handleResend() {
        setResending(true);
        setResendSuccess(false);
        setError("");
        try {
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: true },
            });
            if (otpError) throw otpError;
            setCountdown(60);
            setDigits(["", "", "", "", "", ""]);
            setResendSuccess(true);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError("Gagal mengirim ulang: " + err.message);
        } finally {
            setResending(false);
        }
    }

    return (
        <div style={stepCardStyle}>
            <div style={stepIconStyle}>🔐</div>
            <h2 style={stepTitleStyle}>Masukkan Kode OTP</h2>
            <p style={stepDescStyle}>
                Kode 6 digit telah dikirim ke{" "}
                <strong style={{ color: "#12233f" }}>{email}</strong>
            </p>
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* 6 Digit OTP Boxes */}
                <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center" }}>
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputRefs.current[i] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={d}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            style={otpBoxStyle(d)}
                            autoFocus={i === 0}
                        />
                    ))}
                </div>

                {error && <p style={{ ...errorStyle, textAlign: "center" }}>{error}</p>}
                {resendSuccess && (
                    <p style={{ ...successStyle, textAlign: "center" }}>
                        ✓ Kode baru berhasil dikirim ke {email}
                    </p>
                )}

                <button type="submit" disabled={verifying} style={verifying ? btnDisabledStyle : btnPrimaryStyle}>
                    {verifying ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                            <span style={spinnerStyle} /> Memverifikasi...
                        </span>
                    ) : (
                        "Verifikasi & Lanjutkan →"
                    )}
                </button>
            </form>

            <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "#666" }}>
                {countdown > 0 ? (
                    <span>Kirim ulang kode dalam <strong style={{ color: "#12233f" }}>{countdown}s</strong></span>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                    >
                        {resending ? "Mengirim..." : "Kirim Ulang Kode"}
                    </button>
                )}
            </div>
            <button
                onClick={onBack}
                style={{ marginTop: "0.75rem", display: "block", width: "100%", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: "0.82rem" }}
            >
                ← Ganti email
            </button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TalentPool() {
    // step: "email_input" | "otp_verify" | "already_registered" | "form"
    const [step, setStep] = useState("email_input");
    const [verifiedEmail, setVerifiedEmail] = useState("");
    const [pendingEmail, setPendingEmail] = useState(""); // email saat di step otp_verify

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

    // ── Setelah OTP verified: cek apakah email sudah terdaftar ──────────────
    async function handleOtpVerified(email) {
        const { data } = await supabase
            .from("talent_pool")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (data) {
            // Email sudah terdaftar di talent pool
            setVerifiedEmail(email);
            setStep("already_registered");
        } else {
            // Email baru — lanjut ke form
            setVerifiedEmail(email);
            setForm((prev) => ({ ...prev, email }));
            setStep("form");
        }
    }

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
                    email: verifiedEmail, // pastikan pakai email yang sudah diverifikasi
                    bidang_minat: bidangMinat,
                    experience: cleanedExperiences,
                    foto_url,
                    cv_url,
                    updated_at: new Date().toISOString(),
                },
            ]);
            if (insertError) throw insertError;

            setMessage("Berhasil! Profil kamu sudah masuk ke Talent Pool.");
            resetForm();
            setRefreshKey((k) => k + 1);
            // Kembali ke step awal setelah sukses
            setTimeout(() => {
                setStep("email_input");
                setVerifiedEmail("");
                setMessage("");
            }, 4000);
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
                <h1 className="hero-title">Talent Pool</h1>
                <p className="hero-subtitle">
                    Temukan talenta fresh graduate terbaik sesuai kebutuhan perusahaanmu
                </p>
            </div>

            <div style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto" }}>

                {/* ── Progress Stepper (tampil saat proses registrasi) ── */}
                {step !== "email_input" && step !== "already_registered" && (
                    <div style={stepperContainerStyle}>
                        {["Verifikasi Email", "Kode OTP", "Isi Profil"].map((label, i) => {
                            const stepMap = { 0: "email_input", 1: "otp_verify", 2: "form" };
                            const currentIdx = step === "otp_verify" ? 1 : step === "form" ? 2 : 0;
                            const done = i < currentIdx;
                            const active = i === currentIdx;
                            return (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                    <div style={stepDotStyle(done, active)}>{done ? "✓" : i + 1}</div>
                                    <span style={{ fontSize: "0.8rem", color: active ? "#12233f" : done ? "#22c55e" : "#aaa", fontWeight: active ? 700 : 400 }}>{label}</span>
                                    {i < 2 && <div style={stepLineStyle(done)} />}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Daftar Baru Section (collapsible hanya saat step email_input) ── */}
                {step === "email_input" && (
                    <>
                        <div style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                            Sudah pernah daftar dan mau ubah data?{" "}
                            <a href="/talent-pool/edit" style={{ color: "#2563eb", fontWeight: 600 }}>
                                Edit profil kamu di sini →
                            </a>
                        </div>

                        <details style={{ marginBottom: "2.5rem" }}>
                            <summary style={{ cursor: "pointer", fontWeight: 600, color: "#12233f" }}>
                                + Daftar ke Talent Pool
                            </summary>
                            <div style={{ marginTop: "1.5rem" }}>
                                <StepEmailInput
                                    onOtpSent={(email) => {
                                        setPendingEmail(email);
                                        setStep("otp_verify");
                                    }}
                                />
                            </div>
                        </details>
                    </>
                )}

                {/* ── Step: Verifikasi OTP ── */}
                {step === "otp_verify" && (
                    <div style={{ marginBottom: "2.5rem" }}>
                        <StepOtpVerify
                            email={pendingEmail}
                            onVerified={handleOtpVerified}
                            onBack={() => setStep("email_input")}
                        />
                    </div>
                )}

                {/* ── Step: Email sudah terdaftar ── */}
                {step === "already_registered" && (
                    <div style={{ marginBottom: "2.5rem", ...stepCardStyle }}>
                        <div style={stepIconStyle}>⚠️</div>
                        <h2 style={{ ...stepTitleStyle, color: "#b45309" }}>Email Sudah Terdaftar</h2>
                        <p style={stepDescStyle}>
                            Email <strong style={{ color: "#12233f" }}>{verifiedEmail}</strong> sudah terdaftar di Talent Pool KATI Unand.
                        </p>
                        <p style={{ ...stepDescStyle, marginTop: "0.25rem" }}>
                            Ingin mengubah data profilmu? Gunakan halaman Edit Profil.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                            <a
                                href="/talent-pool/edit"
                                style={{ ...btnPrimaryStyle, textDecoration: "none", textAlign: "center", flex: 1 }}
                            >
                                Edit Profil Saya →
                            </a>
                            <button
                                onClick={() => { setStep("email_input"); setVerifiedEmail(""); }}
                                style={{ ...btnSecondaryStyle, flex: 1 }}
                            >
                                ← Kembali
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step: Form Registrasi Lengkap ── */}
                {step === "form" && (
                    <details open style={{ marginBottom: "2.5rem" }}>
                        <summary style={{ cursor: "pointer", fontWeight: 600, color: "#12233f" }}>
                            ✓ Email Terverifikasi — Isi Profil Talent Pool
                        </summary>

                        <form
                            onSubmit={handleSubmit}
                            style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem", maxWidth: "480px" }}
                        >
                            <div>
                                <label>Nama Lengkap *</label>
                                <input type="text" name="nama" value={form.nama} onChange={handleChange} required style={inputStyle} />
                            </div>

                            {/* Email — read-only, sudah diverifikasi */}
                            <div>
                                <label>Email *</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type="email"
                                        value={verifiedEmail}
                                        readOnly
                                        style={{ ...inputStyle, backgroundColor: "#f0fdf4", color: "#15803d", fontWeight: 600, cursor: "default" }}
                                    />
                                    <span style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", color: "#22c55e" }}>
                                        ✓ Terverifikasi
                                    </span>
                                </div>
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

                            {message && (
                                <p style={{ color: message.startsWith("Berhasil") ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
                                    {message}
                                </p>
                            )}
                        </form>
                    </details>
                )}

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

// ─── Styles ───────────────────────────────────────────────────────────────────

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

const stepCardStyle = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "420px",
    margin: "0 auto",
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
};

const stepIconStyle = {
    fontSize: "2.5rem",
    textAlign: "center",
    marginBottom: "0.75rem",
};

const stepTitleStyle = {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#12233f",
    textAlign: "center",
    marginBottom: "0.5rem",
};

const stepDescStyle = {
    fontSize: "0.9rem",
    color: "#555",
    textAlign: "center",
    marginBottom: "1.25rem",
    lineHeight: 1.5,
};

const labelStyle = {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "0.35rem",
};

const stepInputStyle = {
    width: "100%",
    padding: "0.65rem 0.8rem",
    border: "1.5px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
};

const otpBoxStyle = (filled) => ({
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: 700,
    border: `2px solid ${filled ? "#12233f" : "#d1d5db"}`,
    borderRadius: "10px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: filled ? "0 0 0 3px rgba(18,35,63,0.1)" : "none",
    background: filled ? "#f0f4ff" : "#fff",
    color: "#12233f",
});

const btnPrimaryStyle = {
    padding: "0.75rem 1.5rem",
    background: "#12233f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
    transition: "background 0.2s",
    display: "block",
    width: "100%",
};

const btnDisabledStyle = {
    ...btnPrimaryStyle,
    background: "#9ca3af",
    cursor: "not-allowed",
};

const btnSecondaryStyle = {
    padding: "0.75rem 1.5rem",
    background: "#fff",
    color: "#12233f",
    border: "1.5px solid #12233f",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: "pointer",
};

const errorStyle = {
    fontSize: "0.85rem",
    color: "#b91c1c",
    background: "#fef2f2",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    margin: 0,
};

const successStyle = {
    fontSize: "0.85rem",
    color: "#15803d",
    background: "#f0fdf4",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    margin: 0,
};

const spinnerStyle = {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
};

const stepperContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    marginBottom: "2rem",
    flexWrap: "wrap",
};

const stepDotStyle = (done, active) => ({
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: done ? "#22c55e" : active ? "#12233f" : "#e5e7eb",
    color: done || active ? "#fff" : "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.78rem",
    fontWeight: 700,
    flexShrink: 0,
});

const stepLineStyle = (done) => ({
    width: "32px",
    height: "2px",
    background: done ? "#22c55e" : "#e5e7eb",
    margin: "0 0.15rem",
});