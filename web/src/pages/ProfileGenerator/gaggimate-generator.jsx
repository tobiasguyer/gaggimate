import { useState, useMemo, useRef, useContext, useEffect } from "preact/hooks";
import { ApiServiceContext, machine } from '../../services/ApiService';

import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import { ExtendedProfileChart } from '../../components/ExtendedProfileChart.jsx';
import { ExtendedRadarChart } from '../../components/RadarChart.jsx';
import { computed } from '@preact/signals';
import timeline from "daisyui/components/timeline";
// Register chart components
Chart.register(
  LineController,
  TimeScale,
  LinearScale,
  CategoryScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
);
const connected = computed(() => machine.value.connected);

// ─── Design Tokens ────────────────────────────────────────────────
const T = {
  bg: 'var(--color-base-100)',
  surf: 'var(--color-base-200)',
  panel: 'var(--color-base-200)',
  card: 'var(--color-base-300)',
  border: 'color-mix(in srgb, var(--color-base-content) 10%, transparent)',
  borderHi: 'color-mix(in srgb, var(--color-base-content) 18%, transparent)',
  text: 'var(--color-base-content)',
  muted: 'color-mix(in srgb, var(--color-base-content) 55%, transparent)',
  dim: 'color-mix(in srgb, var(--color-base-content) 35%, transparent)',
  accent: 'var(--color-accent)',
  accentLt: 'var(--color-accent-content, var(--color-accent))',
  accentBg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  accentBd: 'color-mix(in srgb, var(--color-accent) 38%, transparent)',
  brown: 'var(--statistics-trend-shots-brown)',

  blue: 'var(--analyzer-pressure-text)',
  orange: 'var(--analyzer-temp-text)',
  purple: 'var(--color-secondary)',
  green: 'var(--analyzer-flow-text)'
};
const MONO = { fontFamily: 'ui-monospace, "Cascadia Code", monospace' };

