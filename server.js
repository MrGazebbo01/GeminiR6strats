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

// Endpoint 1: R6 Tracker API Proxy
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

// Endpoint 2: Gemini Strategy Generator
app.post('/api/generate-strategy', async (req, res) => {
  try {
    const { attacker, defender, mapName } = req.body;
    const prompt = `
Sei un esperto di Rainbow Six Siege. Genera una strategia efficace in base a:
- Attaccanti: ${attacker.join(', ')}
- Difensori: ${defender.join(', ')}
- Mappa: ${mapName}
Fornisci istruzioni per posizionamenti, gadget e rotazioni.
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ strategy: text });
  } catch (err) {
    res.status(500).json({ error: 'Errore generazione strategia con Gemini' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server avviato su http://localhost:${port}`);
});
