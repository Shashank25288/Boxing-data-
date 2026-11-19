import { useMemo } from 'react';
import type { DatasetStats, MatchRecord } from '../lib/statistics';
import { ScoreHistogramChart } from './Charts';

interface ScoreStatsViewProps {
  matches: MatchRecord[];
  stats: DatasetStats;
}

export function ScoreStatsView({ matches, stats }: ScoreStatsViewProps) {
  const sortedScores = useMemo(() => {
    const scores: number[] = [];
    for (const m of matches) {
      scores.push(m.score_a, m.score_b);
    }
    return scores.sort((a, b) => a - b);
  }, [matches]);

  const totalPoints = useMemo(
    () => sortedScores.reduce((sum, v) => sum + v, 0),
    [sortedScores]
  );

  const modeSet = useMemo(() => new Set(stats.modeScores), [stats.modeScores]);
  const midHighIdx = Math.floor(sortedScores.length / 2);
  const midLowIdx = sortedScores.length % 2 === 0 ? midHighIdx - 1 : midHighIdx;

  return (
    <div className="space-y-6">
      {/* Descriptive Formulas & Live Values (Slide 6 & Slide 8) */}
      <section aria-label="Statistical methods and live formulas">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Probability & Statistical Methods
          </h2>
          <p className="text-xs text-slate-500">
            Live calculations across {stats.totalScoreObservations} score observations from {stats.totalMatches} matches
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Mean</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {stats.meanScore.toFixed(2)}
            </p>
            <p className="mt-2 font-mono text-xs text-slate-600">
              x̄ = Σx / n = {totalPoints} / {stats.totalScoreObservations}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Median</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {stats.medianScore.toFixed(2)}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Middle value after sorting all {stats.totalScoreObservations} observations
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Mode</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-slate-900">
              {stats.modeScores.length > 0 ? stats.modeScores.join(', ') : 'No repeated mode'}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              {stats.modeScores.length > 0
                ? `Most frequent values (each appears ${stats.modeMaxFrequency} times)`
                : 'Every score observation is unique'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Population Variance</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {stats.populationVariance.toFixed(2)}
            </p>
            <p className="mt-2 font-mono text-xs text-slate-600">
              σ² = Σ(x − x̄)² / n
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Standard Deviation</p>
            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
              {stats.populationStdDev.toFixed(2)}
            </p>
            <p className="mt-2 font-mono text-xs text-slate-600">
              σ = √σ² = √{stats.populationVariance.toFixed(2)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold text-[#C83E31]">Win Percentage & Frequency</p>
            <p className="mt-1 font-mono text-base font-semibold text-slate-900">
              (Wins ÷ Matches played) × 100
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Empirical win frequency is descriptive and does not guarantee future outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Score Histogram + Sorted Array */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Score Frequency Histogram
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Grouped into 5-point score intervals across both score columns
            </p>
          </div>
          <div className="mt-5">
            <ScoreHistogramChart bins={stats.scoreBins} />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Sorted Score Observations (n = {sortedScores.length})
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Bold blue cells mark the median midpoint · Red underline marks modal values
            </p>
          </div>

          {sortedScores.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No observations recorded.</p>
          ) : (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {sortedScores.map((score, idx) => {
                const isMedianPos = idx === midLowIdx || idx === midHighIdx;
                const isMode = modeSet.has(score);
                return (
                  <div
                    key={`${idx}-${score}`}
                    className={`rounded border px-2 py-2 text-center font-mono text-sm tabular-nums ${
                      isMedianPos
                        ? 'border-[#3B6EB5] bg-[#3B6EB5]/10 font-bold text-[#1E40AF]'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span className={isMode ? 'border-b-2 border-[#C83E31] pb-0.5' : ''}>
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <p>
              Bin distribution:{' '}
              {stats.scoreBins.map((b) => `${b.label}: ${b.count}`).join(' · ')}
            </p>
          </div>
        </div>
      </section>

      {/* Boxer-Level Score Breakdown */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Per-Boxer Scoring Summary
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Average score, spread, win percentage, and empirical win frequency per boxer
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-[#0F172A] text-xs font-medium text-slate-100">
                <th className="px-5 py-3">Boxer</th>
                <th className="px-5 py-3 text-right">Matches</th>
                <th className="px-5 py-3 text-right">Wins</th>
                <th className="px-5 py-3 text-right">Losses</th>
                <th className="px-5 py-3 text-right">Win %</th>
                <th className="px-5 py-3 text-right">Emp. Freq</th>
                <th className="px-5 py-3 text-right">Mean Score</th>
                <th className="px-5 py-3 text-right">Min–Max</th>
                <th className="px-5 py-3 text-right">Score SD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {stats.boxers.map((b) => (
                <tr key={b.name} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{b.name}</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">
                    {b.matchesPlayed}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">{b.wins}</td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">{b.losses}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-slate-900">
                    {b.winPercentage.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">
                    {b.empiricalWinFrequency.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-800">
                    {b.avgScore.toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">
                    {b.minScore}–{b.maxScore}
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-slate-700">
                    {b.scoreStdDev.toFixed(2)}
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
