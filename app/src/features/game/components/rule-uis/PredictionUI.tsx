import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { Section, Props, styles, colors, typography, radius, TEAM_COLORS } from './shared';

export function PredictionUI({ round }: Props) {
  const { setPrediction } = useGameStore();
  return (
    <Section title="Valeurs">
      <Text style={styles.note}>Prédire de combien de points vous allez gagner (1 à 6). Si réussi, l'adversaire perd ce nombre de points.</Text>
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} :</Text>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <TouchableOpacity
              key={n}
              style={[localStyles.predBtn, round.predictionValues[team] === n && { backgroundColor: TEAM_COLORS[team] }]}
              onPress={() => setPrediction(team, round.predictionValues[team] === n ? null : n)}
            >
              <Text style={localStyles.predBtnLabel}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </Section>
  );
}

const localStyles = StyleSheet.create({
  predBtn: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  predBtnLabel: { color: colors.textPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.base },
});
