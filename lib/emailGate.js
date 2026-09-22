import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const GATE_EMAIL_KEY = "kati_gate_email";
const GATE_TS_KEY = "kati_gate_ts";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function useEmailGate(page) {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        try {
            const savedEmail = localStorage.getItem(GATE_EMAIL_KEY);
            const savedTs = localStorage.getItem(GATE_TS_KEY);
            if (savedEmail && savedTs) {
                const age = Date.now() - parseInt(savedTs, 10);
                if (age < SEVEN_DAYS_MS) {
                    setIsUnlocked(true);
                } else {
                    // expired — hapus
                    localStorage.removeItem(GATE_EMAIL_KEY);
                    localStorage.removeItem(GATE_TS_KEY);
                }
            }
        } catch (_) {}
        setChecking(false);
    }, []);

    async function submitEmail(email) {
        // Simpan ke Supabase
        try {
            await supabase.from("email_gate_log").insert([{ email: email.trim().toLowerCase(), page }]);
        } catch (_) {}

        // Simpan ke localStorage
        try {
            localStorage.setItem(GATE_EMAIL_KEY, email.trim().toLowerCase());
            localStorage.setItem(GATE_TS_KEY, Date.now().toString());
        } catch (_) {}

        setIsUnlocked(true);
    }

    return { isUnlocked, checking, submitEmail };
}
