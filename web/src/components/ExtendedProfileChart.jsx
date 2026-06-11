import { Chart } from 'chart.js';
import { ChartComponent } from './Chart';

// ─── Constants ───────────────────────────────────────────────────────────────

const POINT_INTERVAL = 0.1; // s

// ─── Helpers ─────────────────────────────────────────────────────────────────

const skipped = (ctx, value) => (!ctx.p0.raw.target ? value : undefined);

const pressureDatasetDefaults = {
  label: 'Pressure',
  borderColor: 'rgb(75, 192, 192)',
  tension: 0.4,
  cubicInterpolationMode: 'monotone',
  segment: {
    borderColor: ctx => skipped(ctx, 'rgba(75, 192, 192, 0.6)'),
    borderDash: ctx => skipped(ctx, [6, 6]),
  },
  spanGaps: true,
};

const flowDatasetDefaults = {
  label: 'Flow',
  borderColor: 'rgb(255, 192, 192)',
  tension: 0.4,
  cubicInterpolationMode: 'monotone',
  segment: {
    borderColor: ctx => skipped(ctx, 'rgba(255, 192, 192, 0.6)'),
    borderDash: ctx => skipped(ctx, [6, 6]),
  },
  spanGaps: true,
  yAxisID: 'y1',
};

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeLinear(t) { return t; }
function easeIn(t) { return t * t; }
function easeOut(t) { return 1.0 - (1.0 - t) * (1.0 - t); }
function easeInOut(t) { return t < 0.5 ? 2.0 * t * t : 1.0 - 2.0 * (1.0 - t) * (1.0 - t); }

function applyEasing(t, type) {
  if (t <= 0.0) return 0.0;
  if (t >= 1.0) return 1.0;
  switch (type) {
    case 'linear': return easeLinear(t);
    case 'ease-in': return easeIn(t);
    case 'ease-out': return easeOut(t);
    case 'ease-in-out': return easeInOut(t);
    case 'instant':
    default: return 1.0;
  }
}

// ─── Data preparation (identical to ExtendedProfileChart) ────────────────────

function prepareData(phases, target) {
  if (!Array.isArray(phases) || phases.length === 0) {
    return [];
  }

  const data = [];
  let time = 0;
  let phaseTime = 0;
  let phaseIndex = 0;
  let currentPhase = phases[phaseIndex];
  let currentPressure = 0;
  let currentFlow = 0;
  let phaseStartFlow = 0;
  let phaseStartPressure = 0;
  let effectiveFlow = currentPhase.pump?.flow || 0;
  let effectivePressure = currentPhase.pump?.pressure || 0;

  do {
    currentPhase = phases[phaseIndex];
    const alpha = applyEasing(
      phaseTime / (currentPhase.transition?.duration || currentPhase.duration),
      currentPhase?.transition?.type || 'linear',
    );
    currentFlow =
      currentPhase.pump?.target === 'flow'
        ? phaseStartFlow + (effectiveFlow - phaseStartFlow) * alpha
        : currentPhase.pump?.flow || 0;
    currentPressure =
      currentPhase.pump?.target === 'pressure'
        ? phaseStartPressure + (effectivePressure - phaseStartPressure) * alpha
        : currentPhase.pump?.pressure || 0;
    data.push({
      x: time,
      y: target === 'pressure' ? currentPressure : currentFlow,
      target: currentPhase.pump?.target === target,
    });
    time += POINT_INTERVAL;
    phaseTime += POINT_INTERVAL;
    if (phaseTime >= currentPhase.duration) {
      phaseTime = 0;
      phaseIndex++;
      if (phaseIndex < phases.length) {
        phaseStartFlow = currentFlow;
        phaseStartPressure = currentPressure;
        const nextPhase = phases[phaseIndex];
        effectiveFlow = nextPhase.pump?.flow === -1 ? currentFlow : nextPhase.pump?.flow || 0;
        effectivePressure = nextPhase.pump?.pressure === -1 ? currentPressure : nextPhase.pump?.pressure || 0;
      }
    }
  } while (phaseIndex < phases.length);

  return data;
}

// ─── Resolve phase from a point's x-time ─────────────────────────────────────

function resolvePhaseFromTime(phases, xTime, field) {
  let cursor = 0;
  for (let i = 0; i < phases.length; i++) {
    const end = cursor + parseFloat(phases[i].duration);
    if (xTime <= end + 0.05) return { phaseIndex: i, field };
    cursor = end;
  }
  return { phaseIndex: phases.length - 1, field };
}

