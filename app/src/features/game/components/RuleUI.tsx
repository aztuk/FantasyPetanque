import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { RoundState } from '../../../domain/game/models';
import { useGameStore } from '../state/gameStore';
import { TeamButton } from '../../../shared/components/TeamButton';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors, typography, radius, TEAM_COLORS } from '../../../shared/constants';
import { CONTRAT_MISSIONS } from '../../../data/rules/rules';

interface Props {
  round: RoundState;
}

export function RuleUI({ round }: Props) {
  const rule = round.rule;
  if (!rule) return null;

  switch (rule.uiType) {
    case 'bonus-buttons': return <BonusButtonsUI round={round} />;
    case 'malus-buttons': return <MalusButtonsUI round={round} />;
    case 'cochonnet-sorti': return <SortieDePorc round={round} />;
    case 'contrat': return <ContratResolutionUI round={round} />;
    case 'assurance-vie': return <AssuranceVieReminderUI round={round} />;
    case 'frontiere': return <FrontiereReminderUI round={round} />;
    case 'casino': return <CasinoUI round={round} />;
    case 'prediction': return <PredictionUI round={round} />;
    case 'totem': return <TotemUI round={round} />;
    case 'impair': return <ImpairUI />;
    default: return null;
  }
}

export function RuleSetupUI({ round }: Props) {
  const rule = round.rule;
  if (!rule) return null;

  switch (rule.uiType) {
    case 'contrat': return <ContratSetupUI round={round} />;
    case 'assurance-vie': return <AssuranceVieSetupUI round={round} />;
    case 'frontiere': return <FrontiereSetupUI round={round} />;
    default: return null;
  }
}

/* ─── Section wrapper — sans fond ───────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/* ─── Composants ─────────────────────────────────────────────────────────────── */

function BonusButtonsUI({ round }: Props) {
  const { addBonus, removeBonus } = useGameStore();
  const ruleId = round.rule!.id as 'gauche-caviar' | 'les-extremes' | 'king-of-the-hill';

  const getBonusState = (team: 'blue' | 'red'): boolean | number => {
    if (ruleId === 'king-of-the-hill') return round.kingBonus[team];
    if (ruleId === 'gauche-caviar') return round.gaucheBonus[team];
    if (ruleId === 'les-extremes') return round.extremesBonus[team];
    return false;
  };

  const getBonusLabel = (): string => {
    if (ruleId === 'king-of-the-hill') return 'Boule gagnante dans zone +1';
    if (ruleId === 'gauche-caviar') return 'Tir réussi +1';
    if (ruleId === 'les-extremes') return 'Boule dans zone +1';
    return '+1';
  };

  return (
    <Section title="Bonus">
      {(['blue', 'red'] as const).map((team) => {
        const bonusState = getBonusState(team);
        const count = typeof bonusState === 'number' ? bonusState : (bonusState ? 1 : 0);
        const max = round.rule!.maxBonusPerTeam ?? 1;

        return (
          <View key={team} style={styles.teamRow}>
            <TeamButton team={team} label={getBonusLabel()} onPress={() => addBonus(team, ruleId)} disabled={count >= max} />
            <TouchableOpacity style={[styles.undoBtn, count === 0 && styles.disabledEl]} onPress={() => removeBonus(team, ruleId)} disabled={count === 0}>
              <Text style={styles.undoText}>Annuler</Text>
            </TouchableOpacity>
            {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>+{count}</Text>}
          </View>
        );
      })}
    </Section>
  );
}

