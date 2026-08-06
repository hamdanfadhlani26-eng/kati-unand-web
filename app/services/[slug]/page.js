import { getServiceBySlug, SERVICES } from "@/lib/servicesData";
import { notFound } from "next/navigation";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default function ServiceDetailPage({ params }) {
  const item = getServiceBySlug(params.slug);
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
              backgroundColor: "#e0f2fe",
              color: "#075985",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.7rem",
              borderRadius: "999px",
            }}
          >
            {item.category}
          </span>
          <h1 style={{ fontSize: "1.7rem", color: "#12233f", margin: "0.6rem 0 1.25rem" }}>{item.title}</h1>

          <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#e5e7eb", borderRadius: "10px", overflow: "hidden", marginBottom: "1.5rem" }}>
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
            <ul style={{ paddingLeft: "1.2rem", color: "#444", lineHeight: 1.9 }}>
              {item.yangDidapat.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </Section>

          <Section title="Yang Perlu Anda Siapkan">
            <ol style={{ paddingLeft: "1.2rem", color: "#444", lineHeight: 1.9 }}>
              {item.yangDisiapkan.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </Section>
        </div>

        <div>
          <div style={sidebarBox}>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>Mulai dari</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#12233f", margin: "0.2rem 0 1rem" }}>
              Rp {item.price.replace("Rp", "")}
            </div>

            <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "0.5rem" }}>
              ⏱ Pengerjaan: {item.eta}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.25rem" }}>
              🔄 Revisi: {item.revisi}
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
      <h2 style={{ fontSize: "1.05rem", color: "#12233f", marginBottom: "0.6rem" }}>{title}</h2>
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
  backgroundColor: "#12233f",
  color: "#fff",
  padding: "0.75rem",
  borderRadius: "8px",
  fontWeight: 700,
  textDecoration: "none",
};
