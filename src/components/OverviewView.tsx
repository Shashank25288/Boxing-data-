import type { DatasetStats, MatchRecord } from '../lib/statistics';
import {
  ScoreHistogramChart,
  WinRateBarChart,
  WinnerShareChart,
  WinsLossesBarChart,
} from './Charts';

interface OverviewViewProps {
  matches: MatchRecord[];
  stats: DatasetStats;
  onNavigateTab: (tab: 'records' | 'compare' | 'stats') => void;
  onOpenAddMatch: () => void;
}

export function OverviewView({
  matches,
  stats,
  onNavigateTab,
  onOpenAddMatch,
}: OverviewViewProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          No match records in dataset
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Add your first boxing match record or reset to the 10-match academic sample dataset to compute descriptive statistics and render charts.
        </p>
        <button
          type="button"
          onClick={onOpenAddMatch}
          className="mt-5 rounded-md bg-[#C83E31] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B23327]"
        >
          Add First Match
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4-column KPI Strip */}
      <section aria-label="Dataset summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Total Matches</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
            {stats.totalMatches}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {stats.totalScoreObservations} recorded score observations
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Unique Boxers</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
            {stats.uniqueBoxers}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            {stats.avgRounds.toFixed(1)} avg rounds per bout
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Mean Score (x̄)</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
            {stats.meanScore.toFixed(2)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            Median {stats.medianScore.toFixed(2)} · Range {stats.minScore}–{stats.maxScore}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Population SD (σ)</p>
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums text-slate-900">
            {stats.populationStdDev.toFixed(2)}
          </p>
          <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
            Variance σ² = {stats.populationVariance.toFixed(2)}
          </p>
        </div>
      </section>

      {/* Primary Charts Grid: Wins/Losses & Score Histogram */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recorded Wins and Losses
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Win and loss counts calculated across {stats.totalMatches} recorded matches
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('compare')}
              className="text-xs font-medium text-[#3B6EB5] hover:underline whitespace-nowrap"
            >
              Compare Boxers
            </button>
          </div>

          <div className="mt-5">
            <WinsLossesBarChart boxers={stats.boxers} />
          </div>

          <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {stats.boxers.map((boxer) => (
              <div
                key={boxer.name}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <span className="font-medium text-slate-900">{boxer.name}</span>
                <div className="flex items-center gap-3 font-mono text-xs text-slate-600 tabular-nums">
                  <span>{boxer.wins} {boxer.wins === 1 ? 'win' : 'wins'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{boxer.losses} {boxer.losses === 1 ? 'loss' : 'losses'}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-900">
                    {boxer.winPercentage.toFixed(1)}% historical win rate
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Frequency of Recorded Scores
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Combined distribution across Boxer A and Boxer B scores
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('stats')}
              className="text-xs font-medium text-[#3B6EB5] hover:underline whitespace-nowrap"
            >
              Formulas & Spread
            </button>
          </div>

          <div className="mt-5">
            <ScoreHistogramChart bins={stats.scoreBins} />
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-900">Statistical Interpretation</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              The mean score is{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.meanScore.toFixed(2)}
              </span>{' '}
              with a median of{' '}
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.medianScore.toFixed(2)}
              </span>
              . The population standard deviation (
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {stats.populationStdDev.toFixed(2)}
              </span>
              ) measures how spread out the {stats.totalScoreObservations} score observations are around the mean.
            </p>
            <p className="mt-2.5 text-xs text-[#C83E31]">
              Descriptive note: Historical win frequency summarizes past outcomes and does not predict future match results.
            </p>
          </div>
        </div>
      </section>

      {/* Secondary Charts: Historical Win Rate & Winner Distribution */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Historical Win Rate (%)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Calculated as (Wins ÷ Matches Played) × 100
            </p>
          </div>
          <div className="mt-4">
            <WinRateBarChart boxers={stats.boxers} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-display text-base font-semibold text-slate-900">
              Match Winner Distribution
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Share of total recorded victories across participants
            </p>
          </div>
          <div className="mt-4">
            <WinnerShareChart boxers={stats.boxers} />
          </div>
        </div>
      </section>

      {/* Match Records Preview Table */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Match Records Preview
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {Math.min(6, matches.length)} of {matches.length} records from data/matches.csv
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('records')}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
          >
            Open Full Dataset & CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#0F172A] text-xs font-medium text-slate-100">
                <th className="px-5 py-3">Match ID</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Boxer A</th>
                <th className="px-5 py-3">Boxer B</th>
                <th className="px-5 py-3">Winner</th>
                <th className="px-5 py-3 text-right">Score A</th>
                <th className="px-5 py-3 text-right">Score B</th>
                <th className="px-5 py-3 text-right">Rounds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matches.slice(0, 6).map((m) => (
                <tr key={m.match_id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-2.5 font-mono text-xs font-medium text-slate-900">
                    {m.match_id}
                  </td>
                  <td className="px-5 py-2.5 font-mono text-xs text-slate-600 tabular-nums">
                    {m.date}
                  </td>
                  <td className="px-5 py-2.5 text-slate-800">{m.boxer_a}</td>
                  <td className="px-5 py-2.5 text-slate-800">{m.boxer_b}</td>
                  <td className="px-5 py-2.5 font-medium text-slate-900">{m.winner}</td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {m.score_a}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-700">
                    {m.score_b}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-600">
                    {m.rounds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
