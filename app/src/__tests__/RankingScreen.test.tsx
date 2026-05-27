import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RankingScreen } from '../features/ranking/screens/RankingScreen';

const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

beforeEach(() => {
  mockGoBack.mockClear();
});

describe('RankingScreen', () => {
  it('renders the ranking skeleton with both sports', () => {
    render(<RankingScreen />);

    expect(screen.getByText('Classements')).toBeTruthy();
    expect(screen.getByText('Pétanque')).toBeTruthy();
    expect(screen.getByText('Fléchettes')).toBeTruthy();
    expect(screen.getByText('Classement Pétanque')).toBeTruthy();
  });

  it('switches the selected sport', () => {
    render(<RankingScreen />);

    fireEvent.press(screen.getByTestId('ranking-flechettes-tab'));

    expect(screen.getByText('Classement Fléchettes')).toBeTruthy();
  });

  it('goes back from the header', () => {
    render(<RankingScreen />);

    fireEvent.press(screen.getByTestId('ranking-back-button'));

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
