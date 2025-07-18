import { GoogleGenAI, Type } from "@google/genai";
import type { Player, Strategy } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJsonFromResponse = <T,>(text: string): T | null => {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = match ? match[1] : text;
    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Failed to parse JSON:", error);
        return null;
    }
};

export const generateStrategy = async (players: Player[], map: string, site: string): Promise<Strategy> => {
    const playerStats = players.map(p => p.stats).filter(s => s !== null);
    
    if (playerStats.length === 0) {
        throw new Error("Nessun dato statistico del giocatore disponibile per generare una strategia.");
    }
    
    // Semplifichiamo l'oggetto stats per il prompt per renderlo più leggibile per l'IA
    const simplifiedStats = playerStats.map(stats => ({
        username: stats.username,
        platform: stats.platform,
        level: stats.level.value,
        kdRatio: stats.kd.value,
        winRate: stats.winRate.value,
        topAttackers: stats.topAttackers.map(op => op.name),
        topDefenders: stats.topDefenders.map(op => op.name),
    }));

    const prompt = `
    Sei un esperto stratega e coach di Rainbow Six Siege. Ti verrà fornito un oggetto JSON contenente le statistiche di una squadra di ${simplifiedStats.length} giocatori, ottenute dall'API di R6 Tracker.
    Sulla base di queste statistiche reali, genera una strategia d'attacco dettagliata ed efficace per la mappa '${map}', specificamente per il sito bomba '${site}'.

    Le statistiche della squadra sono:
    ${JSON.stringify(simplifiedStats, null, 2)}

    La tua risposta DEVE essere solo l'oggetto JSON, senza testo aggiuntivo o markdown.
    Assegna ruoli e operatori che si adattino al meglio al profilo di ciascun giocatore (es. giocatore con K/D alto come Entry Fragger, giocatore con operatori di supporto nella sua lista principale come Supporto). Assicurati che gli operatori suggeriti formino una composizione di squadra coesa e forte per la strategia scelta. Se ci sono meno di 5 giocatori, crea ruoli per il numero di giocatori forniti.
    Includi anche un campo 'executionSummary' che riassuma l'esecuzione della strategia in 2-3 frasi concise.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        strategyTitle: { type: Type.STRING },
                        map: { type: Type.STRING },
                        site: { type: Type.STRING },
                        strategyOverview: { type: Type.STRING },
                        executionSummary: { type: Type.STRING },
                        phases: {
                            type: Type.OBJECT,
                            properties: {
                                setup: { type: Type.STRING },
                                execution: { type: Type.STRING },
                                postPlant: { type: Type.STRING },
                            }
                        },
                        playerRoles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    username: { type: Type.STRING },
                                    operator: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    instructions: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        });
        
        const strategy = parseJsonFromResponse<Strategy>(response.text);
        if (!strategy) {
            throw new Error("La risposta dell'API non era un JSON valido per la strategia.");
        }
        return strategy;
    } catch (error) {
        console.error("Errore durante la generazione della strategia:", error);
        throw new Error("Impossibile generare la strategia.");
    }
};
