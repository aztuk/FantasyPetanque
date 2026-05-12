import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { GameMode } from '../../../domain/game/models';
import { WheelPicker } from '../../../shared/components/WheelPicker';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors, typography, radius } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Setup'>;
type Step = 1 | 2 | 3 | 4;
type EndCondition = 'score' | 'rounds';

export function SetupScreen() {
  const navigation = useNavigation<Nav>();
  const { startGame, resetGame, debugMode } = useGameStore();

  const [step, setStep] = useState<Step>(1);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [endCondition, setEndCondition] = useState<EndCondition>('score');
  const [value, setValue] = useState(13);
  const [vetosEnabled, setVetosEnabled] = useState(true);

  const goBack = () => setStep((s) => (s - 1) as Step);

  const handleStep1Next = () => setStep(2);

  const handleStep2Next = () => {
    setValue(endCondition === 'rounds' ? 8 : 13);
    setStep(3);
  };

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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {step > 1 && (
          <TouchableOpacity style={styles.back} onPress={goBack}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          {step === 1 && <StepMode selected={mode} onSelect={setMode} />}
          {step === 2 && <StepCondition selected={endCondition} onSelect={handleEndConditionSelect} />}
          {step === 3 && <StepValue endCondition={endCondition} value={value} onChange={setValue} />}
          {step === 4 && <StepVeto enabled={vetosEnabled} onToggle={setVetosEnabled} />}
        </View>

        <View style={styles.bottomBar}>
          {step === 1 && (
            <PrimaryButton label="Continuer" onPress={handleStep1Next} disabled={mode === null} />
          )}
          {step === 2 && (
            <PrimaryButton label="Continuer" onPress={handleStep2Next} />
          )}
          {step === 3 && (
            <PrimaryButton label={mode === 'fantasy' ? 'Continuer' : 'Jouer'} onPress={handleStep3Next} />
          )}
          {step === 4 && <PrimaryButton label="Jouer" onPress={launch} />}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ─── Option row — sélection sans carte ─────────────────────────────────────── */

function OptionRow({
  title,
  description,
  selected,
  onPress,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.optionBar, selected && styles.optionBarActive]} />
      <View style={styles.optionBody}>
        <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>{title}</Text>
        <Text style={styles.optionDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Steps ──────────────────────────────────────────────────────────────────── */

function StepMode({ selected, onSelect }: { selected: GameMode | null; onSelect: (m: GameMode) => void }) {
  return (
    <>
      <Text style={styles.stepTitle}>Quel mode ?</Text>
      <OptionRow
        title="Simple"
        description="Score classique — la première équipe à atteindre le score cible gagne."
        selected={selected === 'simple'}
        onPress={() => onSelect('simple')}
      />
      <View style={styles.separator} />
      <OptionRow
        title="Fantasy"
        description="Une règle spéciale est tirée à chaque mène — bonus, malus, chaos garanti."
        selected={selected === 'fantasy'}
        onPress={() => onSelect('fantasy')}
      />
    </>
  );
}

function StepCondition({ selected, onSelect }: { selected: EndCondition; onSelect: (c: EndCondition) => void }) {
  return (
    <>
      <Text style={styles.stepTitle}>Condition de fin</Text>
      <OptionRow
        title="Score à atteindre"
        description="La première équipe à atteindre le score cible remporte la partie."
        selected={selected === 'score'}
        onPress={() => onSelect('score')}
      />
      <View style={styles.separator} />
      <OptionRow
        title="Nombre de mènes"
        description="La partie se termine après un nombre fixe de mènes. Le plus de points gagne."
        selected={selected === 'rounds'}
        onPress={() => onSelect('rounds')}
      />
    </>
  );
}

function StepValue({ endCondition, value, onChange }: { endCondition: EndCondition; value: number; onChange: (v: number) => void }) {
  const isScore = endCondition === 'score';
  return (
    <>
      <Text style={styles.stepTitle}>{isScore ? 'Score cible' : 'Nombre de mènes'}</Text>
      <Text style={styles.stepSubtitle}>
        {isScore ? 'La première équipe à ce score remporte la partie.' : 'La partie dure ce nombre de mènes.'}
      </Text>
      <View style={styles.pickerRow}>
        <WheelPicker min={6} max={20} value={value} onChange={onChange} />
        <Text style={styles.pickerUnit}>{isScore ? 'points' : 'mènes'}</Text>
      </View>
    </>
  );
}

function StepVeto({ enabled, onToggle }: { enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <>
      <Text style={styles.stepTitle}>Véto</Text>
      <Text style={styles.stepSubtitle}>
        Chaque équipe peut refuser une règle tirée, une seule fois par partie.
      </Text>
      <TouchableOpacity style={styles.toggleRow} onPress={() => onToggle(!enabled)} activeOpacity={0.7}>
        <View style={[styles.optionBar, enabled && styles.optionBarActive]} />
        <View style={styles.optionBody}>
          <Text style={[styles.optionTitle, enabled && styles.optionTitleActive]}>
            {enabled ? 'Activé' : 'Désactivé'}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: colors.surface2, true: colors.accent }}
          thumbColor={colors.textPrimary}
        />
      </TouchableOpacity>
    </>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 32, paddingTop: 16 },
  back: { marginBottom: 32 },
  backText: { color: colors.textSecondary, fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  content: { flex: 1, justifyContent: 'center' },
  bottomBar: { paddingTop: 16 },

  stepTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    marginBottom: 36,
    lineHeight: 42,
  },
  stepSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 27,
    marginBottom: 40,
    marginTop: -20,
  },

  // Option row (no card)
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 20,
  },
  optionBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: colors.surface2,
    marginRight: 20,
    marginTop: 4,
  },
  optionBarActive: { backgroundColor: colors.accent },
  optionBody: { flex: 1 },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    marginBottom: 6,
  },
  optionTitleActive: { color: colors.accent },
  optionDesc: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 26,
  },

  separator: { height: 1, backgroundColor: colors.surface2, marginLeft: 23 },

  // Picker
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 8 },
  pickerUnit: { color: colors.textSecondary, fontSize: typography.size.base, fontWeight: typography.weight.semibold },

  // Toggle veto
  toggleRow: { flexDirection: 'row', alignItems: 'center' },
});
