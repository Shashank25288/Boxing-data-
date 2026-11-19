import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  FileSpreadsheet,
  GitCompare,
  LayoutDashboard,
  Menu,
  Plus,
  X,
} from 'lucide-react';
import { AddMatchModal } from './components/AddMatchModal';
import { BoxerComparisonView } from './components/BoxerComparisonView';
import { DemoGuideView } from './components/DemoGuideView';
import { OverviewView } from './components/OverviewView';
import { RecordsCsvView } from './components/RecordsCsvView';
import { ScoreStatsView } from './components/ScoreStatsView';
import type { DatasetStats, MatchRecord } from './lib/statistics';

type ActiveTab = 'overview' | 'compare' | 'stats' | 'records' | 'guide';

interface ApiDatasetPayload {
  matches: MatchRecord[];
  stats: DatasetStats;
  csvRaw: string;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'compare', label: 'Boxer Comparison', icon: GitCompare },
  { id: 'stats', label: 'Score & Stats Lab', icon: BarChart3 },
  { id: 'records', label: 'Match Records & CSV', icon: FileSpreadsheet },
  { id: 'guide', label: 'Demo Guide & Tests', icon: BookOpen },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [dataset, setDataset] = useState<ApiDatasetPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const json = (await res.json()) as ApiDatasetPayload;
      setDataset(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load match dataset.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  const nextIdSuggestion = useMemo(() => {
    if (!dataset) return 'M001';
    let maxNum = 0;
    for (const m of dataset.matches) {
      const match = /^M(\d+)$/i.exec(m.match_id.trim());
      if (match) {
        const val = Number(match[1]);
        if (val > maxNum) maxNum = val;
      }
    }
    return `M${String(maxNum + 1).padStart(3, '0')}`;
  }, [dataset]);

  const handleAddMatch = async (payload: {
    match_id: string;
    date: string;
    boxer_a: string;
    boxer_b: string;
    winner: string;
    score_a: number;
    score_b: number;
    rounds: number;
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to save match.' };
      }
      setDataset({
        matches: json.matches,
        stats: json.stats,
        csvRaw: json.csvRaw,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while saving match record.' };
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${encodeURIComponent(matchId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) return;
      const json = (await res.json()) as ApiDatasetPayload;
      setDataset(json);
    } catch {
      // keep existing state if delete fails
    }
  };

  const handleResetSample = async () => {
    try {
      const res = await fetch('/api/matches/reset', { method: 'POST' });
      if (!res.ok) return;
      const json = (await res.json()) as ApiDatasetPayload;
      setDataset(json);
    } catch {
      // keep existing state if reset fails
    }
  };

  const handleImportCsv = async (
    csvText: string
  ): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/matches/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Invalid CSV file.' };
      }
      setDataset({
        matches: json.matches,
        stats: json.stats,
        csvRaw: json.csvRaw,
      });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while importing CSV.' };
    }
  };

  const activeNavLabel =
    NAV_ITEMS.find((item) => item.id === activeTab)?.label ?? 'Overview';

  const selectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F9] text-[#0F172A]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#0F172A] text-slate-200 lg:flex">
        <div>
          <div className="border-b border-slate-800 px-6 py-5">
            <p className="font-display text-base font-bold tracking-tight text-white">
              Boxing Analytics
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Probability & Statistics Demo
            </p>
          </div>

          <nav aria-label="Primary navigation" className="space-y-1 p-3">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#C83E31] text-white'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-400">
          <p className="font-medium text-slate-300">Academic Sample Dataset</p>
          <p className="mt-1 leading-relaxed">
            Fictional match records for descriptive statistics demonstration.
          </p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-50 flex w-64 flex-col justify-between bg-[#0F172A] text-slate-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                <span className="font-display text-base font-bold text-white">
                  Boxing Analytics
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded p-1 text-slate-400 hover:text-white"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1 p-3">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium whitespace-nowrap ${
                        isActive
                          ? 'bg-[#C83E31] text-white'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar Contract: Breadcrumb left, 1 primary action right */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-slate-400 sm:inline whitespace-nowrap">
                Boxing Match Visualization
              </span>
              <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="truncate font-display text-base font-semibold text-slate-900">
                {activeNavLabel}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[#C83E31] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#B23327] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C83E31]"
          >
            <Plus className="h-4 w-4" />
            Add Match
          </button>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 p-6">
          {loading ? (
            <div className="space-y-6" aria-busy="true" aria-label="Loading match statistics">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-28 animate-pulse rounded-lg border border-slate-200 bg-white p-5"
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white lg:col-span-7" />
                <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white lg:col-span-5" />
              </div>
            </div>
          ) : error || !dataset ? (
            <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Unable to load match dataset
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {error || 'Unexpected error communicating with the CSV backend.'}
              </p>
              <button
                type="button"
                onClick={fetchDataset}
                className="mt-5 rounded-md bg-[#0F172A] px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                Retry Loading Data
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewView
                  matches={dataset.matches}
                  stats={dataset.stats}
                  onNavigateTab={(tab) => selectTab(tab)}
                  onOpenAddMatch={() => setIsAddModalOpen(true)}
                />
              )}
              {activeTab === 'compare' && (
                <BoxerComparisonView
                  boxers={dataset.stats.boxers}
                  matches={dataset.matches}
                />
              )}
              {activeTab === 'stats' && (
                <ScoreStatsView matches={dataset.matches} stats={dataset.stats} />
              )}
              {activeTab === 'records' && (
                <RecordsCsvView
                  matches={dataset.matches}
                  boxers={dataset.stats.boxers}
                  csvRaw={dataset.csvRaw}
                  onOpenAddMatch={() => setIsAddModalOpen(true)}
                  onDeleteMatch={handleDeleteMatch}
                  onResetSample={handleResetSample}
                  onImportCsv={handleImportCsv}
                />
              )}
              {activeTab === 'guide' && (
                <DemoGuideView
                  stats={dataset.stats}
                  onNavigateTab={(tab) => selectTab(tab)}
                  onOpenAddMatch={() => setIsAddModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      <AddMatchModal
        isOpen={isAddModalOpen}
        existingBoxers={dataset?.stats.boxers.map((b) => b.name) ?? []}
        nextIdSuggestion={nextIdSuggestion}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddMatch}
      />
    </div>
  );
}
