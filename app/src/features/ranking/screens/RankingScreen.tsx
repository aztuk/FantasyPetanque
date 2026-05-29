import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeftIcon, PlusIcon, TrophyIcon } from 'phosphor-react-native';
import type { Player, RankingSport } from '../../../domain/ranking/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { SetupOption } from '../../../shared/components/SetupOption';
import {
  colors,
  componentSizes,
  figmaTextStyles,
  radius,
  spacing,
} from '../../../shared/constants';
import {
  createEmptyRankingRecords,
  fetchRankingData,
  getPlayerElo,
  getPlayerRecord,
  type RankingRecords,
  sortPlayersBySport,
} from '../services/rankingPlayers';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Ranking'>;
type Route = RouteProp<RootStackParamList, 'Ranking'>;

const SPORT_LABELS: Record<RankingSport, string> = {
  petanque: 'Pétanque',
  flechettes: 'Fléchettes',
};

const SPORT_CHOICE_LABELS: Record<RankingSport, string> = {
  petanque: 'PÉTANQUE',
  flechettes: 'FLECHETTE',
};

const ITEM_HEIGHTS = {
  first: 143,
  second: 111,
  third: 95,
  rest: 78,
} as const;

export function RankingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [selectedSport, setSelectedSport] = useState<RankingSport | null>(route.params?.sport ?? null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [records, setRecords] = useState<RankingRecords>(() => createEmptyRankingRecords());
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.sport) {
      setSelectedSport(route.params.sport);
    }
  }, [route.params?.sport]);

  const loadData = useCallback(() => {
    let mounted = true;

    fetchRankingData()
      .then((data) => {
        if (mounted) {
          setPlayers(data.players);
          setRecords(data.records);
          setErrorMessage(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setErrorMessage('Classement indisponible');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      return loadData();
    }, [loadData]),
  );

  const rankedPlayers = useMemo(
    () => selectedSport ? sortPlayersBySport(players, selectedSport) : [],
    [players, selectedSport],
  );

  const handleBack = () => {
    if (selectedSport) {
      setSelectedSport(null);
      return;
    }

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {selectedSport ? (
        <RankingListView
          sport={selectedSport}
          players={rankedPlayers}
          records={records}
          loading={loading}
          errorMessage={errorMessage}
          onBack={handleBack}
          onAddMatch={() => navigation.navigate('AddMatch', { sport: selectedSport })}
        />
      ) : (
        <RankingChoiceView
          players={players}
          loading={loading}
          errorMessage={errorMessage}
          onBack={handleBack}
          onSelectSport={setSelectedSport}
        />
      )}
    </SafeAreaView>
  );
}

interface RankingChoiceViewProps {
  players: Player[];
  loading: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onSelectSport: (sport: RankingSport) => void;
}

function RankingChoiceView({
  players,
  loading,
  errorMessage,
  onBack,
  onSelectSport,
}: RankingChoiceViewProps) {
  return (
    <View style={styles.choiceScreen}>
      <SetupOption
        title={SPORT_CHOICE_LABELS.petanque}
        description={getLeaderSummary(players, 'petanque', loading, errorMessage)}
        onPress={() => onSelectSport('petanque')}
        style={[styles.choiceOption, styles.choiceOptionTop]}
        testID="ranking-petanque-choice"
      />
      <SetupOption
        title={SPORT_CHOICE_LABELS.flechettes}
        description={getLeaderSummary(players, 'flechettes', loading, errorMessage)}
        onPress={() => onSelectSport('flechettes')}
        style={[styles.choiceOption, styles.choiceOptionBottom]}
        testID="ranking-flechettes-choice"
      />
      <RankingIconButton
        onPress={onBack}
        accessibilityLabel="Retour"
        testID="ranking-back-button"
        style={styles.choiceBackButton}
      />
    </View>
  );
}

interface RankingListViewProps {
  sport: RankingSport;
  players: Player[];
  records: RankingRecords;
  loading: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onAddMatch: () => void;
}

function RankingListView({
  sport,
  players,
  records,
  loading,
  errorMessage,
  onBack,
  onAddMatch,
}: RankingListViewProps) {
  return (
    <View style={styles.listScreen}>
      <View style={styles.header} testID="ranking-head">
        <RankingIconButton
          onPress={onBack}
          accessibilityLabel="Retour au choix du jeu"
          testID="ranking-list-back-button"
        />
        <Text style={styles.headerTitle}>{SPORT_LABELS[sport]}</Text>
        <RankingIconButton
          onPress={onAddMatch}
          accessibilityLabel="Ajouter un match"
          testID="ranking-add-match-button"
          icon="plus"
        />
      </View>

      <View style={styles.listContent}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={colors.primary} testID="ranking-loading" />
          </View>
        ) : errorMessage ? (
          <Text style={styles.emptyText}>{errorMessage}</Text>
        ) : players.length === 0 ? (
          <Text style={styles.emptyText}>Aucun joueur classé</Text>
        ) : (
          <ScrollView
            style={styles.ranks}
            contentContainerStyle={styles.ranksContent}
            showsVerticalScrollIndicator={false}
            testID="ranking-player-list"
          >
            {players.map((player, index) => (
              <RankingItem
                key={player.id}
                player={player}
                sport={sport}
                record={getPlayerRecord(records, sport, player.id)}
                rank={index + 1}
              />
            ))}
          </ScrollView>
        )}
      </View>

    </View>
  );
}

