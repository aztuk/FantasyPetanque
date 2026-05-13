import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { Section, Props, styles, colors, typography, radius, TEAM_COLORS } from './shared';

export function FrontiereSetupUI({ round }: Props) {
  const { setFrontiereChoice } = useGameStore();
  const bothChosen = round.frontiereChoice.blue !== null && round.frontiereChoice.red !== null;

  return (
    <Section title="Côté">
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} :</Text>
          <TouchableOpacity
            style={[localStyles.sideBtn, round.frontiereChoice[team] === 'left' && { backgroundColor: TEAM_COLORS[team] }]}
            onPress={() => setFrontiereChoice(team, 'left')}
          >
            <Text style={localStyles.sideBtnLabel}>← Gauche</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[localStyles.sideBtn, round.frontiereChoice[team] === 'right' && { backgroundColor: TEAM_COLORS[team] }]}
            onPress={() => setFrontiereChoice(team, 'right')}
          >
            <Text style={localStyles.sideBtnLabel}>Droite →</Text>
          </TouchableOpacity>
        </View>
      ))}
      {bothChosen && <Text style={styles.note}>Seules les boules du bon côté peuvent marquer.</Text>}
    </Section>
  );
}

export function FrontiereReminderUI({ round }: Props) {
  const formatChoice = (choice: 'left' | 'right' | null) => {
    if (choice === 'left') return 'gauche';
    if (choice === 'right') return 'droite';
    return 'non choisi';
  };

  return (
    <Section title="Côté">
      <Text style={styles.note}>
        Bleu joue à {formatChoice(round.frontiereChoice.blue)}. Rouge joue à {formatChoice(round.frontiereChoice.red)}.{'\n'}
        Seules les boules du bon côté peuvent marquer.
      </Text>
    </Section>
  );
}

const localStyles = StyleSheet.create({
  sideBtn: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface2, borderRadius: radius.md, marginHorizontal: 4 },
  sideBtnLabel: { color: colors.textPrimary, fontSize: typography.size.base, fontWeight: typography.weight.semibold },
});