function MalusButtonsUI({ round }: Props) {
  const { addCensureMalus, removeCensureMalus, setBouleMauditeHit } = useGameStore();
  const ruleId = round.rule!.id;

  if (ruleId === 'censure') {
    return (
      <Section title="Malus">
        {(['blue', 'red'] as const).map((team) => {
          const count = round.censureMalus[team];
          const max = round.rule!.maxMalusPerTeam ?? 3;
          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton team={team} label="A parlé -1" onPress={() => addCensureMalus(team)} disabled={count >= max} />
              <TouchableOpacity style={[styles.undoBtn, count === 0 && styles.disabledEl]} onPress={() => removeCensureMalus(team)} disabled={count === 0}>
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>{-count}</Text>}
            </View>
          );
        })}
      </Section>
    );
  }

  if (ruleId === 'boule-maudite') {
    return (
      <Section title="Malus">
        {(['blue', 'red'] as const).map((team) => {
          const hit = round.boucleMauditeHit[team];
          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton team={team} label="A touché la boule -1" onPress={() => setBouleMauditeHit(team, true)} disabled={hit} />
              <TouchableOpacity style={[styles.undoBtn, !hit && styles.disabledEl]} onPress={() => setBouleMauditeHit(team, false)} disabled={!hit}>
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {hit && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>-1</Text>}
            </View>
          );
        })}
      </Section>
    );
  }

  return null;
}

function SortieDePorc({ round }: Props) {
  const { setSortieDePorc } = useGameStore();
  return (
    <Section title="Action">
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton
            key={team}
            team={team}
            label={round.sortieDePorc === team ? '✓ Cochonnet sorti +6' : 'Cochonnet sorti +6'}
            onPress={() => setSortieDePorc(round.sortieDePorc === team ? null : team)}
          />
        ))}
      </View>
      {round.sortieDePorc && (
        <Text style={styles.note}>Le score normal sera ignoré. La mène sera terminée avec 6 points directs.</Text>
      )}
    </Section>
  );
}

function ContratSetupUI({ round }: Props) {
  const { selectContratMission, clearContratMission } = useGameStore();
  const bothSelected = round.contratMission.blue !== null && round.contratMission.red !== null;

  return (
    <Section title="Mission">
      {CONTRAT_MISSIONS.map((mission, idx) => (
        <View key={idx} style={styles.missionRow}>
          <TouchableOpacity
            style={[styles.missionBtn, { backgroundColor: TEAM_COLORS.blue }, round.contratMission.blue === idx && styles.missionSelected, round.contratMission.blue !== null && round.contratMission.blue !== idx && styles.disabledEl]}
            onPress={() => round.contratMission.blue === idx ? clearContratMission('blue') : selectContratMission('blue', idx)}
          >
            <Text style={styles.missionBtnLabel}>B</Text>
          </TouchableOpacity>
          <Text style={styles.missionText}>{mission}</Text>
          <TouchableOpacity
            style={[styles.missionBtn, { backgroundColor: TEAM_COLORS.red }, round.contratMission.red === idx && styles.missionSelected, round.contratMission.red !== null && round.contratMission.red !== idx && styles.disabledEl]}
            onPress={() => round.contratMission.red === idx ? clearContratMission('red') : selectContratMission('red', idx)}
          >
            <Text style={styles.missionBtnLabel}>R</Text>
          </TouchableOpacity>
        </View>
      ))}
      {bothSelected && (
        <Text style={styles.note}>Les missions sont choisies. Les réussites seront cochées pendant la mène.</Text>
      )}
    </Section>
  );
}

function ContratResolutionUI({ round }: Props) {
  const { setContratSuccess } = useGameStore();
  const blueMission = round.contratMission.blue;
  const redMission = round.contratMission.red;

  if (blueMission === null || redMission === null) {
    return null;
  }

  return (
    <Section title="Mission">
      <Text style={styles.note}>
        Bleu : {CONTRAT_MISSIONS[blueMission]}{'\n'}
        Rouge : {CONTRAT_MISSIONS[redMission]}
      </Text>
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton
            key={team}
            team={team}
            label={round.contratSuccess[team] ? 'Mission réussie' : 'Mission réussie +2'}
            onPress={() => setContratSuccess(team, !round.contratSuccess[team])}
          />
        ))}
      </View>
    </Section>
  );
}

