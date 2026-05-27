import { INITIAL_ELO, isRankingSport, RANKING_SPORTS } from '../domain/ranking/models';

describe('ranking models', () => {
  it('defines the supported ranking sports', () => {
    expect(RANKING_SPORTS).toEqual(['petanque', 'flechettes']);
    expect(isRankingSport('petanque')).toBe(true);
    expect(isRankingSport('flechettes')).toBe(true);
    expect(isRankingSport('tennis')).toBe(false);
  });

  it('uses the expected initial ELO', () => {
    expect(INITIAL_ELO).toBe(1000);
  });
});
