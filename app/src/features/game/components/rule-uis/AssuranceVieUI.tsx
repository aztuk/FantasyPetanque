import React from 'react';
import { View, Text } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { Section, Props, styles } from './shared';

export function AssuranceVieSetupUI({ round }: Props) {
  const { toggleAssurance } = useGameStore();
  return (
    <Section title="Configuration">
      <Text style={styles.note}>Perdre = +1, gagner = -1 sur les points normaux.</Text>
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton key={team} team={team} label={round.assurance[team] ? '✓ Assuré' : 'Prendre assurance'} onPress={() => toggleAssurance(team)} />
        ))}
      </View>
    </Section>
  );
}

export function AssuranceVieReminderUI({ round }: Props) {
  const activeTeams = (['blue', 'red'] as const)
    .filter((team) => round.assurance[team])
    .map((team) => (team === 'blue' ? 'Bleu' : 'Rouge'));

  return (
    <Section title="Assurance">
      <Text style={styles.note}>
        {activeTeams.length > 0
          ? `Assurance active : ${activeTeams.join(', ')}.`
          : 'Aucune assurance prise.'}
        {'\n'}Perdre = +1, gagner = -1 sur les points normaux.
      </Text>
    </Section>
  );
}
