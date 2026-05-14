import React from 'react';
import { render } from '@testing-library/react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';
import { SetupOption } from '../shared/components/SetupOption';
import { colors } from '../shared/constants';

describe('SetupOption', () => {
  it('uses the dark smooth surface by default', () => {
    const { getByTestId } = render(
      <SetupOption
        title="Option"
        description="Description"
        onPress={jest.fn()}
        testID="setup-option"
      />,
    );

    const style = StyleSheet.flatten(getByTestId('setup-option').props.style);

    expect(style.backgroundColor).toBe(colors.darkSmooth);
  });

  it('uses the primary surface and dark text for primary options', () => {
    const { getByTestId, getAllByText } = render(
      <SetupOption
        title="Option"
        description="Description"
        onPress={jest.fn()}
        variant="primary"
        testID="setup-option"
      />,
    );

    const style = StyleSheet.flatten(getByTestId('setup-option').props.style);
    const titleStyle = StyleSheet.flatten(getAllByText('Option')[0].props.style);

    expect(style.backgroundColor).toBe(colors.primary);
    expect(titleStyle.color).toBe(colors.dark);
  });

  it('uses the fantasy gradient from primary to secondary', () => {
    const { UNSAFE_getByType, UNSAFE_getAllByType } = render(
      <SetupOption
        title="Option"
        description="Description"
        onPress={jest.fn()}
        variant="fantasy"
      />,
    );

    const gradient = UNSAFE_getByType(LinearGradient);
    const [title] = UNSAFE_getAllByType(Text);
    const titleStyle = StyleSheet.flatten(title.props.style);

    expect(gradient.props.colors).toEqual([colors.primary, colors.secondary]);
    expect(titleStyle.color).toBe(colors.dark);
  });
});
