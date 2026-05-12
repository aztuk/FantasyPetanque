import React, { useMemo, useState } from 'react';
import {
  Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ALL_RULES } from '../../../data/rules/rules';
import { Rule } from '../../../domain/game/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { GameTopBar } from '../components/GameTopBar';
import { colors, typography, radius } from '../../../shared/constants';
import { useGameStore } from '../state/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DebugRuleSelect'>;

export function DebugRuleSelectScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const { currentRound, forceRule, resetGame } = useGameStore();

  const filteredRules = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return ALL_RULES;
    return ALL_RULES.filter((rule) =>
      rule.name.toLowerCase().includes(s) ||
      rule.id.toLowerCase().includes(s) ||
      rule.shortDescription.toLowerCase().includes(s),
    );
  }, [search]);

  const handleSelectRule = (rule: Rule) => { forceRule(rule); navigation.replace('Game'); };
  const handleCancel = () => { resetGame(); navigation.replace('Home'); };
  const handleCancelPress = () => {
    Alert.alert(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Annuler la partie', style: 'destructive', onPress: handleCancel },
      ],
    );
  };

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Debug</Text>
          <Text style={styles.emptyText}>Aucune mene en attente.</Text>
          <PrimaryButton label="Retour accueil" onPress={handleCancel} style={styles.fullButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelPress} />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Mène {currentRound.number}</Text>
        <Text style={styles.title}>Choisir la règle</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={filteredRules}
        keyExtractor={(rule) => rule.id}
        renderItem={({ item }) => {
          const active = currentRound.rule?.id === item.id;
          return (
            <TouchableOpacity style={styles.ruleItem} onPress={() => handleSelectRule(item)} activeOpacity={0.7}>
              <View style={[styles.ruleBar, active && styles.ruleBarActive]} />
              <View style={styles.ruleText}>
                <Text style={[styles.ruleName, active && styles.ruleNameActive]}>{item.name}</Text>
                <Text style={styles.ruleDesc} numberOfLines={2}>{item.shortDescription}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune règle trouvée.</Text>}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.bottomBar}>
        <PrimaryButton label="Annuler la partie" onPress={handleCancelPress} variant="secondary" style={styles.fullButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: { color: colors.accent, fontSize: typography.size.xl, fontWeight: typography.weight.extrabold },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.size.base,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: radius.md,
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  ruleItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16 },
  ruleBar: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: colors.surface2, marginRight: 16, marginTop: 3 },
  ruleBarActive: { backgroundColor: colors.accent },
  ruleText: { flex: 1 },
  ruleName: { color: colors.textPrimary, fontSize: typography.size.base, fontWeight: typography.weight.extrabold, marginBottom: 4 },
  ruleNameActive: { color: colors.accent },
  ruleDesc: { color: colors.textSecondary, fontSize: typography.size.base, lineHeight: 24 },
  separator: { height: 1, backgroundColor: colors.surface2 },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
    backgroundColor: colors.background,
  },
  fullButton: { marginHorizontal: 0 },
  emptyContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: { color: colors.textSecondary, fontSize: typography.size.base, textAlign: 'center', marginTop: 16 },
});