// ─── Chart config builder ────────────────────────────────────────────────────

/**
 * @param {object}        data           – profile data with phases[]
 * @param {number|null}   selectedPhase
 * @param {boolean}       isDarkMode
 * @param {function|null} onPressureDrag – ({ phaseIndex, field:'pressure', value }) => void
 * @param {function|null} onFlowDrag     – ({ phaseIndex, field:'flow',     value }) => void
 */
function makeChartData(data, selectedPhase, isDarkMode, onPressureDrag, onFlowDrag) {
  const phases = Array.isArray(data?.phases) ? data.phases : [];
  let duration = 0;
  for (const phase of phases) duration += Number.parseFloat(phase.duration);

  const pressureData = prepareData(data.phases, 'pressure');
  const flowData = prepareData(data.phases, 'flow');

  // A dataset is draggable only when the matching callback is provided.
  const pressureDraggable = typeof onPressureDrag === 'function';
  const flowDraggable = typeof onFlowDrag === 'function';
  const anyDraggable = pressureDraggable || flowDraggable;

  const chartData = {
    type: 'line',
    data: {
      datasets: [
        {
          ...pressureDatasetDefaults,
          data: pressureData,
          dragData: pressureDraggable,
        },
        {
          ...flowDatasetDefaults,
          data: flowData,
          dragData: flowDraggable,
        },
      ],
    },
    options: {
      fill: false,
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false },
      plugins: {
        // ── dragData ──────────────────────────────────────────────────────────
        // Only included in options when at least one callback is present.
        // The plugin itself must still be registered globally (Chart.register).
        ...(anyDraggable && {
          dragData: {
            round: 1,
            showTooltip: true,
            dragX: false, // Y-axis only

            onDragStart(e, datasetIndex, index) {
              // Dataset 0 = pressure, dataset 1 = flow.
              // Dragging allowed only when callback defined AND point is a "target" point.
              if (datasetIndex === 0 && pressureDraggable) return true;
              if (datasetIndex === 1 && flowDraggable) return true;
              return false;
            },

            onDrag(e, datasetIndex, index, value) {
              // Clamp to axis range while dragging.
              const max = datasetIndex === 0 ? 12 : 10;

              const isPressure = datasetIndex === 0;
              const ds = isPressure ? pressureData : flowData;
              const cb = isPressure ? onPressureDrag : onFlowDrag;
              if (!cb) return;

              const point = ds[index];
              if (!point) return;

              const field = isPressure ? 'pressure' : 'flow';
              const { phaseIndex } = resolvePhaseFromTime(data.phases, point.x, field);
              cb({ phaseIndex, field, value });
              return Math.min(max, Math.max(0, value));
            },

            onDragEnd(e, datasetIndex, index, value) {
              const isPressure = datasetIndex === 0;
              const ds = isPressure ? pressureData : flowData;
              const cb = isPressure ? onPressureDrag : onFlowDrag;
              if (!cb) return;

              const point = ds[index];
              if (!point) return;

              const field = isPressure ? 'pressure' : 'flow';
              const { phaseIndex } = resolvePhaseFromTime(data.phases, point.x, field);
              cb({ phaseIndex, field, value });
            },
          },
        }),

        // ── legend ────────────────────────────────────────────────────────────
        legend: {
          position: 'top',
          display: true,
          labels: {
            usePointStyle: true,
            pointStyle: 'line',
            pointStyleWidth: 20,
            padding: 8,
            font: { size: window.innerWidth < 640 ? 10 : 12 },
            generateLabels(chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              const labels = original.call(this, chart);
              labels.forEach((label, i) => {
                const dataset = chart.data.datasets[i];
                label.lineWidth = 3;
                if (dataset.borderDash?.length) label.lineDash = dataset.borderDash;
              });
              return labels;
            },
          },
        },

        title: { display: false },
      },

      animations: false,
      radius: 0,

      // ── scales ────────────────────────────────────────────────────────────
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: duration,
          display: true,
          position: 'bottom',
          title: {},
          ticks: {
            source: 'auto',
            callback: (value) => `${value?.toFixed()}s`,
            font: { size: window.innerWidth < 640 ? 10 : 12 },
            maxTicksLimit: 10,
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Pressure (bar)' },
          min: 0,
          max: 12,
          ticks: { font: { size: window.innerWidth < 640 ? 10 : 12 } },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Flow (ml/s)' },
          min: 0,
          max: 10,
          ticks: { font: { size: window.innerWidth < 640 ? 10 : 12 } },
        },
      },
    },
  };

  // ── annotations ───────────────────────────────────────────────────────────
  chartData.options.plugins.annotation = {
    drawTime: 'afterDatasetsDraw',
    clip: false,
    annotations: [],
  };

  // Add highlighting box only if a phase is selected
  if (selectedPhase !== null && phases.length > 0) {
    let start = 0;
    for (let i = 0; i < selectedPhase; i++) {
      start += Number.parseFloat(phases[i].duration);
    }
    let end = start + Number.parseFloat(phases[selectedPhase].duration);
    chartData.options.plugins.annotation.annotations.push({
      id: 'box1',
      type: 'box',
      xMin: start + 0.1,
      xMax: end + 0.1,
      backgroundColor: 'rgba(0,105,255,0.2)',
      borderColor: 'rgba(100,100,100,0)',
    });
  }

  const showLabels = window.innerWidth >= 520;
  const isSmall = window.innerWidth < 640;

  let phaseStart = 0;
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const phaseName = phase.name || `Phase ${i + 1}`;
    chartData.options.plugins.annotation.annotations.push({
      type: 'line',
      xMin: phaseStart,
      xMax: phaseStart,
      borderColor: 'rgb(128,128,128)',
      borderWidth: 1,
      label: showLabels
        ? {
          display: true,
          content: phaseName,
          rotation: -90,
          position: 'end',
          xAdjust: i === 0 ? -7 : 8,
          yAdjust: 0,
          padding: { x: 4, y: 0 },
          color: isDarkMode ? 'rgb(255,255,255)' : 'rgb(0,0,0)',
          backgroundColor: isDarkMode ? 'rgba(22,33,50,0.75)' : 'rgba(255,255,255,0.75)',
          textAlign: 'start',
          font: { size: isSmall ? 9 : 11, weight: 500 },
          clip: false,
        }
        : undefined,
    });

    phaseStart += Number.parseFloat(phase.duration);
  }

  return chartData;
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ExtendedProfileChart
 * ───────────────────────────────
 * Identical to ExtendedProfileChart, extended with optional per-field drag
 * callbacks. A field is draggable if and only if its callback prop is a
 * function. Without any callback the component is fully static.
 *
 * Props
 * ─────────────────────────────────────────────────────────────────────────────
 * data            {object}          – same profile object as ExtendedProfileChart
 * className       {string}          – chart wrapper class  (default 'max-h-36 w-full')
 * selectedPhase   {number|null}     – highlighted phase box (same as original)
 *
 * onPressureDrag  {function|null}   – called on pressure point drop
 *                 ({ phaseIndex: number, field: 'pressure', value: number }) => void
 *                 Omit (or pass null/undefined) → pressure line is static.
 *
 * onFlowDrag      {function|null}   – called on flow point drop
 *                 ({ phaseIndex: number, field: 'flow', value: number }) => void
 *                 Omit (or pass null/undefined) → flow line is static.
 *
 * Examples
 * ─────────────────────────────────────────────────────────────────────────────
 * // Both draggable (generator)
 * <ExtendedProfileChart
 *   data={profile}
 *   onPressureDrag={({ phaseIndex, value }) => updatePhase(phaseIndex, 'pressure', value)}
 *   onFlowDrag={({ phaseIndex, value }) => updatePhase(phaseIndex, 'flow', value)}
 * />
 *
 * // Only pressure draggable
 * <ExtendedProfileChart
 *   data={profile}
 *   onPressureDrag={({ phaseIndex, value }) => updatePhase(phaseIndex, 'pressure', value)}
 * />
 *
 * // Fully static (identical to ExtendedProfileChart)
 * <ExtendedProfileChart data={profile} />
 */
export function ExtendedProfileChart({
  data,
  className = 'max-h-36 w-full',
  selectedPhase = null,
  onPressureDrag = null,
  onFlowDrag = null,
}) {
  const isDarkMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  const config = makeChartData(data, selectedPhase, isDarkMode, onPressureDrag, onFlowDrag);

  return (
    <ChartComponent
      className="max-w-full flex-shrink flex-grow"
      chartClassName={className}
      data={config}
    />
  );
}