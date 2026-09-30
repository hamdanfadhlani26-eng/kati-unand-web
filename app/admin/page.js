"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ── Password admin (ganti sesuai keinginan) ─────────────────────────────────
const ADMIN_PASSWORD = "katiunand2025";

const TABS = [
    { key: "talent_pool",     label: "Talent Pool",     icon: "👤", nameField: "nama" },
    { key: "alumni_profiles", label: "Jaringan Alumni", icon: "🎓", nameField: "nama" },
    { key: "job_posts",       label: "Job Post",        icon: "💼", nameField: "judul_posisi" },
    { key: "email_gate_log",  label: "Email Gate Log",  icon: "📧", nameField: "email" },
];

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [pwInput, setPwInput] = useState("");
    const [pwError, setPwError] = useState("");

    const [activeTab, setActiveTab] = useState("talent_pool");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
    const [toast, setToast] = useState("");

    function handleLogin(e) {
        e.preventDefault();
        if (pwInput === ADMIN_PASSWORD) {
            setAuthed(true);
            setPwError("");
        } else {
            setPwError("Password salah. Coba lagi.");
        }
    }

    async function fetchData() {
        setLoading(true);
        setData([]);
        const { data: rows, error } = await supabase
            .from(activeTab)
            .select("*")
            .order("created_at", { ascending: false });
        if (!error && rows) setData(rows);
        setLoading(false);
    }

    useEffect(() => {
        if (authed) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed, activeTab]);

    async function handleDelete(id) {
        setDeletingId(id);
        const { error } = await supabase.from(activeTab).delete().eq("id", id);
        if (!error) {
            setData((prev) => prev.filter((r) => r.id !== id));
            showToast("✅ Data berhasil dihapus.");
        } else {
            showToast("❌ Gagal menghapus: " + error.message);
        }
        setDeletingId(null);
        setConfirmDelete(null);
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    }

    const currentTab = TABS.find((t) => t.key === activeTab);
    const nameField = currentTab?.nameField || "id";

    const filtered = data.filter((row) => {
        const val = String(row[nameField] || "").toLowerCase();
        return val.includes(search.toLowerCase());
    });

    // ── Login Screen ──────────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
                <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem 2rem", maxWidth: "380px", width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔐</div>
                    <h1 style={{ margin: "0 0 0.35rem", color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800 }}>Admin Panel</h1>
                    <p style={{ margin: "0 0 1.75rem", color: "#64748b", fontSize: "0.88rem" }}>Akses khusus pengelola KATI Unand</p>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <input
                            type="password"
                            value={pwInput}
                            onChange={(e) => setPwInput(e.target.value)}
                            placeholder="Password Admin"
                            autoFocus
                            style={{
                                width: "100%", padding: "0.75rem 1rem",
                                background: "#0f172a", border: "1.5px solid rgba(255,255,255,0.1)",
                                borderRadius: "10px", color: "#f1f5f9", fontSize: "0.95rem",
                                outline: "none", boxSizing: "border-box",
                                fontFamily: "var(--font-body), sans-serif",
                            }}
                        />
                        {pwError && <p style={{ margin: 0, color: "#f87171", fontSize: "0.83rem" }}>{pwError}</p>}
                        <button type="submit" style={{
                            padding: "0.8rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700,
                            fontSize: "0.95rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif",
                        }}>
                            Masuk
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: "#0f172a" }}>
            {/* Header */}
            <div style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.25rem" }}>🛡️</span>
                    <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1rem" }}>Admin Panel — KATI Unand</span>
                </div>
                <button onClick={() => setAuthed(false)} style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.4rem 0.9rem", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                    Keluar
                </button>
            </div>

            <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>

                {/* Tab bar */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                            style={{
                                padding: "0.55rem 1.25rem",
                                borderRadius: "999px",
                                border: "1px solid",
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "var(--font-body), sans-serif",
                                ...(activeTab === tab.key
                                    ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                                    : { background: "transparent", color: "#94a3b8", borderColor: "rgba(255,255,255,0.1)" }),
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Section header + search */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.2rem", fontWeight: 700 }}>
                            {currentTab?.icon} {currentTab?.label}
                        </h2>
                        <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.82rem" }}>
                            {loading ? "Memuat..." : `${filtered.length} dari ${data.length} data`}
                        </p>
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Cari ${nameField}...`}
                        style={{
                            padding: "0.55rem 1rem", minWidth: "220px",
                            background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "8px", color: "#f1f5f9", fontSize: "0.88rem",
                            outline: "none", fontFamily: "var(--font-body), sans-serif",
                        }}
                    />
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ height: "56px", background: "#1e293b", borderRadius: "10px", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#64748b" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                        <div style={{ fontWeight: 600 }}>Tidak ada data</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {filtered.map((row) => (
                            <AdminRow
                                key={row.id}
                                row={row}
                                nameField={nameField}
                                tabKey={activeTab}
                                onDelete={() => setConfirmDelete({ id: row.id, name: row[nameField] || String(row.id) })}
                                deleting={deletingId === row.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm delete modal */}
            {confirmDelete && (
                <div onClick={() => setConfirmDelete(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", padding: "2rem", maxWidth: "380px", width: "100%", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 0.5rem", color: "#f1f5f9", fontWeight: 700 }}>Hapus Data?</h3>
                        <p style={{ margin: "0 0 1.5rem", color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.5 }}>
                            Kamu akan menghapus: <strong style={{ color: "#f1f5f9" }}>{confirmDelete.name}</strong>. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
                                Batal
                            </button>
                            <button onClick={() => handleDelete(confirmDelete.id)} style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: "1.75rem", left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#f1f5f9", padding: "0.8rem 1.5rem", borderRadius: "999px", fontWeight: 600, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 999, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body), sans-serif" }}>
                    {toast}
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

// ── Row Card ──────────────────────────────────────────────────────────────────
function AdminRow({ row, nameField, tabKey, onDelete, deleting }) {
    const primaryName = row[nameField] || "—";
    const subtitles = {
        talent_pool: [row.jabatan, row.email].filter(Boolean).join(" · "),
        alumni_profiles: [row.jabatan, row.tempat_kerja].filter(Boolean).join(" · "),
        job_posts: [row.nama_perusahaan, row.tipe_pekerjaan, row.lokasi].filter(Boolean).join(" · "),
        email_gate_log: [row.page, row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : ""].filter(Boolean).join(" · "),
    };
    const subtitle = subtitles[tabKey] || "";
    const createdAt = row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "";

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#1e293b", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "0.9rem 1.25rem" }}>
            {/* Photo / avatar */}
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {row.foto_url ? (
                    <img src={row.foto_url} alt={primaryName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 700 }}>{String(primaryName).charAt(0).toUpperCase()}</span>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "0.92rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {primaryName}
                </div>
                {subtitle && (
                    <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.15rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {subtitle}
                    </div>
                )}
            </div>

            {/* Date */}
            {createdAt && (
                <div style={{ fontSize: "0.75rem", color: "#475569", flexShrink: 0, display: "none" }} className="admin-date">
                    {createdAt}
                </div>
            )}

            {/* Delete btn */}
            <button
                onClick={onDelete}
                disabled={deleting}
                style={{
                    flexShrink: 0,
                    padding: "0.4rem 0.85rem",
                    background: "rgba(239,68,68,0.12)",
                    color: "#f87171",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: "7px",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    cursor: deleting ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-body), sans-serif",
                    opacity: deleting ? 0.5 : 1,
                }}
            >
                {deleting ? "..." : "Hapus"}
            </button>
        </div>
    );
}
