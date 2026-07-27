"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BIDANG_MINAT_OPTIONS, getBidangStyle } from "@/lib/bidangMinat";
import { WhatsAppIcon, InstagramIcon, LinkedInIcon } from "./SocialIcons";

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
            .order("updated_at", { ascending: false, nullsFirst: false })
            .order("created_at", { ascending: false });
        if (!error) setTalents(data);
        setLoading(false);
    }

    const filtered = talents.filter((t) => {
        const matchNama = t.nama.toLowerCase().includes(searchNama.toLowerCase());
        const bidangList = Array.isArray(t.bidang_minat) ? t.bidang_minat : [];
        const matchBidang = searchBidang === "" || bidangList.includes(searchBidang);
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
                    {BIDANG_MINAT_OPTIONS.map((b) => (
                        <option key={b.label} value={b.label}>
                            {b.label}
                        </option>
                    ))}
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

function BidangTags({ list, size = "normal" }) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const padding = size === "small" ? "0.25rem 0.7rem" : "0.3rem 0.8rem";
    const fontSize = size === "small" ? "0.75rem" : "0.8rem";
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
            {list.map((label) => {
                const style = getBidangStyle(label);
                return (
                    <span
                        key={label}
                        style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            padding,
                            borderRadius: "999px",
                            fontSize,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {label}
                    </span>
                );
            })}
        </div>
    );
}

function ExperienceList({ experience }) {
    const list = Array.isArray(experience) ? experience : [];
    if (list.length === 0) return null;
    return (
        <ul style={{ margin: "0.3rem 0 0", paddingLeft: "1.1rem", color: "#444", fontSize: "0.88rem", lineHeight: 1.6 }}>
            {list.map((exp, i) => (
                <li key={i}>
                    {exp.role}
                    {exp.role && exp.tempat ? " — " : ""}
                    {exp.tempat}
                </li>
            ))}
        </ul>
    );
}

function TalentRow({ talent, onSelect }) {
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
                    width: "120px",
                    height: "120px",
                    flexShrink: 0,
                    borderRadius: "50%",
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
                            textAlign: "center",
                        }}
                    >
                        Tidak ada foto
                    </div>
                )}
            </div>

            <div style={{ flex: 1, minWidth: "220px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 700, fontSize: "1.15rem", color: "#12233f" }}>{talent.nama}</div>

                <div style={{ marginTop: "0.4rem", display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <BidangTags list={talent.bidang_minat} />
                    {talent.angkatan && (
                        <span style={{ fontSize: "0.78rem", color: "#888", fontWeight: 600 }}>
                            Angkatan {talent.angkatan}
                        </span>
                    )}
                </div>

                {talent.experience && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <span style={microLabel}>Pengalaman</span>
                        <ExperienceList experience={talent.experience} />
                    </div>
                )}

                {talent.portfolio && (
                    <div style={{ marginTop: "0.5rem" }}>
                        <span style={microLabel}>Portfolio</span>
                        <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#444" }}>{talent.portfolio}</p>
                    </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.9rem" }}>
                    <button onClick={onSelect} style={detailButtonStyle}>
                        Selengkapnya →
                    </button>

                    {talent.wa_number && (
                        <SocialIconLink href={`https://wa.me/${talent.wa_number}`} title="WhatsApp" color="#25D366">
                            <WhatsAppIcon />
                        </SocialIconLink>
                    )}
                    {talent.linkedin_url && (
                        <SocialIconLink href={talent.linkedin_url} title="LinkedIn" color="#0A66C2">
                            <LinkedInIcon />
                        </SocialIconLink>
                    )}
                    {talent.instagram_url && (
                        <SocialIconLink href={talent.instagram_url} title="Instagram" color="#E1306C">
                            <InstagramIcon />
                        </SocialIconLink>
                    )}
                </div>
            </div>
        </div>
    );
}

function SocialIconLink({ href, title, color, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={title}
            style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                backgroundColor: color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
            }}
        >
            {children}
        </a>
    );
}

function TalentModal({ talent, onClose }) {
    return (
        <div onClick={onClose} style={modalOverlay}>
            <div onClick={(e) => e.stopPropagation()} style={modalBox}>
                <button onClick={onClose} style={closeButton}>
                    ✕
                </button>

                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <img
                        src={talent.foto_url || "https://via.placeholder.com/120?text=No+Photo"}
                        alt={talent.nama}
                        style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", marginBottom: "0.75rem" }}
                    />
                    <h2 style={{ margin: 0 }}>{talent.nama}</h2>
                    {talent.angkatan && (
                        <p style={{ margin: "0.1rem 0 0", fontSize: "0.85rem", color: "#888" }}>Angkatan {talent.angkatan}</p>
                    )}
                    <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
                        <BidangTags list={talent.bidang_minat} size="small" />
                    </div>
                </div>

                <DetailItem label="Tentang" value={talent.deskripsi_diri} />
                <DetailItem label="Final Project" value={talent.final_project} />
                {talent.portfolio && <DetailItem label="Portfolio" value={talent.portfolio} />}
                {Array.isArray(talent.experience) && talent.experience.length > 0 && (
                    <div style={{ marginBottom: "0.75rem" }}>
                        <div style={detailLabelStyle}>Pengalaman</div>
                        <ExperienceList experience={talent.experience} />
                    </div>
                )}

                <DetailItem label="Email" value={talent.email} />
                <DetailItem label="No HP" value={talent.no_hp} />

                <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    {talent.wa_number && (
                        <ContactChip href={`https://wa.me/${talent.wa_number}`} color="#25D366" label="WhatsApp">
                            <WhatsAppIcon />
                        </ContactChip>
                    )}
                    {talent.linkedin_url && (
                        <ContactChip href={talent.linkedin_url} color="#0A66C2" label="LinkedIn">
                            <LinkedInIcon />
                        </ContactChip>
                    )}
                    {talent.instagram_url && (
                        <ContactChip href={talent.instagram_url} color="#E1306C" label="Instagram">
                            <InstagramIcon />
                        </ContactChip>
                    )}
                </div>

                {talent.cv_url && <CvButton url={talent.cv_url} />}
            </div>
        </div>
    );
}

function ContactChip({ href, color, label, children }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: color,
                color: "#fff",
                padding: "0.4rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
            }}
        >
            {children}
            {label}
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

function DetailItem({ label, value }) {
    if (!value) return null;
    return (
        <div style={{ marginBottom: "0.75rem" }}>
            <div style={detailLabelStyle}>{label}</div>
            <div style={{ fontSize: "0.95rem", color: "#222" }}>{value}</div>
        </div>
    );
}

const microLabel = {
    fontSize: "0.7rem",
    color: "#999",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
};

const detailLabelStyle = {
    fontSize: "0.75rem",
    color: "#888",
    fontWeight: "bold",
    textTransform: "uppercase",
};

const detailButtonStyle = {
    border: "1px solid #12233f",
    backgroundColor: "transparent",
    color: "#12233f",
    padding: "0.5rem 1.1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
};

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

const modalOverlay = {
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
};

const modalBox = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "2rem",
    maxWidth: "500px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative",
};

const closeButton = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    border: "none",
    background: "none",
    fontSize: "1.3rem",
    cursor: "pointer",
};

const filterInput = {
    padding: "0.6rem 0.8rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "0.9rem",
};