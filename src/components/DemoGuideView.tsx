import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { DatasetStats } from '../lib/statistics';

interface DemoGuideViewProps {
  stats: DatasetStats;
  onNavigateTab: (tab: 'overview' | 'compare' | 'stats' | 'records') => void;
  onOpenAddMatch: () => void;
}

export function DemoGuideView({
  stats,
  onNavigateTab,
  onOpenAddMatch,
}: DemoGuideViewProps) {
  return (
    <div className="space-y-6">
      {/* System Flow (Slide 4) */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            System Architecture & Data Flow
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            End-to-end processing pipeline demonstrated by this live web application
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <div className="rounded-md bg-[#0F172A] p-4 text-white">
            <p className="text-xs font-medium text-slate-400">Stage 1</p>
            <p className="mt-1 font-display text-sm font-semibold">CSV Data</p>
            <p className="mt-1 font-mono text-xs text-slate-300 tabular-nums">
              {stats.totalMatches} rows
            </p>
          </div>

          <div className="flex justify-center text-[#C83E31]">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>

          <div className="rounded-md bg-[#0F172A] p-4 text-white">
            <p className="text-xs font-medium text-slate-400">Stage 2</p>
            <p className="mt-1 font-display text-sm font-semibold">Backend + CSV Parser</p>
            <p className="mt-1 font-mono text-xs text-slate-300">Express API</p>
          </div>

          <div className="flex justify-center text-[#C83E31]">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>

          <div className="rounded-md bg-[#0F172A] p-4 text-white">
            <p className="text-xs font-medium text-slate-400">Stage 3</p>
            <p className="mt-1 font-display text-sm font-semibold">Statistics Engine</p>
            <p className="mt-1 font-mono text-xs text-slate-300 tabular-nums">
              x̄={stats.meanScore.toFixed(2)} · σ={stats.populationStdDev.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-center text-[#C83E31]">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>

          <div className="rounded-md bg-[#0F172A] p-4 text-white">
            <p className="text-xs font-medium text-slate-400">Stage 4</p>
            <p className="mt-1 font-display text-sm font-semibold">Web Dashboard</p>
            <p className="mt-1 font-mono text-xs text-slate-300">Chart.js Views</p>
          </div>
        </div>
      </section>

      {/* Slide 9 Test Verification Checklist */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Interactive Demo Test Plan (Slide 9)
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Run each presentation test directly in the live application
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-md border border-slate-200 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C83E31]">Test 1 — Dashboard</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Verify that sample records ({stats.totalMatches} matches, {stats.uniqueBoxers} boxers) and Chart.js visualizations load on the Overview screen.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('overview')}
              className="mt-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              Inspect Dashboard Overview
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-md border border-slate-200 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C83E31]">Test 2 — Comparison</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Choose two different boxers and confirm their wins, losses, historical win rates, and direct head-to-head bouts are displayed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('compare')}
              className="mt-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50"
            >
              Open Boxer Comparison
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-md border border-slate-200 p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#C83E31]">Test 3 — Data Entry</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Add a valid match through the form and confirm the new row appends to data/matches.csv and updates every chart.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onOpenAddMatch}
                className="flex-1 rounded-md bg-[#C83E31] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#B23327]"
              >
                Add Match Now
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('records')}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50"
              >
                View CSV
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion, Limitations & Future Enhancements (Slide 10) */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Implemented Enhancements & Future Scope
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
            <li>• Interactive CSV import/export and live raw CSV inspection are built into Match Records.</li>
            <li>• Expandable to larger verified competition datasets with weight-class or tournament filters.</li>
            <li>• Automated input validation prevents duplicate IDs, self-matches, and invalid score entries.</li>
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Analytical Scope & Limitations
          </h3>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
            <li>• Sample records are fictional academic demonstration data.</li>
            <li>• Historical win rate does not adjust for opponent strength, weight class, or match context.</li>
            <li>• Descriptive statistics summarize recorded outcomes and do not predict future bouts.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
