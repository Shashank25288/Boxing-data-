import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { BoxerStats, ScoreBin } from '../lib/statistics';

interface WinsLossesBarChartProps {
  boxers: BoxerStats[];
}

export function WinsLossesBarChart({ boxers }: WinsLossesBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: boxers.map((b) => b.name),
        datasets: [
          {
            label: 'Wins',
            data: boxers.map((b) => b.wins),
            backgroundColor: '#3B6EB5',
            borderRadius: 4,
            barPercentage: 0.72,
            categoryPercentage: 0.65,
          },
          {
            label: 'Losses',
            data: boxers.map((b) => b.losses),
            backgroundColor: '#C83E31',
            borderRadius: 4,
            barPercentage: 0.72,
            categoryPercentage: 0.65,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              color: '#334155',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 500 },
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: 600 },
            bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 500 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              color: '#64748B',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
            grid: { color: '#E2E8F0' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [boxers]);

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} aria-label="Recorded wins and losses per boxer" />
    </div>
  );
}

interface ScoreHistogramChartProps {
  bins: ScoreBin[];
}

export function ScoreHistogramChart({ bins }: ScoreHistogramChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: bins.map((b) => b.label),
        datasets: [
          {
            label: 'Score observations',
            data: bins.map((b) => b.count),
            backgroundColor: '#3B6EB5',
            hoverBackgroundColor: '#295492',
            borderRadius: 4,
            barPercentage: 0.56,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { family: 'Plus Jakarta Sans, sans-serif', size: 12, weight: 600 },
            bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} score observations`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 2,
              precision: 0,
              color: '#64748B',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
            grid: { color: '#E2E8F0' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [bins]);

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} aria-label="Frequency of recorded scores" />
    </div>
  );
}

interface WinRateBarChartProps {
  boxers: BoxerStats[];
}

export function WinRateBarChart({ boxers }: WinRateBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: boxers.map((b) => b.name),
        datasets: [
          {
            label: 'Historical Win Rate (%)',
            data: boxers.map((b) => Number(b.winPercentage.toFixed(1))),
            backgroundColor: boxers.map((_, idx) =>
              idx === 0 ? '#0F172A' : '#64748B'
            ),
            borderRadius: 4,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => `${ctx.parsed.x}% historical win rate`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (v) => `${v}%`,
              color: '#64748B',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
            grid: { color: '#E2E8F0' },
          },
          y: {
            grid: { display: false },
            ticks: {
              color: '#0F172A',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 600 },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [boxers]);

  return (
    <div className="relative h-56 w-full">
      <canvas ref={canvasRef} aria-label="Historical win rate by boxer" />
    </div>
  );
}

interface WinnerShareChartProps {
  boxers: BoxerStats[];
}

const DOUGHNUT_PALETTE = ['#0F172A', '#3B6EB5', '#C83E31', '#64748B', '#D97706', '#059669'];

export function WinnerShareChart({ boxers }: WinnerShareChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    const activeWinners = boxers.filter((b) => b.wins > 0);

    chartRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: activeWinners.map((b) => b.name),
        datasets: [
          {
            data: activeWinners.map((b) => b.wins),
            backgroundColor: activeWinners.map(
              (_, i) => DOUGHNUT_PALETTE[i % DOUGHNUT_PALETTE.length]
            ),
            borderColor: '#FFFFFF',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '64%',
        animation: { duration: 220 },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              padding: 14,
              color: '#334155',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 500 },
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
            padding: 10,
            cornerRadius: 6,
            callbacks: {
              label: (ctx) => {
                const total = activeWinners.reduce((sum, b) => sum + b.wins, 0);
                const pct = total > 0 ? ((Number(ctx.parsed) / total) * 100).toFixed(1) : '0.0';
                return `${ctx.label}: ${ctx.parsed} wins (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [boxers]);

  return (
    <div className="relative h-56 w-full">
      <canvas ref={canvasRef} aria-label="Winner distribution share" />
    </div>
  );
}

interface ComparisonBarChartProps {
  boxerA: BoxerStats;
  boxerB: BoxerStats;
}

export function ComparisonBarChart({ boxerA, boxerB }: ComparisonBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Win Rate (%)', 'Mean Score', 'Peak Score', 'Min Score'],
        datasets: [
          {
            label: boxerA.name,
            data: [
              Number(boxerA.winPercentage.toFixed(1)),
              Number(boxerA.avgScore.toFixed(2)),
              boxerA.maxScore,
              boxerA.minScore,
            ],
            backgroundColor: '#3B6EB5',
            borderRadius: 4,
            barPercentage: 0.72,
          },
          {
            label: boxerB.name,
            data: [
              Number(boxerB.winPercentage.toFixed(1)),
              Number(boxerB.avgScore.toFixed(2)),
              boxerB.maxScore,
              boxerB.minScore,
            ],
            backgroundColor: '#C83E31',
            borderRadius: 4,
            barPercentage: 0.72,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 220 },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 8,
              boxHeight: 8,
              color: '#334155',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 600 },
            },
          },
          tooltip: {
            backgroundColor: '#0F172A',
            bodyFont: { family: 'JetBrains Mono, monospace', size: 12 },
            padding: 10,
            cornerRadius: 6,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'DM Sans, sans-serif', size: 12, weight: 500 },
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#64748B',
              font: { family: 'JetBrains Mono, monospace', size: 11 },
            },
            grid: { color: '#E2E8F0' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [boxerA, boxerB]);

  return (
    <div className="relative h-72 w-full">
      <canvas ref={canvasRef} aria-label="Side-by-side boxer metric comparison" />
    </div>
  );
}
