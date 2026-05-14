import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';
import { GameActionButton } from '../features/game/components/GameActionButton';
import { colors } from '../shared/constants';

describe('GameActionButton', () => {
  it('maps the muted variant to the shared default button surface', () => {
    const { UNSAFE_getByType } = render(
      <GameActionButton label="Veto" onPress={jest.fn()} variant="muted" />,
    );

    const buttonStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    expect(buttonStyle.backgroundColor).toBe(colors.darkSmooth);
  });
});
