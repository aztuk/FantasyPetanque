import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
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
  /** ScrollView content — no horizontal padding applied (handle internally) */
  children?: React.ReactNode;

  /** testID applied to the internal ScrollView for testing */
  scrollTestID?: string;

  /**
   * Drawer slots — rendered top-to-bottom with 4px gap between each present slot:
   *   drawerBonusMalus → drawerMeneScore → drawerTotalScore → drawerConfirmButton
   *
   * When collapsible=true:
   *   - sticky   : drawerTotalScore + drawerConfirmButton (always visible at bottom)
   *   - collapses: drawerBonusMalus + drawerMeneScore    (slide behind sticky on content touch)
   *   - tap on drawerTotalScore expands the drawer
   */
  drawerBonusMalus?: React.ReactNode;
  drawerMeneScore?: React.ReactNode;
  drawerTotalScore?: React.ReactNode;
  drawerConfirmButton?: React.ReactNode;

  /** Enables the collapsible drawer animation. Requires at least one collapsible slot
   *  (bonusMalus or meneScore) AND at least one sticky slot (totalScore or confirmButton). */
  collapsible?: boolean;
}

export function GameScreenLayout({
  children,
  scrollTestID,
  drawerBonusMalus,
  drawerMeneScore,
  drawerTotalScore,
  drawerConfirmButton,
  collapsible = false,
}: GameScreenLayoutProps) {
  const navigation = useNavigation<Nav>();
  const { resetGame } = useGameStore();
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  const hasCollapsibleSlots = !!(drawerBonusMalus || drawerMeneScore);
  const hasStickySlots = !!(drawerTotalScore || drawerConfirmButton);
  const isCollapsible = collapsible && hasCollapsibleSlots && hasStickySlots;

  const expandedRef = useRef(true);
  const colTranslate = useRef(new Animated.Value(0)).current;
  const contentPad = useRef(new Animated.Value(0)).current;

  const colHeightRef = useRef(0);
  const stickyHeightRef = useRef(0);
  const [stickyHeight, setStickyHeight] = useState(0);

  const collapse = () => {
    if (!expandedRef.current || !isCollapsible) return;
    expandedRef.current = false;
    Animated.parallel([
      Animated.timing(colTranslate, {
        toValue: colHeightRef.current + 4,
        duration: 280,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentPad, {
        toValue: 0,
        duration: 280,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const expand = () => {
    if (expandedRef.current) return;
    expandedRef.current = true;
    Animated.parallel([
      Animated.timing(colTranslate, {
        toValue: 0,
        duration: 280,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(contentPad, {
        toValue: colHeightRef.current,
        duration: 280,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onColLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h === colHeightRef.current) return;
    colHeightRef.current = h;
    if (expandedRef.current) contentPad.setValue(h);
  };

  const onStickyLayout = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h === stickyHeightRef.current) return;
    stickyHeightRef.current = h;
    setStickyHeight(h);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <View style={styles.container}>

        {/* Back button — always fixed top-left */}
        <GameTopBar
          onCancel={() => setShowCancelSheet(true)}
          style={styles.topBar}
          floating
        />

        {/* Scrollable content — paddingTop=80 for top bar, no h-padding */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={isCollapsible ? collapse : undefined}
          testID={scrollTestID}
        >
          <Animated.View
            style={[styles.scrollInner, { paddingBottom: contentPad }]}
            onTouchStart={isCollapsible ? collapse : undefined}
          >
            {children}
          </Animated.View>
        </ScrollView>

        {/* Collapsible drawer panel — absolute, sits above sticky, slides on collapse */}
        {hasCollapsibleSlots && (
          <Animated.View
            style={[
              styles.drawerCollapsible,
              { bottom: stickyHeight + (hasStickySlots ? 4 : 0) },
              { transform: [{ translateY: colTranslate }] },
            ]}
            onLayout={onColLayout}
          >
            {drawerBonusMalus}
            {drawerMeneScore}
          </Animated.View>
        )}

        {/* Sticky drawer panel — flex child, always visible at bottom */}
        {hasStickySlots && (
          <View style={styles.drawerSticky} onLayout={onStickyLayout}>
            {isCollapsible && drawerTotalScore ? (
              <Pressable onPress={expand}>{drawerTotalScore}</Pressable>
            ) : (
              drawerTotalScore
            )}
            {drawerConfirmButton}
          </View>
        )}

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
  drawerCollapsible: {
    position: 'absolute',
    left: 0,
    right: 0,
    gap: 4,
  },
  drawerSticky: {
    width: '100%',
    gap: 4,
  },
});
