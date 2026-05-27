import type { RankingSport } from '../../domain/ranking/models';

export type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
  Game: undefined;
  DebugRuleSelect: undefined;
  Ranking: undefined;
  AddMatch: { sport: RankingSport };
};
