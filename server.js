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
Sei un esperto coach di Rainbow Six Siege...
[Inserisci lo stesso prompt che hai nel frontend]
...`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Estrarre solo JSON da risposta:
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = match ? match[1] : text;
    const strategy = JSON.parse(jsonString);

    res.json(strategy);
  } catch (err) {
    console.error('Errore Gemini:', err);
    res.status(500).json({ error: 'Errore generazione strategia' });
  }
});
