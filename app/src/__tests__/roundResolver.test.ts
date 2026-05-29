import { resolveRound } from '../domain/game/engine/roundResolver';
import { createRound } from '../domain/game/engine';
import { ALL_RULES } from '../data/rules/rules';
import { RoundState, Team } from '../domain/game/models';

function makeRound(ruleId: string | null, overrides: Partial<RoundState> = {}): RoundState {
  const rule = ruleId ? ALL_RULES.find((r) => r.id === ruleId) ?? null : null;
  return { ...createRound(1, rule), ...overrides };
}

const scores0 = { blue: 0, red: 0 };
const scores5 = { blue: 5, red: 5 };
const scores10 = { blue: 10, red: 8 };

// ─── Score normal ────────────────────────────────────────────────────────────

describe('resolveRound — score normal', () => {
  it('ajoute les points normaux au gagnant', () => {
    const round = makeRound('dome-de-fer', { normalPoints: { blue: 3, red: 0 } });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(8);
    expect(newScores.red).toBe(5);
  });

  it('ne marque personne si aucun point', () => {
    const round = makeRound('dome-de-fer', { normalPoints: { blue: 0, red: 0 } });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores).toEqual(scores5);
  });

  it('ne descend jamais sous 0', () => {
    const round = makeRound('censure', {
      normalPoints: { blue: 1, red: 0 },
      censureMalus: { blue: 10, red: 0 },
    });
    const { newScores } = resolveRound(round, { blue: 1, red: 5 }, null);
    expect(newScores.blue).toBe(0);
  });
});

// ─── Casino ───────────────────────────────────────────────────────────────────

