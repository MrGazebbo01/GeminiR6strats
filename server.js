import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint R6 Tracker
app.get('/api/player/:platform/:username', async (req, res) => {
  try {
    const { platform, username } = req.params;
    const response = await axios.get(`https://public-api.tracker.gg/v2/r6/standard/profile/${platform}/${username}`, {
      headers: { 'TRN-Api-Key': process.env.R6TRACKER_API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Errore chiamata a R6 Tracker API' });
  }
});

// Endpoint Gemini
app.post('/api/generate-strategy', async (req, res) => {
  try {
    const { players, map, site } = req.body;

    const simplifiedStats = players
      .map(p => p.stats)
      .filter(s => s !== null)
      .map(stats => ({
        username: stats.username,
        platform: stats.platform,
        level: stats.level.value,
        kdRatio: stats.kd.value,
        winRate: stats.winRate.value,
        topAttackers: stats.topAttackers.map(op => op.name),
        topDefenders: stats.topDefenders.map(op => op.name),
      }));

    const prompt = `
Sei un esperto stratega di Rainbow Six Siege. Genera una strategia d'attacco per:
- Mappa: ${map}
- Sito: ${site}
Con questi giocatori:
${JSON.stringify(simplifiedStats, null, 2)}
La risposta dev’essere solo JSON.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const match = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = match ? match[1] : text;
    const strategy = JSON.parse(jsonString);

    res.json(strategy);
  } catch (err) {
    console.error('Errore Gemini:', err);
    res.status(500).json({ error: 'Errore generazione strategia' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
