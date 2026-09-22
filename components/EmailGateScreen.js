"use client";

import { useState } from "react";

/**
 * EmailGateScreen
 * Props:
 *   - page: string  — nama halaman (untuk context copy)
 *   - onUnlock: (email: string) => void
 *   - title: string (opsional)
 *   - description: string (opsional)
 */
export default function EmailGateScreen({ page, onUnlock, title, description }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const defaultTitles = {
        "job-post": "Akses Lowongan Kerja",
        "talent-pool": "Akses Talent Pool",
        "services": "Akses Detail Layanan",
    };

    const defaultDescs = {
        "job-post": "Masukkan emailmu untuk mengakses semua lowongan kerja eksklusif dari jaringan alumni dan mahasiswa KATI Unand.",
        "talent-pool": "Masukkan emailmu untuk melihat profil talenta terbaik fresh graduate dari komunitas KATI Unand.",
        "services": "Masukkan emailmu untuk melihat detail lengkap dan harga layanan dari tim KATI Unand.",
    };

    const displayTitle = title || defaultTitles[page] || "Masukkan Email untuk Melanjutkan";
    const displayDesc = description || defaultDescs[page] || "Masukkan emailmu untuk mengakses konten ini.";

    async function handleSubmit(e) {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("Format email tidak valid.");
            return;
        }
        setError("");
        setLoading(true);
        try {
            await onUnlock(trimmed);
        } catch (_) {
            setError("Terjadi kesalahan. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={overlayStyle}>
            <div style={cardStyle}>
                {/* Icon */}
                <div style={iconWrapStyle}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Teks */}
                <h2 style={titleStyle}>{displayTitle}</h2>
                <p style={descStyle}>{displayDesc}</p>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
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
                                <span style={spinnerStyle} /> Memproses...
                            </span>
                        ) : (
                            "Akses Sekarang →"
                        )}
                    </button>
                </form>

                <p style={privacyStyle}>
                    🔒 Email kamu aman bersama kami dan tidak akan disebarkan ke pihak ketiga.
                </p>
            </div>
        </div>
    );
}

/* ── Styles ── */
const overlayStyle = {
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 1.5rem",
    background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
};

const cardStyle = {
    background: "#fff",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    maxWidth: "440px",
    width: "100%",
    boxShadow: "0 8px 40px rgba(37,99,235,0.12), 0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid rgba(37,99,235,0.1)",
    textAlign: "center",
};

const iconWrapStyle = {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
    border: "1.5px solid #bfdbfe",
};

const titleStyle = {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 0.6rem",
    letterSpacing: "-0.02em",
    fontFamily: "var(--font-body), sans-serif",
};

const descStyle = {
    fontSize: "0.9rem",
    color: "#64748b",
    lineHeight: 1.65,
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
    fontSize: "0.97rem",
    cursor: "pointer",
    fontFamily: "var(--font-body), sans-serif",
    boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
    transition: "transform 0.15s",
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
