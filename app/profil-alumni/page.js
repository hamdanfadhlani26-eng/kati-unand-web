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

const filterInputStyle = {
    padding: "0.65rem 1.1rem",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    fontSize: "0.88rem",
    color: "#0f172a",
    outline: "none",
    minWidth: "220px",
    flexGrow: 1,
    fontFamily: "var(--font-body), sans-serif",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
};

const filterSelectStyle = {
    padding: "0.65rem 1.1rem",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    fontSize: "0.88rem",
    color: "#0f172a",
    outline: "none",
    fontFamily: "var(--font-body), sans-serif",
    cursor: "pointer",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
};

export default function JaringanAlumni() {
    const { isUnlocked, checking, submitEmail } = useEmailGate("jaringan-alumni");

    // Main 3 tabs: 'unggulan' (Sorotan Profil), 'direktori' (Direktori Lengkap), 'statistik' (Dashboard Statistik)
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
    const [loadingDb, setLoadingDb] = useState(false);
    const [dbSearch, setDbSearch] = useState("");
    const [dbFilterJenis, setDbFilterJenis] = useState("");
    const [dbFilterAngkatan, setDbFilterAngkatan] = useState("");
    const [dbFilterProvinsi, setDbFilterProvinsi] = useState("");
    const [dbPage, setDbPage] = useState(1);
    const DB_PER_PAGE = 30;

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
            const { data, error } = await supabase
                .from("alumni_database")
                .select("*")
                .order("angkatan", { ascending: false });
            if (!error && data && data.length > 0) {
                setDbAlumni(data);
            }
        } catch (e) {
            // If table doesn't exist yet, initialAlumniData from JSON is already active
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
            {/* Hero Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #090d1a 0%, #17153a 50%, #0a1128 100%)",
                    paddingTop: "5.5rem",
                    paddingBottom: "3.5rem",
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

                <div style={{ position: "relative", zIndex: 1, padding: "0 1.5rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.45rem",
                            background: "rgba(139,92,246,0.2)",
                            border: "1px solid rgba(139,92,246,0.4)",
                            borderRadius: "999px",
                            padding: "0.35rem 1.1rem",
                            marginBottom: "1.25rem",
                        }}
                    >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
                        <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#c4b5fd", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                            Jaringan Alumni IKA KATI UNAND
                        </span>
                    </div>

                    <h1
                        style={{
                            margin: "0 0 1rem",
                            fontSize: "clamp(2rem,5vw,3rem)",
                            fontWeight: 800,
                            color: "#fff",
                            lineHeight: 1.15,
                            letterSpacing: "-0.025em",
                        }}
                    >
                        Temukan Rekan Alumni{" "}
                        <span style={{ background: "linear-gradient(135deg, #a78bfa, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Teknik Industri Unand
                        </span>
                    </h1>

                    <p style={{ margin: "0 auto 2rem", maxWidth: "620px", color: "#94a3b8", fontSize: "1rem", lineHeight: 1.7 }}>
                        Jejaring resmi alumni Teknik Industri Universitas Andalas yang berkiprah di BUMN, multinasional, kementerian, akademisi, hingga wirausaha di seluruh penjuru Indonesia.
                    </p>

                    {/* Hero Quick Stats */}
                    <div style={{ display: "flex", gap: "2.5rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                        {[
                            { num: `${dbAlumni.length}+`, label: "Alumni Terdata" },
                            { num: `${alumniList.length}`, label: "Profil Unggulan" },
                            { num: `${stats?.totalProvinsi || 32}+`, label: "Provinsi Domisili" },
                            { num: `${stats?.withLinkedin || 328}+`, label: "Profil LinkedIn" },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.num}</div>
                                <div style={{ fontSize: "0.76rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: "0.15rem" }}>
                                    {s.label}
                                </div>
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
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.5rem", display: "flex", gap: "0.5rem" }}>
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
                                style={{
                                    padding: "1rem 1.4rem",
                                    border: "none",
                                    borderBottom: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                                    background: "transparent",
                                    fontWeight: isActive ? 700 : 600,
                                    fontSize: "0.92rem",
                                    color: isActive ? "#7c3aed" : "#64748b",
                                    cursor: "pointer",
                                    fontFamily: "var(--font-body), sans-serif",
                                    transition: "all 0.15s ease",
                                    marginBottom: "-1px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.badge && (
                                    <span
                                        style={{
                                            fontSize: "0.72rem",
                                            padding: "0.1rem 0.5rem",
                                            borderRadius: "999px",
                                            background: isActive ? "#f3e8ff" : "#f1f5f9",
                                            color: isActive ? "#7c3aed" : "#64748b",
                                            fontWeight: 700,
                                        }}
                                    >
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
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
                    {/* Category Filter Pills */}
                    <div style={{ display: "flex", gap: "0.6rem", marginBottom: "2rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "1rem", flexWrap: "wrap" }}>
                        {["Semua", "Industri", "Akademisi", "Entrepreneur"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    padding: "0.55rem 1.25rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: "0.88rem",
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
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
                        <input
                            type="text"
                            placeholder="🔍  Cari nama alumni unggulan..."
                            value={searchNama}
                            onChange={(e) => setSearchNama(e.target.value)}
                            style={filterInputStyle}
                        />
                        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} style={filterSelectStyle}>
                            <option value="">Semua Level Jabatan</option>
                            {LEVEL_OPTIONS.map((l) => (
                                <option key={l} value={l}>
                                    {l}
                                </option>
                            ))}
                        </select>
                        <select value={filterIndustri} onChange={(e) => setFilterIndustri(e.target.value)} style={filterSelectStyle}>
                            <option value="">Semua Bidang Industri</option>
                            {INDUSTRI_OPTIONS.map((i) => (
                                <option key={i} value={i}>
                                    {i}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                            Menampilkan <strong>{featuredFiltered.length}</strong> profil unggulan
                        </p>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontStyle: "italic" }}>
                            *Dikelola langsung oleh Admin IKA KATI
                        </span>
                    </div>

                    {loadingFeatured ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ height: "360px", background: "#e2e8f0", borderRadius: "16px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : featuredFiltered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "3rem" }}>🔍</div>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b", marginTop: "1rem" }}>
                                Tidak ada alumni yang cocok dengan pencarian
                            </div>
                            <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "0.35rem" }}>
                                Coba reset filter atau gunakan kata kunci nama lainnya.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                            {featuredFiltered.map((a) => (
                                <AlumniCard key={a.id} alumni={a} onSelect={() => setSelected(a)} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: DIREKTORI ALUMNI (DATABASE LENGKAP)               */}
            {/* ======================================================== */}
            {mainTab === "direktori" && (
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                            Direktori Alumni KATI UNAND
                        </h2>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem" }}>
                            Daftar basis data alumni Teknik Industri Unand dari seluruh angkatan dan domisili kerja.
                        </p>
                    </div>

                    {/* Filter Bar */}
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                        <input
                            type="text"
                            placeholder="🔍  Cari nama, institusi/perusahaan, jabatan, atau kota..."
                            value={dbSearch}
                            onChange={(e) => setDbSearch(e.target.value)}
                            style={{ ...filterInputStyle, minWidth: "280px" }}
                        />
                        <select value={dbFilterAngkatan} onChange={(e) => setDbFilterAngkatan(e.target.value)} style={filterSelectStyle}>
                            <option value="">Semua Angkatan</option>
                            {dbAngkatanList.map((a) => (
                                <option key={a} value={a}>
                                    Angkatan {a}
                                </option>
                            ))}
                        </select>
                        <select value={dbFilterJenis} onChange={(e) => setDbFilterJenis(e.target.value)} style={filterSelectStyle}>
                            <option value="">Semua Jenis Pekerjaan</option>
                            {dbJenisList.map((j) => (
                                <option key={j} value={j}>
                                    {j}
                                </option>
                            ))}
                        </select>
                        <select value={dbFilterProvinsi} onChange={(e) => setDbFilterProvinsi(e.target.value)} style={filterSelectStyle}>
                            <option value="">Semua Provinsi</option>
                            {dbProvinsiList.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
                            Menampilkan <strong>{dbPaginated.length}</strong> dari <strong>{dbFiltered.length}</strong> alumni
                            <span style={{ color: "#94a3b8" }}> (total database: {dbAlumni.length} alumni)</span>
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
                        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                            <div style={{ fontSize: "3rem" }}>📂</div>
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b", marginTop: "1rem" }}>
                                Tidak ada data alumni yang sesuai
                            </div>
                            <p style={{ fontSize: "0.88rem", color: "#64748b", marginTop: "0.35rem" }}>
                                Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                {dbPaginated.map((a, i) => (
                                    <DirectoryRow key={a.id || i} alumni={a} />
                                ))}
                            </div>

                            {dbPaginated.length < dbFiltered.length && (
                                <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                                    <button
                                        onClick={() => setDbPage((p) => p + 1)}
                                        style={{
                                            padding: "0.8rem 2.2rem",
                                            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "999px",
                                            fontWeight: 700,
                                            fontSize: "0.92rem",
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
                        </>
                    )}
                </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: STATISTIK ALUMNI (DASHBOARD ANALITIK)             */}
            {/* ======================================================== */}
            {mainTab === "statistik" && (
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
                    <div style={{ marginBottom: "2rem" }}>
                        <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                            Dashboard Statistik Alumni
                        </h2>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.92rem" }}>
                            Visualisasi distribusi sektor karier, angkatan, dan persebaran wilayah alumni Teknik Industri Unand.
                        </p>
                    </div>

                    {!stats ? (
                        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#fff", borderRadius: "16px" }}>
                            <div style={{ fontSize: "3rem" }}>📊</div>
                            <div style={{ fontWeight: 700, marginTop: "1rem" }}>Memuat statistik...</div>
                        </div>
                    ) : (
                        <>
                            {/* 4 KPI Top Cards */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                    gap: "1.25rem",
                                    marginBottom: "2.5rem",
                                }}
                            >
                                {[
                                    { label: "Total Alumni Terdata", value: `${stats.total}`, icon: "👥", color: "#2563eb", sub: "100% respons terverifikasi" },
                                    { label: "Memiliki Profil LinkedIn", value: `${stats.withLinkedin}`, icon: "💼", color: "#0a66c2", sub: `${((stats.withLinkedin / stats.total) * 100).toFixed(1)}% koneksi profesional` },
                                    { label: "Sektor BUMN & Swasta", value: `${(stats.byJenis.find(([j]) => j.includes("BUMN"))?.[1] || 0) + (stats.byJenis.find(([j]) => j === "Swasta Nasional")?.[1] || 0) + (stats.byJenis.find(([j]) => j === "Swasta Asing")?.[1] || 0)}`, icon: "🏢", color: "#059669", sub: "Mayoritas serapan industri" },
                                    { label: "Sebaran Wilayah", value: `${stats.totalProvinsi} Provinsi`, icon: "📍", color: "#d97706", sub: "Seluruh pelosok Indonesia" },
                                ].map((card, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: "#fff",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: "16px",
                                            padding: "1.4rem",
                                            boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div style={{ fontSize: "1.8rem" }}>{card.icon}</div>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: card.color, background: `${card.color}15`, padding: "0.2rem 0.6rem", borderRadius: "999px" }}>
                                                Stat
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a", marginTop: "0.75rem" }}>
                                            {card.value}
                                        </div>
                                        <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#475569", marginTop: "0.2rem" }}>
                                            {card.label}
                                        </div>
                                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                                            {card.sub}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Section 1: Jenis Pekerjaan Alumni (Matching User's Donut/Distribution) */}
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
                                    marginBottom: "2rem",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                            Distribusi Jenis Pekerjaan Alumni
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                                            Perbandingan persentase sektor pekerjaan berdasarkan survei database alumni
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                                        Total: {stats.total} Responden
                                    </span>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    {stats.byJenis.map(([jenis, count]) => {
                                        const pct = ((count / stats.total) * 100).toFixed(1);
                                        const color = getJenisColor(jenis);
                                        return (
                                            <div key={jenis} style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                                                <div
                                                    style={{
                                                        width: "240px",
                                                        fontSize: "0.84rem",
                                                        fontWeight: 600,
                                                        color: "#334155",
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.5rem",
                                                    }}
                                                >
                                                    <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: color, display: "inline-block", flexShrink: 0 }} />
                                                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jenis}</span>
                                                </div>

                                                <div style={{ flex: 1, minWidth: "150px", background: "#f1f5f9", borderRadius: "999px", height: "24px", overflow: "hidden", position: "relative" }}>
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

                                                <div style={{ width: "95px", textAlign: "right", fontSize: "0.86rem", fontWeight: 700, color: "#0f172a", flexShrink: 0 }}>
                                                    {count} <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.78rem" }}>({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 2: Bar Chart Distribusi per Angkatan (1994 s.d. 2022) */}
                            <div
                                style={{
                                    background: "#fff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    boxShadow: "0 2px 12px rgba(15,23,42,0.04)",
                                    marginBottom: "2rem",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                    <div>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                            Alumni yang Telah Terdata per Angkatan
                                        </h3>
                                        <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                                            Frekuensi responden alumni mulai dari angkatan awal hingga angkatan terbaru
                                        </p>
                                    </div>
                                    <span style={{ fontSize: "0.78rem", color: "#7c3aed", fontWeight: 700 }}>
                                        Puncak: Angkatan 2008 & 2009
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: "8px",
                                        height: "220px",
                                        overflowX: "auto",
                                        paddingBottom: "2.5rem",
                                        paddingTop: "1.5rem",
                                    }}
                                >
                                    {stats.byAngkatan.map(([angkatan, count]) => {
                                        const heightPx = Math.max((count / stats.maxAngkatanCount) * 150, 6);
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
                                                <span style={{ fontSize: "0.68rem", color: isPeak ? "#7c3aed" : "#94a3b8", fontWeight: 700 }}>
                                                    {count}
                                                </span>
                                                <div
                                                    style={{
                                                        width: "22px",
                                                        height: `${heightPx}px`,
                                                        background: isPeak ? "linear-gradient(180deg, #7c3aed, #4f46e5)" : "#93c5fd",
                                                        borderRadius: "4px 4px 0 0",
                                                        transition: "height 0.5s ease",
                                                        cursor: "pointer",
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        fontSize: "0.65rem",
                                                        color: "#64748b",
                                                        fontWeight: 600,
                                                        transform: "rotate(-45deg)",
                                                        whiteSpace: "nowrap",
                                                        marginTop: "6px",
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
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
                                {/* Top Provinsi */}
                                <div
                                    style={{
                                        background: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "16px",
                                        padding: "1.75rem",
                                        boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
                                    }}
                                >
                                    <h3 style={{ margin: "0 0 1.25rem", fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                                        Top 10 Provinsi Domisili Kerja
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {stats.byProvinsi.map(([prov, count], i) => (
                                            <div key={prov} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
                                                <div style={{ flex: 1, fontSize: "0.85rem", color: "#334155", fontWeight: 600 }}>
                                                    {prov}
                                                </div>
                                                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                                    {count}{" "}
                                                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400 }}>
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
                                        padding: "1.75rem",
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
                                        <p style={{ margin: "0 0 1.5rem", fontSize: "0.82rem", color: "#64748b" }}>
                                            Tingkat keterhubungan alumni di platform jaringan karir profesional LinkedIn.
                                        </p>

                                        <div style={{ marginBottom: "1.25rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0a66c2" }}>
                                                    Terdaftar LinkedIn ({stats.withLinkedin})
                                                </span>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0a66c2" }}>
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
                                                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                                                    Belum Menyertakan ({stats.total - stats.withLinkedin})
                                                </span>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#64748b" }}>
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
                                            padding: "1rem",
                                            background: "#f0fdf4",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#166534", marginBottom: "0.2rem" }}>
                                            💡 Jaga Keterhubungan
                                        </div>
                                        <div style={{ fontSize: "0.78rem", color: "#15803d", lineHeight: 1.5 }}>
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
                        <div style={{ padding: "1.75rem" }}>
                            {selected.level && (
                                <span
                                    style={{
                                        display: "inline-block",
                                        padding: "0.22rem 0.75rem",
                                        borderRadius: "999px",
                                        fontSize: "0.74rem",
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
                            <h2 style={{ margin: "0 0 0.25rem", fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                                {selected.nama}
                            </h2>
                            <p style={{ margin: "0 0 0.15rem", color: "#7c3aed", fontWeight: 700, fontSize: "0.95rem" }}>
                                {selected.jabatan}
                            </p>
                            <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: "0.88rem" }}>
                                {selected.tempat_kerja}
                                {selected.kota ? ` · ${selected.kota}` : ""}
                            </p>
                            {selected.angkatan && (
                                <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
                                    🎓 Angkatan {selected.angkatan}
                                </div>
                            )}
                            {selected.deskripsi && (
                                <p style={{ fontSize: "0.88rem", color: "#475569", lineHeight: 1.6, marginTop: "0.5rem" }}>
                                    {selected.deskripsi}
                                </p>
                            )}
                            <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.5rem" }}>
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
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "0.9rem 1.25rem",
                transition: "box-shadow 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.06)";
                e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.borderColor = "#e2e8f0";
            }}
        >
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

            {/* Nama & Posisi */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {alumni.nama_lengkap}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.1rem" }}>
                    {alumni.jabatan && <span style={{ color: "#334155", fontWeight: 600 }}>{alumni.jabatan}</span>}
                    {alumni.jabatan && alumni.nama_perusahaan && <span style={{ color: "#cbd5e1" }}> · </span>}
                    {alumni.nama_perusahaan && <span>{alumni.nama_perusahaan}</span>}
                    {alumni.kota && <span style={{ color: "#94a3b8" }}> ({alumni.kota})</span>}
                </div>
            </div>

            {/* Tags & Action */}
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, alignItems: "center" }}>
                {alumni.angkatan && (
                    <span
                        style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#64748b",
                            background: "#f8faff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "999px",
                            padding: "0.18rem 0.6rem",
                        }}
                    >
                        {alumni.angkatan}
                    </span>
                )}

                {alumni.jenis_pekerjaan && (
                    <span
                        style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: jenisColor,
                            background: `${jenisColor}15`,
                            border: `1px solid ${jenisColor}35`,
                            borderRadius: "999px",
                            padding: "0.18rem 0.65rem",
                            maxWidth: "140px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                        title={alumni.jenis_pekerjaan}
                    >
                        {alumni.jenis_pekerjaan}
                    </span>
                )}

                {hasLinkedIn && (
                    <a
                        href={alumni.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "rgba(10,102,194,0.1)",
                            border: "1px solid rgba(10,102,194,0.3)",
                            color: "#0a66c2",
                            flexShrink: 0,
                            textDecoration: "none",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            transition: "all 0.15s",
                        }}
                        title="Buka LinkedIn"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0a66c2";
                            e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(10,102,194,0.1)";
                            e.currentTarget.style.color = "#0a66c2";
                        }}
                    >
                        in
                    </a>
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