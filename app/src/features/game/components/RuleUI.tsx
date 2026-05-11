import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { RoundState } from '../../../domain/game/models';
import { useGameStore } from '../state/gameStore';
import { TeamButton } from '../../../shared/components/TeamButton';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { TEAM_COLORS, TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, ACCENT } from '../../../shared/constants';
import { CONTRAT_MISSIONS } from '../../../data/rules/rules';

interface Props {
  round: RoundState;
}

export function RuleUI({ round }: Props) {
  const rule = round.rule;
  if (!rule) return null;

  switch (rule.uiType) {
    case 'bonus-buttons':
      return <BonusButtonsUI round={round} />;
    case 'malus-buttons':
      return <MalusButtonsUI round={round} />;
    case 'cochonnet-sorti':
      return <SortieDePorc round={round} />;
    case 'contrat':
      return <ContratUI round={round} />;
    case 'assurance-vie':
      return <AssuranceVieUI round={round} />;
    case 'frontiere':
      return <FrontiereUI round={round} />;
    case 'casino':
      return <CasinoUI round={round} />;
    case 'prediction':
      return <PredictionUI round={round} />;
    case 'totem':
      return <TotemUI round={round} />;
    case 'impair':
      return <ImpairUI />;
    default:
      return null;
  }
}

// Gauche caviar / Les extrêmes
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bonus</Text>
      {(['blue', 'red'] as const).map((team) => {
        const bonusState = getBonusState(team);
        const count = typeof bonusState === 'number' ? bonusState : (bonusState ? 1 : 0);
        const max = round.rule!.maxBonusPerTeam ?? 1;
        const canAdd = count < max;

        return (
          <View key={team} style={styles.teamRow}>
            <TeamButton
              team={team}
              label={getBonusLabel()}
              onPress={() => addBonus(team, ruleId)}
              disabled={!canAdd}
            />
            <TouchableOpacity
              style={[styles.undoBtn, count === 0 && styles.disabled]}
              onPress={() => removeBonus(team, ruleId)}
              disabled={count === 0}
            >
              <Text style={styles.undoText}>Annuler</Text>
            </TouchableOpacity>
            {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>+{count}</Text>}
          </View>
        );
      })}
    </View>
  );
}

// Censure / Boule maudite
function MalusButtonsUI({ round }: Props) {
  const { addCensureMalus, removeCensureMalus, setBouleMauditeHit } = useGameStore();
  const ruleId = round.rule!.id;

  if (ruleId === 'censure') {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Malus</Text>
        {(['blue', 'red'] as const).map((team) => {
          const count = round.censureMalus[team];
          const max = round.rule!.maxMalusPerTeam ?? 3;

          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton
                team={team}
                label="A parlé -1"
                onPress={() => addCensureMalus(team)}
                disabled={count >= max}
              />
              <TouchableOpacity
                style={[styles.undoBtn, count === 0 && styles.disabled]}
                onPress={() => removeCensureMalus(team)}
                disabled={count === 0}
              >
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>{-count}</Text>}
            </View>
          );
        })}
      </View>
    );
  }

  if (ruleId === 'boule-maudite') {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Malus</Text>
        {(['blue', 'red'] as const).map((team) => {
          const hit = round.boucleMauditeHit[team];
          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton
                team={team}
                label="A touché la boule -1"
                onPress={() => setBouleMauditeHit(team, true)}
                disabled={hit}
              />
              <TouchableOpacity
                style={[styles.undoBtn, !hit && styles.disabled]}
                onPress={() => setBouleMauditeHit(team, false)}
                disabled={!hit}
              >
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {hit && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>-1</Text>}
            </View>
          );
        })}
      </View>
    );
  }

  return null;
}

function SortieDePorc({ round }: Props) {
  const { setSortieDePorc } = useGameStore();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sortie de porc</Text>
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
        <Text style={styles.note}>
          Le score normal sera ignoré. La mène sera terminée avec 6 points directs.
        </Text>
      )}
    </View>
  );
}

