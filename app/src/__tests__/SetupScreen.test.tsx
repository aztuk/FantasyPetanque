import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SetupScreen } from '../features/game/screens/SetupScreen';
import { useGameStore } from '../features/game/state/gameStore';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
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

describe('SetupScreen', () => {
  it('defaults fantasy games to a 13-point score condition', () => {
    render(<SetupScreen />);

    fireEvent.press(screen.getByText('Fantasy'));
    fireEvent.press(screen.getByText('Continuer'));

    expect(screen.getByText('Condition de fin')).toBeTruthy();

    fireEvent.press(screen.getByText('Continuer'));

    expect(screen.getByText(/Score/)).toBeTruthy();
    expect(screen.queryByText(/Nombre/)).toBeNull();

    fireEvent.press(screen.getByText('Continuer'));
    fireEvent.press(screen.getByText('Jouer'));

    const state = useGameStore.getState();
    expect(state.mode).toBe('fantasy');
    expect(state.winningScore).toBe(13);
    expect(state.maxRounds).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('Game');
  });
});
