"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TalentList() {
    const [talents, setTalents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [searchNama, setSearchNama] = useState("");
    const [searchBidang, setSearchBidang] = useState("");

    useEffect(() => {
        fetchTalents();
    }, []);

    async function fetchTalents() {
        setLoading(true);
        const { data, error } = await supabase
            .from("talent_pool")
            .select("*")
            .order("created_at", { ascending: false });
        if (!error) setTalents(data);
        setLoading(false);
    }

    const filtered = talents.filter((t) => {
        const matchNama = t.nama.toLowerCase().includes(searchNama.toLowerCase());
        const matchBidang = searchBidang === "" || t.bidang_minat === searchBidang;
        return matchNama && matchBidang;
    });

    if (loading) return <p style={{ padding: "1rem" }}>Memuat data talent...</p>;

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                }}
            >
                <input
                    type="text"
                    placeholder="Cari nama..."
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    style={{ ...filterInput, flex: "1 1 200px" }}
                />

                <select
                    value={searchBidang}
                    onChange={(e) => setSearchBidang(e.target.value)}
                    style={{ ...filterInput, flex: "1 1 240px" }}
                >
                    <option value="">Semua bidang minat</option>
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

            <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1rem" }}>
                Menampilkan {filtered.length} dari {talents.length} talent
            </p>

            {filtered.length === 0 ? (
                <p style={{ color: "#666" }}>Tidak ada talent yang cocok dengan pencarian.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {filtered.map((t) => (
                        <TalentRow key={t.id} talent={t} onSelect={() => setSelected(t)} />
                    ))}
                </div>
            )}

            {selected && <TalentModal talent={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

function TalentRow({ talent, onSelect }) {
    const desc = talent.deskripsi_diri || "";
    const shortDesc = desc.length > 220 ? desc.slice(0, 220).trim() + "..." : desc;

    return (
        <div
            style={{
                display: "flex",
                gap: "1.5rem",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "1.25rem",
                backgroundColor: "#fff",
                flexWrap: "wrap",
            }}
        >
            <div
                style={{
                    width: "160px",
                    height: "160px",
                    flexShrink: 0,
                    borderRadius: "4px",
                    overflow: "hidden",
                    backgroundColor: "#e5e7eb",
                }}
            >
                {talent.foto_url ? (
                    <img
                        src={talent.foto_url}
                        alt={talent.nama}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            fontSize: "0.8rem",
                        }}
                    >
                        Tidak ada foto
                    </div>
                )}
            </div>

            <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#12233f" }}>{talent.nama}</div>
                {talent.bidang_minat && (
                    <div style={{ fontSize: "0.9rem", color: "#e8823c", fontWeight: 600, marginTop: "0.15rem" }}>
                        {talent.bidang_minat}
                    </div>
                )}
                {shortDesc && (
                    <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.6, marginTop: "0.6rem", flex: 1 }}>
                        {shortDesc}
                    </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem" }}>
                    <button
                        onClick={onSelect}
                        style={{
                            border: "1px solid #12233f",
                            backgroundColor: "transparent",
                            color: "#12233f",
                            padding: "0.5rem 1.1rem",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Selengkapnya →
                    </button>

                    {talent.linkedin_url && <SocialIcon url={talent.linkedin_url} label="in" title="LinkedIn" />}
                    {talent.instagram_url && <SocialIcon url={talent.instagram_url} label="ig" title="Instagram" />}
                </div>
            </div>
        </div>
    );
}

function SocialIcon({ url, label, title }) {
    return (
        <a href={url} target="_blank" rel="noreferrer" onClick={stopClick} style={socialIconStyle} title={title}>
            {label}
        </a>
    );
}

function stopClick(e) {
    e.stopPropagation();
}

function TalentModal({ talent, onClose }) {
    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                zIndex: 1000,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "white",
                    borderRadius: "8px",
                    padding: "2rem",
                    maxWidth: "500px",
                    width: "100%",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    position: "relative",
                }}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        border: "none",
                        background: "none",
                        fontSize: "1.3rem",
                        cursor: "pointer",
                    }}
                >
                    ✕
                </button>

                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <img
                        src={talent.foto_url || "https://via.placeholder.com/120?text=No+Photo"}
                        alt={talent.nama}
                        style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", marginBottom: "0.75rem" }}
                    />
                    <h2 style={{ margin: 0 }}>{talent.nama}</h2>
                    <p style={{ color: "#e8823c", fontWeight: "bold", margin: "0.25rem 0" }}>{talent.bidang_minat || "-"}</p>
                </div>

                <DetailItem label="Email" value={talent.email} />
                <DetailItem label="No HP" value={talent.no_hp} />
                <DetailItem label="Tentang" value={talent.deskripsi_diri} />
                <DetailItem label="Final Project" value={talent.final_project} />
                <DetailItem label="Pengalaman" value={talent.experience} />

                {talent.linkedin_url && <DetailItem label="LinkedIn" value={<LinkText url={talent.linkedin_url} />} />}
                {talent.instagram_url && <DetailItem label="Instagram" value={<LinkText url={talent.instagram_url} />} />}
                {talent.cv_url && <CvButton url={talent.cv_url} />}
            </div>
        </div>
    );
}

function LinkText({ url }) {
    return (
        <a href={url} target="_blank" rel="noreferrer">
            {url}
        </a>
    );
}

function CvButton({ url }) {
    return (
        <a href={url} target="_blank" rel="noreferrer" style={cvButtonStyle}>
            Download CV
        </a>
    );
}

const cvButtonStyle = {
    display: "block",
    textAlign: "center",
    backgroundColor: "#12233f",
    color: "white",
    padding: "0.7rem",
    borderRadius: "6px",
    marginTop: "1rem",
    textDecoration: "none",
    fontWeight: "bold",
};

function DetailItem({ label, value }) {
    if (!value) return null;
    return (
        <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", color: "#888", fontWeight: "bold", textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: "0.95rem", color: "#222" }}>{value}</div>
        </div>
    );
}

const filterInput = {
    padding: "0.6rem 0.8rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "0.9rem",
};

const socialIconStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    backgroundColor: "#12233f",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 700,
    textDecoration: "none",
    textTransform: "lowercase",
};