interface RankingItemProps {
  player: Player;
  sport: RankingSport;
  record: {
    wins: number;
    losses: number;
  };
  rank: number;
}

function RankingItem({ player, sport, record, rank }: RankingItemProps) {
  const podium = getPodium(rank);
  const isPodium = podium !== 'rest';
  const rankColor = getRankColor(rank);
  const elo = getPlayerElo(player, sport);

  return (
    <View
      style={[
        styles.rankingItem,
        podium === 'first' && styles.rankingItemFirst,
        podium === 'second' && styles.rankingItemSecond,
        podium === 'third' && styles.rankingItemThird,
        podium === 'rest' && styles.rankingItemRest,
      ]}
      testID={`ranking-player-${player.id}`}
    >
      <View style={styles.rankBadge}>
        {podium === 'rest' ? null : (
          <TrophyIcon
            color={rankColor}
            size={32}
            weight="regular"
            style={styles.trophy}
          />
        )}
        <RankingNumber
          value={formatRank(rank)}
          color={rankColor}
          align="center"
          stroke={isPodium}
          testID={`ranking-rank-${player.id}`}
        />
      </View>

      <View style={styles.playerInfo}>
        <Text
          style={[
            isPodium ? styles.playerNamePodium : styles.playerNameRest,
            isPodium && { color: rankColor },
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
        <Text style={styles.playerMeta} testID={`ranking-player-record-${player.id}`}>
          <Text style={styles.playerMetaWins}>{record.wins}V</Text>
          <Text style={styles.playerMetaSeparator}> - </Text>
          <Text style={styles.playerMetaLosses}>{record.losses}D</Text>
        </Text>
      </View>

      <RankingNumber
        value={formatElo(elo)}
        color={isPodium ? rankColor : colors.white}
        align="right"
        testID={`ranking-elo-${player.id}`}
      />
    </View>
  );
}

interface RankingNumberProps {
  value: string;
  color: string;
  align: 'center' | 'right';
  stroke?: boolean;
  testID: string;
}

function RankingNumber({
  value,
  color,
  align,
  stroke = false,
  testID,
}: RankingNumberProps) {
  const width = align === 'right' ? 64 : 40;
  const textAlign = align === 'right' ? 'right' : 'center';
  const strokeOffsets = [
    [-3, 0],
    [3, 0],
    [0, -3],
    [0, 3],
    [-2, -2],
    [2, -2],
    [-2, 2],
    [2, 2],
    [-3, -1],
    [3, -1],
    [-3, 1],
    [3, 1],
    [-1, -3],
    [1, -3],
    [-1, 3],
    [1, 3],
  ] as const;

  return (
    <View
      style={[styles.rankingNumber, { width }]}
      testID={testID}
      accessibilityLabel={value}
      accessible
    >
      {stroke
        ? strokeOffsets.map(([left, top]) => (
        <Text
          key={`${left}:${top}`}
          style={[
            styles.rankingNumberText,
            styles.rankingNumberStroke,
                { color: colors.darkSmooth, left, top, textAlign, width },
              ]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden
            >
              {value}
            </Text>
          ))
        : null}
      <Text
        style={[styles.rankingNumberText, { color, textAlign, width }]}
        testID={`${testID}-fill`}
      >
        {value}
      </Text>
    </View>
  );
}

interface RankingIconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  testID: string;
  icon?: 'back' | 'plus';
  style?: StyleProp<ViewStyle>;
}

function RankingIconButton({
  onPress,
  accessibilityLabel,
  testID,
  icon = 'back',
  style,
}: RankingIconButtonProps) {
  const Icon = icon === 'plus' ? PlusIcon : ArrowLeftIcon;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.iconButton, style]}
      testID={testID}
    >
      <Icon color={colors.textSmooth} size={32} weight="regular" />
    </Pressable>
  );
}

