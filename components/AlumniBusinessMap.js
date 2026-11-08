"use client";

import { useEffect, useRef, useState } from "react";
import placesData from "@/data/katua_network_places.json";

// Category metadata
const CATEGORY_META = {
  "Kuliner & F&B": { emoji: "☕", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)" },
  "Teknologi & Digital": { emoji: "💻", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.3)" },
  "Kesehatan & Lifestyle": { emoji: "💈", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.3)" },
  "Retail & Fashion": { emoji: "🛍️", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", border: "rgba(236, 72, 153, 0.3)" },
  "Agribisnis & Pertanian": { emoji: "🌿", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)" },
  "Jasa, Logistik & Konstruksi": { emoji: "🚚", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)" },
  "Jasa & Usaha Lainnya": { emoji: "🏢", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", border: "rgba(99, 102, 241, 0.3)" },
};

const REGIONS = [
  "Semua",
  "Sumatera Barat",
  "Riau",
  "Jabodetabek & Banten",
  "Sumatera Utara",
  "Lainnya",
];

const ORIGINAL_MAPS_URL =
  "https://www.google.com/maps/@4.61834,98.1014176,7.5z/data=!4m3!11m2!2sv-_GUkd0TlqRUf7ECnhJHw!3e3?entry=ttu";

export default function AlumniBusinessMap() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markerMapRef = useRef({});

  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Semua");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activePlace, setActivePlace] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Filtered places
  const filteredPlaces = placesData.filter((item) => {
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.address.toLowerCase().includes(search.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(search.toLowerCase()));

    const matchRegion =
      selectedRegion === "Semua" || item.region === selectedRegion;

    const matchCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;

    return matchSearch && matchRegion && matchCategory;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let map = null;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Center around Sumatra / West Sumatra
      map = L.map(mapContainerRef.current, {
        center: [-0.5, 101.5],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CartoDB Voyager tiles (crisp & modern light/dark contrast)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Layer group for markers
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
      setIsMapReady(true);

      // Invalidate size after layout settles
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 300);
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update Markers when filter changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !markersLayerRef.current) return;

    import("leaflet").then((L) => {
      const markersLayer = markersLayerRef.current;
      markersLayer.clearLayers();
      markerMapRef.current = {};

      const validCoordsPlaces = filteredPlaces.filter((p) => p.coords && p.coords.lat && p.coords.lng);

      validCoordsPlaces.forEach((place) => {
        const meta = CATEGORY_META[place.category] || CATEGORY_META["Jasa & Usaha Lainnya"];

        const customIcon = L.divIcon({
          className: "katua-custom-marker",
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: ${meta.color};
              border: 2px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 0 8px ${meta.color}99;
              cursor: pointer;
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            ">
              <span style="transform: rotate(45deg); font-size: 13px; line-height: 1;">${meta.emoji}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -30],
        });

        const popupHtml = `
          <div style="font-family: inherit; min-width: 230px; max-width: 280px; padding: 4px 2px; color: #0f172a;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 15px;">${meta.emoji}</span>
              <span style="background: ${meta.bg}; color: ${meta.color}; border: 1px solid ${meta.border}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
                ${place.category}
              </span>
              <span style="background: rgba(15, 23, 42, 0.06); color: #475569; font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 999px; margin-left: auto;">
                ${place.region}
              </span>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; line-height: 1.3; margin: 0 0 6px 0; color: #0f172a;">
              ${place.name}
            </h3>

            <p style="font-size: 12px; color: #475569; margin: 0 0 10px 0; line-height: 1.4;">
              📍 ${place.address}
            </p>

            ${place.note ? `<p style="font-size: 11px; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 6px; margin: 0 0 8px 0;">💡 ${place.note}</p>` : ""}

            <div style="display: flex; gap: 6px; padding-top: 6px; border-top: 1px solid #f1f5f9;">
              <a href="${place.gmapsUrl}" target="_blank" rel="noreferrer" style="
                flex: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                background: #2563eb;
                color: #ffffff;
                font-size: 12px;
                font-weight: 700;
                padding: 6px 12px;
                border-radius: 8px;
                text-decoration: none;
                transition: background 0.15s ease;
              ">
                🧭 Rute Google Maps ↗
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([place.coords.lat, place.coords.lng], { icon: customIcon })
          .bindPopup(popupHtml)
          .addTo(markersLayer);

        marker.on("click", () => {
          setActivePlace(place);
        });

        markerMapRef.current[place.id] = marker;
      });

      // Fit bounds if search or region is filtered
      if (validCoordsPlaces.length > 0 && (search || selectedRegion !== "Semua")) {
        const group = L.featureGroup(Object.values(markerMapRef.current));
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.15));
      }
    });
  }, [isMapReady, search, selectedRegion, selectedCategory, filteredPlaces]);

  // Click on a place card in the list
  function handleSelectPlace(place) {
    setActivePlace(place);
    if (!mapInstanceRef.current || !place.coords) return;

    mapInstanceRef.current.flyTo([place.coords.lat, place.coords.lng], 16, {
      duration: 1.2,
    });

    const marker = markerMapRef.current[place.id];
    if (marker) {
      setTimeout(() => {
        marker.openPopup();
      }, 800);
    }
  }

  // Recenter map
  function handleResetView() {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([-0.5, 101.5], 6);
    setSelectedRegion("Semua");
    setSelectedCategory("Semua");
    setSearch("");
  }

  return (
    <div style={{ marginTop: "1rem", color: "#f8fafc" }}>
      {/* ── TOP CONTROL BAR ── */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "16px",
          padding: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "1.25rem" }}>🗺️</span>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "#f8fafc" }}>
                Peta Jaringan Usaha Alumni (KATUA Network)
              </h2>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
              Menampilkan <strong style={{ color: "#38bdf8" }}>{filteredPlaces.length}</strong> dari{" "}
              {placesData.length} titik usaha alumni Teknik Industri UNAND
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={handleResetView}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#cbd5e1",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              🔄 Reset Tampilan
            </button>

            <a
              href={ORIGINAL_MAPS_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#ffffff",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              }}
            >
              <span>↗</span> Buka di Google Maps
            </a>
          </div>
        </div>

        {/* Search & Region Filter Pills */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Search box */}
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <span
              style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                fontSize: "0.9rem",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Cari nama usaha, lokasi, alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem 1rem 0.6rem 2.6rem",
                background: "rgba(30, 41, 59, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                color: "#f8fafc",
                fontSize: "0.85rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Region Pills */}
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              overflowX: "auto",
              paddingBottom: "2px",
              scrollbarWidth: "none",
            }}
          >
            {REGIONS.map((reg) => {
              const active = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  style={{
                    padding: "0.45rem 0.85rem",
                    borderRadius: "8px",
                    border: active
                      ? "1px solid #3b82f6"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    background: active
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(30, 41, 59, 0.6)",
                    color: active ? "#60a5fa" : "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s ease",
                  }}
                >
                  {reg === "Semua" ? "Semua Wilayah" : reg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            overflowX: "auto",
            marginTop: "0.75rem",
            paddingBottom: "2px",
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={() => setSelectedCategory("Semua")}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "8px",
              border:
                selectedCategory === "Semua"
                  ? "1px solid #3b82f6"
                  : "1px solid rgba(255, 255, 255, 0.06)",
              background:
                selectedCategory === "Semua"
                  ? "rgba(59, 130, 246, 0.18)"
                  : "rgba(255, 255, 255, 0.03)",
              color: selectedCategory === "Semua" ? "#60a5fa" : "#64748b",
              fontSize: "0.74rem",
              fontWeight: selectedCategory === "Semua" ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Semua Kategori
          </button>
          {Object.entries(CATEGORY_META).map(([cat, meta]) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "8px",
                  border: active
                    ? `1px solid ${meta.color}`
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: active ? meta.bg : "rgba(255, 255, 255, 0.03)",
                  color: active ? meta.color : "#64748b",
                  fontSize: "0.74rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span>{meta.emoji}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN MAP & LIST SPLIT SECTION ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Left Side: Scrollable Place Cards List */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "1rem",
            maxHeight: "680px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.5rem 0.75rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#cbd5e1" }}>
              Daftar Usaha ({filteredPlaces.length})
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Klik untuk lihat di peta 📍
            </span>
          </div>

          <div
            style={{
              overflowY: "auto",
              flex: 1,
              marginTop: "0.5rem",
              paddingRight: "0.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {filteredPlaces.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: "#64748b",
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
                Tidak ditemukan lokasi usaha yang sesuai filter.
              </div>
            ) : (
              filteredPlaces.map((place) => {
                const meta = CATEGORY_META[place.category] || CATEGORY_META["Jasa & Usaha Lainnya"];
                const isSelected = activePlace?.id === place.id;

                return (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "12px",
                      background: isSelected
                        ? "rgba(37, 99, 235, 0.15)"
                        : "rgba(30, 41, 59, 0.5)",
                      border: isSelected
                        ? "1px solid rgba(59, 130, 246, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginBottom: "0.35rem",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem" }}>{meta.emoji}</span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: meta.color,
                          background: meta.bg,
                          padding: "1px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {place.category}
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "#94a3b8",
                          background: "rgba(255,255,255,0.05)",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          marginLeft: "auto",
                        }}
                      >
                        {place.region}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: isSelected ? "#60a5fa" : "#f1f5f9",
                        margin: "0 0 0.35rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {place.name}
                    </h4>

                    <p
                      style={{
                        fontSize: "0.78rem",
                        color: "#94a3b8",
                        margin: "0 0 0.5rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      📍 {place.address}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "0.4rem",
                        borderTop: "1px solid rgba(255,255,255,0.04)",
                        fontSize: "0.72rem",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>
                        {place.contributor ? `Oleh: ${place.contributor}` : "KATUA Network"}
                      </span>
                      <a
                        href={place.gmapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          color: "#38bdf8",
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Rute ↗
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Leaflet Interactive Map View */}
        <div
          style={{
            position: "relative",
            minHeight: "680px",
            height: "100%",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Map DOM Element */}
          <div
            ref={mapContainerRef}
            style={{
              width: "100%",
              height: "680px",
              background: "#1e293b",
            }}
          />

          {/* Watermark badge on map */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              zIndex: 1000,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "10px",
              padding: "0.5rem 0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              pointerEvents: "auto",
            }}
          >
            <span style={{ fontSize: "1rem" }}>📍</span>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f8fafc" }}>
                KATUA Network Map
              </div>
              <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                {filteredPlaces.length} titik usaha aktif
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

