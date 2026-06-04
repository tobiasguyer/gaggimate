import { useEffect, useRef, useState } from 'preact/hooks';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

export function ChartComponent({ data, className, chartClassName }) {
  const [chart, setChart] = useState(null);
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;

    const chartConfig = {
      ...data,
      options: {
        ...data.options,
        plugins: {
          dragData: false,

          ...(data.options?.plugins ?? {}),
        },
      },
    };

    const newChart = new Chart(ref.current, chartConfig);
    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, []);

  useEffect(() => {
    if (!chart) return;

    const hiddenDatasets = chart.data.datasets.map((dataset, index) => {
      return chart.getDatasetMeta(index).hidden;
    });

    chart.data = data.data;

    chart.options = {
      ...data.options,
      plugins: {
        dragData: false,
        ...(data.options?.plugins ?? {}),
      },
    };

    chart.data.datasets.forEach((_, index) => {
      if (hiddenDatasets[index] !== undefined) {
        chart.getDatasetMeta(index).hidden = hiddenDatasets[index];
      }
    });

    chart.update();
  }, [data, chart]);

  useEffect(() => {
    if (!chart) return;

    const ensure = (obj, key, def) => {
      if (!obj[key]) obj[key] = def;
      return obj[key];
    };

    const ensureFont = path => {
      const target = path.reduce((acc, key) => ensure(acc, key, {}), chart.options);
      if (!target.font) target.font = {}; // for scale tick objects that may embed font deeper
      return target;
    };

    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 640;

      ensureFont(['plugins', 'legend', 'labels']).font.size = isSmallScreen ? 10 : 12;
      ensureFont(['plugins', 'title']).font.size = isSmallScreen ? 14 : 16;
      ensureFont(['scales', 'y', 'ticks']).font.size = isSmallScreen ? 10 : 12;
      ensureFont(['scales', 'y1', 'ticks']).font.size = isSmallScreen ? 10 : 12;
      ensureFont(['scales', 'x', 'ticks']).font.size = isSmallScreen ? 10 : 12;

      const xTicks = ensureFont(['scales', 'x', 'ticks']);
      xTicks.maxTicksLimit = isSmallScreen ? 5 : 10;

      chart.resize();

      chart.update('none'); 
    };

    window.addEventListener('resize', handleResize);

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, [chart]);

  return (
    <div className={className}>
      <canvas className={chartClassName} ref={ref} />
    </div>
  );
}
