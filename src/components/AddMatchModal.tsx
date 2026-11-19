import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AddMatchModalProps {
  isOpen: boolean;
  existingBoxers: string[];
  nextIdSuggestion: string;
  onClose: () => void;
  onSubmit: (payload: {
    match_id: string;
    date: string;
    boxer_a: string;
    boxer_b: string;
    winner: string;
    score_a: number;
    score_b: number;
    rounds: number;
  }) => Promise<{ ok: boolean; error?: string }>;
}

export function AddMatchModal({
  isOpen,
  existingBoxers,
  nextIdSuggestion,
  onClose,
  onSubmit,
}: AddMatchModalProps) {
  const [matchId, setMatchId] = useState(nextIdSuggestion);
  const [date, setDate] = useState('2026-03-20');
  const [boxerA, setBoxerA] = useState('Arjun');
  const [boxerB, setBoxerB] = useState('Dev');
  const [scoreA, setScoreA] = useState('80');
  const [scoreB, setScoreB] = useState('75');
  const [winner, setWinner] = useState('Arjun');
  const [rounds, setRounds] = useState('3');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMatchId(nextIdSuggestion);
      setError(null);
    }
  }, [isOpen, nextIdSuggestion]);

  // Keep winner synced cleanly with boxer names & higher score
  useEffect(() => {
    const a = Number(scoreA);
    const b = Number(scoreB);
    if (Number.isFinite(a) && Number.isFinite(b) && boxerA.trim() && boxerB.trim()) {
      if (a > b) setWinner(boxerA.trim());
      else if (b > a) setWinner(boxerB.trim());
      else if (winner !== boxerA.trim() && winner !== boxerB.trim()) {
        setWinner(boxerA.trim());
      }
    }
  }, [scoreA, scoreB, boxerA, boxerB]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const aName = boxerA.trim();
    const bName = boxerB.trim();
    if (!aName || !bName) {
      setError('Both Boxer A and Boxer B names are required.');
      return;
    }
    if (aName.toLowerCase() === bName.toLowerCase()) {
      setError('Boxer A and Boxer B must be different participants.');
      return;
    }

    const numA = Number(scoreA);
    const numB = Number(scoreB);
    const numRounds = Number(rounds);
    if (!Number.isFinite(numA) || !Number.isFinite(numB)) {
      setError('Scores must be valid numbers.');
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      match_id: matchId.trim() || nextIdSuggestion,
      date,
      boxer_a: aName,
      boxer_b: bName,
      winner: winner === bName ? bName : aName,
      score_a: numA,
      score_b: numB,
      rounds: numRounds,
    });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Could not save match record.');
      return;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-match-title"
    >
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 id="add-match-title" className="font-display text-lg font-bold text-slate-900">
              Add Match Record
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Appends a validated row to data/matches.csv and recalculates statistics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="match-id" className="block text-xs font-medium text-slate-700">
                Match ID
              </label>
              <input
                id="match-id"
                type="text"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="match-date" className="block text-xs font-medium text-slate-700">
                Match Date
              </label>
              <input
                id="match-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <datalist id="boxer-suggestions">
            {existingBoxers.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="boxer-a" className="block text-xs font-medium text-slate-700">
                Boxer A
              </label>
              <input
                id="boxer-a"
                type="text"
                list="boxer-suggestions"
                value={boxerA}
                onChange={(e) => setBoxerA(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="boxer-b" className="block text-xs font-medium text-slate-700">
                Boxer B
              </label>
              <input
                id="boxer-b"
                type="text"
                list="boxer-suggestions"
                value={boxerB}
                onChange={(e) => setBoxerB(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="score-a" className="block text-xs font-medium text-slate-700">
                Score A
              </label>
              <input
                id="score-a"
                type="number"
                min={0}
                max={200}
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="score-b" className="block text-xs font-medium text-slate-700">
                Score B
              </label>
              <input
                id="score-b"
                type="number"
                min={0}
                max={200}
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="rounds" className="block text-xs font-medium text-slate-700">
                Rounds
              </label>
              <input
                id="rounds"
                type="number"
                min={1}
                max={15}
                value={rounds}
                onChange={(e) => setRounds(e.target.value)}
                required
                className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm tabular-nums text-slate-900 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700">Recorded Winner</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-md bg-slate-100 p-1">
              {[boxerA.trim() || 'Boxer A', boxerB.trim() || 'Boxer B'].map((candidate, idx) => {
                const isSelected = winner === candidate;
                return (
                  <button
                    key={`${idx}-${candidate}`}
                    type="button"
                    onClick={() => setWinner(candidate)}
                    className={`rounded px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap truncate ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {candidate}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-[#C83E31]/30 bg-[#C83E31]/5 px-3 py-2 text-sm text-[#C83E31]"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-[#C83E31] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B23327] disabled:opacity-60 whitespace-nowrap"
            >
              {submitting ? 'Saving...' : 'Save Match to CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
