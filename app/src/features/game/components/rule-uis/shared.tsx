import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoundState } from '../../../../domain/game/models';
import { colors, typography, radius, TEAM_COLORS } from '../../../../shared/constants';

export interface Props {
  round: RoundState;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 420,
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginRight: 10,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  row: { flexDirection: 'row', marginTop: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  teamLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, width: 100 },
  note: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 26,
    marginTop: 8,
  },
  undoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    marginLeft: 8,
  },
  disabledEl: { opacity: 0.35 },
  undoText: { color: colors.textSecondary, fontSize: typography.size.base },
  countBadge: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginLeft: 10,
    minWidth: 28,
    textAlign: 'center',
  },
});

export { colors, typography, radius, TEAM_COLORS };
