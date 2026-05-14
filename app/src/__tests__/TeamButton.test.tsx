import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TeamButton } from '../shared/components/TeamButton';
import { colors, figmaTextStyles } from '../shared/constants';

describe('TeamButton', () => {
  it('uses the shared ButtonActions typography token for its label', () => {
    render(<TeamButton team="blue" label="Equipe bleue" onPress={jest.fn()} />);

    const labelStyle = StyleSheet.flatten(screen.getByText('Equipe bleue').props.style);

    expect(labelStyle.fontFamily).toBe(figmaTextStyles.buttonActions.fontFamily);
    expect(labelStyle.fontSize).toBe(figmaTextStyles.buttonActions.fontSize);
    expect(labelStyle.lineHeight).toBe(figmaTextStyles.buttonActions.lineHeight);
    expect(labelStyle.letterSpacing).toBe(figmaTextStyles.buttonActions.letterSpacing);
    expect(labelStyle.color).toBe(colors.white);
  });

  it('keeps disabled team actions inactive and styled with the disabled token', () => {
    const onPress = jest.fn();
    const { UNSAFE_getByType } = render(
      <TeamButton team="red" label="Equipe rouge" onPress={onPress} disabled />,
    );
    const buttonStyle = StyleSheet.flatten(UNSAFE_getByType(TouchableOpacity).props.style);

    fireEvent.press(screen.getByText('Equipe rouge'));

    expect(buttonStyle.backgroundColor).toBe(colors.disabled);
    expect(onPress).not.toHaveBeenCalled();
  });
});
