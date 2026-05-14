import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { Team } from '../../../../domain/game/models';
import { GameTeamActionRow } from '../GameTeamActionRow';
import { CONTRAT_MISSIONS, CONTRAT_MISSION_SHORT_LABELS } from '../../../../data/rules/rules';
import { Props, colors, figmaTextStyles, TEAM_COLORS } from './shared';

export function ContratSetupUI({ round }: Props) {
  const { selectContratMission, clearContratMission } = useGameStore();

  const handleMissionPress = (team: Team, missionIdx: number) => {
    if (round.contratMission[team] === missionIdx) {
      clearContratMission(team);
      return;
    }

    selectContratMission(team, missionIdx);
  };

  return (
    <View style={localStyles.setupWrapper}>
      {CONTRAT_MISSIONS.map((mission, idx) => (
        <View key={idx} style={localStyles.missionRow}>
          <MissionButton
            team="blue"
            selected={round.contratMission.blue === idx}
            dimmed={round.contratMission.blue !== null && round.contratMission.blue !== idx}
            onPress={() => handleMissionPress('blue', idx)}
            testID={`contrat-mission-${idx}-blue`}
          />
          <Text
            style={localStyles.missionText}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {mission}
          </Text>
          <MissionButton
            team="red"
            selected={round.contratMission.red === idx}
            dimmed={round.contratMission.red !== null && round.contratMission.red !== idx}
            onPress={() => handleMissionPress('red', idx)}
            testID={`contrat-mission-${idx}-red`}
          />
        </View>
      ))}
    </View>
  );
}

export function ContratResolutionUI({ round }: Props) {
  const { setContratSuccess } = useGameStore();
  const blueMission = round.contratMission.blue;
  const redMission = round.contratMission.red;

  if (blueMission === null || redMission === null) return null;

  return (
    <View style={localStyles.resolutionWrapper}>
      <View style={localStyles.shortMissionRow}>
        <Text
          style={[localStyles.shortMissionLabel, localStyles.blueShortMissionLabel]}
          testID="contrat-short-label-blue"
        >
          {CONTRAT_MISSION_SHORT_LABELS[blueMission]}
        </Text>
        <Text
          style={[localStyles.shortMissionLabel, localStyles.redShortMissionLabel]}
          testID="contrat-short-label-red"
        >
          {CONTRAT_MISSION_SHORT_LABELS[redMission]}
        </Text>
      </View>
      <GameTeamActionRow
        label="Mission réussie"
        activeTeams={round.contratSuccess}
        onTeamPress={(team) => setContratSuccess(team, !round.contratSuccess[team])}
        testIDPrefix="contrat-success"
      />
    </View>
  );
}

function MissionButton({
  team,
  selected,
  dimmed,
  onPress,
  testID,
}: {
  team: Team;
  selected: boolean;
  dimmed: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      style={[
        localStyles.missionBtn,
        { backgroundColor: TEAM_COLORS[team] },
        selected && localStyles.missionSelected,
        dimmed && localStyles.missionDimmed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      testID={testID}
    >
      <Text style={localStyles.missionBtnLabel}>{team === 'blue' ? 'B' : 'R'}</Text>
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  setupWrapper: {
    width: '100%',
    gap: 4,
    marginTop: 'auto',
  },
  missionRow: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'stretch',
    columnGap: 12,
  },
  missionBtn: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  missionSelected: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  missionDimmed: {
    opacity: 0.35,
  },
  missionBtnLabel: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    textAlign: 'center',
    includeFontPadding: false,
  },
  missionText: {
    flex: 1,
    alignSelf: 'center',
    color: colors.white,
    ...figmaTextStyles.bodySm,
    textAlign: 'center',
    includeFontPadding: false,
  },
  resolutionWrapper: {
    width: '100%',
    gap: 4,
  },
  shortMissionRow: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  shortMissionLabel: {
    flex: 1,
    ...figmaTextStyles.bodyMd,
    textAlign: 'center',
    includeFontPadding: false,
  },
  blueShortMissionLabel: {
    color: TEAM_COLORS.blueText,
  },
  redShortMissionLabel: {
    color: TEAM_COLORS.redText,
  },
});