// ─── Constants & Metadata Matrices ───────────────────────────────
const ROAST_LABELS = ['Ultra Light', 'Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
const AGE_LABELS = ['Fresh', 'Rested', 'Old'];
const PROCESSING = ['Washed', 'Natural', 'Honey', 'Pulped Nat.', 'Anaerobic', 'Monsooned'];
const AXES = ['Acidity', 'Sweetness', 'Bitterness', 'Body', 'Clarity', 'Fruitiness', 'Chocolate', 'Roastiness', 'Crema', 'Floral'];

const ARCHETYPE_TENDencies = {
  'Traditional Italian': { Acidity: 3, Sweetness: 5, Bitterness: 7, Body: 9, Clarity: 2, Fruitiness: 3, Chocolate: 9, Roastiness: 8, Crema: 9, Floral: 2 },
  'Modern Sweet': { Acidity: 6, Sweetness: 9, Bitterness: 4, Body: 6, Clarity: 7, Fruitiness: 7, Chocolate: 5, Roastiness: 4, Crema: 5, Floral: 6 },
  'Lever Style': { Acidity: 5, Sweetness: 8, Bitterness: 4, Body: 7, Clarity: 6, Fruitiness: 6, Chocolate: 6, Roastiness: 5, Crema: 7, Floral: 8 },
  'Nordic Clarity': { Acidity: 9, Sweetness: 6, Bitterness: 2, Body: 3, Clarity: 10, Fruitiness: 9, Chocolate: 2, Roastiness: 2, Crema: 2, Floral: 9 },
  'Turbo Shot': { Acidity: 7, Sweetness: 5, Bitterness: 3, Body: 4, Clarity: 8, Fruitiness: 7, Chocolate: 3, Roastiness: 3, Crema: 4, Floral: 7 },
  'Syrupy Body': { Acidity: 4, Sweetness: 7, Bitterness: 5, Body: 10, Clarity: 3, Fruitiness: 4, Chocolate: 8, Roastiness: 6, Crema: 8, Floral: 4 },
  'Café Allrounder': { Acidity: 5, Sweetness: 6, Bitterness: 5, Body: 6, Clarity: 6, Fruitiness: 5, Chocolate: 6, Roastiness: 5, Crema: 6, Floral: 5 },
  'Adaptive Dynamic': { Acidity: 6, Sweetness: 7, Bitterness: 5, Body: 7, Clarity: 6, Fruitiness: 6, Chocolate: 5, Roastiness: 5, Crema: 6, Floral: 6 },
};

const ARCHETYPES = [
  { id: 'Traditional Italian', tag: 'High pressure · classic crema' },
  { id: 'Modern Sweet', tag: 'Smooth ramp · sweetness-first' },
  { id: 'Lever Style', tag: 'Long bloom · pressure decline' },
  { id: 'Nordic Clarity', tag: 'Low pressure · pure flow-driven' },
  { id: 'Turbo Shot', tag: 'Fast & high-flow extraction' },
  { id: 'Syrupy Body', tag: 'Medium flow · deep saturation' },
  { id: 'Café Allrounder', tag: 'Balanced · versatile profile' },
  { id: 'Adaptive Dynamic', tag: 'Multi-stage adaptive curves' },
];

const PUMP_MODES = [
  { id: 'hybrid', label: 'Hybrid', desc: 'Flow + pressure as per archetype' },
  { id: 'flow', label: 'Flow-only', desc: 'All brew phases: flow-controlled' },
  { id: 'pressure', label: 'Pressure-only', desc: 'All brew phases: pressure-controlled' },
];

const PHASE_TYPES = ['preinfusion', 'brew', 'decline'];
const PUMP_TARGETS = ['pressure', 'flow'];
const TRANSITION_TYPES = ['instant', 'linear', 'ease-in', 'ease-out', 'ease-in-out'];
const STOP_TYPES = [
  { key: 'volumetric', label: 'Volumetric (g)' },
  { key: 'pumped', label: 'Pumped water (ml)' },
  { key: 'pressure', label: 'Pressure (bar)' },
  { key: 'flow', label: 'Flow(ml/s)' },
];
const OPERATORS = [{ key: 'gte', label: 'Greater than or equal' }, { key: 'lte', label: 'Less than or equal' }];
const DEFAULT_SAVED_PROFILES = [
  { id: 'def_1', title: 'Gentle Decline Signature', description: 'Classic profiling map focusing on high clarity extractions.', target_temperature: 93.5, phases: [{ name: 'Prewet', phase: 'preinfusion', duration: 6, temperature: 94.0, pump: { target: 'flow', pressure: 0, flow: 4.0 } }, { name: 'Main Brew', phase: 'brew', duration: 22, temperature: 93.2, pump: { target: 'pressure', pressure: 8.5, flow: 2.2 } }] }
];
function HDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0', gap: 10 }}>
      <span class="label" style={{ fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

// ─── Profile Generation Engine ─────────────────────────────────────
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
const r1 = v => +v.toFixed(1);
const r2 = v => +v.toFixed(2);

function getCompactId(baseId = "p", storedProfiles_ = []) {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');

  let candidateId = baseId;
  if (baseId.search(dateStr) === -1) candidateId = `${baseId}_${dateStr}`;
  if (!storedProfiles_.some(p => p.id === baseId)) return baseId;
  let counter = 0;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  while (storedProfiles_.some(p => p.id === candidateId)) {
    if (counter >= chars.length) {
      candidateId = `${baseId}_${dateStr}_${counter}`;
    } else {
      candidateId = `${baseId}_${dateStr}_${chars[counter]}`;
    }
    counter++;
  }

  return candidateId;
}
// ─── Dual-Curve Simulator Matrix ──────────────────────────────────
function buildProfile({ rl, ra, rob, proc, ratioTarget, arch, dp, beanBp, cupBp, dose, ye, yt, profileId, profileLabel, profileDescription }) {
  const has = p => proc?.includes(p);
  const archTend = ARCHETYPE_TENDencies[arch] ?? ARCHETYPE_TENDencies['Café Allrounder'];

  let dc = { ...cupBp };
  dc.Acidity = clamp(cupBp.Acidity + (5 - rl) * 0.8 + (has('Washed') ? 1.5 : 0) - (arch === 'Traditional Italian' ? 1 : 0), 1, 10);
  dc.Sweetness = clamp(cupBp.Sweetness + (ra === 1 ? 1 : 0) + (arch === 'Modern Sweet' ? 2 : 0), 1, 10);
  dc.Bitterness = clamp(cupBp.Bitterness + (rl * 0.9) + (rob / 20) - (arch === 'Nordic Clarity' ? 2 : 0), 1, 10);
  dc.Body = clamp(cupBp.Body + (rob / 25) + (arch === 'Syrupy Body' ? 2.5 : 0) + (has('Natural') ? 0.8 : 0), 1, 10);
  dc.Clarity = clamp(cupBp.Clarity - (rob / 30) + (arch === 'Nordic Clarity' ? 2.5 : 0) - rl * 0.3, 1, 10);
  dc.Fruitiness = clamp(cupBp.Fruitiness + (5 - rl) * 0.5 + (has('Anaerobic') || has('Natural') ? 1.8 : 0), 1, 10);
  dc.Chocolate = clamp(cupBp.Chocolate + (rl * 0.6) + (rob / 40), 1, 10);
  dc.Roastiness = clamp(cupBp.Roastiness + (rl * 1.2), 1, 10);
  dc.Crema = clamp(cupBp.Crema + (rob / 15) + (ra === 0 ? 1.5 : -1), 1, 10);
  dc.Floral = clamp(cupBp.Floral + (5 - rl) * 0.4 + (arch === 'Lever Style' ? 1 : 0), 1, 10);

  // Base temp: 91.5°C for medium roast (rl=2), lighter = cooler, darker = warmer
  // Rationale: light roasts need lower temp to avoid bitterness/harshness;
  //            dark roasts extract well at lower temp too but body benefits from slight increase.
  //            Range: ~88°C (ultra-light) to ~93°C (dark).
  let T0 = 89.0 - (2 - rl) * 1.2 - (rob / 100) * 0.8;
  if (ra === 0) T0 -= 0.4; if (ra === 2) T0 += 0.3;
  if (has('Washed')) T0 -= 0.3; if (has('Anaerobic')) T0 += 0.4; if (has('Monsooned')) T0 += 0.5; if (has('Natural')) T0 += 0.2;

  const gap = axis => ((cupBp[axis] ?? 5) - (beanBp[axis] ?? 5)) / 10;
  T0 -= gap('Roastiness') * 0.8;  // roasty → slightly lower
  T0 += gap('Floral') * 0.5;  // floral → slightly lower to preserve
  T0 -= gap('Fruitiness') * 0.4;  // fruity → lower to preserve brightness
  T0 += gap('Body') * 0.4;  // body-forward → slightly higher
  T0 -= gap('Chocolate') * 0.3;
  T0 += gap('Crema') * 0.2;

  if (gap('Acidity') > 0.1) T0 += gap('Acidity') * 1.0;
  if (gap('Acidity') < -0.1) T0 += gap('Acidity') * 0.5;
  if (gap('Bitterness') < -0.1) T0 -= Math.abs(gap('Bitterness')) * 0.8;
  T0 = clamp(T0, 79, 98);

  const durMult = [0.60, 0.80, 1.00, 1.22, 1.50][dp] ?? 1.0;
  const yv = ye ? yt : r1(dose * ratioTarget);

  let finalBp = {};
  AXES.forEach(axis => {
    const baseline = beanBp[axis] ?? 5;
    const tendency = archTend[axis] ?? 5;
    const targetDelta = gap(axis);
    let score = baseline * 0.4 + tendency * 0.4 + (targetDelta * 3.5) * durMult;
    if (axis === 'Roastiness') score += (rl * 0.6);
    if (axis === 'Bitterness') score += (rob / 25);
    finalBp[axis] = clamp(r1(score), 1, 10);
  });

  const clarGap = gap('Clarity');
  const bodyGap = gap('Body');
  const bAcid = (beanBp.Acidity ?? 5) / 10;
  const bSyrup = (beanBp.Body ?? 5) / 10;
  const bFloral = (beanBp.Floral ?? 5) / 10;
  const bFruit = (beanBp.Fruitiness ?? 5) / 10;
  const bRoast = (beanBp.Roastiness ?? 5) / 10;
  const bChoc = (beanBp.Chocolate ?? 5) / 10;
  const bSweet = (beanBp.Sweetness ?? 5) / 10;
  const bBitter = (beanBp.Bitterness ?? 5) / 10;
  const bCrema = (beanBp.Crema ?? 5) / 10;

  let internalPhases = []; let jsonPhases = [];

  // ── peakP ────────────────────────────────────────────────────────
  // Base: 9.0 bar at neutral. Roast/rob pull it down (dark = lower P).
  // Body/Chocolate/Crema push it up; Clarity/Floral/Fruitiness/Roastiness pull it down.
  let peakP = 9.0;
  peakP -= rl * 0.25;                          // darker roast → lower P
  peakP -= (rob / 100) * 1.2;                  // high rob → lower P
  peakP += gap('Body') * 1.2;             // body-forward bean → higher P
  peakP += gap('Chocolate') * 0.8;             // chocolatey bean → slightly higher P
  peakP += gap('Crema') * 1.5;             // crema-focus → higher P
  peakP -= gap('Roastiness') * 1.0;             // already roasty → reduce P to avoid bitterness
  peakP -= gap('Floral') * 0.9;             // floral → lower P preserves aromatics
  peakP -= gap('Fruitiness') * 0.7;             // fruity → lower P preserves brightness
  peakP -= gap('Bitterness') * 0.5;             // bean already bitter → reduce P
  peakP -= gap('Clarity') * 0.5;             // target wants clarity → lower P
  peakP = clamp(r2(peakP), 5.5, 10.5);

  // ── mainF ────────────────────────────────────────────────────────
  // Base: 2.2 ml/s at neutral. Body/Chocolate slow it; Clarity/Floral/Fruitiness/Acidity speed it.
  let mainF = 2.2;
  mainF -= gap('Body') * 0.8;             // body-forward → slower flow
  mainF -= gap('Chocolate') * 0.5;             // chocolatey → slightly slower
  mainF += gap('Floral') * 0.7;             // floral → faster flow preserves volatiles
  mainF += gap('Fruitiness') * 0.6;             // fruity → faster
  mainF += gap('Roastiness') * 0.4;             // roasty → faster to avoid over-extraction
  mainF += gap('Clarity') * 0.8;             // targeting clarity → faster flow
  mainF += gap('Acidity') * 0.5;             // targeting acidity → faster
  mainF -= gap('Sweetness') * 0.3;             // targeting sweetness → slightly slower
  mainF = clamp(r2(mainF), 0.8, 5.5);

  // ── satD / extrD ─────────────────────────────────────────────────
  // Saturation duration: sweet/floral/fruity beans need more bloom time.
  // Extraction duration: body/chocolate/sweetness targets need longer; clarity/turbo shorter.
  let satD = 8;
  satD += (5 - rl) * 1.2;                      // lighter roast → more saturation time
  satD += (1 - ra) * 2.0;                       // fresh beans → more bloom
  satD += gap('Sweetness') * 4;                 // targeting sweetness → longer soak
  satD += gap('Floral') * 3;               // floral bean → longer gentle bloom
  satD += gap('Fruitiness') * 2;               // fruity → longer bloom
  satD -= gap('Roastiness') * 2;               // roasty → less bloom needed
  satD = clamp(Math.round(satD), 4, 22);

  let extrD = 25;
  extrD += rl * 2;
  extrD += gap('Sweetness') * 5;
  extrD += gap('Body') * 8;              // body-forward bean → longer extraction
  extrD += gap('Chocolate') * 6;              // chocolatey → longer
  extrD -= gap('Floral') * 4;              // floral → shorter to preserve aromatics
  extrD -= gap('Fruitiness') * 3;              // fruity → shorter
  extrD -= gap('Clarity') * 4;
  extrD = clamp(Math.round(extrD * durMult), 12, 55);

  // ── ARCHETYPE PROFILE BUILDERS ──────────────────────────────────
  // Each archetype has a distinct, coherent phase structure designed
  // around real espresso technique. Transitions are set as placeholder
  // 'instant' here — they'll be overwritten by applyHolisticTransitions
  // at the end of buildProfile (which has the full phase array context).

  if (arch === 'Traditional Italian') {
    // Classic 9-bar espresso: fast flow fill → brief low-pressure soak → hard ramp → sustained
    // high pressure → moderate taper. Crema-forward, full body, chocolatey.
    const fillD = clamp(Math.round(3 + (1 - ra) * 2), 2, 6);
    const soakD = clamp(Math.round(satD * 0.5), 2, 7);
    const rampD = clamp(Math.round(3 + rl * 0.3), 3, 6);
    const holdD = clamp(Math.round(extrD * 0.70), 10, 36);
    const taperD = clamp(Math.round(extrD * 0.30), 4, 16);
    const fillF = clamp(r1(7.0 + (rob / 100) * 1.5 - rl * 0.2), 4.5, 9.0);
    const holdP = peakP;
    const taperP = clamp(r2(holdP - 2.0 + gap('Body') * 0.5), 4.5, 8.5);

    jsonPhases = [
      {
        name: 'Fill', phase: 'preinfusion', valve: 1, duration: fillD, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: fillF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }]
      },
      {
        name: 'Soak', phase: 'preinfusion', valve: 1, duration: soakD, temperature: r1(T0 + 0.2),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: 2.0, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 1.5 }]
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: holdP, flow: r1(mainF * 0.6) },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(holdP - 0.4) }]
      },
      {
        name: 'Hold', phase: 'brew', valve: 1, duration: holdD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: holdP, flow: mainF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'volumetric', operator: 'gte', value: Math.round(yv * 0.72) }]
      },
      {
        name: 'Taper', phase: 'brew', valve: 1, duration: taperD, temperature: r1(T0 - 0.4),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: taperP, flow: r1(mainF * 1.1) },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Fill', dur: fillD, sP: 0, eP: r2(1.5), fl: fillF, tmp: r1(T0 + 0.3) },
      { name: 'Soak', dur: soakD, sP: r2(1.5), eP: r2(2.0), fl: r1(fillF * 0.2), tmp: r1(T0 + 0.2) },
      { name: 'Ramp', dur: rampD, sP: r2(2.0), eP: holdP, fl: r1(mainF * 0.6), tmp: r1(T0) },
      { name: 'Hold', dur: holdD, sP: holdP, eP: r2(holdP - 0.2), fl: mainF, tmp: r1(T0) },
      { name: 'Taper', dur: taperD, sP: r2(holdP - 0.2), eP: taperP, fl: r1(mainF * 1.1), tmp: r1(T0 - 0.4) },
    ];

  } else if (arch === 'Modern Sweet') {
    // Gentle flow prewet → low-pressure soak → smooth S-curve ramp → flow-controlled extraction.
    // Targets sweetness and clarity. Lower peak P, flow-locked extraction.
    const prewetD = clamp(Math.round(satD * 0.45 + gap('Sweetness') * 1.5), 3, 9);
    const soakD2 = clamp(Math.round(satD * 0.55 + gap('Sweetness') * 2), 3, 12);
    const rampD = clamp(Math.round(6 + gap('Sweetness') * 2), 5, 10);
    const extrDS = clamp(Math.round(extrD + gap('Sweetness') * 8), 14, 50);
    const sweetP = clamp(r2(peakP - 0.8 - gap('Clarity') * 0.5), 5.5, 9.5);
    const sweetF = clamp(r2(mainF + gap('Clarity') * 0.4), 1.0, 4.5);
    const prewetF = clamp(r1(4.0 + gap('Fruitiness') * 0.5), 2.5, 6.0);

    jsonPhases = [
      {
        name: 'Prewet', phase: 'preinfusion', valve: 1, duration: prewetD, temperature: r1(T0 + 0.5),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: prewetF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 0.8 }]
      },
      {
        name: 'Soak', phase: 'preinfusion', valve: 1, duration: soakD2, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: 2.2, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'flow', operator: 'lte', value: 2.0 }]
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: sweetP, flow: sweetF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(sweetP - 0.4) }]
      },
      {
        name: 'Extraction', phase: 'brew', valve: 1, duration: extrDS, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: r2(sweetP + 0.3), flow: sweetF },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Prewet', dur: prewetD, sP: 0, eP: r2(1.2), fl: prewetF, tmp: r1(T0 + 0.5) },
      { name: 'Soak', dur: soakD2, sP: r2(1.2), eP: r2(2.2), fl: 0.5, tmp: r1(T0 + 0.3) },
      { name: 'Ramp', dur: rampD, sP: r2(2.2), eP: sweetP, fl: sweetF, tmp: r1(T0) },
      { name: 'Extraction', dur: extrDS, sP: sweetP, eP: r2(sweetP - 0.3), fl: sweetF, tmp: r1(T0) },
    ];

  } else if (arch === 'Lever Style') {
    // Mimics spring-lever mechanics: low fill → gentle saturation soak → hard rise to peak →
    // brief hold until flow appears → long linear pressure decline through yield.
    const fillD = clamp(Math.round(2 + (1 - ra) * 1.5), 2, 5);
    const piD = clamp(Math.round(satD * 0.55), 4, 14);
    const soakD2 = clamp(Math.round(satD * 0.45), 2, 9);
    const riseD = clamp(Math.round(4 + rl * 0.5), 3, 8);
    const holdD = clamp(Math.round(5 + gap('Sweetness') * 3), 3, 10);
    const declineD = clamp(Math.round(32 + rl * 4 + gap('Sweetness') * 6), 22, 65);
    const fillP = clamp(r2(1.5 + (has('Natural') ? 0.3 : 0)), 1.1, 2.5);
    const piP = clamp(r2(fillP + 0.6), 1.5, 3.2);
    const riseP = clamp(r2(peakP + 0.5), 7.5, 11.0);
    const declineP = clamp(r2(2.0 + gap('Sweetness') * 0.5), 1.5, 4.0);

    jsonPhases = [
      {
        name: 'Fill Start', phase: 'preinfusion', valve: 1, duration: fillD, temperature: r1(T0 + 0.5),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: fillP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }]
      },
      {
        name: 'Pre-infusion', phase: 'preinfusion', valve: 1, duration: piD, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: piP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(piP - 0.2) }]
      },
      {
        name: 'Soak', phase: 'preinfusion', valve: 1, duration: soakD2, temperature: r1(T0 + 0.2),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: piP, flow: 0 }
      },
      {
        name: 'Rise', phase: 'brew', valve: 1, duration: riseD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: riseP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(riseP - 0.3) }]
      },
      {
        name: 'Hold', phase: 'brew', valve: 1, duration: holdD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: riseP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'flow', operator: 'gte', value: 1.2 }]
      },
      {
        name: 'Decline', phase: 'brew', valve: 1, duration: declineD, temperature: r1(T0 - 0.3),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: declineP, flow: 0 },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Fill Start', dur: fillD, sP: 0, eP: fillP, fl: 0, tmp: r1(T0 + 0.5) },
      { name: 'Pre-infusion', dur: piD, sP: fillP, eP: piP, fl: 0.3, tmp: r1(T0 + 0.3) },
      { name: 'Soak', dur: soakD2, sP: piP, eP: piP, fl: 0.2, tmp: r1(T0 + 0.2) },
      { name: 'Rise', dur: riseD, sP: piP, eP: riseP, fl: 0.5, tmp: r1(T0) },
      { name: 'Hold', dur: holdD, sP: riseP, eP: riseP, fl: 1.2, tmp: r1(T0) },
      { name: 'Decline', dur: declineD, sP: riseP, eP: declineP, fl: 2.5, tmp: r1(T0 - 0.3) },
    ];

  } else if (arch === 'Nordic Clarity') {
    // True low-pressure, flow-driven extraction for transparency and acidity.
    // The puck resistance governs actual pressure — we flow-lock at a modest rate
    // and let pressure settle naturally (typically 4–6 bar), never forcing high P.
    // Fill → gentle compress to puck contact → flow-locked extraction.
    // Bitterness is avoided by keeping both pressure AND temp conservatively low.
    const prewetD = clamp(Math.round(satD * 0.45), 3, 9);
    const compD = clamp(Math.round(satD * 0.35 + 1), 2, 7);
    const rampD = clamp(Math.round(3 + clarGap * 1.0), 2, 6);
    const extrDN = clamp(Math.round(extrD - 3 + clarGap * 3), 12, 42);
    // Pressure cap much lower: 4.5–6.5 bar. This is the resistance cap, not a target.
    const nordicP = clamp(r2(peakP - 3.5 - clarGap * 0.5), 4.0, 6.5);
    // Flow is the actual control — moderate, not too fast (2.5–4.5 ml/s)
    const nordicF = clamp(r2(mainF + 0.8 + clarGap * 0.4), 2.2, 4.5);
    const prewetF = clamp(r1(nordicF * 0.55), 1.2, 3.0);
    const compEndP = clamp(r2(2.0 + gap('Acidity') * 0.2), 1.5, 3.0);

    jsonPhases = [
      {
        name: 'Prewet', phase: 'preinfusion', valve: 1, duration: prewetD, temperature: r1(T0 + 0.2),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: prewetF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 0.5 }]
      },
      {
        name: 'Compress', phase: 'preinfusion', valve: 1, duration: compD, temperature: r1(T0 + 0.1),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: compEndP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'flow', operator: 'lte', value: 3.0 }]
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: nordicP, flow: nordicF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(nordicP - 1.0) }]
      },
      {
        name: 'Flow Extraction', phase: 'brew', valve: 1, duration: extrDN, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: r2(nordicP + 0.3), flow: nordicF },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Prewet', dur: prewetD, sP: 0, eP: r2(0.8), fl: prewetF, tmp: r1(T0 + 0.2) },
      { name: 'Compress', dur: compD, sP: r2(0.8), eP: compEndP, fl: 0.5, tmp: r1(T0 + 0.1) },
      { name: 'Ramp', dur: rampD, sP: compEndP, eP: nordicP, fl: nordicF, tmp: r1(T0) },
      { name: 'Flow Extraction', dur: extrDN, sP: nordicP, eP: r2(nordicP - 0.3), fl: nordicF, tmp: r1(T0) },
    ];

  } else if (arch === 'Turbo Shot') {
    // Minimal preinfusion, immediate high flow, fast high-pressure extraction.
    // Short, bright, high-clarity. Works best with medium+ grind and light/medium roasts.
    const piD = clamp(Math.round(satD * 0.3 + 1), 2, 5);
    const rampD = clamp(Math.round(3 + gap('Clarity') * 1), 2, 5);
    const turboD = clamp(Math.round(10 + rl * 1.5), 8, 24);
    const turboP = clamp(r2(peakP - 0.3), 6.5, 10.5);
    const turboF = clamp(r2(mainF + 1.8 + clarGap * 0.5), 3.5, 7.0);
    const fillF = clamp(r1(turboF * 0.8), 2.5, 6.0);

    jsonPhases = [
      {
        name: 'Quick Fill', phase: 'preinfusion', valve: 1, duration: piD, temperature: r1(T0 + 0.2),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: fillF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 1.5 }]
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: turboP, flow: turboF },
        targets: [{ type: 'pressure', operator: 'gte', value: r2(turboP - 0.4) }]
      },
      {
        name: 'Turbo Extraction', phase: 'brew', valve: 1, duration: turboD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: turboP, flow: turboF },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Quick Fill', dur: piD, sP: 0, eP: r2(2.0), fl: fillF, tmp: r1(T0 + 0.2) },
      { name: 'Ramp', dur: rampD, sP: r2(2.0), eP: turboP, fl: turboF, tmp: r1(T0) },
      { name: 'Turbo Extraction', dur: turboD, sP: turboP, eP: r2(turboP - 0.3), fl: turboF, tmp: r1(T0) },
    ];

  } else if (arch === 'Syrupy Body') {
    // Long saturation soak → gentle ramp → sustained moderate-high pressure with
    // controlled medium-slow flow. Dense, textured, chocolatey mouthfeel.
    // Key: Flow must stay high enough to actually extract (≥1.5 ml/s).
    // Syrupy texture comes from the pre-saturation and moderate flow, not from
    // starving the puck — low flow (<1 ml/s) just under-extracts.
    const fillD = clamp(Math.round(satD * 0.35), 3, 8);
    const compD = clamp(Math.round(satD * 0.30), 2, 6);
    const dripD = clamp(Math.round(satD * 0.35 + bodyGap * 2), 3, 9);
    const rampD = clamp(Math.round(5 + bodyGap * 2.0), 4, 10);
    const extrDS = clamp(Math.round(extrD + bodyGap * 6 + bSyrup * 4), 18, 55);
    // Pressure: stay near peakP, no need to go above — body is from saturation + flow control
    const syrupP = clamp(r2(peakP + 0.3 + bodyGap * 0.2), 7.0, 10.0);
    // Flow: 1.5–3.5 ml/s — slow but high enough to actually extract
    const syrupF = clamp(r2(mainF * 0.75 + 0.5 - bodyGap * 0.3), 1.5, 3.5);
    const fillF2 = clamp(r1(5.0 + gap('Body') * 0.5), 3.0, 7.0);
    const compP = clamp(r2(3.0 + bodyGap * 0.4), 2.2, 4.5);

    jsonPhases = [
      {
        name: 'Fill', phase: 'preinfusion', valve: 1, duration: fillD, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: fillF2 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 1.5 }]
      },
      {
        name: 'Compress', phase: 'preinfusion', valve: 1, duration: compD, temperature: r1(T0 + 0.2),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: compP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'flow', operator: 'lte', value: 2.5 }]
      },
      {
        name: 'Drip Soak', phase: 'preinfusion', valve: 1, duration: dripD, temperature: r1(T0 + 0.1),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: 0.3, flow: 0 }
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: syrupP, flow: r1(syrupF * 0.7) },
        targets: [{ type: 'pressure', operator: 'gte', value: r2(syrupP - 0.5) }]
      },
      {
        name: 'Body Extraction', phase: 'brew', valve: 1, duration: extrDS, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: r2(syrupP + 0.3), flow: syrupF },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Fill', dur: fillD, sP: 0, eP: r2(2.0), fl: fillF2, tmp: r1(T0 + 0.3) },
      { name: 'Compress', dur: compD, sP: r2(2.0), eP: compP, fl: r1(syrupF * 0.7), tmp: r1(T0 + 0.2) },
      { name: 'Drip Soak', dur: dripD, sP: compP, eP: r2(0.3), fl: r1(0.3), tmp: r1(T0 + 0.1) },
      { name: 'Ramp', dur: rampD, sP: r2(0.3), eP: syrupP, fl: r1(syrupF * 0.7), tmp: r1(T0) },
      { name: 'Body Extraction', dur: extrDS, sP: syrupP, eP: r2(syrupP - 0.3), fl: syrupF, tmp: r1(T0) },
    ];

  } else if (arch === 'Café Allrounder') {
    // Balanced profile for versatility. Flow fill → compress → moderate ramp →
    // pressure-held main extraction → light taper. Works across all roasts.
    const fillD = clamp(Math.round(satD * 0.40), 3, 8);
    const compD = clamp(Math.round(satD * 0.35), 2, 7);
    const rampD = clamp(Math.round(5 + rl * 0.3), 4, 8);
    const mainDA = clamp(Math.round(extrD * 0.65), 10, 32);
    const finDA = clamp(Math.round(extrD * 0.35), 5, 20);
    const compP = clamp(r2(2.5 + gap('Acidity') * 0.4), 1.8, 4.0);
    const finP = clamp(r2(peakP - 1.8 + gap('Body') * 0.3), 4.0, 8.0);
    const fillF2 = clamp(r1(6.5 + gap('Clarity') * 0.5), 4.5, 9.0);

    jsonPhases = [
      {
        name: 'Fill', phase: 'preinfusion', valve: 1, duration: fillD, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: fillF2 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }]
      },
      {
        name: 'Compress', phase: 'preinfusion', valve: 1, duration: compD, temperature: r1(T0 + 0.1),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: compP, flow: 0 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'flow', operator: 'lte', value: 2.5 }]
      },
      {
        name: 'Ramp', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: peakP, flow: r1(mainF * 0.6) },
        targets: [{ type: 'pressure', operator: 'gte', value: r2(peakP - 0.4) }, { type: 'volumetric', operator: 'gte', value: Math.round(yv * 0.12) }]
      },
      {
        name: 'Extraction', phase: 'brew', valve: 1, duration: mainDA, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: mainF >= 2.5 ? 'flow' : 'pressure', pressure: r2(peakP - 0.1), flow: mainF },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv * 0.75) }]
      },
      {
        name: 'Finish', phase: 'brew', valve: 1, duration: finDA, temperature: r1(T0 - 0.3),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: finP, flow: r1(mainF * 1.1) },
        targets: [{ type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Fill', dur: fillD, sP: 0, eP: r2(1.8), fl: fillF2, tmp: r1(T0 + 0.3) },
      { name: 'Compress', dur: compD, sP: r2(1.8), eP: compP, fl: r1(mainF * 0.3), tmp: r1(T0 + 0.1) },
      { name: 'Ramp', dur: rampD, sP: compP, eP: peakP, fl: r1(mainF * 0.6), tmp: r1(T0) },
      { name: 'Extraction', dur: mainDA, sP: peakP, eP: r2(peakP - 0.2), fl: mainF, tmp: r1(T0) },
      { name: 'Finish', dur: finDA, sP: r2(peakP - 0.2), eP: finP, fl: r1(mainF * 1.1), tmp: r1(T0 - 0.3) },
    ];

  } else {
    // Adaptive Dynamic: multi-stage adaptive profile.
    // Flow fill → compress → drip decompression → strong pressurize overshoot →
    // flow-controlled extraction → pressure decline. Maximizes shot adaptability.
    const fillD = clamp(Math.round(satD * 0.35), 3, 8);
    const satD2 = clamp(Math.round(satD * 0.40), 3, 10);
    const dripD = clamp(Math.round(satD * 0.25), 2, 6);
    const rampD = clamp(Math.round(5 + rl * 0.4 + gap('Sweetness') * 1.5), 4, 9);
    const highD = clamp(Math.round(extrD * 0.45), 8, 28);
    const dropD = clamp(Math.round(extrD * 0.55), 8, 30);
    const compP = clamp(r2(2.8 + bodyGap * 0.3), 2.0, 4.5);
    const dipP = clamp(r2(peakP - 2.5 + clarGap * 0.5), 4.0, 8.0);
    const overshP = clamp(r2(peakP + 1.2), 7.5, 11.5);

    jsonPhases = [
      {
        name: 'Prefill', phase: 'preinfusion', valve: 1, duration: fillD, temperature: r1(T0 + 0.3),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: 8 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }]
      },
      {
        name: 'Fill', phase: 'preinfusion', valve: 1, duration: satD2, temperature: r1(T0 + 0.1),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'flow', pressure: 0, flow: 8 },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: 3 }]
      },
      {
        name: 'Compressing', phase: 'preinfusion', valve: 1, duration: Math.round(satD2 * 0.5), temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: compP, flow: 0 },
        targets: [{ type: 'flow', operator: 'lte', value: 3 }]
      },
      {
        name: 'Dripping', phase: 'preinfusion', valve: 1, duration: dripD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: false },
        pump: { target: 'pressure', pressure: 0.1, flow: 0 }
      },
      {
        name: 'Pressurize', phase: 'brew', valve: 1, duration: rampD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'pressure', pressure: overshP, flow: r1(mainF * 0.7) },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'pressure', operator: 'gte', value: r2(peakP - 0.3) }, { type: 'volumetric', operator: 'gte', value: Math.round(yv * 0.15) }]
      },
      {
        name: 'Extraction', phase: 'brew', valve: 1, duration: highD + dropD, temperature: r1(T0),
        transition: { type: 'instant', duration: 0, adaptive: true },
        pump: { target: 'flow', pressure: r2(peakP - 0.2), flow: mainF },
        targets: [{ type: 'pumped', operator: 'gte', value: 100 }, { type: 'volumetric', operator: 'gte', value: Math.round(yv) }]
      },
    ];
    internalPhases = [
      { name: 'Prefill', dur: fillD, sP: 0, eP: r2(1.5), fl: r1(7.5), tmp: r1(T0 + 0.3) },
      { name: 'Fill', dur: satD2, sP: r2(1.5), eP: compP, fl: r1(mainF * 0.3), tmp: r1(T0 + 0.1) },
      { name: 'Compressing', dur: Math.round(satD2 * 0.5), sP: compP, eP: r2(0.2), fl: 0.3, tmp: r1(T0) },
      { name: 'Dripping', dur: dripD, sP: r2(0.2), eP: r2(0.1), fl: 0.1, tmp: r1(T0) },
      { name: 'Pressurize', dur: rampD, sP: r2(0.1), eP: peakP, fl: r1(mainF * 0.6), tmp: r1(T0) },
      { name: 'Extraction', dur: highD + dropD, sP: peakP, eP: dipP, fl: mainF, tmp: r1(T0) },
    ];
  }

  // Apply holistic transitions AFTER all phases are constructed and final
  // pressure/flow values are known — the classifier needs full phase context.
  jsonPhases = applyHolisticTransitions(jsonPhases, finalBp);

  const easeFns = {
    'instant': x => x,
    'linear': x => x,
    'ease-out': x => 1 - Math.pow(1 - x, 2),
    'ease-in': x => x * x,
    'ease-in-out': x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2,
  };
  const curve = []; let t = 0;
  internalPhases.forEach((ph, phIdx) => {
    const n = Math.max(2, ph.dur);
    const transType = jsonPhases[phIdx]?.transition?.type ?? 'linear';
    const easeFn = easeFns[transType] ?? easeFns['linear'];
    for (let i = 0; i <= n; i++) {
      const frac = i / n; const ease = easeFn(frac);
      curve.push({ t: +(t + frac * ph.dur).toFixed(1), p: +(ph.sP + (ph.eP - ph.sP) * ease).toFixed(2), fl: +ph.fl });
    }
    t += ph.dur;
  });

  return {
    baseTemp: T0, total: internalPhases.reduce((acc, p) => acc + p.dur, 0), curve: curve, peakP: peakP, mainF: mainF, yv: yv, cupProfile: dc, archTend: archTend, finalBp: finalBp,
    json: {
      id: profileId || getCompactId(`${arch.toLowerCase().replace(/[^a-z0-9]+/g, '').replace(/-+$/, '').slice(0, 8)}`),
      label: profileLabel || `${arch} (${ROAST_LABELS[rl]})`,
      description: profileDescription || `Generated for ${ROAST_LABELS[rl]} roast, ${AGE_LABELS[ra]} age profile via engine layout.`,
      tank_profile: false, preheat_temperature: Math.round(T0 + 1.5), phases: jsonPhases
    }
  };
}

