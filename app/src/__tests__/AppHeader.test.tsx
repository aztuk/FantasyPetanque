import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet, Text } from 'react-native';
import { AppHeader } from '../shared/components/AppHeader';
import { colors } from '../shared/constants';

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

  it('keeps a solid background by default and can render as floating', () => {
    render(<AppHeader onBack={jest.fn()} testID="solid-head" />);

    const solidStyle = StyleSheet.flatten(screen.getByTestId('solid-head').props.style);

    expect(solidStyle.backgroundColor).toBe(colors.dark);

    render(<AppHeader onBack={jest.fn()} floating testID="floating-head" />);

    const floatingStyle = StyleSheet.flatten(screen.getByTestId('floating-head').props.style);

    expect(floatingStyle.backgroundColor).toBeUndefined();
  });
});
