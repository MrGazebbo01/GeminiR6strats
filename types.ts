// Rappresenta un dettaglio specifico di una statistica (es. K/D, Win Rate)
export interface StatDetail {
  value: number;
  displayName: string;
}

// Rappresenta la struttura dei dati di un giocatore, parsata dalla risposta REALE dell'API
export interface PlayerStats {
  username: string;
  platform: string;
  level: StatDetail;
  kd: StatDetail;
  winRate: StatDetail;
  topAttackers: { name: string; kills: number }[];
  topDefenders: { name: string; kills: number }[];
}

export interface Player {
  id: string;
  username: string;
  platform: string;
  stats: PlayerStats | null;
  isLoading: boolean;
  error?: string;
}

export interface PlayerRole {
  username:string;
  operator: string;
  role: string;
  instructions: string;
}

export interface Strategy {
  strategyTitle: string;
  map: string;
  site: string;
  strategyOverview: string;
  executionSummary: string;
  phases: {
    setup: string;
    execution: string;
    postPlant: string;
  };
  playerRoles: PlayerRole[];
}

// Interfacce per la risposta grezza dell'API di Tracker Network
export interface TrackerApiStat {
    rank: number | null;
    percentile: number | null;
    displayName: string;
    displayCategory: string;
    category: string;
    metadata: {};
    value: number;
    displayValue: string;
    displayType: string;
}

export interface TrackerSegment {
    type: 'overview' | 'operator';
    attributes: {
        key?: string; // operator key like "thermite"
    };
    metadata: {
        name: string;
        imageUrl?: string;
        role?: 'Attacker' | 'Defender';
    };
    stats: {
        kills?: TrackerApiStat;
        deaths?: TrackerApiStat;
        kd?: TrackerApiStat;
        wins?: TrackerApiStat;
        losses?: TrackerApiStat;
        wlPercentage?: TrackerApiStat;
        headshots?: TrackerApiStat;
        level?: TrackerApiStat;
        timePlayed?: TrackerApiStat;
    };
}

export interface TrackerApiResponse {
    data: {
        platformInfo: {
            platformSlug: string;
            platformUserIdentifier: string;
        };
        userInfo: {
            userId: string;
            isPremium: boolean;
            isVerified: boolean;
            isInfluencer: boolean;
            isPartner: boolean;
            countryCode: string;
        };
        segments: TrackerSegment[];
    };
}
