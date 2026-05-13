import { Team, RoundState } from '../models';
import {
  clampScore,
  resolveImpair,
  resolveAssuranceVie,
  resolveCasino,
  resolvePrediction,
  buildBonusMalusFromRound,
} from '../scoring';
import { shouldSkipNormalScore } from '.';

export interface RoundResolution {
  newScores: Record<Team, number>;
  newImmuneTeam: Team | null;
}

export function resolveRound(
  round: RoundState,
  currentScores: Record<Team, number>,
  immuneTeam: Team | null,
): RoundResolution {
  let newScores = { ...currentScores };
  let newImmuneTeam = immuneTeam;

  const ruleId = round.rule?.id;
  const skip = shouldSkipNormalScore(round);

  if (skip) {
    if (ruleId === 'casino' && round.casinoWinner) {
      newScores = resolveCasino(round.casinoWinner, round.casinoBets, newScores);
    }
    if (ruleId === 'sortie-de-porc' && round.sortieDePorc) {
      newScores[round.sortieDePorc] = clampScore(newScores[round.sortieDePorc] + 6);
    }
  } else {
    const winner: Team | null =
      round.normalPoints.blue > 0 ? 'blue' :
      round.normalPoints.red > 0 ? 'red' : null;

    if (ruleId === 'impair-contre-attaque' && winner) {
      const { newScores: resolved } = resolveImpair(winner, round.normalPoints[winner], newScores);
      newScores = resolved;
    } else if (ruleId === 'assurance-vie') {
      newScores = resolveAssuranceVie(
        winner ?? 'blue',
        round.normalPoints,
        round.assurance,
        newScores,
      );
    } else if (winner) {
      newScores[winner] = clampScore(newScores[winner] + round.normalPoints[winner]);
    }

    if (ruleId === 'prediction') {
      newScores = resolvePrediction(round.predictionValues, round.normalPoints, newScores);
    }
  }

  // Apply bonus/malus entries only for non-skip rules.
  // Skip rules (casino, sortie-de-porc) already have their scoring handled above;
  // applying buildBonusMalusFromRound on top would double-count.
  const bonusMalusList = buildBonusMalusFromRound(round);
  if (!skip) {
    for (const bm of bonusMalusList) {
      newScores[bm.team] = clampScore(newScores[bm.team] + bm.value);
    }
  }

  // Totem: loser gets immunity for the next round (no immunity if tie)
  if (ruleId === 'totem-immunite') {
    const winner: Team | null =
      round.normalPoints.blue > 0 ? 'blue' :
      round.normalPoints.red > 0 ? 'red' : null;
    if (winner) {
      newImmuneTeam = winner === 'blue' ? 'red' : 'blue';
    }
  }

  return { newScores, newImmuneTeam };
}
