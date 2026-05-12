import React, { useState } from 'react';
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.header}
          onPress={handleLogoTap}
          activeOpacity={1}
        >
          <Text style={styles.title}>🎯 Fantasy</Text>
          <Text style={styles.titleSub}>Pétanque</Text>
          <Text style={styles.tagline}>Dignité optionnelle.</Text>
          {debugMode && <Text style={styles.debugBadge}>🛠 Debug</Text>}
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
  safe: { flex: 1, backgroundColor: BACKGROUND },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
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
  debugBadge: {
    marginTop: 12,
    color: ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
});
