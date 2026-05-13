import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'phosphor-react-native';
import { Team } from '../../../../domain/game/models';
import { textStyles } from '../../../../shared/constants';
import { gameUiColors } from '../gameUiTheme';

interface TeamStepperProps {
  team: Team;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  testID?: string;
}

const TEAM_SURFACE: Record<Team, string> = {
  blue: gameUiColors.blueSurface,
  red: gameUiColors.redSurface,
};

const TEAM_TEXT: Record<Team, string> = {
  blue: gameUiColors.blueText,
  red: gameUiColors.redText,
};

export function TeamStepper({ team, value, onChange, min = 0, max = 99, label, testID }: TeamStepperProps) {
  const surface = TEAM_SURFACE[team];
  const textColor = TEAM_TEXT[team];
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.wrapper}>
      <View style={styles.stepper}>
        <Pressable
          style={[styles.btn, styles.btnTop, { backgroundColor: surface }, !canIncrement && styles.btnDisabled]}
          onPress={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          accessibilityRole="button"
          testID={testID ? `${testID}-increment` : undefined}
        >
          <Plus size={24} color={gameUiColors.white} weight="bold" />
        </Pressable>

        <View style={styles.valueBox} testID={testID ? `${testID}-value` : undefined}>
          <Text style={styles.valueText}>{value}</Text>
        </View>

        <Pressable
          style={[styles.btn, styles.btnBottom, { backgroundColor: surface }, !canDecrement && styles.btnDisabled]}
          onPress={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          accessibilityRole="button"
          testID={testID ? `${testID}-decrement` : undefined}
        >
          <Minus size={24} color={gameUiColors.white} weight="bold" />
        </Pressable>
      </View>

      {label !== undefined && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    alignItems: 'center',
    gap: 2,
  },
  btn: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTop: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  btnBottom: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  valueBox: {
    backgroundColor: gameUiColors.divider,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    ...textStyles.uiValueLg,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  label: {
    ...textStyles.actionLabel,
    textAlign: 'center',
    marginTop: 10,
  },
});
