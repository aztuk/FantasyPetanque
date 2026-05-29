import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { RankingScreen } from '../features/ranking/screens/RankingScreen';
import { createEmptyRankingRecords, fetchRankingData } from '../features/ranking/services/rankingPlayers';
import { colors, figmaTextStyles, typography } from '../shared/constants';

const mockGoBack = jest.fn();
const mockRouteParams: { sport?: 'petanque' | 'flechettes' } = {};

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    useNavigation: () => ({
      goBack: mockGoBack,
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      params: mockRouteParams,
    }),
    useFocusEffect: (cb: () => (() => void) | void) => {
      React.useEffect(() => cb(), []);
    },
  };
});

jest.mock('../features/ranking/services/rankingPlayers', () => {
  const actual = jest.requireActual('../features/ranking/services/rankingPlayers');

  return {
    ...actual,
    fetchRankingData: jest.fn(),
  };
});

const mockFetchRankingData = fetchRankingData as jest.MockedFunction<typeof fetchRankingData>;

const players = [
  {
    id: 'quentin',
    name: 'Quentin',
    eloPetanque: 1198,
    eloFlechettes: 1120,
  },
  {
    id: 'clement',
    name: 'Clément',
    eloPetanque: 1204,
    eloFlechettes: 990,
  },
  {
    id: 'lea',
    name: 'Léa',
    eloPetanque: 1000,
    eloFlechettes: 1201,
  },
];

beforeEach(() => {
  mockGoBack.mockClear();
  delete mockRouteParams.sport;
  const records = createEmptyRankingRecords();
  records.petanque.clement = { wins: 13, losses: 8 };
  records.petanque.quentin = { wins: 11, losses: 8 };
  records.petanque.lea = { wins: 2, losses: 4 };
  records.flechettes.lea = { wins: 9, losses: 1 };
  records.flechettes.quentin = { wins: 7, losses: 3 };
  records.flechettes.clement = { wins: 4, losses: 5 };
  mockFetchRankingData.mockResolvedValue({ players, records });
});

