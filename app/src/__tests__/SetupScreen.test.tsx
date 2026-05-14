import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SetupScreen } from '../features/game/screens/SetupScreen';
import { useGameStore } from '../features/game/state/gameStore';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
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

    fireEvent.press(screen.getByText('Pétanque Fantasy'));

    expect(screen.getByText('Nombre de mènes')).toBeTruthy();
    expect(screen.getByText('Score à atteindre')).toBeTruthy();

    fireEvent.press(screen.getByText('Score à atteindre'));

    expect(screen.getByText('Valider')).toBeTruthy();
    expect(screen.getAllByText('13').length).toBeGreaterThan(0);

    fireEvent.press(screen.getByText('Valider'));
    fireEvent.press(screen.getByText('Oui'));

    const state = useGameStore.getState();
    expect(state.mode).toBe('fantasy');
    expect(state.winningScore).toBe(13);
    expect(state.maxRounds).toBeNull();
    expect(state.vetosEnabled).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('Game');
  });

  it('starts a simple game after validating the target value', () => {
    render(<SetupScreen />);

    fireEvent.press(screen.getByText('Pétanque normale'));
    fireEvent.press(screen.getByText('Nombre de mènes'));

    expect(screen.getAllByText('8').length).toBeGreaterThan(0);

    fireEvent.press(screen.getByText('Valider'));

    const state = useGameStore.getState();
    expect(state.mode).toBe('simple');
    expect(state.winningScore).toBe(999);
    expect(state.maxRounds).toBe(8);
    expect(state.vetosEnabled).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('Game');
  });

  it('updates the target value when the picker is scrolled', () => {
    render(<SetupScreen />);

    fireEvent.press(screen.getByText('Pétanque normale'));
    fireEvent.press(screen.getByText('Nombre de mènes'));
    fireEvent(screen.getByTestId('setup-value-picker'), 'momentumScrollEnd', {
      nativeEvent: { contentOffset: { y: 400 } },
    });
    fireEvent.press(screen.getByText('Valider'));

    expect(useGameStore.getState().maxRounds).toBe(10);
  });

  it('can disable vetos for fantasy games', () => {
    render(<SetupScreen />);

    fireEvent.press(screen.getByText('Pétanque Fantasy'));
    fireEvent.press(screen.getByText('Score à atteindre'));
    fireEvent.press(screen.getByText('Valider'));
    fireEvent.press(screen.getByText('Non'));

    const state = useGameStore.getState();
    expect(state.mode).toBe('fantasy');
    expect(state.vetosEnabled).toBe(false);
    expect(state.vetos).toEqual({ blue: false, red: false });
  });

  it('uses the header back button to move to the previous setup step', () => {
    render(<SetupScreen />);

    fireEvent.press(screen.getByText('Pétanque Fantasy'));
    expect(screen.getByText('Nombre de mènes')).toBeTruthy();
    expect(screen.getByText('Score à atteindre')).toBeTruthy();

    fireEvent.press(screen.getByTestId('setup-back-button'));

    expect(screen.getByText('Pétanque normale')).toBeTruthy();
    expect(screen.getByText('Pétanque Fantasy')).toBeTruthy();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('keeps the setup head in a safe-area overlay', () => {
    render(<SetupScreen />);

    const safeAreaStyle = StyleSheet.flatten(screen.getByTestId('setup-head-safe-area').props.style);
    const headStyle = StyleSheet.flatten(screen.getByTestId('setup-head').props.style);

    expect(screen.getByTestId('setup-head-safe-area').props.edges.top).toBe('additive');
    expect(screen.getByTestId('setup-head-safe-area').props.edges.bottom).toBe('off');
    expect(safeAreaStyle.position).toBe('absolute');
    expect(safeAreaStyle.top).toBe(0);
    expect(safeAreaStyle.left).toBe(0);
    expect(headStyle.padding).toBe(16);
  });

  it('stretches setup choice options across the available screen height', () => {
    render(<SetupScreen />);

    const simpleOptionStyle = StyleSheet.flatten(screen.getByTestId('setup-mode-simple-option').props.style);
    const fantasyOptionStyle = StyleSheet.flatten(screen.getByTestId('setup-mode-fantasy-option').props.style);

    expect(simpleOptionStyle.flex).toBe(1);
    expect(simpleOptionStyle.minHeight).toBe(0);
    expect(fantasyOptionStyle.flex).toBe(1);
    expect(fantasyOptionStyle.minHeight).toBe(0);
  });
});
