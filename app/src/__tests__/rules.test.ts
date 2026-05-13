import { ALL_RULES, getRuleById } from '../data/rules/rules';

describe('Rules data bank', () => {
  it('has 24 rules', () => {
    expect(ALL_RULES).toHaveLength(24);
  });

  it('every rule has required fields', () => {
    for (const rule of ALL_RULES) {
      expect(rule.id).toBeTruthy();
      expect(rule.name).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.shortDescription).toBeTruthy();
      expect(Array.isArray(rule.tags)).toBe(true);
      expect(rule.uiType).toBeTruthy();
    }
  });

  it('all rule ids are unique', () => {
    const ids = ALL_RULES.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('totem-immunite has the skip-random-draw-next-turn tag', () => {
    const rule = getRuleById('totem-immunite')!;
    expect(rule.tags).toContain('skip-random-draw-next-turn');
  });

  it('casino has skip-normal-score and not-available-at-zero tags', () => {
    const rule = getRuleById('casino')!;
    expect(rule.tags).toContain('setup');
    expect(rule.tags).toContain('skip-normal-score');
    expect(rule.tags).toContain('not-available-at-zero');
  });

  it('prediction has not-available-at-zero tag', () => {
    const rule = getRuleById('prediction')!;
    expect(rule.tags).toContain('not-available-at-zero');
  });

  it('all expected rules are present', () => {
    const expectedIds = [
      'gauche-caviar',
      'les-extremes',
      'censure',
      'dome-de-fer',
      'apollo-boule',
      'drunk-simulator',
      'footanque',
      'sortie-de-porc',
      'dos-santos',
      'perte-daura',
      'impair-contre-attaque',
      'make-petanque-great-again',
      'deuxieme-service',
      'ctrl-z',
      'permis-de-construire',
      'contrat',
      'boule-maudite',
      'king-of-the-hill',
      'le-duel',
      'assurance-vie',
      'frontiere',
      'casino',
      'prediction',
      'totem-immunite',
    ];

    for (const id of expectedIds) {
      const rule = getRuleById(id);
      expect(rule).toBeDefined();
      if (!rule) console.error(`Missing rule: ${id}`);
    }
  });

  it('totem-compatible rules exist for totem draw', () => {
    const compatible = ALL_RULES.filter((r) => r.tags.includes('totem-compatible'));
    expect(compatible.length).toBeGreaterThan(5);
  });

  it('gauche-caviar maxBonusPerTeam is 1', () => {
    const rule = getRuleById('gauche-caviar')!;
    expect(rule.maxBonusPerTeam).toBe(1);
  });

  it('stores display notes separately from descriptions', () => {
    const gauche = getRuleById('gauche-caviar')!;
    const casino = getRuleById('casino')!;

    expect(gauche.description).not.toContain('Maximum');
    expect(gauche.note).toBe('Maximum 1 bonus par équipe.');
    expect(casino.description).not.toContain('Pas de score normal');
    expect(casino.note).toBe('Pas de score normal sur cette mène.');
  });

  it('censure maxMalusPerTeam is 3', () => {
    const rule = getRuleById('censure')!;
    expect(rule.maxMalusPerTeam).toBe(3);
  });

  it('king-of-the-hill maxBonusPerTeam is 6', () => {
    const rule = getRuleById('king-of-the-hill')!;
    expect(rule.maxBonusPerTeam).toBe(6);
  });
});
