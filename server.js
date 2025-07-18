require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

const R6TRACKER_API_KEY = process.env.R6TRACKER_API_KEY;

if (!R6TRACKER_API_KEY) {
    console.error("ERRORE: La variabile d'ambiente R6TRACKER_API_KEY non è stata impostata. Crea un file .env e aggiungila.");
    process.exit(1);
}

app.use(cors()); // Abilita CORS per tutte le rotte

app.get('/api/player/:platform/:username', async (req, res) => {
    const { platform, username } = req.params;

    // Converte la piattaforma dal nostro formato a quello richiesto dall'API di Tracker Network
    // 'pc' -> 'uplay', 'psn' -> 'psn', 'xbl' -> 'xbl'
    const apiPlatform = platform === 'pc' ? 'uplay' : platform;

    const url = `https://public-api.tracker.gg/v2/r6/standard/profile/${apiPlatform}/${username}`;

    try {
        console.log(`Richiesta proxy a: ${url}`);
        const response = await axios.get(url, {
            headers: {
                'TRN-Api-Key': R6TRACKER_API_KEY,
                'Accept': 'application/json',
                'Accept-Encoding': 'gzip'
            }
        });

        res.json(response.data);

    } catch (error) {
        console.error("Errore durante la chiamata all'API di R6 Tracker:", error.response ? error.response.data : error.message);
        const statusCode = error.response ? error.response.status : 500;
        const message = error.response && error.response.data && error.response.data.message ? error.response.data.message : 'Errore del server proxy';
        
        if (statusCode === 404) {
            res.status(404).json({ message: 'Giocatore non trovato. Controlla nome utente e piattaforma.' });
        } else {
            res.status(statusCode).json({ message });
        }
    }
});

app.listen(port, () => {
    console.log(`Server proxy in ascolto sulla porta ${port}`);
});