function ContratUI({ round }: Props) {
  const { selectContratMission, clearContratMission, setContratSuccess } = useGameStore();

  const bothSelected = round.contratMission.blue !== null && round.contratMission.red !== null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Contrat — Choisir une mission</Text>
      {CONTRAT_MISSIONS.map((mission, idx) => (
        <View key={idx} style={styles.missionRow}>
          <TouchableOpacity
            style={[
              styles.missionBtn,
              { backgroundColor: TEAM_COLORS.blue },
              round.contratMission.blue === idx && styles.missionSelected,
              round.contratMission.blue !== null && round.contratMission.blue !== idx && styles.missionDisabled,
            ]}
            onPress={() => round.contratMission.blue === idx ? clearContratMission('blue') : selectContratMission('blue', idx)}
          >
            <Text style={styles.missionBtnLabel}>B</Text>
          </TouchableOpacity>

          <Text style={styles.missionText}>{mission}</Text>

          <TouchableOpacity
            style={[
              styles.missionBtn,
              { backgroundColor: TEAM_COLORS.red },
              round.contratMission.red === idx && styles.missionSelected,
              round.contratMission.red !== null && round.contratMission.red !== idx && styles.missionDisabled,
            ]}
            onPress={() => round.contratMission.red === idx ? clearContratMission('red') : selectContratMission('red', idx)}
          >
            <Text style={styles.missionBtnLabel}>R</Text>
          </TouchableOpacity>
        </View>
      ))}

      {bothSelected && (
        <View style={styles.successRow}>
          {(['blue', 'red'] as const).map((team) => (
            <TeamButton
              key={team}
              team={team}
              label={round.contratSuccess[team] ? '✓ Mission réussie' : 'Mission réussie +2'}
              onPress={() => setContratSuccess(team, !round.contratSuccess[team])}
              disabled={round.contratMission[team] === null}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function AssuranceVieUI({ round }: Props) {
  const { toggleAssurance } = useGameStore();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Assurance vie</Text>
      <Text style={styles.note}>
        Prendre une assurance : perdre = +1, gagner = -1 sur les points normaux.
      </Text>
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton
            key={team}
            team={team}
            label={round.assurance[team] ? '✓ Assuré' : 'Prendre assurance'}
            onPress={() => toggleAssurance(team)}
          />
        ))}
      </View>
    </View>
  );
}

function FrontiereUI({ round }: Props) {
  const { setFrontiereChoice } = useGameStore();

  const bothChosen = round.frontiereChoice.blue !== null && round.frontiereChoice.red !== null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Frontière — Choisir un côté</Text>
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>
            {team === 'blue' ? 'Bleu' : 'Rouge'} :
          </Text>
          <TouchableOpacity
            style={[styles.sideBtn, round.frontiereChoice[team] === 'left' && { backgroundColor: TEAM_COLORS[team] }]}
            onPress={() => setFrontiereChoice(team, 'left')}
          >
            <Text style={styles.sideBtnLabel}>← Gauche</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideBtn, round.frontiereChoice[team] === 'right' && { backgroundColor: TEAM_COLORS[team] }]}
            onPress={() => setFrontiereChoice(team, 'right')}
          >
            <Text style={styles.sideBtnLabel}>Droite →</Text>
          </TouchableOpacity>
        </View>
      ))}
      {bothChosen && (
        <Text style={styles.note}>
          Seules les boules du bon côté peuvent marquer. Les autres restent sur le terrain.
        </Text>
      )}
    </View>
  );
}