// ─── Holistic Transition Engine ──────────────────────────────────
// Classifies each phase into a semantic role, then assigns transitions
// based on the RELATIONSHIP between consecutive phases — not each phase
// in isolation. The result forms a coherent narrative arc across the
// full profile: gentle wetting → controlled build → peak → shaped decay.
//
// Roles:
//   FILL      – low-pressure preinfusion wetting (flow or <2 bar)
//   COMPRESS  – moderate pressure build in preinfusion (2–5 bar)
//   SOAK      – static / near-zero pressure hold / drip
//   RAMP      – rising pressure transition into brew
//   PEAK      – high sustained extraction pressure (>6 bar, no decline)
//   DECLINE   – falling pressure during extraction (linear target < start)
//   TAIL      – low-pressure brew tail / off phase
//
// Transition shapes mean:
//   instant    – hard cut, no ramping (only safe between similar pressure/flow levels)
//   linear     – steady ramp at constant rate
//   ease-in    – slow start then accelerates (good for gentle initial builds)
//   ease-out   – fast start then decelerates (good for soft landings / flavor-preserving drops)
//   ease-in-out – S-curve, symmetric (ideal for big pressure swings: preinfusion→peak, peak→decline)

function classifyPhaseRole(ph, phases, idx) {
  if (!ph) return 'NONE';
  if (ph.phase === 'preinfusion') {
    const p = ph.pump?.pressure ?? 0;
    const f = ph.pump?.flow ?? 0;
    const isFlowFill = ph.pump?.target === 'flow' && f > 2;
    if (isFlowFill || p < 1.5) return 'FILL';
    if (p <= 0.5) return 'SOAK';
    if (p < 4.5) return 'COMPRESS';
    return 'COMPRESS';
  }
  // brew phases
  const p = ph.pump?.pressure ?? 0;
  const f = ph.pump?.flow ?? 0;
  // look for a declining linear transition to lower target
  const isDecline = ph.transition?.type === 'linear' &&
    idx > 0 && (phases[idx - 1]?.pump?.pressure ?? 0) > p;
  if (p < 2) return 'TAIL';
  if (p < 5) return 'TAIL';
  if (isDecline) return 'DECLINE';
  // peek at transition target: if this phase ends lower than it starts, it's a decline
  // (we detect this by checking next phase)
  return 'PEAK';
}

