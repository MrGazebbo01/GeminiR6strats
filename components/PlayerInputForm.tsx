import React, { useState } from 'react';

interface PlayerInputFormProps {
  onAddPlayer: (username: string, platform: string) => void;
  playerCount: number;
}

const PlayerInputForm: React.FC<PlayerInputFormProps> = ({ onAddPlayer, playerCount }) => {
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('pc');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && playerCount < 5) {
      onAddPlayer(username.trim(), platform);
      setUsername('');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Aggiungi Giocatori alla Squadra</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nome utente R6"
          className="flex-grow bg-gray-900 text-white placeholder-gray-500 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={playerCount >= 5}
        />
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-gray-900 text-white border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={playerCount >= 5}
        >
          <option value="pc">PC</option>
          <option value="xbl">Xbox</option>
          <option value="psn">PlayStation</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={playerCount >= 5 || !username.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Aggiungi
        </button>
      </form>
      {playerCount >= 5 && (
        <p className="text-sm text-yellow-400 mt-3">Hai raggiunto il limite massimo di 5 giocatori.</p>
      )}
    </div>
  );
};

export default PlayerInputForm;
