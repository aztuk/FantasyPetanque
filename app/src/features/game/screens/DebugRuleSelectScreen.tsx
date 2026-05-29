import React, { useMemo, useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ALL_RULES } from '../../../data/rules/rules';
import { Rule } from '../../../domain/game/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { CancelGameSheet } from '../../../shared/components/CancelGameSheet';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { GameTopBar } from '../components/GameTopBar';
import { colors, figmaTextStyles, radius } from '../../../shared/constants';
import { useGameStore } from '../state/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DebugRuleSelect'>;

export function DebugRuleSelectScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [showCancelSheet, setShowCancelSheet] = useState(false);
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
  const handleCancelPress = () => setShowCancelSheet(true);

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
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={handleCancelPress} />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Mène {currentRound.number}</Text>
        <Text style={styles.title}>Choisir la règle</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher..."
        placeholderTextColor={colors.textSmooth}
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
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
  eyebrow: {
    color: colors.textSmooth,
    ...figmaTextStyles.labels,
    marginBottom: 4,
  },
  title: { color: colors.primary, ...figmaTextStyles.bodyMd },
  searchInput: {
    backgroundColor: colors.darkSmooth,
    color: colors.white,
    ...figmaTextStyles.bodySm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: radius.md,
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  ruleItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16 },
  ruleBar: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: colors.darkSmooth, marginRight: 16, marginTop: 3 },
  ruleBarActive: { backgroundColor: colors.primary },
  ruleText: { flex: 1 },
  ruleName: { color: colors.white, ...figmaTextStyles.bodyMd, marginBottom: 4 },
  ruleNameActive: { color: colors.primary },
  ruleDesc: { color: colors.textSmooth, ...figmaTextStyles.bodySm },
  separator: { height: 1, backgroundColor: colors.darkSmooth },
  bottomBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8,
    backgroundColor: colors.dark,
  },
  fullButton: { marginHorizontal: 0 },
  emptyContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emptyText: { color: colors.textSmooth, ...figmaTextStyles.bodySm, textAlign: 'center', marginTop: 16 },
});
