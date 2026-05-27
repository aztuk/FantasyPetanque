import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeftIcon,
  CheckFatIcon,
  CheckIcon,
  DotsSixVerticalIcon,
  SmileySadIcon,
  TrophyIcon,
} from 'phosphor-react-native';
import type { Player, RankingSport } from '../../../domain/ranking/models';
import { RootStackParamList } from '../../../app/navigation/types';
import { FullWidthCtaButton } from '../../../shared/components/FullWidthCtaButton';
import {
  colors,
  componentSizes,
  figmaTextStyles,
  radius,
  spacing,
  typography,
} from '../../../shared/constants';
import {
  computeEloDeltas,
  computeEloRankedDeltas,
  createPlayer,
  fetchPlayersOrderedByActivity,
  getPlayerElo,
  saveMatch,
  saveMatchRanked,
} from '../services/rankingPlayers';

type Step = 'players' | 'order' | 'result';
type WinnerStatus = 'winner' | 'loser' | 'neutral';

const ANIM_DURATION = 500;
const ANIM_GAP = 120;
const ANIM_INITIAL_DELAY = 300;
const ITEM_HEIGHT = 56;

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddMatch'>;
type Route = RouteProp<RootStackParamList, 'AddMatch'>;

export function AddMatchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sport } = route.params;
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('players');
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, WinnerStatus>>({});
  const [rankedOrder, setRankedOrder] = useState<Player[]>([]);
  const [eloDeltas, setEloDeltas] = useState<Record<string, number>>({});
  const [resultPlayers, setResultPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    fetchPlayersOrderedByActivity()
      .then(setAllPlayers)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (addingPlayer) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [addingPlayer]);

  const [keyboardPadding, setKeyboardPadding] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      const padding = Math.max(0, e.endCoordinates.height - insets.bottom);
      setKeyboardPadding(padding);
    });
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardPadding(0));
    return () => { show.remove(); hide.remove(); };
  }, [insets.bottom]);

  const selectedPlayers = allPlayers.filter((p) => selectedIds.has(p.id));

  const handleTogglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmAddPlayer = async () => {
    const name = newPlayerName.trim();
    if (!name) return;
    try {
      const player = await createPlayer(name);
      setAllPlayers((prev) => [...prev, player]);
      setSelectedIds((prev) => new Set([...prev, player.id]));
      setNewPlayerName('');
      setAddingPlayer(false);
    } catch {
      // ignore — player won't be added
    }
  };

  const handleCycleStatus = (id: string) => {
    setStatuses((prev) => {
      const current = prev[id] ?? 'neutral';
      const next: WinnerStatus =
        current === 'neutral' ? 'winner' : current === 'winner' ? 'loser' : 'neutral';
      return { ...prev, [id]: next };
    });
  };

  const handleGoToStep2 = () => {
    if (sport === 'flechettes') {
      setRankedOrder(selectedPlayers);
    }
    setStep('order');
  };

  const handleConfirmMatch = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (sport === 'flechettes') {
        const deltas = computeEloRankedDeltas(rankedOrder, sport);
        await saveMatchRanked(sport, rankedOrder, deltas);
        setEloDeltas(deltas);
        setResultPlayers(
          rankedOrder.map((p) => ({
            ...p,
            eloFlechettes: getPlayerElo(p, sport) + (deltas[p.id] ?? 0),
          })),
        );
      } else {
        const winners = selectedPlayers.filter((p) => statuses[p.id] === 'winner');
        const losers = selectedPlayers.filter((p) => statuses[p.id] === 'loser');
        const deltas = computeEloDeltas(winners, losers, sport);
        await saveMatch(sport, winners, losers, deltas);
        setEloDeltas(deltas);
        setResultPlayers(
          selectedPlayers.map((p) => ({
            ...p,
            eloPetanque: getPlayerElo(p, sport) + (deltas[p.id] ?? 0),
          })),
        );
      }
      setStep('result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 'order') {
      setStep('players');
      return;
    }
    navigation.goBack();
  };

  const canProceedStep1 = selectedIds.size >= 2;

  const winnersCount = selectedPlayers.filter((p) => statuses[p.id] === 'winner').length;
  const losersCount = selectedPlayers.filter((p) => statuses[p.id] === 'loser').length;
  const neutralCount = selectedPlayers.filter(
    (p) => !statuses[p.id] || statuses[p.id] === 'neutral',
  ).length;
  const canConfirmPetanque = winnersCount >= 1 && losersCount >= 1 && neutralCount === 0;
  const step2ButtonLabel =
    sport === 'flechettes'
      ? 'CONFIRMER'
      : neutralCount > 0
        ? `ENCORE ${neutralCount} STATUT${neutralCount > 1 ? 'S' : ''}`
        : winnersCount === 0
          ? 'ENCORE 1 GAGNANT'
          : losersCount === 0
            ? 'ENCORE 1 PERDANT'
            : 'CONFIRMER';
  const canConfirmStep2 = sport === 'flechettes' ? true : canConfirmPetanque;

  if (step === 'result') {
    return (
      <ResultView
        sport={sport}
        players={resultPlayers}
        eloDeltas={eloDeltas}
        statuses={statuses}
        rankedOrder={sport === 'flechettes' ? rankedOrder.map((p) => p.id) : undefined}
        onCancel={() => setStep('order')}
        onDone={() => navigation.goBack()}
      />
    );
  }

  const stepTitle =
    step === 'players'
      ? 'Qui a joué ?'
      : sport === 'flechettes'
        ? 'Dans quel ordre ?'
        : 'Qui a gagné ?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.screen, { paddingBottom: keyboardPadding }]}>
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
            <Text style={styles.headerTitle}>{stepTitle}</Text>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : step === 'players' ? (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
            >
              {allPlayers.map((player) => {
                const selected = selectedIds.has(player.id);
                return (
                  <PlayerSelectItem
                    key={player.id}
                    name={player.name}
                    selected={selected}
                    onPress={() => handleTogglePlayer(player.id)}
                  />
                );
              })}
              {!addingPlayer && (
                <Pressable
                  style={styles.addPlayerRow}
                  onPress={() => setAddingPlayer(true)}
                  testID="add-player-button"
                >
                  <Text style={styles.addPlayerLabel}>Ajouter un joueur</Text>
                </Pressable>
              )}
            </ScrollView>
          ) : sport === 'flechettes' ? (
            <DragOrderList
              players={rankedOrder}
              onReorder={setRankedOrder}
            />
          ) : (
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {selectedPlayers.map((player) => {
                const status = statuses[player.id] ?? 'neutral';
                return (
                  <WinnerSelectItem
                    key={player.id}
                    name={player.name}
                    status={status}
                    onPress={() => handleCycleStatus(player.id)}
                  />
                );
              })}
            </ScrollView>
          )}

          {addingPlayer && (
            <View style={styles.addPlayerInputRow}>
              <TextInput
                ref={inputRef}
                style={styles.addPlayerInput}
                value={newPlayerName}
                onChangeText={setNewPlayerName}
                placeholder="Nom du joueur"
                placeholderTextColor={colors.textSmooth}
                returnKeyType="done"
                onSubmitEditing={handleConfirmAddPlayer}
                autoCapitalize="words"
                testID="add-player-input"
              />
              <Pressable
                onPress={handleConfirmAddPlayer}
                style={styles.addPlayerConfirmBtn}
                testID="add-player-confirm"
              >
                <CheckIcon color={colors.secondary} size={28} weight="bold" />
              </Pressable>
            </View>
          )}

          <FullWidthCtaButton
            label={step === 'players' ? 'SUIVANT' : step2ButtonLabel}
            onPress={step === 'players' ? handleGoToStep2 : handleConfirmMatch}
            disabled={step === 'players' ? !canProceedStep1 : !canConfirmStep2 || submitting}
            testID="add-match-next-button"
          />
        </View>
    </SafeAreaView>
  );
}

