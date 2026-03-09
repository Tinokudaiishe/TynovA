import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ─── SUPABASE CLIENT ─────────────────────────────────────── */
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const sb = SUPABASE_URL && SUPABASE_ANON
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

/* Safe wrapper — falls back gracefully when sb is null (local dev without .env) */
const DB = {
  from: (table) => {
    if (!sb) {
      const noop = async () => ({ data: null, error: { message: "no-client" } });
      const chain = { select: ()=>chain, insert: ()=>chain, update: ()=>chain,
                      delete: ()=>chain, eq: noop, single: noop,
                      order: async ()=>({ data: [], error: null }) };
      return chain;
    }
    return sb.from(table);
  },
  channel: (name) => {
    if (!sb) return { on: ()=>({ subscribe: ()=>({}) }) };
    return sb.channel(name);
  },
  removeChannel: (ch) => { if (sb && ch?.unsubscribe) ch.unsubscribe(); },
};

/* ─── DATABASE SCHEMA ─────────────────────────────────────────
   See schema.sql in the project root for the complete Supabase
   SQL schema. Run it in Supabase Dashboard → SQL Editor.
   ─────────────────────────────────────────────────────────── */

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');`;

/* ─── TYNOVA LOGO SVG ───────────────────────────────────────── */
const TynovaLogo = ({ size = 32, light = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="10" fill={light ? "rgba(255,255,255,0.12)" : "#0f172a"} />
    <path d="M8 12h24M20 12v16" stroke={light ? "#fff" : "#3b82f6"} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 20h16M20 28l-8-8 8-8 8 8-8 8z" stroke={light ? "rgba(255,255,255,0.6)" : "#60a5fa"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* TSOA circuit-T icon — inline SVG, no base64, matches uploaded logo */
const TSOAIcon = ({ size = 44 }) => {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* ── Left arm of T (cyan) ─────────────────────────────── */}
      {/* terminal dot far left */}
      <circle cx="8" cy="22" r="4" fill="#22d3ee"/>
      {/* horizontal left arm */}
      <rect x="8" y="19" width="28" height="6" rx="3" fill="#22d3ee"/>
      {/* step-down corner left */}
      <rect x="33" y="19" width="6" height="18" rx="3" fill="#22d3ee"/>
      {/* horizontal connector to center */}
      <rect x="33" y="31" width="18" height="6" rx="3" fill="#22d3ee"/>

      {/* ── Right arm of T (dark navy) ───────────────────────── */}
      {/* horizontal right arm from center */}
      <rect x="49" y="19" width="20" height="6" rx="3" fill="#1e3a5f"/>
      {/* step-down corner right */}
      <rect x="62" y="19" width="6" height="18" rx="3" fill="#1e3a5f"/>
      {/* horizontal connector right */}
      <rect x="62" y="31" width="22" height="6" rx="3" fill="#1e3a5f"/>
      {/* terminal dot far right */}
      <circle cx="88" cy="34" r="4" fill="#1e3a5f"/>

      {/* ── Vertical stem (dark navy) ────────────────────────── */}
      {/* stem down from top crossbar */}
      <rect x="46" y="19" width="8" height="42" rx="3" fill="#1e3a5f"/>
      {/* routing: step left */}
      <rect x="30" y="55" width="24" height="7" rx="3" fill="#1e3a5f"/>
      {/* routing: step down */}
      <rect x="30" y="55" width="7" height="18" rx="3" fill="#1e3a5f"/>
      {/* routing: step right */}
      <rect x="30" y="66" width="24" height="7" rx="3" fill="#1e3a5f"/>
      {/* terminal dot bottom */}
      <circle cx="54" cy="70" r="4" fill="#1e3a5f"/>
    </svg>
  );
};

