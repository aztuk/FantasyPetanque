import React from 'react';
import { Text } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { Section, Props, styles } from './shared';

export function SortieDePorc({ round }: Props) {
  const { setSortieDePorc } = useGameStore();
  return (
    <Section title="Action">
      <TeamButton
        team="blue"
        label={round.sortieDePorc === 'blue' ? '✓ Cochonnet sorti +6' : 'Cochonnet sorti +6'}
        onPress={() => setSortieDePorc(round.sortieDePorc === 'blue' ? null : 'blue')}
        style={{ marginBottom: 8 }}
      />
      <TeamButton
        team="red"
        label={round.sortieDePorc === 'red' ? '✓ Cochonnet sorti +6' : 'Cochonnet sorti +6'}
        onPress={() => setSortieDePorc(round.sortieDePorc === 'red' ? null : 'red')}
      />
      {round.sortieDePorc && (
        <Text style={styles.note}>Le score normal sera ignoré. La mène sera terminée avec 6 points directs.</Text>
      )}
    </Section>
  );
}
