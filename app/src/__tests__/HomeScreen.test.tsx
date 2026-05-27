import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { HomeScreen } from '../features/game/screens/HomeScreen';
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

describe('HomeScreen', () => {
  it('renders the branded home and navigates to setup', () => {
    render(<HomeScreen />);

    expect(screen.getByTestId('home-logo')).toBeTruthy();
    expect(screen.getByTestId('home-tagline')).toBeTruthy();
    expect(screen.getByText('Le jeu qui vous fera perdre')).toBeTruthy();
    expect(screen.getByText('toute dignité')).toBeTruthy();
    expect(screen.queryByTestId('home-debug-badge')).toBeNull();

    fireEvent.press(screen.getByTestId('home-ranking-button'));
    expect(mockNavigate).toHaveBeenCalledWith('Ranking');

    fireEvent.press(screen.getByTestId('home-play-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Setup');
  });

  it('reveals debug mode after five taps on the brand area', () => {
    render(<HomeScreen />);

    const debugToggle = screen.getByTestId('home-debug-toggle');

    fireEvent.press(debugToggle);
    fireEvent.press(debugToggle);
    fireEvent.press(debugToggle);
    fireEvent.press(debugToggle);
    expect(screen.queryByTestId('home-debug-badge')).toBeNull();

    fireEvent.press(debugToggle);

    expect(screen.getByTestId('home-debug-badge')).toBeTruthy();
    expect(useGameStore.getState().debugMode).toBe(true);
  });
});
