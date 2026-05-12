import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors, typography } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { debugMode, toggleDebugMode } = useGameStore();
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) {
      toggleDebugMode();
      setTapCount(0);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={handleLogoTap}
          activeOpacity={1}
        >
          <Text style={styles.eyebrow}>🎯 Le jeu</Text>
          <Text style={styles.title}>Fantasy</Text>
          <Text style={styles.titleAccent}>Pétanque</Text>
          <Text style={styles.tagline}>Dignité optionnelle.</Text>
          {debugMode && <Text style={styles.debugBadge}>MODE DEBUG</Text>}
        </TouchableOpacity>

        <PrimaryButton
          label="Jouer"
          onPress={() => navigation.navigate('Setup')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  eyebrow: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.size.hero,
    fontWeight: typography.weight.extrabold,
    lineHeight: 68,
  },
  titleAccent: {
    color: colors.accent,
    fontSize: typography.size.hero,
    fontWeight: typography.weight.extrabold,
    lineHeight: 68,
    marginBottom: 24,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontStyle: 'italic',
  },
  debugBadge: {
    marginTop: 20,
    color: colors.accent,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
