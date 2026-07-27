"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

async function getCroppedBlob(imageSrc, cropPixels) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });

    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        cropPixels.width,
        cropPixels.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
}

export default function PhotoCropper({ imageSrc, onCancel, onCropDone }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [saving, setSaving] = useState(false);

    const onCropComplete = useCallback((_, areaPixels) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    async function handleSave() {
        if (!croppedAreaPixels) return;
        setSaving(true);
        const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
        setSaving(false);
        onCropDone(blob);
    }

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.65)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "1rem",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    padding: "1.25rem",
                    width: "100%",
                    maxWidth: "420px",
                }}
            >
                <h3 style={{ margin: "0 0 0.75rem", color: "#12233f" }}>Atur Posisi Foto</h3>

                <div style={{ position: "relative", width: "100%", height: "300px", backgroundColor: "#111" }}>
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                    />
                </div>

                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    style={{ width: "100%", marginTop: "1rem" }}
                />

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 1,
                            padding: "0.6rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#12233f",
                            color: "#fff",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        {saving ? "Memproses..." : "Gunakan Foto"}
                    </button>
                </div>
            </div>
        </div>
    );
}