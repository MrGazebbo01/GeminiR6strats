import React from 'react';
import type { Player } from '../types';
import Loader from './Loader';

interface PlayerStatsCardProps {
  player: Player;
  onRemove: (id: string) => void;
}

const StatItem: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 bg-gray-900/50 p-3 rounded-lg">
    <div className="text-blue-400">{icon}</div>
    <div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  </div>
);

const OperatorList: React.FC<{ title: string; operators: { name: string; kills: number }[] }> = ({ title, operators }) => (
    <div>
        <h4 className="text-md font-semibold text-blue-300 mb-2">{title}</h4>
        {operators.length > 0 ? (
          <ul className="space-y-1 text-gray-300">
              {operators.map((op) => (
                  <li key={op.name} className="flex justify-between text-sm">
                      <span>{op.name}</span>
                      <span className="font-mono text-gray-400">{op.kills} kills</span>
                  </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Nessun dato operatore</p>
        )}
    </div>
);


const PlayerStatsCard: React.FC<PlayerStatsCardProps> = ({ player, onRemove }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-5 relative transition-all duration-300 hover:border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
            {player.username}
            <span className="ml-3 text-xs uppercase bg-gray-700 text-gray-300 px-2 py-1 rounded-full font-semibold tracking-wider">{player.platform}</span>
        </h3>
        <button
          onClick={() => onRemove(player.id)}
          className="text-gray-500 hover:text-red-500 transition-colors"
          aria-label={`Rimuovi ${player.username}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {player.isLoading && <Loader />}
      
      {player.error && <p className="text-red-400 text-center py-4">{player.error}</p>}

      {player.stats && !player.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
                 <StatItem label={player.stats.level.displayName} value={player.stats.level.value} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.98 9.11c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                 } />
                 <StatItem label={player.stats.kd.displayName} value={player.stats.kd.value.toFixed(2)} icon={
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 } />
                 <StatItem label={player.stats.winRate.displayName} value={`${player.stats.winRate.value.toFixed(1)}%`} icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                 } />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-900/30 p-4 rounded-lg">
                <OperatorList title="Top Attaccanti (per Kills)" operators={player.stats.topAttackers} />
                <OperatorList title="Top Difensori (per Kills)" operators={player.stats.topDefenders} />
            </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsCard;
