import React, { useState, useCallback, useMemo } from 'react';
import type { Player, Strategy } from './types';
import { fetchPlayerStats } from './services/apiService';
import { generateStrategy } from './services/geminiService';
import PlayerInputForm from './components/PlayerInputForm';
import PlayerStatsCard from './components/PlayerStatsCard';
import StrategyDisplay from './components/StrategyDisplay';
import Loader from './components/Loader';

const MAPS_AND_SITES: Record<string, string[]> = {
  'Oregon': ['Cucina/Sala da pranzo', 'Bambini/Dormitori', 'Torre/Archivi'],
  'Club House': ['Contanti/CCTV', 'Palestra/Camera da letto', 'Bar/Magazzino'],
  'Kafe Dostoyevsky': ['Bar/Cocktail Lounge', 'Cucina/Servizio', 'Sala lettura/Camino'],
  'Banca': ['Caveau/CCTV', 'Uffici Direzionali/CEO', 'Spogliatoi/Archivi'],
  'Consolato': ['Garage/Sala riunioni', 'Lobby/Ufficio stampa'],
  'Chalet': ['Cantina/Cantina vini', 'Biblioteca/Sala giochi', 'Cucina/Sala trofei']
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const initialMap = Object.keys(MAPS_AND_SITES)[0];
  const [selectedMap, setSelectedMap] = useState<string>(initialMap);
  const [selectedSite, setSelectedSite] = useState<string>(MAPS_AND_SITES[initialMap][0]);

  const availableSites = useMemo(() => MAPS_AND_SITES[selectedMap] || [], [selectedMap]);

  const handleAddPlayer = useCallback(async (username: string, platform: string) => {
    if (players.some(p => p.username.toLowerCase() === username.toLowerCase())) {
        setError(`Il giocatore "${username}" è già nella squadra.`);
        setTimeout(() => setError(null), 3000);
        return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      username,
      platform,
      stats: null,
      isLoading: true,
    };

    setPlayers(prev => [...prev, newPlayer]);
    setStrategy(null); // Clear old strategy

    try {
      const stats = await fetchPlayerStats(username, platform);
      setPlayers(prev =>
        prev.map(p => (p.id === newPlayer.id ? { ...p, stats, isLoading: false } : p))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      const userFriendlyMessage = errorMessage.includes("fetch") ? "Impossibile connettersi al server proxy. Assicurati che sia in esecuzione sulla porta 3001." : errorMessage;
      setPlayers(prev =>
        prev.map(p => (p.id === newPlayer.id ? { ...p, isLoading: false, error: userFriendlyMessage } : p))
      );
    }
  }, [players]);

  const handleRemovePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setStrategy(null); // Clear old strategy
  }, []);

  const handleGenerateStrategy = async () => {
    const playersWithStats = players.filter(p => p.stats);
    if (playersWithStats.length === 0) {
      setError("Aggiungi almeno un giocatore con statistiche valide per generare una strategia.");
      setTimeout(() => setError(null), 4000);
      return;
    }

    setIsLoadingStrategy(true);
    setError(null);
    setStrategy(null);

    try {
      const newStrategy = await generateStrategy(playersWithStats, selectedMap, selectedSite);
      setStrategy(newStrategy);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(`Errore nella generazione della strategia: ${errorMessage}`);
    } finally {
      setIsLoadingStrategy(false);
    }
  };
  
  const handleMapChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMap = e.target.value;
    setSelectedMap(newMap);
    setSelectedSite(MAPS_AND_SITES[newMap][0]);
    setStrategy(null);
  }

  const canGenerate = players.some(p => p.stats) && !isLoadingStrategy && selectedMap && selectedSite;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            R6 Siege Strategy Generator
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Crea strategie personalizzate basate sulle statistiche REALI dei tuoi giocatori.
          </p>
        </header>

        <main>
          <div className="space-y-8">
            <PlayerInputForm onAddPlayer={handleAddPlayer} playerCount={players.length} />

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Imposta lo Scenario</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="map-select" className="block text-sm font-medium text-gray-300 mb-1">Mappa</label>
                        <select id="map-select" value={selectedMap} onChange={handleMapChange} className="w-full bg-gray-900 text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {Object.keys(MAPS_AND_SITES).map(map => (
                                <option key={map} value={map}>{map}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="site-select" className="block text-sm font-medium text-gray-300 mb-1">Sito Bomba</label>
                        <select id="site-select" value={selectedSite} onChange={(e) => {setSelectedSite(e.target.value); setStrategy(null);}} className="w-full bg-gray-900 text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {availableSites.map(site => (
                                <option key={site} value={site}>{site}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {players.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {players.map(player => (
                  <PlayerStatsCard key={player.id} player={player} onRemove={handleRemovePlayer} />
                ))}
              </div>
            )}

            {players.length > 0 && (
                <div className="flex justify-center mt-8">
                    <button
                    onClick={handleGenerateStrategy}
                    disabled={!canGenerate}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg px-10 py-4 rounded-lg shadow-xl hover:scale-105 transform transition-transform duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100"
                    >
                    {isLoadingStrategy ? (
                        <div className="flex items-center gap-3">
                            <Loader size="sm" />
                            <span>Generazione in corso...</span>
                        </div>
                    ) : 'Genera Strategia d\'Attacco'}
                    </button>
                </div>
            )}
            
            {isLoadingStrategy && !strategy && (
                <div className="mt-8 text-center">
                    <Loader size="lg" />
                    <p className="mt-4 text-gray-400">L'IA sta elaborando la strategia migliore per la tua squadra...</p>
                </div>
            )}

            {strategy && <StrategyDisplay strategy={strategy} />}
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Powered by Google Gemini & R6 Tracker API. Assicurati che il server proxy sia in esecuzione.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
