import React, { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ALL_RULES } from '../../../data/rules/rules';
import { Rule } from '../../../domain/game/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import {
  ACCENT,
  BACKGROUND,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../../../shared/constants';
import { useGameStore } from '../state/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'DebugRuleSelect'>;

export function DebugRuleSelectScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const { currentRound, forceRule, resetGame } = useGameStore();

  const filteredRules = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return ALL_RULES;

    return ALL_RULES.filter((rule) =>
      rule.name.toLowerCase().includes(normalizedSearch) ||
      rule.id.toLowerCase().includes(normalizedSearch) ||
      rule.shortDescription.toLowerCase().includes(normalizedSearch),
    );
  }, [search]);

  const handleSelectRule = (rule: Rule) => {
    forceRule(rule);
    navigation.replace('Game');
  };

  const handleCancel = () => {
    resetGame();
    navigation.replace('Home');
  };

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Debug</Text>
          <Text style={styles.emptyText}>Aucune mene en attente.</Text>
          <PrimaryButton label="Retour accueil" onPress={handleCancel} style={styles.fullButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Mene {currentRound.number}</Text>
        <Text style={styles.title}>Choisir la regle</Text>
        <Text style={styles.subtitle}>
          Selectionne la regle debug avant de lancer la mene.
        </Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une regle..."
        placeholderTextColor={TEXT_SECONDARY}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={filteredRules}
        keyExtractor={(rule) => rule.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.ruleItem,
              currentRound.rule?.id === item.id && styles.ruleItemActive,
            ]}
            onPress={() => handleSelectRule(item)}
            activeOpacity={0.72}
          >
            <View style={styles.ruleText}>
              <Text style={styles.ruleName}>{item.name}</Text>
              <Text style={styles.ruleDesc} numberOfLines={2}>
                {item.shortDescription}
              </Text>
            </View>
            {currentRound.rule?.id === item.id && (
              <Text style={styles.activeIndicator}>Actuelle</Text>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune regle trouvee.</Text>}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.bottomBar}>
        <PrimaryButton
          label="Annuler la partie"
          onPress={handleCancel}
          variant="secondary"
          style={styles.fullButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  eyebrow: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: SURFACE,
    color: TEXT_PRIMARY,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 96,
  },
  ruleItem: {
    backgroundColor: SURFACE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  ruleItemActive: {
    borderColor: ACCENT,
  },
  ruleText: {
    flex: 1,
  },
  ruleName: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  ruleDesc: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
  },
  activeIndicator: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 10,
    textTransform: 'uppercase',
  },
  separator: {
    height: 8,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: BACKGROUND,
  },
  fullButton: {
    marginHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});
