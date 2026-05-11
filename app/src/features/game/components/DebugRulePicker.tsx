import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput,
} from 'react-native';
import { Rule } from '../../../domain/game/models';
import { ALL_RULES } from '../../../data/rules/rules';
import { useGameStore } from '../state/gameStore';
import { BACKGROUND, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, ACCENT } from '../../../shared/constants';

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

  const handleSelect = (rule: Rule) => {
    forceRule(rule);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🛠 Debug — Choisir une règle</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnLabel}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une règle..."
          placeholderTextColor={TEXT_SECONDARY}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        {currentRound?.rule && (
          <Text style={styles.currentRule}>
            Règle actuelle : <Text style={{ color: ACCENT }}>{currentRound.rule.name}</Text>
          </Text>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.ruleItem,
                currentRound?.rule?.id === item.id && styles.ruleItemActive,
              ]}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <View style={styles.ruleItemContent}>
                <Text style={styles.ruleName}>{item.name}</Text>
                <Text style={styles.ruleDesc} numberOfLines={2}>{item.shortDescription}</Text>
                <View style={styles.tagsRow}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <Text key={tag} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
              </View>
              {currentRound?.rule?.id === item.id && (
                <Text style={styles.activeCheck}>✓</Text>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  closeBtnLabel: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: SURFACE,
    color: TEXT_PRIMARY,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  currentRule: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: SURFACE,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  ruleItemActive: {
    borderWidth: 2,
    borderColor: ACCENT,
  },
  ruleItemContent: {
    flex: 1,
  },
  ruleName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  ruleDesc: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    color: '#888',
    fontSize: 11,
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeCheck: {
    color: ACCENT,
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },
  separator: {
    height: 6,
  },
});
