import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const GATE_EMAIL_KEY = "kati_gate_email";
const GATE_TS_KEY = "kati_gate_ts";
const GATE_GFORM_KEY = "kati_gate_gform_verified";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function useEmailGate(page) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        try {
            const savedEmail = localStorage.getItem(GATE_EMAIL_KEY);
            const savedTs = localStorage.getItem(GATE_TS_KEY);
            const gformVerified = localStorage.getItem(GATE_GFORM_KEY);

            if (savedEmail && savedTs && gformVerified === "true") {
                const age = Date.now() - parseInt(savedTs, 10);
                if (age < THIRTY_DAYS_MS) {
                    setIsUnlocked(true);
                } else {
                    // expired — reset
                    localStorage.removeItem(GATE_EMAIL_KEY);
                    localStorage.removeItem(GATE_TS_KEY);
                    localStorage.removeItem(GATE_GFORM_KEY);
                }
            }
        } catch (_) {}
        setChecking(false);
    }, []);

    async function submitEmail(email) {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Simpan ke Supabase log bahwa gform & akses halaman tercatat
        try {
            await supabase.from("email_gate_log").insert([
                { email: cleanEmail, page: page || "general" },
                { email: cleanEmail, page: "gform_completed" }
            ]);
        } catch (_) {}

        // 2. Simpan ke localStorage agar kunjungan berikutnya otomatis terbuka
        try {
            localStorage.setItem(GATE_EMAIL_KEY, cleanEmail);
            localStorage.setItem(GATE_GFORM_KEY, "true");
            localStorage.setItem(GATE_TS_KEY, Date.now().toString());
        } catch (_) {}

        setIsUnlocked(true);
    }

    return { isUnlocked, checking, submitEmail };
}
