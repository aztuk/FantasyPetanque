import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput,
} from 'react-native';
import { Rule } from '../../../domain/game/models';
import { ALL_RULES } from '../../../data/rules/rules';
import { useGameStore } from '../state/gameStore';
import { colors, typography, radius } from '../../../shared/constants';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DebugRulePicker({ visible, onClose }: Props) {
  const { forceRule, currentRound } = useGameStore();
  const [search, setSearch] = useState('');

  const filtered = ALL_RULES.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (rule: Rule) => { forceRule(rule); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug — règle</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnLabel}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {currentRound?.rule && (
          <Text style={styles.currentRule}>
            Actuelle : <Text style={{ color: colors.accent }}>{currentRound.rule.name}</Text>
          </Text>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => {
            const active = currentRound?.rule?.id === item.id;
            return (
              <TouchableOpacity style={styles.ruleItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                <View style={[styles.ruleBar, active && styles.ruleBarActive]} />
                <View style={styles.ruleItemContent}>
                  <Text style={[styles.ruleName, active && styles.ruleNameActive]}>{item.name}</Text>
                  <Text style={styles.ruleDesc} numberOfLines={2}>{item.shortDescription}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  title: { color: colors.accent, fontSize: typography.size.lg, fontWeight: typography.weight.extrabold },
  closeBtn: { padding: 10, backgroundColor: colors.surface2, borderRadius: radius.md },
  closeBtnLabel: { color: colors.textPrimary, fontSize: typography.size.base, fontWeight: typography.weight.bold },
  searchInput: {
    backgroundColor: colors.surface, color: colors.textPrimary,
    fontSize: typography.size.base, paddingHorizontal: 16, paddingVertical: 13,
    marginHorizontal: 20, marginBottom: 12, borderRadius: radius.md,
  },
  currentRule: { color: colors.textSecondary, fontSize: typography.size.base, marginHorizontal: 20, marginBottom: 12 },
  ruleItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14 },
  ruleBar: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: colors.surface2, marginRight: 14, marginTop: 3 },
  ruleBarActive: { backgroundColor: colors.accent },
  ruleItemContent: { flex: 1 },
  ruleName: { color: colors.textPrimary, fontSize: typography.size.base, fontWeight: typography.weight.bold, marginBottom: 4 },
  ruleNameActive: { color: colors.accent },
  ruleDesc: { color: colors.textSecondary, fontSize: typography.size.base, lineHeight: 24 },
  separator: { height: 1, backgroundColor: colors.surface2 },
});