function AssuranceVieSetupUI({ round }: Props) {
  const { toggleAssurance } = useGameStore();
  return (
    <Section title="Configuration">
      <Text style={styles.note}>Perdre = +1, gagner = -1 sur les points normaux.</Text>
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton key={team} team={team} label={round.assurance[team] ? '✓ Assuré' : 'Prendre assurance'} onPress={() => toggleAssurance(team)} />
        ))}
      </View>
    </Section>
  );
}

function AssuranceVieReminderUI({ round }: Props) {
  const activeTeams = (['blue', 'red'] as const)
    .filter((team) => round.assurance[team])
    .map((team) => (team === 'blue' ? 'Bleu' : 'Rouge'));

  return (
    <Section title="Assurance">
      <Text style={styles.note}>
        {activeTeams.length > 0
          ? `Assurance active : ${activeTeams.join(', ')}.`
          : 'Aucune assurance prise.'}
        {'\n'}Perdre = +1, gagner = -1 sur les points normaux.
      </Text>
    </Section>
  );
}

function FrontiereSetupUI({ round }: Props) {
  const { setFrontiereChoice } = useGameStore();
  const bothChosen = round.frontiereChoice.blue !== null && round.frontiereChoice.red !== null;

  return (
    <Section title="Côté">
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} :</Text>
          <TouchableOpacity style={[styles.sideBtn, round.frontiereChoice[team] === 'left' && { backgroundColor: TEAM_COLORS[team] }]} onPress={() => setFrontiereChoice(team, 'left')}>
            <Text style={styles.sideBtnLabel}>← Gauche</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sideBtn, round.frontiereChoice[team] === 'right' && { backgroundColor: TEAM_COLORS[team] }]} onPress={() => setFrontiereChoice(team, 'right')}>
            <Text style={styles.sideBtnLabel}>Droite →</Text>
          </TouchableOpacity>
        </View>
      ))}
      {bothChosen && <Text style={styles.note}>Seules les boules du bon côté peuvent marquer.</Text>}
    </Section>
  );
}

function FrontiereReminderUI({ round }: Props) {
  const formatChoice = (choice: 'left' | 'right' | null) => {
    if (choice === 'left') return 'gauche';
    if (choice === 'right') return 'droite';
    return 'non choisi';
  };
  const blueChoice = formatChoice(round.frontiereChoice.blue);
  const redChoice = formatChoice(round.frontiereChoice.red);

  return (
    <Section title="Côté">
      <Text style={styles.note}>
        Bleu joue à {blueChoice}. Rouge joue à {redChoice}.{'\n'}
        Seules les boules du bon côté peuvent marquer.
      </Text>
    </Section>
  );
}

function CasinoUI({ round }: Props) {
  const { setCasinoBet, setCasinoWinner } = useGameStore();
  const scores = useGameStore((s) => s.scores);
  const [betInput, setBetInput] = useState<Record<'blue' | 'red', string>>({ blue: String(round.casinoBets.blue), red: String(round.casinoBets.red) });

  const handleBet = (team: 'blue' | 'red', val: string) => {
    setBetInput((prev) => ({ ...prev, [team]: val }));
    const num = parseInt(val, 10);
    if (!isNaN(num)) setCasinoBet(team, num);
  };

  if (!round.casinoWinner) {
    return (
      <Section title="Mise">
        {(['blue', 'red'] as const).map((team) => (
          <View key={team} style={styles.teamRow}>
            <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} (max {scores[team]}) :</Text>
            <TextInput style={styles.betInput} keyboardType="number-pad" value={betInput[team]} onChangeText={(v) => handleBet(team, v)} maxLength={3} />
          </View>
        ))}
        <Text style={styles.note}>Pas de score normal. Désignez le gagnant à la fin de la mène.</Text>
        <View style={styles.row}>
          {(['blue', 'red'] as const).map((team) => (
            <TeamButton key={team} team={team} label="Gagne la mène" onPress={() => setCasinoWinner(team)} />
          ))}
        </View>
      </Section>
    );
  }

  return (
    <Section title="Résultat">
      <Text style={styles.note}>
        {round.casinoWinner === 'blue' ? 'Bleu' : 'Rouge'} gagne !{'\n'}
        Bleu mise : {round.casinoBets.blue} — Rouge mise : {round.casinoBets.red}
      </Text>
    </Section>
  );
}

