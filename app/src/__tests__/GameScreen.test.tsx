import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { GameScreen } from '../features/game/screens/GameScreen';
import { useGameStore } from '../features/game/state/gameStore';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    replace: jest.fn(),
  }),
}));

beforeEach(() => {
  useGameStore.setState({
    mode: 'simple',
    rounds: [],
    currentRound: null,
    scores: { blue: 0, red: 0 },
    vetos: { blue: true, red: true },
    playedRuleIds: [],
    pendingNextRule: null,
    immuneTeam: null,
    isGameOver: false,
    winningScore: 13,
    maxRounds: null,
    vetosEnabled: true,
    phase: 'setup',
    debugMode: false,
  });
});

describe('GameScreen normal scoring interaction', () => {
  it('adds normal points from score blocks before enabling round completion', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    expect(screen.getByText('Tapez le nombre de points marqués')).toBeTruthy();
    expect(screen.queryByText(/Bleu marque/)).toBeNull();
    expect(screen.queryByText(/Rouge marque/)).toBeNull();
    expect(screen.queryByText('Bleu')).toBeNull();
    expect(screen.queryByText('Rouge')).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('score-block-blue'));

    expect(screen.getByText('+1')).toBeTruthy();
    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(1);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('score-block-red'));

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(1);
    expect(useGameStore.getState().currentRound?.normalPoints.red).toBe(0);

    fireEvent.press(screen.getByText(/Annuler dernier point/));

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(0);
    expect(screen.queryByText('+1')).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });
});
