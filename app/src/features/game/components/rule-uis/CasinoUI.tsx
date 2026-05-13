import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { Section, Props, styles, colors, typography, radius, TEAM_COLORS } from './shared';

export function CasinoUI({ round }: Props) {
  const { setCasinoBet, setCasinoWinner } = useGameStore();
  const scores = useGameStore((s) => s.scores);
  const [betInput, setBetInput] = useState<Record<'blue' | 'red', string>>({
    blue: String(round.casinoBets.blue),
    red: String(round.casinoBets.red),
  });

  const handleBet = (team: 'blue' | 'red', val: string) => {
    setBetInput((prev) => ({ ...prev, [team]: val }));
    const num = parseInt(val, 10);
    if (!isNaN(num)) setCasinoBet(team, num);
  };

  if (!round.casinoWinner) {
    return (
      <Section title="Mise">
        {(['blue', 'red'] as const).map((team) => (
          <View key={team} style={styles.teamRow}>
            <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} (max {scores[team]}) :</Text>
            <TextInput
              style={localStyles.betInput}
              keyboardType="number-pad"
              value={betInput[team]}
              onChangeText={(v) => handleBet(team, v)}
              maxLength={3}
            />
          </View>
        ))}
        <Text style={styles.note}>Pas de score normal. Désignez le gagnant à la fin de la mène.</Text>
        <View style={styles.row}>
          {(['blue', 'red'] as const).map((team) => (
            <TeamButton key={team} team={team} label="Gagne la mène" onPress={() => setCasinoWinner(team)} />
          ))}
        </View>
      </Section>
    );
  }

  return (
    <Section title="Résultat">
      <Text style={styles.note}>
        {round.casinoWinner === 'blue' ? 'Bleu' : 'Rouge'} gagne !{'\n'}
        Bleu mise : {round.casinoBets.blue} — Rouge mise : {round.casinoBets.red}
      </Text>
    </Section>
  );
}

const localStyles = StyleSheet.create({
  betInput: {
    backgroundColor: colors.surface2,
    color: colors.textPrimary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.size.base,
    width: 76,
    marginLeft: 10,
    textAlign: 'center',
  },
});
