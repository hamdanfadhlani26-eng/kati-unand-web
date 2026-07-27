export const BIDANG_MINAT_OPTIONS = [
    { label: "PPIC", bg: "#e0f2fe", text: "#075985" },
    { label: "Lean / Continuous Improvement", bg: "#dcfce7", text: "#166534" },
    { label: "Supply Chain & Logistics", bg: "#fef9c3", text: "#854d0e" },
    { label: "Quality Assurance / Quality Control", bg: "#fae8ff", text: "#86198f" },
    { label: "Procurement / Purchasing", bg: "#ffe4e6", text: "#9f1239" },
    { label: "Manufacturing / Production Engineering", bg: "#e0e7ff", text: "#3730a3" },
    { label: "Maintenance & Reliability Engineering", bg: "#fee2e2", text: "#991b1b" },
    { label: "Ergonomi & K3", bg: "#d1fae5", text: "#065f46" },
    { label: "Project Management", bg: "#fef3c7", text: "#92400e" },
    { label: "Business Development", bg: "#ede9fe", text: "#5b21b6" },
    { label: "Human Capital / HR", bg: "#fce7f3", text: "#9d174d" },
    { label: "Data Analyst / Business Intelligence", bg: "#cffafe", text: "#155e75" },
    { label: "Lainnya", bg: "#f1f5f9", text: "#334155" },
];

export function getBidangStyle(label) {
    const found = BIDANG_MINAT_OPTIONS.find((b) => b.label === label);
    return found || { bg: "#f1f5f9", text: "#334155" };
}