import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { BrandLogo } from '../../../shared/components/BrandLogo';
import { BrandTagline } from '../../../shared/components/BrandTagline';
import { DebugModeBadge } from '../../../shared/components/DebugModeBadge';
import { FullWidthCtaButton } from '../../../shared/components/FullWidthCtaButton';
import { colors, componentSizes } from '../../../shared/constants';
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Pressable
        style={styles.content}
        onPress={handleLogoTap}
        testID="home-debug-toggle"
      >
        {debugMode && (
          <DebugModeBadge style={styles.debugBadge} testID="home-debug-badge" />
        )}
        <BrandLogo style={styles.logo} testID="home-logo" />
        <BrandTagline testID="home-tagline" />
      </Pressable>

      <View style={styles.actions}>
        <FullWidthCtaButton
          label="CLASSEMENTS"
          onPress={() => navigation.navigate('Ranking')}
          variant="default"
          style={styles.homeButton}
          testID="home-ranking-button"
        />
        <FullWidthCtaButton
          label="JOUER"
          onPress={() => navigation.navigate('Setup')}
          style={styles.homeButton}
          testID="home-play-button"
        />
      </View>
    </SafeAreaView>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    marginBottom: 32,
  },
  debugBadge: {
    position: 'absolute',
    top: 86,
  },
  actions: {
    width: '100%',
  },
  homeButton: {
    height: componentSizes.gameButtonHeight,
  },
});
