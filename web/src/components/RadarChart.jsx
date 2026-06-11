import { ChartComponent } from './Chart';
import dragDataPlugin from 'chartjs-plugin-dragdata';
import { useEffect, useRef } from 'react';
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const datasetNames = [
  'Bean Flavour',
  'Intended Cup Flavour',
  'Archetype Tendency',
  'Predicted Flavour',
];

const beanDatasetDefaults = {
  label: 'Bean Flavour',
  borderColor: 'rgb(45, 156, 87)',
  fill: true,
  backgroundColor: 'rgba(45, 156, 87, 0.1)',
  borderWidth: 2,
  pointStyle: false,
};

const intendedDatasetDefaults = {
  label: 'Intended Cup Flavour',
  borderColor: 'rgb(28, 91, 94)',
  fill: true,
  backgroundColor: 'rgba(28, 91, 94, 0.1)',
  borderWidth: 2,
  pointStyle: false,
};

const archetypeDatasetDefaults = {
  label: 'Archetype Tendency',
  borderColor: 'rgb(170, 149, 90)',
  fill: false,
  borderWidth: 2,
  pointStyle: false,
  borderDash: [6, 6],
};

const predictedDatasetDefaults = {
  label: 'Predicted Flavour',
  borderColor: 'rgb(114, 93, 47)',
  fill: true,
  backgroundColor: 'rgba(114, 93, 47, 0.2)',
  borderWidth: 2,
  pointStyle: false,
};

function makeRadarChartData(data, isDarkMode = false, onDragEnd = null, onPointClick = null) {

  return {
    type: 'radar',
    data: {
      labels: data.labels,
      datasets: [
        { ...beanDatasetDefaults, data: data.beanFlavour },
        { ...intendedDatasetDefaults, data: data.intendedCupFlavour },
        { ...archetypeDatasetDefaults, data: data.archetypeTendency },
        { ...predictedDatasetDefaults, data: data.predictedFlavour },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: false,
      interaction: {
        mode: 'nearest',
        intersect: true, // Ensures points are detected even if slightly offset
        axis: 'r'         // Constrain interaction to the radial axis
      },
      plugins: {
        legend: {
          position: 'top',
          display: true,
          labels: {
            padding: 8,
            font: { size: window.innerWidth < 640 ? 10 : 12 },
            generateLabels: function (chart) {
              const original = Chart.defaults.plugins.legend.labels.generateLabels;
              const labels = original.call(this, chart);
              labels.forEach((label, index) => {
                const dataset = chart.data.datasets[index];
                label.lineWidth = 3;
                if (dataset.borderDash?.length) label.lineDash = dataset.borderDash;
              });
              return labels;
            },
          },
        },
        dragData: {
          round: 1,
          showTooltip: true,
          onDragStart: (e, datasetIndex) => [0, 1].includes(datasetIndex),
          onDrag: (e, datasetIndex) => [0, 1].includes(datasetIndex),
          onDragEnd: (e, datasetIndex, index, value) => {
            onDragEnd?.({
              label: data.labels[index],
              dataset: datasetNames[datasetIndex],
              value,
              datasetIndex,
              index,
            });
          },
        },
      },
      scales: {
        r: {
          type: 'radialLinear',
          beginAtZero: true,
          min: 0,
          max: 10,
          grid: { circular: true, color: 'rgb(128,128,128)', borderWidth: 1 },
          angleLines: { color: 'rgb(128,128,128)' },
          ticks: {
            stepSize: 1,
            backdropColor: 'transparent',
            font: { size: window.innerWidth < 640 ? 9 : 11 },
            callback: (value) => ([0, 5, 10].includes(value) ? value : ''),
          },
          pointLabels: {
            font: { size: window.innerWidth < 640 ? 10 : 12, weight: 500 },
            color: 'rgb(128,128,128)',
          },
        },
        x: { display: false }, y: { display: false },
        x1: { display: false }, y1: { display: false },
      },
      onClick: (e, activeEls, chart) => {
        const rScale = chart.scales.r;
        const numAxes = chart.data.labels.length;

        // 1. Calculate the mouse angle relative to chart center
        const mouseAngle = Math.atan2(e.y - rScale.yCenter, e.x - rScale.xCenter);

        // 2. Identify the closest axis index
        // The first axis (index 0) is usually at -PI/2 (top) in Radar charts
        const anglePerAxis = (2 * Math.PI) / numAxes;
        let closestIndex = Math.round((mouseAngle + Math.PI / 2) / anglePerAxis) % numAxes;
        if (closestIndex < 0) closestIndex += numAxes;

        // 3. Look only at the points on this specific axis
        const datasets = [0, 1];
        let bestPoint = null;
        let minDistToPoint = chart.scales.r.getDistanceFromCenterForValue(10);

        datasets.forEach(dsIndex => {
          if (!chart.isDatasetVisible(dsIndex)) return;

          const meta = chart.getDatasetMeta(dsIndex);
          const point = meta.data[closestIndex];

          // Safety check: ensure point exists
          if (!point) return;

          const dist = Math.hypot(point.x - e.x, point.y - e.y);

          if (dist < minDistToPoint) {
            minDistToPoint = dist;
            bestPoint = { datasetIndex: dsIndex, index: closestIndex };
          }
        });

        if (!bestPoint) return;

        // 4. Calculate new value
        const distFromCenter = Math.hypot(e.x - rScale.xCenter, e.y - rScale.yCenter);
        const rawValue = rScale.getValueForDistanceFromCenter(distFromCenter);
        const newValue = Math.min(10, Math.max(0, Math.round(rawValue)));
        onDragEnd?.({
          label: chart.data.labels[bestPoint.index],
          dataset: datasetNames[bestPoint.datasetIndex],
          value: newValue,
          datasetIndex: bestPoint.datasetIndex,
          index: bestPoint.index,
        });
      },
    },
  };
}

export function ExtendedRadarChart({
  data,
  onDragEnd = null,
  onPointClick = null,
  className = 'max-h-36 w-full',
}) {
  const config = makeRadarChartData(data, false, onDragEnd, onPointClick);
  const chartIdRef = useRef(Math.random().toString(36));

  return (
    <ChartComponent
      className="max-w-full flex-shrink flex-grow"
      chartClassName={className}
      data={config}
      key={chartIdRef.current}
    />
  );
}