describe('RankingScreen', () => {
  it('renders the sport choice page with leader summaries', async () => {
    render(<RankingScreen />);

    expect(await screen.findByText('PÉTANQUE')).toBeTruthy();
    expect(screen.getByText('FLECHETTE')).toBeTruthy();
    expect(screen.getByText('Clément mène de 6 points')).toBeTruthy();
    expect(screen.getByText('Léa mène de 81 points')).toBeTruthy();
  });

  it('renders petanque players sorted by descending ELO', async () => {
    render(<RankingScreen />);

    fireEvent.press(await screen.findByTestId('ranking-petanque-choice'));

    expect(screen.getByText('Pétanque')).toBeTruthy();
    expect(screen.getByTestId('ranking-rank-clement').props.accessibilityLabel).toBe('01');
    expect(screen.getByTestId('ranking-rank-quentin').props.accessibilityLabel).toBe('02');
    expect(screen.getByTestId('ranking-rank-lea').props.accessibilityLabel).toBe('03');
    expect(screen.getByTestId('ranking-trophy-clement').props.width).toBe(56);
    expect(screen.getByTestId('ranking-trophy-clement').props.height).toBe(56);
    expect(screen.getByTestId('ranking-trophy-quentin').props.width).toBe(48);
    expect(screen.getByTestId('ranking-trophy-quentin').props.height).toBe(48);
    expect(screen.getByTestId('ranking-trophy-lea').props.width).toBe(40);
    expect(screen.getByTestId('ranking-trophy-lea').props.height).toBe(40);
    expect(
      StyleSheet.flatten(
        screen.getByTestId('ranking-rank-clement-stroke-0', { includeHiddenElements: true }).props.style,
      ).color,
    ).toBe(colors.darkSmooth);
    expect(
      StyleSheet.flatten(
        screen.getByTestId('ranking-rank-quentin-stroke-0', { includeHiddenElements: true }).props.style,
      ).color,
    ).toBe(colors.dark);
    expect(
      StyleSheet.flatten(
        screen.getByTestId('ranking-rank-lea-stroke-0', { includeHiddenElements: true }).props.style,
      ).color,
    ).toBe(colors.dark);
    expect(screen.getByTestId('ranking-elo-clement').props.accessibilityLabel).toBe('1204');
    expect(
      StyleSheet.flatten(screen.getByTestId('ranking-rank-clement-fill').props.style).fontFamily,
    ).toBe(typography.family.numberBold);
    expect(
      StyleSheet.flatten(screen.getByTestId('ranking-elo-clement-fill').props.style).fontFamily,
    ).toBe(typography.family.numberBold);
    expect(
      StyleSheet.flatten(screen.getByTestId('ranking-elo-clement-fill').props.style).fontWeight,
    ).toBeUndefined();
    expect(
      StyleSheet.flatten(within(screen.getByTestId('ranking-player-quentin')).getByText('Quentin').props.style).color,
    ).toBe(colors.silver);
    expect(
      StyleSheet.flatten(within(screen.getByTestId('ranking-player-lea')).getByText('Léa').props.style).color,
    ).toBe(colors.copper);
    expect(
      StyleSheet.flatten(screen.getByTestId('ranking-player-record-clement').props.style)
        .fontSize,
    ).toBe(figmaTextStyles.bodyXs.fontSize);
    expect(within(screen.getByTestId('ranking-player-clement')).getByText('8D')).toBeTruthy();
    expect(screen.getByTestId('ranking-add-match-button')).toBeTruthy();
  });

  it('opens directly on the requested sport ranking when provided by navigation params', async () => {
    mockRouteParams.sport = 'petanque';

    render(<RankingScreen />);

    expect(await screen.findByTestId('ranking-player-list')).toBeTruthy();
    expect(screen.queryByTestId('ranking-flechettes-choice')).toBeNull();
    expect(screen.getByTestId('ranking-rank-clement').props.accessibilityLabel).toBe('01');
  });

  it('renders flechettes players sorted by descending ELO', async () => {
    render(<RankingScreen />);

    fireEvent.press(await screen.findByTestId('ranking-flechettes-choice'));

    expect(screen.getByText('Fléchettes')).toBeTruthy();
    expect(screen.getByTestId('ranking-rank-lea').props.accessibilityLabel).toBe('01');
    expect(screen.getByTestId('ranking-rank-quentin').props.accessibilityLabel).toBe('02');
    expect(screen.getByTestId('ranking-rank-clement').props.accessibilityLabel).toBe('03');
  });

  it('shows top-1 rate for flechettes and wins/losses for petanque', async () => {
    render(<RankingScreen />);

    fireEvent.press(await screen.findByTestId('ranking-flechettes-choice'));

    // fléchettes: % winrate format (9/10 = 90%, 7/10 = 70%, 4/9 ≈ 44%)
    expect(screen.getByTestId('ranking-player-record-lea')).toHaveTextContent('90% winrate');
    expect(screen.getByTestId('ranking-player-record-quentin')).toHaveTextContent('70% winrate');
    expect(screen.getByTestId('ranking-player-record-clement')).toHaveTextContent('44% winrate');
    // no wins/losses format
    expect(screen.queryByText(/\d+V/)).toBeNull();
    expect(screen.queryByText(/\d+D/)).toBeNull();
  });

  it('goes back from the choice page header', async () => {
    render(<RankingScreen />);

    await screen.findByText('PÉTANQUE');
    fireEvent.press(screen.getByTestId('ranking-back-button'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('returns to sport choice from the ranking page header', async () => {
    render(<RankingScreen />);

    fireEvent.press(await screen.findByTestId('ranking-petanque-choice'));
    fireEvent.press(screen.getByTestId('ranking-list-back-button'));

    expect(screen.getByText('PÉTANQUE')).toBeTruthy();
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
