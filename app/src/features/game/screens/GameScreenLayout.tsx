import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { colors } from '../../../shared/constants';
import { CancelGameSheet } from '../../../shared/components/CancelGameSheet';
import { GameTopBar } from '../components/GameTopBar';
import { useGameStore } from '../state/gameStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export interface GameScreenLayoutProps {
  children?: React.ReactNode;
  scrollTestID?: string;
  drawer?: React.ReactNode;
}

export function GameScreenLayout({
  children,
  scrollTestID,
  drawer,
}: GameScreenLayoutProps) {
  const navigation = useNavigation<Nav>();
  const { resetGame } = useGameStore();
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <View style={styles.container}>
        <GameTopBar
          onCancel={() => setShowCancelSheet(true)}
          style={styles.topBar}
          floating
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          testID={scrollTestID}
        >
          <View style={styles.scrollInner}>
            {children}
          </View>
        </ScrollView>

        {drawer}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 80,
  },
  scrollInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
});
