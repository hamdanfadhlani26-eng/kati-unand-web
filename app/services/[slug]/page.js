import { getServiceBySlug, SERVICES } from "@/lib/servicesData";
import { notFound } from "next/navigation";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
    return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function generateStaticParams() {
    return SERVICES.map((s) => ({ slug: s.slug }));
}

function IconCheck() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" style={{ flexShrink: 0, marginTop: "3px" }}>
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default async function ServiceDetailPage({ params }) {
    const { slug } = await params;
    const item = getServiceBySlug(slug);
    if (!item) return notFound();

    const msg = `Halo, saya ingin memesan layanan "${item.title}".`;

    return (
        <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
            <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "1.5rem" }}>
                <a href="/" style={{ color: "#888" }}>Beranda</a> / <a href="/services" style={{ color: "#888" }}>Services</a> / {item.title}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                <div>
                    <span
                        style={{
                            backgroundColor: "#eef2ff",
                            color: "#2563eb",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "0.25rem 0.7rem",
                            borderRadius: "999px",
                        }}
                    >
                        {item.category}
                    </span>
                    <h1 style={{ fontSize: "1.7rem", color: "#0f172a", margin: "0.6rem 0 1.25rem" }}>{item.title}</h1>

                    <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden", marginBottom: "1.5rem" }}>
                        <img
                            src={item.image}
                            alt={item.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    </div>

                    <Section title="Deskripsi Layanan">
                        <p style={{ color: "#444", lineHeight: 1.7 }}>{item.deskripsiLengkap}</p>
                    </Section>

                    <Section title="Yang Anda Dapatkan">
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                            {item.yangDidapat.map((line, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                                    <IconCheck />
                                    <span style={{ color: "#444", lineHeight: 1.6 }}>{line}</span>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <Section title="Yang Perlu Anda Siapkan">
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                            {item.yangDisiapkan.map((line, i) => (
                                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                                    <span
                                        style={{
                                            flexShrink: 0,
                                            width: "20px",
                                            height: "20px",
                                            borderRadius: "50%",
                                            backgroundColor: "#eef2ff",
                                            color: "#2563eb",
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {i + 1}
                                    </span>
                                    <span style={{ color: "#444", lineHeight: 1.6 }}>{line}</span>
                                </div>
                            ))}
                        </div>
                    </Section>
                </div>

                <div>
                    <div style={sidebarBox}>
                        <div style={{ fontSize: "0.8rem", color: "#888" }}>Mulai dari</div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: "0.2rem 0 1rem" }}>
                            {item.price}
                        </div>

                        <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
                            Pengerjaan: {item.eta}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.25rem" }}>
                            Revisi: {item.revisi}
                        </div>

                        <a href={waLink(msg)} target="_blank" rel="noreferrer" style={mintaButton}>
                            Minta Layanan
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: "1.75rem" }}>
            <h2 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: "0.75rem" }}>{title}</h2>
            {children}
        </div>
    );
}

const sidebarBox = {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "1.5rem",
    backgroundColor: "#fff",
    position: "sticky",
    top: "1.5rem",
};

const mintaButton = {
    display: "block",
    textAlign: "center",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "0.75rem",
    borderRadius: "8px",
    fontWeight: 700,
    textDecoration: "none",
};