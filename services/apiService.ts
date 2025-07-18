import type { PlayerStats, TrackerApiResponse, TrackerSegment } from '../types';

const API_BASE_URL = 'http://localhost:3001';

/**
 * Parsifica la risposta grezza dell'API di Tracker Network in un oggetto PlayerStats pulito.
 * @param apiData La risposta JSON dall'API di Tracker.
 * @param username Il nome utente originale richiesto.
 * @param platform La piattaforma originale richiesta.
 * @returns Un oggetto PlayerStats strutturato.
 */
const parseTrackerApiResponse = (apiData: TrackerApiResponse, username: string, platform: string): PlayerStats => {
    const overview = apiData.data.segments.find(s => s.type === 'overview');
    if (!overview) {
        throw new Error("Dati 'overview' non trovati nella risposta dell'API.");
    }
    
    const operators = apiData.data.segments.filter(s => s.type === 'operator' && s.stats.kills);

    const topAttackers = operators
        .filter(op => op.metadata.role === 'Attacker')
        .sort((a, b) => (b.stats.kills?.value ?? 0) - (a.stats.kills?.value ?? 0))
        .slice(0, 3)
        .map(op => ({ name: op.metadata.name, kills: op.stats.kills?.value ?? 0 }));

    const topDefenders = operators
        .filter(op => op.metadata.role === 'Defender')
        .sort((a, b) => (b.stats.kills?.value ?? 0) - (a.stats.kills?.value ?? 0))
        .slice(0, 3)
        .map(op => ({ name: op.metadata.name, kills: op.stats.kills?.value ?? 0 }));

    const stats: PlayerStats = {
        username: apiData.data.platformInfo.platformUserIdentifier || username,
        platform,
        level: { value: overview.stats.level?.value ?? 0, displayName: "Livello" },
        kd: { value: overview.stats.kd?.value ?? 0, displayName: "K/D Ratio" },
        winRate: { value: overview.stats.wlPercentage?.value ?? 0, displayName: "Win Rate" },
        topAttackers,
        topDefenders,
    };
    return stats;
};

/**
 * Chiama il nostro server proxy per ottenere le statistiche reali di un giocatore da R6 Tracker.
 * @param username Il nome utente del giocatore.
 * @param platform La piattaforma del giocatore (pc, psn, xbl).
 * @returns Una Promise che risolve in PlayerStats.
 */
export const fetchPlayerStats = async (username: string, platform: string): Promise<PlayerStats> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/player/${platform}/${username}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Errore ${response.status}`);
        }

        const data: TrackerApiResponse = await response.json();
        return parseTrackerApiResponse(data, username, platform);

    } catch (error) {
        console.error("Errore nel recuperare le statistiche del giocatore:", error);
        if (error instanceof Error) {
           throw new Error(error.message);
        }
        throw new Error("Errore di rete o del server proxy.");
    }
};
