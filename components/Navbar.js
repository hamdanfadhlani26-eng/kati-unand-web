"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: scrolled ? "rgba(250,251,255,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(15,23,42,0.06)" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 12px rgba(15,23,42,0.06)" : "none",
        transition: "background-color 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <a href="/" className="navbar-brand">
        <img src="/logo-alumnova.png" alt="Logo Alumnova" style={{ height: "40px", objectFit: "contain" }} />
        <span className="navbar-mark" style={{ color: scrolled ? "#0f172a" : "#0f172a" }}>ALUMNOVA</span>
      </a>
      <div className="navbar-links">
        <a href="/">Beranda</a>
        <a href="/services">Services</a>
        <a href="/talent-pool">Talent Pool</a>
        <a href="/job-post">Job Post</a>
      </div>
    </nav>
  );
}