describe('resolveRound — Casino', () => {
  it('gagnant récupère sa mise + même montant, perdant perd sa mise', () => {
    const round = makeRound('casino', {
      casinoBets: { blue: 3, red: 2 },
      casinoWinner: 'blue',
    });
    const { newScores } = resolveRound(round, { blue: 10, red: 8 }, null);
    expect(newScores.blue).toBe(13); // 10 + 3
    expect(newScores.red).toBe(6);   // 8 - 2
  });

  it('score ne descend pas sous 0 si mise > score', () => {
    const round = makeRound('casino', {
      casinoBets: { blue: 2, red: 2 },
      casinoWinner: 'red',
    });
    const { newScores } = resolveRound(round, { blue: 2, red: 2 }, null);
    expect(newScores.blue).toBe(0);
    expect(newScores.red).toBe(4);
  });

  it('ne modifie rien si casinoWinner est null', () => {
    const round = makeRound('casino', {
      casinoBets: { blue: 3, red: 2 },
      casinoWinner: null,
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores).toEqual(scores5);
  });
});

// ─── Sortie de porc ───────────────────────────────────────────────────────────

describe('resolveRound — Sortie de porc', () => {
  it('accorde 6 points directs à l\'équipe qui sort le cochonnet', () => {
    const round = makeRound('sortie-de-porc', { sortieDePorc: 'red' });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(5);
    expect(newScores.red).toBe(11);
  });

  it('applique le score normal si le cochonnet n\'est pas sorti', () => {
    const round = makeRound('sortie-de-porc', {
      sortieDePorc: null,
      normalPoints: { blue: 2, red: 0 },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7);
    expect(newScores.red).toBe(5);
  });
});

// ─── L'impair contre-attaque ──────────────────────────────────────────────────

describe("resolveRound — L'impair contre-attaque", () => {
  it('gagnant avec points impairs marque normalement', () => {
    const round = makeRound('impair-contre-attaque', {
      normalPoints: { blue: 3, red: 0 },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(8);
    expect(newScores.red).toBe(5);
  });

  it('gagnant avec points pairs marque 0, perdant prend 1', () => {
    const round = makeRound('impair-contre-attaque', {
      normalPoints: { blue: 4, red: 0 },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(5);
    expect(newScores.red).toBe(6);
  });

  it('gagnant avec 1 point (impair) marque 1', () => {
    const round = makeRound('impair-contre-attaque', {
      normalPoints: { blue: 0, red: 1 },
    });
    const { newScores } = resolveRound(round, scores0, null);
    expect(newScores.red).toBe(1);
    expect(newScores.blue).toBe(0);
  });
});

// ─── Assurance vie ────────────────────────────────────────────────────────────

describe('resolveRound — Assurance vie', () => {
  it('gagnant assuré perd 1 point sur ses normaux', () => {
    const round = makeRound('assurance-vie', {
      normalPoints: { blue: 3, red: 0 },
      assurance: { blue: true, red: false },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7); // 5 + (3-1)
    expect(newScores.red).toBe(5);
  });

  it('perdant assuré reçoit +1', () => {
    const round = makeRound('assurance-vie', {
      normalPoints: { blue: 3, red: 0 },
      assurance: { blue: false, red: true },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(8);
    expect(newScores.red).toBe(6);
  });

  it('les deux assurés : gagnant -1 normal, perdant +1', () => {
    const round = makeRound('assurance-vie', {
      normalPoints: { blue: 3, red: 0 },
      assurance: { blue: true, red: true },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7);
    expect(newScores.red).toBe(6);
  });
});

// ─── Prédiction ───────────────────────────────────────────────────────────────

describe('resolveRound — Prédiction', () => {
  it('prédiction réussie : l\'adversaire perd le nombre prédit', () => {
    const round = makeRound('prediction', {
      normalPoints: { blue: 2, red: 0 },
      predictionValues: { blue: 2, red: null },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7); // 5 + 2
    expect(newScores.red).toBe(3);  // 5 - 2
  });

  it('prédiction ratée : aucun effet sur adversaire', () => {
    const round = makeRound('prediction', {
      normalPoints: { blue: 2, red: 0 },
      predictionValues: { blue: 3, red: null }, // prédit 3, a marqué 2
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7);
    expect(newScores.red).toBe(5);
  });

  it('le score ne descend pas sous 0 après prédiction', () => {
    const round = makeRound('prediction', {
      normalPoints: { blue: 5, red: 0 },
      predictionValues: { blue: 5, red: null },
    });
    const { newScores } = resolveRound(round, { blue: 5, red: 3 }, null);
    expect(newScores.red).toBe(0);
  });
});

// ─── Gauche caviar (bonus) ────────────────────────────────────────────────────

describe('resolveRound — Gauche caviar (bonus)', () => {
  it('accorde +1 à chaque équipe avec bonus actif', () => {
    const round = makeRound('gauche-caviar', {
      normalPoints: { blue: 2, red: 0 },
      gaucheBonus: { blue: true, red: true },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(8); // 5 + 2 (normal) + 1 (bonus)
    expect(newScores.red).toBe(6);  // 5 + 1 (bonus)
  });

  it('sans bonus actif, seul le score normal compte', () => {
    const round = makeRound('gauche-caviar', {
      normalPoints: { blue: 2, red: 0 },
      gaucheBonus: { blue: false, red: false },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(7);
    expect(newScores.red).toBe(5);
  });
});

// ─── Censure (malus) ──────────────────────────────────────────────────────────

describe('resolveRound — Censure (malus)', () => {
  it('applique les malus de parole', () => {
    const round = makeRound('censure', {
      normalPoints: { blue: 2, red: 0 },
      censureMalus: { blue: 1, red: 2 },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(6); // 5 + 2 - 1
    expect(newScores.red).toBe(3);  // 5 - 2
  });
});

// ─── Contrat (bonus) ──────────────────────────────────────────────────────────

describe('resolveRound — Contrat (bonus)', () => {
  it('mission réussie donne +2', () => {
    const round = makeRound('contrat', {
      normalPoints: { blue: 1, red: 0 },
      contratMission: { blue: 0, red: 1 },
      contratSuccess: { blue: true, red: false },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(8); // 5 + 1 (normal) + 2 (contrat)
    expect(newScores.red).toBe(5);
  });
});

// ─── Totem d'immunité ─────────────────────────────────────────────────────────

describe("resolveRound — Totem d'immunité", () => {
  it('le perdant devient l\'équipe immune pour le tour suivant', () => {
    const round = makeRound('totem-immunite', {
      normalPoints: { blue: 3, red: 0 },
    });
    const { newImmuneTeam } = resolveRound(round, scores5, null);
    expect(newImmuneTeam).toBe('red'); // blue gagne → red est immunisée
  });

  it('pas d\'immunité en cas d\'égalité', () => {
    const round = makeRound('totem-immunite', {
      normalPoints: { blue: 0, red: 0 },
    });
    const { newImmuneTeam } = resolveRound(round, scores5, null);
    expect(newImmuneTeam).toBeNull();
  });

  it('immuneTeam entrante conservée si pas totem', () => {
    const round = makeRound('dome-de-fer', {
      normalPoints: { blue: 1, red: 0 },
    });
    const { newImmuneTeam } = resolveRound(round, scores5, 'red');
    expect(newImmuneTeam).toBe('red');
  });
});

// ─── King of the Hill ─────────────────────────────────────────────────────────

describe('resolveRound — King of the Hill (bonus)', () => {
  it('accorde le nombre de boules gagnantes dans la zone à une seule équipe', () => {
    const round = makeRound('king-of-the-hill', {
      normalPoints: { blue: 2, red: 0 },
      kingBonus: { blue: 3, red: 0 },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(10); // 5 + 2 + 3
    expect(newScores.red).toBe(5);   // 5 + 0
  });
});

// ─── Boule maudite (malus) ────────────────────────────────────────────────────

describe('resolveRound — Boule maudite (malus)', () => {
  it('applique -1 à l\'équipe qui touche la boule maudite', () => {
    const round = makeRound('boule-maudite', {
      normalPoints: { blue: 0, red: 2 },
      boucleMauditeHit: { blue: true, red: false },
    });
    const { newScores } = resolveRound(round, scores5, null);
    expect(newScores.blue).toBe(4);  // 5 - 1
    expect(newScores.red).toBe(7);   // 5 + 2
  });
});
