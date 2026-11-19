import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_MATCHES_CSV,
  computeDatasetStats,
  parseMatchesCsv,
  serializeMatchesCsv,
  validateMatchInput,
} from './src/lib/statistics.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const CSV_PATH = path.join(DATA_DIR, 'matches.csv');

function ensureCsvFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CSV_PATH)) {
    fs.writeFileSync(CSV_PATH, DEFAULT_MATCHES_CSV, 'utf-8');
  }
}

function readCsvDataset() {
  ensureCsvFile();
  const csvRaw = fs.readFileSync(CSV_PATH, 'utf-8');
  const { matches, errors } = parseMatchesCsv(csvRaw);
  const stats = computeDatasetStats(matches);
  return { matches, stats, csvRaw, errors };
}

function nextMatchId(existing: { match_id: string }[]): string {
  let maxNum = 0;
  for (const m of existing) {
    const match = /^M(\d+)$/i.exec(m.match_id.trim());
    if (match) {
      const n = Number(match[1]);
      if (n > maxNum) maxNum = n;
    }
  }
  return `M${String(maxNum + 1).padStart(3, '0')}`;
}

async function startServer() {
  ensureCsvFile();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/matches', (_req, res) => {
    try {
      const payload = readCsvDataset();
      res.json(payload);
    } catch (error) {
      console.error('Failed to read CSV dataset:', error);
      res.status(500).json({ error: 'Unable to read match records CSV.' });
    }
  });

  app.post('/api/matches', (req, res) => {
    try {
      const current = readCsvDataset();
      const body = req.body ?? {};
      const matchId =
        typeof body.match_id === 'string' && body.match_id.trim().length > 0
          ? body.match_id.trim()
          : nextMatchId(current.matches);

      if (current.matches.some((m) => m.match_id.toLowerCase() === matchId.toLowerCase())) {
        res.status(400).json({ error: `Match ID ${matchId} already exists.` });
        return;
      }

      const validated = validateMatchInput({
        match_id: matchId,
        date: String(body.date ?? ''),
        boxer_a: String(body.boxer_a ?? ''),
        boxer_b: String(body.boxer_b ?? ''),
        winner: String(body.winner ?? ''),
        score_a: Number(body.score_a),
        score_b: Number(body.score_b),
        rounds: Number(body.rounds),
      });

      if (!validated.ok) {
        res.status(400).json({ error: validated.error });
        return;
      }

      const updatedMatches = [...current.matches, validated.value];
      const nextCsv = serializeMatchesCsv(updatedMatches);
      fs.writeFileSync(CSV_PATH, nextCsv, 'utf-8');

      res.status(201).json({
        match: validated.value,
        matches: updatedMatches,
        stats: computeDatasetStats(updatedMatches),
        csvRaw: nextCsv,
      });
    } catch (error) {
      console.error('Failed to add match record:', error);
      res.status(500).json({ error: 'Unable to save new match record.' });
    }
  });

  app.delete('/api/matches/:matchId', (req, res) => {
    try {
      const targetId = req.params.matchId;
      const current = readCsvDataset();
      const filtered = current.matches.filter((m) => m.match_id !== targetId);

      if (filtered.length === current.matches.length) {
        res.status(404).json({ error: `Match ${targetId} not found.` });
        return;
      }

      const nextCsv = serializeMatchesCsv(filtered);
      fs.writeFileSync(CSV_PATH, nextCsv, 'utf-8');

      res.json({
        matches: filtered,
        stats: computeDatasetStats(filtered),
        csvRaw: nextCsv,
      });
    } catch (error) {
      console.error('Failed to delete match record:', error);
      res.status(500).json({ error: 'Unable to delete match record.' });
    }
  });

  app.post('/api/matches/import', (req, res) => {
    try {
      const csvText = typeof req.body?.csv === 'string' ? req.body.csv : '';
      if (!csvText.trim()) {
        res.status(400).json({ error: 'CSV payload is empty.' });
        return;
      }

      const parsed = parseMatchesCsv(csvText);
      if (parsed.matches.length === 0) {
        res.status(400).json({
          error: parsed.errors[0] || 'No valid match rows found in uploaded CSV.',
          errors: parsed.errors,
        });
        return;
      }

      const normalizedCsv = serializeMatchesCsv(parsed.matches);
      fs.writeFileSync(CSV_PATH, normalizedCsv, 'utf-8');

      res.json({
        matches: parsed.matches,
        stats: computeDatasetStats(parsed.matches),
        csvRaw: normalizedCsv,
        warnings: parsed.errors,
      });
    } catch (error) {
      console.error('Failed to import CSV:', error);
      res.status(500).json({ error: 'Unable to import CSV dataset.' });
    }
  });

  app.post('/api/matches/reset', (_req, res) => {
    try {
      fs.writeFileSync(CSV_PATH, DEFAULT_MATCHES_CSV, 'utf-8');
      const payload = readCsvDataset();
      res.json(payload);
    } catch (error) {
      console.error('Failed to reset CSV dataset:', error);
      res.status(500).json({ error: 'Unable to reset sample CSV dataset.' });
    }
  });

  app.get('/api/matches/export', (_req, res) => {
    try {
      ensureCsvFile();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="matches.csv"');
      res.send(fs.readFileSync(CSV_PATH, 'utf-8'));
    } catch (error) {
      console.error('Failed to export CSV:', error);
      res.status(500).json({ error: 'Unable to export CSV file.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Boxing Match Data Visualization server listening on http://localhost:${PORT}`);
  });
}

startServer();
