import { Team, RoundState, GameState, BonusMalus } from '../models';

export const clampScore = (score: number): number => Math.max(0, score);

export function applyNormalScore(
  scores: Record<Team, number>,
  team: Team,
  points: number,
): Record<Team, number> {
  return {
    ...scores,
    [team]: clampScore(scores[team] + points),
  };
}

export function applyBonus(
  scores: Record<Team, number>,
  team: Team,
  value: number,
): Record<Team, number> {
  return {
    ...scores,
    [team]: clampScore(scores[team] + value),
  };
}

export function applyMalus(
  scores: Record<Team, number>,
  team: Team,
  value: number,
): Record<Team, number> {
  return {
    ...scores,
    [team]: clampScore(scores[team] - value),
  };
}

// L'impair contre-attaque resolution
export function resolveImpair(
  winner: Team,
  normalPoints: number,
  scores: Record<Team, number>,
): { newScores: Record<Team, number>; isOdd: boolean; pointsApplied: number } {
  const loser: Team = winner === 'blue' ? 'red' : 'blue';
  const isOdd = normalPoints % 2 !== 0;
  if (isOdd) {
    return {
      newScores: { ...scores, [winner]: clampScore(scores[winner] + normalPoints) },
      isOdd: true,
      pointsApplied: normalPoints,
    };
  }
  // Even: winner gets 0, loser gets 1
  return {
    newScores: { ...scores, [loser]: clampScore(scores[loser] + 1) },
    isOdd: false,
    pointsApplied: 0,
  };
}

// Assurance vie resolution
export function resolveAssuranceVie(
  winner: Team,
  normalPoints: Record<Team, number>,
  assurance: Record<Team, boolean>,
  scores: Record<Team, number>,
): Record<Team, number> {
  const loser: Team = winner === 'blue' ? 'red' : 'blue';
  let newScores = { ...scores };

  // Apply winner's normal points (minus 1 if insured, min 0 for the adjustment)
  let winnerPoints = normalPoints[winner];
  if (assurance[winner]) {
    winnerPoints = Math.max(0, winnerPoints - 1);
  }
  newScores[winner] = clampScore(newScores[winner] + winnerPoints);

  // Apply loser insurance
  if (assurance[loser]) {
    newScores[loser] = clampScore(newScores[loser] + 1);
  }

  return newScores;
}

// Casino resolution
export function resolveCasino(
  winner: Team,
  bets: Record<Team, number>,
  scores: Record<Team, number>,
): Record<Team, number> {
  const loser: Team = winner === 'blue' ? 'red' : 'blue';
  let newScores = { ...scores };

  // Loser loses bet
  newScores[loser] = clampScore(newScores[loser] - bets[loser]);

  // Winner keeps bet and gains same amount
  newScores[winner] = clampScore(newScores[winner] + bets[winner]);

  return newScores;
}

// Prédiction resolution — called after normal scoring
export function resolvePrediction(
  predictions: Record<Team, number | null>,
  normalPoints: Record<Team, number>,
  scores: Record<Team, number>,
): Record<Team, number> {
  let newScores = { ...scores };

  for (const team of ['blue', 'red'] as Team[]) {
    const prediction = predictions[team];
    if (prediction === null) continue;

    // Determine who is the winner (has normal points)
    const myPoints = normalPoints[team];
    const opponent: Team = team === 'blue' ? 'red' : 'blue';
    const opponentPoints = normalPoints[opponent];

    // Only check prediction if this team is the winner of the round
    if (myPoints > 0 && opponentPoints === 0) {
      if (myPoints === prediction) {
        // Prediction success: opponent loses that many points
        newScores[opponent] = clampScore(newScores[opponent] - prediction);
      }
    }
  }

  return newScores;
}

// Build bonus/malus list from round state for a given rule
export function buildBonusMalusFromRound(round: RoundState): BonusMalus[] {
  const results: BonusMalus[] = [];
  const ruleName = round.rule?.name ?? 'Règle inconnue';

  if (!round.rule) return results;

  switch (round.rule.id) {
    case 'gauche-caviar':
      for (const team of ['blue', 'red'] as Team[]) {
        if (round.gaucheBonus[team]) {
          results.push({ team, value: 1, rule: ruleName, reason: 'Tir réussi à la mauvaise main' });
        }
      }
      break;

    case 'les-extremes':
      for (const team of ['blue', 'red'] as Team[]) {
        if (round.extremesBonus[team]) {
          results.push({ team, value: 1, rule: ruleName, reason: 'Boule entre bord et cochonnet' });
        }
      }
      break;

    case 'censure':
      for (const team of ['blue', 'red'] as Team[]) {
        const count = round.censureMalus[team];
        if (count > 0) {
          results.push({ team, value: -count, rule: ruleName, reason: `A parlé ${count} fois` });
        }
      }
      break;

    case 'sortie-de-porc':
      if (round.sortieDePorc) {
        results.push({ team: round.sortieDePorc, value: 6, rule: ruleName, reason: 'Cochonnet sorti' });
      }
      break;

    case 'contrat':
      for (const team of ['blue', 'red'] as Team[]) {
        if (round.contratSuccess[team]) {
          const missionIdx = round.contratMission[team];
          const missionName = missionIdx !== null ? `Mission ${missionIdx + 1}` : 'Mission';
          results.push({ team, value: 2, rule: ruleName, reason: `Mission réussie : ${missionName}` });
        }
      }
      break;

    case 'boule-maudite':
      for (const team of ['blue', 'red'] as Team[]) {
        if (round.boucleMauditeHit[team]) {
          results.push({ team, value: -1, rule: ruleName, reason: 'A touché la boule maudite' });
        }
      }
      break;

    case 'king-of-the-hill':
      for (const team of ['blue', 'red'] as Team[]) {
        const count = round.kingBonus[team];
        if (count > 0) {
          results.push({ team, value: count, rule: ruleName, reason: `${count} boule(s) gagnante(s) dans la zone` });
        }
      }
      break;

    case 'assurance-vie': {
      // Determined at scoring time — not stored in bonuses, effect is in score
      break;
    }

    case 'casino': {
      if (round.casinoWinner) {
        const winner = round.casinoWinner;
        const loser: Team = winner === 'blue' ? 'red' : 'blue';
        results.push({ team: winner, value: round.casinoBets[winner], rule: ruleName, reason: 'Casino : mise gagnée' });
        results.push({ team: loser, value: -round.casinoBets[loser], rule: ruleName, reason: 'Casino : mise perdue' });
      }
      break;
    }

    case 'prediction': {
      // Handled separately in resolvePrediction
      break;
    }
  }

  return results;
}

// Compute total delta for a round (for display)
export function computeRoundDelta(
  round: RoundState,
  scoresBefore: Record<Team, number>,
  scoresAfter: Record<Team, number>,
): Record<Team, number> {
  return {
    blue: scoresAfter.blue - scoresBefore.blue,
    red: scoresAfter.red - scoresBefore.red,
  };
}
