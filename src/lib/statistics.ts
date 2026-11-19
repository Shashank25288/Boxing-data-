export interface MatchRecord {
  match_id: string;
  date: string;
  boxer_a: string;
  boxer_b: string;
  winner: string;
  score_a: number;
  score_b: number;
  rounds: number;
}

export interface BoxerStats {
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  winPercentage: number;
  empiricalWinFrequency: number;
  avgScore: number;
  minScore: number;
  maxScore: number;
  scoreStdDev: number;
  avgMargin: number;
  totalPoints: number;
}

export interface ScoreBin {
  label: string;
  min: number;
  max: number;
  count: number;
}

export interface DatasetStats {
  totalMatches: number;
  uniqueBoxers: number;
  totalScoreObservations: number;
  totalRounds: number;
  avgRounds: number;
  meanScore: number;
  medianScore: number;
  modeScores: number[];
  modeMaxFrequency: number;
  populationVariance: number;
  populationStdDev: number;
  minScore: number;
  maxScore: number;
  scoreBins: ScoreBin[];
  boxers: BoxerStats[];
}

export const DEFAULT_MATCHES_CSV = `match_id,date,boxer_a,boxer_b,winner,score_a,score_b,rounds
M001,2026-01-12,Arjun,Dev,Arjun,78,71,3
M002,2026-01-18,Dev,Kiran,Kiran,68,75,3
M003,2026-01-24,Arjun,Kiran,Arjun,81,76,3
M004,2026-02-02,Manoj,Dev,Dev,70,74,3
M005,2026-02-09,Kiran,Manoj,Kiran,79,73,3
M006,2026-02-15,Arjun,Manoj,Manoj,72,77,3
M007,2026-02-22,Arjun,Dev,Arjun,80,74,3
M008,2026-03-01,Kiran,Arjun,Arjun,76,82,3
M009,2026-03-08,Dev,Manoj,Dev,78,73,3
M010,2026-03-14,Manoj,Kiran,Manoj,79,69,3
`;

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

export function serializeMatchesCsv(matches: MatchRecord[]): string {
  const header = 'match_id,date,boxer_a,boxer_b,winner,score_a,score_b,rounds';
  const rows = matches.map((m) =>
    [
      escapeCsvCell(m.match_id),
      escapeCsvCell(m.date),
      escapeCsvCell(m.boxer_a),
      escapeCsvCell(m.boxer_b),
      escapeCsvCell(m.winner),
      m.score_a,
      m.score_b,
      m.rounds,
    ].join(',')
  );
  return `${header}\n${rows.join('\n')}${rows.length > 0 ? '\n' : ''}`;
}

export function validateMatchInput(input: {
  match_id?: string;
  date: string;
  boxer_a: string;
  boxer_b: string;
  winner: string;
  score_a: number;
  score_b: number;
  rounds: number;
}): { ok: true; value: MatchRecord } | { ok: false; error: string } {
  const boxerA = input.boxer_a.trim();
  const boxerB = input.boxer_b.trim();
  const winner = input.winner.trim();
  const date = input.date.trim();
  const matchId = (input.match_id ?? '').trim();

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'Date must be in YYYY-MM-DD format.' };
  }
  if (!boxerA || !boxerB) {
    return { ok: false, error: 'Both Boxer A and Boxer B names are required.' };
  }
  if (boxerA.toLowerCase() === boxerB.toLowerCase()) {
    return { ok: false, error: 'Boxer A and Boxer B must be different participants.' };
  }
  if (winner !== boxerA && winner !== boxerB) {
    return { ok: false, error: 'Winner must match either Boxer A or Boxer B.' };
  }
  if (!Number.isFinite(input.score_a) || !Number.isFinite(input.score_b) || input.score_a < 0 || input.score_b < 0 || input.score_a > 200 || input.score_b > 200) {
    return { ok: false, error: 'Scores must be valid numbers between 0 and 200.' };
  }
  if (!Number.isInteger(input.rounds) || input.rounds < 1 || input.rounds > 15) {
    return { ok: false, error: 'Rounds must be a whole number between 1 and 15.' };
  }

  return {
    ok: true,
    value: {
      match_id: matchId,
      date,
      boxer_a: boxerA,
      boxer_b: boxerB,
      winner,
      score_a: Math.round(input.score_a),
      score_b: Math.round(input.score_b),
      rounds: input.rounds,
    },
  };
}

export function parseMatchesCsv(csvText: string): { matches: MatchRecord[]; errors: string[] } {
  const lines = csvText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { matches: [], errors: ['CSV content is empty.'] };
  }

  const headerCells = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const expected = ['match_id', 'date', 'boxer_a', 'boxer_b', 'winner', 'score_a', 'score_b', 'rounds'];
  const idxMap: Record<string, number> = {};
  for (const col of expected) {
    const idx = headerCells.indexOf(col);
    if (idx === -1) {
      return { matches: [], errors: [`Missing required CSV column: ${col}`] };
    }
    idxMap[col] = idx;
  }

  const matches: MatchRecord[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const row = splitCsvLine(lines[i]);
    if (row.length < expected.length) {
      errors.push(`Row ${i + 1}: Incomplete columns.`);
      continue;
    }
    const candidate = {
      match_id: row[idxMap.match_id] || `M${String(i).padStart(3, '0')}`,
      date: row[idxMap.date],
      boxer_a: row[idxMap.boxer_a],
      boxer_b: row[idxMap.boxer_b],
      winner: row[idxMap.winner],
      score_a: Number(row[idxMap.score_a]),
      score_b: Number(row[idxMap.score_b]),
      rounds: Number(row[idxMap.rounds]),
    };

    const validated = validateMatchInput(candidate);
    if (!validated.ok) {
      errors.push(`Row ${i + 1} (${candidate.match_id}): ${validated.error}`);
      continue;
    }
    matches.push(validated.value);
  }

  return { matches, errors };
}

