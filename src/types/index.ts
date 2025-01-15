export interface Player {
  id: number;
  name: string;
  stats: PlayerStats;
  playingTime: number; // en secondes
  onCourt: boolean;
}

export interface PlayerStats {
  points2Made: number;
  points2Missed: number;
  points3Made: number;
  points3Missed: number;
  freeThrowsMade: number;
  freeThrowsMissed: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  assists: number;
  steals: number;
  block: number;
  turnovers: number;
  evaluation: number;
}

export interface TeamStats extends PlayerStats {
  totalPoints: number;
  shootingPercentages: {
    points2: number;
    points3: number;
    freeThrows: number;
  };
}

export interface Game {
  date: Date;
  name: string;
  players: Player[];
}