/* ─── SVG ICONS ─────────────────────────────────────────────── */
const ICONS = {
  dashboard: (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  projects:  (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h3.5L10 7h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>,
  tracker:   (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/></svg>,
  signin:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>,
  reports:   (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  documents: (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  ai:        (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/><circle cx="9" cy="12" r="1" fill={c} stroke="none"/><circle cx="15" cy="12" r="1" fill={c} stroke="none"/></svg>,
  search:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  location:  (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  check:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  logout:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  alert:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  user:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  clock:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  folder:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  wrench:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  lock:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  zap:       (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  target:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  file:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  chevron:   (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  eye:       (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  trash:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  edit:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  refresh:   (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  admin:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  send:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  xmark:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chart:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  upload:    (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  bell:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  menu:      (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  download:  (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>,
  tag:       (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  calendar:  (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  award:     (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  activity:  (s=16,c="currentColor")=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
};

const I = ({n,s=16,c="currentColor"}) => ICONS[n] ? ICONS[n](s,c) : null;

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const USERS = [
  { id:1, username:"james.mutua",    name:"James Mutua",    role:"Senior Packaging Engineer", dept:"Engineering",       password:"Tsoa@1234",  avatar:"JM", projects:[1,2,3] },
  { id:2, username:"sarah.wanjiru",  name:"Sarah Wanjiru",  role:"QA Technician",             dept:"Quality Assurance", password:"Tsoa@2345",  avatar:"SW", projects:[1,3] },
  { id:3, username:"david.ochieng",  name:"David Ochieng",  role:"Electrical Technician",     dept:"Maintenance",       password:"Tsoa@3456",  avatar:"DO", projects:[2,4] },
  { id:4, username:"grace.akinyi",   name:"Grace Akinyi",   role:"Process Engineer",          dept:"Engineering",       password:"Tsoa@4567",  avatar:"GA", projects:[1,4] },
  { id:5, username:"admin",          name:"Admin",          role:"System Administrator",      dept:"Management",        password:"Admin@0000", avatar:"AD", projects:[1,2,3,4] },
];

const INIT_PROJECTS = [
  {
    id:1, title:"Filler Line CIP Optimisation", plant:"Zambian Breweries — Lusaka",
    status:"In Progress", priority:"Critical", progress:68,
    start:"2025-11-01", end:"2026-02-28",
    lead:"James Mutua", assignees:[1,2,4],
    scope:"Full review and optimisation of the filler CIP sequence on Line 3. Covers chemical concentrations, contact times, temperature profiles, rinse validation and microbiological verification. Objective: reduce CIP cycle time by 15% while maintaining compliance with BRC and customer hygiene standards.",
    problemDesc:"Post-CIP microbiological failures occurring at a rate of 3 per month on Line 3 filler. ATP swab readings consistently above 100 RLU on product-contact surfaces.",
    rootCause:"Caustic concentration in pre-rinse stage falling below 1.2% due to a faulty dosing pump proportional valve stem seal degradation.",
    whys:["Microbiological counts exceeded limits after CIP","Biofilm present on filler valve seats after cycle","Pre-rinse caustic concentration insufficient","Dosing pump delivering only 60% of set-point","Proportional valve stem seal degraded"],
    loopClosure:"Valve stem seal replaced on all 3 dosing pumps (24 Oct 2025). New PM task added to quarterly schedule. Zero microbiological failures recorded since corrective action. CAPA closed 12 Nov 2025.",
    actions:[
      {id:1,title:"Dosing pump valve seal replacement",desc:"Replace proportional valve stem seals on all 3 CIP dosing pumps.",status:"Done",owner:"David Ochieng",due:"2025-10-28"},
      {id:2,title:"CIP validation — 5-run micro study",desc:"Run 5 consecutive CIP cycles with microbiological swabbing at 12 sample points.",status:"Done",owner:"Sarah Wanjiru",due:"2025-11-10"},
      {id:3,title:"Update PM schedule",desc:"Add quarterly dosing pump seal inspection and caustic verification to planned maintenance schedule.",status:"Done",owner:"James Mutua",due:"2025-11-15"},
      {id:4,title:"Optimise CIP temperature profile",desc:"Review zone temperatures against manufacturer spec. Trial 75°C hot caustic vs current 70°C.",status:"In Progress",owner:"Grace Akinyi",due:"2026-01-31"},
      {id:5,title:"Reduce total CIP cycle time",desc:"Model revised sequence with updated dwell times. Target 15% reduction.",status:"Pending",owner:"James Mutua",due:"2026-02-28"},
    ]
  },
  {
    id:2, title:"Pasteuriser Zone 3 PU Deviation", plant:"Eswatini Beverages — Matsapha",
    status:"In Progress", priority:"High", progress:45,
    start:"2025-12-01", end:"2026-03-31",
    lead:"David Ochieng", assignees:[3,5],
    scope:"Investigation and correction of PU under-delivery in Zone 3 of the tunnel pasteuriser.",
    problemDesc:"Bottles passing through Zone 3 recording 8–11 PU against a target of 15–20 PU.",
    rootCause:"Scale build-up on Zone 3 hot water spray nozzles reducing heat transfer to bottles.",
    whys:["PU delivery in Zone 3 below minimum specification","Insufficient heat transfer from spray water","Hot water spray nozzles partially blocked","Scale build-up in nozzles from high-hardness water","Water softener resin exhausted"],
    loopClosure:"In progress. Nozzles replaced (Jan 2026). Softener regeneration frequency doubled.",
    actions:[
      {id:1,title:"Nozzle inspection and replacement",desc:"Remove, inspect and replace all 24 Zone 3 nozzles.",status:"Done",owner:"David Ochieng",due:"2026-01-15"},
      {id:2,title:"Water softener service",desc:"Resin bed test and recharge. Adjust regeneration schedule.",status:"Done",owner:"David Ochieng",due:"2026-01-20"},
      {id:3,title:"Add hardness to daily QC",desc:"Update QC morning checks to include water hardness measurement.",status:"In Progress",owner:"Sarah Wanjiru",due:"2026-02-01"},
      {id:4,title:"PU datalogger verification audit",desc:"Run in-bottle datalogger through 3 production runs to confirm PU delivery.",status:"Pending",owner:"Grace Akinyi",due:"2026-02-28"},
    ]
  },
  {
    id:3, title:"EBI False Reject Rate Reduction", plant:"Zambian Breweries — Lusaka",
    status:"Completed", priority:"Medium", progress:100,
    start:"2025-09-01", end:"2025-12-15",
    lead:"James Mutua", assignees:[1,2],
    scope:"Analysis and optimisation of the EBI reject system to reduce false reject rate from 2.8% to below 0.8%.",
    problemDesc:"False reject rate on EBI Line 2 averaging 2.8% over Q3 2025 — above the 0.8% target.",
    rootCause:"Camera 4 sensitivity threshold set incorrectly following firmware update in August 2025.",
    whys:["False reject rate elevated to 2.8%","Camera 4 triggering on non-defective bottles","Camera 4 sensitivity 12% above validated parameter","EBI firmware update reset camera sensitivity to factory default","No post-update validation protocol existed"],
    loopClosure:"Camera 4 sensitivity reset. Post-firmware-update validation checklist created. False reject rate confirmed at 0.6%. CAPA closed 15 Dec 2025.",
    actions:[
      {id:1,title:"Camera 4 sensitivity recalibration",desc:"Reset Camera 4 reject threshold to validated parameter set.",status:"Done",owner:"James Mutua",due:"2025-09-20"},
      {id:2,title:"Create firmware update validation checklist",desc:"Document all camera parameters that must be verified after any firmware update.",status:"Done",owner:"James Mutua",due:"2025-10-01"},
      {id:3,title:"8-week false reject monitoring",desc:"Track daily false reject rate. Report to engineering weekly.",status:"Done",owner:"Sarah Wanjiru",due:"2025-11-30"},
      {id:4,title:"Update EBI operating procedure",desc:"Revise EBI SOP to include post-update validation step.",status:"Done",owner:"Sarah Wanjiru",due:"2025-12-15"},
    ]
  },
  {
    id:4, title:"Labeller Registration & Date Code Improvement", plant:"Eswatini Beverages — Matsapha",
    status:"Planning", priority:"Medium", progress:15,
    start:"2026-01-15", end:"2026-05-30",
    lead:"Grace Akinyi", assignees:[3,4],
    scope:"End-to-end review of labeller performance on Lines 1 & 2.",
    problemDesc:"Customer complaints regarding off-centre labels and illegible date codes on 330ml NRB product.",
    rootCause:"Under investigation. Suspected worn timing belt and ink jet print head partially blocked.",
    whys:["Label registration deviation >±1.2mm on 4% of packs","Under investigation","Under investigation","Under investigation","Under investigation"],
    loopClosure:"Project in planning phase. Full investigation to commence Feb 2026.",
    actions:[
      {id:1,title:"Measure and map current registration performance",desc:"Collect 500-bottle sample from each line. Measure registration deviation.",status:"In Progress",owner:"Grace Akinyi",due:"2026-02-15"},
      {id:2,title:"Inspect timing belts and print heads",desc:"Full mechanical inspection of label transfer timing belts.",status:"Pending",owner:"David Ochieng",due:"2026-02-28"},
    ]
  },
];

const INIT_REPORTS = [
  {id:1,title:"Packaging Operations — Week 8, 2026",date:"2026-02-23",author:"James Mutua",pages:12,tags:["Line 3","CIP","Filler"],summary:"Week 8 production summary covering 3.2M units across Lines 1–3. CIP optimisation project achieved 11% cycle time reduction in trial runs. One unplanned stop on Line 2 pasteuriser (47 min) due to belt tracking.",plant:"Zambian Breweries — Lusaka"},
  {id:2,title:"Packaging Operations — Week 7, 2026",date:"2026-02-16",author:"Sarah Wanjiru",pages:10,tags:["EBI","QA","Line 2"],summary:"QA audit results: all lines within specification. EBI false reject rate sustained at 0.6%. Line 2 pasteuriser nozzle replacement completed — PU recovery observed in Zone 3.",plant:"Zambian Breweries — Lusaka"},
  {id:3,title:"Packaging Operations — Week 6, 2026",date:"2026-02-09",author:"Grace Akinyi",pages:14,tags:["Labeller","Maintenance"],summary:"Labeller improvement project scoping completed. Baseline registration measurements collected on Lines 1 & 2. Preventive maintenance completed on packer and depalletiser.",plant:"Eswatini Beverages — Matsapha"},
  {id:4,title:"Packaging Operations — Week 5, 2026",date:"2026-02-02",author:"David Ochieng",pages:9,tags:["Pasteuriser","Water Treatment"],summary:"Water softener resin replacement completed. Zone 3 nozzle replacement in progress. Hardness monitoring added to daily QC schedule.",plant:"Eswatini Beverages — Matsapha"},
  {id:5,title:"Packaging Operations — Week 4, 2026",date:"2026-01-26",author:"James Mutua",pages:11,tags:["Line 3","CIP","KPI"],summary:"Monthly KPI review: OEE 76.3% vs 78% target. Availability 91%, Performance 88%, Quality 95.2%. CIP project formally opened.",plant:"Zambian Breweries — Lusaka"},
];

const INIT_DOCUMENTS = [
  {id:1,title:"CIP Standard Operating Procedure — Line 3 Filler",cat:"SOP",rev:"Rev 4",date:"2025-11-15",size:"2.4 MB",tags:["CIP","Filler","Line 3"],uploader:"Admin"},
  {id:2,title:"Pasteuriser PU Calculation Guide & Zone Profiles",cat:"Technical",rev:"Rev 2",date:"2025-08-01",size:"1.8 MB",tags:["Pasteuriser","PU","Zone"],uploader:"Admin"},
  {id:3,title:"EBI Camera Calibration & Validation Procedure",cat:"SOP",rev:"Rev 5",date:"2025-12-10",size:"3.1 MB",tags:["EBI","Camera","Validation"],uploader:"Admin"},
  {id:4,title:"Packaging Line GMP Compliance Checklist",cat:"Quality",rev:"Rev 7",date:"2025-10-01",size:"0.9 MB",tags:["GMP","Compliance"],uploader:"Admin"},
  {id:5,title:"Filler Valve Maintenance Manual — Krones KVG",cat:"Maintenance",rev:"OEM",date:"2024-03-01",size:"8.7 MB",tags:["Filler","Krones","Valves"],uploader:"Admin"},
  {id:6,title:"Bottle Washer Chemical Dosing Specification",cat:"Technical",rev:"Rev 3",date:"2025-06-20",size:"1.2 MB",tags:["Washer","Chemical"],uploader:"Admin"},
  {id:7,title:"Labeller Registration Measurement Protocol",cat:"Quality",rev:"Rev 1",date:"2026-01-15",size:"0.7 MB",tags:["Labeller","Registration"],uploader:"Admin"},
  {id:8,title:"Weekly Production Report Template",cat:"Template",rev:"Rev 6",date:"2025-09-01",size:"0.4 MB",tags:["Report","Template"],uploader:"Admin"},
];

const INIT_PROBLEMS = [
  {id:1,date:"2026-02-20",plant:"Zambian Breweries — Lusaka",machine:"Filler",foundBy:"James Mutua",severity:"Critical",status:"Closed",title:"Fill level variance on valve 12",description:"Valve 12 consistently underfilling by 4–6ml across a 2-hour production run.",immediateActions:"Valve 12 isolated and removed from service.",rootCause:"Worn valve seat on valve 12 causing incomplete seal during fill cycle.",solution:"Valve seat replaced with OEM Krones part.",outcome:"Fill level variance eliminated. Zero recurrence in 2-week monitoring period.",loopClosure:"PM task created for 6-monthly valve seat inspection.",createdAt:"2026-02-20T08:30:00Z"},
  {id:2,date:"2026-02-24",plant:"Eswatini Beverages — Matsapha",machine:"Labeller",foundBy:"Grace Akinyi",severity:"Major",status:"Investigating",title:"Date code legibility failure — 330ml NRB",description:"Ink jet date codes on 330ml NRB line failing legibility check at a rate of ~1.1%.",immediateActions:"Print head cleaned and purged.",rootCause:"Under investigation.",solution:"Pending full investigation.",outcome:"Pending.",loopClosure:"Under investigation. Target close date: 15 Mar 2026.",createdAt:"2026-02-24T10:15:00Z"},
  {id:3,date:"2026-03-01",plant:"Zambian Breweries — Lusaka",machine:"Pasteuriser",foundBy:"Sarah Wanjiru",severity:"Major",status:"Resolved",title:"Zone 4 temperature overshoot — 2.8°C",description:"Zone 4 spray water temperature logging 2.8°C above setpoint during Saturday night shift.",immediateActions:"Zone 4 setpoint reduced by 3°C.",rootCause:"PID controller Zone 4 integral gain set too high.",solution:"PID parameters re-tuned.",outcome:"Zone 4 temperature stable.",loopClosure:"PID parameter backup created. Change management procedure updated.",createdAt:"2026-03-01T06:45:00Z"},
];

const STATUS_COLOR = {"In Progress":"#3b82f6","Completed":"#10b981","Planning":"#8b5cf6","On Hold":"#f59e0b"};
const PRIORITY_COLOR = {"Critical":"#ef4444","High":"#f97316","Medium":"#3b82f6","Low":"#10b981"};
const ACTION_STATUS_COLOR = {"Done":"#10b981","In Progress":"#3b82f6","Pending":"#94a3b8"};
const SEV_COLOR = {Critical:"#ef4444",Major:"#f97316",Minor:"#3b82f6",Observation:"#10b981"};
const PSTAT_COLOR = {Open:"#ef4444",Investigating:"#f59e0b",Resolved:"#3b82f6",Closed:"#10b981"};
const PLANTS = ["All Plants","Zambian Breweries — Lusaka","Eswatini Beverages — Matsapha"];
const MACHINES_LIST = ["Filler","Pasteuriser","Bottle Washer","Packer","Unpacker","Depalletiser","Palletiser","Labeller","EBI","CIP","Electrical","Pneumatics","Utilities","Other"];
const PROB_STATUSES = ["Open","Investigating","Resolved","Closed"];
const PROB_SEVERITIES = ["Critical","Major","Minor","Observation"];

/* ─── HELPERS ───────────────────────────────────────────────── */
const formatDate = d => { if(!d) return ""; return new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const today = () => new Date().toISOString().split("T")[0];
const timeNow = () => new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});

function useClock() {
  const [t,setT] = useState(()=>new Date());
  useEffect(()=>{ const id=setInterval(()=>setT(new Date()),1000); return()=>clearInterval(id); },[]);
  return t;
}

function useIsMobile() {
  const [m,setM] = useState(()=>window.innerWidth<768);
  useEffect(()=>{ const fn=()=>setM(window.innerWidth<768); window.addEventListener("resize",fn); return()=>window.removeEventListener("resize",fn); },[]);
  return m;
}

const Badge = ({label,color="#3b82f6",size=10}) => (
  <span style={{display:"inline-flex",alignItems:"center",padding:"2px 8px",borderRadius:4,background:`${color}15`,border:`1px solid ${color}30`,color,fontSize:size,fontWeight:600,whiteSpace:"nowrap",fontFamily:"Inter,sans-serif"}}>
    {label}
  </span>
);

const Avatar = ({initials,size=34,color="#1d4ed8"}) => (
  <div style={{width:size,height:size,borderRadius:8,background:`linear-gradient(135deg,${color},${color}bb)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:700,color:"#fff",fontFamily:"Inter,sans-serif",flexShrink:0,letterSpacing:.5}}>
    {initials}
  </div>
);

const ProgressBar = ({pct,color="#3b82f6",height=4}) => (
  <div style={{height,borderRadius:3,background:"#e2e8f0",overflow:"hidden",width:"100%"}}>
    <div style={{height:"100%",width:`${pct}%`,borderRadius:3,background:color,transition:"width .6s ease"}}/>
  </div>
);

const Card = ({children,style={},hover=false,onClick}) => (
  <div onClick={onClick} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"20px 22px",boxShadow:"0 1px 3px rgba(0,0,0,.06)",transition:hover?"transform .15s,box-shadow .15s":"none",cursor:onClick||hover?"pointer":"default",...style}}
    onMouseEnter={e=>{if(hover||onClick){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.1)";}}}
    onMouseLeave={e=>{if(hover||onClick){e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 1px 3px rgba(0,0,0,.06)";}}}
  >
    {children}
  </div>
);

/* ─── PAGE HEADER (shows TSOA logo) ─────────────────────────── */
const PageHeader = ({title,subtitle,actions}) => (
  <div style={{
    display:"flex",alignItems:"center",justifyContent:"space-between",
    marginBottom:24,flexWrap:"wrap",gap:12,
    background:"#fff",border:"1px solid #e8edf4",borderRadius:12,
    padding:"14px 20px",boxShadow:"0 1px 4px rgba(0,0,0,.05)"
  }}>
    {/* Left — TSOA brand block */}
    <div style={{display:"flex",alignItems:"center",gap:14}}>
      <TSOAIcon size={40} />
      <div>
        <div style={{fontSize:14,fontWeight:800,color:"#0f172a",fontFamily:"Inter,sans-serif",letterSpacing:"0.4px",lineHeight:1.1}}>TSOA TECHNOLOGIES</div>
        <div style={{fontSize:10,fontWeight:600,color:"#3b82f6",fontFamily:"Inter,sans-serif",letterSpacing:"1.8px",textTransform:"uppercase",marginTop:3}}>Management System</div>
      </div>
      {/* Vertical divider */}
      <div style={{width:1,height:34,background:"#e2e8f0",marginLeft:4,flexShrink:0}}/>
    </div>

    {/* Right — page title / greeting */}
    <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
      <div style={{minWidth:0}}>
        <h1 style={{fontSize:18,fontWeight:700,color:"#0f172a",margin:0,lineHeight:1.2,fontFamily:"Inter,sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{title}</h1>
        {subtitle&&<p style={{fontSize:11,color:"#64748b",margin:0,marginTop:2,fontFamily:"Inter,sans-serif"}}>{subtitle}</p>}
      </div>
      {actions&&<div style={{display:"flex",gap:8,alignItems:"center",marginLeft:"auto",flexShrink:0}}>{actions}</div>}
    </div>
  </div>
);

/* ─── SIGNATURE PAD ─────────────────────────────────────────── */
function SigPad({onSave,onClear,label}) {
  const ref=useRef(); const drawing=useRef(false);
  const ctx=()=>ref.current?.getContext("2d");
  const pos=(e,el)=>{ const r=el.getBoundingClientRect(); const src=e.touches?e.touches[0]:e; return{x:src.clientX-r.left,y:src.clientY-r.top}; };
  const start=e=>{ drawing.current=true; const p=pos(e,ref.current); ctx().beginPath(); ctx().moveTo(p.x,p.y); e.preventDefault(); };
  const move=e=>{ if(!drawing.current)return; const p=pos(e,ref.current); const c=ctx(); c.lineWidth=2; c.lineCap="round"; c.strokeStyle="#1d4ed8"; c.lineTo(p.x,p.y); c.stroke(); c.beginPath(); c.moveTo(p.x,p.y); e.preventDefault(); };
  const end=()=>{ drawing.current=false; };
  const clear=()=>{ const c=ref.current; ctx().clearRect(0,0,c.width,c.height); if(onClear)onClear(); };
  useEffect(()=>{
    const el=ref.current; if(!el) return;
    el.addEventListener("mousedown",start); el.addEventListener("mousemove",move); el.addEventListener("mouseup",end); el.addEventListener("mouseleave",end);
    el.addEventListener("touchstart",start,{passive:false}); el.addEventListener("touchmove",move,{passive:false}); el.addEventListener("touchend",end);
    return()=>{ el.removeEventListener("mousedown",start); el.removeEventListener("mousemove",move); el.removeEventListener("mouseup",end); el.removeEventListener("mouseleave",end); el.removeEventListener("touchstart",start); el.removeEventListener("touchmove",move); el.removeEventListener("touchend",end); };
  },[]);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{fontSize:11,color:"#475569",fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>{label||"Signature"}</div>
      <div style={{border:"1px solid #cbd5e1",borderRadius:8,overflow:"hidden",background:"#f8fafc"}}>
        <canvas ref={ref} width={460} height={120} style={{display:"block",cursor:"crosshair",width:"100%"}}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={clear} style={{flex:1,padding:"7px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:7,color:"#475569",fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Clear</button>
        <button onClick={()=>onSave&&onSave(ref.current.toDataURL())} style={{flex:2,padding:"7px",background:"#0f172a",border:"none",borderRadius:7,color:"#fff",fontSize:12,cursor:"pointer",fontWeight:600,fontFamily:"Inter,sans-serif"}}>Confirm Signature</button>
      </div>
    </div>
  );
}

/* ─── SPLASH SCREEN ─────────────────────────────────────────── */
function SplashScreen({user,onDone}) {
  const [phase,setPhase]=useState(0); // 0=fadeIn 1=words 2=fadeOut
  const [wordIdx,setWordIdx]=useState(0);
  const words=["Innovation","World Class","Smart","Modern","Precision","The Future is Here!"];
  const canvasRef=useRef();

  useEffect(()=>{
    // Phase 0→1 after 400ms
    const t1=setTimeout(()=>setPhase(1),400);
    // Cycle words every 900ms
    const tw=setInterval(()=>setWordIdx(i=>i+1),900);
    // Phase 1→2 (start fadeout) at 8200ms
    const t2=setTimeout(()=>setPhase(2),8200);
    // Done at 9000ms
    const t3=setTimeout(()=>onDone(),9000);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearInterval(tw);};
  },[]);

  // Animated circuit canvas
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const W=canvas.width; const H=canvas.height;
    let frame=0;
    // Generate circuit paths
    const nodes=Array.from({length:18},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4,
      r:Math.random()*2+1
    }));
    let anim;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);
      frame++;
      nodes.forEach(n=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<0||n.x>W)n.vx*=-1;
        if(n.y<0||n.y>H)n.vy*=-1;
      });
      // Draw connections
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const dx=nodes[i].x-nodes[j].x; const dy=nodes[i].y-nodes[j].y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<160){
            const alpha=(1-dist/160)*0.35;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x,nodes[i].y);
            ctx.lineTo(nodes[j].x,nodes[j].y);
            ctx.strokeStyle=`rgba(34,211,238,${alpha})`;
            ctx.lineWidth=.8;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(n=>{
        ctx.beginPath();
        ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle="rgba(34,211,238,0.6)";
        ctx.fill();
      });
      anim=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(anim);
  },[]);

  const currentWord=words[wordIdx%words.length];

  return(
    <div style={{
      position:"fixed",inset:0,zIndex:9999,
      background:"linear-gradient(135deg,#020617 0%,#060f2a 40%,#020617 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      opacity:phase===2?0:1,
      transition:phase===2?"opacity 0.6s ease":"opacity 0.4s ease",
      overflow:"hidden"
    }}>
      {/* Animated circuit canvas */}
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:.5}}/>

      {/* Radial glow */}
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(34,211,238,0.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"15%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%)",pointerEvents:"none"}}/>

      {/* Content */}
      <div style={{
        position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:28,
        opacity:phase>=1?1:0,transform:phase>=1?"translateY(0)":"translateY(20px)",
        transition:"opacity 0.6s ease, transform 0.6s ease"
      }}>
        {/* TynovA logo + name */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <div style={{
            width:80,height:80,borderRadius:20,
            background:"linear-gradient(135deg,rgba(34,211,238,0.15),rgba(59,130,246,0.1))",
            border:"1px solid rgba(34,211,238,0.25)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 0 40px rgba(34,211,238,0.15)"
          }}>
            <TynovaLogo size={50} light />
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:36,fontWeight:900,color:"#fff",fontFamily:"Inter,sans-serif",letterSpacing:"-1px",lineHeight:1}}>TynovA</div>
            <div style={{fontSize:11,color:"rgba(34,211,238,0.7)",fontFamily:"Inter,sans-serif",letterSpacing:"3px",textTransform:"uppercase",marginTop:4}}>Technologies</div>
          </div>
        </div>

        {/* Divider line */}
        <div style={{width:1,height:32,background:"linear-gradient(to bottom,transparent,rgba(34,211,238,0.4),transparent)"}}/>

        {/* Cycling innovation words */}
        <div style={{
          minHeight:36,display:"flex",alignItems:"center",justifyContent:"center",
          overflow:"hidden"
        }}>
          <div key={wordIdx} style={{
            fontSize:currentWord==="The Future is Here!" ? 16 : 13,
            fontWeight:currentWord==="The Future is Here!" ? 800 : 600,
            color:currentWord==="The Future is Here!" ? "rgba(255,255,255,0.95)" : "rgba(34,211,238,0.8)",
            fontFamily:"Inter,sans-serif",
            letterSpacing:currentWord==="The Future is Here!" ? "2px" : "4px",
            textTransform:"uppercase",
            textShadow:currentWord==="The Future is Here!" ? "0 0 20px rgba(34,211,238,0.6)" : "none",
            animation:"splashWord 0.6s ease",
          }}>{currentWord}</div>
        </div>

        {/* Welcome message */}
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",fontFamily:"Inter,sans-serif",letterSpacing:".3px"}}>
            Welcome back, <span style={{color:"rgba(255,255,255,0.85)",fontWeight:600}}>{user?.name||user?.username}</span>
          </div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:"Inter,sans-serif",marginTop:4,letterSpacing:".5px"}}>Loading your workspace…</div>
        </div>

        {/* Progress bar */}
        <div style={{width:200,height:2,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}>
          <div style={{
            height:"100%",background:"linear-gradient(90deg,#22d3ee,#3b82f6)",borderRadius:2,
            animation:"splashBar 8.5s ease forwards"
          }}/>
        </div>
      </div>

      {/* CSS keyframes injected */}
      <style>{`
        @keyframes splashWord {
          0%   { opacity:0; transform:translateY(10px); }
          30%  { opacity:1; transform:translateY(0); }
          70%  { opacity:1; transform:translateY(0); }
          100% { opacity:0; transform:translateY(-8px); }
        }
        @keyframes splashBar {
          0%   { width:0%; }
          20%  { width:15%; }
          60%  { width:70%; }
          90%  { width:92%; }
          100% { width:100%; }
        }
      `}</style>
    </div>
  );
}

/* ─── LOGIN ─────────────────────────────────────────────────── */
function Login({onLogin}) {
  const [username,setUsername]=useState(()=>{ try{return localStorage.getItem("tsoa_remember_user")||"";}catch{return "";} });
  const [pw,setPw]=useState("");
  const [show,setShow]=useState(false);
  const [rememberMe,setRememberMe]=useState(()=>{ try{return !!localStorage.getItem("tsoa_remember_user");}catch{return false;} });
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [splashUser,setSplashUser]=useState(null);

  const attempt = () => {
    if(!username.trim()||!pw){setErr("Please enter your username and password.");return;}
    setLoading(true);
    setTimeout(()=>{
      const user=USERS.find(u=>u.username.toLowerCase()===username.trim().toLowerCase()&&u.password===pw);
      if(user){
        try{
          if(rememberMe){localStorage.setItem("tsoa_remember_user",username.trim());}
          else{localStorage.removeItem("tsoa_remember_user");}
        }catch{}
        setSplashUser(user);
      } else {
        setErr("Invalid username or password.");setPw("");
      }
      setLoading(false);
    },400);
  };

  if(splashUser) return <SplashScreen user={splashUser} onDone={()=>onLogin(splashUser)}/>;

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",padding:16,overflow:"hidden",background:"#020617"}}>
      {/* Dark background layers */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#020617 0%,#0c1a3a 40%,#071025 70%,#010409 100%)",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,zIndex:0,opacity:.18,backgroundImage:"radial-gradient(circle at 20% 30%,#1d4ed8 0%,transparent 50%),radial-gradient(circle at 80% 70%,#0f172a 0%,transparent 50%),radial-gradient(circle at 50% 50%,#1e3a8a 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",inset:0,zIndex:0,opacity:.05,backgroundImage:"linear-gradient(rgba(59,130,246,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.5) 1px,transparent 1px)",backgroundSize:"48px 48px"}}/>
      <div style={{position:"absolute",top:"15%",left:"10%",width:300,height:300,borderRadius:"50%",background:"rgba(59,130,246,.06)",filter:"blur(80px)",zIndex:0}}/>
      <div style={{position:"absolute",bottom:"20%",right:"10%",width:250,height:250,borderRadius:"50%",background:"rgba(30,58,138,.08)",filter:"blur(60px)",zIndex:0}}/>

      <div style={{position:"relative",zIndex:10,width:"100%",maxWidth:400}}>
        {/* Dual-brand header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:28}}>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingRight:18,borderRight:"1px solid rgba(255,255,255,.12)"}}>
            <TynovaLogo size={38} light />
            <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"Inter,sans-serif",letterSpacing:"-0.5px",lineHeight:1}}>TynovA</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,paddingLeft:18}}>
            <TSOAIcon size={38} />
            <div style={{lineHeight:1.2}}>
              <div style={{fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Inter,sans-serif",letterSpacing:"0.5px",lineHeight:1}}>TSOA TECHNOLOGIES</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.4)",fontFamily:"Inter,sans-serif",letterSpacing:"1.5px",textTransform:"uppercase",marginTop:3}}>Management System</div>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,padding:28,backdropFilter:"blur(12px)"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:6,fontFamily:"Inter,sans-serif"}}>Sign in to your account</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:24,fontFamily:"Inter,sans-serif"}}>Enter your credentials to continue</div>

          {/* Username */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:6,fontFamily:"Inter,sans-serif"}}>Username</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex"}}><I n="user" s={15} c="rgba(255,255,255,.3)"/></span>
              <input value={username} onChange={e=>{setUsername(e.target.value);setErr("");}}
                onKeyDown={e=>{if(e.key==="Enter")attempt();}}
                placeholder="e.g. james.mutua"
                style={{width:"100%",padding:"11px 12px 11px 38px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
          </div>

          {/* Password */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.55)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:6,fontFamily:"Inter,sans-serif"}}>Password</div>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",display:"flex"}}><I n="lock" s={15} c="rgba(255,255,255,.3)"/></span>
              <input type={show?"text":"password"} value={pw} onChange={e=>{setPw(e.target.value);setErr("");}}
                onKeyDown={e=>{if(e.key==="Enter")attempt();}}
                placeholder="Enter password"
                style={{width:"100%",padding:"11px 40px 11px 38px",borderRadius:8,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif",outline:"none",boxSizing:"border-box"}}/>
              <button onClick={()=>setShow(s=>!s)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,display:"flex"}}>
                {show?<I n="eyeOff" s={15} c="rgba(255,255,255,.4)"/>:<I n="eye" s={15} c="rgba(255,255,255,.4)"/>}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:20,cursor:"pointer"}} onClick={()=>setRememberMe(r=>!r)}>
            <div style={{
              width:18,height:18,borderRadius:5,flexShrink:0,
              background:rememberMe?"linear-gradient(135deg,#22d3ee,#3b82f6)":"rgba(255,255,255,.06)",
              border:rememberMe?"none":"1px solid rgba(255,255,255,.2)",
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"all .2s"
            }}>
              {rememberMe&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{fontSize:12,color:"rgba(255,255,255,.45)",fontFamily:"Inter,sans-serif",userSelect:"none"}}>Remember me on this device</span>
          </div>

          {err&&<div style={{padding:"9px 12px",borderRadius:7,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:"#fca5a5",fontSize:12,marginBottom:14,fontFamily:"Inter,sans-serif"}}>⚠ {err}</div>}

          {/* Sign In button — vibrant teal-cyan gradient */}
          <button onClick={attempt} disabled={loading} style={{
            width:"100%",padding:"13px",
            background:loading?"rgba(255,255,255,.06)":"linear-gradient(135deg,#06b6d4 0%,#0ea5e9 50%,#3b82f6 100%)",
            border:"none",borderRadius:9,color:"#fff",fontSize:14,fontWeight:700,
            cursor:loading?"not-allowed":"pointer",fontFamily:"Inter,sans-serif",
            boxShadow:loading?"none":"0 4px 24px rgba(6,182,212,0.35)",
            transition:"all .25s",letterSpacing:".3px"
          }}>
            {loading?"Authenticating…":"Sign In →"}
          </button>

          {/* Demo credentials */}
          <div style={{marginTop:20,padding:"14px",borderRadius:8,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.06)"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.3)",fontFamily:"Inter,sans-serif",marginBottom:6,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>Demo Credentials</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {USERS.map(u=>(
                <div key={u.id} style={{fontSize:10,color:"rgba(255,255,255,.35)",fontFamily:"DM Mono,monospace"}}>{u.username}</div>
              ))}
            </div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.25)",marginTop:6,fontFamily:"Inter,sans-serif"}}>Passwords: Tsoa@1234–4567 / Admin@0000</div>
          </div>
        </div>

        {/* Powered by TynovA */}
        <div style={{textAlign:"center",marginTop:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <TynovaLogo size={18} light />
          <span style={{fontSize:11,color:"rgba(255,255,255,.3)",fontFamily:"Inter,sans-serif"}}>Powered by <strong style={{color:"rgba(255,255,255,.5)"}}>TynovA</strong></span>
        </div>
      </div>
    </div>
  );
}

/* ─── NAV CONFIG ─────────────────────────────────────────────── */
const NAV = [
  {key:"dashboard", icon:"dashboard", label:"Dashboard"},
  {key:"projects",  icon:"projects",  label:"Projects"},
  {key:"problems",  icon:"tracker",   label:"Action Tracker"},
  {key:"signin",    icon:"signin",    label:"Sign In / Out"},
  {key:"reports",   icon:"reports",   label:"Weekly Reports"},
  {key:"documents", icon:"documents", label:"Documents"},
  {key:"admin",     icon:"admin",     label:"Admin Console", adminOnly:true},
];

/* ─── SIDEBAR ───────────────────────────────────────────────── */
function Sidebar({page,setPage,user,onLogout,setShowAI,problems,search,setSearch,sidebarOpen,setSidebarOpen}) {
  const isMobile = useIsMobile();
  const clk = useClock();
  const openProbs = (problems||[]).filter(p=>p.status==="Open"||p.status==="Investigating").length;

  if(isMobile&&!sidebarOpen) return null;

  return(
    <>
      {isMobile&&<div onClick={()=>setSidebarOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:30}}/>}
      <div style={{
        width:220,minHeight:"100vh",
        background:"#0f172a",
        borderRight:"1px solid rgba(255,255,255,.06)",
        display:"flex",flexDirection:"column",flexShrink:0,
        position:isMobile?"fixed":"sticky",
        top:0,left:0,height:"100vh",zIndex:40,
        overflowY:"auto"
      }}>
        {/* TynovA Logo + branding */}
        <div style={{padding:"18px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
            <TynovaLogo size={32} light />
            <div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff",fontFamily:"Inter,sans-serif",letterSpacing:"-0.3px",lineHeight:1}}>TynovA</div>
            </div>
            {isMobile&&<button onClick={()=>setSidebarOpen(false)} style={{marginLeft:"auto",background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:4}}><I n="xmark" s={16} c="rgba(255,255,255,.4)"/></button>}
          </div>
          <div style={{marginTop:10,padding:"7px 10px",borderRadius:7,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:18,fontFamily:"DM Mono,monospace",fontWeight:500,color:"#fff",letterSpacing:1}}>
              {clk.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
            </span>
            <span style={{fontSize:10,color:"rgba(255,255,255,.35)",textAlign:"right",lineHeight:1.5,fontFamily:"Inter,sans-serif"}}>
              {clk.toLocaleDateString("en-GB",{weekday:"short"})}<br/>
              {clk.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
            </span>
          </div>
        </div>

        {/* Search */}
        <div style={{padding:"10px 12px 0"}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",display:"flex"}}><I n="search" s={13} c="rgba(255,255,255,.35)"/></span>
            <input value={search||""} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              style={{width:"100%",padding:"8px 9px 8px 28px",borderRadius:7,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.06)",color:"#fff",fontSize:11.5,fontFamily:"Inter,sans-serif"}}/>
          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"8px 8px",display:"flex",flexDirection:"column",gap:1}}>
          {NAV.filter(n=>!n.adminOnly||(user?.role==="System Administrator")).map(n=>{
            const isActive=page===n.key;
            const badge=n.key==="problems"&&openProbs>0?openProbs:null;
            return(
              <button key={n.key} onClick={()=>{setPage(n.key);if(isMobile)setSidebarOpen(false);}}
                style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:7,
                  border:"none",cursor:"pointer",textAlign:"left",width:"100%",
                  background:isActive?"rgba(59,130,246,.18)":"transparent",
                  color:isActive?"#fff":"rgba(255,255,255,.55)",transition:"all .15s"}}>
                <span style={{width:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <I n={n.icon} s={15} c={isActive?"#60a5fa":"rgba(255,255,255,.45)"}/>
                </span>
                <span style={{fontFamily:"Inter,sans-serif",fontWeight:isActive?600:400,fontSize:13,flex:1}}>{n.label}</span>
                {badge&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:8,minWidth:16,textAlign:"center"}}>{badge}</span>}
                {isActive&&<div style={{width:3,height:12,borderRadius:2,background:"#60a5fa",flexShrink:0}}/>}
              </button>
            );
          })}

          <div style={{margin:"8px 4px",borderTop:"1px solid rgba(255,255,255,.06)"}}/>

          <button onClick={()=>setShowAI(true)}
            style={{display:"flex",alignItems:"center",gap:9,padding:"9px 10px",borderRadius:7,
              border:"1px solid rgba(59,130,246,.25)",cursor:"pointer",width:"100%",
              background:"rgba(59,130,246,.1)",color:"#93c5fd",transition:"all .2s"}}>
            <span style={{width:16,display:"flex",alignItems:"center"}}><I n="ai" s={15} c="#93c5fd"/></span>
            <span style={{fontFamily:"Inter,sans-serif",fontWeight:500,fontSize:13,flex:1}}>BrewPack AI</span>
            <span style={{fontSize:8,background:"#0f172a",color:"#fff",padding:"2px 6px",borderRadius:4,fontWeight:700,letterSpacing:.3}}>AI</span>
          </button>
        </nav>

        {/* Alert */}
        {openProbs>0&&(
          <div onClick={()=>setPage("problems")} style={{margin:"0 8px 8px",padding:"9px 11px",borderRadius:7,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#fca5a5",fontWeight:600,marginBottom:1}}><I n="alert" s={12} c="#fca5a5"/> {openProbs} Open Problem{openProbs!==1?"s":""}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontFamily:"Inter,sans-serif"}}>Requires attention</div>
          </div>
        )}

        {/* User + footer */}
        <div style={{padding:"10px 12px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <Avatar initials={user.avatar} size={30}/>
            <div style={{overflow:"hidden",flex:1}}>
              <div style={{fontSize:12,color:"#fff",fontWeight:600,fontFamily:"Inter,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"Inter,sans-serif"}}>{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{width:"100%",padding:"7px",borderRadius:6,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.04)",color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <I n="logout" s={12} c="rgba(255,255,255,.5)"/> Sign Out
          </button>
          <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.05)",display:"flex",alignItems:"center",gap:6}}>
            <TynovaLogo size={14} light />
            <span style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"Inter,sans-serif"}}>Powered by <strong style={{color:"rgba(255,255,255,.35)"}}>TynovA</strong></span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── MOBILE TOP BAR ─────────────────────────────────────────── */
function MobileTopBar({page,setPage,setSidebarOpen,problems,user}) {
  const openProbs=(problems||[]).filter(p=>p.status==="Open"||p.status==="Investigating").length;
  const currentNav=NAV.find(n=>n.key===page)||NAV[0];
  return(
    <div style={{position:"sticky",top:0,zIndex:20,background:"#0f172a",borderBottom:"1px solid rgba(255,255,255,.08)",padding:"0 16px",height:52,display:"flex",alignItems:"center",gap:10}}>
      <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",color:"rgba(255,255,255,.7)",cursor:"pointer",padding:4,display:"flex"}}><I n="menu" s={20} c="rgba(255,255,255,.7)"/></button>
      <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
        <TynovaLogo size={22} light />
        <span style={{fontSize:13,fontWeight:700,color:"#fff",fontFamily:"Inter,sans-serif"}}>{currentNav.label}</span>
      </div>
      {openProbs>0&&<div onClick={()=>setPage("problems")} style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",cursor:"pointer",boxShadow:"0 0 8px rgba(239,68,68,.6)"}}/>}
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({user,setPage,setActiveProject,problems,projects}) {
  const isMobile=useIsMobile();
  const myProjects=projects.filter(p=>user.projects.includes(p.id));
  const openProbs=(problems||[]).filter(p=>p.status==="Open"||p.status==="Investigating");
  const critProbs=(problems||[]).filter(p=>p.severity==="Critical"&&p.status!=="Closed");
  const now=new Date(); const hr=now.getHours();
  const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";

  const statItems=[
    {label:"My Projects",val:myProjects.length,sub:`${myProjects.filter(p=>p.status==="In Progress").length} active`,icon:"projects",color:"#3b82f6"},
    {label:"Open Issues",val:openProbs.length,sub:`${critProbs.length} critical`,icon:"tracker",color:openProbs.length>0?"#f97316":"#10b981"},
    {label:"Completed",val:myProjects.filter(p=>p.status==="Completed").length,sub:"This quarter",icon:"award",color:"#10b981"},
    {label:"Avg Progress",val:myProjects.length?Math.round(myProjects.reduce((a,p)=>a+p.progress,0)/myProjects.length)+"%":"—",sub:"All projects",icon:"activity",color:"#8b5cf6"},
  ];

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <PageHeader title={`${greet}, ${user.name.split(" ")[0]}`} subtitle={now.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}/>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {statItems.map((s,i)=>(
          <Card key={i} style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:`${s.color}12`,border:`1px solid ${s.color}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <I n={s.icon} s={17} c={s.color}/>
              </div>
              <div style={{width:7,height:7,borderRadius:"50%",background:s.color,boxShadow:`0 0 8px ${s.color}80`}}/>
            </div>
            <div style={{fontSize:28,fontWeight:800,color:"#0f172a",fontFamily:"Inter,sans-serif",letterSpacing:"-1px",lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:4,fontFamily:"Inter,sans-serif",fontWeight:500}}>{s.label}</div>
            <div style={{fontSize:10,color:s.color,marginTop:2,fontWeight:600,fontFamily:"Inter,sans-serif"}}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.6fr 1fr",gap:16}}>
        {/* Projects */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:"#0f172a",fontFamily:"Inter,sans-serif"}}>Active Projects</div>
            <button onClick={()=>setPage("projects")} style={{background:"none",border:"none",color:"#3b82f6",fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500}}>View all →</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {myProjects.filter(p=>p.status!=="Completed").slice(0,4).map(p=>(
              <Card key={p.id} hover onClick={()=>{setActiveProject(p);setPage("project-detail");}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:"#94a3b8",marginBottom:3,display:"flex",alignItems:"center",gap:3}}><I n="location" s={10} c="#94a3b8"/> {p.plant.split(" — ")[0]}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#0f172a",lineHeight:1.4,fontFamily:"Inter,sans-serif"}}>{p.title}</div>
                  </div>
                  <Badge label={p.status} color={STATUS_COLOR[p.status]}/>
                </div>
                <ProgressBar pct={p.progress} color={STATUS_COLOR[p.status]}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>
                  <span>{p.lead}</span><span style={{color:STATUS_COLOR[p.status],fontWeight:600}}>{p.progress}%</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar info */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {openProbs.length>0&&(
            <Card style={{border:"1px solid #fecaca",borderLeft:"3px solid #ef4444"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#dc2626",marginBottom:10,fontFamily:"Inter,sans-serif"}}>⚠ Needs Attention</div>
              {openProbs.slice(0,3).map((p,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<Math.min(openProbs.length,3)-1?"1px solid #fef2f2":"none"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:SEV_COLOR[p.severity],marginTop:5,flexShrink:0}}/>
                  <div>
                    <div style={{fontSize:12,color:"#0f172a",fontWeight:500}}>{p.title}</div>
                    <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}><span style={{color:PSTAT_COLOR[p.status]}}>{p.status}</span></div>
                  </div>
                </div>
              ))}
              <button onClick={()=>setPage("problems")} style={{width:"100%",marginTop:8,padding:"7px",borderRadius:6,border:"1px solid #fecaca",background:"rgba(239,68,68,.04)",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>View all problems →</button>
            </Card>
          )}

          {/* Quick actions */}
          <Card>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Quick Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {label:"Log Problem",icon:"tracker",color:"#f97316",action:()=>setPage("problems")},
                {label:"Sign In / Out",icon:"signin",color:"#3b82f6",action:()=>setPage("signin")},
                {label:"Weekly Reports",icon:"reports",color:"#8b5cf6",action:()=>setPage("reports")},
                {label:"Documents",icon:"documents",color:"#10b981",action:()=>setPage("documents")},
              ].map((q,i)=>(
                <button key={i} onClick={q.action} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 10px",borderRadius:7,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",transition:"all .15s",textAlign:"left",width:"100%",fontFamily:"Inter,sans-serif",fontSize:12,color:"#334155",fontWeight:500}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${q.color}08`;e.currentTarget.style.borderColor=`${q.color}30`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#f8fafc";e.currentTarget.style.borderColor="#e2e8f0";}}>
                  <div style={{width:26,height:26,borderRadius:6,background:`${q.color}12`,display:"flex",alignItems:"center",justifyContent:"center"}}><I n={q.icon} s={13} c={q.color}/></div>
                  {q.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Plants */}
          <Card style={{padding:"14px 16px"}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Plants</div>
            {PLANTS.slice(1).map((pl,i)=>(
              <div key={i} style={{padding:"7px 10px",borderRadius:7,background:"#f8fafc",border:"1px solid #e2e8f0",marginBottom:i<PLANTS.length-2?6:0}}>
                <div style={{fontSize:11,color:"#1e3a8a",fontWeight:600,fontFamily:"Inter,sans-serif"}}><I n="location" s={10} c="#3b82f6"/> {pl.split(" — ")[1]}</div>
                <div style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif",marginTop:1}}>{pl.split(" — ")[0]}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ─── PROJECTS LIST ─────────────────────────────────────────── */
function ProjectsList({user,setPage,setActiveProject,projects}) {
  const isMobile=useIsMobile();
  const [filter,setFilter]=useState("All");
  const [plantFilter,setPlantFilter]=useState("All Plants");
  const all=user.id===5?projects:projects.filter(p=>user.projects.includes(p.id));
  const filtered=all.filter(p=>(filter==="All"||p.status===filter)&&(plantFilter==="All Plants"||p.plant===plantFilter));

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <PageHeader title="Projects" subtitle={`${filtered.length} of ${all.length} projects`}/>
      <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
        {PLANTS.map(pl=>(
          <button key={pl} onClick={()=>setPlantFilter(pl)} style={{padding:"5px 12px",borderRadius:6,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500,fontSize:11.5,background:plantFilter===pl?"#0f172a":"#f1f5f9",color:plantFilter===pl?"#fff":"#475569",border:plantFilter===pl?"1px solid #0f172a":"1px solid #e2e8f0",transition:"all .15s"}}>
            {pl}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
        {["All","In Progress","Completed","Planning","On Hold"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 12px",borderRadius:6,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500,fontSize:11,background:filter===f?(STATUS_COLOR[f]||"#0f172a"):"#f1f5f9",color:filter===f?"#fff":"#475569",border:filter===f?`1px solid ${STATUS_COLOR[f]||"#0f172a"}`:"1px solid #e2e8f0",transition:"all .15s"}}>
            {f}
          </button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(p=>{
          const done=p.actions.filter(a=>a.status==="Done").length;
          return(
            <Card key={p.id} hover onClick={()=>{setActiveProject(p);setPage("project-detail");}}>
              <div style={{display:"flex",gap:16,alignItems:"stretch",flexWrap:isMobile?"wrap":"nowrap"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                    <Badge label={p.status} color={STATUS_COLOR[p.status]}/>
                    <Badge label={p.priority} color={PRIORITY_COLOR[p.priority]}/>
                    <span style={{fontSize:10,color:"#94a3b8",display:"inline-flex",alignItems:"center",gap:3}}><I n="location" s={9} c="#94a3b8"/> {p.plant}</span>
                  </div>
                  <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:6,fontFamily:"Inter,sans-serif"}}>{p.title}</div>
                  <div style={{fontSize:12,color:"#64748b",lineHeight:1.7,marginBottom:12,fontFamily:"Inter,sans-serif"}}>{p.scope.substring(0,140)}…</div>
                  <ProgressBar pct={p.progress} color={STATUS_COLOR[p.status]}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif",flexWrap:"wrap",gap:4}}>
                    <span>Lead: <span style={{color:"#475569",fontWeight:500}}>{p.lead}</span></span>
                    <span>{done}/{p.actions.length} actions</span>
                    <span>{formatDate(p.start)} → {formatDate(p.end)}</span>
                  </div>
                </div>
                {!isMobile&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:60,flexShrink:0,borderLeft:"1px solid #f1f5f9",paddingLeft:14}}>
                  <div style={{fontSize:24,fontWeight:800,color:STATUS_COLOR[p.status],fontFamily:"Inter,sans-serif",letterSpacing:"-1px",lineHeight:1}}>{p.progress}%</div>
                  <div style={{fontSize:9,color:"#94a3b8",marginTop:3,textTransform:"uppercase",letterSpacing:.8,fontFamily:"Inter,sans-serif"}}>Done</div>
                </div>}
              </div>
            </Card>
          );
        })}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"48px 0",color:"#94a3b8",fontSize:13,fontFamily:"Inter,sans-serif"}}>No projects match your filters.</div>}
      </div>
    </div>
  );
}

/* ─── PROJECT DETAIL ─────────────────────────────────────────── */
function ProjectDetail({project,onBack}) {
  const isMobile=useIsMobile();
  const [tab,setTab]=useState("overview");
  const tabs=[{k:"overview",l:"Overview"},{k:"actions",l:"Actions"},{k:"analysis",l:"5 Whys"},{k:"closure",l:"Closure"}];
  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13,marginBottom:18,padding:0}}>← Back to Projects</button>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <Badge label={project.status} color={STATUS_COLOR[project.status]}/>
          <Badge label={project.priority} color={PRIORITY_COLOR[project.priority]}/>
        </div>
        <h1 style={{fontSize:isMobile?20:24,fontWeight:800,color:"#0f172a",marginBottom:4,fontFamily:"Inter,sans-serif",letterSpacing:"-0.5px"}}>{project.title}</h1>
        <div style={{fontSize:12,color:"#64748b",marginBottom:8,display:"flex",alignItems:"center",gap:4,fontFamily:"Inter,sans-serif"}}>
          <I n="location" s={11} c="#94a3b8"/> {project.plant}
        </div>
        <div style={{display:"flex",gap:12,fontSize:12,color:"#64748b",fontFamily:"Inter,sans-serif",flexWrap:"wrap"}}>
          <span>Lead: <span style={{color:"#334155",fontWeight:500}}>{project.lead}</span></span>
          <span>{formatDate(project.start)} → {formatDate(project.end)}</span>
          <span style={{color:STATUS_COLOR[project.status],fontWeight:600}}>{project.progress}% complete</span>
        </div>
        <div style={{marginTop:12,maxWidth:500}}><ProgressBar pct={project.progress} color={STATUS_COLOR[project.status]}/></div>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:"1px solid #e2e8f0",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.k} onClick={()=>setTab(t.k)} style={{padding:"10px 16px",background:"none",border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:tab===t.k?600:400,fontSize:13,color:tab===t.k?"#1d4ed8":"#64748b",borderBottom:`2px solid ${tab===t.k?"#3b82f6":"transparent"}`,marginBottom:-1,transition:"all .15s",whiteSpace:"nowrap"}}>
            {t.l}
          </button>
        ))}
      </div>
      {tab==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card><div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Project Scope</div><div style={{fontSize:13.5,color:"#334155",lineHeight:1.9,fontFamily:"Inter,sans-serif"}}>{project.scope}</div></Card>
        <Card><div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Problem Description</div><div style={{fontSize:13.5,color:"#334155",lineHeight:1.9,fontFamily:"Inter,sans-serif"}}>{project.problemDesc}</div></Card>
      </div>}
      {tab==="actions"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {project.actions.map((a,i)=>(
          <Card key={a.id} style={{padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <div style={{width:26,height:26,borderRadius:6,background:`${ACTION_STATUS_COLOR[a.status]}15`,border:`1px solid ${ACTION_STATUS_COLOR[a.status]}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {a.status==="Done"?<I n="check" s={12} c={ACTION_STATUS_COLOR["Done"]}/>:<span style={{fontSize:11,fontWeight:700,color:ACTION_STATUS_COLOR[a.status],fontFamily:"Inter,sans-serif"}}>{i+1}</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontWeight:600,fontSize:13,color:"#0f172a",fontFamily:"Inter,sans-serif"}}>{a.title}</span>
                  <Badge label={a.status} color={ACTION_STATUS_COLOR[a.status]}/>
                </div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.7,marginBottom:6,fontFamily:"Inter,sans-serif"}}>{a.desc}</div>
                <div style={{fontSize:11,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>Owner: <span style={{color:"#475569",fontWeight:500}}>{a.owner}</span> · Due: {formatDate(a.due)}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>}
      {tab==="analysis"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card><div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Root Cause</div><div style={{fontSize:13.5,color:"#334155",lineHeight:1.9,fontFamily:"Inter,sans-serif"}}>{project.rootCause}</div></Card>
        <Card>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:14,fontFamily:"Inter,sans-serif"}}>5 Whys Analysis</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {project.whys.map((w,i)=>(
              <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:26,height:26,borderRadius:6,background:`rgba(59,130,246,${0.08+i*0.04})`,border:`1px solid rgba(59,130,246,${0.15+i*0.06})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:`rgba(29,78,216,${0.6+i*0.08})`,flexShrink:0,fontFamily:"Inter,sans-serif"}}>W{i+1}</div>
                <div style={{flex:1,padding:"9px 13px",background:`rgba(239,246,255,${0.6+i*0.05})`,border:"1px solid #dbeafe",borderLeft:`3px solid ${["#93c5fd","#60a5fa","#3b82f6","#2563eb","#1d4ed8"][i]||"#1d4ed8"}`,borderRadius:8,fontSize:13,color:"#334155",lineHeight:1.7,fontFamily:"Inter,sans-serif"}}>{w}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>}
      {tab==="closure"&&<Card><div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Loop Closure</div><div style={{fontSize:13.5,color:"#334155",lineHeight:1.9,fontFamily:"Inter,sans-serif"}}>{project.loopClosure}</div></Card>}
    </div>
  );
}

/* ─── PROBLEM LOG ───────────────────────────────────────────── */
const EMPTY_PROB = {title:"",date:"",plant:"",machine:"",foundBy:"",severity:"Major",status:"Open",description:"",immediateActions:"",rootCause:"",solution:"",outcome:"",loopClosure:""};
const IS = {width:"100%",padding:"10px 12px",borderRadius:7,border:"1px solid #e2e8f0",background:"#fff",color:"#0f172a",fontSize:13,fontFamily:"Inter,sans-serif"};
const TA = {...IS,resize:"vertical",lineHeight:1.7,minHeight:90};

const Field = ({label,children,required}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    <label style={{fontSize:11,color:"#475569",fontWeight:600,letterSpacing:.5,textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>{label}{required&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</label>
    {children}
  </div>
);

function ProblemForm({user,initial,onSave,onCancel}) {
  const [f,setF]=useState(initial||{...EMPTY_PROB,foundBy:user.name,date:today()});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.title&&f.date&&f.plant&&f.machine&&f.description;
  return(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderTop:"3px solid #1d4ed8",borderRadius:10,padding:24,maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:18,fontWeight:700,color:"#0f172a",marginBottom:20,fontFamily:"Inter,sans-serif"}}>{initial?"Edit Problem Report":"Log New Problem"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <Field label="Problem Title" required><input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="Brief descriptive title" style={IS}/></Field>
        <Field label="Date Found" required><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={IS}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
        <Field label="Plant" required><select value={f.plant} onChange={e=>set("plant",e.target.value)} style={IS}><option value="">Select…</option>{PLANTS.slice(1).map(p=><option key={p} value={p}>{p}</option>)}</select></Field>
        <Field label="Machine / Area" required><select value={f.machine} onChange={e=>set("machine",e.target.value)} style={IS}><option value="">Select…</option>{MACHINES_LIST.map(m=><option key={m} value={m}>{m}</option>)}</select></Field>
        <Field label="Found By"><input value={f.foundBy} onChange={e=>set("foundBy",e.target.value)} style={IS}/></Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <Field label="Severity"><select value={f.severity} onChange={e=>set("severity",e.target.value)} style={{...IS,color:SEV_COLOR[f.severity],fontWeight:600}}>{PROB_SEVERITIES.map(s=><option key={s} value={s}>{s}</option>)}</select></Field>
        <Field label="Status"><select value={f.status} onChange={e=>set("status",e.target.value)} style={{...IS,color:PSTAT_COLOR[f.status],fontWeight:600}}>{PROB_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></Field>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
        <Field label="Problem Description" required><textarea value={f.description} onChange={e=>set("description",e.target.value)} placeholder="What was observed, when, where…" style={{...TA,minHeight:100}}/></Field>
        <Field label="Immediate Actions Taken"><textarea value={f.immediateActions} onChange={e=>set("immediateActions",e.target.value)} placeholder="What was done immediately…" style={TA}/></Field>
        <Field label="Root Cause"><textarea value={f.rootCause} onChange={e=>set("rootCause",e.target.value)} placeholder="Confirmed or suspected root cause…" style={TA}/></Field>
        <Field label="Solution Implemented"><textarea value={f.solution} onChange={e=>set("solution",e.target.value)} placeholder="Corrective action taken…" style={TA}/></Field>
        <Field label="Outcome / Verification"><textarea value={f.outcome} onChange={e=>set("outcome",e.target.value)} placeholder="How was effectiveness verified?…" style={TA}/></Field>
        <Field label="Loop Closure Statement"><textarea value={f.loopClosure} onChange={e=>set("loopClosure",e.target.value)} placeholder="Systemic actions to prevent recurrence…" style={{...TA,minHeight:80}}/></Field>
      </div>
      {!valid&&<div style={{padding:"8px 12px",borderRadius:7,background:"#fff5f5",border:"1px solid #fecaca",fontSize:11,color:"#dc2626",marginBottom:14,fontFamily:"Inter,sans-serif"}}>⚠ Title, date, plant, machine and description are required.</div>}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{padding:"10px 20px",borderRadius:7,border:"1px solid #e2e8f0",background:"transparent",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
        <button onClick={()=>valid&&onSave(f)} style={{padding:"10px 24px",borderRadius:7,background:valid?"#0f172a":"#94a3b8",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:valid?"pointer":"not-allowed",fontFamily:"Inter,sans-serif"}}>{initial?"Save Changes":"Submit Report"}</button>
      </div>
    </div>
  );
}

function ProblemLog({user,problems,setProblems}) {
  const isMobile=useIsMobile();
  const [view,setView]=useState("list");
  const [sel,setSel]=useState(null);
  const [filterSev,setFilterSev]=useState("All");
  const [filterStat,setFilterStat]=useState("All");
  const [filterPlant,setFilterPlant]=useState("All Plants");
  const [search,setSearch]=useState("");
  const [deleting,setDeleting]=useState(false);

  const filtered=problems.filter(p=>(filterSev==="All"||p.severity===filterSev)&&(filterStat==="All"||p.status===filterStat)&&(filterPlant==="All Plants"||p.plant===filterPlant)&&(!search||p.title.toLowerCase().includes(search.toLowerCase())));

  const save=async(data)=>{
    if(sel){
      // Update existing
      const{error}=await DB.from("tsoa_problems").update({
        title:data.title, description:data.description, severity:data.severity,
        status:data.status, plant:data.plant, machine:data.machine,
        root_cause:data.rootCause, solution:data.solution,
        immediate_actions:data.immediateActions, outcome:data.outcome, loop_closure:data.loopClosure
      }).eq("id",sel.id);
      if(!error) setProblems(ps=>ps.map(p=>p.id===sel.id?{...p,...data}:p));
    } else {
      const{data:inserted,error}=await DB.from("tsoa_problems").insert([{
        title:data.title, description:data.description, severity:data.severity,
        status:data.status, plant:data.plant, machine:data.machine, found_by:data.foundBy,
        user_id:user.id, date:data.date, root_cause:data.rootCause, solution:data.solution,
        immediate_actions:data.immediateActions, outcome:data.outcome, loop_closure:data.loopClosure
      }]).select().single();
      if(!error&&inserted){
        setProblems(ps=>[{...data,id:inserted.id,userId:user.id,createdAt:inserted.created_at},...ps]);
      } else if(error){
        // fallback: local state only
        setProblems(ps=>[{...data,id:Date.now(),userId:user.id,createdAt:new Date().toISOString()},...ps]);
      }
    }
    setSel(null);setView("list");
  };

  const del=async(id)=>{
    if(!window.confirm("Delete this problem report?"))return;
    setDeleting(true);
    const{error}=await DB.from("tsoa_problems").delete().eq("id",id);
    if(!error){
      setProblems(ps=>ps.filter(p=>p.id!==id));
      setView("list");setSel(null);
    } else {
      // Fallback: remove locally
      setProblems(ps=>ps.filter(p=>p.id!==id));
      setView("list");setSel(null);
    }
    setDeleting(false);
  };

  const canDelete=(p)=> p.userId===user.id || p.foundBy===user.name;

  if(view==="new"||view==="edit") return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <button onClick={()=>{setView("list");setSel(null);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13,marginBottom:18,padding:0}}>← Back</button>
      <ProblemForm user={user} initial={view==="edit"?sel:null} onSave={save} onCancel={()=>{setView("list");setSel(null);}}/>
    </div>
  );

  if(view==="detail"&&sel) return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <button onClick={()=>{setView("list");setSel(null);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13,marginBottom:18,padding:0}}>← Back</button>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{display:"flex",gap:7,marginBottom:8,flexWrap:"wrap"}}>
          <Badge label={sel.severity} color={SEV_COLOR[sel.severity]}/><Badge label={sel.status} color={PSTAT_COLOR[sel.status]}/>
          <span style={{fontSize:11,color:"#64748b"}}>📍 {sel.plant} · ⚙️ {sel.machine}</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:6,fontFamily:"Inter,sans-serif"}}>{sel.title}</h1>
        <div style={{fontSize:12,color:"#64748b",marginBottom:16,fontFamily:"Inter,sans-serif"}}>Found by {sel.foundBy} · {formatDate(sel.date)}</div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button onClick={()=>setView("edit")} style={{padding:"8px 16px",borderRadius:7,background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1d4ed8",fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500}}>✏️ Edit</button>
          {canDelete(sel)&&<button onClick={()=>del(sel.id)} disabled={deleting} style={{padding:"8px 16px",borderRadius:7,background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>{deleting?"Deleting…":"🗑 Delete"}</button>}
        </div>
        {[{label:"Problem Description",val:sel.description},{label:"Immediate Actions",val:sel.immediateActions},{label:"Root Cause",val:sel.rootCause},{label:"Solution Implemented",val:sel.solution},{label:"Outcome / Verification",val:sel.outcome},{label:"Loop Closure",val:sel.loopClosure}].map((s,i)=>s.val&&(
          <Card key={i} style={{marginBottom:10,padding:"16px 18px"}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:8,fontFamily:"Inter,sans-serif"}}>{s.label}</div>
            <div style={{fontSize:13,color:"#334155",lineHeight:1.9,whiteSpace:"pre-wrap",fontFamily:"Inter,sans-serif"}}>{s.val}</div>
          </Card>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <PageHeader title="Action Tracker" subtitle={`${problems.length} total · ${filtered.length} shown`}/>
        <button onClick={()=>{setSel(null);setView("new");}} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",background:"#0f172a",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
          <I n="plus" s={13} c="#fff"/> Log Problem
        </button>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {PROB_STATUSES.map(s=><div key={s} style={{padding:"4px 12px",borderRadius:16,background:`${PSTAT_COLOR[s]}10`,border:`1px solid ${PSTAT_COLOR[s]}25`,fontSize:11,color:PSTAT_COLOR[s],fontWeight:600,fontFamily:"Inter,sans-serif"}}>{s} · {problems.filter(p=>p.status===s).length}</div>)}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}>
          <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",display:"flex"}}><I n="search" s={13} c="#94a3b8"/></span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{...IS,paddingLeft:30}}/>
        </div>
        <select value={filterPlant} onChange={e=>setFilterPlant(e.target.value)} style={{...IS,width:"auto",minWidth:140}}>{PLANTS.map(p=><option key={p}>{p}</option>)}</select>
        <select value={filterSev} onChange={e=>setFilterSev(e.target.value)} style={{...IS,width:"auto"}}><option value="All">All Severities</option>{PROB_SEVERITIES.map(s=><option key={s}>{s}</option>)}</select>
        <select value={filterStat} onChange={e=>setFilterStat(e.target.value)} style={{...IS,width:"auto"}}><option value="All">All Statuses</option>{PROB_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(p=>(
          <Card key={p.id} hover onClick={()=>{setSel(p);setView("detail");}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:3,borderRadius:3,background:SEV_COLOR[p.severity],flexShrink:0,alignSelf:"stretch",minHeight:40}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap",alignItems:"center"}}>
                  <Badge label={p.severity} color={SEV_COLOR[p.severity]}/><Badge label={p.status} color={PSTAT_COLOR[p.status]}/>
                  <span style={{fontSize:10,color:"#94a3b8"}}>⚙️ {p.machine} · {p.plant.split(" — ")[0]}</span>
                  <span style={{fontSize:10,color:"#94a3b8",marginLeft:"auto"}}>{formatDate(p.date)}</span>
                </div>
                <div style={{fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:4,fontFamily:"Inter,sans-serif"}}>{p.title}</div>
                <div style={{fontSize:12,color:"#64748b",lineHeight:1.6,fontFamily:"Inter,sans-serif"}}>{p.description.substring(0,120)}{p.description.length>120?"…":""}</div>
                <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                  {[{label:"Root Cause",done:!!p.rootCause},{label:"Solution",done:!!p.solution},{label:"Closed",done:p.status==="Closed"}].map((s,i)=>(
                    <span key={i} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:s.done?"#f0fdf4":"#f8fafc",border:`1px solid ${s.done?"#bbf7d0":"#e2e8f0"}`,color:s.done?"#059669":"#94a3b8",fontFamily:"Inter,sans-serif"}}>{s.done?"✓":"○"} {s.label}</span>
                  ))}
                  <span style={{fontSize:10,color:"#94a3b8",marginLeft:"auto",fontFamily:"Inter,sans-serif"}}>by {p.foundBy}</span>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"center",flexShrink:0}}>
                <I n="chevron" s={14} c="#cbd5e1"/>
                {canDelete(p)&&(
                  <button onClick={e=>{e.stopPropagation();del(p.id);}} disabled={deleting}
                    title="Delete this action"
                    style={{padding:"4px 8px",borderRadius:5,background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif",lineHeight:1}}>
                    {deleting?"…":"🗑"}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length===0&&<div style={{textAlign:"center",padding:"48px",color:"#94a3b8",fontSize:13,fontFamily:"Inter,sans-serif"}}>No problems match your filters.</div>}
      </div>
    </div>
  );
}

/* ─── SIGN IN / OUT ─────────────────────────────────────────── */
function SignInOut({user}) {
  const isMobile=useIsMobile();
  const [records,setRecords]=useState(()=>{try{return JSON.parse(localStorage.getItem("tsoa_signin")||"[]");}catch{return [];}});
  const save=(r)=>{const n=[...records,r];setRecords(n);try{localStorage.setItem("tsoa_signin",JSON.stringify(n));}catch{}};
  const todayRec=records.filter(r=>r.date===today()&&r.userId===user.id);
  const lastIn=todayRec.filter(r=>r.type==="in").slice(-1)[0];
  const lastOut=todayRec.filter(r=>r.type==="out").slice(-1)[0];
  const isIn=!!(lastIn&&!lastOut);
  const [mode,setMode]=useState(isIn?"out":"in");
  const [proj,setProj]=useState(user.projects[0]||1);
  const [sig,setSig]=useState(null);
  const [done,setDone]=useState(false);
  const [loc,setLoc]=useState(null);
  const [locStatus,setLocStatus]=useState("idle");
  const [lastRecord,setLastRecord]=useState(null);
  const PROJECTS_LIST=INIT_PROJECTS;

  useEffect(()=>{fetchLocation();},[]);

  const fetchLocation=()=>{
    if(!navigator.geolocation){setLocStatus("error");setLoc({address:"Not supported"});return;}
    setLocStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      async pos=>{
        const{latitude:lat,longitude:lng,accuracy}=pos.coords;
        let address=`${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        try{const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);const d=await res.json();address=d.display_name||address;}catch{}
        setLoc({lat:lat.toFixed(6),lng:lng.toFixed(6),accuracy:Math.round(accuracy),address});setLocStatus("ok");
      },
      err=>{setLocStatus(err.code===1?"denied":"error");setLoc({address:err.code===1?"Access denied":"Unavailable"});},
      {enableHighAccuracy:true,timeout:10000,maximumAge:0}
    );
  };

  const myProjects=PROJECTS_LIST.filter(p=>user.projects.includes(p.id));

  const submit=()=>{
    if(!sig){alert("Please provide your signature.");return;}
    if(locStatus==="fetching"){alert("Capturing location, please wait.");return;}
    const r={userId:user.id,userName:user.name,projectId:proj,projectName:myProjects.find(p=>p.id===proj)?.title||"",type:mode,date:today(),time:timeNow(),sig,location:loc||{address:"Not captured"},locStatus};
    save(r);setLastRecord(r);setDone(true);
  };

  if(done&&lastRecord) return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:440,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",boxShadow:"0 8px 24px rgba(16,185,129,.3)"}}><I n="check" s={30} c="#fff"/></div>
          <div style={{fontSize:22,fontWeight:800,color:"#0f172a",fontFamily:"Inter,sans-serif",marginBottom:4}}>{lastRecord.type==="in"?"Signed In":"Signed Out"}</div>
          <div style={{fontSize:12,color:"#64748b",fontFamily:"Inter,sans-serif"}}>{lastRecord.time} · {lastRecord.date}</div>
        </div>
        <Card style={{marginBottom:14}}>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[{l:"Employee",v:lastRecord.userName},{l:"Project",v:lastRecord.projectName},{l:"Location",v:lastRecord.location?.address,sub:lastRecord.locStatus==="ok"?`±${lastRecord.location?.accuracy}m accuracy`:null,gps:lastRecord.locStatus==="ok"}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"8px 0",borderBottom:i<2?"1px solid #f1f5f9":"none"}}>
                <span style={{fontSize:11,color:"#94a3b8",textTransform:"uppercase",letterSpacing:.5,fontWeight:600,fontFamily:"Inter,sans-serif"}}>{r.l}</span>
                <div style={{textAlign:"right",maxWidth:"60%"}}>
                  <div style={{fontSize:13,color:"#0f172a",fontWeight:600,fontFamily:"Inter,sans-serif"}}>{r.v}</div>
                  {r.sub&&<div style={{fontSize:10,color:"#64748b",fontFamily:"Inter,sans-serif"}}>{r.sub}</div>}
                  {r.gps!==undefined&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:r.gps?"#dcfce7":"#fef3c7",color:r.gps?"#059669":"#92400e",fontWeight:700}}>{r.gps?"GPS ✓":"No GPS"}</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <button onClick={()=>{setDone(false);setMode(mode==="in"?"out":"in");setSig(null);setLastRecord(null);fetchLocation();}} style={{width:"100%",padding:"12px",background:"#0f172a",border:"none",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Done</button>
      </div>
    </div>
  );

  const locCfg={idle:{bg:"#f8fafc",bc:"#e2e8f0",dot:"#94a3b8",text:"#64748b",label:"Location not captured"},fetching:{bg:"#eff6ff",bc:"#93c5fd",dot:"#3b82f6",text:"#1d4ed8",label:"Capturing location…",pulse:true},ok:{bg:"#f0fdf4",bc:"#86efac",dot:"#22c55e",text:"#059669",label:"Location verified ✓"},denied:{bg:"#fefce8",bc:"#fde047",dot:"#f59e0b",text:"#92400e",label:"⚠ Location denied"},error:{bg:"#fff1f2",bc:"#fecdd3",dot:"#ef4444",text:"#dc2626",label:"⚠ Location unavailable"}}[locStatus]||{};

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <PageHeader title="Digital Sign In / Out" subtitle="Attendance recorded with signature and GPS location"/>
      <style>{`@keyframes locpulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}70%{box-shadow:0 0 0 8px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}`}</style>
      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1.1fr",gap:16,maxWidth:800}}>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Card>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:12,fontFamily:"Inter,sans-serif"}}>Today's Status</div>
            {[{l:"Date",v:new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})},{l:"Sign In",v:lastIn?.time||"—",c:lastIn?"#059669":undefined},{l:"Sign Out",v:lastOut?.time||"—",c:lastOut?"#059669":undefined},{l:"Status",badge:true,v:isIn?"On Site":"Off Site",bc:isIn?"#22c55e":"#94a3b8"}].map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<3?"1px solid #f1f5f9":"none",fontSize:13,fontFamily:"Inter,sans-serif"}}>
                <span style={{color:"#94a3b8"}}>{r.l}</span>
                {r.badge?<Badge label={r.v} color={r.bc}/>:<span style={{color:r.c||"#0f172a",fontWeight:r.c?600:400}}>{r.v}</span>}
              </div>
            ))}
          </Card>
          <Card>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Recent Records</div>
            {records.filter(r=>r.userId===user.id).length===0&&<div style={{fontSize:12,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>No records yet.</div>}
            {records.filter(r=>r.userId===user.id).slice(-5).reverse().map((r,i)=>(
              <div key={i} style={{padding:"7px 0",borderBottom:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:r.type==="in"?"#059669":"#d97706",fontWeight:600,fontSize:12}}>{r.type==="in"?"▲ IN":"▼ OUT"}</span>
                <span style={{fontSize:11,color:"#64748b",fontFamily:"Inter,sans-serif"}}>{r.date}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#0f172a",fontFamily:"Inter,sans-serif"}}>{r.time}</span>
                <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:r.locStatus==="ok"?"#dcfce7":"#fef3c7",color:r.locStatus==="ok"?"#059669":"#92400e",fontWeight:700}}>{r.locStatus==="ok"?"GPS":"—"}</span>
              </div>
            ))}
          </Card>
        </div>
        <Card>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:12,fontFamily:"Inter,sans-serif"}}>New Record</div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {["in","out"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"10px",borderRadius:7,cursor:"pointer",border:`1px solid ${mode===m?"#3b82f6":"#e2e8f0"}`,background:mode===m?"#eff6ff":"#f8fafc",color:mode===m?"#1d4ed8":"#64748b",fontWeight:mode===m?700:500,fontFamily:"Inter,sans-serif",fontSize:13,transition:"all .2s"}}>
                {m==="in"?"▲ Sign In":"▼ Sign Out"}
              </button>
            ))}
          </div>
          <div style={{fontSize:11,color:"#64748b",fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:6,fontFamily:"Inter,sans-serif"}}>Project</div>
          <select value={proj} onChange={e=>setProj(Number(e.target.value))} style={{...IS,marginBottom:12}}>
            {myProjects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <div style={{fontSize:11,color:"#64748b",fontWeight:600,letterSpacing:.5,textTransform:"uppercase",marginBottom:6,fontFamily:"Inter,sans-serif"}}>Location Stamp</div>
          <div style={{padding:"10px 12px",borderRadius:8,background:locCfg.bg,border:`1px solid ${locCfg.bc}`,borderLeft:`3px solid ${locCfg.dot}`,marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:locCfg.dot,flexShrink:0,animation:locCfg.pulse?"locpulse 1.4s infinite":undefined}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:locCfg.text,fontWeight:600,fontFamily:"Inter,sans-serif"}}>{locCfg.label}</div>
                {locStatus==="ok"&&loc&&<div style={{fontSize:10,color:"#475569",marginTop:2,fontFamily:"Inter,sans-serif"}}>{loc.address.substring(0,70)}{loc.address.length>70?"…":""}</div>}
              </div>
              {(locStatus==="denied"||locStatus==="error")&&<button onClick={fetchLocation} style={{padding:"4px 10px",borderRadius:5,border:`1px solid ${locCfg.bc}`,background:"#fff",color:locCfg.text,fontSize:10,cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0}}>Retry</button>}
            </div>
          </div>
          <SigPad label="Draw your signature" onSave={setSig} onClear={()=>setSig(null)}/>
          {sig&&<div style={{marginTop:8,padding:"7px 10px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderLeft:"3px solid #22c55e",borderRadius:6,fontSize:11,color:"#059669",fontWeight:600,fontFamily:"Inter,sans-serif"}}>✓ Signature captured</div>}
          <button onClick={submit} disabled={locStatus==="fetching"} style={{width:"100%",marginTop:12,padding:"12px",background:locStatus==="fetching"?"#94a3b8":"#0f172a",border:"none",borderRadius:8,color:"#fff",fontSize:14,fontWeight:600,cursor:locStatus==="fetching"?"not-allowed":"pointer",fontFamily:"Inter,sans-serif"}}>
            {locStatus==="fetching"?"Capturing location…":`Submit ${mode==="in"?"Sign In":"Sign Out"}`}
          </button>
          <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            <TynovaLogo size={16} />
            <span style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>Powered by <strong>TynovA Technologies</strong></span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── WEEKLY REPORTS ─────────────────────────────────────────── */
function Reports({reports,setReports,user}) {
  const isMobile=useIsMobile();
  const [sel,setSel]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",date:today(),author:user.name,plant:PLANTS[1],tags:"",summary:""});
  const [saving,setSaving]=useState(false);
  const [deleting,setDeleting]=useState(false);

  const saveReport=async()=>{
    if(!form.title||!form.summary)return;
    setSaving(true);
    const tags=form.tags.split(",").map(t=>t.trim()).filter(Boolean);
    const{data:inserted,error}=await DB.from("tsoa_reports").insert([{
      title:form.title, date:form.date, author:form.author,
      user_id:user.id, plant:form.plant, tags, summary:form.summary, pages:1
    }]).select().single();
    if(!error&&inserted){
      setReports(r=>[{...form,id:inserted.id,userId:user.id,tags,pages:1},...r]);
    } else {
      // Fallback: local
      setReports(r=>[{...form,id:Date.now(),userId:user.id,tags,pages:1},...r]);
    }
    setShowForm(false);
    setForm({title:"",date:today(),author:user.name,plant:PLANTS[1],tags:"",summary:""});
    setSaving(false);
  };

  const delReport=async(id)=>{
    if(!window.confirm("Delete this report?"))return;
    setDeleting(id);
    const{error}=await DB.from("tsoa_reports").delete().eq("id",id);
    if(!error){
      setReports(r=>r.filter(x=>x.id!==id));
      if(sel?.id===id)setSel(null);
    } else {
      setReports(r=>r.filter(x=>x.id!==id));
      if(sel?.id===id)setSel(null);
    }
    setDeleting(false);
  };

  const canDelete=(r)=> r.userId===user.id || r.author===user.name;

  if(sel) return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:8}}>
        <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontFamily:"Inter,sans-serif",fontSize:13,padding:0}}>← Back to Reports</button>
        {canDelete(sel)&&<button onClick={()=>delReport(sel.id)} disabled={deleting===sel.id} style={{padding:"7px 14px",borderRadius:7,background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",fontSize:12,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>{deleting===sel.id?"Deleting…":"🗑 Delete Report"}</button>}
      </div>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:6,fontFamily:"Inter,sans-serif"}}>{sel.title}</h1>
            <div style={{fontSize:12,color:"#64748b",fontFamily:"Inter,sans-serif"}}>📅 {formatDate(sel.date)} · ✍️ {sel.author} · 📍 {sel.plant}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(sel.tags||[]).map((t,i)=><Badge key={i} label={t} color="#3b82f6"/>)}</div>
        </div>
        <div style={{borderTop:"1px solid #f1f5f9",paddingTop:16}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Summary</div>
          <div style={{fontSize:13.5,color:"#334155",lineHeight:1.9,fontFamily:"Inter,sans-serif"}}>{sel.summary}</div>
        </div>
      </Card>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <PageHeader
        title="Weekly Reports"
        subtitle="Packaging operations summaries"
        actions={
          <button onClick={()=>setShowForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:showForm?"#f1f5f9":"#0f172a",border:showForm?"1px solid #e2e8f0":"none",borderRadius:8,color:showForm?"#64748b":"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif",transition:"all .2s"}}>
            <I n="plus" s={13} c={showForm?"#64748b":"#fff"}/> {showForm?"Cancel":"Add Report"}
          </button>
        }
      />

      {showForm&&(
        <Card style={{marginBottom:16,borderTop:"3px solid #0f172a"}}>
          <div style={{fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:14,fontFamily:"Inter,sans-serif"}}>New Weekly Report</div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
            <Field label="Report Title"><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Packaging Operations — Week X, YYYY" style={IS}/></Field>
            <Field label="Date"><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={IS}/></Field>
            <Field label="Author"><input value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} style={IS}/></Field>
            <Field label="Plant"><select value={form.plant} onChange={e=>setForm(f=>({...f,plant:e.target.value}))} style={IS}>{PLANTS.slice(1).map(p=><option key={p} value={p}>{p}</option>)}</select></Field>
            <Field label="Tags (comma separated)"><input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="CIP, Filler, QA" style={IS}/></Field>
          </div>
          <Field label="Summary"><textarea value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} placeholder="Write a summary of this week's packaging operations…" style={{...TA,minHeight:100}}/></Field>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={saveReport} disabled={!form.title||!form.summary||saving} style={{padding:"9px 20px",borderRadius:7,background:form.title&&form.summary&&!saving?"#0f172a":"#94a3b8",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:form.title&&form.summary&&!saving?"pointer":"not-allowed",fontFamily:"Inter,sans-serif"}}>{saving?"Saving…":"Save Report"}</button>
            <button onClick={()=>setShowForm(false)} style={{padding:"9px 16px",borderRadius:7,border:"1px solid #e2e8f0",background:"transparent",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
          </div>
        </Card>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {reports.map(r=>(
          <Card key={r.id} hover>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div onClick={()=>setSel(r)} style={{display:"flex",alignItems:"center",gap:14,flex:1,cursor:"pointer",minWidth:0}}>
                <div style={{width:42,height:42,borderRadius:9,background:"#eff6ff",border:"1px solid #dbeafe",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I n="reports" s={18} c="#3b82f6"/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#0f172a",fontFamily:"Inter,sans-serif",marginBottom:3}}>{r.title}</div>
                  <div style={{fontSize:11,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>{formatDate(r.date)} · {r.author} · {r.plant?.split(" — ")[0]}</div>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>{(r.tags||[]).slice(0,3).map((t,i)=><Badge key={i} label={t} color="#3b82f6" size={9}/>)}</div>
                <I n="chevron" s={14} c="#cbd5e1"/>
              </div>
              {canDelete(r)&&(
                <button onClick={e=>{e.stopPropagation();delReport(r.id);}} disabled={deleting===r.id}
                  style={{padding:"5px 9px",borderRadius:6,background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif",flexShrink:0}}>
                  {deleting===r.id?"…":"🗑"}
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── DOCUMENTS ─────────────────────────────────────────────── */
function Documents({documents,setDocuments,user}) {
  const isMobile=useIsMobile();
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:"",cat:"SOP",rev:"Rev 1",tags:"",desc:""});
  const [uploadedFile,setUploadedFile]=useState(null);
  const [saving,setSaving]=useState(false);
  const [deleting,setDeleting]=useState(null);
  const fileInputRef=useRef();

  const DOC_CATS=["SWI","SOP","Technical","Backup","Other"];
  const catColor={"SWI":"#22d3ee","SOP":"#3b82f6","Technical":"#8b5cf6","Backup":"#f97316","Other":"#64748b","Quality":"#10b981","Maintenance":"#f59e0b","Template":"#06b6d4"};
  const catEmoji={"SWI":"📋","SOP":"📘","Technical":"⚙️","Backup":"💾","Other":"📄","Quality":"✅","Maintenance":"🔧","Template":"📝"};

  const allCats=["All",...[...new Set([...DOC_CATS,...documents.map(d=>d.cat)])]];
  const filtered=documents.filter(d=>(cat==="All"||d.cat===cat)&&(d.title.toLowerCase().includes(search.toLowerCase())||(d.tags||[]).some(t=>t.toLowerCase().includes(search.toLowerCase()))));

  const handleFileUpload=(e)=>{
    const file=e.target.files[0];
    if(file){setUploadedFile(file);if(!form.title)setForm(f=>({...f,title:file.name.replace(/\.[^/.]+$/,"")}));}
  };

  const saveDoc=async()=>{
    if(!form.title)return;
    setSaving(true);
    const tags=form.tags.split(",").map(t=>t.trim()).filter(Boolean);
    const size=uploadedFile?`${(uploadedFile.size/1048576).toFixed(1)} MB`:"—";
    const{data:inserted,error}=await DB.from("tsoa_documents").insert([{
      title:form.title, cat:form.cat, rev:form.rev, date:today(), size,
      tags, uploader:user.name, user_id:user.id,
      file_name:uploadedFile?.name||null, description:form.desc
    }]).select().single();
    if(!error&&inserted){
      setDocuments(d=>[{...form,id:inserted.id,date:today(),size,tags,uploader:user.name,userId:user.id,fileName:uploadedFile?.name||null},...d]);
    } else {
      setDocuments(d=>[{...form,id:Date.now(),date:today(),size,tags,uploader:user.name,userId:user.id,fileName:uploadedFile?.name||null},...d]);
    }
    setShowForm(false);
    setForm({title:"",cat:"SOP",rev:"Rev 1",tags:"",desc:""});
    setUploadedFile(null);
    if(fileInputRef.current)fileInputRef.current.value="";
    setSaving(false);
  };

  const delDoc=async(id)=>{
    if(!window.confirm("Delete this document?"))return;
    setDeleting(id);
    const{error}=await DB.from("tsoa_documents").delete().eq("id",id);
    setDocuments(d=>d.filter(x=>x.id!==id));
    setDeleting(null);
  };

  const canDelete=(d)=> d.userId===user.id || d.uploader===user.name;

  return(
    <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"28px 28px 28px 24px"}}>
      <PageHeader
        title="Documents"
        subtitle="SOPs, SWIs, technical manuals and quality documents"
        actions={
          <button onClick={()=>setShowForm(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#0f172a",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
            <I n="plus" s={13} c="#fff"/> Add Document
          </button>
        }
      />

      {/* ── Upload Modal Popup ── */}
      {showForm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(3px)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget){setShowForm(false);setUploadedFile(null);}}}>
          <div style={{background:"#fff",borderRadius:16,width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.25)"}}>
            {/* Modal header */}
            <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#fff",zIndex:1}}>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:"#0f172a",fontFamily:"Inter,sans-serif"}}>Add New Document</div>
                <div style={{fontSize:11,color:"#64748b",fontFamily:"Inter,sans-serif",marginTop:2}}>Choose a category then fill in the details</div>
              </div>
              <button onClick={()=>{setShowForm(false);setUploadedFile(null);}} style={{width:30,height:30,borderRadius:8,background:"#f1f5f9",border:"1px solid #e2e8f0",color:"#64748b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
            </div>

            <div style={{padding:"20px 24px 24px"}}>
              {/* STEP 1 — Category selector (most prominent) */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,color:"#0f172a",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Step 1 — Select Document Category</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {DOC_CATS.map(c=>(
                    <div key={c} onClick={()=>setForm(f=>({...f,cat:c}))} style={{
                      display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"14px 10px",borderRadius:10,cursor:"pointer",
                      border:`2px solid ${form.cat===c?(catColor[c]||"#3b82f6"):"#e2e8f0"}`,
                      background:form.cat===c?`${catColor[c]||"#3b82f6"}10`:"#f8fafc",
                      transition:"all .15s"
                    }}>
                      <span style={{fontSize:22}}>{catEmoji[c]}</span>
                      <span style={{fontSize:12,fontWeight:form.cat===c?700:500,color:form.cat===c?(catColor[c]||"#3b82f6"):"#475569",fontFamily:"Inter,sans-serif",textAlign:"center"}}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{height:1,background:"#f1f5f9",marginBottom:20}}/>

              {/* STEP 2 — File upload */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,color:"#0f172a",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Step 2 — Select File <span style={{fontSize:10,color:"#94a3b8",fontWeight:400,letterSpacing:0,textTransform:"none"}}>(optional)</span></div>
                <div onClick={()=>fileInputRef.current?.click()} style={{border:"2px dashed #cbd5e1",borderRadius:9,padding:"18px",textAlign:"center",cursor:"pointer",background:uploadedFile?"#f0fdf4":"#f8fafc",borderColor:uploadedFile?"#86efac":"#cbd5e1",transition:"all .2s"}}>
                  <input ref={fileInputRef} type="file" style={{display:"none"}} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"/>
                  {uploadedFile?(
                    <div>
                      <div style={{fontSize:20,marginBottom:4}}>📄</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#059669",fontFamily:"Inter,sans-serif"}}>{uploadedFile.name}</div>
                      <div style={{fontSize:11,color:"#64748b",fontFamily:"Inter,sans-serif"}}>{(uploadedFile.size/1048576).toFixed(1)} MB · Click to change</div>
                    </div>
                  ):(
                    <div>
                      <I n="upload" s={22} c="#94a3b8"/>
                      <div style={{fontSize:13,color:"#64748b",marginTop:6,fontFamily:"Inter,sans-serif"}}>Click to select file</div>
                      <div style={{fontSize:11,color:"#94a3b8",marginTop:2,fontFamily:"Inter,sans-serif"}}>PDF, DOC, XLS, PPT supported</div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{height:1,background:"#f1f5f9",marginBottom:16}}/>

              {/* STEP 3 — Details */}
              <div style={{fontSize:11,color:"#0f172a",fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10,fontFamily:"Inter,sans-serif"}}>Step 3 — Document Details</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                <Field label="Document Title" style={{gridColumn:"1/-1"}}><input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. CIP SOP Line 3 Rev 4" style={IS}/></Field>
                <Field label="Revision"><input value={form.rev} onChange={e=>setForm(f=>({...f,rev:e.target.value}))} placeholder="Rev 1" style={IS}/></Field>
                <Field label="Tags (comma separated)"><input value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))} placeholder="CIP, Filler, Line 3" style={IS}/></Field>
              </div>
              <Field label="Description (optional)"><textarea value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="Brief description of this document…" style={{...TA,minHeight:60}}/></Field>

              {/* Actions */}
              <div style={{display:"flex",gap:8,marginTop:18}}>
                <button onClick={saveDoc} disabled={!form.title||saving} style={{flex:1,padding:"11px",borderRadius:8,background:form.title&&!saving?"#0f172a":"#94a3b8",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:form.title&&!saving?"pointer":"not-allowed",fontFamily:"Inter,sans-serif"}}>
                  {saving?"Saving…":"Add Document"}
                </button>
                <button onClick={()=>{setShowForm(false);setUploadedFile(null);}} style={{padding:"11px 18px",borderRadius:8,border:"1px solid #e2e8f0",background:"transparent",color:"#64748b",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents…" style={{...IS,flex:1,minWidth:180}}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {allCats.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:"7px 13px",borderRadius:6,border:`1px solid ${cat===c?(catColor[c]||"#3b82f6"):"#e2e8f0"}`,background:cat===c?`${catColor[c]||"#3b82f6"}10`:"transparent",color:cat===c?(catColor[c]||"#3b82f6"):"#64748b",fontSize:11.5,cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:cat===c?600:400,transition:"all .15s"}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:10}}>
        {filtered.map(d=>(
          <Card key={d.id} hover>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:40,height:40,borderRadius:9,background:`${catColor[d.cat]||"#3b82f6"}12`,border:`1px solid ${catColor[d.cat]||"#3b82f6"}25`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>
                {catEmoji[d.cat]||"📄"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:"#0f172a",marginBottom:5,lineHeight:1.4,fontFamily:"Inter,sans-serif"}}>{d.title}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:5}}>
                  <Badge label={d.cat} color={catColor[d.cat]||"#3b82f6"}/><Badge label={d.rev} color="#64748b"/>
                </div>
                <div style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>{formatDate(d.date)} · {d.size} · {d.uploader}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",flexShrink:0}}>
                {d.fileName&&<div style={{display:"flex",alignItems:"center"}}><I n="download" s={14} c="#3b82f6"/></div>}
                {canDelete(d)&&(
                  <button onClick={e=>{e.stopPropagation();delDoc(d.id);}} disabled={deleting===d.id}
                    style={{padding:"4px 8px",borderRadius:5,background:"#fff5f5",border:"1px solid #fecaca",color:"#dc2626",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>
                    {deleting===d.id?"…":"🗑"}
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px",color:"#94a3b8",fontSize:13,fontFamily:"Inter,sans-serif"}}>No documents found.</div>}
      </div>
    </div>
  );
}

/* ─── AI POPUP ──────────────────────────────────────────────── */
const SYS=`You are TSOA BrewPack AI, an expert packaging automation assistant for TSOA Technologies. You have deep expertise in brewery packaging lines including fillers, pasteurisers (PU = time × 1.393^(T-60)), bottle washers, packers, labellers, EBI systems, and CIP processes. Provide precise, technical, plant-engineering-level responses. Use 📋 to prefix case insights and 🔧 to prefix technical recommendations.`;

function AIPopup({onClose}) {
  const [msgs,setMsgs]=useState([]); const [inp,setInp]=useState(""); const [loading,setLoading]=useState(false);
  const hist=useRef([]); const bottom=useRef();
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);
  const send=async(text)=>{
    const q=(text||inp).trim(); if(!q) return;
    setInp(""); setMsgs(m=>[...m,{role:"user",content:q}]); setLoading(true);
    hist.current=[...hist.current,{role:"user",content:q}];
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYS,messages:hist.current})});
      const d=await r.json();
      const reply=d.content?.map(c=>c.text||"").join("")||"No response.";
      hist.current=[...hist.current,{role:"assistant",content:reply}];
      setMsgs(m=>[...m,{role:"assistant",content:reply}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",content:"Connection error. Please try again."}]);}
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",backdropFilter:"blur(3px)",display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:20,zIndex:1000}}>
      <div style={{width:440,height:"75vh",maxHeight:600,background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",borderBottom:"1px solid #f1f5f9"}}>
          <div style={{width:32,height:32,borderRadius:8,background:"#eff6ff",border:"1px solid #bfdbfe",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="ai" s={16} c="#1d4ed8"/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#0f172a",fontFamily:"Inter,sans-serif"}}>BrewPack AI</div>
            <div style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>Packaging Automation Assistant · TSOA Technologies</div>
          </div>
          <button onClick={onClose} style={{width:26,height:26,borderRadius:6,background:"#f1f5f9",border:"1px solid #e2e8f0",color:"#64748b",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="xmark" s={12} c="#64748b"/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:8}}>
          {msgs.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:12,color:"#94a3b8",marginBottom:12,fontFamily:"Inter,sans-serif",lineHeight:1.7}}>Ask anything about brewery packaging lines</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
                {["EBI false reject rate","Pasteuriser PU deviation","Filler CIP issue","Labeller fault diagnosis"].map((s,i)=>(
                  <button key={i} onClick={()=>send(s)} style={{padding:"5px 12px",borderRadius:14,background:"#f1f5f9",border:"1px solid #e2e8f0",color:"#475569",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"88%",padding:"9px 13px",fontSize:12.5,lineHeight:1.8,borderRadius:m.role==="user"?"12px 12px 3px 12px":"3px 12px 12px 12px",background:m.role==="user"?"#1d4ed8":"#f1f5f9",color:m.role==="user"?"#fff":"#334155",whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"Inter,sans-serif"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading&&<div style={{color:"#94a3b8",fontSize:12,padding:"6px 2px",fontFamily:"Inter,sans-serif"}}>Thinking…</div>}
          <div ref={bottom}/>
        </div>
        <div style={{padding:"10px 14px",borderTop:"1px solid #f1f5f9",display:"flex",gap:7}}>
          <textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask about any packaging machine…" rows={1} style={{flex:1,resize:"none",padding:"9px 11px",borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",color:"#0f172a",fontSize:12.5,fontFamily:"Inter,sans-serif",outline:"none"}}/>
          <button onClick={()=>send()} disabled={loading||!inp.trim()} style={{width:36,height:36,borderRadius:8,background:"#0f172a",border:"none",color:"#fff",cursor:"pointer",opacity:(loading||!inp.trim())?0.4:1,display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"center"}}><I n="send" s={14} c="#fff"/></button>
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN CONSOLE ──────────────────────────────────────────── */
function AdminConsole({user,problems,setProblems,projects,setProjects,documents,setDocuments,reports,setReports}) {
  const isMobile=useIsMobile();
  const [tab,setTab]=useState("overview");
  const [signins,setSignins]=useState(()=>{try{return JSON.parse(localStorage.getItem("tsoa_signin")||"[]");}catch{return [];}});
  const [alerts,setAlerts]=useState([
    {id:1,type:"warning",msg:"2 critical problems unresolved for >7 days",time:"09:00",read:false},
    {id:2,type:"info",msg:"EBI calibration due this week on Line 2",time:"09:45",read:false},
    {id:3,type:"critical",msg:"Pasteuriser Zone 3 verification audit pending",time:"10:00",read:false},
  ]);
  const [showProjForm,setShowProjForm]=useState(false);
  const [projForm,setProjForm]=useState({title:"",plant:PLANTS[1],status:"Planning",priority:"Medium",start:today(),end:"",lead:"",scope:"",problemDesc:"",rootCause:"",loopClosure:""});
  const clk=useClock();
  const unread=alerts.filter(a=>!a.read).length;

  const empStats=USERS.filter(u=>u.id!==5).map(u=>{
    const recs=signins.filter(r=>r.userId===u.id);
    const todayRecs=recs.filter(r=>r.date===today());
    const lastIn=todayRecs.filter(r=>r.type==="in").slice(-1)[0];
    const lastOut=todayRecs.filter(r=>r.type==="out").slice(-1)[0];
    return{...u,recs,isActive:!!(lastIn&&!lastOut),lastIn,lastOut,todayDur:lastIn&&lastOut?"Active":lastIn?"On Site":"—"};
  });

  const ATABS=[{key:"overview",label:"Overview",icon:"dashboard"},{key:"staff",label:"Staff",icon:"user"},{key:"logins",label:"Logins",icon:"clock"},{key:"projects",label:"Projects",icon:"projects"},{key:"problems",label:"Problems",icon:"tracker"},{key:"alerts",label:"Alerts",icon:"bell",badge:unread}];

  const saveProjForm=()=>{
    if(!projForm.title||!projForm.plant||!projForm.lead)return;
    const newP={...projForm,id:Date.now(),progress:0,assignees:[],whys:["","","","",""],actions:[],};
    setProjects(p=>[...p,newP]);
    // Add to user's projects — in real app would update user record
    setShowProjForm(false);setProjForm({title:"",plant:PLANTS[1],status:"Planning",priority:"Medium",start:today(),end:"",lead:"",scope:"",problemDesc:"",rootCause:"",loopClosure:""});
  };

  const DCard=({children,style={}})=><div style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"20px 22px",...style}}>{children}</div>;
  const Hd=({t})=><div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14,fontFamily:"Inter,sans-serif",display:"flex",alignItems:"center",gap:8}}><div style={{width:3,height:16,borderRadius:2,background:"#3b82f6"}}/>{t}</div>;

  return(
    <div style={{flex:1,minHeight:"100vh",display:"flex",flexDirection:"column",background:"#0a0f1e",fontFamily:"Inter,sans-serif"}}>
      {/* Header */}
      <div style={{padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,.08)",background:"rgba(0,0,0,.2)",display:"flex",alignItems:"center",gap:10,flexShrink:0,flexWrap:"wrap"}}>
        <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#3b82f6,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center"}}><I n="admin" s={17} c="#fff"/></div>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:"#fff",lineHeight:1,fontFamily:"Inter,sans-serif"}}>Admin Console</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:1,textTransform:"uppercase",marginTop:1}}>System Administrator — TSOA PMS</div>
        </div>
        <div style={{flex:1}}/>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:18,fontFamily:"DM Mono,monospace",color:"#fff"}}>{clk.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{clk.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</div>
        </div>
      </div>
      {/* Sub nav */}
      <div style={{padding:"0 24px",background:"rgba(0,0,0,.15)",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",gap:0,overflowX:"auto",flexShrink:0}}>
        {ATABS.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{display:"flex",alignItems:"center",gap:6,padding:"12px 16px",border:"none",cursor:"pointer",fontFamily:"Inter,sans-serif",fontWeight:500,fontSize:12,background:"transparent",color:tab===t.key?"#fff":"rgba(255,255,255,.4)",borderBottom:`2px solid ${tab===t.key?"#3b82f6":"transparent"}`,whiteSpace:"nowrap",transition:"all .15s"}}>
            <I n={t.icon} s={13} c={tab===t.key?"#60a5fa":"rgba(255,255,255,.35)"}/>{t.label}
            {t.badge>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:9,padding:"1px 5px",borderRadius:8,fontWeight:700}}>{t.badge}</span>}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:isMobile?"16px":"24px"}}>
        {tab==="overview"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {l:"Total Staff",v:USERS.length-1,c:"#3b82f6",i:"user"},
                {l:"Active Now",v:empStats.filter(e=>e.isActive).length,c:"#10b981",i:"signin"},
                {l:"Open Problems",v:problems.filter(p=>p.status==="Open"||p.status==="Investigating").length,c:"#f97316",i:"tracker"},
                {l:"Total Projects",v:projects.length,c:"#8b5cf6",i:"projects"},
              ].map((s,i)=>(
                <div key={i} style={{padding:"16px 18px",borderRadius:10,background:"rgba(255,255,255,.05)",border:`1px solid rgba(255,255,255,.08)`,borderLeft:`3px solid ${s.c}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><I n={s.i} s={16} c={s.c}/><div style={{width:6,height:6,borderRadius:"50%",background:s.c}}/></div>
                  <div style={{fontSize:28,fontWeight:800,color:"#fff",fontFamily:"Inter,sans-serif",letterSpacing:"-1px"}}>{s.v}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:4}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1.3fr 1fr",gap:16}}>
              <DCard>
                <Hd t="Staff Status"/>
                {empStats.map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:6,cursor:"pointer"}}
                    onClick={()=>setTab("staff")}>
                    <Avatar initials={e.avatar} size={30}/>
                    <div style={{flex:1}}><div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{e.name}</div><div style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{e.role}</div></div>
                    <div style={{textAlign:"right",fontSize:11}}><div style={{color:"rgba(255,255,255,.6)",fontWeight:600}}>{e.lastIn?.time||"—"}</div></div>
                    <span style={{padding:"2px 9px",borderRadius:12,fontSize:9,fontWeight:700,background:e.isActive?"rgba(16,185,129,.15)":"rgba(255,255,255,.05)",color:e.isActive?"#34d399":"rgba(255,255,255,.3)",border:`1px solid ${e.isActive?"rgba(16,185,129,.2)":"rgba(255,255,255,.06)"}`}}>{e.isActive?"● ON SITE":"OFFLINE"}</span>
                  </div>
                ))}
              </DCard>
              <DCard>
                <Hd t="Recent Sign-ins"/>
                {[...signins].reverse().slice(0,8).map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<7?"1px solid rgba(255,255,255,.04)":"none"}}>
                    <div style={{width:24,height:24,borderRadius:6,background:r.type==="in"?"rgba(16,185,129,.12)":"rgba(245,158,11,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <I n={r.type==="in"?"signin":"logout"} s={11} c={r.type==="in"?"#34d399":"#fbbf24"}/>
                    </div>
                    <div style={{flex:1}}><span style={{fontSize:11,fontWeight:500,color:"#e2e8f0"}}>{r.userName}</span><span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}> · {r.type}</span></div>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.3)"}}>{r.time}</span>
                  </div>
                ))}
                {signins.length===0&&<div style={{textAlign:"center",padding:"24px 0",color:"rgba(255,255,255,.3)",fontSize:12}}>No records yet</div>}
              </DCard>
            </div>
          </div>
        )}

        {tab==="staff"&&(
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:12}}>
            {empStats.map(e=>{
              const myProbs=problems.filter(p=>p.foundBy===e.name);
              return(
                <DCard key={e.id}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                    <Avatar initials={e.avatar} size={44}/>
                    <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{e.name}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{e.role} · {e.dept}</div></div>
                    <span style={{padding:"3px 10px",borderRadius:12,fontSize:9,fontWeight:800,background:e.isActive?"rgba(16,185,129,.15)":"rgba(71,85,105,.3)",color:e.isActive?"#34d399":"rgba(255,255,255,.3)"}}>{e.isActive?"● ACTIVE":"OFFLINE"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                    {[{l:"Sign-ins",v:e.recs.filter(r=>r.type==="in").length,c:"#3b82f6"},{l:"Projects",v:e.projects.length,c:"#8b5cf6"},{l:"Issues",v:myProbs.length,c:myProbs.length>0?"#f97316":"#10b981"}].map((s,i)=>(
                      <div key={i} style={{padding:"10px",borderRadius:8,textAlign:"center",background:`${s.c}12`,border:`1px solid ${s.c}20`}}>
                        <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.4)"}}>
                    <span>Today in: <strong style={{color:"rgba(255,255,255,.7)"}}>{e.lastIn?.time||"—"}</strong></span>
                    <span>Today out: <strong style={{color:"rgba(255,255,255,.7)"}}>{e.lastOut?.time||"—"}</strong></span>
                  </div>
                </DCard>
              );
            })}
          </div>
        )}

        {tab==="logins"&&(
          <DCard>
            <Hd t="Login History"/>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{borderBottom:"1px solid rgba(255,255,255,.08)"}}>
                  {["Employee","Date","Time","Type","Project","GPS"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:.8}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[...signins].reverse().map((r,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,.04)",background:i%2===0?"transparent":"rgba(255,255,255,.02)"}}>
                      <td style={{padding:"9px 12px",fontSize:12,color:"#e2e8f0",fontWeight:500}}>{r.userName}</td>
                      <td style={{padding:"9px 12px",fontSize:11,color:"rgba(255,255,255,.4)"}}>{r.date}</td>
                      <td style={{padding:"9px 12px",fontSize:12,color:"rgba(255,255,255,.7)",fontWeight:600,fontFamily:"DM Mono,monospace"}}>{r.time}</td>
                      <td style={{padding:"9px 12px"}}><span style={{padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:700,background:r.type==="in"?"rgba(16,185,129,.15)":"rgba(245,158,11,.15)",color:r.type==="in"?"#34d399":"#fbbf24"}}>{r.type.toUpperCase()}</span></td>
                      <td style={{padding:"9px 12px",fontSize:11,color:"rgba(255,255,255,.4)",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.projectName||"—"}</td>
                      <td style={{padding:"9px 12px"}}><span style={{padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:700,background:r.locStatus==="ok"?"rgba(16,185,129,.15)":"rgba(245,158,11,.15)",color:r.locStatus==="ok"?"#34d399":"#fbbf24"}}>{r.locStatus==="ok"?"✓ GPS":"✗"}</span></td>
                    </tr>
                  ))}
                  {signins.length===0&&<tr><td colSpan={6} style={{textAlign:"center",padding:"40px 0",color:"rgba(255,255,255,.3)",fontSize:13}}>No records yet</td></tr>}
                </tbody>
              </table>
            </div>
          </DCard>
        )}

        {tab==="projects"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>All Projects ({projects.length})</div>
              <button onClick={()=>setShowProjForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"#0f172a",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"Inter,sans-serif"}}><I n="plus" s={13} c="#fff"/> Add Project</button>
            </div>
            {showProjForm&&(
              <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderTop:"2px solid #3b82f6",borderRadius:10,padding:20,marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>New Project</div>
                <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:12}}>
                  {[{l:"Project Title",k:"title",ph:"e.g. CIP Optimisation"},{l:"Lead Engineer",k:"lead",ph:"Name"},{l:"Start Date",k:"start",t:"date"},{l:"End Date",k:"end",t:"date"}].map(f=>(
                    <div key={f.k}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:5}}>{f.l}</div>
                      <input type={f.t||"text"} value={projForm[f.k]||""} onChange={e=>setProjForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.ph} style={{width:"100%",padding:"9px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.07)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif"}}/>
                    </div>
                  ))}
                  <div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:5}}>Plant</div>
                    <select value={projForm.plant} onChange={e=>setProjForm(p=>({...p,plant:e.target.value}))} style={{width:"100%",padding:"9px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"rgba(15,23,42,.9)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif"}}>{PLANTS.slice(1).map(p=><option key={p} value={p}>{p}</option>)}</select>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:5}}>Priority</div>
                    <select value={projForm.priority} onChange={e=>setProjForm(p=>({...p,priority:e.target.value}))} style={{width:"100%",padding:"9px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"rgba(15,23,42,.9)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif"}}>{["Critical","High","Medium","Low"].map(x=><option key={x} value={x}>{x}</option>)}</select>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:.8,textTransform:"uppercase",marginBottom:5}}>Scope / Description</div>
                  <textarea value={projForm.scope||""} onChange={e=>setProjForm(p=>({...p,scope:e.target.value}))} placeholder="Project scope and objectives…" style={{width:"100%",padding:"9px 11px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.07)",color:"#fff",fontSize:13,fontFamily:"Inter,sans-serif",resize:"vertical",minHeight:80,lineHeight:1.7}}/>
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button onClick={saveProjForm} disabled={!projForm.title||!projForm.lead} style={{padding:"9px 20px",borderRadius:7,background:projForm.title&&projForm.lead?"#0f172a":"#475569",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:projForm.title&&projForm.lead?"pointer":"not-allowed",fontFamily:"Inter,sans-serif"}}>Create Project</button>
                  <button onClick={()=>setShowProjForm(false)} style={{padding:"9px 16px",borderRadius:7,border:"1px solid rgba(255,255,255,.1)",background:"transparent",color:"rgba(255,255,255,.5)",fontSize:13,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {projects.map(p=>(
                <div key={p.id} style={{padding:"14px 18px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderLeft:`3px solid ${STATUS_COLOR[p.status]||"#64748b"}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{padding:"2px 8px",borderRadius:4,background:`${STATUS_COLOR[p.status]}20`,color:STATUS_COLOR[p.status],fontSize:10,fontWeight:700}}>{p.status}</span>
                        <span style={{padding:"2px 8px",borderRadius:4,background:`${PRIORITY_COLOR[p.priority]}20`,color:PRIORITY_COLOR[p.priority],fontSize:10,fontWeight:700}}>{p.priority}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{p.plant}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:600,color:"#e2e8f0",marginBottom:4}}>{p.title}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>Lead: <strong style={{color:"rgba(255,255,255,.6)"}}>{p.lead}</strong> · {formatDate(p.start)} → {formatDate(p.end)}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:22,fontWeight:800,color:STATUS_COLOR[p.status]||"#64748b",fontFamily:"Inter,sans-serif",letterSpacing:"-1px"}}>{p.progress}%</div>
                      <div style={{marginTop:4,width:80}}><ProgressBar pct={p.progress} color={STATUS_COLOR[p.status]||"#64748b"}/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="problems"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
              {PROB_STATUSES.map(s=><div key={s} style={{padding:"14px",borderRadius:10,textAlign:"center",background:`${PSTAT_COLOR[s]}10`,border:`1px solid ${PSTAT_COLOR[s]}20`,borderLeft:`3px solid ${PSTAT_COLOR[s]}`}}>
                <div style={{fontSize:26,fontWeight:800,color:PSTAT_COLOR[s]}}>{problems.filter(p=>p.status===s).length}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:3,textTransform:"uppercase",letterSpacing:.5}}>{s}</div>
              </div>)}
            </div>
            <DCard>
              <Hd t="All Problems"/>
              {problems.map((p,i)=>(
                <div key={p.id} style={{padding:"12px 14px",borderRadius:8,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderLeft:`3px solid ${SEV_COLOR[p.severity]}`,marginBottom:8}}>
                  <div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                    <span style={{padding:"2px 8px",borderRadius:4,background:`${SEV_COLOR[p.severity]}15`,color:SEV_COLOR[p.severity],fontSize:10,fontWeight:700}}>{p.severity}</span>
                    <span style={{padding:"2px 8px",borderRadius:4,background:`${PSTAT_COLOR[p.status]}15`,color:PSTAT_COLOR[p.status],fontSize:10,fontWeight:700}}>{p.status}</span>
                    <span style={{fontSize:10,color:"rgba(255,255,255,.35)"}}>{p.plant} · {p.machine}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",marginBottom:3}}>{p.title}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>by {p.foundBy} · {p.date}</div>
                </div>
              ))}
            </DCard>
          </div>
        )}

        {tab==="alerts"&&(
          <DCard>
            <Hd t="System Alerts"/>
            {alerts.map(a=>{
              const c={warning:{c:"#f59e0b",bg:"rgba(245,158,11,.1)"},critical:{c:"#ef4444",bg:"rgba(239,68,68,.1)"},info:{c:"#3b82f6",bg:"rgba(59,130,246,.1)"}}[a.type]||{c:"#64748b",bg:"rgba(100,116,139,.1)"};
              return(
                <div key={a.id} style={{padding:"12px 16px",borderRadius:8,background:a.read?"rgba(255,255,255,.02)":c.bg,border:`1px solid ${a.read?"rgba(255,255,255,.05)":c.c+"30"}`,borderLeft:`3px solid ${a.read?"rgba(255,255,255,.08)":c.c}`,marginBottom:8,opacity:a.read?0.6:1,transition:"opacity .2s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <I n="alert" s={15} c={a.read?"rgba(255,255,255,.2)":c.c}/>
                    <div style={{flex:1}}><div style={{fontSize:13,color:a.read?"rgba(255,255,255,.3)":"#e2e8f0",fontWeight:500}}>{a.msg}</div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2}}>{a.time}</div></div>
                    {!a.read&&<button onClick={()=>setAlerts(al=>al.map(x=>x.id===a.id?{...x,read:true}:x))} style={{padding:"4px 10px",borderRadius:6,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer",fontFamily:"Inter,sans-serif"}}>Dismiss</button>}
                  </div>
                </div>
              );
            })}
          </DCard>
        )}
      </div>
    </div>
  );
}

/* ─── SEARCH OVERLAY ─────────────────────────────────────────── */
function SearchOverlay({search,problems,setPage,setActiveProject,onClose,projects}) {
  if(!search||search.length<2) return null;
  const q=search.toLowerCase();
  const projR=projects.filter(p=>p.title.toLowerCase().includes(q)||p.plant.toLowerCase().includes(q));
  const probR=problems.filter(p=>p.title.toLowerCase().includes(q));
  const docR=INIT_DOCUMENTS.filter(d=>d.title.toLowerCase().includes(q));
  const total=projR.length+probR.length+docR.length;
  return(
    <div style={{position:"fixed",top:0,left:220,right:0,bottom:0,zIndex:50,background:"rgba(0,0,0,.4)",backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{margin:"60px auto",maxWidth:560,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"12px 18px",borderBottom:"1px solid #f1f5f9",fontSize:12,color:"#64748b",fontFamily:"Inter,sans-serif"}}>{total} result{total!==1?"s":""} for "<span style={{color:"#1d4ed8",fontWeight:600}}>{search}</span>"</div>
        <div style={{maxHeight:380,overflowY:"auto"}}>
          {projR.length>0&&<><div style={{padding:"8px 18px 4px",fontSize:10,color:"#94a3b8",letterSpacing:1,textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>Projects</div>
          {projR.map(p=><div key={p.id} onClick={()=>{setActiveProject(p);setPage("project-detail");onClose();}} style={{padding:"10px 18px",cursor:"pointer",display:"flex",gap:10,alignItems:"center",borderBottom:"1px solid #f8fafc"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <I n="folder" s={13} c="#64748b"/><div><div style={{fontSize:13,color:"#0f172a",fontWeight:500,fontFamily:"Inter,sans-serif"}}>{p.title}</div><div style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>{p.plant}</div></div>
          </div>)}</>}
          {probR.length>0&&<><div style={{padding:"8px 18px 4px",fontSize:10,color:"#94a3b8",letterSpacing:1,textTransform:"uppercase",fontFamily:"Inter,sans-serif"}}>Problems</div>
          {probR.map(p=><div key={p.id} onClick={()=>{setPage("problems");onClose();}} style={{padding:"10px 18px",cursor:"pointer",display:"flex",gap:10,alignItems:"center",borderBottom:"1px solid #f8fafc"}} onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <I n="tracker" s={13} c="#64748b"/><div><div style={{fontSize:13,color:"#0f172a",fontWeight:500,fontFamily:"Inter,sans-serif"}}>{p.title}</div><div style={{fontSize:10,color:"#94a3b8",fontFamily:"Inter,sans-serif"}}>{p.machine}</div></div>
          </div>)}</>}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function App() {
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [activeProject,setActiveProject]=useState(null);
  const [showAI,setShowAI]=useState(false);
  const [problems,setProblems]=useState(INIT_PROBLEMS);
  const [projects,setProjects]=useState(INIT_PROJECTS);
  const [documents,setDocuments]=useState(INIT_DOCUMENTS);
  const [reports,setReports]=useState(INIT_REPORTS);
  const [search,setSearch]=useState("");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [dbReady,setDbReady]=useState(false);
  const isMobile=useIsMobile();
  const logout=()=>{setUser(null);setPage("dashboard");setSearch("");};

  /* ── Load all live data from Supabase on login ── */
  useEffect(()=>{
    if(!user)return;
    let probSub,repSub,docSub;

    const load=async()=>{
      // Problems
      const{data:pd}=await DB.from("tsoa_problems").select("*").order("created_at",{ascending:false});
      if(pd?.length) setProblems(pd.map(r=>({
        id:r.id, title:r.title, description:r.description, severity:r.severity,
        status:r.status, plant:r.plant, machine:r.machine, foundBy:r.found_by,
        userId:r.user_id, date:r.date, rootCause:r.root_cause, solution:r.solution,
        immediateActions:r.immediate_actions, outcome:r.outcome, loopClosure:r.loop_closure,
        createdAt:r.created_at
      })));

      // Reports
      const{data:rd}=await DB.from("tsoa_reports").select("*").order("created_at",{ascending:false});
      if(rd?.length) setReports(rd.map(r=>({
        id:r.id, title:r.title, date:r.date, author:r.author,
        userId:r.user_id, plant:r.plant, tags:r.tags||[], summary:r.summary, pages:r.pages||1
      })));

      // Documents
      const{data:dd}=await DB.from("tsoa_documents").select("*").order("created_at",{ascending:false});
      if(dd?.length) setDocuments(dd.map(r=>({
        id:r.id, title:r.title, cat:r.cat, rev:r.rev, date:r.date, size:r.size,
        tags:r.tags||[], uploader:r.uploader, userId:r.user_id,
        fileName:r.file_name, desc:r.desc
      })));

      setDbReady(true);
    };
    load();

    // Real-time subscriptions — keep all clients in sync
    probSub=DB.channel("tsoa_problems_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"tsoa_problems"},()=>load())
      .subscribe();
    repSub=DB.channel("tsoa_reports_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"tsoa_reports"},()=>load())
      .subscribe();
    docSub=DB.channel("tsoa_documents_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"tsoa_documents"},()=>load())
      .subscribe();

    return()=>{
      DB.removeChannel(probSub);
      DB.removeChannel(repSub);
      DB.removeChannel(docSub);
    };
  },[user]);

  // When a new project is created, add it to all users' visible projects
  const handleSetProjects=(fn)=>{
    setProjects(prev=>{
      const next=typeof fn==="function"?fn(prev):fn;
      return next;
    });
  };

  const CSS=`
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f1f5f9;color:#0f172a;min-height:100vh;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-family:Inter,sans-serif}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
    ::-webkit-scrollbar-thumb:hover{background:#94a3b8}
    button{cursor:pointer;font-family:Inter,sans-serif}
    input,select,textarea{outline:none;box-sizing:border-box;font-family:Inter,sans-serif}
    select option{background:#fff;color:#0f172a}
    input:focus,select:focus,textarea:focus{border-color:#3b82f6 !important;box-shadow:0 0 0 3px rgba(59,130,246,.1) !important}
    ::selection{background:rgba(59,130,246,.15)}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    @keyframes locpulse{0%{box-shadow:0 0 0 0 rgba(59,130,246,.5)}70%{box-shadow:0 0 0 8px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}}
    a{color:#1d4ed8;text-decoration:none}
    canvas{touch-action:none}
  `;

  if(!user) return(
    <>
      <style>{FONT_LINK}{CSS}</style>
      <Login onLogin={setUser}/>
    </>
  );

  // All projects visible to this user (own + newly admin-created ones)
  const visibleProjects = user.id===5 ? projects : projects.filter(p=>user.projects.includes(p.id)||INIT_PROJECTS.every(ip=>ip.id!==p.id));

  return(
    <>
      <style>{FONT_LINK}{CSS}</style>
      <div style={{display:"flex",minHeight:"100vh",background:"#f1f5f9"}}>
        <Sidebar page={page} setPage={p=>{setPage(p);setActiveProject(null);setSearch("");}} user={user}
          onLogout={logout} setShowAI={setShowAI} problems={problems}
          search={search} setSearch={setSearch} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,minHeight:"100vh"}}>
          {isMobile&&<MobileTopBar page={page} setPage={p=>{setPage(p);setActiveProject(null);}} setSidebarOpen={setSidebarOpen} problems={problems} user={user}/>}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {page==="dashboard"&&<Dashboard user={user} setPage={setPage} setActiveProject={setActiveProject} problems={problems} projects={visibleProjects}/>}
            {page==="projects"&&<ProjectsList user={user} setPage={setPage} setActiveProject={setActiveProject} projects={visibleProjects}/>}
            {page==="project-detail"&&activeProject&&<ProjectDetail project={activeProject} onBack={()=>setPage("projects")}/>}
            {page==="problems"&&<ProblemLog user={user} problems={problems} setProblems={setProblems}/>}
            {page==="signin"&&<SignInOut user={user}/>}
            {page==="reports"&&<Reports reports={reports} setReports={setReports} user={user}/>}
            {page==="documents"&&<Documents documents={documents} setDocuments={setDocuments} user={user}/>}
            {page==="admin"&&user?.role==="System Administrator"&&<AdminConsole user={user} problems={problems} setProblems={setProblems} projects={projects} setProjects={handleSetProjects} documents={documents} setDocuments={setDocuments} reports={reports} setReports={setReports}/>}
          </div>
        </div>
      </div>
      {search.length>=2&&<SearchOverlay search={search} problems={problems} setPage={p=>{setPage(p);setActiveProject(null);}} setActiveProject={setActiveProject} onClose={()=>setSearch("")} projects={projects}/>}
      {showAI&&<AIPopup onClose={()=>setShowAI(false)}/>}
      {!showAI&&<button onClick={()=>setShowAI(true)} style={{position:"fixed",bottom:24,right:24,width:48,height:48,borderRadius:"50%",background:"#0f172a",border:"none",boxShadow:"0 4px 20px rgba(15,23,42,.5)",color:"#fff",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <I n="ai" s={20} c="#fff"/>
      </button>}
    </>
  );
}
