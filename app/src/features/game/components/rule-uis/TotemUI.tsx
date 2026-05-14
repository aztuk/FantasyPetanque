import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Section, Props, styles, colors, figmaTextStyles, typography } from './shared';

export function TotemUI({ round }: Props) {
  return (
    <Section title="Immunité">
      <Text style={styles.note}>
        Cette mène est jouée normalement.{'\n\n'}
        Le perdant de cette mène sera immunisé contre la prochaine règle.
      </Text>
      {round.totemNextRule && (
        <View style={localStyles.totemReveal}>
          <Text style={localStyles.totemLabel}>Prochaine règle</Text>
          <Text style={localStyles.totemRuleName}>{round.totemNextRule.name}</Text>
          <Text style={localStyles.totemRuleDesc}>{round.totemNextRule.shortDescription}</Text>
        </View>
      )}
    </Section>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const localStyles = StyleSheet.create({
  totemReveal: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.darkSmooth,
    alignItems: 'center',
  },
  totemLabel: {
    color: colors.textSmooth,
    ...figmaTextStyles.labels,
    marginBottom: 8,
  },
  totemRuleName: {
    color: colors.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    marginBottom: 6,
    textAlign: 'center',
  },
  totemRuleDesc: {
    color: colors.white,
    ...figmaTextStyles.bodySm,
    textAlign: 'center',
  },
});
