import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { GameMode } from '../../../domain/game/models';
import { WheelPicker } from '../../../shared/components/WheelPicker';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import {
  BACKGROUND,
  SURFACE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ACCENT,
} from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Setup'>;
type Step = 1 | 2 | 3 | 4;
type EndCondition = 'score' | 'rounds';

export function SetupScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame, debugMode } = useGameStore();

  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [endCondition, setEndCondition] = useState<EndCondition | null>(null);
  const [value, setValue] = useState(13);
  const [vetosEnabled, setVetosEnabled] = useState(true);

  const goBack = () => setStep((s) => (s - 1) as Step);

  const handleStep1Next = () => {
    if (endCondition === null) setEndCondition(mode === 'fantasy' ? 'rounds' : 'score');
    setStep(2);
  };

  const handleStep2Next = () => {
    // Reset to sensible default for the chosen condition
    setValue(endCondition === 'rounds' ? 8 : 13);
    setStep(3);
  };

  // When end condition changes, update the picker default
  const handleEndConditionSelect = (c: EndCondition) => {
    setEndCondition(c);
    setValue(c === 'rounds' ? 8 : 13);
  };

  const handleStep3Next = () => {
    if (mode === 'fantasy') {
      setStep(4);
    } else {
      launch();
    }
  };

  const launch = () => {
    resetGame();
    startGame({
      mode: mode!,
      winningScore: endCondition === 'score' ? value : 999,
      maxRounds: endCondition === 'rounds' ? value : null,
      vetosEnabled: mode === 'fantasy' ? vetosEnabled : false,
    });
    navigation.navigate(debugMode && mode === 'fantasy' ? 'DebugRuleSelect' : 'Game');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Back button */}
        {step > 1 && (
          <TouchableOpacity style={styles.back} onPress={goBack}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        )}

        {/* Content area */}
        <View style={styles.content}>
          {step === 1 && (
            <StepMode selected={mode} onSelect={setMode} />
          )}
          {step === 2 && (
            <StepCondition selected={endCondition} onSelect={handleEndConditionSelect} />
          )}
          {step === 3 && endCondition !== null && (
            <StepValue endCondition={endCondition} value={value} onChange={setValue} />
          )}
          {step === 4 && (
            <StepVeto enabled={vetosEnabled} onToggle={setVetosEnabled} />
          )}
        </View>

        {/* Button anchored at bottom */}
        <View style={styles.bottomBar}>
          {step === 1 && (
            <PrimaryButton
              label="Continuer"
              onPress={handleStep1Next}
              disabled={mode === null}
            />
          )}
          {step === 2 && (
            <PrimaryButton
              label="Continuer"
              onPress={handleStep2Next}
              disabled={endCondition === null}
            />
          )}
          {step === 3 && (
            <PrimaryButton
              label={mode === 'fantasy' ? 'Continuer' : 'Jouer'}
              onPress={handleStep3Next}
            />
          )}
          {step === 4 && (
            <PrimaryButton label="Jouer" onPress={launch} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ─── Step 1: Mode ─────────────────────────────────────────────────────────── */

function StepMode({
  selected,
  onSelect,
}: {
  selected: GameMode | null;
  onSelect: (m: GameMode) => void;
}) {
  return (
    <>
      <Text style={styles.stepTitle}>Quel mode ?</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'simple' && styles.cardSelected]}
        onPress={() => onSelect('simple')}
        activeOpacity={0.8}
      >
        <Text style={[styles.cardTitle, selected === 'simple' && styles.cardTitleSelected]}>
          Simple
        </Text>
        <Text style={styles.cardDesc}>
          Score classique — la première équipe à atteindre le score cible gagne.
        </Text>
      </TouchableOpacity>

      <View style={{ height: 16 }} />

      <TouchableOpacity
        style={[styles.card, selected === 'fantasy' && styles.cardSelected]}
        onPress={() => onSelect('fantasy')}
        activeOpacity={0.8}
      >
        <Text style={[styles.cardTitle, selected === 'fantasy' && styles.cardTitleSelected]}>
          Fantasy
        </Text>
        <Text style={styles.cardDesc}>
          Une règle spéciale est tirée à chaque mène — bonus, malus, chaos garanti.
        </Text>
      </TouchableOpacity>
    </>
  );
}

/* ─── Step 2: Condition de fin ──────────────────────────────────────────────── */

function StepCondition({
  selected,
  onSelect,
}: {
  selected: EndCondition | null;
  onSelect: (c: EndCondition) => void;
}) {
  return (
    <>
      <Text style={styles.stepTitle}>Condition de fin</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'score' && styles.cardSelected]}
        onPress={() => onSelect('score')}
        activeOpacity={0.8}
      >
        <Text style={[styles.cardTitle, selected === 'score' && styles.cardTitleSelected]}>
          Score à atteindre
        </Text>
        <Text style={styles.cardDesc}>
          La première équipe à atteindre le score cible remporte la partie.
        </Text>
      </TouchableOpacity>

      <View style={{ height: 16 }} />

      <TouchableOpacity
        style={[styles.card, selected === 'rounds' && styles.cardSelected]}
        onPress={() => onSelect('rounds')}
        activeOpacity={0.8}
      >
        <Text style={[styles.cardTitle, selected === 'rounds' && styles.cardTitleSelected]}>
          Nombre de mènes
        </Text>
        <Text style={styles.cardDesc}>
          La partie se termine après un nombre fixe de mènes. L'équipe avec le plus de points gagne.
        </Text>
      </TouchableOpacity>
    </>
  );
}

/* ─── Step 3: Valeur (picker) ───────────────────────────────────────────────── */

function StepValue({
  endCondition,
  value,
  onChange,
}: {
  endCondition: EndCondition;
  value: number;
  onChange: (v: number) => void;
}) {
  const isScore = endCondition === 'score';
  return (
    <>
      <Text style={styles.stepTitle}>
        {isScore ? 'Score à atteindre' : 'Nombre de mènes'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {isScore
          ? 'La première équipe à ce score remporte la partie.'
          : 'La partie dure ce nombre de mènes.'}
      </Text>

      <View style={styles.pickerRow}>
        <WheelPicker min={6} max={20} value={value} onChange={onChange} />
        <Text style={styles.pickerUnit}>{isScore ? 'points' : 'mènes'}</Text>
      </View>
    </>
  );
}

/* ─── Step 4: Véto ──────────────────────────────────────────────────────────── */

function StepVeto({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <>
      <Text style={styles.stepTitle}>Véto</Text>
      <Text style={styles.stepSubtitle}>
        Chaque équipe peut refuser une règle tirée, une seule fois par partie.
      </Text>

      <TouchableOpacity
        style={[styles.card, enabled && styles.cardSelected]}
        onPress={() => onToggle(!enabled)}
        activeOpacity={0.8}
      >
        <View style={styles.toggleRow}>
          <Text style={[styles.cardTitle, enabled && styles.cardTitleSelected]}>
            {enabled ? 'Activé' : 'Désactivé'}
          </Text>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: SURFACE, true: ACCENT }}
            thumbColor={TEXT_PRIMARY}
          />
        </View>
      </TouchableOpacity>
    </>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  back: {
    marginBottom: 24,
  },
  backText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  bottomBar: {
    paddingTop: 16,
  },
  stepTitle: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  stepSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  // Cards
  card: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: ACCENT,
  },
  cardTitle: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardTitleSelected: {
    color: ACCENT,
  },
  cardDesc: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  // Picker
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 8,
  },
  pickerUnit: {
    color: TEXT_SECONDARY,
    fontSize: 18,
    fontWeight: '600',
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