function CasinoUI({ round }: Props) {
  const { setCasinoBet, setCasinoWinner } = useGameStore();
  const scores = useGameStore((s) => s.scores);

  const [betInput, setBetInput] = useState<Record<'blue' | 'red', string>>({
    blue: String(round.casinoBets.blue),
    red: String(round.casinoBets.red),
  });

  const handleBet = (team: 'blue' | 'red', val: string) => {
    setBetInput((prev) => ({ ...prev, [team]: val }));
    const num = parseInt(val, 10);
    if (!isNaN(num)) setCasinoBet(team, num);
  };

  if (!round.casinoWinner) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Casino — Mise</Text>
        {(['blue', 'red'] as const).map((team) => (
          <View key={team} style={styles.teamRow}>
            <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>
              {team === 'blue' ? 'Bleu' : 'Rouge'} (max {scores[team]}) :
            </Text>
            <TextInput
              style={styles.betInput}
              keyboardType="number-pad"
              value={betInput[team]}
              onChangeText={(v) => handleBet(team, v)}
              maxLength={3}
            />
          </View>
        ))}
        <Text style={styles.note}>Pas de score normal. Désignez le gagnant à la fin de la mène.</Text>
        <View style={styles.row}>
          {(['blue', 'red'] as const).map((team) => (
            <TeamButton key={team} team={team} label="Gagne la mène" onPress={() => setCasinoWinner(team)} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Casino — Résultat</Text>
      <Text style={styles.note}>
        {round.casinoWinner === 'blue' ? 'Bleu' : 'Rouge'} gagne !{'\n'}
        Bleu mise : {round.casinoBets.blue} — Rouge mise : {round.casinoBets.red}
      </Text>
    </View>
  );
}

function PredictionUI({ round }: Props) {
  const { setPrediction } = useGameStore();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prédiction</Text>
      <Text style={styles.note}>Prédire de combien de points vous allez gagner (1 à 6). Si réussi, l'adversaire perd ce nombre de points.</Text>
      {(['blue', 'red'] as const).map((team) => (
        <View key={team} style={styles.teamRow}>
          <Text style={[styles.teamLabel, { color: TEAM_COLORS[team] }]}>
            {team === 'blue' ? 'Bleu' : 'Rouge'} :
          </Text>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.predBtn, round.predictionValues[team] === n && { backgroundColor: TEAM_COLORS[team] }]}
              onPress={() => setPrediction(team, round.predictionValues[team] === n ? null : n)}
            >
              <Text style={styles.predBtnLabel}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

function TotemUI({ round }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Totem d'immunité</Text>
      <Text style={styles.note}>
        Cette mène est jouée normalement.{'\n\n'}
        Le perdant de cette mène sera immunisé contre la prochaine règle.
      </Text>
      {round.totemNextRule && (
        <View style={styles.totemReveal}>
          <Text style={styles.totemLabel}>Prochaine règle révélée :</Text>
          <Text style={styles.totemRuleName}>{round.totemNextRule.name}</Text>
          <Text style={styles.totemRuleDesc}>{round.totemNextRule.shortDescription}</Text>
        </View>
      )}
    </View>
  );
}

function ImpairUI() {
  return (
    <View style={styles.section}>
      <Text style={styles.note}>
        L'équipe gagnante doit gagner avec un nombre impair de points.{'\n'}
        Sinon : 0 point pour le gagnant, 1 point de consolation pour le perdant.{'\n'}
        L'application calcule automatiquement.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    color: ACCENT,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginTop: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  note: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  undoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#333',
    borderRadius: 8,
    marginLeft: 8,
  },
  disabled: { opacity: 0.3 },
  undoText: { color: '#CCC', fontSize: 13 },
  countBadge: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
    minWidth: 28,
    textAlign: 'center',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  missionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
  missionDisabled: { opacity: 0.3 },
  missionBtnLabel: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  missionText: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 14,
    marginHorizontal: 12,
  },
  successRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  sideBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  sideBtnLabel: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  betInput: {
    backgroundColor: '#333',
    color: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    width: 70,
    marginLeft: 8,
    textAlign: 'center',
  },
  predBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  predBtnLabel: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  totemReveal: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  totemLabel: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totemRuleName: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  totemRuleDesc: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    textAlign: 'center',
  },
});
