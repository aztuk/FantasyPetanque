import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RankingSport, RANKING_SPORTS } from '../../../domain/ranking/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { AppHeader } from '../../../shared/components/AppHeader';
import { colors, componentSizes, figmaTextStyles, spacing } from '../../../shared/constants';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Ranking'>;

const SPORT_LABELS: Record<RankingSport, string> = {
  petanque: 'Pétanque',
  flechettes: 'Fléchettes',
};

export function RankingScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedSport, setSelectedSport] = useState<RankingSport>('petanque');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader
        title="Classements"
        onBack={navigation.goBack}
        backButtonTestID="ranking-back-button"
        testID="ranking-head"
      />

      <View style={styles.content}>
        <View style={styles.tabs} testID="ranking-sport-tabs">
          {RANKING_SPORTS.map((sport) => {
            const selected = sport === selectedSport;

            return (
              <Pressable
                key={sport}
                onPress={() => setSelectedSport(sport)}
                style={[styles.tab, selected && styles.tabSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                testID={`ranking-${sport}-tab`}
              >
                <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                  {SPORT_LABELS[sport]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.panel} testID="ranking-skeleton-panel">
          <Text style={styles.panelTitle}>
            Classement {SPORT_LABELS[selectedSport]}
          </Text>
          <Text style={styles.panelText}>
            Les joueurs apparaîtront ici dès que la page classement sera branchée.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    gap: spacing[6],
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  tab: {
    flex: 1,
    minHeight: componentSizes.drawerActionHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.darkSmooth,
  },
  tabSelected: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
  },
  tabLabelSelected: {
    color: colors.dark,
  },
  panel: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing[4],
  },
  panelTitle: {
    ...figmaTextStyles.pageTitles,
    color: colors.primary,
    includeFontPadding: false,
    textAlign: 'center',
  },
  panelText: {
    ...figmaTextStyles.bodyMd,
    color: colors.white,
    includeFontPadding: false,
    textAlign: 'center',
  },
});
