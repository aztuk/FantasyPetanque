import type {
  MatchParticipant,
  MatchResult,
  Player,
  RankingSport,
} from '../../../domain/ranking/models';
import { INITIAL_ELO } from '../../../domain/ranking/models';
import { getSupabaseClient } from '../../../shared/services/supabase';
import type { Database, Json } from '../../../domain/ranking/models/database';

type PlayerRow = Database['public']['Tables']['players']['Row'];
type PlayerRankingRow = Pick<PlayerRow, 'id' | 'name' | 'elo_petanque' | 'elo_flechettes'>;
type MatchRow = Pick<
  Database['public']['Tables']['matches']['Row'],
  'sport' | 'participants' | 'result'
>;
type MatchActivityRow = Pick<
  Database['public']['Tables']['matches']['Row'],
  'participants' | 'date'
>;

export interface PlayerRecord {
  wins: number;
  losses: number;
}

export type RankingRecords = Record<RankingSport, Record<string, PlayerRecord>>;

export interface RankingData {
  players: Player[];
  records: RankingRecords;
}

const SPORT_ELO_FIELD: Record<RankingSport, keyof Pick<Player, 'eloPetanque' | 'eloFlechettes'>> = {
  petanque: 'eloPetanque',
  flechettes: 'eloFlechettes',
};

export function mapPlayerRow(row: PlayerRankingRow): Player {
  return {
    id: row.id,
    name: row.name,
    eloPetanque: row.elo_petanque,
    eloFlechettes: row.elo_flechettes,
  };
}

export function getPlayerElo(player: Player, sport: RankingSport): number {
  return player[SPORT_ELO_FIELD[sport]];
}

export function sortPlayersBySport(players: Player[], sport: RankingSport): Player[] {
  return [...players].sort((left, right) => {
    const eloDelta = getPlayerElo(right, sport) - getPlayerElo(left, sport);

    if (eloDelta !== 0) {
      return eloDelta;
    }

    return left.name.localeCompare(right.name, 'fr');
  });
}

export function createEmptyRankingRecords(): RankingRecords {
  return {
    petanque: {},
    flechettes: {},
  };
}

export function calculateRankingRecords(matches: MatchRow[]): RankingRecords {
  const records = createEmptyRankingRecords();

  matches.forEach((match) => {
    const participants = parseParticipants(match.participants);
    const result = parseResult(match.result);
    const winnerIds = getWinnerIds(result);

    participants.forEach((participant) => {
      const playerRecord = getOrCreateRecord(records, match.sport, participant.playerId);

      if (winnerIds.has(participant.playerId)) {
        playerRecord.wins += 1;
      } else {
        playerRecord.losses += 1;
      }
    });
  });

  return records;
}

export function getPlayerRecord(
  records: RankingRecords,
  sport: RankingSport,
  playerId: string,
): PlayerRecord {
  return records[sport][playerId] ?? { wins: 0, losses: 0 };
}

export async function fetchRankingData(): Promise<RankingData> {
  const supabase = getSupabaseClient();
  const [playersResponse, matchesResponse] = await Promise.all([
    supabase.from('players').select('id,name,elo_petanque,elo_flechettes'),
    supabase.from('matches').select('sport,participants,result'),
  ]);

  if (playersResponse.error) {
    throw new Error(playersResponse.error.message);
  }

  if (matchesResponse.error) {
    throw new Error(matchesResponse.error.message);
  }

  return {
    players: (playersResponse.data ?? []).map(mapPlayerRow),
    records: calculateRankingRecords(matchesResponse.data ?? []),
  };
}

export async function fetchRankingPlayers(): Promise<Player[]> {
  return (await fetchRankingData()).players;
}