function deriveTransitionForPhase(ph, phIdx, allPhases, flavour) {
  const prevRole = classifyPhaseRole(allPhases[phIdx - 1], allPhases, phIdx - 1);
  const currRole = classifyPhaseRole(ph, allPhases, phIdx);
  const nextRole = classifyPhaseRole(allPhases[phIdx + 1], allPhases, phIdx + 1);
  const isFirst = phIdx === 0;
  const isLast = phIdx === allPhases.length - 1;

  // Flavour scores (0–1 range) that shape transition aggressiveness
  const clarity = (flavour.Clarity ?? 5) / 10;
  const sweetness = (flavour.Sweetness ?? 5) / 10;
  const body = (flavour.Body ?? 5) / 10;
  const acidity = (flavour.Acidity ?? 5) / 10;
  const floral = (flavour.Floral ?? 5) / 10;
  const roasty = (flavour.Roastiness ?? 5) / 10;

  // Pressure delta to next phase — large swings need shaped curves
  const currP = ph.pump?.pressure ?? 0;
  const nextP = (allPhases[phIdx + 1]?.pump?.pressure) ?? currP;
  const prevP = (allPhases[phIdx - 1]?.pump?.pressure) ?? currP;
  const deltaToNext = nextP - currP;
  const deltaFromPrev = currP - prevP;

  // --- RULE TABLE ---
  // Each rule returns { type, duration, adaptive }

  // 1. Very first phase always starts gently
  if (isFirst) {
    return { type: 'ease-out', duration: Math.min(3, ph.duration * 0.4), adaptive: false };
  }

  // 2. FILL → FILL: same-phase flow continuation — instant, no ramp needed
  if (prevRole === 'FILL' && currRole === 'FILL') {
    return { type: 'instant', duration: 0, adaptive: false };
  }

  // 3. FILL → COMPRESS: start compressing the puck — ease-out (fast initial bite, smooth settle)
  if (prevRole === 'FILL' && currRole === 'COMPRESS') {
    return { type: 'ease-out', duration: Math.min(2, ph.duration * 0.3), adaptive: false };
  }

  // 4. Any preinfusion → SOAK/drip: pump drops to near-zero — ease-out (smooth decompression)
  if (currRole === 'SOAK' && ph.phase === 'preinfusion') {
    return { type: 'ease-out', duration: Math.min(2, ph.duration * 0.5), adaptive: true };
  }

  // 5. COMPRESS/SOAK → RAMP or start of brew (preinfusion → brew boundary)
  if ((prevRole === 'COMPRESS' || prevRole === 'SOAK' || prevRole === 'FILL') &&
    (currRole === 'PEAK' || currRole === 'DECLINE') &&
    ph.phase === 'brew') {
    // Big pressure swing from preinfusion to brew peak — S-curve for smooth onset
    const dur = clamp(ph.duration * 0.5 + (clarity - 0.5) * 2, 3, Math.min(ph.duration, 12));
    return { type: 'ease-in-out', duration: dur, adaptive: true };
  }

  // 6. PEAK → PEAK (two sustained high-pressure phases in a row): instant or very short linear
  if (prevRole === 'PEAK' && currRole === 'PEAK') {
    const bigSwing = Math.abs(deltaFromPrev) > 1.5;
    if (bigSwing) return { type: 'linear', duration: Math.round(ph.duration * 0.25), adaptive: true };
    return { type: 'instant', duration: 0, adaptive: true };
  }

  // 7. PEAK → DECLINE (extraction peak then pressure decay):
  //    sweetness/body → ease-in-out (long, smooth decay preserves sweetness)
  //    clarity/acidity → linear (direct decline keeps brightness)
  if (prevRole === 'PEAK' && (currRole === 'DECLINE' || currRole === 'TAIL')) {
    const syrupy = (sweetness + body) / 2;
    if (syrupy > 0.6) {
      const dur = clamp(ph.duration * 0.6 + sweetness * 4, 4, Math.min(ph.duration, 20));
      return { type: 'ease-in-out', duration: dur, adaptive: true };
    }
    const dur = clamp(ph.duration * 0.4 + clarity * 3, 3, Math.min(ph.duration, 14));
    return { type: 'linear', duration: dur, adaptive: true };
  }

  // 8. DECLINE → DECLINE: continuing decay — linear, duration scaled to remaining time
  if (prevRole === 'DECLINE' && currRole === 'DECLINE') {
    return { type: 'linear', duration: ph.duration * 0.5, adaptive: true };
  }

  // 9. DECLINE → TAIL: the tail finish — ease-out (soft end, preserve floral/acidity)
  if ((prevRole === 'DECLINE' || prevRole === 'PEAK') && currRole === 'TAIL') {
    const aromatic = (floral + acidity) / 2;
    if (aromatic > 0.55) return { type: 'ease-out', duration: Math.min(3, ph.duration), adaptive: true };
    return { type: 'linear', duration: Math.min(4, ph.duration), adaptive: true };
  }

  // 10. COMPRESS → COMPRESS: gradual puck saturation — ease-out (soft settle)
  if (prevRole === 'COMPRESS' && currRole === 'COMPRESS') {
    return { type: 'ease-out', duration: Math.min(2, ph.duration * 0.4), adaptive: false };
  }

  // 11. Within-brew moderate transitions (e.g. flow adjustments at sustained pressure)
  if (ph.phase === 'brew' && prevRole === 'PEAK' && currRole === 'PEAK') {
    return { type: 'linear', duration: Math.min(3, ph.duration * 0.3), adaptive: true };
  }

  // Fallback: linear with moderate duration
  const fallDur = clamp(ph.duration * 0.35, 1, 6);
  return { type: 'linear', duration: fallDur, adaptive: ph.phase === 'brew' };
}

// Applies the holistic transition system across an entire phases array,
// respecting the full context of prev/curr/next for every phase.
function applyHolisticTransitions(phases, flavour) {
  return phases.map((ph, i) => ({
    ...ph,
    transition: deriveTransitionForPhase(ph, i, phases, flavour)
  }));
}
// ─── Parameter Transformer ────────────────────────────────────────
// Adjusts imported/edited base phases using the DELTA between a neutral
// reference engine run and the current param engine run — applied per
// dimension flag (overwriteFlags controls which dimensions are active):
//
//   pressure    : importedP  * (targetPeakP  / refPeakP)
//   flow        : importedF  * (targetMainF  / refMainF)
//   duration    : importedDur * (durMult     / refDurMult)   refDurMult=1.0
//   temperature : importedT  + (targetTemp   - refTemp)      additive delta
//   transitions : holistic re-derivation across all phases
//
// Neutral params (rl=2, all flavours=5, dp=2) → all deltas = 1.0 or 0 → no change.
// overwriteFlags = { pressure, flow, temperature, duration, transitions } — all true by default.
function applyParams(phases, {
  baseTemp, targetTemp, refTemp, durMult, refDurMult,
  refYv, targetYv, flavourProfile,
  targetPeakP, refPeakP, targetMainF, refMainF,
  overwriteFlags = { pressure: true, flow: true, temperature: true, duration: true, transitions: true },
  timeFactor = 1.0, tempFactor = 1.0, pressFactor = 1.0, flowFactor = 1.0,
}) {
  if (!phases || !phases.length) return phases;

  const pressScale = refPeakP > 0 ? targetPeakP / refPeakP : 1;
  const flowScale = refMainF > 0 ? targetMainF / refMainF : 1;
  const durScale = refDurMult > 0 ? durMult / refDurMult : 1;
  const tempDelta = targetTemp - refTemp;

  const brewPhases = phases.filter(p => p.phase === 'brew');
  const importPeak = brewPhases.length ? Math.max(...brewPhases.map(p => p.pump?.pressure ?? 0)) : 9.0;
  const FILL_THRESH = importPeak * 0.30;

  let result = phases.map(ph => {
    const isFill = ph.phase === 'preinfusion' && (ph.pump?.pressure ?? 0) < FILL_THRESH;

    // Temperature
    let newTemp = ph.temperature ?? baseTemp;
    if (overwriteFlags.temperature) {
      const phOffset = (ph.temperature ?? baseTemp) - baseTemp;
      newTemp = parseFloat(clamp(baseTemp + tempDelta + phOffset, 80, 98).toFixed(1));
    }

    // Duration — scaled when flag is active
    let newDur = ph.duration ?? 0;
    if (overwriteFlags.duration !== false) {
      newDur = Math.max(1, newDur * durScale);
      if (newDur === Math.max(1, (ph.duration ?? 0) * durScale) && targetYv !== refYv && refYv > 0) {
        newDur = Math.max(1, newDur * (targetYv / refYv));
      }
    }

    // Pump
    let newPump = { ...ph.pump };
    if (ph.pump) {
      if (overwriteFlags.pressure) {
        newPump.pressure = isFill
          ? ph.pump.pressure
          : parseFloat(clamp((ph.pump.pressure ?? 0) * pressScale, 0, 12).toFixed(2));
      }
      if (overwriteFlags.flow && (ph.pump.flow ?? 0) > 0) {
        newPump.flow = parseFloat(clamp(ph.pump.flow * flowScale, 0, 9).toFixed(2));
      }
    }

    // Targets
    const newTargets = (ph.targets ?? []).map(tgt => {
      if (tgt.type === 'volumetric') {
        const origV = tgt.value ?? targetYv;
        const estOldYv = refYv > 0 ? refYv : targetYv;
        const frac = estOldYv > 0 ? origV / estOldYv : 1;
        return { ...tgt, value: frac >= 0.85 ? Math.round(targetYv) : Math.round(origV * durScale) };
      }
      if (tgt.type === 'pressure' && !isFill && overwriteFlags.pressure) {
        return { ...tgt, value: parseFloat(clamp((tgt.value ?? 0) * pressScale, 0, 12).toFixed(2)) };
      }
      if (tgt.type === 'flow' && !isFill && overwriteFlags.flow) {
        return { ...tgt, value: parseFloat(clamp((tgt.value ?? 0) * flowScale, 0, 9).toFixed(2)) };
      }
      return tgt;
    });

    return { ...ph, temperature: newTemp, duration: newDur, pump: newPump, targets: newTargets };
  });

  // Apply holistic transitions AFTER all pressure/flow values are resolved,
  // so the role classifier sees the final values for the whole profile.
  if (overwriteFlags.transitions) {
    result = applyHolisticTransitions(result, flavourProfile);
  }
  return scaleProfile(result, timeFactor, tempFactor, pressFactor, flowFactor);
}
function scaleProfile(phases, timeScale, tempScale, pressureScale, flowScale) {
  return phases.map(p => ({
    ...p,
    duration: p.duration * timeScale,
    temperature: Math.round(p.temperature * tempScale * 10) / 10,
    pump: {
      ...p.pump,
      pressure: clamp(p.pump.pressure ? Math.max(0, r2(p.pump.pressure * pressureScale)) : 0, 0, 12),
      flow: clamp(p.pump.flow ? Math.max(0, r2(p.pump.flow * flowScale)) : 0, 0, 15),
    }
  }));
}
function makePumpModel(oneBarFlow, nineBarFlow) {
  const slope = (nineBarFlow - oneBarFlow) / 8;
  const intercept = oneBarFlow - slope;

  const maxPressure = -intercept / slope;

  return {
    pToF: p => parseFloat((intercept - clamp(slope * (p / 12 * maxPressure) + intercept, 0, intercept)).toFixed(2)),

    fToP: f => parseFloat(((maxPressure - clamp((f - intercept) / slope, 0, maxPressure)) / maxPressure * 12).toFixed(2)),
  };
}