function getLeaderSummary(
  players: Player[],
  sport: RankingSport,
  loading: boolean,
  errorMessage: string | null,
): string {
  if (loading) {
    return 'Chargement du classement';
  }

  if (errorMessage) {
    return errorMessage;
  }

  const [leader, runnerUp] = sortPlayersBySport(players, sport);

  if (!leader) {
    return 'Aucun joueur classé';
  }

  const lead = runnerUp
    ? Math.max(0, getPlayerElo(leader, sport) - getPlayerElo(runnerUp, sport))
    : 0;

  return `${leader.name} mène de ${lead} points`;
}

function getPodium(rank: number): 'first' | 'second' | 'third' | 'rest' {
  if (rank === 1) {
    return 'first';
  }

  if (rank === 2) {
    return 'second';
  }

  if (rank === 3) {
    return 'third';
  }

  return 'rest';
}

function getRankColor(rank: number): string {
  if (rank === 1) {
    return colors.primary;
  }

  if (rank === 2) {
    return colors.silver;
  }

  if (rank === 3) {
    return colors.copper;
  }

  return colors.white;
}

function formatRank(rank: number): string {
  return rank.toString().padStart(2, '0');
}

function formatElo(elo: number): string {
  return elo.toString();
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  choiceScreen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  choiceOption: {
    flex: 1,
    minHeight: 0,
  },
  choiceOptionTop: {
    backgroundColor: colors.darkSmooth,
  },
  choiceOptionBottom: {
    backgroundColor: colors.dark,
  },
  choiceBackButton: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
  },
  listScreen: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  header: {
    minHeight: componentSizes.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[2],
    backgroundColor: colors.dark,
  },
  headerTitle: {
    ...figmaTextStyles.pageTitles,
    flex: 1,
    color: colors.white,
    includeFontPadding: false,
  },
  iconButton: {
    width: componentSizes.iconButton,
    height: componentSizes.iconButton,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    borderRadius: radius.round,
    backgroundColor: colors.darkSmoother,
  },
  listContent: {
    flex: 1,
  },
  ranks: {
    flex: 1,
  },
  ranksContent: {
    paddingBottom: spacing[8],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...figmaTextStyles.bodyMd,
    color: colors.textSmooth,
    includeFontPadding: false,
    textAlign: 'center',
    padding: spacing[6],
  },
  rankingItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[5],
    paddingHorizontal: spacing[6],
  },
  rankingItemFirst: {
    height: ITEM_HEIGHTS.first,
    backgroundColor: colors.darkSmooth,
  },
  rankingItemSecond: {
    height: ITEM_HEIGHTS.second,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  rankingItemThird: {
    height: ITEM_HEIGHTS.third,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  rankingItemRest: {
    height: ITEM_HEIGHTS.rest,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  rankBadge: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophy: {
    position: 'absolute',
  },
  rankingNumber: {
    height: 41,
    justifyContent: 'center',
  },
  rankingNumberText: {
    ...figmaTextStyles.numberXs40,
    includeFontPadding: false,
  },
  rankingNumberStroke: {
    position: 'absolute',
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
    gap: spacing[1],
  },
  playerNamePodium: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
  },
  playerNameRest: {
    ...figmaTextStyles.bodySm,
    color: colors.white,
    includeFontPadding: false,
  },
  playerMeta: {
    ...figmaTextStyles.bodyXs,
    includeFontPadding: false,
  },
  playerMetaWins: {
    color: colors.secondary,
  },
  playerMetaSeparator: {
    color: colors.white,
  },
  playerMetaLosses: {
    color: colors.team.red,
  },
});
