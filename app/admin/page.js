"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ── Password Akses Admin ───────────────────────────────────────────────────
const SUPER_ADMIN_PASSWORD = "katiunand2025"; // Akses penuh ke seluruh fitur & tab
const PJ_DAERAH_PASSWORD = "admin2";         // Akses khusus PJ Wilayah / Direktori Alumni

const ALL_TABS = [
    { key: "talent_pool",     label: "Talent Pool",       icon: "👤", nameField: "nama",         roles: ["super_admin"] },
    { key: "alumni_profiles", label: "Jaringan Unggulan", icon: "🎓", nameField: "nama",         roles: ["super_admin"] },
    { key: "alumni_database", label: "Direktori Alumni",  icon: "🗂️", nameField: "nama_lengkap", roles: ["super_admin", "pj_daerah"] },
    { key: "alumni_products", label: "Produk Alumni",     icon: "🛍️", nameField: "nama_produk",  roles: ["super_admin"] },
    { key: "job_posts",       label: "Job Post",          icon: "💼", nameField: "judul_posisi", roles: ["super_admin"] },
    { key: "email_gate_log",  label: "Email Gate Log",    icon: "📧", nameField: "email",        roles: ["super_admin"] },
];

const JENIS_PEKERJAAN_OPTIONS = [
    "BUMN / Anak Usaha Danantara / BUMD",
    "Swasta Nasional",
    "Swasta Asing",
    "Kementerian / Pemerintah Daerah",
    "Wiraswasta",
    "Akademisi",
    "NGO",
    "Lainnya",
];

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [adminRole, setAdminRole] = useState(null); // 'super_admin' | 'pj_daerah'
    const [pwInput, setPwInput] = useState("");
    const [pwError, setPwError] = useState("");

    const [activeTab, setActiveTab] = useState("talent_pool");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
    const [editingData, setEditingData] = useState(null); // Object to edit
    const [addingData, setAddingData] = useState(null);   // New row being created
    const [saving, setSaving] = useState(false);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [toast, setToast] = useState("");

    function handleLogin(e) {
        e.preventDefault();
        const trimmed = pwInput.trim();
        if (trimmed === SUPER_ADMIN_PASSWORD) {
            setAuthed(true);
            setAdminRole("super_admin");
            setActiveTab("talent_pool");
            setPwError("");
        } else if (trimmed === PJ_DAERAH_PASSWORD) {
            setAuthed(true);
            setAdminRole("pj_daerah");
            setActiveTab("alumni_database");
            setPwError("");
        } else {
            setPwError("Password salah. Silakan masukkan password Super Admin atau PJ Daerah.");
        }
    }

    async function fetchData() {
        setLoading(true);
        setData([]);

        // 1. Tab Direktori Database Alumni (via /api/alumni-directory)
        if (activeTab === "alumni_database") {
            try {
                const res = await fetch("/api/alumni-directory");
                const json = await res.json();
                if (json.success && json.data) {
                    setData(json.data);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.warn("Fetch alumni_database via api failed:", e);
            }
        }

        // 2. Tab Produk Alumni (via /api/alumni-products)
        if (activeTab === "alumni_products") {
            try {
                const res = await fetch("/api/alumni-products");
                const json = await res.json();
                if (json.success && json.data) {
                    setData(json.data);
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.warn("Fetch alumni_products via api failed, falling back to Supabase:", e);
            }
        }

        // 3. Tab Lainnya (Supabase default)
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

    async function handleDelete(id, targetName) {
        setDeletingId(id);

        if (activeTab === "alumni_database") {
            try {
                await fetch(`/api/alumni-directory?id=${id || ""}&nama=${encodeURIComponent(targetName || "")}`, { method: "DELETE" });
                setData((prev) => prev.filter((r) => r.id !== id && r.nama_lengkap !== targetName));
                showToast("✅ Data alumni berhasil dihapus.");
                setDeletingId(null);
                setConfirmDelete(null);
                return;
            } catch (e) {
                showToast("❌ Gagal menghapus: " + e.message);
                setDeletingId(null);
                return;
            }
        }

        if (activeTab === "alumni_products") {
            try {
                await fetch(`/api/alumni-products?id=${id}`, { method: "DELETE" });
                setData((prev) => prev.filter((r) => r.id !== id));
                showToast("✅ Produk berhasil dihapus.");
                setDeletingId(null);
                setConfirmDelete(null);
                return;
            } catch (e) {
                showToast("❌ Gagal menghapus: " + e.message);
                setDeletingId(null);
                return;
            }
        }

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

    async function handleSaveEdit(e) {
        e.preventDefault();
        setSaving(true);
        const updates = { ...editingData };

        if (activeTab === "alumni_database") {
            try {
                const res = await fetch("/api/alumni-directory", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                });
                const json = await res.json();
                if (json.success) {
                    setData((prev) => prev.map((r) => (r.id === editingData.id || r.nama_lengkap === editingData.nama_lengkap ? { ...r, ...updates } : r)));
                    showToast("✅ Data alumni berhasil diperbarui.");
                    setEditingData(null);
                } else {
                    showToast("❌ Gagal menyimpan: " + (json.error || "Unknown error"));
                }
            } catch (err) {
                showToast("❌ Gagal menyimpan: " + err.message);
            }
            setSaving(false);
            return;
        }

        if (activeTab === "alumni_products") {
            try {
                const res = await fetch("/api/alumni-products", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updates),
                });
                const json = await res.json();
                if (json.success) {
                    setData((prev) => prev.map((r) => (r.id === editingData.id ? { ...r, ...updates } : r)));
                    showToast("✅ Produk berhasil diperbarui.");
                    setEditingData(null);
                } else {
                    showToast("❌ Gagal menyimpan: " + (json.message || "Unknown error"));
                }
            } catch (err) {
                showToast("❌ Gagal menyimpan: " + err.message);
            }
            setSaving(false);
            return;
        }

        delete updates.id;
        delete updates.created_at;
        delete updates.updated_at;

        const { error } = await supabase.from(activeTab).update(updates).eq("id", editingData.id);
        if (!error) {
            setData((prev) => prev.map((r) => (r.id === editingData.id ? { ...r, ...updates } : r)));
            showToast("✅ Data berhasil diubah.");
            setEditingData(null);
        } else {
            showToast("❌ Gagal menyimpan: " + error.message);
        }
        setSaving(false);
    }

    // ── Upload foto ke Supabase Storage ────────────────────────────────────────
    async function uploadPhoto(file, setter, currentData, fieldKey = "foto_url") {
        if (!file) return;
        setPhotoUploading(true);
        const ext = file.name.split(".").pop();
        const fileName = `admin_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("Photo").upload(fileName, file, { upsert: true });
        if (error) {
            showToast("❌ Upload foto gagal: " + error.message);
            setPhotoUploading(false);
            return;
        }
        const { data: pub } = supabase.storage.from("Photo").getPublicUrl(fileName);
        setter({ ...currentData, [fieldKey]: pub.publicUrl });
        setPhotoUploading(false);
        showToast("📸 Foto berhasil diupload!");
    }

    async function handleSaveAdd(e) {
        e.preventDefault();
        setSaving(true);
        const newRow = { ...addingData };

        if (activeTab === "alumni_database") {
            try {
                const res = await fetch("/api/alumni-directory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newRow),
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setData((prev) => [json.data, ...prev]);
                    showToast("✅ Data alumni baru berhasil ditambahkan!");
                    setAddingData(null);
                } else {
                    showToast("❌ Gagal menambah: " + (json.error || "Unknown error"));
                }
            } catch (err) {
                showToast("❌ Gagal menambah: " + err.message);
            }
            setSaving(false);
            return;
        }

        if (activeTab === "alumni_products") {
            try {
                const res = await fetch("/api/alumni-products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newRow),
                });
                const json = await res.json();
                if (json.success && json.data) {
                    setData((prev) => [json.data, ...prev]);
                    showToast("✅ Produk alumni berhasil ditambahkan!");
                    setAddingData(null);
                } else {
                    showToast("❌ Gagal menambah: " + (json.message || "Unknown error"));
                }
            } catch (err) {
                showToast("❌ Gagal menambah: " + err.message);
            }
            setSaving(false);
            return;
        }

        delete newRow.id;
        delete newRow.created_at;
        delete newRow.updated_at;
        // Remove empty-string keys so DB defaults apply
        Object.keys(newRow).forEach((k) => { if (newRow[k] === "") delete newRow[k]; });

        const { data: inserted, error } = await supabase.from(activeTab).insert([newRow]).select();
        if (!error && inserted) {
            setData((prev) => [inserted[0], ...prev]);
            showToast("✅ Data berhasil ditambahkan.");
            setAddingData(null);
        } else {
            showToast("❌ Gagal menambah: " + (error?.message || "Unknown error"));
        }
        setSaving(false);
    }

    function openAddModal() {
        // Build an empty template from existing data columns, or predefined per tab
        const schemaTemplates = {
            alumni_profiles: { nama: "", angkatan: "", jabatan: "", tempat_kerja: "", deskripsi: "", linkedin_url: "", foto_url: "" },
            alumni_database: {
                nama_lengkap: "",
                angkatan: "",
                nama_perusahaan: "",
                jabatan: "",
                jenis_pekerjaan: "BUMN / Anak Usaha Danantara / BUMD",
                bidang_pekerjaan: "",
                provinsi: "",
                kota: "",
                negara: "Indonesia",
                linkedin_url: "",
                instagram_url: "",
                email: "",
            },
            alumni_products: {
                nama_produk: "",
                tipe: "Produk",
                kategori: "F&B / Kuliner",
                nama_owner: "",
                angkatan: "",
                harga: "",
                lokasi: "",
                whatsapp: "",
                instagram: "",
                website_url: "",
                deskripsi: "",
                foto_url: "",
            },
            talent_pool: { nama: "", email: "", jabatan: "", keahlian: "" },
            job_posts: { judul_posisi: "", nama_perusahaan: "", tipe_pekerjaan: "", lokasi: "", deskripsi: "", link_pendaftaran: "" },
        };
        const template = schemaTemplates[activeTab] ||
            (data.length > 0
                ? Object.fromEntries(Object.keys(data[0]).filter(k => !["id","created_at","updated_at"].includes(k)).map(k => [k, ""]))
                : { nama: "" });
        setAddingData(template);
    }

    function showToast(msg) {
        setToast(msg);
        setTimeout(() => setToast(""), 3500);
    }

    // Tabs yang ditampilkan sesuai role
    const visibleTabs = ALL_TABS.filter((t) => t.roles.includes(adminRole || "super_admin"));
    const currentTab = visibleTabs.find((t) => t.key === activeTab) || visibleTabs[0];
    const nameField = currentTab?.nameField || "id";

    const filtered = data.filter((row) => {
        if (activeTab === "alumni_database") {
            const term = search.toLowerCase();
            const matchName = String(row.nama_lengkap || "").toLowerCase().includes(term);
            const matchCompany = String(row.nama_perusahaan || "").toLowerCase().includes(term);
            const matchRole = String(row.jabatan || "").toLowerCase().includes(term);
            const matchCity = String(row.kota || "").toLowerCase().includes(term);
            const matchProv = String(row.provinsi || "").toLowerCase().includes(term);
            const matchYear = String(row.angkatan || "").toLowerCase().includes(term);
            return matchName || matchCompany || matchRole || matchCity || matchProv || matchYear;
        }
        const val = String(row[nameField] || "").toLowerCase();
        return val.includes(search.toLowerCase());
    });

    // ── Login Screen ──────────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
                <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2.5rem 2rem", maxWidth: "400px", width: "100%", textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔐</div>
                    <h1 style={{ margin: "0 0 0.35rem", color: "#f1f5f9", fontSize: "1.4rem", fontWeight: 800 }}>Admin Portal</h1>
                    <p style={{ margin: "0 0 1.75rem", color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.5 }}>
                        Portal Pengelola KATI Unand &amp; Penanggung Jawab (PJ) Daerah
                    </p>

                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <input
                            type="password"
                            value={pwInput}
                            onChange={(e) => setPwInput(e.target.value)}
                            placeholder="Password Admin / PJ Daerah"
                            autoFocus
                            style={{
                                width: "100%", padding: "0.8rem 1rem",
                                background: "#0f172a", border: "1.5px solid rgba(255,255,255,0.1)",
                                borderRadius: "10px", color: "#f1f5f9", fontSize: "0.95rem",
                                outline: "none", boxSizing: "border-box",
                                fontFamily: "var(--font-body), sans-serif",
                            }}
                        />
                        {pwError && <p style={{ margin: 0, color: "#f87171", fontSize: "0.82rem", textAlign: "left", lineHeight: 1.4 }}>{pwError}</p>}
                        <button type="submit" style={{
                            padding: "0.85rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                            color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700,
                            fontSize: "0.95rem", cursor: "pointer", fontFamily: "var(--font-body), sans-serif",
                            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                        }}>
                            Masuk
                        </button>
                    </form>

                    <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem", color: "#64748b", textAlign: "left", lineHeight: 1.5 }}>
                        💡 <strong>Informasi Akses:</strong><br />
                        • <strong>Super Admin:</strong> Mengelola seluruh data &amp; tab.<br />
                        • <strong>PJ Daerah:</strong> Akses khusus kelola data alumni di wilayahnya.
                    </div>
                </div>
            </div>
        );
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    const isPjDaerah = adminRole === "pj_daerah";

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a" }}>
            {/* Header */}
            <div style={{ background: "#1e293b", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.35rem" }}>🛡️</span>
                    <div>
                        <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: "1.02rem" }}>
                            {isPjDaerah ? "Portal PJ Wilayah / Daerah" : "Super Admin Panel"} — KATI Unand
                        </div>
                        <div style={{ fontSize: "0.75rem", color: isPjDaerah ? "#38bdf8" : "#94a3b8", fontWeight: 600 }}>
                            {isPjDaerah ? "📍 Akses Khusus: Update Direktori & Database Alumni Daerah" : "👑 Akses Penuh: Seluruh Fitur & Database"}
                        </div>
                    </div>
                </div>
                <button onClick={() => { setAuthed(false); setAdminRole(null); }} style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "0.45rem 1rem", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                    Keluar
                </button>
            </div>

            <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "2rem 1.5rem" }}>

                {/* Tab bar (Hanya tampilkan tab yang diizinkan untuk role saat ini) */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSearch(""); }}
                            style={{
                                padding: "0.55rem 1.25rem",
                                borderRadius: "999px",
                                border: "1px solid",
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "var(--font-body), sans-serif",
                                ...(activeTab === tab.key
                                    ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }
                                    : { background: "transparent", color: "#94a3b8", borderColor: "rgba(255,255,255,0.1)" }),
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Section header + search + tambah */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                    <div>
                        <h2 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.25rem", fontWeight: 800 }}>
                            {currentTab?.icon} {currentTab?.label}
                        </h2>
                        <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.82rem" }}>
                            {loading ? "Memuat data..." : `${filtered.length} dari total ${data.length} data`}
                            {activeTab === "alumni_database" && isPjDaerah && " • PJ dapat mencari kota/provinsi untuk kelola alumni daerah Anda"}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={activeTab === "alumni_database" ? "Cari nama, kota, kantor..." : `Cari ${nameField}...`}
                            style={{
                                padding: "0.6rem 1rem", minWidth: "220px",
                                background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: "10px", color: "#f1f5f9", fontSize: "0.88rem",
                                outline: "none", fontFamily: "var(--font-body), sans-serif",
                            }}
                        />
                        {activeTab !== "email_gate_log" && (
                            <button
                                onClick={openAddModal}
                                style={{
                                    padding: "0.6rem 1.15rem",
                                    background: "linear-gradient(135deg, #16a34a, #15803d)",
                                    color: "#fff", border: "none", borderRadius: "10px",
                                    fontWeight: 700, fontSize: "0.88rem", cursor: "pointer",
                                    fontFamily: "var(--font-body), sans-serif",
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                                }}
                            >
                                ＋ {activeTab === "alumni_database" ? "Tambah Alumni" : "Tambah"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Table / List */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} style={{ height: "60px", background: "#1e293b", borderRadius: "10px", animation: "pulse 1.5s ease-in-out infinite", animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#1e293b", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📭</div>
                        <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "1rem" }}>Tidak ada data yang cocok</div>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>Coba sesuaikan kata kunci pencarian Anda.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {filtered.map((row) => (
                            <AdminRow
                                key={row.id || row.nama_lengkap}
                                row={row}
                                nameField={nameField}
                                tabKey={activeTab}
                                onEdit={() => setEditingData({ ...row })}
                                onDelete={() => setConfirmDelete({ id: row.id, name: row[nameField] || String(row.id) })}
                                deleting={deletingId === row.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm delete modal */}
            {confirmDelete && (
                <div onClick={() => setConfirmDelete(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", backdropFilter: "blur(4px)" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", padding: "2rem", maxWidth: "380px", width: "100%", textAlign: "center" }}>
                        <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 0.5rem", color: "#f1f5f9", fontWeight: 800 }}>Hapus Data?</h3>
                        <p style={{ margin: "0 0 1.5rem", color: "#94a3b8", fontSize: "0.88rem", lineHeight: 1.5 }}>
                            Kamu akan menghapus: <strong style={{ color: "#f1f5f9" }}>{confirmDelete.name}</strong>. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
                                Batal
                            </button>
                            <button onClick={() => handleDelete(confirmDelete.id, confirmDelete.name)} style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg, #dc2626, #b91c1c)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body), sans-serif" }}>
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit modal */}
            {editingData && (
                <div onClick={() => setEditingData(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", backdropFilter: "blur(4px)" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", maxWidth: "540px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, color: "#f1f5f9", fontWeight: 800 }}>Edit Data</h3>
                            <button onClick={() => setEditingData(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                        </div>
                        <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingRight: "0.5rem" }}>
                            {/* Foto upload jika field foto_url ada */}
                            {"foto_url" in editingData && (
                                <PhotoUploadField
                                    label="Foto"
                                    currentUrl={editingData.foto_url}
                                    uploading={photoUploading}
                                    onFile={(file) => uploadPhoto(file, setEditingData, editingData, "foto_url")}
                                    onClear={() => setEditingData({ ...editingData, foto_url: "" })}
                                />
                            )}
                            {Object.keys(editingData)
                                .filter((k) => !["id", "created_at", "updated_at", "foto_url", "lampiran_url"].includes(k))
                                .map((key) => (
                                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        <label style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700, textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</label>
                                        {key === "tipe" ? (
                                            <select
                                                value={editingData[key] || "Produk"}
                                                onChange={(e) => setEditingData({ ...editingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                <option value="Produk">Produk</option>
                                                <option value="Jasa">Jasa</option>
                                            </select>
                                        ) : key === "jenis_pekerjaan" ? (
                                            <select
                                                value={editingData[key] || "BUMN / Anak Usaha Danantara / BUMD"}
                                                onChange={(e) => setEditingData({ ...editingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                {JENIS_PEKERJAAN_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : key === "kategori" && activeTab === "alumni_products" ? (
                                            <select
                                                value={editingData[key] || "F&B / Kuliner"}
                                                onChange={(e) => setEditingData({ ...editingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                <option value="F&B / Kuliner">F&B / Kuliner</option>
                                                <option value="Jasa & Konsultasi">Jasa & Konsultasi</option>
                                                <option value="Fashion & Apparel">Fashion & Apparel</option>
                                                <option value="Teknologi & Digital">Teknologi & Digital</option>
                                                <option value="Manufaktur & Kerajinan">Manufaktur & Kerajinan</option>
                                                <option value="Agribisnis">Agribisnis</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        ) : key === "deskripsi" || key === "keahlian" ? (
                                            <textarea
                                                rows={3}
                                                value={editingData[key] || ""}
                                                onChange={(e) => setEditingData({ ...editingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif", resize: "vertical",
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={editingData[key] || ""}
                                                onChange={(e) => setEditingData({ ...editingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setEditingData(null)} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>Batal</button>
                                <button type="submit" disabled={saving || photoUploading} style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: (saving || photoUploading) ? "not-allowed" : "pointer" }}>
                                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add modal */}
            {addingData && (
                <div onClick={() => setAddingData(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", backdropFilter: "blur(4px)" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "2rem", maxWidth: "540px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, color: "#f1f5f9", fontWeight: 800 }}>
                                ＋ Tambah {currentTab?.label} Baru
                            </h3>
                            <button onClick={() => setAddingData(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
                        </div>
                        <form onSubmit={handleSaveAdd} style={{ display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", paddingRight: "0.5rem" }}>
                            {/* Foto upload jika field foto_url ada */}
                            {"foto_url" in addingData && (
                                <PhotoUploadField
                                    label="Foto"
                                    currentUrl={addingData.foto_url}
                                    uploading={photoUploading}
                                    onFile={(file) => uploadPhoto(file, setAddingData, addingData, "foto_url")}
                                    onClear={() => setAddingData({ ...addingData, foto_url: "" })}
                                />
                            )}
                            {Object.keys(addingData)
                                .filter((k) => !["id", "created_at", "updated_at", "foto_url"].includes(k))
                                .map((key) => (
                                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                        <label style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700, textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</label>
                                        {key === "tipe" ? (
                                            <select
                                                value={addingData[key] || "Produk"}
                                                onChange={(e) => setAddingData({ ...addingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                <option value="Produk">Produk</option>
                                                <option value="Jasa">Jasa</option>
                                            </select>
                                        ) : key === "jenis_pekerjaan" ? (
                                            <select
                                                value={addingData[key] || "BUMN / Anak Usaha Danantara / BUMD"}
                                                onChange={(e) => setAddingData({ ...addingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                {JENIS_PEKERJAAN_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        ) : key === "kategori" && activeTab === "alumni_products" ? (
                                            <select
                                                value={addingData[key] || "F&B / Kuliner"}
                                                onChange={(e) => setAddingData({ ...addingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            >
                                                <option value="F&B / Kuliner">F&B / Kuliner</option>
                                                <option value="Jasa & Konsultasi">Jasa & Konsultasi</option>
                                                <option value="Fashion & Apparel">Fashion & Apparel</option>
                                                <option value="Teknologi & Digital">Teknologi & Digital</option>
                                                <option value="Manufaktur & Kerajinan">Manufaktur & Kerajinan</option>
                                                <option value="Agribisnis">Agribisnis</option>
                                                <option value="Lainnya">Lainnya</option>
                                            </select>
                                        ) : key === "deskripsi" || key === "keahlian" ? (
                                            <textarea
                                                rows={3}
                                                value={addingData[key] || ""}
                                                onChange={(e) => setAddingData({ ...addingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif", resize: "vertical",
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={addingData[key] || ""}
                                                onChange={(e) => setAddingData({ ...addingData, [key]: e.target.value })}
                                                style={{
                                                    padding: "0.65rem", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
                                                    borderRadius: "8px", color: "#f1f5f9", fontSize: "0.9rem",
                                                    fontFamily: "var(--font-body), sans-serif",
                                                }}
                                            />
                                        )}
                                    </div>
                                ))}
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                <button type="button" onClick={() => setAddingData(null)} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}>Batal</button>
                                <button type="submit" disabled={saving || photoUploading} style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg, #16a34a, #15803d)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, cursor: (saving || photoUploading) ? "not-allowed" : "pointer" }}>
                                    {saving ? "Menyimpan..." : "Simpan Data"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: "1.75rem", left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#f1f5f9", padding: "0.8rem 1.5rem", borderRadius: "999px", fontWeight: 700, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 999, whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body), sans-serif" }}>
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

// ── Photo Upload Field Component ─────────────────────────────────────────────
function PhotoUploadField({ label, currentUrl, uploading, onFile, onClear }) {
    const [dragOver, setDragOver] = useState(false);

    function handleDrop(e) {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) onFile(file);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 700 }}>{label}</label>

            {currentUrl ? (
                // Preview mode
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#0f172a", borderRadius: "10px", padding: "0.65rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <img src={currentUrl} alt="preview" style={{ width: "52px", height: "52px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#22c55e", fontSize: "0.8rem", fontWeight: 700 }}>✓ Foto terpasang</div>
                        <div style={{ color: "#475569", fontSize: "0.72rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUrl}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flexShrink: 0 }}>
                        <label style={{ padding: "0.3rem 0.65rem", background: "rgba(59,130,246,0.15)", color: "#60a5fa", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: "1px solid rgba(59,130,246,0.25)", whiteSpace: "nowrap" }}>
                            Ganti
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onFile(e.target.files?.[0])} />
                        </label>
                        <button type="button" onClick={onClear} style={{ padding: "0.3rem 0.65rem", background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Hapus</button>
                    </div>
                </div>
            ) : (
                // Drop zone
                <label
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        gap: "0.5rem", padding: "1.5rem", borderRadius: "10px", cursor: uploading ? "not-allowed" : "pointer",
                        border: `2px dashed ${dragOver ? "#60a5fa" : "rgba(255,255,255,0.15)"}`,
                        background: dragOver ? "rgba(59,130,246,0.08)" : "#0f172a",
                        transition: "all 0.2s",
                    }}
                >
                    <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
                    {uploading ? (
                        <>
                            <div style={{ fontSize: "1.5rem" }}>⏳</div>
                            <span style={{ color: "#94a3b8", fontSize: "0.83rem" }}>Mengupload foto...</span>
                        </>
                    ) : (
                        <>
                            <div style={{ fontSize: "1.75rem" }}>📸</div>
                            <span style={{ color: "#94a3b8", fontSize: "0.83rem", textAlign: "center" }}>
                                <strong style={{ color: "#60a5fa" }}>Klik atau drag foto</strong> ke sini<br />
                                <span style={{ fontSize: "0.75rem", color: "#475569" }}>JPG, PNG, WebP — maks 5 MB</span>
                            </span>
                        </>
                    )}
                </label>
            )}
        </div>
    );
}

// ── Row Card ──────────────────────────────────────────────────────────────────
function AdminRow({ row, nameField, tabKey, onEdit, onDelete, deleting }) {
    const primaryName = row[nameField] || "—";
    const subtitles = {
        talent_pool: [row.jabatan, row.email].filter(Boolean).join(" · "),
        alumni_profiles: [row.jabatan, row.tempat_kerja].filter(Boolean).join(" · "),
        alumni_database: [
            row.angkatan ? `Angkatan ${row.angkatan}` : "",
            row.jabatan,
            row.nama_perusahaan,
            row.kota || row.provinsi
        ].filter(Boolean).join(" · "),
        alumni_products: [row.tipe, row.kategori, row.nama_owner ? `${row.nama_owner} (${row.angkatan ? 'TI ' + row.angkatan : '-'})` : "", row.lokasi].filter(Boolean).join(" · "),
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

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                <button
                    onClick={onEdit}
                    disabled={deleting}
                    style={{
                        padding: "0.4rem 0.85rem",
                        background: "rgba(59,130,246,0.12)",
                        color: "#60a5fa",
                        border: "1px solid rgba(59,130,246,0.25)",
                        borderRadius: "7px",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: deleting ? "not-allowed" : "pointer",
                        fontFamily: "var(--font-body), sans-serif",
                        opacity: deleting ? 0.5 : 1,
                    }}
                >
                    Edit
                </button>

                {/* Delete btn */}
                <button
                    onClick={onDelete}
                    disabled={deleting}
                    style={{
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
        </div>
    );
}