// ─── Pump Mode Override ───────────────────────────────────────────
// Rewrites brew-phase pump.target to 'flow' or 'pressure' globally.
// Preinfusion phases are never touched.
//
// Uses makePumpModel() with coefficients from GaggiMate's pumpModelCoeffs
// setting (Settings → Machine Settings → Pump Flow Coefficients).
// Default placeholder in the Settings UI: "10.205,5.521"
function applyPumpMode(phases, mode, oneBarFlow = 10.205, nineBarFlow = 5.521) {
  if (!phases || mode === 'hybrid') return phases;
  const { pToF, fToP } = makePumpModel(oneBarFlow, nineBarFlow);
  return phases.map(ph => {
    const p = ph.pump?.pressure ?? 0;
    const f = ph.pump?.flow ?? 0;

    if (mode === 'flow') {
      // Derive flow from pressure if no flow is set; pressure cap → 0
      const ptof = pToF(p);
      const derivedF = f > ptof ? f : ptof;
      return { ...ph, pump: { ...ph.pump, target: 'flow', pressure: 0, flow: derivedF } };
    }

    if (mode === 'pressure') {
      // Derive pressure from flow if no pressure is set; flow cap → 0
      const ftop = fToP(f);
      const derivedP = p > ftop ? p : ftop;
      return { ...ph, pump: { ...ph.pump, target: 'pressure', pressure: derivedP, flow: 0 } };
    }

    return ph;
  });
}


function ExtractionCurve({ curve, updatePhase }) {
  if (!curve.phases || !curve.phases.length) return null;

  return (
    <div style={{ width: '100%', padding: '6px 4px 2px' }}>
      <ExtendedProfileChart data={curve} className='max-h-36' onFlowDrag={({ phaseIndex, field, value }) => {
        updatePhase(phaseIndex, {
          ...curve.phases[phaseIndex],
          pump: {
            ...curve.phases[phaseIndex].pump,
            flow: value.y.toFixed(2)
          }
        });

      }} onPressureDrag={({ phaseIndex, field, value }) => {
        updatePhase(phaseIndex, {
          ...curve.phases[phaseIndex],
          pump: {
            ...curve.phases[phaseIndex].pump,
            pressure: value.y.toFixed(2)
          }
        });
      }} />
    </div>
  );
}


