export const INITIAL_ELO = 1000;

export const RANKING_SPORTS = ['petanque', 'flechettes'] as const;

export type RankingSport = (typeof RANKING_SPORTS)[number];

export interface Player {
  id: string;
  name: string;
  eloPetanque: number;
  eloFlechettes: number;
}

export interface MatchParticipant {
  playerId: string;
  teamId?: string;
  placement?: number;
}

export interface MatchResult {
  winnerIds?: string[];
  placements?: string[];
  eloDeltas?: Record<string, number>;
}

export interface RankingMatch {
  id: string;
  sport: RankingSport;
  date: string;
  participants: MatchParticipant[];
  result: MatchResult;
}

export function isRankingSport(value: string): value is RankingSport {
  return RANKING_SPORTS.includes(value as RankingSport);
}