export function sortPlayersByRecentActivity(
  players: Player[],
  matches: MatchActivityRow[],
): Player[] {
  const lastPlayedAt = new Map<string, string>();

  for (const match of matches) {
    const participants = parseParticipants(match.participants);
    for (const { playerId } of participants) {
      const current = lastPlayedAt.get(playerId);
      if (!current || match.date > current) {
        lastPlayedAt.set(playerId, match.date);
      }
    }
  }

  return [...players].sort((a, b) => {
    const dateA = lastPlayedAt.get(a.id) ?? '';
    const dateB = lastPlayedAt.get(b.id) ?? '';
    if (dateA === dateB) {
      return a.name.localeCompare(b.name, 'fr');
    }
    return dateB.localeCompare(dateA);
  });
}

export async function fetchPlayersOrderedByActivity(): Promise<Player[]> {
  const supabase = getSupabaseClient();
  const [playersResponse, matchesResponse] = await Promise.all([
    supabase.from('players').select('id,name,elo_petanque,elo_flechettes'),
    supabase.from('matches').select('participants,date'),
  ]);

  if (playersResponse.error) {
    throw new Error(playersResponse.error.message);
  }
  if (matchesResponse.error) {
    throw new Error(matchesResponse.error.message);
  }

  return sortPlayersByRecentActivity(
    (playersResponse.data ?? []).map(mapPlayerRow),
    matchesResponse.data ?? [],
  );
}

const ELO_K = 50;
const ELO_K_RANKED = 28;

export function computeEloDeltas(
  winners: Player[],
  losers: Player[],
  sport: RankingSport,
): Record<string, number> {
  const avgWinnerElo = average(winners.map((p) => getPlayerElo(p, sport)));
  const avgLoserElo = average(losers.map((p) => getPlayerElo(p, sport)));
  const deltas: Record<string, number> = {};

  for (const winner of winners) {
    const expected = 1 / (1 + 10 ** ((avgLoserElo - getPlayerElo(winner, sport)) / 400));
    deltas[winner.id] = Math.round(ELO_K * (1 - expected));
  }

  for (const loser of losers) {
    const expected = 1 / (1 + 10 ** ((avgWinnerElo - getPlayerElo(loser, sport)) / 400));
    deltas[loser.id] = Math.round(ELO_K * (0 - expected));
  }

  return deltas;
}

export function computeEloRankedDeltas(
  rankedPlayers: Player[],
  sport: RankingSport,
): Record<string, number> {
  const deltas: Record<string, number> = {};

  for (let i = 0; i < rankedPlayers.length; i++) {
    let totalDelta = 0;
    for (let j = 0; j < rankedPlayers.length; j++) {
      if (i === j) continue;
      const playerElo = getPlayerElo(rankedPlayers[i], sport);
      const opponentElo = getPlayerElo(rankedPlayers[j], sport);
      const expected = 1 / (1 + 10 ** ((opponentElo - playerElo) / 400));
      // i ranked above j means i "beat" j
      const actual = i < j ? 1 : 0;
      totalDelta += ELO_K_RANKED * (actual - expected);
    }
    deltas[rankedPlayers[i].id] = Math.round(totalDelta);
  }

  return deltas;
}

export async function saveMatchRanked(
  sport: RankingSport,
  rankedPlayers: Player[],
  eloDeltas: Record<string, number>,
): Promise<void> {
  const supabase = getSupabaseClient();

  const participants: MatchParticipant[] = rankedPlayers.map((p, index) => ({
    playerId: p.id,
    placement: index + 1,
  }));

  const result: MatchResult = {
    placements: rankedPlayers.map((p) => p.id),
    eloDeltas,
  };

  const { error: matchError } = await supabase.from('matches').insert({
    sport,
    participants: participants as unknown as Json,
    result: result as Json,
  });

  if (matchError) {
    throw new Error(matchError.message);
  }

  await Promise.all(
    rankedPlayers.map((player) => {
      const delta = eloDeltas[player.id] ?? 0;
      const newElo = getPlayerElo(player, sport) + delta;
      const update =
        sport === 'petanque'
          ? { elo_petanque: newElo }
          : { elo_flechettes: newElo };
      return supabase
        .from('players')
        .update(update)
        .eq('id', player.id);
    }),
  );
}

