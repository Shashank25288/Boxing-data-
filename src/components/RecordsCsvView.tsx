import { useMemo, useRef, useState } from 'react';
import { Download, Plus, RotateCcw, Search, Trash2, Upload } from 'lucide-react';
import type { BoxerStats, MatchRecord } from '../lib/statistics';

interface RecordsCsvViewProps {
  matches: MatchRecord[];
  boxers: BoxerStats[];
  csvRaw: string;
  onOpenAddMatch: () => void;
  onDeleteMatch: (matchId: string) => Promise<void>;
  onResetSample: () => Promise<void>;
  onImportCsv: (csvText: string) => Promise<{ ok: boolean; error?: string }>;
}

export function RecordsCsvView({
  matches,
  boxers,
  csvRaw,
  onOpenAddMatch,
  onDeleteMatch,
  onResetSample,
  onImportCsv,
}: RecordsCsvViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [boxerFilter, setBoxerFilter] = useState('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return matches.filter((m) => {
      const matchesBoxer =
        boxerFilter === 'ALL' || m.boxer_a === boxerFilter || m.boxer_b === boxerFilter;
      if (!matchesBoxer) return false;
      if (!q) return true;
      return (
        m.match_id.toLowerCase().includes(q) ||
        m.boxer_a.toLowerCase().includes(q) ||
        m.boxer_b.toLowerCase().includes(q) ||
        m.winner.toLowerCase().includes(q) ||
        m.date.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery, boxerFilter]);

  const csvLines = useMemo(() => csvRaw.trimEnd().split('\n'), [csvRaw]);

  const handleDelete = async (matchId: string) => {
    setBusyId(matchId);
    await onDeleteMatch(matchId);
    setBusyId(null);
  };

  const handleReset = async () => {
    setResetting(true);
    setImportFeedback(null);
    await onResetSample();
    setResetting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFeedback(null);

    try {
      const text = await file.text();
      const res = await onImportCsv(text);
      if (res.ok) {
        setImportFeedback({ type: 'ok', msg: `Imported ${file.name} into data/matches.csv.` });
      } else {
        setImportFeedback({ type: 'err', msg: res.error || 'CSV import failed.' });
      }
    } catch {
      setImportFeedback({ type: 'err', msg: 'Unable to read selected CSV file.' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search match ID, boxer, date..."
                aria-label="Search match records"
                className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <select
              value={boxerFilter}
              onChange={(e) => setBoxerFilter(e.target.value)}
              aria-label="Filter by boxer"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
            >
              <option value="ALL">All Boxers ({boxers.length})</option>
              {boxers.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.matchesPlayed} matches)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </button>

            <a
              href="/api/matches/export"
              download="matches.csv"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </a>

            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {resetting ? 'Resetting...' : 'Reset Sample'}
            </button>

            <button
              type="button"
              onClick={onOpenAddMatch}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#C83E31] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#B23327] whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Match
            </button>
          </div>
        </div>

        {importFeedback && (
          <p
            role="status"
            className={`mt-3 text-xs font-medium ${
              importFeedback.type === 'ok' ? 'text-emerald-700' : 'text-[#C83E31]'
            }`}
          >
            {importFeedback.msg}
          </p>
        )}
      </section>

      {/* Match Records Table */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Structured Match Records
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {filteredMatches.length} of {matches.length} total rows
            </p>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No match records match your current search or filter.
          </div>
        ) : (
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
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatches.map((m) => (
                  <tr key={m.match_id} className="hover:bg-slate-50">
                    <td className="px-5 py-2.5 font-mono text-xs font-medium text-slate-900">
                      {m.match_id}
                    </td>
                    <td className="px-5 py-2.5 font-mono text-xs text-slate-600 tabular-nums">
                      {m.date}
                    </td>
                    <td className="px-5 py-2.5 text-slate-800">{m.boxer_a}</td>
                    <td className="px-5 py-2.5 text-slate-800">{m.boxer_b}</td>
                    <td className="px-5 py-2.5 font-semibold text-slate-900">{m.winner}</td>
                    <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {m.score_a}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-700">
                      {m.score_b}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono tabular-nums text-slate-600">
                      {m.rounds}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(m.match_id)}
                        disabled={busyId === m.match_id}
                        aria-label={`Delete match ${m.match_id}`}
                        className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-[#C83E31]/10 hover:text-[#C83E31] disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Live Raw CSV Preview (Slide 9 Test 3 verification) */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="font-display text-base font-semibold text-slate-900">
              Live CSV Source (data/matches.csv)
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Updates immediately whenever a match is added, imported, or deleted
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {csvLines.length - 1} data rows
          </span>
        </div>

        <div className="overflow-x-auto bg-[#0F172A] p-5 font-mono text-xs leading-relaxed text-slate-200 rounded-b-lg">
          {csvLines.map((line, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-6 select-none text-right text-slate-500 tabular-nums">
                {i + 1}
              </span>
              <span className={i === 0 ? 'font-semibold text-slate-100' : 'text-slate-300'}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
