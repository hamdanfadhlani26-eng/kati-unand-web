"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/services", label: "Services" },
  { href: "/talent-pool", label: "Talent Pool" },
];

export default function AnimatedNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    setActiveLink(window.location.pathname);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        backdropFilter: scrolled ? "blur(18px)" : "blur(10px)",
        boxShadow: scrolled ? "0 2px 20px rgba(18,35,63,0.1)" : "none",
        transition: "box-shadow 0.3s ease, backdrop-filter 0.3s ease",
      }}
    >
      {/* Brand */}
      <motion.a
        href="/"
        className="navbar-brand"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.img
          src="/logo-alumnova.png"
          alt="Logo Alumnova"
          style={{ height: "38px", objectFit: "contain" }}
          initial={{ opacity: 0, rotate: -6 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.span
          className="navbar-mark"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          ALUMNOVA
        </motion.span>
      </motion.a>

      {/* Links */}
      <div className="navbar-links">
        {NAV_LINKS.map(({ href, label }, i) => {
          const isActive = activeLink === href;
          return (
            <motion.a
              key={href}
              href={href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
              style={{
                color: isActive ? "#12233f" : "#555",
                fontWeight: isActive ? 700 : 600,
                position: "relative",
                textDecoration: "none",
                fontSize: "0.92rem",
                padding: "0.2rem 0",
              }}
              whileHover={{ color: "#12233f" }}
            >
              {label}
              {/* Active indicator */}
              {isActive && (
                <motion.span
                  layoutId="navbar-underline"
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: "-2px",
                    height: "2px",
                    width: "100%",
                    background: "#e8823c",
                    borderRadius: "2px",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.a>
          );
        })}

        {/* CTA button */}
        <motion.a
          href="https://wa.me/6281261739191?text=Halo%2C%20saya%20ingin%20konsultasi%20kebutuhan%20jasa%20digital."
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          whileHover={{ scale: 1.05, boxShadow: "0 6px 18px rgba(232,130,60,0.4)" }}
          whileTap={{ scale: 0.97 }}
          style={{
            backgroundColor: "#e8823c",
            color: "#fff",
            padding: "0.45rem 1.1rem",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "0.85rem",
            textDecoration: "none",
            boxShadow: "0 3px 10px rgba(232,130,60,0.3)",
            transition: "box-shadow 0.2s ease",
          }}
        >
          Konsultasi
        </motion.a>
      </div>
    </motion.nav>
  );
}
