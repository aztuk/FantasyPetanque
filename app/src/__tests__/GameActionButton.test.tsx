import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';
import { GameActionButton } from '../features/game/components/GameActionButton';
import { colors, componentSizes } from '../shared/constants';

describe('GameActionButton', () => {
  it('maps the muted variant to the shared default button surface', () => {
    const { UNSAFE_getByType } = render(
      <GameActionButton label="Veto" onPress={jest.fn()} variant="muted" />,
    );

    const buttonStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    expect(buttonStyle.backgroundColor).toBe(colors.darkSmooth);
  });

  it('maps the default variant to the shared default button colors', () => {
    const { UNSAFE_getByType } = render(
      <GameActionButton label="Enregistrer" onPress={jest.fn()} variant="default" />,
    );

    const buttonStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);
    const labelStyle = StyleSheet.flatten(UNSAFE_getByType(Text).props.style);

    expect(buttonStyle.backgroundColor).toBe(colors.darkSmooth);
    expect(labelStyle.color).toBe(colors.white);
  });

  it('uses the compact game CTA height from the Game Figma drawer', () => {
    const { UNSAFE_getByType } = render(
      <GameActionButton label="Confirmer" onPress={jest.fn()} />,
    );

    const buttonStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    expect(buttonStyle.height).toBe(componentSizes.gameButtonHeight);
  });
});
