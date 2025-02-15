"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartProps {
  data: any[];
  metric?: string;
  color?: string;
  multiline?: Array<{ key: string; color: string; label: string }>;
  unit?: string;
  title?: string;
  value?: number;
}

export function Chart({ 
  data, 
  metric = 'cpu', 
  color = '#475569', 
  multiline,
  unit = '%',
  title,
  value
}: ChartProps) {
  const chartData = {
    labels: data.map((d) => d.timestamp),
    datasets: multiline ? 
      multiline.map(line => ({
        label: line.label,
        data: data.map((d) => d[line.key]),
        borderColor: line.color,
        backgroundColor: `${line.color}1A`,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      })) :
      [{
        label: metric.toUpperCase(),
        data: data.map((d) => d[metric]),
        borderColor: color,
        backgroundColor: `${color}1A`,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!multiline,
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          family: 'Space Grotesk, system-ui, sans-serif',
        },
        bodyFont: {
          size: 13,
          family: 'Space Grotesk, system-ui, sans-serif',
        },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + unit;
            }
            return label;
          }
        }
      },
      currentValue: {
        value: value?.toFixed(1) || '0.0',
        unit: unit,
        font: {
          family: 'Space Grotesk, system-ui, sans-serif',
          size: 24,
          weight: 'bold'
        },
        color: 'white'
      },
      chartTitle: {
        title: title,
        font: {
          family: 'Space Grotesk, system-ui, sans-serif',
          size: 12,
          weight: '500'
        },
        color: 'white'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: metric === 'temperature' ? 100 : 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(tickValue: number | string, index: number, ticks: any) {
            return `${tickValue}${unit}`;
          },
          font: {
            family: 'Space Grotesk, system-ui, sans-serif',
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  ChartJS.register({
    id: 'currentValue',
    beforeDraw: (chart: any) => {
      const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
      const pluginOptions = chart.options.plugins.currentValue;
      const titleOptions = chart.options.plugins.chartTitle;
      
      if (!pluginOptions) return;

      ctx.save();
      
      // Draw value
      ctx.font = `${pluginOptions.font.weight} ${pluginOptions.font.size}px ${pluginOptions.font.family}`;
      ctx.fillStyle = pluginOptions.color;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      const text = `${pluginOptions.value}${pluginOptions.unit}`;
      ctx.fillText(text, right - 10, top + height / 2);

      // Draw title
      if (titleOptions?.title) {
        ctx.font = `${titleOptions.font.weight} ${titleOptions.font.size}px ${titleOptions.font.family}`;
        ctx.fillStyle = titleOptions.color;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(titleOptions.title.toUpperCase(), left + 10, top + 10);
      }
      
      ctx.restore();
    }
  });

  return (
    <section className="bg-slate-900/5 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
      <div className="h-[200px] p-4">
        <Line data={chartData} options={options} />
      </div>
    </section>
  )
} 