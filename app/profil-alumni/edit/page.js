"use client";

import Link from "next/link";

export default function EditAlumniPage() {
    return (
        <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ maxWidth: "480px", textAlign: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "2.5rem 2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
                    Pengelolaan Data Alumni
                </h1>
                <p style={{ fontSize: "0.92rem", color: "#64748b", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                    Penambahan dan pengubahan profil alumni pada jaringan IKA KATI UNAND kini dikelola secara terpusat oleh Admin/Pengurus untuk memastikan validitas dan keseragaman data.
                </p>
                <Link
                    href="/profil-alumni"
                    style={{
                        display: "inline-block",
                        padding: "0.75rem 1.8rem",
                        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                        color: "#fff",
                        borderRadius: "999px",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        textDecoration: "none",
                        boxShadow: "0 4px 12px rgba(124,58,237,0.25)",
                    }}
                >
                    Kembali ke Jaringan Alumni
                </Link>
            </div>
        </div>
    );
}