import React from 'react';
import { Text } from 'react-native';
import { Section, styles } from './shared';

export function ImpairUI() {
  return (
    <Section title="Résolution auto">
      <Text style={styles.note}>
        L'équipe gagnante doit gagner avec un nombre impair de points.{'\n'}
        Sinon : 0 point pour le gagnant, 1 point de consolation pour le perdant.{'\n'}
        L'application calcule automatiquement.
      </Text>
    </Section>
  );
}
