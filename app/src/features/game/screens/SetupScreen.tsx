import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { GameMode } from '../../../domain/game/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { AppHeader } from '../../../shared/components/AppHeader';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Setup'>;
type Step = 1 | 2 | 3 | 4;
type EndCondition = 'score' | 'rounds';
type ChoiceTone = 'primary' | 'secondary' | 'dark' | 'gradient';

const MIN_VALUE = 6;
const MAX_VALUE = 20;
const PICKER_ITEM_HEIGHT = 100;
const PICKER_HEIGHT = 480;
const PICKER_SELECTED_HEIGHT = 120;
const PICKER_VERTICAL_PADDING = (PICKER_HEIGHT - PICKER_ITEM_HEIGHT) / 2;
const PICKER_LINE_TOP = (PICKER_HEIGHT - PICKER_SELECTED_HEIGHT) / 2;
const PICKER_SELECTED_ROW_TOP = (PICKER_HEIGHT - PICKER_ITEM_HEIGHT) / 2;
const PICKER_UNIT_TOP = PICKER_SELECTED_ROW_TOP + 43;
const PICKER_UNIT_LEFT = 168;
const PICKER_VALUES = Array.from(
  { length: MAX_VALUE - MIN_VALUE + 1 },
  (_, index) => MIN_VALUE + index,
);
const SETUP_COLORS = {
  dark: '#28261F',
  darkSmooth: '#3B382E',
  primary: '#E7C241',
  secondary: '#41E79A',
  white: '#ECEBE8',
  textSmooth: '#949084',
} as const;
const SETUP_FONTS = {
  regular: 'GoogleSansFlex_400Regular',
  semibold: 'GoogleSansFlex_600SemiBold',
  bold: 'GoogleSansFlex_700Bold',
} as const;

