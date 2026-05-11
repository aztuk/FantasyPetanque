import {
  clampScore,
  applyNormalScore,
  applyBonus,
  applyMalus,
  resolveImpair,
  resolveAssuranceVie,
  resolveCasino,
  resolvePrediction,
} from '../domain/game/scoring';

describe('clampScore', () => {
  it('returns score if >= 0', () => {
    expect(clampScore(5)).toBe(5);
    expect(clampScore(0)).toBe(0);
  });

  it('clamps to 0 if negative', () => {
    expect(clampScore(-1)).toBe(0);
    expect(clampScore(-100)).toBe(0);
  });
});

describe('applyNormalScore', () => {
  it('adds points to correct team', () => {
    const scores = { blue: 3, red: 2 };
    const result = applyNormalScore(scores, 'blue', 2);
    expect(result.blue).toBe(5);
    expect(result.red).toBe(2);
  });

  it('does not go below 0', () => {
    const result = applyNormalScore({ blue: 0, red: 0 }, 'blue', -5);
    expect(result.blue).toBe(0);
  });
});

describe('applyMalus', () => {
  it('subtracts malus from team', () => {
    const result = applyMalus({ blue: 5, red: 5 }, 'blue', 2);
    expect(result.blue).toBe(3);
    expect(result.red).toBe(5);
  });

  it('clamps at 0', () => {
    const result = applyMalus({ blue: 1, red: 5 }, 'blue', 5);
    expect(result.blue).toBe(0);
  });
});

describe("L'impair contre-attaque", () => {
  it('winner with odd points scores normally', () => {
    const scores = { blue: 5, red: 5 };
    const result = resolveImpair('blue', 3, scores);
    expect(result.isOdd).toBe(true);
    expect(result.newScores.blue).toBe(8);
    expect(result.newScores.red).toBe(5);
  });

  it('winner with even points scores 0, loser gets 1', () => {
    const scores = { blue: 5, red: 5 };
    const result = resolveImpair('blue', 2, scores);
    expect(result.isOdd).toBe(false);
    expect(result.newScores.blue).toBe(5); // winner gets 0
    expect(result.newScores.red).toBe(6);  // loser gets 1
  });

  it('winner with 1 point (odd) scores 1', () => {
    const scores = { blue: 0, red: 0 };
    const result = resolveImpair('red', 1, scores);
    expect(result.isOdd).toBe(true);
    expect(result.newScores.red).toBe(1);
    expect(result.newScores.blue).toBe(0);
  });

  it('winner with 4 points (even) scores 0, loser gets 1', () => {
    const scores = { blue: 3, red: 3 };
    const result = resolveImpair('blue', 4, scores);
    expect(result.isOdd).toBe(false);
    expect(result.newScores.blue).toBe(3);
    expect(result.newScores.red).toBe(4);
  });
});

describe('Assurance vie', () => {
  const normalPoints = { blue: 3, red: 0 };

  it('insured winner gets -1 on normal points', () => {
    const scores = { blue: 5, red: 5 };
    const assurance = { blue: true, red: false };
    const result = resolveAssuranceVie('blue', normalPoints, assurance, scores);
    expect(result.blue).toBe(7); // 5 + (3 - 1) = 7
    expect(result.red).toBe(5);
  });

  it('insured loser gets +1', () => {
    const scores = { blue: 5, red: 5 };
    const assurance = { blue: false, red: true };
    const result = resolveAssuranceVie('blue', normalPoints, assurance, scores);
    expect(result.blue).toBe(8); // 5 + 3
    expect(result.red).toBe(6);  // 5 + 1 (insurance)
  });

  it('insured winner with 1 normal point gets 0 extra (not -1 total)', () => {
    const scores = { blue: 5, red: 5 };
    const assurance = { blue: true, red: false };
    const result = resolveAssuranceVie('blue', { blue: 1, red: 0 }, assurance, scores);
    expect(result.blue).toBe(5); // 5 + max(0, 1-1) = 5 + 0 = 5
  });
});

describe('Casino', () => {
  it('winner recovers bet and gains same amount', () => {
    const scores = { blue: 8, red: 4 };
    const bets = { blue: 3, red: 4 };
    const result = resolveCasino('red', bets, scores);
    // Red wins: recovers 4, gains 4 → red = 4 + 4 = 8
    expect(result.red).toBe(8);
    // Blue loses 3 → blue = 8 - 3 = 5
    expect(result.blue).toBe(5);
  });

  it('loser loses bet only (no gain)', () => {
    const scores = { blue: 10, red: 10 };
    const bets = { blue: 5, red: 0 };
    const result = resolveCasino('red', bets, scores);
    expect(result.blue).toBe(5);  // 10 - 5
    expect(result.red).toBe(10);  // 10 + 0
  });

  it('score cannot go below 0', () => {
    const scores = { blue: 2, red: 2 };
    const bets = { blue: 2, red: 2 };
    const result = resolveCasino('red', bets, scores);
    expect(result.blue).toBe(0);  // 2 - 2 = 0
    expect(result.red).toBe(4);   // 2 + 2 = 4
  });
});

describe('Prédiction', () => {
  it('correct prediction: opponent loses predicted points', () => {
    const predictions = { blue: 2, red: null };
    const normalPoints = { blue: 2, red: 0 }; // blue wins with 2
    const scores = { blue: 5, red: 5 };
    const result = resolvePrediction(predictions, normalPoints, scores);
    expect(result.red).toBe(3); // 5 - 2
    expect(result.blue).toBe(5); // unchanged by prediction resolution
  });

  it('wrong prediction: no effect', () => {
    const predictions = { blue: 3, red: null };
    const normalPoints = { blue: 2, red: 0 }; // blue wins with 2, predicted 3
    const scores = { blue: 5, red: 5 };
    const result = resolvePrediction(predictions, normalPoints, scores);
    expect(result.red).toBe(5); // no penalty
    expect(result.blue).toBe(5);
  });

  it('prediction does not make score go below 0', () => {
    const predictions = { blue: 5, red: null };
    const normalPoints = { blue: 5, red: 0 };
    const scores = { blue: 5, red: 3 };
    const result = resolvePrediction(predictions, normalPoints, scores);
    expect(result.red).toBe(0); // clamped at 0 (3 - 5 = -2 → 0)
  });
});
