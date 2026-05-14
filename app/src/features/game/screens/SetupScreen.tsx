import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { GameMode } from '../../../domain/game/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { ButtonIcon } from '../../../shared/components/ButtonIcon';
import { SetupOption } from '../../../shared/components/SetupOption';
import { WheelPicker } from '../../../shared/components/WheelPicker';
import { colors, componentSizes, figmaTextStyles, spacing } from '../../../shared/constants';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Setup'>;
type Step = 1 | 2 | 3 | 4;
type EndCondition = 'score' | 'rounds';

const MIN_VALUE = 6;
const MAX_VALUE = 20;

export function SetupScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame, debugMode } = useGameStore();

  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [endCondition, setEndCondition] = useState<EndCondition>('score');
  const [value, setValue] = useState(13);
  const [vetosEnabled, setVetosEnabled] = useState(true);

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
    <View style={styles.screen}>
      {step === 1 && (
        <View style={styles.choiceContent}>
          <SetupOption
            title="Pétanque normale"
            description="Aidez vous de l’application pour compter les points"
            onPress={() => selectMode('simple')}
            style={styles.choiceOption}
            testID="setup-mode-simple-option"
          />
          <SetupOption
            title="Pétanque Fantasy"
            description="Ajoutez des règles spéciales tirées à chaque mène"
            onPress={() => selectMode('fantasy')}
            style={styles.choiceOption}
            testID="setup-mode-fantasy-option"
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.choiceContent}>
          <SetupOption
            title="Nombre de mènes"
            description="La partie se termine après un nombre de mènes défini"
            onPress={() => selectEndCondition('rounds')}
            style={styles.choiceOption}
            testID="setup-end-rounds-option"
          />
          <SetupOption
            title="Score à atteindre"
            description="La première équipe au score cible gagne la partie"
            onPress={() => selectEndCondition('score')}
            style={styles.choiceOption}
            testID="setup-end-score-option"
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
          <SetupOption
            title="Non"
            description="Jouer sans véto pendant la partie"
            onPress={() => selectVetos(false)}
            style={styles.choiceOption}
            testID="setup-veto-disabled-option"
          />
          <SetupOption
            title="Oui"
            description="Autoriser les équipes à refuser une règle"
            onPress={() => selectVetos(true)}
            style={styles.choiceOption}
            testID="setup-veto-enabled-option"
          />
        </View>
      )}

      <SafeAreaView
        style={styles.headerSafeArea}
        edges={['top']}
        pointerEvents="box-none"
        testID="setup-head-safe-area"
      >
        <SetupBackButton onPress={goBack} />
      </SafeAreaView>
    </View>
  );
}

function SetupBackButton({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.header} testID="setup-head">
      <ButtonIcon
        onPress={onPress}
        accessibilityLabel="Retour"
        testID="setup-back-button"
      />
    </View>
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
  return (
    <WheelPicker
      min={MIN_VALUE}
      max={MAX_VALUE}
      value={value}
      unit={unit}
      onChange={onChange}
      testID="setup-value-picker"
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 4,
  },
  header: {
    padding: spacing[4],
  },
  choiceContent: {
    flex: 1,
    width: '100%',
  },
  choiceOption: {
    flex: 1,
    minHeight: 0,
  },
  valueContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButton: {
    width: '100%',
    height: componentSizes.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    backgroundColor: colors.primary,
  },
  bottomButtonLabel: {
    ...figmaTextStyles.buttonCTA,
    color: colors.dark,
    textAlign: 'center',
    includeFontPadding: false,
  },
});
