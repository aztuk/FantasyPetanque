import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, ACCENT } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame } = useGameStore();

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

        <Text style={styles.footer}>Score cible : 13 points</Text>
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
    color: TEXT_SECONDARY,
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
  },
});
