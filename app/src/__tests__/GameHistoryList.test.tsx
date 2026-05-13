import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { RoundState } from '../domain/game/models';
import { GameHistoryList } from '../features/game/components/GameHistoryList';

function makeRound(number: number): RoundState {
  return {
    number,
    rule: null,
    normalPoints: { blue: 0, red: 0 },
    bonuses: [],
    scoreAfter: { blue: number, red: Math.max(0, number - 1) },
    vetoUsed: null,
    sortieDePorc: null,
    assurance: { blue: false, red: false },
    frontiereChoice: { blue: null, red: null },
    contratMission: { blue: null, red: null },
    contratSuccess: { blue: false, red: false },
    boucleMauditeHit: { blue: false, red: false },
    kingBonus: { blue: 0, red: 0 },
    gaucheBonus: { blue: false, red: false },
    extremesBonus: { blue: false, red: false },
    censureMalus: { blue: 0, red: 0 },
    casinoBets: { blue: 0, red: 0 },
    casinoWinner: null,
    predictionValues: { blue: null, red: null },
    totemNextRule: null,
    totemImmuneTeam: null,
    impairResult: null,
  };
}

describe('GameHistoryList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('keeps every classic round stacked chronologically with the latest at the bottom', () => {
    const rounds = Array.from({ length: 12 }, (_, index) => makeRound(index + 1));

    render(<GameHistoryList rounds={rounds} orientation="bottom" />);

    const labels = screen.getAllByText(/^Mène/).map((node) => node.props.children);
    expect(labels).toHaveLength(12);
    expect(labels[0]).toBe('Mène 01');
    expect(labels[11]).toBe('Mène 12');
  });

  it('keeps the latest classic round visible when content grows', () => {
    const rounds = Array.from({ length: 3 }, (_, index) => makeRound(index + 1));

    render(<GameHistoryList rounds={rounds} orientation="bottom" />);

    const list = screen.getByTestId('game-history-bottom-list');
    expect(typeof list.props.onContentSizeChange).toBe('function');
    expect(typeof list.props.onLayout).toBe('function');
  });

  it('renders a top fade mask for the classic bottom-stacked history', () => {
    const rounds = Array.from({ length: 3 }, (_, index) => makeRound(index + 1));

    render(<GameHistoryList rounds={rounds} orientation="bottom" />);

    expect(screen.getByTestId('game-history-top-fade')).toBeTruthy();
  });

  it('animates the newly added classic history item', () => {
    const initialRounds = [makeRound(1)];
    const { rerender } = render(
      <GameHistoryList rounds={initialRounds} orientation="bottom" animateNewItems />,
    );

    rerender(
      <GameHistoryList rounds={[...initialRounds, makeRound(2)]} orientation="bottom" animateNewItems />,
    );

    expect(screen.getByTestId('game-history-animated-item')).toBeTruthy();
    expect(screen.getByTestId('game-history-item-reflection')).toBeTruthy();
  });
});
