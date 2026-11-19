import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { BoxerStats, MatchRecord } from '../lib/statistics';
import { ComparisonBarChart } from './Charts';

interface BoxerComparisonViewProps {
  boxers: BoxerStats[];
  matches: MatchRecord[];
}

export function BoxerComparisonView({ boxers, matches }: BoxerComparisonViewProps) {
  const [boxerOneName, setBoxerOneName] = useState<string>('');
  const [boxerTwoName, setBoxerTwoName] = useState<string>('');

  useEffect(() => {
    if (boxers.length === 0) {
      setBoxerOneName('');
      setBoxerTwoName('');
      return;
    }
    if (!boxerOneName || !boxers.some((b) => b.name === boxerOneName)) {
      setBoxerOneName(boxers[0].name);
    }
    if (!boxerTwoName || !boxers.some((b) => b.name === boxerTwoName)) {
      setBoxerTwoName(boxers[1]?.name ?? boxers[0].name);
    }
  }, [boxers, boxerOneName, boxerTwoName]);

  const boxerOne = useMemo(
    () => boxers.find((b) => b.name === boxerOneName) ?? null,
    [boxers, boxerOneName]
  );
  const boxerTwo = useMemo(
    () => boxers.find((b) => b.name === boxerTwoName) ?? null,
    [boxers, boxerTwoName]
  );

  const headToHeadMatches = useMemo(() => {
    if (!boxerOne || !boxerTwo || boxerOne.name === boxerTwo.name) return [];
    return matches.filter(
      (m) =>
        (m.boxer_a === boxerOne.name && m.boxer_b === boxerTwo.name) ||
        (m.boxer_a === boxerTwo.name && m.boxer_b === boxerOne.name)
    );
  }, [matches, boxerOne, boxerTwo]);

  const h2hSummary = useMemo(() => {
    if (!boxerOne || !boxerTwo) return { oneWins: 0, twoWins: 0 };
    let oneWins = 0;
    let twoWins = 0;
    for (const m of headToHeadMatches) {
      if (m.winner === boxerOne.name) oneWins += 1;
      else if (m.winner === boxerTwo.name) twoWins += 1;
    }
    return { oneWins, twoWins };
  }, [headToHeadMatches, boxerOne, boxerTwo]);

  if (boxers.length < 2) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          At least two boxers are required for comparison
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Add matches with two or more distinct boxers to compare their historical records.
        </p>
      </div>
    );
  }

  const sameBoxerSelected = boxerOneName === boxerTwoName;

  const handleSwap = () => {
    setBoxerOneName(boxerTwoName);
    setBoxerTwoName(boxerOneName);
  };

  return (
    <div className="space-y-6">
      {/* Selector Bar */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Select Two Boxers to Compare
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review historical win percentages, scoring consistency, and head-to-head bouts.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="select-boxer-1" className="block text-xs font-medium text-slate-600">
                Boxer 1
              </label>
              <select
                id="select-boxer-1"
                value={boxerOneName}
                onChange={(e) => setBoxerOneName(e.target.value)}
                className="mt-1 min-w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {boxers.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.wins}W-{b.losses}L)
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSwap}
              className="inline-flex h-[38px] items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
              aria-label="Swap selected boxers"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Swap
            </button>

            <div>
              <label htmlFor="select-boxer-2" className="block text-xs font-medium text-slate-600">
                Boxer 2
              </label>
              <select
                id="select-boxer-2"
                value={boxerTwoName}
                onChange={(e) => setBoxerTwoName(e.target.value)}
                className="mt-1 min-w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-900 focus:outline-none"
              >
                {boxers.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.name} ({b.wins}W-{b.losses}L)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {sameBoxerSelected && (
          <p className="mt-4 text-xs font-medium text-[#C83E31]" role="alert">
            Please choose two different boxers to view a side-by-side comparison and head-to-head log.
          </p>
        )}
      </section>

      {boxerOne && boxerTwo && !sameBoxerSelected && (
        <>
          {/* Side-by-side Comparison Table & Chart */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Statistical Record Comparison
                </h3>
                <span className="font-mono text-xs text-slate-500">
                  {boxerOne.name} vs {boxerTwo.name}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                      <th className="py-2.5 text-left">Metric</th>
                      <th className="py-2.5 text-right text-[#3B6EB5]">{boxerOne.name}</th>
                      <th className="py-2.5 text-right text-[#C83E31]">{boxerTwo.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 tabular-nums">
                    <tr>
                      <td className="py-2.5 text-slate-600">Matches Played</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerOne.matchesPlayed}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerTwo.matchesPlayed}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Recorded Wins</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerOne.wins}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerTwo.wins}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Recorded Losses</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerOne.losses}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerTwo.losses}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Historical Win Rate</td>
                      <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                        {boxerOne.winPercentage.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                        {boxerTwo.winPercentage.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Empirical Win Frequency</td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerOne.empiricalWinFrequency.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerTwo.empiricalWinFrequency.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Mean Score</td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerOne.avgScore.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                        {boxerTwo.avgScore.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Score Range (Min–Max)</td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerOne.minScore}–{boxerOne.maxScore}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerTwo.minScore}–{boxerTwo.maxScore}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Score Standard Deviation</td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerOne.scoreStdDev.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerTwo.scoreStdDev.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 text-slate-600">Average Point Margin</td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerOne.avgMargin >= 0 ? `+${boxerOne.avgMargin.toFixed(2)}` : boxerOne.avgMargin.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-800">
                        {boxerTwo.avgMargin >= 0 ? `+${boxerTwo.avgMargin.toFixed(2)}` : boxerTwo.avgMargin.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6 lg:col-span-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Visual Profile Comparison
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Win rate, mean score, peak score, and lowest recorded score
                </p>
              </div>
              <div className="mt-5">
                <ComparisonBarChart boxerA={boxerOne} boxerB={boxerTwo} />
              </div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                Note: Historical win rate describes recorded bouts only and does not adjust for opponent strength or serve as a match prediction.
              </p>
            </div>
          </section>

          {/* Head-to-Head Match History */}
          <section className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="font-display text-base font-semibold text-slate-900">
                  Head-to-Head Match History
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Direct bouts between {boxerOne.name} and {boxerTwo.name}
                </p>
              </div>
              <div className="font-mono text-xs font-medium text-slate-700 tabular-nums">
                {boxerOne.name} {h2hSummary.oneWins} · {boxerTwo.name} {h2hSummary.twoWins} ({headToHeadMatches.length} total bouts)
              </div>
            </div>

            {headToHeadMatches.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No direct matches recorded between {boxerOne.name} and {boxerTwo.name} in the current dataset.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
                      <th className="px-6 py-3">Match ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Boxer A</th>
                      <th className="px-6 py-3">Boxer B</th>
                      <th className="px-6 py-3">Winner</th>
                      <th className="px-6 py-3 text-right">Score A</th>
                      <th className="px-6 py-3 text-right">Score B</th>
                      <th className="px-6 py-3 text-right">Rounds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {headToHeadMatches.map((m) => (
                      <tr key={m.match_id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 font-mono text-xs font-medium text-slate-900">
                          {m.match_id}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-600 tabular-nums">
                          {m.date}
                        </td>
                        <td className="px-6 py-3 text-slate-800">{m.boxer_a}</td>
                        <td className="px-6 py-3 text-slate-800">{m.boxer_b}</td>
                        <td className="px-6 py-3 font-semibold text-slate-900">{m.winner}</td>
                        <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-700">
                          {m.score_a}
                        </td>
                        <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-700">
                          {m.score_b}
                        </td>
                        <td className="px-6 py-3 text-right font-mono tabular-nums text-slate-600">
                          {m.rounds}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
