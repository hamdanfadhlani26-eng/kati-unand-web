"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu saat resize ke desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth > 768) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navBg = scrolled || menuOpen ? "rgba(250,251,255,0.97)" : "transparent";
  const borderCol = scrolled || menuOpen ? "rgba(15,23,42,0.06)" : "transparent";
  const shadow = scrolled || menuOpen ? "0 2px 12px rgba(15,23,42,0.06)" : "none";

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          backgroundColor: navBg,
          backdropFilter: scrolled || menuOpen ? "blur(10px)" : "none",
          borderBottom: `1px solid ${borderCol}`,
          boxShadow: shadow,
          transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        {/* Top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          height: "64px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          {/* Brand */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
            <img src="/logo-alumnova.png" alt="Logo Alumnova" style={{ height: "36px", objectFit: "contain" }} />
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0f172a", letterSpacing: "0.05em" }}>
              ALUMNOVA
            </span>
          </a>

          {/* Desktop links */}
          <div style={{
            display: "flex",
            gap: "2rem",
            alignItems: "center",
          }} className="navbar-desktop-links">
            {["Beranda:/", "Tentang:/about", "Services:/services", "Talent Pool:/talent-pool", "Job Post:/job-post"].map((item) => {
              const [label, href] = item.split(":");
              return (
                <a key={href} href={href} style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  textDecoration: "none",
                  opacity: 0.8,
                }}>
                  {label}
                </a>
              );
            })}
          </div>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.4rem",
              color: "#0f172a",
            }}
            className="navbar-hamburger"
          >
            {menuOpen ? (
              // X icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              // Hamburger icon
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            borderTop: "1px solid rgba(15,23,42,0.06)",
            padding: "1rem 1.5rem 1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0",
          }} className="navbar-mobile-menu">
            {[
              { label: "Beranda", href: "/" },
              { label: "Tentang", href: "/about" },
              { label: "Services", href: "/services" },
              { label: "Talent Pool", href: "/talent-pool" },
              { label: "Job Post", href: "/job-post" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  textDecoration: "none",
                  padding: "0.85rem 0",
                  borderBottom: "1px solid rgba(15,23,42,0.06)",
                  display: "block",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* CSS untuk show/hide desktop vs mobile */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .navbar-desktop-links {
            display: none !important;
          }
          .navbar-hamburger {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .navbar-mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