export function computeDatasetStats(matches: MatchRecord[]): DatasetStats {
  const allScores: number[] = [];
  const boxerScores = new Map<string, number[]>();
  const boxerMargins = new Map<string, number[]>();
  const boxerWins = new Map<string, number>();
  const boxerLosses = new Map<string, number>();
  let totalRounds = 0;

  for (const match of matches) {
    allScores.push(match.score_a, match.score_b);
    totalRounds += match.rounds;

    const ensureBoxer = (name: string) => {
      if (!boxerScores.has(name)) boxerScores.set(name, []);
      if (!boxerMargins.has(name)) boxerMargins.set(name, []);
      if (!boxerWins.has(name)) boxerWins.set(name, 0);
      if (!boxerLosses.has(name)) boxerLosses.set(name, 0);
    };

    ensureBoxer(match.boxer_a);
    ensureBoxer(match.boxer_b);

    boxerScores.get(match.boxer_a)!.push(match.score_a);
    boxerScores.get(match.boxer_b)!.push(match.score_b);
    boxerMargins.get(match.boxer_a)!.push(match.score_a - match.score_b);
    boxerMargins.get(match.boxer_b)!.push(match.score_b - match.score_a);

    if (match.winner === match.boxer_a) {
      boxerWins.set(match.boxer_a, (boxerWins.get(match.boxer_a) ?? 0) + 1);
      boxerLosses.set(match.boxer_b, (boxerLosses.get(match.boxer_b) ?? 0) + 1);
    } else {
      boxerWins.set(match.boxer_b, (boxerWins.get(match.boxer_b) ?? 0) + 1);
      boxerLosses.set(match.boxer_a, (boxerLosses.get(match.boxer_a) ?? 0) + 1);
    }
  }

  const n = allScores.length;
  const meanScore = n > 0 ? allScores.reduce((acc, v) => acc + v, 0) / n : 0;

  const sorted = [...allScores].sort((a, b) => a - b);
  let medianScore = 0;
  if (n > 0) {
    const mid = Math.floor(n / 2);
    medianScore = n % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  // Mode: track frequency in order of first appearance
  const freqMap = new Map<number, number>();
  for (const score of allScores) {
    freqMap.set(score, (freqMap.get(score) ?? 0) + 1);
  }
  let modeMaxFrequency = 0;
  for (const count of freqMap.values()) {
    if (count > modeMaxFrequency) modeMaxFrequency = count;
  }
  const modeScores: number[] = [];
  if (modeMaxFrequency > 1) {
    for (const [score, count] of freqMap.entries()) {
      if (count === modeMaxFrequency) {
        modeScores.push(score);
      }
    }
  }

  const populationVariance =
    n > 0 ? allScores.reduce((acc, v) => acc + (v - meanScore) ** 2, 0) / n : 0;
  const populationStdDev = Math.sqrt(populationVariance);

  const minScore = n > 0 ? sorted[0] : 0;
  const maxScore = n > 0 ? sorted[n - 1] : 0;

  // Build 5-point score bins covering at least [60..84]
  const binStart = n > 0 ? Math.min(60, Math.floor(minScore / 5) * 5) : 60;
  const binEnd = n > 0 ? Math.max(84, Math.floor(maxScore / 5) * 5 + 4) : 84;
  const scoreBins: ScoreBin[] = [];
  for (let low = binStart; low <= binEnd; low += 5) {
    const high = low + 4;
    const count = allScores.filter((s) => s >= low && s <= high).length;
    scoreBins.push({
      label: `${low}–${high}`,
      min: low,
      max: high,
      count,
    });
  }

  const boxers: BoxerStats[] = Array.from(boxerScores.keys())
    .sort((a, b) => {
      const winDiff = (boxerWins.get(b) ?? 0) - (boxerWins.get(a) ?? 0);
      if (winDiff !== 0) return winDiff;
      return a.localeCompare(b);
    })
    .map((name) => {
      const scores = boxerScores.get(name)!;
      const margins = boxerMargins.get(name)!;
      const wins = boxerWins.get(name) ?? 0;
      const losses = boxerLosses.get(name) ?? 0;
      const matchesPlayed = wins + losses;
      const totalPoints = scores.reduce((sum, s) => sum + s, 0);
      const avgScore = matchesPlayed > 0 ? totalPoints / scores.length : 0;
      const variance =
        scores.length > 0
          ? scores.reduce((sum, s) => sum + (s - avgScore) ** 2, 0) / scores.length
          : 0;

      return {
        name,
        matchesPlayed,
        wins,
        losses,
        winPercentage: matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0,
        empiricalWinFrequency: matchesPlayed > 0 ? wins / matchesPlayed : 0,
        avgScore,
        minScore: scores.length > 0 ? Math.min(...scores) : 0,
        maxScore: scores.length > 0 ? Math.max(...scores) : 0,
        scoreStdDev: Math.sqrt(variance),
        avgMargin:
          margins.length > 0 ? margins.reduce((sum, m) => sum + m, 0) / margins.length : 0,
        totalPoints,
      };
    });

  return {
    totalMatches: matches.length,
    uniqueBoxers: boxers.length,
    totalScoreObservations: n,
    totalRounds,
    avgRounds: matches.length > 0 ? totalRounds / matches.length : 0,
    meanScore,
    medianScore,
    modeScores,
    modeMaxFrequency,
    populationVariance,
    populationStdDev,
    minScore,
    maxScore,
    scoreBins,
    boxers,
  };
}
