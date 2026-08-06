"use client";

const WA_NUMBER = "6281261739191";

function waLink(msg) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <div className="hero">
        <div className="hero-breadcrumb">Alumnova</div>
        <h1 className="hero-title">
          Jasa Digital, Dikerjakan
          <br />
          Talenta Terpercaya
        </h1>
        <p className="hero-subtitle">
          Website, dashboard, konten, hingga undangan digital — dikerjakan oleh talenta
          Teknik Industri Universitas Andalas.
        </p>
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/services" style={ctaPrimary}>
            Lihat Semua Layanan
          </a>
          <a href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")} target="_blank" rel="noreferrer" style={ctaSecondary}>
            Konsultasi Gratis
          </a>
        </div>
      </div>

      <div style={{ padding: "3.5rem 2rem", maxWidth: "1000px", margin: "0 auto" }}>
        {/* KENAPA ALUMNOVA */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div className="eyebrow">Kenapa Kami</div>
          <h2 style={sectionTitle}>Kenapa Pilih Alumnova?</h2>

          <div
            className="value-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <ValueCard
              icon="🎓"
              title="Dikerjakan Ahlinya"
              desc="Bukan sekadar freelancer acak — dikerjakan lulusan & mahasiswa Teknik Industri yang paham proses bisnis, bukan cuma teknis."
            />
            <ValueCard
              icon="💬"
              title="Komunikasi Langsung"
              desc="Konsultasi dan revisi langsung via WhatsApp, cepat direspon, tanpa birokrasi rumit."
            />
            <ValueCard
              icon="💰"
              title="Harga Terjangkau"
              desc="Cocok untuk UMKM & personal — kualitas tetap dijaga tanpa harga agency besar."
            />
            <ValueCard
              icon="⚡"
              title="Bukti Nyata"
              desc="Website ini sendiri, dari perencanaan sampai deploy, adalah hasil kerja tim kami."
            />
          </div>
        </section>

        {/* LAYANAN UNGGULAN */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div className="eyebrow">Layanan</div>
          <h2 style={sectionTitle}>Layanan Unggulan</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginTop: "1.5rem",
            }}
          >
            <ServicePreviewCard title="Website & Web App" desc="Company profile, landing page, hingga sistem custom." price="Mulai Rp400.000" />
            <ServicePreviewCard title="Undangan Digital" desc="Pernikahan, ulang tahun, dengan RSVP online." price="Mulai Rp150.000" />
            <ServicePreviewCard title="Video & Konten" desc="Video editing, copywriting, konten AI-generated." price="Mulai Rp75.000" />
          </div>

          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <a href="/services" style={ctaPrimary}>
              Lihat Semua Layanan →
            </a>
          </div>
        </section>

        {/* CARA KERJA */}
        <section style={{ marginBottom: "3.5rem" }}>
          <div className="eyebrow">Proses</div>
          <h2 style={sectionTitle}>Cara Kerja</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1.25rem",
              marginTop: "1.5rem",
            }}
          >
            <StepCard number="1" title="Konsultasi" desc="Chat via WhatsApp, ceritakan kebutuhanmu." />
            <StepCard number="2" title="Penawaran" desc="Dapat estimasi harga & waktu pengerjaan." />
            <StepCard number="3" title="Pengerjaan" desc="Tim kami kerjakan sesuai kesepakatan." />
            <StepCard number="4" title="Selesai" desc="Revisi bila perlu, lalu hasil akhir diserahkan." />
          </div>
        </section>

        {/* CTA PENUTUP */}
        <section
          style={{
            backgroundColor: "#12233f",
            borderRadius: "10px",
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#fff", margin: "0 0 0.5rem", fontSize: "1.4rem" }}>
            Siap mulai proyekmu?
          </h2>
          <p style={{ color: "#cbd5e1", margin: "0 0 1.25rem" }}>
            Konsultasi kebutuhanmu, gratis tanpa komitmen.
          </p>
          <a
            href={waLink("Halo, saya ingin konsultasi kebutuhan jasa digital.")}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "#25D366",
              color: "#fff",
              padding: "0.75rem 1.75rem",
              borderRadius: "999px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Chat via WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc }) {
  return (
    <div className="tech-card" style={{ padding: "1.25rem" }}>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontWeight: 700, color: "#12233f", marginBottom: "0.35rem" }}>{title}</div>
      <div style={{ fontSize: "0.87rem", color: "#555", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

function ServicePreviewCard({ title, desc, price }) {
  return (
    <div className="tech-card" style={{ padding: "1.25rem" }}>
      <div style={{ fontWeight: 700, color: "#12233f", marginBottom: "0.35rem" }}>{title}</div>
      <div style={{ fontSize: "0.87rem", color: "#555", lineHeight: 1.6, marginBottom: "0.75rem" }}>{desc}</div>
      <div style={{ fontSize: "0.8rem", color: "#e8823c", fontWeight: 700 }}>{price}</div>
    </div>
  );
}

function StepCard({ number, title, desc }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "#e8823c",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          margin: "0 auto 0.6rem",
        }}
      >
        {number}
      </div>
      <div style={{ fontWeight: 700, color: "#12233f", fontSize: "0.92rem" }}>{title}</div>
      <div style={{ fontSize: "0.82rem", color: "#666", marginTop: "0.25rem" }}>{desc}</div>
    </div>
  );
}

const sectionTitle = {
  fontSize: "1.5rem",
  fontWeight: "bold",
  marginTop: "0.4rem",
  marginBottom: "1rem",
  color: "#12233f",
};

const ctaPrimary = {
  display: "inline-block",
  backgroundColor: "#e8823c",
  color: "#fff",
  padding: "0.7rem 1.5rem",
  borderRadius: "999px",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.9rem",
};

const ctaSecondary = {
  display: "inline-block",
  backgroundColor: "transparent",
  color: "#12233f",
  border: "2px solid #12233f",
  padding: "0.65rem 1.5rem",
  borderRadius: "999px",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: "0.9rem",
};