function PhaseRow({ ph, pIdx, updatePhase, removePhase, movePhase, totalPhases, timeFactor, pressureFactor, flowFactor, temperatureFactor, basePhase }) {
  return (
    <details class="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-box mb-2">
      <summary class="collapse-title font-medium flex items-center justify-between pr-12 py-3 min-h-0">
        <div class="flex items-center gap-2">
          <span class="badge badge-sm badge-outline opacity-70 font-mono">#{pIdx + 1}</span>
          <span class="font-bold">{ph.name || `Unnamed Phase`}</span>
          <span class="text-xs opacity-60 font-mono hidden md:inline">({ph.phase || 'brew'}, {Math.round(ph.duration ?? 0)}s)</span>
        </div>
        <div class="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button type="button" class="btn btn-xs btn-ghost" disabled={pIdx === 0} onClick={() => movePhase(pIdx, -1)}>↑</button>
          <button type="button" class="btn btn-xs btn-ghost" disabled={pIdx === totalPhases - 1} onClick={() => movePhase(pIdx, 1)}>↓</button>
          <button type="button" class="btn btn-xs btn-error btn-outline ml-1" onClick={() => removePhase(pIdx)}>✕</button>
        </div>
      </summary>
      <div class="collapse-content space-y-4 pt-2 border-t border-base-content/5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="label label-text p-1 text-xs opacity-70">Phase Name</label>
            <input type="text" value={ph.name || ''} class="input input-sm input-bordered w-full" onInput={e => updatePhase(pIdx, { name: e.target.value })} />
          </div>
          <div>
            <label class="label label-text p-1 text-xs opacity-70">Phase Type</label>
            <select value={ph.phase || 'brew'} class="select select-sm select-bordered w-full text-sm" onChange={e => updatePhase(pIdx, { phase: e.target.value })}>
              {PHASE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label class="label label-text p-1 text-xs opacity-70">Duration (sec)</label>
            <input type="number" step="1" min="0" value={Math.round(ph.duration ?? 0)} class="input input-sm input-bordered w-full font-mono" onInput={e => updatePhase(pIdx, { duration: (parseFloat(e.target.value) || 0) / (ph.duration || 1) * (basePhase.duration || 1) })} />
          </div>
        </div>
        <div class="p-3 bg-base-300 rounded-lg space-y-3 border border-base-content/5">
          <span class="text-xs font-bold uppercase tracking-wider opacity-60">Pump Target Control</span>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label class="label label-text p-1 text-xs opacity-70">Control Mode</label>
              <select value={ph.pump?.target || 'pressure'} class="select select-sm select-bordered w-full text-xs" onChange={e => updatePhase(pIdx, { pump: { ...ph.pump, target: e.target.value } })}>
                {PUMP_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label class="label label-text p-1 text-xs opacity-70">Pressure Target (bar)</label>
              <input type="number" step="0.1" min="0" max="13" value={ph.pump?.pressure ?? 0} class="input input-sm input-bordered w-full font-mono" onInput={e => updatePhase(pIdx, { pump: { ...ph.pump, pressure: parseFloat(e.target.value) / (ph.pump?.pressure || 1) * (basePhase.pump?.pressure || 1) } })} />
            </div>
            <div>
              <label class="label label-text p-1 text-xs opacity-70">Flow Limit (ml/s)</label>
              <input type="number" step="0.1" min="0" max="10" value={ph.pump?.flow ?? 0} class="input input-sm input-bordered w-full font-mono" onInput={e => updatePhase(pIdx, { pump: { ...ph.pump, flow: parseFloat(e.target.value) / (ph.pump?.flow || 1) * (basePhase.pump?.flow || 1) } })} />
            </div>
            <div>
              <label class="label label-text p-1 text-xs opacity-70">Temperature (°C)</label>
              <input type="number" step="0.1" min="70" max="102" value={ph.temperature ?? 93} class="input input-sm input-bordered w-full font-mono" onInput={e => updatePhase(pIdx, { temperature: parseFloat(e.target.value) / (ph.temperature || 1) * (basePhase.temperature || 1) })} />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="label label-text p-1 text-xs opacity-70">Transition Shape</label>
            <select value={ph.transition?.type || 'linear'} class="select select-sm select-bordered w-full text-xs" onChange={e => updatePhase(pIdx, { transition: { ...ph.transition, type: e.target.value } })}>
              {TRANSITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div class="flex items-center gap-4 px-2 h-full mt-4">
            <label class="cursor-pointer flex items-center gap-2 select-none text-xs font-medium">
              <input type="checkbox" checked={!!ph.transition?.adaptive} class="checkbox checkbox-xs checkbox-primary" onChange={e => updatePhase(pIdx, { transition: { ...ph.transition, adaptive: e.target.checked } })} />
              Adaptive Ramp
            </label>
            <label class="cursor-pointer flex items-center gap-2 select-none text-xs font-medium">
              <input type="checkbox" checked={ph.valve === 0} class="checkbox checkbox-xs" onChange={e => updatePhase(pIdx, { valve: e.target.checked ? 0 : 1 })} />
              Close Valve
            </label>
          </div>
        </div>
        <div class="p-3 bg-base-300 rounded-lg space-y-2 border border-base-content/5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider opacity-60">Phase Cut-off Targets (OR)</span>
            <button type="button" class="btn btn-xs btn-outline btn-ghost" onClick={() => { const arr = [...(ph.targets || [])]; arr.push({ type: 'volumetric', operator: 'gte', value: 0 }); updatePhase(pIdx, { targets: arr }); }}>+ Add Target</button>
          </div>
          {(ph.targets || []).map((tgt, tIdx) => (
            <div key={tIdx} class="flex items-center gap-2 rounded border border-base-content/5">
              <select value={tgt.type || 'volumetric'} class="select select-xs select-bordered text-xs" onChange={e => { const arr = [...ph.targets]; arr[tIdx] = { ...arr[tIdx], type: e.target.value }; updatePhase(pIdx, { targets: arr }); }}>
                {STOP_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <select value={tgt.operator || 'gte'} class="select select-xs select-bordered text-xs" onChange={e => { const arr = [...ph.targets]; arr[tIdx] = { ...arr[tIdx], operator: e.target.value }; updatePhase(pIdx, { targets: arr }); }}>
                {OPERATORS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <input type="number" step="any" value={tgt.value ?? 0} class="input input-xs input-bordered font-mono text-xs" onInput={e => { const arr = [...ph.targets]; arr[tIdx] = { ...arr[tIdx], value: parseFloat(e.target.value) || 0 }; updatePhase(pIdx, { targets: arr }); }} />
              <button type="button" class="btn btn-xs btn-square btn-ghost ml-auto text-error" onClick={() => { const arr = ph.targets.filter((_, i) => i !== tIdx); updatePhase(pIdx, { targets: arr }); }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

// ─── MAIN COMPONENT DECK ──────────────────────────────────────────
export default function AdvancedProfileDesigner() {
  const apiService = useContext(ApiServiceContext);

  // Left side Control Panel Tabs
  const [leftTab, setLeftTab] = useState('variables');
  const [rightTab, setRightTab] = useState('engine');
  const [aiMsg, setAiMsg] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Raw Dial Controls
  const [rl, setRl] = useState(2);
  const [ra, setRa] = useState(1);
  const [rob, setRob] = useState(0);
  const [proc, setProc] = useState(['Washed']);
  const [ratioTarget, setRatioTarget] = useState(2.0);
  const [arch, setArch] = useState('Traditional Italian');
  const [dp, setDp] = useState(2);
  const [dose, setDose] = useState(18.0);
  const [ye, setYe] = useState(false);
  const [yt, setYt] = useState(36.0);

  const [profileId, setProfileId] = useState('');
  const [profileLabel, setProfileLabel] = useState('');
  const [profileDescription, setProfileDescription] = useState('');

  // API key stored in cookie, never in server/device state
  const readKeyCookie = () => { const m = document.cookie.match(/(?:^|; )gm_ai_key=([^;]*)/); return m ? decodeURIComponent(m[1]) : ''; };
  const writeKeyCookie = k => { document.cookie = `gm_ai_key=${encodeURIComponent(k)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Strict`; };
  const clearKeyCookie = () => { document.cookie = 'gm_ai_key=; path=/; max-age=0'; };
  const [apiKey, setApiKey] = useState(() => readKeyCookie());
  const [showKey, setShowKey] = useState(false);

  // Both distinct matrix states are preserved and independent!
  const [beanBp, setBeanBp] = useState({ Acidity: 5, Sweetness: 5, Bitterness: 5, Body: 5, Clarity: 5, Fruitiness: 5, Chocolate: 5, Roastiness: 5, Crema: 5, Floral: 5 });
  const [cupBp, setCupBp] = useState({ Acidity: 5, Sweetness: 5, Bitterness: 5, Body: 5, Clarity: 5, Fruitiness: 5, Chocolate: 5, Roastiness: 5, Crema: 5, Floral: 5 });
  const [visibleSpiders, setVisibleSpiders] = useState({ bean: true, cup: true, arch: true, final: true });

  // Saved Manifest Registries
  const [storedProfiles, setStoredProfiles] = useState(DEFAULT_SAVED_PROFILES);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileMeta, setProfileMeta] = useState({ id: 'sim_1', title: 'Phases', description: 'Generated matrix engine rules.' });

  // ── Overwrite dimension selector ────────────────────────────────
  // Controls which parameter dimensions applyParams will rewrite when
  // transforming an imported/base profile with the current engine params.
  const [overwriteFlags, setOverwriteFlags] = useState({ pressure: false, flow: false, temperature: false, duration: false, transitions: false });
  const toggleOverwrite = key => setOverwriteFlags(prev => ({ ...prev, [key]: !prev[key] }));

  // ── Pump Mode: override all brew phases to flow or pressure control ──
  const [pumpMode, setPumpMode] = useState('hybrid');
  const [pumpCoeffs, setPumpCoeffs] = useState({
    oneBarFlow: 10.205,
    nineBarFlow: 5.521
  });
  const [timeFactor, setTimeFactor] = useState(1.0);
  const [tempFactor, setTempFactor] = useState(1.0);
  const [pressFactor, setPressFactor] = useState(1.0);
  const [flowFactor, setFlowFactor] = useState(1.0);
  // ── Two-layer profile architecture ──────────────────────────────
  const [basePhases, setBasePhases] = useState(null);
  const [baseTempRef, setBaseTempRef] = useState(null);
  const [editPhases, setEditPhases] = useState(null);

  // Engine always recomputes from dials (used as fallback & for analytics)
  const profile = useMemo(() => {
    return buildProfile({ rl, ra, rob, proc, ratioTarget, arch, dp, beanBp, cupBp, dose, ye, yt, profileId, profileLabel, profileDescription });
  }, [rl, ra, rob, proc, ratioTarget, arch, dp, beanBp, cupBp, dose, ye, yt, profileId, profileLabel, profileDescription]);

  // Neutral reference: same arch, neutral bean params, medium roast, dp=2 (1.0×)
  // This is the "zero point" — no adjustment when params match this reference.
  const neutralBp = useMemo(() => Object.fromEntries(
    ['Acidity', 'Sweetness', 'Bitterness', 'Body', 'Clarity', 'Fruitiness', 'Chocolate', 'Roastiness', 'Crema', 'Floral'].map(k => [k, 5])
  ), []);
  const refProfile = useMemo(() => {
    return buildProfile({ rl: 2, ra: 1, rob: 50, proc: ['Washed'], ratioTarget: 2.0, arch, dp: 2, beanBp: neutralBp, cupBp: neutralBp, dose: 18, ye: false, yt: 36, profileId: '', profileLabel: '', profileDescription: '' });
  }, [arch, neutralBp]);

  const durMult = [0.60, 0.80, 1.00, 1.22, 1.50][dp] ?? 1.0;
  const yv = (ye ? yt : r1(dose * ratioTarget));
  const engineTemp = profile.baseTemp;

  // Template: manual edits > imported base > engine phases
  const templatePhases = editPhases ?? basePhases ?? profile.json.phases;
  const templateBaseTemp = baseTempRef ?? engineTemp;

  // For archetype mode (no import/edit): profile.json.phases already has all params baked in
  // correctly by buildProfile. overwriteFlags are applied by selectively replacing each
  // unchecked dimension's values with what the neutral refProfile would produce — so unchecked
  // dims stay at neutral, checked dims use the full current-param result. No double-application.
  //
  // For import/edit mode: applyParams shifts the imported base phases by the delta
  // (refProfile → profile) for each checked dimension, same as before.
  const activePhases = (() => {
    if (basePhases === null && editPhases === null) {
      // Archetype mode: merge current and ref phases per overwriteFlags
      let curr = profile.json.phases;
      const ref = refProfile.json.phases;
      curr = curr.map((ph, i) => {
        const rph = ref[i] ?? ph;
        return {
          ...ph,
          temperature: overwriteFlags.temperature ? ph.temperature : rph.temperature,
          duration: overwriteFlags.duration ? ph.duration : rph.duration,
          pump: {
            ...ph.pump,
            pressure: overwriteFlags.pressure ? ph.pump?.pressure : rph.pump?.pressure,
            flow: overwriteFlags.flow ? ph.pump?.flow : rph.pump?.flow,
          },
          transition: overwriteFlags.transitions ? ph.transition : rph.transition,
        };
      });
      return scaleProfile(curr, timeFactor, tempFactor, pressFactor, flowFactor);
    }
    return applyParams(templatePhases, {
      baseTemp: templateBaseTemp,
      targetTemp: engineTemp,
      refTemp: refProfile.baseTemp,
      durMult,
      refDurMult: 1.0,
      refYv: yv,
      targetYv: yv * (1 - (profile.finalBp.Sweetness * 0.5) + (profile.finalBp.Acidity * 0.3) + (profile.finalBp.Clarity * 0.7)),
      flavourProfile: profile.finalBp,
      targetPeakP: profile.peakP,
      refPeakP: refProfile.peakP,
      targetMainF: profile.mainF,
      refMainF: refProfile.mainF,
      overwriteFlags,
      timeFactor,
      tempFactor,
      pressFactor,
      flowFactor
    });
  })();

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const settings = await res.json();

        const coeffs = String(settings?.pumpModelCoeffs ?? '')
          .split(',')
          .map(v => parseFloat(v.trim()));

        if (
          mounted &&
          coeffs.length >= 2 &&
          Number.isFinite(coeffs[0]) &&
          Number.isFinite(coeffs[1])
        ) {
          setPumpCoeffs({
            oneBarFlow: coeffs[0],
            nineBarFlow: coeffs[1]
          });
        }
      } catch (err) {
        console.error('Failed loading pump coefficients:', err);
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);
  const ONE_BAR_FLOW = pumpCoeffs.oneBarFlow;
  const NINE_BAR_FLOW = pumpCoeffs.nineBarFlow;
  // Apply pump mode override last (after all other transforms)
  const activePhasesWithMode = applyPumpMode(activePhases, pumpMode, ONE_BAR_FLOW, NINE_BAR_FLOW);

  const loadProfiles = async () => {
    const response = await apiService.request({ tp: 'req:profiles:list' });
    setStoredProfiles(response.profiles);
  };
  useEffect(() => {
    const fetchHardwareProfiles = async () => {
      if (!connected.value) return;
      setLoadingProfiles(true);
      try {
        await loadProfiles();
      } catch (err) {
        console.error("Failed querying GaggiMate profile index:", err);
      } finally {
        setLoadingProfiles(false);
      }
    }
    fetchHardwareProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected.value]);

  function normalizeProfile(p) {
    return {
      id: p.id ?? `import-${Date.now()}`,
      label: p.label ?? p.title ?? 'Imported Profile',
      description: p.description ?? '',
      phases: (p.phases ?? []).map(ph => ({
        ...ph,
        targets: ph.targets ? [...ph.targets] : []
      })),
      type: p.type ?? 'pro',
      temperature: p.temperature ?? p.preheat_temperature ?? 93
    };
  }
  // Restores balance by filling both spiders contextually when importing a flat profile
  function importProfile(p) {
    const imported = normalizeProfile(p);

    // Detect reference temperature from the imported profile
    let detectedTemp = imported.temperature ?? 93.0;
    if (p.phases && p.phases.length) {
      const brewPhases = p.phases.filter(ph => ph.phase === 'brew');
      const srcPhases = brewPhases.length ? brewPhases : p.phases;
      detectedTemp = srcPhases[0].temperature ?? detectedTemp;
    }

    // Store as the immutable base template
    setBasePhases(imported.phases);
    setProfileMeta({ ...profileMeta, title: p.label ?? p.id ?? 'Imported Profile' });
    setBaseTempRef(detectedTemp);

    setEditPhases(imported.phases);

    // Sync metadata fields
    if (p.label) { setProfileLabel(p.label); }
    if (p.description) { setProfileDescription(p.description); }
    if (p.id) { setProfileId(p.id); }

    // Infer parameters from the profile so sliders reflect it
    let detectedPeakP = 9.0;
    if (p.phases && p.phases.length) {
      const brewPhases = p.phases.filter(ph => ph.phase === 'brew');
      const srcPhases = brewPhases.length ? brewPhases : p.phases;
      detectedPeakP = Math.max(...srcPhases.map(ph => ph.pump?.pressure ?? 0));
    }
    if (p.preheat_temperature) detectedTemp = p.preheat_temperature - 1.5;

    const inferredRoast = clamp(Math.round((95.5 - detectedTemp) / 1.4), 0, 5);
    setRl(inferredRoast);

    /*    setBeanBp({
          Acidity:    clamp(inferredRoast < 2 ? 7 : 4, 1, 10),
          Sweetness:  5,
          Bitterness: clamp(inferredRoast + 1, 1, 10),
          Body:       clamp(detectedPeakP > 9.0 ? 7 : 5, 1, 10),
          Clarity:    5,
          Fruitiness: clamp(6 - inferredRoast, 1, 10),
          Chocolate:  clamp(inferredRoast + 2, 1, 10),
          Roastiness: clamp(inferredRoast * 1.5, 1, 10),
          Crema:      5,
          Floral:     clamp(5 - inferredRoast, 1, 10)
        });
    
        setCupBp({
          Acidity:    clamp(detectedPeakP < 7.5 ? 8 : 5, 1, 10),
          Sweetness:  p.label?.toLowerCase().includes('sweet') ? 8 : 6,
          Bitterness: clamp(inferredRoast + 2, 1, 10),
          Body:       clamp(detectedPeakP > 9.0 ? 8 : 5, 1, 10),
          Clarity:    clamp(detectedPeakP < 7.0 ? 8 : 4, 1, 10),
          Fruitiness: clamp(7 - inferredRoast, 1, 10),
          Chocolate:  clamp(inferredRoast + 3, 1, 10),
          Roastiness: clamp(inferredRoast * 2, 1, 10),
          Crema:      clamp(detectedPeakP > 8.5 ? 7 : 4, 1, 10),
          Floral:     clamp(6 - inferredRoast, 1, 10)
        });
    */
    const matchedArch = ARCHETYPES.find(a =>
      p.label?.toLowerCase().includes(a.id.toLowerCase().split(' ')[0])
    );
    if (matchedArch) setArch(matchedArch.id);

    setRightTab('engine');
    setAiMsg('✓ Loaded — imported phases are now the base template. Parameters still apply on top.');
    setTimeout(() => setAiMsg(''), 5000);
  }
  async function sendToGaggiMate(asNew = false) {
    const id = asNew ? getCompactId(profile.json.id, storedProfiles) : profile.json.id;
    const out = {
      id,
      label: profile.json.label,
      type: 'pro',
      description: profile.json.description,
      temperature: Math.round(profile.baseTemp),
      utility: false,
      phases: activePhasesWithMode.map(ph => ({
        name: ph.name,
        phase: ph.phase,
        valve: ph.valve ?? 1,
        duration: Math.round(ph.duration),
        temperature: Math.round(ph.temperature * 10) / 10,
        transition: {
          type: ph.transition?.type || 'linear',
          duration: Math.round(ph.transition?.duration || 0),
          adaptive: ph.transition?.adaptive || false
        },
        pump: {
          target: ph.pump?.target || 'pressure',
          pressure: ph.pump?.pressure ? parseFloat(ph.pump.pressure.toFixed(1)) : 0,
          flow: ph.pump?.flow ? parseFloat(ph.pump.flow.toFixed(2)) : 0
        },
        targets: (ph.targets || []).map(tgt => ({
          type: tgt.type,
          operator: tgt.operator,
          value: tgt.value
        }))
      }))
    };
    try {
      await apiService.request({ tp: 'req:profiles:save', profile: out });
      setAiMsg(asNew ? '✓ Saved as new profile' : '✓ Sent to GaggiMate');
      setTimeout(() => setAiMsg(''), 3000);
      // Refetch stored profiles so registry stays in sync
      try { await loadProfiles(); } catch (_) { }
    } catch (err) {
      setAiMsg('✗ ' + (err?.message ?? 'Send failed'));
      setTimeout(() => setAiMsg(''), 4000);
    }
  }

  const toggleSpider = key => setVisibleSpiders(prev => ({ ...prev, [key]: !prev[key] }));
  const handleToggleProc = p => setProc(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  // Block Array Adjusters
  const updatePhase = (idx, patch) => {
    setEditPhases(prev => {
      const base = prev ?? JSON.parse(JSON.stringify(profile.json.phases));
      return base.map((p, i) => i === idx ? { ...p, ...patch } : p);
    });
  };
  const removePhase = idx => {
    setEditPhases(prev => {
      const base = prev ?? JSON.parse(JSON.stringify(profile.json.phases));
      return base.filter((_, i) => i !== idx);
    });
    setBasePhases(prev => {
      const base = prev ?? JSON.parse(JSON.stringify(profile.json.phases));
      return base.filter((_, i) => i !== idx);
    });
  };

  const movePhase = (idx, dir) => {
    setEditPhases(prev => {
      const arr = [...(prev ?? JSON.parse(JSON.stringify(profile.json.phases)))];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
    setBasePhases(prev => {
      const arr = [...(prev ?? JSON.parse(JSON.stringify(profile.json.phases)))];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };
  const addBlankPhase = () => {
    const ph = (prev => {
      const base = prev ?? JSON.parse(JSON.stringify(activePhasesWithMode));
      return [...base, { name: 'Ext Stage', phase: 'brew', duration: 5, temperature: parseFloat(engineTemp.toFixed(1)), pump: { target: 'pressure', pressure: 6.0, flow: 2.2 }, targets: [] }];
    });
    setEditPhases(ph);
    setBasePhases(ph);
  };

  // ─── PROFILE FILES IO SYSTEM DECK ──────────────────────────────
  const handleLoadStoredProfile = item => importProfile(item);

  const generateAiProfile = async () => {
    if (!prompt.trim()) return;
    if (!apiKey.trim()) { setAiMsg('✗ No HuggingFace token set — add it in the AI tab.'); setTimeout(() => setAiMsg(''), 5000); return; }
    setIsGenerating(true); setAiMsg('Synthesizing profile...');
    try {
      const currentProfileJson = JSON.stringify(activePhasesWithMode, null, 2);

      const systemPrompt = `You are an expert espresso machine profiling engine for GaggiMate.

Your task is to MODIFY an existing extraction profile according to the user's request.

Output ONLY a raw JSON array of extraction phases.
Do not output explanations, markdown, code fences, comments, or any text before or after the JSON.

Current context:
Roast=${ROAST_LABELS[rl]}
Age=${AGE_LABELS[ra]}
Processing=${proc.join('+')}
Archetype=${arch}
Dose=${dose}g
Target yield=${r1(dose * ratioTarget)}g

Current profile:
${currentProfileJson}

Phase object schema (targets field is optional):
{"name":string,"phase":"preinfusion"|"brew","valve":1,"duration":number,"temperature":number,"transition":{"type":"instant"|"linear"|"ease-out"|"ease-in","duration":number,"adaptive":boolean},"pump":{"target":"pressure"|"flow","pressure":number,"flow":number},"targets":[{"type":"pressure"|"flow"|"volumetric"|"pumped","operator":"gte"|"lte","value":number}]}

Rules:
- Adapt the existing profile rather than creating a completely unrelated one.
- Preserve phases unless the requested change requires modification.
- Keep all values realistic.
- Preinfusion phases must remain before brew phases.
- Pressure: 0-12 bar.
- Flow: 0-8 ml/s.
- Always keep at least one preinfusion phase and one brew phase.

Output ONLY the JSON array, starting with [`;
      // HF OpenAI-compatible endpoint — works with free tokens, no cold-start issues
      const response = await fetch(
        'https://router.huggingface.co/novita/v3/openai/chat/completions',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey.trim()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            max_tokens: 900,
            temperature: 0.3
          })
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? err?.error ?? `HTTP ${response.status}`);
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content ?? '';
      if (!raw) throw new Error('Empty response from model');

      // Extract JSON array — model may still add a tiny preamble
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON array found in model response');
      const phases = JSON.parse(match[0]);
      if (!Array.isArray(phases) || !phases.length) throw new Error('Parsed result is not a valid phases array');

      setEditPhases(phases);
      setLeftTab('pipeline');
      setAiMsg(`✓ AI generated ${phases.length} phases — loaded into editor.`);
    } catch (e) {
      setAiMsg(`✗ ${e.message}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setAiMsg(''), 8000);
    }
  };
  const buttonClassActive = `p-2 text-left rounded-md border transition-all text-xs bg-secondary/10 border-secondary text-secondary font-bold`;
  const buttonClassInactive = `p-2 text-left rounded-md border transition-all text-xs bg-base-300 border-base-content/10`;
  return (
    <div class="p-4 max-w-7xl mx-auto space-y-6 text-base-content min-h-screen">
      {/* GLOBAL BANNER HEADER */}
      <div class="border-base-content/10">
        <div>
          <h1 class="flex-grow text-2xl font-bold sm:text-3xl">Profile Generator</h1>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COMPONENT DECK ROW */}
        <div class="lg:col-span-7 space-y-2">

          {/* TAB: VARIABLES */}
          <details class="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-xl shadow-sm" open>
            <summary class="collapse-title font-bold text-sm py-3 min-h-0 cursor-pointer select-none">Main Settings</summary>
            <div class="collapse-content">
              <div class="space-y-1 pb-2">

                {/* ARCHETYPES */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Archetypes</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-1">
                      {ARCHETYPES.map(a => (
                        <button key={a.id} type="button" onClick={() => {
                          setArch(a.id);
                          setProfileMeta({ ...profileMeta, title: a.id ?? 'Unknown Archetype' });
                        }}
                          class={`${arch === a.id ? buttonClassActive : buttonClassInactive}`}>
                          <div class="truncate font-bold">{a.id}</div>
                          <div class="text-[9px] opacity-40 truncate">{a.tag}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </details>

                {/* PUMP CONTROL MODE */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Pump Control Mode</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-3 gap-1.5 mt-1">
                      {PUMP_MODES.map(m => (
                        <button key={m.id} type="button" onClick={() => setPumpMode(m.id)}
                          class={`${pumpMode === m.id ? buttonClassActive : buttonClassInactive}`}>
                          <div class="font-bold truncate">{m.label}</div>
                          <div class="text-[9px] opacity-40 leading-tight mt-0.5">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                    {pumpMode !== 'hybrid' && (
                      <div class="mt-1.5 text-[10px] font-mono opacity-50 px-0.5">
                        {pumpMode === 'flow' ? '↳ All brew phases use flow target — pressure acts as resistance cap' : '↳ All brew phases use pressure target — flow acts as soft limit'}
                      </div>
                    )}
                  </div>
                </details>

                {/* SCALES */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg">
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Scales</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-1 gap-4 pt-2">
                      <div class="flex flex-col md:flex-row text-xs gap-2">
                        <div class="w-50 text-xs font-bold font-mono">Time Scale: {timeFactor}x</div>
                        <input type="range" min="0.1" max="4.0" step="0.1" value={timeFactor} class="w-full md:flex-1 range range-xs range-primary" onInput={(e) => setTimeFactor(parseFloat(e.target.value))} />
                      </div>
                      <div class="flex flex-col md:flex-row text-xs gap-2">
                        <div class="w-50 text-xs font-bold font-mono">Temp Scale: {tempFactor}x</div>
                        <input type="range" min="0.7" max="1.2" step="0.01" value={tempFactor} class="w-full md:flex-1 range range-xs range-primary" onInput={(e) => setTempFactor(parseFloat(e.target.value))} />
                      </div>
                      <div class="flex flex-col md:flex-row text-xs gap-2">
                        <div class="w-50 text-xs font-bold font-mono">Pressure Scale: {pressFactor}x</div>
                        <input type="range" min="0.5" max="1.5" step="0.1" value={pressFactor} class="w-full md:flex-1 range range-xs range-primary" onInput={(e) => setPressFactor(parseFloat(e.target.value))} />
                      </div>
                      <div class="flex flex-col md:flex-row text-xs gap-2">
                        <div class="w-50 text-xs font-bold font-mono">Flow Scale: {flowFactor}x</div>
                        <input type="range" min="0.5" max="1.5" step="0.1" value={flowFactor} class="w-full md:flex-1 range range-xs range-primary" onInput={(e) => setFlowFactor(parseFloat(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </details>

                {/* ROAST PROFILE */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Roast Profile</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-1 gap-4 pt-2">
                      <div class="flex flex-col md:flex-row text-xs gap-2">
                        <div class="w-30 text-xs font-bold font-mono">Roast Grade</div>
                        <input type="range" min="0" max="5" value={rl} step="1" class="w-full md:flex-1 range range-xs range-primary" onInput={e => setRl(parseInt(e.target.value))} />
                        <div class="w-30 text-xs font-bold font-mono">{ROAST_LABELS[rl]}</div>
                      </div>
                      <div class="flex text-xs flex-col md:flex-row gap-2">
                        <div class="w-30 text-xs font-bold font-mono">Roast Age</div>
                        <input type="range" min="0" max="2" value={ra} step="1" class="w-full md:flex-1 range range-xs range-primary" onInput={e => setRa(parseInt(e.target.value))} />
                        <div class="w-30 text-xs font-bold font-mono">{AGE_LABELS[ra]}</div>
                      </div>
                      <div class="flex text-xs gap-2 flex-col md:flex-row">
                        <label class="w-30 text-xs font-bold font-mono">Robusta {rob}%</label>
                        <input type="range" min="0" max="100" value={rob} step="5" class="w-full md:flex-1 range range-xs range-primary" onInput={e => setRob(parseInt(e.target.value))} />
                        <div class="w-30 text-xs font-bold font-mono">Arabica {100 - rob}%</div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* SHOT PARAMETERS */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Shot Parameters</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-1 gap-4 pt-2">
                      <div class="flex space-x-2 flex-col md:flex-row">
                        <div class="w-30 text-xs font-bold font-mono">Shot Duration</div>
                        <input type="range" min="0" max="4" value={dp} step="1" class="w-full md:flex-1 range range-xs range-primary" onInput={e => setDp(parseInt(e.target.value))} />
                        <div class="w-30 text-xs font-bold font-mono">Weight Index: {dp}</div>
                      </div>
                      <div class="flex text-xs gap-2 flex-col md:flex-row">
                        <label class="w-30 text-xs font-bold font-mono">Extraction Ratio</label>
                        <input type="range" min="1" max="4" value={ratioTarget} step="0.1" class="w-full md:flex-1 range range-xs range-primary" onInput={e => setRatioTarget(parseFloat(e.target.value))} />
                        <div class="w-30 text-xs font-bold font-mono">1 : {ratioTarget.toFixed(1)}</div>
                      </div>
                    </div>
                  </div>
                </details>

                {/* BEAN PROCESSING */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Bean Processing</summary>
                  <div class="collapse-content pb-3">
                    <div class="flex flex-wrap gap-1 pt-2">
                      {PROCESSING.map(p => (
                        <button key={p} type="button" onClick={() => handleToggleProc(p)} class={`btn btn-xs ${proc.includes(p) ? 'btn-secondary' : 'btn-ghost bg-base-300'}`}>{p}</button>
                      ))}
                    </div>
                  </div>
                </details>

                {/* DOSE & YIELD */}
                <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
                  <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Dose &amp; Yield</summary>
                  <div class="collapse-content pb-3">
                    <div class="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <HDivider label="Bean Dose (g)" />
                        <input type="number" step="0.1" value={dose} class="input input-xs input-bordered font-mono w-full" onInput={e => setDose(parseFloat(e.target.value) || 0)} />
                      </div>
                      <div>
                        <HDivider label="Yield (g)" />
                        <div class="flex items-center gap-2">
                          <div class="link text-[10px] lowercase text-secondary" onClick={() => setYe(!ye)}>{ye ? 'switch to ratio calculation' : 'switch to fixed yield weight'}</div>
                          {ye ? (
                            <input type="number" step="0.5" value={yt} class="input input-xs input-bordered font-mono flex-1" onInput={e => setYt(parseFloat(e.target.value) || 0)} />
                          ) : (
                            <div class="bg-base-300 rounded text-xs font-mono font-bold text-center border border-base-content/5 opacity-70 flex-1">Calculated Yield: {profile.yv}g</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

              </div>
            </div>
          </details>

          {/* TAB: PIPELINE */}
          <details class="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-xl shadow-sm" open>
            <summary class="collapse-title font-bold text-sm py-3 min-h-0 cursor-pointer select-none">Phases ({activePhasesWithMode.length})</summary>
            <div class="collapse-content">
              <div class="space-y-3 pb-4">

                <div class="p-3 rounded-lg bg-base-300 border border-base-content/10 space-y-2">
                  <div class="text-[10px] font-bold uppercase tracking-wider opacity-60">Apply Archetype Transitions To Imported Profile</div>
                  <div class="flex flex-wrap gap-3">
                    {[
                      { key: 'pressure', label: 'Pressure' },
                      { key: 'flow', label: 'Flow' },
                      { key: 'temperature', label: 'Temperature' },
                      { key: 'duration', label: 'Duration' },
                      { key: 'transitions', label: 'Transitions' },
                    ].map(({ key, label }) => (
                      <label key={key} class="cursor-pointer flex items-center gap-1.5 select-none text-xs font-medium" style={{ color: overwriteFlags[key] ? 'var(--color-secondary)' : undefined }}>
                        <input type="checkbox" class="checkbox checkbox-xs" checked={overwriteFlags[key]}
                          style={{ accentColor: 'var(--color-secondary)' }}
                          onChange={() => toggleOverwrite(key)} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div class="text-[9px] opacity-40 font-mono">Select which dimensions will be applied to the profile.</div>
                </div>

                <div class="flex items-center justify-between px-1">
                  <div class="label text-[10px] uppercase font-bold">PHASES</div>
                  <button type="button" class="btn btn-xs btn-primary font-mono" onClick={addBlankPhase}>+ Add Phase</button>
                </div>
                <div class="overflow-y-auto pr-1">
                  {activePhasesWithMode.map((ph, pIdx) => (
                    <PhaseRow key={pIdx} ph={ph} basePhase={editPhases?.[pIdx] ?? ph} pIdx={pIdx} updatePhase={updatePhase} removePhase={removePhase} movePhase={movePhase} totalPhases={activePhasesWithMode.length} timeFactor={timeFactor} pressureFactor={pressFactor} flowFactor={flowFactor} temperatureFactor={tempFactor} />
                  ))}
                </div>
              </div>
            </div>
          </details>

          {/* TAB: REGISTRY TABLE STORAGE */}
          <details class="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-xl shadow-sm">
            <summary class="collapse-title font-bold text-sm py-3 min-h-0 cursor-pointer select-none">Saved Files ({storedProfiles.length})</summary>
            <div class="collapse-content">
              <div class="pb-4">
                <HDivider label="Stored Profiles" />
                {loadingProfiles ? (
                  <div style={{ fontSize: 11, color: T.muted, padding: 10, fontStyle: 'italic' }}>Querying hardware index...</div>
                ) : (
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {storedProfiles.length === 0 && <span class="text-xs opacity-50 p-2 italic">No profiles stored on hardware filesystem.</span>}
                    {storedProfiles.map(p => (
                      <button key={p.id} onClick={() => importProfile(p)} style={{ padding: '6px 10px', textAlign: 'left', width: '100%', cursor: 'pointer', background: T.card, border: `1px solid ${T.border}`, color: T.text }} class="rounded-lg hover:bg-base-300 transition-colors">
                        <div style={{ fontSize: 11, fontWeight: 500 }}>{p.label ?? p.id}</div>
                        {p.description && <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>{p.description}</div>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* TAB: AI ENGINE PROMPT */}
          <details class="collapse collapse-arrow bg-base-200 border border-base-content/10 rounded-xl shadow-sm">
            <summary class="collapse-title font-bold text-sm py-3 min-h-0 cursor-pointer select-none">AI</summary>
            <div class="collapse-content">
              <div class="space-y-4 pb-4">
                {/* API KEY SECTION */}
                <div>
                  <HDivider label="HuggingFace Token" />
                  <div class="flex gap-2 items-center mt-1">
                    <input
                      type={showKey ? 'text' : 'password'}
                      class="input input-bordered input-xs flex-1 font-mono text-[10px]"
                      placeholder="hf_..."
                      value={apiKey}
                      onInput={e => setApiKey(e.target.value)}
                    />
                    <button type="button" class="btn btn-xs btn-ghost opacity-60" onClick={() => setShowKey(s => !s)}>
                      {showKey ? '🙈' : '👁'}
                    </button>
                    {apiKey && (
                      <button type="button" class="btn btn-xs btn-ghost text-error" onClick={() => { clearKeyCookie(); setApiKey(''); }}>
                        Clear
                      </button>
                    )}
                  </div>
                  <div class="flex gap-2 mt-1.5">
                    <button type="button" class="btn btn-xs btn-outline flex-1" onClick={() => { writeKeyCookie(apiKey); setAiMsg('✓ Token saved to cookie'); setTimeout(() => setAiMsg(''), 3000); }} disabled={!apiKey.trim()}>
                      Save to Cookie
                    </button>
                    <span class={`text-[10px] font-mono my-auto ${apiKey ? 'text-success' : 'opacity-40'}`}>
                      {apiKey ? (readKeyCookie() === apiKey ? '● saved' : '○ unsaved') : 'no token'}
                    </span>
                  </div>
                  <p class="text-[9px] opacity-40 mt-1 font-mono">Free token from huggingface.co/settings/tokens — stored in browser cookie only.</p>
                </div>

                {/* PROMPT SECTION */}
                <div>
                  <HDivider label="Natural Language Prompter" />
                  <textarea
                    class="textarea textarea-bordered w-full text-xs h-20 font-mono mt-1"
                    placeholder="e.g., Long lever-style gentle pressure decay for a light Ethiopian natural, targeting clarity and florals..."
                    value={prompt}
                    onInput={e => setPrompt(e.target.value)}
                  />
                </div>
                <button type="button" class="btn btn-sm btn-accent w-full" onClick={generateAiProfile} disabled={isGenerating || !prompt.trim() || !apiKey.trim()}>
                  {isGenerating ? <span class="loading loading-spinner loading-xs"></span> : 'Synthesize AI Profile'}
                </button>
              </div>
            </div>
          </details>

          {aiMsg && <div class="p-2 rounded bg-base-300/80 font-mono text-[11px] border border-base-content/5">{aiMsg}</div>}

        </div>

        {/* RIGHT ANALYTICS COMPONENT PANEL */}
        <div class="lg:col-span-5 space-y-2">
          <div class="card bg-base-200 border border-base-content/10 shadow-lg p-3 space-y-2 sticky top-4">

            {/* SPIDER GRID INTERACTIVE VECTOR */}
            <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
              <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Flavour Diagram</summary>
              <div class="collapse-content pb-2">
                <div class="flex flex-col items-center py-4 bg-base-300 rounded-xl border border-base-content/5 space-y-3">
                  <ExtendedRadarChart
                    data={{
                      labels: AXES,
                      beanFlavour: AXES.map(k => beanBp[k]),
                      intendedCupFlavour: AXES.map(k => cupBp[k]),
                      archetypeTendency: AXES.map(k => profile.archTend[k]),
                      predictedFlavour: AXES.map(k => profile.finalBp[k]),
                    }} className="max-w-[400px] max-h-[400px]" onDragEnd={(dataset) => {
                      if (dataset.datasetIndex === 0) {
                        setBeanBp(prev => ({ ...prev, [dataset.label]: dataset.value }));
                      } else if (dataset.datasetIndex === 1) {
                        setCupBp(prev => ({ ...prev, [dataset.label]: dataset.value }));
                      }
                    }}
                  />
                </div>
              </div>
            </details>

            {/* PARENT-BOUNDED DYNAMIC SVG CURVE */}
            <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
              <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">
                Extraction Curve
                <span class="ml-2 font-mono font-normal opacity-50">{profile.total}s · {profile.baseTemp * tempFactor}°C</span>
              </summary>
              <div class="collapse-content pb-2">
                <div class="flex flex-col items-center py-4 bg-base-300 rounded-xl border border-base-content/5 space-y-3">
                  <div class="flex w-full text-center text-[10px] font-mono opacity-60 mb-1">
                    <div class="flex-1">Calculated Thermal Base: <b style={{ color: T.orange }}>{profile.baseTemp * tempFactor}°C</b></div>
                    <div class="flex-1">Shot Duration: <b>{profile.total}s</b></div>
                    {pumpMode !== 'hybrid' && (
                      <div class="flex-1 text-accent font-bold uppercase">{pumpMode}-mode</div>
                    )}
                  </div>
                  <ExtractionCurve curve={{
                    label: profile.json.label,
                    type: 'pro',
                    description: profile.json.description ?? '',
                    temperature: Math.round(profile.baseTemp * tempFactor),
                    utility: false,
                    phases: activePhasesWithMode.map(ph => ({
                      name: ph.name,
                      phase: ph.phase,
                      valve: ph.valve ?? 1,
                      duration: Math.round(ph.duration),
                      temperature: Math.round(ph.temperature * 10) / 10,
                      transition: {
                        type: ph.transition?.type || 'linear',
                        duration: Math.round(ph.transition?.duration || 0),
                        adaptive: ph.transition?.adaptive || false
                      },
                      pump: {
                        target: ph.pump?.target || 'pressure',
                        pressure: ph.pump?.pressure ? parseFloat(ph.pump.pressure.toFixed(1)) : 0,
                        flow: ph.pump?.flow ? parseFloat(ph.pump.flow.toFixed(2)) : 0
                      },
                      targets: (ph.targets || []).map(tgt => ({
                        type: tgt.type,
                        operator: tgt.operator,
                        value: tgt.value
                      }))
                    }))
                  }} updatePhase={updatePhase} />
                </div>
              </div>
            </details>

            {/* PROFILE META FIELDS (ID, Label, Description) */}
            <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg" open>
              <summary class="collapse-title py-2 min-h-0 font-bold text-[10px] uppercase tracking-wider opacity-70 cursor-pointer select-none">Profile Identity</summary>
              <div class="collapse-content pb-2">
                <div class="space-y-2 pt-1">
                  <div class="flex gap-2">
                    <div class="flex-1">
                      <label class="label text-[10px] font-bold p-0 mb-0.5 opacity-60">ID</label>
                      <input class="input input-bordered input-xs w-full font-mono text-[10px]"
                        placeholder={`${arch.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 16)}-xxxx`}
                        value={getCompactId(profile.json.id, storedProfiles)}
                        onInput={e => setProfileId(e.target.value)} />
                    </div>
                    <div class="flex-[2]">
                      <label class="label text-[10px] font-bold p-0 mb-0.5 opacity-60">Label</label>
                      <input class="input input-bordered input-xs w-full text-xs"
                        placeholder={`${arch} (${ROAST_LABELS[rl]})`}
                        value={profileLabel}
                        onInput={e => setProfileLabel(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label class="label text-[10px] font-bold p-0 mb-0.5 opacity-60">Description</label>
                    <input class="input input-bordered input-xs w-full text-xs"
                      placeholder={`Generated for ${ROAST_LABELS[rl]} roast, ${AGE_LABELS[ra]} age profile via engine layout.`}
                      value={profileDescription}
                      onInput={e => setProfileDescription(e.target.value)} />
                  </div>
                </div>
              </div>
            </details>

            {/* ACTION BUTTONS */}
            <div class="flex w-full gap-2 px-1 py-2">
              {basePhases &&
                <button class="btn btn-sm btn-outline btn-secondary h-auto flex-1 bg-base-200" onClick={() => {
                  setBasePhases(null); setBaseTempRef(null); setEditPhases(null); setRightTab('engine'); setProfileMeta({ ...profileMeta, title: 'Phases' });
                  setProfileId(null);
                }}>
                  Reset Phases
                </button>
              }
              <button class="btn btn-sm btn-outline btn-secondary h-auto flex-1 bg-base-200" onClick={() => sendToGaggiMate(true)}>
                Save as New
              </button>
              <button class="btn btn-sm btn-outline btn-secondary h-auto flex-1 bg-base-200" onClick={() => sendToGaggiMate(false)}>
                Synchronize imported Profile
              </button>
            </div>

            {/* RAW CODE STRUCT PAYLOAD EXPOSE */}
            <details class="collapse collapse-arrow bg-base-300/40 border border-base-content/5 rounded-lg text-xs">
              <summary class="collapse-title font-mono font-bold py-2 min-h-0 text-[10px] uppercase tracking-wider opacity-70">Raw JSON Profile</summary>
              <div class="collapse-content pt-1">
                <pre class="bg-base-300 text-[10px] p-2 rounded overflow-x-auto max-h-40 font-mono">
                  {JSON.stringify({
                    id: getCompactId(profile.json.id, storedProfiles),
                    label: profile.json.label,
                    type: 'pro',
                    description: profile.json.description ?? '',
                    temperature: Math.round(profile.baseTemp * tempFactor),
                    utility: false,
                    phases: activePhasesWithMode.map(ph => ({
                      name: ph.name,
                      phase: ph.phase,
                      valve: ph.valve ?? 1,
                      duration: Math.round(ph.duration),
                      temperature: Math.round(ph.temperature * 10) / 10,
                      transition: {
                        type: ph.transition?.type || 'linear',
                        duration: Math.round(ph.transition?.duration || 0),
                        adaptive: ph.transition?.adaptive || false
                      },
                      pump: {
                        target: ph.pump?.target || 'pressure',
                        pressure: ph.pump?.pressure ? parseFloat(ph.pump.pressure.toFixed(1)) : 0,
                        flow: ph.pump?.flow ? parseFloat(ph.pump.flow.toFixed(2)) : 0
                      },
                      targets: (ph.targets || []).map(tgt => ({
                        type: tgt.type,
                        operator: tgt.operator,
                        value: tgt.value
                      }))
                    }))
                  }, null, 2)}
                </pre>
              </div>
            </details>

          </div>
        </div>

      </div>
    </div>
  );
}