export async function resetElosForSport(players: Player[], sport: RankingSport): Promise<void> {
  const supabase = getSupabaseClient();
  const update = sport === 'petanque'
    ? { elo_petanque: INITIAL_ELO }
    : { elo_flechettes: INITIAL_ELO };

  const { error: deleteError } = await supabase.from('matches').delete().eq('sport', sport);
  if (deleteError) throw new Error(deleteError.message);

  const results = await Promise.all(
    players.map((player) =>
      supabase.from('players').update(update).eq('id', player.id)
    )
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw new Error(firstError.message);
}

export async function deletePlayer(playerId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('players').delete().eq('id', playerId);
  if (error) throw new Error(error.message);
}

export async function createPlayer(name: string): Promise<Player> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('players')
    .insert({ name, elo_petanque: INITIAL_ELO, elo_flechettes: INITIAL_ELO })
    .select('id,name,elo_petanque,elo_flechettes')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPlayerRow(data);
}

export async function saveMatch(
  sport: RankingSport,
  winners: Player[],
  losers: Player[],
  eloDeltas: Record<string, number>,
): Promise<void> {
  const supabase = getSupabaseClient();

  const participants: MatchParticipant[] = [
    ...winners.map((p) => ({ playerId: p.id })),
    ...losers.map((p) => ({ playerId: p.id })),
  ];

  const result: MatchResult = {
    winnerIds: winners.map((p) => p.id),
    eloDeltas,
  };

  const { error: matchError } = await supabase.from('matches').insert({
    sport,
    participants: participants as unknown as Json,
    result: result as Json,
  });

  if (matchError) {
    throw new Error(matchError.message);
  }

  const allPlayers = [...winners, ...losers];
  await Promise.all(
    allPlayers.map((player) => {
      const delta = eloDeltas[player.id] ?? 0;
      const newElo = getPlayerElo(player, sport) + delta;
      const update =
        sport === 'petanque'
          ? { elo_petanque: newElo }
          : { elo_flechettes: newElo };
      return supabase
        .from('players')
        .update(update)
        .eq('id', player.id);
    }),
  );
}

function getOrCreateRecord(
  records: RankingRecords,
  sport: RankingSport,
  playerId: string,
): PlayerRecord {
  records[sport][playerId] ??= { wins: 0, losses: 0 };
  return records[sport][playerId];
}

function getWinnerIds(result: MatchResult): Set<string> {
  if (Array.isArray(result.winnerIds)) {
    return new Set(result.winnerIds);
  }

  if (Array.isArray(result.placements) && result.placements[0]) {
    return new Set([result.placements[0]]);
  }

  return new Set();
}

function parseParticipants(value: Json): MatchParticipant[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((participant) => {
    if (!isJsonObject(participant) || typeof participant.playerId !== 'string') {
      return [];
    }

    return [{
      playerId: participant.playerId,
      teamId: typeof participant.teamId === 'string' ? participant.teamId : undefined,
      placement: typeof participant.placement === 'number' ? participant.placement : undefined,
    }];
  });
}

function parseResult(value: Json): MatchResult {
  if (!isJsonObject(value)) {
    return {};
  }

  return {
    winnerIds: parseStringArray(value.winnerIds),
    placements: parseStringArray(value.placements),
    eloDeltas: isEloDeltas(value.eloDeltas) ? value.eloDeltas : undefined,
  };
}

function parseStringArray(value: Json | undefined): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter((item): item is string => typeof item === 'string');
  return strings.length > 0 ? strings : undefined;
}

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function isEloDeltas(value: Json | undefined): value is Record<string, number> {
  if (value === undefined || !isJsonObject(value)) {
    return false;
  }

  return Object.values(value).every((delta) => typeof delta === 'number');
}