// ─── Drag/drop list ───────────────────────────────────────────────────────────

interface DragOrderListProps {
  players: Player[];
  onReorder: (players: Player[]) => void;
}

function DragOrderList({ players, onReorder }: DragOrderListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragOriginY = useRef(0);
  const currentOrder = useRef(players);
  currentOrder.current = players;

  const makePanResponder = useCallback(
    (index: number) =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          dragOriginY.current = evt.nativeEvent.pageY - index * ITEM_HEIGHT;
          dragY.setValue(index * ITEM_HEIGHT);
          setDraggingIndex(index);
          setHoverIndex(index);
        },
        onPanResponderMove: (evt) => {
          const rawY = evt.nativeEvent.pageY - dragOriginY.current;
          const clamped = Math.max(0, Math.min(rawY, (currentOrder.current.length - 1) * ITEM_HEIGHT));
          dragY.setValue(clamped);
          const targetIndex = Math.round(clamped / ITEM_HEIGHT);
          setHoverIndex(Math.max(0, Math.min(targetIndex, currentOrder.current.length - 1)));
        },
        onPanResponderRelease: () => {
          setDraggingIndex((prev) => {
            setHoverIndex((hov) => {
              if (prev !== null && hov !== null && prev !== hov) {
                const next = [...currentOrder.current];
                const [moved] = next.splice(prev, 1);
                next.splice(hov, 0, moved);
                onReorder(next);
              }
              return null;
            });
            return null;
          });
        },
        onPanResponderTerminate: () => {
          setDraggingIndex(null);
          setHoverIndex(null);
        },
      }),
    [dragY, onReorder],
  );

  const total = players.length;

  return (
    <View style={styles.list}>
      {players.map((player, index) => {
        const isDragging = draggingIndex === index;
        const isHover =
          hoverIndex !== null && draggingIndex !== null && hoverIndex === index && !isDragging;
        const isFirst = index === 0;
        const isLast = index === total - 1;
        const label = isFirst ? 'Gagnant' : isLast ? 'Perdant' : undefined;

        return (
          <Animated.View
            key={player.id}
            style={[
              styles.listItem,
              styles.listItemSelected,
              isDragging && styles.listItemDragging,
              isHover && styles.listItemHover,
              isDragging && {
                position: 'absolute',
                left: 0,
                right: 0,
                top: dragY,
                zIndex: 10,
              },
            ]}
            testID={`rank-order-item-${index + 1}`}
          >
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.playerName}>{player.name}</Text>
            {label === 'Gagnant' && (
              <View style={styles.statusBadge}>
                <TrophyIcon color={colors.primary} size={24} weight="regular" />
                <Text style={[styles.statusLabel, styles.statusLabelWinner]}>Gagnant</Text>
              </View>
            )}
            {label === 'Perdant' && (
              <View style={styles.statusBadge}>
                <SmileySadIcon color={colors.team.red} size={24} weight="regular" />
                <Text style={[styles.statusLabel, styles.statusLabelLoser]}>Perdant</Text>
              </View>
            )}
            <View
              {...makePanResponder(index).panHandlers}
              style={styles.dragHandle}
              testID={`drag-handle-${index}`}
            >
              <DotsSixVerticalIcon color={colors.textSmooth} size={24} weight="regular" />
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

// ─── Result view ──────────────────────────────────────────────────────────────

interface ResultViewProps {
  sport: RankingSport;
  players: Player[];
  eloDeltas: Record<string, number>;
  statuses: Record<string, WinnerStatus>;
  rankedOrder?: string[];
  onCancel: () => void;
  onDone: () => void;
}

function ResultView({ sport, players, eloDeltas, statuses, rankedOrder, onCancel, onDone }: ResultViewProps) {
  let ordered: Player[];
  if (sport === 'flechettes' && rankedOrder) {
    const byId = Object.fromEntries(players.map((p) => [p.id, p]));
    ordered = rankedOrder.flatMap((id) => (byId[id] ? [byId[id]] : []));
  } else {
    const winners = players.filter((p) => statuses[p.id] === 'winner');
    const losers = players.filter((p) => statuses[p.id] === 'loser');
    ordered = [...winners, ...losers];
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screen}>
        <View style={styles.resultBackBtn}>
          <BackButton onPress={onCancel} />
        </View>
        <View style={styles.resultContent}>
          <View style={styles.resultList}>
            {ordered.map((player, index) => (
              <EloResultItem
                key={player.id}
                name={player.name}
                newElo={getPlayerElo(player, sport)}
                delta={eloDeltas[player.id] ?? 0}
                delay={ANIM_INITIAL_DELAY + index * (ANIM_DURATION + ANIM_GAP)}
              />
            ))}
          </View>
        </View>
        <FullWidthCtaButton
          label="ANNULER"
          onPress={onCancel}
          variant="default"
          testID="result-cancel-button"
        />
        <FullWidthCtaButton
          label="RETOUR AU CLASSEMENT"
          onPress={onDone}
          testID="result-back-button"
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PlayerSelectItemProps {
  name: string;
  selected: boolean;
  onPress: () => void;
}

function PlayerSelectItem({ name, selected, onPress }: PlayerSelectItemProps) {
  return (
    <Pressable
      style={[styles.listItem, selected && styles.listItemSelected]}
      onPress={onPress}
    >
      <Text style={[styles.playerName, !selected && styles.playerNameUnselected]}>
        {name}
      </Text>
      {selected && <CheckFatIcon color={colors.secondary} size={32} weight="fill" />}
    </Pressable>
  );
}

interface WinnerSelectItemProps {
  name: string;
  status: WinnerStatus;
  onPress: () => void;
}

function WinnerSelectItem({ name, status, onPress }: WinnerSelectItemProps) {
  const isNeutral = status === 'neutral';
  const isWinner = status === 'winner';
  const isLoser = status === 'loser';

  return (
    <Pressable
      style={[styles.listItem, !isNeutral && styles.listItemSelected]}
      onPress={onPress}
    >
      <Text style={[styles.playerName, isNeutral && styles.playerNameUnselected]}>
        {name}
      </Text>
      {isWinner && (
        <View style={styles.statusBadge}>
          <TrophyIcon color={colors.primary} size={32} weight="regular" />
          <Text style={[styles.statusLabel, styles.statusLabelWinner]}>Gagnant</Text>
        </View>
      )}
      {isLoser && (
        <View style={styles.statusBadge}>
          <SmileySadIcon color={colors.team.red} size={32} weight="regular" />
          <Text style={[styles.statusLabel, styles.statusLabelLoser]}>Perdant</Text>
        </View>
      )}
    </Pressable>
  );
}

interface EloResultItemProps {
  name: string;
  newElo: number;
  delta: number;
  delay: number;
}

function EloResultItem({ name, newElo, delta, delay }: EloResultItemProps) {
  const initialElo = newElo - delta;
  const animValue = useRef(new Animated.Value(initialElo)).current;
  const deltaOpacity = useRef(new Animated.Value(0)).current;
  const [displayedElo, setDisplayedElo] = useState(initialElo);

  useEffect(() => {
    const timer = setTimeout(() => {
      const listenerId = animValue.addListener(({ value }) => {
        setDisplayedElo(Math.round(value));
      });

      Animated.sequence([
        Animated.timing(animValue, {
          toValue: newElo,
          duration: ANIM_DURATION,
          useNativeDriver: false,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(deltaOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        animValue.removeListener(listenerId);
      });
    }, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPositive = delta >= 0;
  const deltaColor = isPositive ? colors.secondary : colors.team.red;
  const deltaLabel = isPositive ? `+${delta}` : `${delta}`;

  return (
    <View style={styles.resultItem}>
      <Text style={styles.resultName}>{name}</Text>
      <View style={styles.resultEloBlock}>
        <Text style={styles.resultElo}>{displayedElo}</Text>
        <Animated.Text
          style={[styles.resultDelta, { color: deltaColor, opacity: deltaOpacity }]}
        >
          {deltaLabel}
        </Animated.Text>
      </View>
    </View>
  );
}

interface BackButtonProps {
  onPress: () => void;
}

function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel="Retour"
      testID="add-match-back-button"
    >
      <ArrowLeftIcon color={colors.textSmooth} size={32} weight="regular" />
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  flex: {
    flex: 1,
  },
  screen: {
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing[4],
  },
  loadingRow: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  listItem: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    paddingHorizontal: spacing[6],
  },
  listItemSelected: {
    backgroundColor: colors.darkSmooth,
  },
  listItemDragging: {
    backgroundColor: colors.darkSmoother,
    elevation: 8,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  listItemHover: {
    backgroundColor: colors.dark,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    backgroundColor: colors.darkSmoother,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontFamily: typography.family.body,
    fontSize: 14,
    fontWeight: typography.weight.semiBold,
    color: colors.textSmooth,
    includeFontPadding: false,
  },
  dragHandle: {
    padding: spacing[2],
  },
  playerName: {
    ...figmaTextStyles.buttonActions,
    flex: 1,
    color: colors.white,
    includeFontPadding: false,
  },
  playerNameUnselected: {
    color: colors.textSmooth,
  },
  addPlayerRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
  },
  addPlayerLabel: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
  },
  addPlayerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: colors.darkSmooth,
  },
  addPlayerInput: {
    flex: 1,
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
    paddingVertical: spacing[2],
  },
  addPlayerConfirmBtn: {
    padding: spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statusLabel: {
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 30.6,
    fontWeight: typography.weight.regular,
    letterSpacing: -0.72,
    includeFontPadding: false,
  },
  statusLabelWinner: {
    color: colors.primary,
  },
  statusLabelLoser: {
    color: colors.team.red,
  },
  resultBackBtn: {
    position: 'absolute',
    top: spacing[4],
    left: spacing[4],
    zIndex: 1,
  },
  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultList: {
    width: '100%',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[4],
    width: '100%',
  },
  resultName: {
    ...figmaTextStyles.buttonActions,
    flex: 1,
    color: colors.white,
    includeFontPadding: false,
  },
  resultEloBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[1],
  },
  resultElo: {
    ...figmaTextStyles.numberXs40,
    color: colors.white,
    includeFontPadding: false,
  },
  resultDelta: {
    ...figmaTextStyles.bodyXs,
    width: 32,
    textAlign: 'right',
    includeFontPadding: false,
  },
});
