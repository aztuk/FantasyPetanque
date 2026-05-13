import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppHeader } from '../shared/components/AppHeader';

describe('AppHeader', () => {
  it('renders a shared back button with the configured label and title', () => {
    const onBack = jest.fn();

    render(
      <AppHeader
        title="Titre"
        onBack={onBack}
        backAccessibilityLabel="Annuler la partie"
        backButtonTestID="shared-back-button"
      />,
    );

    fireEvent.press(screen.getByTestId('shared-back-button'));

    expect(screen.getByLabelText('Annuler la partie')).toBeTruthy();
    expect(screen.getByText('Titre')).toBeTruthy();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders action children when there is no title', () => {
    render(
      <AppHeader onBack={jest.fn()}>
        <Text>Action</Text>
      </AppHeader>,
    );

    expect(screen.getByText('Action')).toBeTruthy();
  });
});
