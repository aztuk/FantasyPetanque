import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddMatchScreen } from '../features/ranking/screens/AddMatchScreen';
import {
  fetchPlayersOrderedByActivity,
  saveMatch,
  saveMatchRanked,
} from '../features/ranking/services/rankingPlayers';
import { useGameStore } from '../features/game/state/gameStore';
import { colors, figmaTextStyles } from '../shared/constants';

const mockGoBack = jest.fn();
const mockRouteParams: { sport: 'flechettes' | 'petanque'; source?: 'gameResult' } = {
  sport: 'flechettes',
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: mockRouteParams,
  }),
}));

jest.mock('../features/ranking/services/rankingPlayers', () => {
  const actual = jest.requireActual('../features/ranking/services/rankingPlayers');

  return {
    ...actual,
    fetchPlayersOrderedByActivity: jest.fn(),
    saveMatchRanked: jest.fn(),
    saveMatch: jest.fn(),
    createPlayer: jest.fn(),
  };
});

const mockFetchPlayersOrderedByActivity =
  fetchPlayersOrderedByActivity as jest.MockedFunction<typeof fetchPlayersOrderedByActivity>;
const mockSaveMatchRanked = saveMatchRanked as jest.MockedFunction<typeof saveMatchRanked>;
const mockSaveMatch = saveMatch as jest.MockedFunction<typeof saveMatch>;

const players = [
  {
    id: 'lea',
    name: 'Lea',
    eloPetanque: 1000,
    eloFlechettes: 1201,
  },
  {
    id: 'quentin',
    name: 'Quentin',
    eloPetanque: 1198,
    eloFlechettes: 1120,
  },
  {
    id: 'clement',
    name: 'Clement',
    eloPetanque: 1204,
    eloFlechettes: 990,
  },
];

beforeEach(() => {
  mockGoBack.mockClear();
  mockRouteParams.sport = 'flechettes';
  delete mockRouteParams.source;
  mockFetchPlayersOrderedByActivity.mockResolvedValue(players);
  mockSaveMatchRanked.mockResolvedValue();
  mockSaveMatch.mockResolvedValue();
  useGameStore.setState({ rankingMatchSaved: false });
});

describe('AddMatchScreen', () => {

  it('renders the flechettes winner sort screen with Figma item states', async () => {
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 393, height: 852 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        <AddMatchScreen />
      </SafeAreaProvider>,
    );

    fireEvent.press(await screen.findByText('Lea'));
    fireEvent.press(screen.getByText('Quentin'));
    fireEvent.press(screen.getByText('Clement'));
    fireEvent.press(screen.getByTestId('add-match-next-button'));

    expect(screen.getByText('Qui a gagné?')).toBeTruthy();
    expect(screen.getByText('CONFIRMER')).toBeTruthy();

    const first = screen.getByTestId('rank-order-item-1');
    const between = screen.getByTestId('rank-order-item-2');
    const last = screen.getByTestId('rank-order-item-3');

    expect(within(first).getByText('Lea')).toBeTruthy();
    expect(within(between).getByText('Quentin')).toBeTruthy();
    expect(within(between).getByText('2e')).toBeTruthy();
    expect(within(last).getByText('Clement')).toBeTruthy();

    expect(StyleSheet.flatten(first.props.style).backgroundColor).toBe(colors.dark);
    expect(StyleSheet.flatten(between.props.style).height).toBe(64);
    expect(
      StyleSheet.flatten(within(between).getByText('2e').props.style).fontSize,
    ).toBe(figmaTextStyles.buttonActions.fontSize);
    expect(screen.getByTestId('drag-handle-0').props.accessibilityLabel).toBe('Déplacer Lea');

    fireEvent.press(screen.getByTestId('add-match-next-button'));

    await waitFor(() => {
      expect(mockSaveMatchRanked).toHaveBeenCalledWith(
        'flechettes',
        players,
        expect.objectContaining({
          lea: expect.any(Number),
          quentin: expect.any(Number),
          clement: expect.any(Number),
        }),
      );
    });
  });

  it('returns to the game result after recording a Petanque match from game-over', async () => {
    mockRouteParams.sport = 'petanque';
    mockRouteParams.source = 'gameResult';

    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 393, height: 852 },
          insets: { top: 0, right: 0, bottom: 0, left: 0 },
        }}
      >
        <AddMatchScreen />
      </SafeAreaProvider>,
    );

    fireEvent.press(await screen.findByText('Lea'));
    fireEvent.press(screen.getByText('Quentin'));
    fireEvent.press(screen.getByTestId('add-match-next-button'));

    fireEvent.press(screen.getByText('Lea'));
    fireEvent.press(screen.getByText('Quentin'));
    fireEvent.press(screen.getByText('Quentin'));
    fireEvent.press(screen.getByTestId('add-match-next-button'));

    await waitFor(() => {
      expect(mockSaveMatch).toHaveBeenCalled();
    });

    expect(useGameStore.getState().rankingMatchSaved).toBe(true);
    expect(screen.getByText('RETOUR AU RÉSULTAT')).toBeTruthy();
    expect(screen.queryByText('RETOUR AU CLASSEMENT')).toBeNull();

    fireEvent.press(screen.getByTestId('result-back-button'));

    expect(mockGoBack).toHaveBeenCalled();
  });
});
