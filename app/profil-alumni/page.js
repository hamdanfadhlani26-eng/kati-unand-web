"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useEmailGate } from "@/lib/emailGate";
import EmailGateScreen from "@/components/EmailGateScreen";
import { WhatsAppIcon, LinkedInIcon } from "./SocialIcons";
import initialAlumniData from "@/data/alumni_database.json";

// Pilihan level jabatan
const LEVEL_OPTIONS = [
    "CEO / Founder / Co-Founder",
    "Direktur / Director",
    "Vice President (VP)",
    "General Manager",
    "Senior Manager / Manager",
    "Head of Department",
    "Senior Specialist / Lead",
    "Professor / Akademisi",
];

const INDUSTRI_OPTIONS = [
    "Manufaktur & Produksi",
    "Supply Chain & Logistik",
    "Teknologi & IT",
    "Perbankan & Keuangan",
    "Energi & Pertambangan",
    "Konsultan & Profesional",
    "FMCG & Retail",
    "Pendidikan & Riset",
    "Pemerintahan & BUMN",
    "Kesehatan & Farmasi",
    "Properti & Konstruksi",
    "Media & Kreatif",
    "Lainnya",
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

const LEVEL_COLORS = {
    "CEO / Founder / Co-Founder": { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    "Direktur / Director": { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
    "Vice President (VP)": { bg: "#ede9fe", text: "#4c1d95", border: "#c4b5fd" },
    "General Manager": { bg: "#dbeafe", text: "#1e3a8a", border: "#93c5fd" },
    "Senior Manager / Manager": { bg: "#dcfce7", text: "#14532d", border: "#86efac" },
    "Head of Department": { bg: "#e0f2fe", text: "#0c4a6e", border: "#7dd3fc" },
    "Senior Specialist / Lead": { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" },
    "Professor / Akademisi": { bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
};

const JENIS_COLORS = {
    "BUMN / Anak Usaha Danantara / BUMD": "#2563eb",
    "Swasta Nasional": "#dc2626",
    "Lainnya": "#eab308",
    "Swasta Asing": "#16a34a",
    "Kementerian / Pemerintah Daerah": "#ea580c",
    "Wiraswasta": "#06b6d4",
    "Akademisi": "#8b5cf6",
    "NGO": "#f43f5e",
    "Pelajar (S2 / S3)": "#a855f7",
};

function getLevelStyle(level) {
    return LEVEL_COLORS[level] || { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
}

function getJenisColor(jenis) {
    return JENIS_COLORS[jenis] || "#64748b";
}

const formInputStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "0.88rem",
    color: "#0f172a",
    outline: "none",
    fontFamily: "var(--font-body), sans-serif",
    boxSizing: "border-box",
};

const formLabelStyle = {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#334155",
    marginBottom: "0.3rem",
};

const emptyDirectoryForm = {
    id: null,
    nama_lengkap: "",
    angkatan: "",
    jenis_pekerjaan: "BUMN / Anak Usaha Danantara / BUMD",
    bidang_pekerjaan: "",
    nama_perusahaan: "",
    jabatan: "",
    provinsi: "",
    kota: "",
    linkedin_url: "",
    instagram_url: "",
    email: "",
};

export default function JaringanAlumni() {
    const { isUnlocked, checking, submitEmail } = useEmailGate("jaringan-alumni");

    // Main 3 tabs: 'unggulan', 'direktori', 'statistik'
    const [mainTab, setMainTab] = useState("unggulan");

    // --- State Profil Unggulan ---
    const [alumniList, setAlumniList] = useState([]);
    const [loadingFeatured, setLoadingFeatured] = useState(true);
    const [selected, setSelected] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Semua");
    const [searchNama, setSearchNama] = useState("");
    const [filterLevel, setFilterLevel] = useState("");
    const [filterIndustri, setFilterIndustri] = useState("");

    // --- State Direktori Alumni ---
    const [dbAlumni, setDbAlumni] = useState(initialAlumniData || []);
    const [dbSearch, setDbSearch] = useState("");
    const [dbFilterJenis, setDbFilterJenis] = useState("");
    const [dbFilterAngkatan, setDbFilterAngkatan] = useState("");
    const [dbFilterProvinsi, setDbFilterProvinsi] = useState("");
    const [dbPage, setDbPage] = useState(1);
    const DB_PER_PAGE = 30;

    // --- State CRUD Modal Direktori ---
    const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
    const [formData, setFormData] = useState(emptyDirectoryForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // --- State Delete Confirmation Modal ---
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Toast Notification ---
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (isUnlocked) {
            fetchFeatured();
            fetchDatabase();
        }
    }, [isUnlocked]);

    async function fetchFeatured() {
        setLoadingFeatured(true);
        const { data, error } = await supabase
            .from("alumni_profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error && data) {
            setAlumniList(data);
        }
        setLoadingFeatured(false);
    }

    async function fetchDatabase() {
        try {
            const res = await fetch("/api/alumni-directory");
            if (res.ok) {
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    setDbAlumni(json.data);
                    return;
                }
            }
        } catch (e) {
            // fallback to local JSON is already set
        }
    }

    // Helper kategori Profil Unggulan
    const getKategori = (a) => {
        if (a.kategori) return a.kategori;
        const nm = (a.nama || "").toLowerCase();
        if (nm.includes("iin") || nm.includes("ivan") || nm.includes("freddy") || nm.includes("mia") || nm.includes("muchdian") || nm.includes("yosi") || nm.includes("triokzi") || nm.includes("novrey") || nm.includes("aditya")) {
            return "Industri";
        }
        if (nm.includes("rodi") || nm.includes("dedy")) return "Entrepreneur";
        return "Akademisi";
    };

    // Filter Profil Unggulan
    const featuredFiltered = useMemo(() => {
        return alumniList
            .filter((a) => {
                if (activeCategory === "Semua") return true;
                return getKategori(a) === activeCategory;
            })
            .filter((a) => {
                const matchNama = !searchNama || (a.nama || "").toLowerCase().includes(searchNama.toLowerCase());
                const matchLevel = !filterLevel || a.level === filterLevel;
                const matchIndustri = !filterIndustri || a.industri === filterIndustri;
                return matchNama && matchLevel && matchIndustri;
            });
    }, [alumniList, activeCategory, searchNama, filterLevel, filterIndustri]);

    // Unique lists for Direktori Filters
    const dbAngkatanList = useMemo(() => {
        const unique = [...new Set(dbAlumni.map((a) => a.angkatan).filter(Boolean))];
        return unique.sort((a, b) => {
            const numA = parseInt(a, 10) || 0;
            const numB = parseInt(b, 10) || 0;
            return numB - numA;
        });
    }, [dbAlumni]);

    const dbProvinsiList = useMemo(() => {
        return [...new Set(dbAlumni.map((a) => a.provinsi).filter(Boolean))].sort();
    }, [dbAlumni]);

    const dbJenisList = useMemo(() => {
        return [...new Set(dbAlumni.map((a) => a.jenis_pekerjaan).filter(Boolean))].sort();
    }, [dbAlumni]);

    // Filter Direktori Alumni
    const dbFiltered = useMemo(() => {
        const query = dbSearch.toLowerCase().trim();
        return dbAlumni.filter((a) => {
            const matchSearch =
                !query ||
                (a.nama_lengkap || "").toLowerCase().includes(query) ||
                (a.nama_perusahaan || "").toLowerCase().includes(query) ||
                (a.jabatan || "").toLowerCase().includes(query) ||
                (a.kota || "").toLowerCase().includes(query);
            const matchJenis = !dbFilterJenis || a.jenis_pekerjaan === dbFilterJenis;
            const matchAngkatan = !dbFilterAngkatan || String(a.angkatan) === String(dbFilterAngkatan);
            const matchProvinsi = !dbFilterProvinsi || a.provinsi === dbFilterProvinsi;
            return matchSearch && matchJenis && matchAngkatan && matchProvinsi;
        });
    }, [dbAlumni, dbSearch, dbFilterJenis, dbFilterAngkatan, dbFilterProvinsi]);

    const dbPaginated = useMemo(() => {
        return dbFiltered.slice(0, dbPage * DB_PER_PAGE);
    }, [dbFiltered, dbPage]);

    useEffect(() => {
        setDbPage(1);
    }, [dbSearch, dbFilterJenis, dbFilterAngkatan, dbFilterProvinsi]);

    // Analytics / Statistik calculations
    const stats = useMemo(() => {
        if (!dbAlumni || dbAlumni.length === 0) return null;

        const byJenis = {};
        const byAngkatan = {};
        const byProvinsi = {};
        let withLinkedin = 0;

        dbAlumni.forEach((a) => {
            const jenis = a.jenis_pekerjaan || "Lainnya";
            byJenis[jenis] = (byJenis[jenis] || 0) + 1;

            const ang = a.angkatan || "?";
            byAngkatan[ang] = (byAngkatan[ang] || 0) + 1;

            const prov = a.provinsi || "Lainnya";
            byProvinsi[prov] = (byProvinsi[prov] || 0) + 1;

            if (a.linkedin_url && (a.linkedin_url.includes("linkedin.com") || a.linkedin_url.includes("http"))) {
                withLinkedin++;
            }
        });

        // Filter and sort angkatan cleanly (1994 s.d. 2022)
        const sortedAngkatan = Object.entries(byAngkatan)
            .filter(([k]) => k !== "?" && k.length >= 2)
            .sort((a, b) => {
                let numA = parseInt(a[0], 10);
                let numB = parseInt(b[0], 10);
                if (numA < 100) numA += numA > 50 ? 1900 : 2000;
                if (numB < 100) numB += numB > 50 ? 1900 : 2000;
                return numA - numB;
            });

        const maxAngkatanCount = Math.max(...sortedAngkatan.map(([, v]) => v), 1);
        const sortedProvinsi = Object.entries(byProvinsi).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const sortedJenis = Object.entries(byJenis).sort((a, b) => b[1] - a[1]);

        return {
            total: dbAlumni.length,
            withLinkedin,
            byJenis: sortedJenis,
            byAngkatan: sortedAngkatan,
            maxAngkatanCount,
            byProvinsi: sortedProvinsi,
            totalProvinsi: Object.keys(byProvinsi).length,
        };
    }, [dbAlumni]);

    // --- CRUD Handlers ---
    const handleOpenAdd = () => {
        setFormData({ ...emptyDirectoryForm, id: Date.now() });
        setFormError("");
        setModalMode("add");
    };

    const handleOpenEdit = (alumni) => {
        setFormData({
            id: alumni.id || Date.now(),
            nama_lengkap: alumni.nama_lengkap || "",
            angkatan: alumni.angkatan || "",
            jenis_pekerjaan: alumni.jenis_pekerjaan || "Lainnya",
            bidang_pekerjaan: alumni.bidang_pekerjaan || "",
            nama_perusahaan: alumni.nama_perusahaan || "",
            jabatan: alumni.jabatan || "",
            provinsi: alumni.provinsi || "",
            kota: alumni.kota || "",
            linkedin_url: alumni.linkedin_url || "",
            instagram_url: alumni.instagram_url || "",
            email: alumni.email || "",
            old_nama: alumni.nama_lengkap || "",
        });
        setFormError("");
        setModalMode("edit");
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (!formData.nama_lengkap.trim()) {
            setFormError("Nama lengkap wajib diisi.");
            return;
        }
        if (!formData.angkatan.trim()) {
            setFormError("Tahun angkatan wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (modalMode === "add") {
                const res = await fetch("/api/alumni-directory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const json = await res.json();
                if (json.success) {
                    setDbAlumni((prev) => [json.data || formData, ...prev]);
                    showToast("Profil alumni berhasil ditambahkan ke direktori!");
                    setModalMode(null);
                } else {
                    setFormError(json.error || "Gagal menyimpan data alumni.");
                }
            } else if (modalMode === "edit") {
                const res = await fetch("/api/alumni-directory", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                const json = await res.json();
                if (json.success) {
                    setDbAlumni((prev) =>
                        prev.map((item) =>
                            String(item.id) === String(formData.id) ||
                            (formData.old_nama && item.nama_lengkap.toLowerCase() === formData.old_nama.toLowerCase())
                                ? { ...item, ...formData }
                                : item
                        )
                    );
                    showToast("Profil alumni berhasil diperbarui!");
                    setModalMode(null);
                } else {
                    setFormError(json.error || "Gagal memperbarui data.");
                }
            }
        } catch (err) {
            setFormError("Terjadi kesalahan jaringan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const queryParams = new URLSearchParams({
                id: deleteTarget.id || "",
                nama: deleteTarget.nama_lengkap || "",
            });
            const res = await fetch(`/api/alumni-directory?${queryParams}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (json.success) {
                setDbAlumni((prev) =>
                    prev.filter(
                        (item) =>
                            String(item.id) !== String(deleteTarget.id) &&
                            item.nama_lengkap.toLowerCase() !== (deleteTarget.nama_lengkap || "").toLowerCase()
                    )
                );
                showToast(`Profil ${deleteTarget.nama_lengkap} berhasil dihapus.`);
                setDeleteTarget(null);
            } else {
                alert(json.error || "Gagal menghapus data.");
            }
        } catch (err) {
            alert("Terjadi kesalahan saat menghapus data.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (checking) return <div style={{ minHeight: "60vh" }} />;
    if (!isUnlocked) {
        return (
            <EmailGateScreen
                page="jaringan-alumni"
                onUnlock={submitEmail}
                title="Akses Jaringan Alumni"
                description="Masukkan emailmu untuk menjelajahi jejaring alumni Teknik Industri Unand."
            />
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f8faff" }}>
            {/* Floating Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        bottom: "1.5rem",
                        right: "1.5rem",
                        zIndex: 300,
                        background: toast.type === "error" ? "#ef4444" : "#10b981",
                        color: "#fff",
                        padding: "0.85rem 1.25rem",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        animation: "fadeIn 0.2s ease",
                        maxWidth: "calc(100vw - 3rem)",
                    }}
                >
                    <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Hero Banner */}
            <div
                className="hero-section"
                style={{
                    background: "linear-gradient(135deg, #090d1a 0%, #17153a 50%, #0a1128 100%)",
                    paddingTop: "5rem",
                    paddingBottom: "3rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-100px",
                        right: "-100px",
                        width: "450px",
                        height: "450px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-80px",
                        left: "-80px",
                        width: "350px",
                        height: "350px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }}
                />

                <div style={{ position: "relative", zIndex: 1, padding: "0 1rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            background: "rgba(139,92,246,0.2)",
                            border: "1px solid rgba(139,92,246,0.4)",
                            borderRadius: "999px",
                            padding: "0.35rem 1rem",
                            marginBottom: "1rem",
                        }}
                    >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#c4b5fd", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Jaringan Alumni IKA KATI UNAND
                        </span>
                    </div>

                    <h1
                        style={{
                            margin: "0 0 0.85rem",
                            fontSize: "clamp(1.75rem,5vw,2.8rem)",
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.2,
                            letterSpacing: "-0.025em",
                        }}
                    >
                        Temukan Rekan Alumni{" "}
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Teknik Industri Unand
                        </span>
                    </h1>

                    <p style={{ margin: "0 auto 1.75rem", maxWidth: "600px", color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6 }}>
                        Jejaring resmi alumni Teknik Industri Universitas Andalas yang berkiprah di BUMN, multinasional, kementerian, akademisi, hingga wirausaha di seluruh penjuru Indonesia.
                    </p>

                    {/* Hero Quick Stats */}
                    <div className="hero-stats-wrap">
                        {[
                            { num: `${dbAlumni.length}+`, label: "Alumni Terdata" },
                            { num: `${alumniList.length}`, label: "Profil Unggulan" },
                            { num: `${stats?.totalProvinsi || 32}+`, label: "Provinsi" },
                            { num: `${stats?.withLinkedin || 328}+`, label: "LinkedIn" },
                        ].map((s, i) => (
                            <div key={i} className="hero-stat-item">
                                <div className="hero-stat-num">{s.num}</div>
                                <div className="hero-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sticky Modern Tab Navigation */}
            <div
                style={{
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    position: "sticky",
                    top: "64px",
                    zIndex: 20,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                }}
            >
                <div className="tab-navigation-container">
                    {[
                        { key: "unggulan", label: "Profil Unggulan", badge: alumniList.length, icon: "✦" },
                        { key: "direktori", label: "Direktori Alumni", badge: dbAlumni.length, icon: "🗂" },
                        { key: "statistik", label: "Statistik Alumni", badge: null, icon: "📊" },
                    ].map((tab) => {
                        const isActive = mainTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setMainTab(tab.key)}
                                className={`tab-nav-btn ${isActive ? "active" : ""}`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span className={`tab-badge ${isActive ? "active" : ""}`}>
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: PROFIL UNGGULAN                                  */}
            {/* ======================================================== */}
            {mainTab === "unggulan" && (
                <div className="content-container">
                    {/* Category Filter Pills */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.85rem", flexWrap: "wrap" }}>
                        {["Semua", "Industri", "Akademisi", "Entrepreneur"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: "0.5rem 1.15rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-body), sans-serif",
                                    transition: "all 0.15s",
                                    ...(activeCategory === cat
                                        ? { background: "#1e1b4b", color: "#fff", boxShadow: "0 4px 12px rgba(30,27,75,0.2)" }
                                        : { background: "#ffffff", color: "#64748b", border: "1px solid #e2e8f0" }),
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search & Filters Bar */}
                    <div className="directory-filter-bar">
                        <input
                            type="text"
                            placeholder="🔍  Cari nama alumni unggulan..."
                            value={searchNama}
                            onChange={(e) => setSearchNama(e.target.value)}
                            className="filter-input-search"
                        />
                        <div className="filter-selects-wrap">
                            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="filter-select-item">
                                <option value="">Semua Level Jabatan</option>
                                {LEVEL_OPTIONS.map((l) => (
                                    <option key={l} value={l}>
                                        {l}
                                    </option>
                                ))}
                            </select>
                            <select value={filterIndustri} onChange={(e) => setFilterIndustri(e.target.value)} className="filter-select-item">
                                <option value="">Semua Bidang Industri</option>
                                {INDUSTRI_OPTIONS.map((i) => (
                                    <option key={i} value={i}>
                                        {i}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.4rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                            Menampilkan <strong>{featuredFiltered.length}</strong> profil unggulan
                        </p>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
                            *Dikelola langsung oleh Admin IKA KATI
                        </span>
                    </div>

                    {loadingFeatured ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ height: "360px", background: "#e2e8f0", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : featuredFiltered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 1.5rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "2.5rem" }}>🔍</div>
                            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", marginTop: "0.75rem" }}>
                                Tidak ada alumni yang cocok dengan pencarian
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.35rem" }}>
                                Coba reset filter atau gunakan kata kunci nama lainnya.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                            {featuredFiltered.map((a) => (
                                <AlumniCard key={a.id} alumni={a} onSelect={() => setSelected(a)} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: DIREKTORI ALUMNI (RESPONSIF MOBILE DENGAN CRUD)   */}
            {/* ======================================================== */}
            {mainTab === "direktori" && (
                <div className="content-container">
                    {/* Header */}
                    <div className="directory-header-wrap">
                        <div>
                            <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                                Direktori Alumni KATI UNAND
                            </h2>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
                                Cari dan telusuri data jejaring alumni Teknik Industri Universitas Andalas berdasarkan angkatan, instansi, atau wilayah domisili.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="directory-filter-bar">
                        <input
                            type="text"
                            placeholder="🔍  Cari nama, kantor, posisi, atau kota..."
                            value={dbSearch}
                            onChange={(e) => setDbSearch(e.target.value)}
                            className="filter-input-search"
                        />
                        <div className="filter-selects-wrap">
                            <select value={dbFilterAngkatan} onChange={(e) => setDbFilterAngkatan(e.target.value)} className="filter-select-item">
                                <option value="">Semua Angkatan</option>
                                {dbAngkatanList.map((a) => (
                                    <option key={a} value={a}>
                                        Angkatan {a}
                                    </option>
                                ))}
                            </select>
                            <select value={dbFilterJenis} onChange={(e) => setDbFilterJenis(e.target.value)} className="filter-select-item">
                                <option value="">Semua Jenis Pekerjaan</option>
                                {dbJenisList.map((j) => (
                                    <option key={j} value={j}>
                                        {j}
                                    </option>
                                ))}
                            </select>
                            <select value={dbFilterProvinsi} onChange={(e) => setDbFilterProvinsi(e.target.value)} className="filter-select-item">
                                <option value="">Semua Provinsi</option>
                                {dbProvinsiList.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                            Menampilkan <strong>{dbPaginated.length}</strong> dari <strong>{dbFiltered.length}</strong> alumni
                            <span style={{ color: "#94a3b8" }}> (total: {dbAlumni.length})</span>
                        </p>
                        {(dbSearch || dbFilterAngkatan || dbFilterJenis || dbFilterProvinsi) && (
                            <button
                                onClick={() => {
                                    setDbSearch("");
                                    setDbFilterAngkatan("");
                                    setDbFilterJenis("");
                                    setDbFilterProvinsi("");
                                }}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#7c3aed",
                                    fontSize: "0.82rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                }}
                            >
                                Reset Filter
                            </button>
                        )}
                    </div>

                    {dbFiltered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 1.5rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "2.5rem" }}>📂</div>
                            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1e293b", marginTop: "0.75rem" }}>
                                Tidak ada data alumni yang sesuai
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.35rem" }}>
                                Coba sesuaikan kata kunci pencarian atau gunakan tombol Tambah Profil untuk menambahkan diri Anda.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                                {dbPaginated.map((a, i) => (
                                    <DirectoryRow
                                        key={a.id || i}
                                        alumni={a}
                                    />
                                ))}
                            </div>

                            {dbPaginated.length < dbFiltered.length && (
                                <div style={{ textAlign: "center", marginTop: "2rem" }}>
                                    <button
                                        onClick={() => setDbPage((p) => p + 1)}
                                        style={{
                                            padding: "0.75rem 2rem",
                                            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "999px",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            fontFamily: "var(--font-body), sans-serif",
                                            boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
                                    >
                                        Tampilkan Lebih Banyak ({dbFiltered.length - dbPaginated.length} lagi)
                                    </button>
                                </div>
                            )}

                            {/* Info Box PJ Wilayah / Admin */}
                            <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "12px", padding: "0.85rem 1.25rem", marginTop: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                                    🔒 <strong>Akses Khusus Pengurus & PJ Wilayah:</strong> Pembaruan atau penambahan database alumni dikoordinasikan melalui Penanggung Jawab (PJ) daerah masing-masing atau Admin KATI.
                                </span>
                                <a href="/admin" style={{ fontSize: "0.82rem", color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>
                                    Portal PJ Wilayah / Admin →
                                </a>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: STATISTIK ALUMNI (DASHBOARD ANALITIK DIOPTIMASI)  */}
            {/* ======================================================== */}
            {mainTab === "statistik" && (
                <div className="content-container">
                    <div style={{ marginBottom: "1.75rem" }}>
                        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                            Dashboard Statistik Alumni
                        </h2>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
                            Visualisasi distribusi sektor karier, angkatan, dan persebaran wilayah alumni Teknik Industri Unand.
                        </p>
                    </div>

                    {!stats ? (
                        <div style={{ textAlign: "center", padding: "4rem 1.5rem", background: "#fff", borderRadius: "16px" }}>
                            <div style={{ fontSize: "2.5rem" }}>📊</div>
                            <div style={{ fontWeight: 700, marginTop: "0.75rem" }}>Memuat statistik...</div>
                        </div>
                    ) : (
                        <>
                            {/* 4 KPI Top Cards */}
                            <div className="stats-kpi-grid">
                                {[
                                    { label: "Total Alumni Terdata", value: `${stats.total}`, icon: "👥", color: "#2563eb", sub: "100% respons terverifikasi" },
                                    { label: "Memiliki Profil LinkedIn", value: `${stats.withLinkedin}`, icon: "💼", color: "#0a66c2", sub: `${((stats.withLinkedin / stats.total) * 100).toFixed(1)}% koneksi profesional` },
                                    { label: "Sektor BUMN & Swasta", value: `${(stats.byJenis.find(([j]) => j.includes("BUMN"))?.[1] || 0) + (stats.byJenis.find(([j]) => j === "Swasta Nasional")?.[1] || 0) + (stats.byJenis.find(([j]) => j === "Swasta Asing")?.[1] || 0)}`, icon: "🏢", color: "#059669", sub: "Mayoritas serapan industri" },
                                    { label: "Sebaran Wilayah", value: `${stats.totalProvinsi} Provinsi`, icon: "📍", color: "#d97706", sub: "Seluruh pelosok Indonesia" },
                                ].map((card, idx) => (
                                    <div key={idx} className="stats-kpi-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{ fontSize: "1.6rem" }}>{card.icon}</div>
                                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: card.color, background: `${card.color}15`, padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
                                                Stat
                                            </span>
                                        </div>
                                        <div className="stats-kpi-value">{card.value}</div>
                                        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginTop: "0.2rem" }}>
                                            {card.label}
                                        </div>
                                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                                            {card.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Section 1: Jenis Pekerjaan Alumni */}
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "16px",
                                    padding: "1.5rem",
                                    boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
                                    marginBottom: "1.75rem",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                                            Distribusi Jenis Pekerjaan Alumni
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                                            Perbandingan persentase sektor pekerjaan berdasarkan survei database alumni
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                        Total: {stats.total} Responden
                                    </span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                                    {stats.byJenis.map(([jenis, count]) => {
                                        const pct = ((count / stats.total) * 100).toFixed(1);
                                        const color = getJenisColor(jenis);
                                        return (
                                            <div key={jenis} className="jenis-progress-item">
                                                <div className="jenis-label-wrap">
                                                    <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: color, display: "inline-block", flexShrink: 0 }} />
                                                    <span className="jenis-name">{jenis}</span>
                                                    <span className="jenis-count-mobile">
                                                        {count} ({pct}%)
                                                    </span>
                                                </div>

                                                <div className="jenis-bar-track">
                                                    <div
                                                        style={{
                                                            width: `${pct}%`,
                                                            height: "100%",
                                                            background: color,
                                                            borderRadius: "999px",
                                                            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        }}
                                                    />
                                                </div>

                                                <div className="jenis-count-desktop">
                                                    {count} <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.76rem" }}>({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 2: Bar Chart Distribusi per Angkatan */}
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "16px",
                                    padding: "1.5rem",
                                    boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
                                    marginBottom: "1.75rem",
                                    overflow: "hidden",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                                            Alumni yang Telah Terdata per Angkatan
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                                            Frekuensi responden alumni mulai dari angkatan awal hingga angkatan terbaru
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700 }}>
                                        Puncak: Angkatan 2008 & 2009
                                    </span>
                                </div>

                                <div
                                    className="custom-chart-scroll"
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "8px",
                                        height: "270px",
                                        overflowX: "auto",
                                        paddingBottom: "2.75rem",
                                        paddingTop: "2.5rem",
                                        paddingLeft: "0.5rem",
                                        paddingRight: "1.5rem",
                                        WebkitOverflowScrolling: "touch",
                                    }}
                                >
                                    {stats.byAngkatan.map(([angkatan, count]) => {
                                        const heightPx = Math.max((count / stats.maxAngkatanCount) * 115, 8);
                                        const isPeak = count >= 60;
                                        return (
                                            <div
                                                key={angkatan}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    flexShrink: 0,
                                                    minWidth: "28px",
                                                }}
                                                title={`Angkatan ${angkatan}: ${count} alumni`}
                                            >
                                                {/* Angka di atas bar */}
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        color: isPeak ? "#6d28d9" : "#64748b",
                                                        fontWeight: isPeak ? 800 : 700,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {count}
                                                </span>

                                                {/* Batang grafik */}
                                                <div
                                                    style={{
                                                        width: "22px",
                                                        height: `${heightPx}px`,
                                                        background: isPeak
                                                            ? "linear-gradient(180deg, #7c3aed, #4f46e5)"
                                                            : "#93c5fd",
                                                        borderRadius: "4px 4px 0 0",
                                                        transition: "height 0.4s ease, transform 0.15s ease",
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = "scaleY(1.05)";
                                                        e.currentTarget.style.filter = "brightness(1.1)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = "";
                                                        e.currentTarget.style.filter = "none";
                                                    }}
                                                />

                                                {/* Tahun angkatan di bawah bar */}
                                                <span
                                                    style={{
                                                        fontSize: "0.68rem",
                                                        color: "#64748b",
                                                        fontWeight: 600,
                                                        transform: "rotate(-45deg)",
                                                        whiteSpace: "nowrap",
                                                        marginTop: "8px",
                                                    }}
                                                >
                                                    {angkatan}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 3: Dua Kolom (Top Provinsi & Adopsi Digital) */}
                            <div className="stats-bottom-grid">
                                {/* Top Provinsi */}
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "16px",
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                                        Top 10 Provinsi Domisili Kerja
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                                        {stats.byProvinsi.map(([prov, count], i) => (
                                            <div key={prov} style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                                                <div
                                                    style={{
                                                        width: "22px",
                                                        height: "22px",
                                                        borderRadius: "50%",
                                                        background: i < 3 ? "#7c3aed" : "#f1f5f9",
                                                        color: i < 3 ? "#fff" : "#64748b",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.68rem",
                                                        fontWeight: 700,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {i + 1}
                                                </div>
                                                <div style={{ flex: 1, fontSize: "0.82rem", color: "#334155", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {prov}
                                                </div>
                                                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0f172a", flexShrink: 0 }}>
                                                    {count}{" "}
                                                    <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: 400 }}>
                                                        ({((count / stats.total) * 100).toFixed(1)}%)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Profil Digital / LinkedIn Adoption */}
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "16px",
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <div>
                                        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                                            Konektivitas Profesional (LinkedIn)
                                        </h3>
                                        <p style={{ margin: "0 0 1.25rem", fontSize: "0.8rem", color: "#64748b" }}>
                                            Tingkat keterhubungan alumni di platform jaringan karir profesional LinkedIn.
                                        </p>

                                        <div style={{ marginBottom: "1.25rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0a66c2" }}>
                                                    Terdaftar LinkedIn ({stats.withLinkedin})
                                                </span>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0a66c2" }}>
                                                    {((stats.withLinkedin / stats.total) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        width: `${(stats.withLinkedin / stats.total) * 100}%`,
                                                        height: "100%",
                                                        background: "#0a66c2",
                                                        borderRadius: "999px",
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#64748b" }}>
                                                    Belum Menyertakan ({stats.total - stats.withLinkedin})
                                                </span>
                                                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#64748b" }}>
                                                    {(((stats.total - stats.withLinkedin) / stats.total) * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
                                                <div
                                                    style={{
                                                        width: `${((stats.total - stats.withLinkedin) / stats.total) * 100}%`,
                                                        height: "100%",
                                                        background: "#cbd5e1",
                                                        borderRadius: "999px",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "1.5rem",
                                            padding: "0.9rem",
                                            background: "#f0fdf4",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534", marginBottom: "0.15rem" }}>
                                            💡 Jaga Keterhubungan
                                        </div>
                                        <div style={{ fontSize: "0.76rem", color: "#15803d", lineHeight: 1.5 }}>
                                            Kunjungi tab Direktori Alumni untuk menemukan dan terhubung langsung dengan rekan alumni melalui LinkedIn.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Modal Detail Profil Unggulan */}
            {selected && (
                <div
                    onClick={() => setSelected(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.65)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 200,
                        padding: "1rem",
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#fff",
                            borderRadius: "20px",
                            maxWidth: "480px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflow: "auto",
                            boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div
                            style={{
                                position: "relative",
                                aspectRatio: "3/2",
                                overflow: "hidden",
                                background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                            }}
                        >
                            {selected.foto_url ? (
                                <img
                                    src={selected.foto_url}
                                    alt={selected.nama}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                                />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: "4.5rem", color: "rgba(167,139,250,0.5)", fontWeight: 800 }}>
                                        {selected.nama?.charAt(0)}
                                    </span>
                                </div>
                            )}
                            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    position: "absolute",
                                    top: "1rem",
                                    right: "1rem",
                                    background: "rgba(0,0,0,0.4)",
                                    border: "none",
                                    color: "#fff",
                                    borderRadius: "50%",
                                    width: "32px",
                                    height: "32px",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ padding: "1.5rem" }}>
                            {selected.level && (
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "0.22rem 0.75rem",
                                        borderRadius: "999px",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        background: getLevelStyle(selected.level).bg,
                                        color: getLevelStyle(selected.level).text,
                                        border: `1px solid ${getLevelStyle(selected.level).border}`,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {selected.level}
                                </span>
                            )}
                            <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                                {selected.nama}
                            </h2>
                            <p style={{ margin: "0 0 0.15rem", color: "#7c3aed", fontWeight: 700, fontSize: "0.92rem" }}>
                                {selected.jabatan}
                            </p>
                            <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: "0.85rem" }}>
                                {selected.tempat_kerja}
                                {selected.kota ? ` · ${selected.kota}` : ""}
                            </p>
                            {selected.angkatan && (
                                <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                                    🎓 Angkatan {selected.angkatan}
                                </div>
                            )}
                            {selected.deskripsi && (
                                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.6, marginTop: "0.5rem" }}>
                                    {selected.deskripsi}
                                </p>
                            )}
                            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.25rem" }}>
                                {selected.wa_number && (
                                    <a
                                        href={`https://wa.me/${selected.wa_number}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={socialBtnStyle("#25D366")}
                                        title="Hubungi WhatsApp"
                                    >
                                        <WhatsAppIcon />
                                    </a>
                                )}
                                {selected.linkedin_url && (
                                    <a
                                        href={selected.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={socialBtnStyle("#0A66C2")}
                                        title="Buka Profil LinkedIn"
                                    >
                                        <LinkedInIcon />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global & Responsive CSS Styles */}
            <style jsx global>{`
                /* Main Container */
                .content-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 2.5rem 1.5rem 5rem;
                }

                /* Hero Stats */
                .hero-stats-wrap {
                    display: flex;
                    gap: 2.5rem;
                    justify-content: center;
                    margin-top: 1.5rem;
                    flex-wrap: wrap;
                }
                .hero-stat-item {
                    text-align: center;
                }
                .hero-stat-num {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.02em;
                }
                .hero-stat-label {
                    font-size: 0.74rem;
                    color: #94a3b8;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-top: 0.15rem;
                }

                /* Sticky Tab Nav */
                .tab-navigation-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    display: flex;
                    gap: 0.5rem;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .tab-navigation-container::-webkit-scrollbar {
                    display: none;
                }
                .tab-nav-btn {
                    padding: 0.95rem 1.4rem;
                    border: none;
                    border-bottom: 3px solid transparent;
                    background: transparent;
                    font-weight: 600;
                    font-size: 0.92rem;
                    color: #64748b;
                    cursor: pointer;
                    font-family: var(--font-body), sans-serif;
                    transition: all 0.15s ease;
                    margin-bottom: -1px;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .tab-nav-btn.active {
                    border-bottom-color: #7c3aed;
                    color: #7c3aed;
                    font-weight: 700;
                }
                .tab-badge {
                    font-size: 0.72rem;
                    padding: 0.1rem 0.5rem;
                    border-radius: 999px;
                    background: #f1f5f9;
                    color: #64748b;
                    font-weight: 700;
                }
                .tab-badge.active {
                    background: #f3e8ff;
                    color: #7c3aed;
                }

                /* Header Direktori */
                .directory-header-wrap {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                .btn-add-alumni {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.35rem;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: #fff;
                    border: none;
                    border-radius: 999px;
                    font-weight: 700;
                    font-size: 0.88rem;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(124,58,237,0.25);
                    transition: all 0.15s ease;
                    white-space: nowrap;
                }

                /* Filter Bar */
                .directory-filter-bar {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    margin-bottom: 1.25rem;
                }
                .filter-input-search {
                    padding: 0.65rem 1.1rem;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    fontSize: 0.88rem;
                    color: #0f172a;
                    outline: none;
                    min-width: 260px;
                    flex-grow: 1;
                    font-family: var(--font-body), sans-serif;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }
                .filter-selects-wrap {
                    display: flex;
                    gap: 0.6rem;
                    flex-wrap: wrap;
                }
                .filter-select-item {
                    padding: 0.65rem 1rem;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    font-size: 0.85rem;
                    color: #0f172a;
                    outline: none;
                    font-family: var(--font-body), sans-serif;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                }

                /* Directory Row Card (Modern & Fully Responsive) */
                .directory-row-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 1rem 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.65rem;
                    transition: box-shadow 0.15s, border-color 0.15s;
                }
                .directory-row-card:hover {
                    box-shadow: 0 4px 16px rgba(15,23,42,0.06);
                    border-color: #cbd5e1;
                }
                .directory-row-main {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.85rem;
                    width: 100%;
                }
                .directory-row-info {
                    flex: 1;
                    min-width: 0;
                }
                .directory-row-name {
                    font-weight: 700;
                    font-size: 0.95rem;
                    color: #0f172a;
                    line-height: 1.35;
                    word-break: break-word;
                }
                .directory-row-role {
                    font-size: 0.82rem;
                    color: #64748b;
                    line-height: 1.4;
                    margin-top: 0.2rem;
                    word-break: break-word;
                }
                .directory-row-location {
                    font-size: 0.76rem;
                    color: #94a3b8;
                    margin-top: 0.25rem;
                }
                .directory-row-actions {
                    display: flex;
                    gap: 0.4rem;
                    flex-shrink: 0;
                    align-items: center;
                }
                .directory-action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #475569;
                    cursor: pointer;
                    font-size: 0.85rem;
                    text-decoration: none;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }
                .directory-action-btn:hover {
                    background: #f1f5f9;
                }
                .directory-action-btn.edit-btn:hover {
                    background: #7c3aed;
                    color: #fff;
                    border-color: #7c3aed;
                }
                .directory-action-btn.delete-btn:hover {
                    background: #ef4444;
                    color: #fff;
                    border-color: #ef4444;
                }
                .directory-action-btn.linkedin-btn {
                    background: rgba(10,102,194,0.1);
                    border-color: rgba(10,102,194,0.3);
                    color: #0a66c2;
                    font-weight: 800;
                    font-size: 0.75rem;
                }
                .directory-action-btn.linkedin-btn:hover {
                    background: #0a66c2;
                    color: #fff;
                }
                .directory-row-badges {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.45rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid #f8fafc;
                }
                .badge-angkatan {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #475569;
                    background: #f8faff;
                    border: 1px solid #e2e8f0;
                    border-radius: 999px;
                    padding: 0.2rem 0.65rem;
                    white-space: nowrap;
                }
                .badge-jenis {
                    font-size: 0.72rem;
                    font-weight: 700;
                    border: 1px solid;
                    border-radius: 999px;
                    padding: 0.2rem 0.7rem;
                    white-space: nowrap;
                    max-width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .badge-bidang {
                    font-size: 0.72rem;
                    color: #64748b;
                    background: #f1f5f9;
                    border-radius: 999px;
                    padding: 0.2rem 0.65rem;
                    white-space: nowrap;
                }

                /* Stats Dashboard Components */
                .stats-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2rem;
                }
                .stats-kpi-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 1.4rem;
                    box-shadow: 0 2px 10px rgba(15,23,42,0.04);
                }
                .stats-kpi-value {
                    font-size: 1.85rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 0.6rem;
                }
                .stats-bottom-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                /* Jenis Pekerjaan Progress Item */
                .jenis-progress-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    width: 100%;
                }
                .jenis-label-wrap {
                    width: 240px;
                    font-size: 0.84rem;
                    font-weight: 600;
                    color: #334155;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .jenis-name {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .jenis-count-mobile {
                    display: none;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-left: auto;
                }
                .jenis-bar-track {
                    flex: 1;
                    min-width: 120px;
                    background: #f1f5f9;
                    border-radius: 999px;
                    height: 22px;
                    overflow: hidden;
                    position: relative;
                }
                .jenis-count-desktop {
                    width: 95px;
                    text-align: right;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #0f172a;
                    flex-shrink: 0;
                }

                /* Modal Styling */
                .modal-content-box {
                    background: #fff;
                    border-radius: 20px;
                    max-width: 540px;
                    width: 100%;
                    max-height: 92vh;
                    overflow-y: auto;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.25);
                    padding: 2rem;
                    position: relative;
                }
                .modal-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                /* Custom Chart Scrollbar */
                .custom-chart-scroll::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-chart-scroll::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 999px;
                }
                .custom-chart-scroll::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 999px;
                }
                .custom-chart-scroll::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* ─────────────────────────────────────────────────────────────
                   MOBILE RESPONSIVE BREAKPOINT (< 768px)
                   ───────────────────────────────────────────────────────────── */
                @media (max-width: 767px) {
                    .content-container {
                        padding: 1.5rem 0.85rem 4rem;
                    }

                    .hero-section {
                        padding-top: 4.25rem !important;
                        padding-bottom: 2.25rem !important;
                    }
                    .hero-stats-wrap {
                        display: grid !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 1rem !important;
                        max-width: 280px;
                        margin-left: auto;
                        margin-right: auto;
                    }
                    .hero-stat-num {
                        font-size: 1.45rem !important;
                    }

                    .tab-navigation-container {
                        padding: 0 0.85rem !important;
                    }
                    .tab-nav-btn {
                        padding: 0.85rem 1rem !important;
                        font-size: 0.85rem !important;
                    }

                    .directory-header-wrap {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 0.85rem !important;
                    }
                    .btn-add-alumni {
                        width: 100% !important;
                        justify-content: center !important;
                    }

                    .directory-filter-bar {
                        flex-direction: column !important;
                        gap: 0.5rem !important;
                    }
                    .filter-input-search {
                        width: 100% !important;
                        min-width: 100% !important;
                        border-radius: 12px !important;
                    }
                    .filter-selects-wrap {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 0.5rem !important;
                        width: 100% !important;
                    }
                    .filter-select-item {
                        width: 100% !important;
                        border-radius: 12px !important;
                    }

                    /* Directory Row Mobile Layout: */
                    .directory-row-card {
                        padding: 0.85rem 1rem !important;
                        gap: 0.6rem !important;
                    }
                    .directory-row-badges {
                        margin-left: 0 !important;
                        padding-top: 0.5rem !important;
                    }

                    /* Stats on Mobile */
                    .stats-kpi-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 0.75rem !important;
                    }
                    .stats-kpi-card {
                        padding: 1rem !important;
                        border-radius: 12px !important;
                    }
                    .stats-kpi-value {
                        font-size: 1.45rem !important;
                        margin-top: 0.4rem !important;
                    }

                    /* Jenis Pekerjaan Mobile: Stack label di atas bar */
                    .jenis-progress-item {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 0.35rem !important;
                    }
                    .jenis-label-wrap {
                        width: 100% !important;
                    }
                    .jenis-count-mobile {
                        display: inline-block !important;
                    }
                    .jenis-count-desktop {
                        display: none !important;
                    }
                    .jenis-bar-track {
                        width: 100% !important;
                        height: 18px !important;
                    }

                    .stats-bottom-grid {
                        grid-template-columns: 1fr !important;
                    }

                    /* Modal Mobile */
                    .modal-content-box {
                        padding: 1.25rem !important;
                        border-radius: 16px !important;
                    }
                    .modal-grid-2 {
                        grid-template-columns: 1fr !important;
                        gap: 0.85rem !important;
                    }
                }

                @media (min-width: 768px) {
                    .directory-row-badges {
                        margin-left: 48px;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

// ── Komponen Alumni Card (Tab Profil Unggulan) ─────────────────────────────────
function AlumniCard({ alumni, onSelect }) {
    const levelStyle = getLevelStyle(alumni.level);
    return (
        <div
            onClick={onSelect}
            style={{
                background: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "flex",
                flexDirection: "column",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(15,23,42,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(15,23,42,0.04)";
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 4",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                    flexShrink: 0,
                }}
            >
                {alumni.foto_url ? (
                    <img
                        src={alumni.foto_url}
                        alt={alumni.nama}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "5rem", fontWeight: 800, color: "rgba(167,139,250,0.4)" }}>
                            {alumni.nama?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                )}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "55%",
                        background: "linear-gradient(to top, rgba(15,10,40,0.88) 0%, transparent 100%)",
                        pointerEvents: "none",
                    }}
                />
                {alumni.level && (
                    <div style={{ position: "absolute", top: "0.75rem", left: "0.75rem" }}>
                        <span
                            style={{
                                display: "inline-block",
                                padding: "0.22rem 0.65rem",
                                borderRadius: "999px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                background: levelStyle.bg,
                                color: levelStyle.text,
                                border: `1px solid ${levelStyle.border}`,
                                backdropFilter: "blur(4px)",
                            }}
                        >
                            {alumni.level}
                        </span>
                    </div>
                )}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1rem 1.1rem 0.9rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.08rem", color: "#fff", lineHeight: 1.25, marginBottom: "0.2rem" }}>
                        {alumni.nama}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#c4b5fd", fontWeight: 600 }}>{alumni.jabatan}</div>
                </div>
            </div>

            <div style={{ padding: "1.1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ fontSize: "0.83rem", color: "#475569", fontWeight: 600 }}>
                    🏢 {alumni.tempat_kerja}
                    {alumni.kota ? ` · ${alumni.kota}` : ""}
                </div>
                {alumni.industri && <div style={{ fontSize: "0.78rem", color: "#64748b" }}>🏭 {alumni.industri}</div>}
                {alumni.angkatan && (
                    <div
                        style={{
                            display: "inline-block",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "#94a3b8",
                            background: "#f8faff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "999px",
                            padding: "0.18rem 0.6rem",
                            width: "fit-content",
                        }}
                    >
                        Angkatan {alumni.angkatan}
                    </div>
                )}

                <div
                    style={{
                        marginTop: "auto",
                        paddingTop: "0.8rem",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                        {alumni.wa_number && (
                            <a
                                href={`https://wa.me/${alumni.wa_number}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={socialBtnStyle("#25D366")}
                            >
                                <WhatsAppIcon />
                            </a>
                        )}
                        {alumni.linkedin_url && (
                            <a
                                href={alumni.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={socialBtnStyle("#0A66C2")}
                            >
                                <LinkedInIcon />
                            </a>
                        )}
                    </div>
                    <span style={{ fontSize: "0.76rem", color: "#7c3aed", fontWeight: 700 }}>Lihat Profil →</span>
                </div>
            </div>
        </div>
    );
}

// ── Komponen Baris Direktori (Tab Direktori Alumni) ───────────────────────────
function DirectoryRow({ alumni }) {
    const jenisColor = getJenisColor(alumni.jenis_pekerjaan);
    const hasLinkedIn = alumni.linkedin_url && (alumni.linkedin_url.includes("linkedin.com") || alumni.linkedin_url.includes("http"));

    return (
        <div className="directory-row-card">
            {/* Top row / Main info */}
            <div className="directory-row-main">
                {/* Avatar Initial */}
                <div
                    style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: `${jenisColor}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: jenisColor }}>
                        {alumni.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                </div>

                {/* Nama, Jabatan, Kantor */}
                <div className="directory-row-info">
                    <div className="directory-row-name">
                        {alumni.nama_lengkap}
                    </div>
                    {(alumni.jabatan || alumni.nama_perusahaan) && (
                        <div className="directory-row-role">
                            {alumni.jabatan && <span style={{ color: "#334155", fontWeight: 600 }}>{alumni.jabatan}</span>}
                            {alumni.jabatan && alumni.nama_perusahaan && <span style={{ color: "#cbd5e1" }}> · </span>}
                            {alumni.nama_perusahaan && <span>{alumni.nama_perusahaan}</span>}
                        </div>
                    )}
                    {(alumni.kota || alumni.provinsi) && (
                        <div className="directory-row-location">
                            📍 {alumni.kota || alumni.provinsi}
                        </div>
                    )}
                </div>

                {/* Tombol Aksi (Hanya LinkedIn jika tersedia) */}
                <div className="directory-row-actions">
                    {hasLinkedIn && (
                        <a
                            href={alumni.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            className="directory-action-btn linkedin-btn"
                            title="Buka LinkedIn"
                        >
                            in
                        </a>
                    )}
                </div>
            </div>

            {/* Badges row di bawah */}
            <div className="directory-row-badges">
                {alumni.angkatan && (
                    <span className="badge-angkatan">
                        Angkatan {alumni.angkatan}
                    </span>
                )}

                {alumni.jenis_pekerjaan && (
                    <span
                        className="badge-jenis"
                        style={{
                            color: jenisColor,
                            background: `${jenisColor}15`,
                            borderColor: `${jenisColor}35`,
                        }}
                        title={alumni.jenis_pekerjaan}
                    >
                        {alumni.jenis_pekerjaan}
                    </span>
                )}

                {alumni.bidang_pekerjaan && (
                    <span className="badge-bidang">
                        {alumni.bidang_pekerjaan}
                    </span>
                )}
            </div>
        </div>
    );
}

function socialBtnStyle(color) {
    return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color: color,
        textDecoration: "none",
        transition: "all 0.15s",
    };
}