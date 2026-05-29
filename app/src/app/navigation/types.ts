import type { RankingSport } from '../../domain/ranking/models';

export type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
  Game: undefined;
  DebugRuleSelect: undefined;
  Ranking: { sport?: RankingSport } | undefined;
  AddMatch: { sport: RankingSport; source?: 'gameResult' };
};