function PredictionUI({ round }: Props) {
  const { setPrediction } = useGameStore();
  return (
    <Section title="Valeurs">
      <Text style={styles.note}>Prédire de combien de points vous allez gagner (1 à 6). Si réussi, l'adversaire perd ce nombre de points.</Text>
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>{team === 'blue' ? 'Bleu' : 'Rouge'} :</Text>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <TouchableOpacity key={n} style={[styles.predBtn, round.predictionValues[team] === n && { backgroundColor: TEAM_COLORS[team] }]} onPress={() => setPrediction(team, round.predictionValues[team] === n ? null : n)}>
              <Text style={styles.predBtnLabel}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </Section>
  );
}

function TotemUI({ round }: Props) {
  return (
    <Section title="Immunité">
      <Text style={styles.note}>
        Cette mène est jouée normalement.{'\n\n'}
        Le perdant de cette mène sera immunisé contre la prochaine règle.
      </Text>
      {round.totemNextRule && (
        <View style={styles.totemReveal}>
          <Text style={styles.totemLabel}>Prochaine règle</Text>
          <Text style={styles.totemRuleName}>{round.totemNextRule.name}</Text>
          <Text style={styles.totemRuleDesc}>{round.totemNextRule.shortDescription}</Text>
        </View>
      )}
    </Section>
  );
}

function ImpairUI() {
  return (
    <Section title="Résolution auto">
      <Text style={styles.note}>
        L'équipe gagnante doit gagner avec un nombre impair de points.{'\n'}
        Sinon : 0 point pour le gagnant, 1 point de consolation pour le perdant.{'\n'}
        L'application calcule automatiquement.
      </Text>
    </Section>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Section sans fond
  section: {
    width: '100%',
    maxWidth: 420,
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginRight: 10,
  },
  sectionTitle: {
    color: colors.accent,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },

  row: { flexDirection: 'row', marginTop: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  teamLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, width: 100 },

  note: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 26,
    marginTop: 8,
  },

  undoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    marginLeft: 8,
  },
  disabledEl: { opacity: 0.35 },
  undoText: { color: colors.textSecondary, fontSize: typography.size.base },
  countBadge: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginLeft: 10,
    minWidth: 28,
    textAlign: 'center',
  },

  missionRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  missionBtn: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  missionSelected: { borderWidth: 3, borderColor: colors.textPrimary },
  missionBtnLabel: { color: colors.textPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.base },
  missionText: { flex: 1, color: colors.textPrimary, fontSize: typography.size.base, marginHorizontal: 12, lineHeight: 24 },

  sideBtn: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.surface2, borderRadius: radius.md, marginHorizontal: 4 },
  sideBtnLabel: { color: colors.textPrimary, fontSize: typography.size.base, fontWeight: typography.weight.semibold },

  betInput: {
    backgroundColor: colors.surface2,
    color: colors.textPrimary,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.size.base,
    width: 76,
    marginLeft: 10,
    textAlign: 'center',
  },

  predBtn: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginHorizontal: 3 },
  predBtnLabel: { color: colors.textPrimary, fontWeight: typography.weight.bold, fontSize: typography.size.base },

  totemReveal: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    alignItems: 'center',
  },
  totemLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  totemRuleName: {
    color: colors.accent,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    marginBottom: 6,
    textAlign: 'center',
  },
  totemRuleDesc: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    textAlign: 'center',
    lineHeight: 24,
  },

  successRow: { flexDirection: 'row', marginTop: 12 },
});