export function SetupScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame, debugMode } = useGameStore();

  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [endCondition, setEndCondition] = useState<EndCondition>('score');
  const [value, setValue] = useState(13);
  const [vetosEnabled, setVetosEnabled] = useState(true);

  const title = useMemo(() => {
    switch (step) {
      case 1:
        return 'On joue à quoi?';
      case 2:
        return 'Et la fin?';
      case 3:
        return 'Combien?';
      case 4:
        return 'Vétos activés?';
    }
  }, [step]);

  const goBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep((current) => (current - 1) as Step);
  };

  const launch = (vetoOverride = vetosEnabled) => {
    if (!mode) return;
    resetGame();
    startGame({
      mode,
      winningScore: endCondition === 'score' ? value : 999,
      maxRounds: endCondition === 'rounds' ? value : null,
      vetosEnabled: mode === 'fantasy' ? vetoOverride : false,
    });
    navigation.navigate(debugMode && mode === 'fantasy' ? 'DebugRuleSelect' : 'Game');
  };

  const selectMode = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setStep(2);
  };

  const selectEndCondition = (selectedEndCondition: EndCondition) => {
    setEndCondition(selectedEndCondition);
    setValue(selectedEndCondition === 'rounds' ? 8 : 13);
    setStep(3);
  };

  const confirmValue = () => {
    if (mode === 'fantasy') {
      setStep(4);
      return;
    }
    launch();
  };

  const selectVetos = (enabled: boolean) => {
    setVetosEnabled(enabled);
    launch(enabled);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <SetupHeader title={title} onBack={goBack} />

      {step === 1 && (
        <View style={styles.choiceContent}>
          <ChoiceButton
            label="Pétanque normale"
            tone="dark"
            textTone="light"
            onPress={() => selectMode('simple')}
          />
          <ChoiceButton
            label="Pétanque Fantasy"
            tone="gradient"
            textTone="dark"
            onPress={() => selectMode('fantasy')}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.choiceContent}>
          <ChoiceButton
            label="Score à atteindre"
            tone="primary"
            textTone="dark"
            onPress={() => selectEndCondition('score')}
          />
          <ChoiceButton
            label="Nombre de mènes"
            tone="secondary"
            textTone="dark"
            onPress={() => selectEndCondition('rounds')}
          />
        </View>
      )}

      {step === 3 && (
        <>
          <View style={styles.valueContent}>
            <SetupValuePicker
              value={value}
              unit={endCondition === 'score' ? 'points' : 'mènes'}
              onChange={setValue}
            />
          </View>
          <BottomButton label="Valider" onPress={confirmValue} />
        </>
      )}

      {step === 4 && (
        <View style={styles.choiceContent}>
          <ChoiceButton
            label="Oui"
            tone="primary"
            textTone="dark"
            onPress={() => selectVetos(true)}
          />
          <ChoiceButton
            label="Non"
            tone="dark"
            textTone="light"
            onPress={() => selectVetos(false)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function SetupHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <AppHeader
      onBack={onBack}
      title={title}
      backgroundColor={SETUP_COLORS.dark}
      iconColor={SETUP_COLORS.textSmooth}
      textColor={SETUP_COLORS.white}
      backButtonTestID="setup-back-button"
      titleStyle={styles.headerTitle}
    />
  );
}

function ChoiceButton({
  label,
  tone,
  textTone,
  onPress,
}: {
  label: string;
  tone: ChoiceTone;
  textTone: 'dark' | 'light';
  onPress: () => void;
}) {
  const content = (
    <Text style={[styles.choiceLabel, textTone === 'light' && styles.choiceLabelLight]}>
      {label}
    </Text>
  );

  if (tone === 'gradient') {
    return (
      <Pressable
        style={styles.choiceGradientButton}
        onPress={onPress}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[SETUP_COLORS.primary, SETUP_COLORS.secondary]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.choiceButton}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.choiceButton, choiceToneStyles[tone]]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

function BottomButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={styles.bottomButton}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={styles.bottomButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function SetupValuePicker({
  value,
  unit,
  onChange,
}: {
  value: number;
  unit: string;
  onChange: (nextValue: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value((value - MIN_VALUE) * PICKER_ITEM_HEIGHT)).current;

  useEffect(() => {
    const offsetY = (value - MIN_VALUE) * PICKER_ITEM_HEIGHT;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: offsetY, animated: false });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT);
    const index = Math.max(0, Math.min(rawIndex, PICKER_VALUES.length - 1));
    const nextValue = PICKER_VALUES[index];
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <View style={styles.picker}>
      <View style={[styles.pickerLine, styles.pickerTopLine]} pointerEvents="none" />
      <View style={[styles.pickerLine, styles.pickerBottomLine]} pointerEvents="none" />
      <View
        style={styles.pickerUnitOverlay}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Text style={styles.pickerUnit}>{unit}</Text>
      </View>
      <Animated.ScrollView
        ref={scrollRef}
        testID="setup-value-picker"
        style={styles.pickerScroll}
        contentContainerStyle={styles.pickerContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={PICKER_ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {PICKER_VALUES.map((itemValue) => {
          const itemOffset = (itemValue - MIN_VALUE) * PICKER_ITEM_HEIGHT;
          const inputRange = [
            itemOffset - PICKER_ITEM_HEIGHT * 2,
            itemOffset - PICKER_ITEM_HEIGHT,
            itemOffset,
            itemOffset + PICKER_ITEM_HEIGHT,
            itemOffset + PICKER_ITEM_HEIGHT * 2,
          ];
          const color = scrollY.interpolate({
            inputRange,
            outputRange: [
              SETUP_COLORS.textSmooth,
              SETUP_COLORS.textSmooth,
              SETUP_COLORS.white,
              SETUP_COLORS.textSmooth,
              SETUP_COLORS.textSmooth,
            ],
            extrapolate: 'clamp',
          });
          const fontSize = scrollY.interpolate({
            inputRange,
            outputRange: [40, 48, 60, 48, 40],
            extrapolate: 'clamp',
          });
          const lineHeight = scrollY.interpolate({
            inputRange,
            outputRange: [68, 82, 102, 82, 68],
            extrapolate: 'clamp',
          });
          const opacity = scrollY.interpolate({
            inputRange,
            outputRange: [0.5, 1, 1, 1, 0.5],
            extrapolate: 'clamp',
          });
          const letterSpacing = scrollY.interpolate({
            inputRange,
            outputRange: [-1.6, -1.92, -2.4, -1.92, -1.6],
            extrapolate: 'clamp',
          });

          return (
            <View
              key={itemValue}
              style={styles.pickerOption}
            >
              <View style={styles.pickerSelectedRow}>
                <Animated.Text
                  style={[
                    styles.pickerText,
                    { color, fontSize, lineHeight, letterSpacing, opacity },
                  ]}
                >
                  {itemValue}
                </Animated.Text>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const choiceToneStyles: Record<Exclude<ChoiceTone, 'gradient'>, ViewStyle> = {
  primary: { backgroundColor: SETUP_COLORS.primary },
  secondary: { backgroundColor: SETUP_COLORS.secondary },
  dark: { backgroundColor: SETUP_COLORS.darkSmooth },
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: SETUP_COLORS.dark,
  },
  headerTitle: {
    fontFamily: SETUP_FONTS.bold,
    letterSpacing: -1.28,
  },
  choiceContent: {
    flex: 1,
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 24,
  },
  choiceGradientButton: {
    flex: 1,
    width: '100%',
  },
  choiceLabel: {
    color: SETUP_COLORS.dark,
    fontFamily: SETUP_FONTS.semibold,
    fontSize: 32,
    lineHeight: 54,
    letterSpacing: -1.28,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  choiceLabelLight: {
    color: SETUP_COLORS.white,
  },
  valueContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  picker: {
    height: PICKER_HEIGHT,
    width: 260,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  pickerScroll: {
    height: PICKER_HEIGHT,
    width: '100%',
  },
  pickerContent: {
    paddingVertical: PICKER_VERTICAL_PADDING,
  },
  pickerOption: {
    width: '100%',
    height: PICKER_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    color: SETUP_COLORS.textSmooth,
    fontFamily: SETUP_FONTS.bold,
    fontSize: 48,
    lineHeight: 82,
    letterSpacing: -1.92,
    textAlign: 'center',
    includeFontPadding: false,
  },
  pickerLine: {
    position: 'absolute',
    left: 70,
    width: 121,
    height: 2,
    backgroundColor: SETUP_COLORS.primary,
    zIndex: 2,
  },
  pickerTopLine: {
    top: PICKER_LINE_TOP,
  },
  pickerBottomLine: {
    top: PICKER_LINE_TOP + PICKER_SELECTED_HEIGHT,
  },
  pickerSelectedRow: {
    height: PICKER_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  pickerSelectedText: {
    color: SETUP_COLORS.white,
    fontFamily: SETUP_FONTS.bold,
    fontSize: 60,
    lineHeight: 102,
    letterSpacing: -2.4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  pickerUnitOverlay: {
    position: 'absolute',
    top: PICKER_UNIT_TOP,
    left: PICKER_UNIT_LEFT,
    zIndex: 3,
  },
  pickerUnit: {
    color: SETUP_COLORS.textSmooth,
    fontFamily: SETUP_FONTS.regular,
    fontSize: 24,
    lineHeight: 41,
    letterSpacing: -0.96,
    includeFontPadding: false,
  },
  bottomButton: {
    width: '100%',
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 24,
    backgroundColor: SETUP_COLORS.primary,
  },
  bottomButtonLabel: {
    color: SETUP_COLORS.dark,
    fontFamily: SETUP_FONTS.semibold,
    fontSize: 32,
    lineHeight: 54,
    letterSpacing: -1.28,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
