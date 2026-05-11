import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, ACCENT } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame, debugMode, toggleDebugMode } = useGameStore();

  const handleStartSimple = () => {
    resetGame();
    startGame('simple');
    navigation.navigate('Game');
  };

  const handleStartFantasy = () => {
    resetGame();
    startGame('fantasy');
    navigation.navigate('Game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Fantasy</Text>
          <Text style={styles.titleSub}>Pétanque</Text>
          <Text style={styles.tagline}>Dignité optionnelle.</Text>
        </View>

        <View style={styles.buttons}>
          <PrimaryButton
            label="Mode simple"
            onPress={handleStartSimple}
            style={styles.btn}
          />
          <View style={{ height: 12 }} />
          <PrimaryButton
            label="Mode fantasy"
            onPress={handleStartFantasy}
            style={styles.btn}
            variant="secondary"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Score cible : 13 points</Text>
          <TouchableOpacity style={styles.debugToggle} onPress={toggleDebugMode}>
            <Text style={[styles.debugToggleLabel, debugMode && styles.debugActive]}>
              {debugMode ? '🛠 Debug ON' : '🛠 Debug'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  titleSub: {
    color: ACCENT,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: -8,
  },
  tagline: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    marginTop: 16,
    fontStyle: 'italic',
  },
  buttons: {},
  btn: {
    marginHorizontal: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
  },
  debugToggle: {
    padding: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  debugToggleLabel: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  debugActive: {
    color: ACCENT,
  },
});
