import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ALL_RULES } from '../data/rules/rules';
import { gameUiColors } from '../features/game/components/gameUiTheme';
import { GameScreen } from '../features/game/screens/GameScreen';
import { useGameStore } from '../features/game/state/gameStore';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
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

function renderSortieDePorcRound() {
  useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: false });
  useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'sortie-de-porc')!);
  useGameStore.getState().beginRound();

  render(<GameScreen />);
}

describe('GameScreen Sortie de porc UI', () => {
  it('uses winner buttons and confirms the instant score resolution', () => {
    renderSortieDePorcRound();

    expect(screen.getAllByText('Gagnant')).toHaveLength(2);
    expect(screen.getByText('CONFIRMER')).toBeTruthy();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
    expect(
      StyleSheet.flatten(screen.getByTestId('sortie-de-porc-winner-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);
    expect(
      StyleSheet.flatten(screen.getByTestId('sortie-de-porc-winner-red-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);

    fireEvent.press(screen.getByTestId('sortie-de-porc-winner-blue-button'));

    expect(useGameStore.getState().currentRound?.sortieDePorc).toBe('blue');
    expect(
      screen.getByTestId('sortie-de-porc-winner-blue-button').props.accessibilityState.selected,
    ).toBe(true);
    expect(screen.getByText('Perdant')).toBeTruthy();
    expect(screen.getAllByText('Gagnant')).toHaveLength(1);
    expect(
      StyleSheet.flatten(screen.getByTestId('sortie-de-porc-winner-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.blueSurface);
    expect(
      StyleSheet.flatten(screen.getByTestId('sortie-de-porc-winner-red-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(useGameStore.getState().scores.blue).toBe(6);
    expect(useGameStore.getState().scores.red).toBe(0);
    expect(useGameStore.getState().rounds[0]?.normalPoints).toEqual({ blue: 0, red: 0 });
  });
});
