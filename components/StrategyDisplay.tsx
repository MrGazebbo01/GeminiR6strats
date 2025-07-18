import React from 'react';
import type { Strategy, PlayerRole } from '../types';

const PhaseSection: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div>
        <h4 className="text-xl font-semibold text-blue-300 mb-2">{title}</h4>
        <p className="text-gray-300 leading-relaxed">{content}</p>
    </div>
);

const RoleCard: React.FC<{ role: PlayerRole }> = ({ role }) => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <div className="flex items-baseline gap-3 mb-2">
            <h5 className="text-xl font-bold text-white">{role.username}</h5>
            <span className="text-blue-400 font-semibold">{role.operator}</span>
        </div>
        <p className="text-sm font-medium text-yellow-300 mb-3 bg-yellow-900/30 inline-block px-2 py-1 rounded">{role.role}</p>
        <p className="text-gray-300 text-sm leading-relaxed">{role.instructions}</p>
    </div>
);

const StrategyDisplay: React.FC<{ strategy: Strategy }> = ({ strategy }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 mt-8 backdrop-blur-sm">
      <header className="text-center mb-6 border-b border-gray-700 pb-4">
        <h2 className="text-4xl font-extrabold text-white tracking-tight">{strategy.strategyTitle}</h2>
        <p className="text-lg text-gray-400 mt-2">{strategy.map} - Sito Bomba: {strategy.site}</p>
      </header>

      <section className="mb-8">
        <h3 className="text-2xl font-bold text-blue-400 mb-3">Panoramica della Strategia</h3>
        <p className="text-gray-300 text-lg leading-relaxed">{strategy.strategyOverview}</p>
      </section>
      
      <section className="mb-8">
        <h3 className="text-2xl font-bold text-blue-400 mb-3">Riepilogo Esecuzione</h3>
        <p className="text-gray-300 text-lg leading-relaxed bg-gray-900/50 p-4 rounded-lg border border-gray-700">{strategy.executionSummary}</p>
      </section>

      <section className="mb-8 bg-gray-900/50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-blue-400 mb-4">Fasi del Round</h3>
        <div className="space-y-4">
          <PhaseSection title="Fase di Preparazione (Droni)" content={strategy.phases.setup} />
          <PhaseSection title="Esecuzione" content={strategy.phases.execution} />
          <PhaseSection title="Post-Piantamento" content={strategy.phases.postPlant} />
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-bold text-blue-400 mb-4">Ruoli dei Giocatori</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategy.playerRoles.map((role) => (
            <RoleCard key={role.username} role={role} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default StrategyDisplay;
