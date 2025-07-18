import type { Player, Strategy } from '../types';

export async function generateStrategy(players: Player[], map: string, site: string): Promise<Strategy> {
  const response = await fetch('http://localhost:3001/api/generate-strategy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ players, map, site })
  });

  if (!response.ok) throw new Error('Errore dal backend Gemini');
  return await response.json();
}
