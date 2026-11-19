"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const GFORM_URL = "https://forms.gle/5UW1BNni8sq1CuQc6";

/**
 * EmailGateScreen
 * Props:
 *   - page: string  — nama halaman (untuk context copy)
 *   - onUnlock: (email: string) => void
 *   - title: string (opsional)
 *   - description: string (opsional)
 */
export default function EmailGateScreen({ page, onUnlock, title, description }) {
    const [step, setStep] = useState("input_email"); // "input_email" | "fill_gform"
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [successNotice, setSuccessNotice] = useState("");
    const [hasOpenedForm, setHasOpenedForm] = useState(false);

    const defaultTitles = {
        "job-post": "Akses Lowongan Kerja",
        "talent-pool": "Akses Talent Pool",
        "services": "Akses Detail Layanan",
        "jaringan-alumni": "Akses Direktori Alumni",
    };

    const defaultDescs = {
        "job-post": "Masukkan emailmu untuk mengakses semua lowongan kerja eksklusif dari jaringan alumni dan profesional Alumnova.",
        "talent-pool": "Masukkan emailmu untuk melihat profil talenta terbaik fresh graduate dari komunitas alumni.",
        "services": "Masukkan emailmu untuk melihat detail lengkap dan penawaran dari tim Alumnova.",
        "jaringan-alumni": "Masukkan emailmu untuk menjelajahi direktori dan jejaring alumni nasional.",
    };

    const displayTitle = title || defaultTitles[page] || "Akses Fitur Alumnova";
    const displayDesc = description || defaultDescs[page] || "Masukkan emailmu untuk melanjutkan verifikasi.";

    // ── STEP 1: Cek apakah email sudah pernah mengisi Google Form sebelumnya ──
    async function handleEmailSubmit(e) {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("Format email tidak valid.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Cek ke database Supabase apakah email ini sudah pernah tercatat mengisi Google Form
            const { data, error: supaErr } = await supabase
                .from("email_gate_log")
                .select("id")
                .eq("email", trimmed)
                .eq("page", "gform_completed")
                .limit(1);

            if (!supaErr && data && data.length > 0) {
                // Email SUDAH TERDAFTAR & PERNAH MENGISI GFORM
                setSuccessNotice("✅ Email terverifikasi! Anda sudah mengisi formulir sebelumnya. Membuka akses...");
                try {
                    localStorage.setItem("kati_gate_email", trimmed);
                    localStorage.setItem("kati_gate_gform_verified", "true");
                    localStorage.setItem("kati_gate_ts", Date.now().toString());
                } catch (_) {}

                setTimeout(() => {
                    onUnlock(trimmed);
                }, 800);
                return;
            }

            // Email belum pernah mengisi gform -> Lanjut ke Langkah 2 (Pengisian GForm)
            setStep("fill_gform");
        } catch (err) {
            console.error("Gagal verifikasi status email:", err);
            // Jika ada kendala koneksi, tetap izinkan lanjut ke tahap GForm
            setStep("fill_gform");
        } finally {
            setLoading(false);
        }
    }

    // ── STEP 2: Konfirmasi bahwa pengguna sudah mengisi Google Form ──
    async function handleConfirmFormFilled() {
        const trimmed = email.trim().toLowerCase();
        setSubmitting(true);
        setError("");

        try {
            // 1. Simpan pencatatan ke Supabase bahwa email ini telah mengisi Google Form
            await supabase.from("email_gate_log").insert([
                { email: trimmed, page: page || "general" },
                { email: trimmed, page: "gform_completed" }
            ]);

            // 2. Simpan status verifikasi di localStorage browser ini
            try {
                localStorage.setItem("kati_gate_email", trimmed);
                localStorage.setItem("kati_gate_gform_verified", "true");
                localStorage.setItem("kati_gate_ts", Date.now().toString());
            } catch (_) {}

            setSuccessNotice("🎉 Verifikasi berhasil! Membuka fitur Alumnova...");
            setTimeout(() => {
                onUnlock(trimmed);
            }, 800);
        } catch (err) {
            console.error("Gagal menyimpan konfirmasi gform:", err);
            // Fallback unlock jika ada error jaringan
            onUnlock(trimmed);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>
                {/* Step Indicator Badge */}
                <div style={stepBadgeWrap}>
                    <span style={step === "input_email" ? activeStepBadge : stepBadge}>
                        1. Verifikasi Email
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>→</span>
                    <span style={step === "fill_gform" ? activeStepBadge : stepBadge}>
                        2. Isi Formulir Alumni
                    </span>
                </div>

                {/* ── STEP 1: INPUT EMAIL ── */}
                {step === "input_email" && (
                    <>
                        <div style={iconWrapStyle}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>

                        <h2 style={titleStyle}>{displayTitle}</h2>
                        <p style={descStyle}>{displayDesc}</p>

                        {successNotice && (
                            <div style={successNoticeStyle}>
                                {successNotice}
                            </div>
                        )}

                        <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                placeholder="nama@email.com"
                                required
                                autoFocus
                                style={inputStyle}
                            />
                            {error && <p style={errorStyle}>{error}</p>}
                            <button type="submit" disabled={loading} style={loading ? btnDisabledStyle : btnStyle}>
                                {loading ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                                        <span style={spinnerStyle} /> Memeriksa Status Email...
                                    </span>
                                ) : (
                                    "Lanjut ke Akses →"
                                )}
                            </button>
                        </form>

                        <p style={privacyStyle}>
                            🔒 Jika email sudah pernah mengisi formulir sebelumnya, akses akan terbuka otomatis tanpa perlu mengisi ulang.
                        </p>
                    </>
                )}

                {/* ── STEP 2: ISI GOOGLE FORM ── */}
                {step === "fill_gform" && (
                    <>
                        <div style={{ ...iconWrapStyle, background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderColor: "#a7f3d0" }}>
                            <span style={{ fontSize: "1.9rem" }}>📋</span>
                        </div>

                        <h2 style={titleStyle}>Lengkapi Formulir Alumni</h2>
                        <p style={descStyle}>
                            Email <strong style={{ color: "#2563eb" }}>{email}</strong> belum tercatat mengisi formulir pendataan alumni.
                            Silakan lengkapi formulir pendaftaran melalui Google Form berikut untuk mengaktifkan akses fitur Alumnova:
                        </p>

                        {successNotice ? (
                            <div style={successNoticeStyle}>
                                {successNotice}
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                                {/* Tombol Buka Google Form (Tab Baru) */}
                                <a
                                    href={GFORM_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setHasOpenedForm(true)}
                                    style={gformBtnStyle}
                                >
                                    <span>📝</span>
                                    <span>Buka Formulir Pendaftaran (Google Form) ↗</span>
                                </a>

                                <div style={{ fontSize: "0.8rem", color: "#64748b", background: "#f8fafc", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", lineHeight: 1.5, textAlign: "left" }}>
                                    💡 <strong>Petunjuk:</strong> Klik tombol di atas untuk membuka formulir di tab baru. Setelah Anda selesai mengirimkan (submit) formulir, silakan klik tombol konfirmasi di bawah.
                                </div>

                                {/* Tombol Konfirmasi Sudah Mengisi */}
                                <button
                                    type="button"
                                    onClick={handleConfirmFormFilled}
                                    disabled={submitting}
                                    style={submitting ? btnDisabledStyle : confirmBtnStyle}
                                >
                                    {submitting ? (
                                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                                            <span style={spinnerStyle} /> Membuka Akses...
                                        </span>
                                    ) : (
                                        "✅ Saya Sudah Mengisi Formulir — Buka Akses"
                                    )}
                                </button>

                                {/* Tombol Ganti Email */}
                                <button
                                    type="button"
                                    onClick={() => { setStep("input_email"); setError(""); }}
                                    style={backBtnStyle}
                                >
                                    ← Gunakan email lain
                                </button>
                            </div>
                        )}

                        <p style={privacyStyle}>
                            ✨ Data email kamu akan tercatat secara permanen, sehingga kunjungan berikutnya tidak perlu mengisi formulir lagi.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── Styles ── */
const overlayStyle = {
    minHeight: "65vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 1.5rem",
    background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
};

const cardStyle = {
    background: "#fff",
    borderRadius: "20px",
    padding: "2.25rem 2rem",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(37,99,235,0.12), 0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid rgba(37,99,235,0.12)",
    textAlign: "center",
};

const stepBadgeWrap = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
};

const stepBadge = {
    fontSize: "0.74rem",
    fontWeight: 600,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
};

const activeStepBadge = {
    fontSize: "0.74rem",
    fontWeight: 700,
    color: "#2563eb",
    background: "rgba(37, 99, 235, 0.1)",
    border: "1px solid rgba(37, 99, 235, 0.25)",
    padding: "0.3rem 0.75rem",
    borderRadius: "999px",
};

const iconWrapStyle = {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.15rem",
    border: "1.5px solid #bfdbfe",
};

const titleStyle = {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 0.5rem",
    letterSpacing: "-0.02em",
    fontFamily: "var(--font-body), sans-serif",
};

const descStyle = {
    fontSize: "0.88rem",
    color: "#64748b",
    lineHeight: 1.6,
    margin: "0 0 1.5rem",
    fontFamily: "var(--font-body), sans-serif",
};

const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1.5px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "var(--font-body), sans-serif",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
    color: "#0f172a",
};

const btnStyle = {
    width: "100%",
    padding: "0.82rem",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "var(--font-body), sans-serif",
    boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
    transition: "transform 0.15s",
};

const gformBtnStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: "100%",
    padding: "0.85rem 1rem",
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "#ffffff",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.92rem",
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
    transition: "transform 0.15s",
    boxSizing: "border-box",
};

const confirmBtnStyle = {
    width: "100%",
    padding: "0.85rem",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "0.92rem",
    cursor: "pointer",
    fontFamily: "var(--font-body), sans-serif",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
    transition: "transform 0.15s",
};

const backBtnStyle = {
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "0.3rem",
    textDecoration: "underline",
};

const btnDisabledStyle = {
    ...btnStyle,
    background: "#93c5fd",
    cursor: "not-allowed",
    boxShadow: "none",
};

const errorStyle = {
    fontSize: "0.83rem",
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    margin: 0,
    textAlign: "left",
};

const successNoticeStyle = {
    fontSize: "0.86rem",
    color: "#059669",
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    marginBottom: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
};

const privacyStyle = {
    fontSize: "0.76rem",
    color: "#94a3b8",
    marginTop: "1.25rem",
    lineHeight: 1.5,
    fontFamily: "var(--font-body), sans-serif",
};

const spinnerStyle = {
    display: "inline-block",
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
};
