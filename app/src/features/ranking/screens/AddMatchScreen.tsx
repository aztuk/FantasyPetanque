import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  type GestureResponderHandlers,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
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
import { useGameStore } from '../../game/state/gameStore';
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
const PLAYER_SELECT_ITEM_HEIGHT = 56;
const WINNER_SORT_ITEM_HEIGHT = 64;

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddMatch'>;
type Route = RouteProp<RootStackParamList, 'AddMatch'>;

export function AddMatchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sport, source } = route.params;
  const markRankingMatchSaved = useGameStore((state) => state.markRankingMatchSaved);
  const isGameResultFlow = source === 'gameResult';

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

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

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

    if (sport === 'petanque') {
      const hasUndecided = selectedPlayers.some(
        (p) => !statuses[p.id] || statuses[p.id] === 'neutral',
      );
      const finalStatuses = { ...statuses };
      if (hasUndecided) {
        selectedPlayers.forEach((p) => {
          if (!finalStatuses[p.id] || finalStatuses[p.id] === 'neutral') {
            finalStatuses[p.id] = 'loser';
          }
        });
        setStatuses(finalStatuses);
        await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      }
      setSubmitting(true);
      try {
        const winners = selectedPlayers.filter((p) => finalStatuses[p.id] === 'winner');
        const losers = selectedPlayers.filter((p) => finalStatuses[p.id] === 'loser');
        const deltas = computeEloDeltas(winners, losers, sport);
        await saveMatch(sport, winners, losers, deltas);
        setEloDeltas(deltas);
        setResultPlayers(
          selectedPlayers.map((p) => ({
            ...p,
            eloPetanque: getPlayerElo(p, sport) + (deltas[p.id] ?? 0),
          })),
        );
        if (isGameResultFlow) markRankingMatchSaved();
        setStep('result');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const deltas = computeEloRankedDeltas(rankedOrder, sport);
      await saveMatchRanked(sport, rankedOrder, deltas);
      setEloDeltas(deltas);
      setResultPlayers(
        rankedOrder.map((p) => ({
          ...p,
          eloFlechettes: getPlayerElo(p, sport) + (deltas[p.id] ?? 0),
        })),
      );
      if (isGameResultFlow) markRankingMatchSaved();
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
  const canConfirmPetanque = winnersCount >= 1;
  const step2ButtonLabel =
    sport === 'flechettes'
      ? 'CONFIRMER'
      : winnersCount === 0
        ? 'ENCORE 1 GAGNANT'
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
        doneLabel={isGameResultFlow ? 'RETOUR AU RÉSULTAT' : 'RETOUR AU CLASSEMENT'}
      />
    );
  }

  const stepTitle =
    step === 'players'
      ? 'Qui a joué ?'
      : sport === 'flechettes'
        ? 'Qui a gagné?'
        : 'Qui a gagné ?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.screen}>
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

          {!(step === 'players' && addingPlayer && keyboardVisible) && (
            <FullWidthCtaButton
              label={step === 'players' ? 'SUIVANT' : step2ButtonLabel}
              onPress={step === 'players' ? handleGoToStep2 : handleConfirmMatch}
              disabled={step === 'players' ? !canProceedStep1 : !canConfirmStep2 || submitting}
              testID="add-match-next-button"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Drag/drop list ───────────────────────────────────────────────────────────

interface DragOrderListProps {
  players: Player[];
  onReorder: (players: Player[]) => void;
}

const DRAG_LAYOUT_ANIM = {
  duration: 180,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
};

function DragOrderList({ players, onReorder }: DragOrderListProps) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingPlayerId, setDraggingPlayerId] = useState<string | null>(null);
  const dragY = useRef(new Animated.Value(0)).current;
  const dragOriginY = useRef(0);
  const draggingIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const currentOrder = useRef(players);
  currentOrder.current = players;

  // Swap the dragged item to a new position using LayoutAnimation.
  // The animation IS the commit — no offset/array sync problem, no flash.
  const doSwap = useCallback(
    (targetIndex: number) => {
      const fromIdx = draggingIndexRef.current;
      if (fromIdx === null || fromIdx === targetIndex) return;
      const nextOrder = [...currentOrder.current];
      const [moved] = nextOrder.splice(fromIdx, 1);
      nextOrder.splice(targetIndex, 0, moved);
      LayoutAnimation.configureNext(DRAG_LAYOUT_ANIM);
      draggingIndexRef.current = targetIndex;
      hoverIndexRef.current = targetIndex;
      setDraggingIndex(targetIndex);
      onReorder(nextOrder);
    },
    [onReorder],
  );

  const finishDrag = useCallback(
    (shouldCommit: boolean) => {
      const fromIndex = draggingIndexRef.current;
      const toIndex = hoverIndexRef.current;
      isDraggingRef.current = false;
      draggingIndexRef.current = null;
      hoverIndexRef.current = null;
      dragY.stopAnimation();
      setDraggingIndex(null);
      setDraggingPlayerId(null);
      // Array already committed via doSwap — only need to reorder if no swap happened
      if (shouldCommit && fromIndex !== null && toIndex !== null && fromIndex !== toIndex) {
        const nextOrder = [...currentOrder.current];
        const [moved] = nextOrder.splice(fromIndex, 1);
        nextOrder.splice(toIndex, 0, moved);
        onReorder(nextOrder);
      }
    },
    [dragY, onReorder],
  );

  const makePanResponder = useCallback(
    (index: number) =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: () => true,
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          const player = currentOrder.current[index];
          if (!player) return;
          isDraggingRef.current = true;
          draggingIndexRef.current = index;
          hoverIndexRef.current = index;
          dragOriginY.current = evt.nativeEvent.pageY - index * WINNER_SORT_ITEM_HEIGHT;
          dragY.setValue(index * WINNER_SORT_ITEM_HEIGHT);
          setDraggingIndex(index);
          setDraggingPlayerId(player.id);
        },
        onPanResponderMove: (evt) => {
          if (!isDraggingRef.current) return;
          const rawY = evt.nativeEvent.pageY - dragOriginY.current;
          const clamped = Math.max(0, Math.min(rawY, (currentOrder.current.length - 1) * WINNER_SORT_ITEM_HEIGHT));
          dragY.setValue(clamped);
          const next = Math.max(0, Math.min(
            Math.round(clamped / WINNER_SORT_ITEM_HEIGHT),
            currentOrder.current.length - 1,
          ));
          if (next !== draggingIndexRef.current) {
            doSwap(next);
          }
        },
        onPanResponderRelease: () => finishDrag(true),
        onPanResponderTerminate: () => finishDrag(false),
      }),
    [dragY, doSwap, finishDrag],
  );

  const total = players.length;

  return (
    <View style={styles.winnerSortList}>
      <View style={[styles.winnerSortTrack, { height: total * WINNER_SORT_ITEM_HEIGHT }]}>
        {players.map((player, index) => {
          const isDragging = draggingPlayerId === player.id;
          const panResponder = makePanResponder(index);
          const isFirst = index === 0;
          const isLast = index === total - 1;
          const selected: 'first' | 'between' | 'last' = isFirst ? 'first' : isLast ? 'last' : 'between';

          return (
            <View
              key={player.id}
              style={[
                styles.winnerSortRow,
                { top: index * WINNER_SORT_ITEM_HEIGHT, opacity: isDragging ? 0 : 1 },
              ]}
            >
              <WinnerSortItem
                name={player.name}
                selected={selected}
                rank={index + 1}
                panHandlers={panResponder.panHandlers}
                testID={`rank-order-item-${index + 1}`}
                dragTestID={`drag-handle-${index}`}
              />
            </View>
          );
        })}
        {draggingPlayerId !== null && draggingIndex !== null && (
          <Animated.View
            style={[styles.winnerSortDraggedOverlay, { top: dragY }]}
            pointerEvents="none"
          >
            <Text style={styles.winnerSortDraggedName} numberOfLines={1}>
              {players.find((p) => p.id === draggingPlayerId)?.name ?? ''}
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

export function getWinnerSortVisualIndex(
  index: number,
  draggingIndex: number | null,
  hoverIndex: number | null,
): number {
  if (draggingIndex === null || hoverIndex === null || index === draggingIndex) return index;
  if (draggingIndex < hoverIndex && index > draggingIndex && index <= hoverIndex) return index - 1;
  if (draggingIndex > hoverIndex && index >= hoverIndex && index < draggingIndex) return index + 1;
  return index;
}

export function getWinnerSortOffset(
  index: number,
  draggingIndex: number | null,
  hoverIndex: number | null,
): number {
  return (getWinnerSortVisualIndex(index, draggingIndex, hoverIndex) - index) * WINNER_SORT_ITEM_HEIGHT;
}

interface WinnerSortItemProps {
  name: string;
  selected: 'first' | 'between' | 'last';
  rank: number;
  panHandlers?: GestureResponderHandlers;
  testID: string;
  dragTestID: string;
}

function WinnerSortItem({ name, selected, rank, panHandlers, testID, dragTestID }: WinnerSortItemProps) {
  const isFirst = selected === 'first';
  const isLast = selected === 'last';
  const isBetween = selected === 'between';

  return (
    <View
      {...(panHandlers ?? {})}
      style={styles.winnerSortItem}
      testID={testID}
    >
      <View
        style={styles.winnerSortDragHandle}
        testID={dragTestID}
        accessibilityRole="button"
        accessibilityLabel={`Déplacer ${name}`}
      >
        <DotsSixVerticalIcon color={colors.textSmooth} size={24} weight="regular" />
      </View>
      <View style={styles.winnerSortNameLayer}>
        <Text style={styles.winnerSortName} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.winnerSortRank}>
        {isFirst && <TrophyIcon color={colors.primary} size={32} weight="regular" />}
        {isLast && <SmileySadIcon color={colors.team.red} size={32} weight="regular" />}
        {isBetween && <Text style={styles.winnerSortRankLabel}>{formatOrdinalRank(rank)}</Text>}
      </View>
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
  doneLabel: string;
}

function ResultView({
  sport,
  players,
  eloDeltas,
  statuses,
  rankedOrder,
  onCancel,
  onDone,
  doneLabel,
}: ResultViewProps) {
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
          label={doneLabel}
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

function formatOrdinalRank(rank: number): string {
  return `${rank}e`;
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
    height: PLAYER_SELECT_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    paddingHorizontal: spacing[6],
  },
  listItemSelected: {
    backgroundColor: colors.darkSmooth,
  },
  winnerSortList: {
    flex: 1,
  },
  winnerSortTrack: {
    position: 'relative',
    width: '100%',
  },
  winnerSortRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  winnerSortItem: {
    width: '100%',
    height: WINNER_SORT_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    paddingLeft: spacing[10],
    paddingRight: spacing[6],
    paddingVertical: spacing[4],
    backgroundColor: colors.dark,
  },
  winnerSortDraggedOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: WINNER_SORT_ITEM_HEIGHT,
    zIndex: 100,
    backgroundColor: colors.darkSmoother,
    elevation: 8,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    justifyContent: 'center',
    paddingLeft: spacing[10],
    paddingRight: spacing[6],
  },
  winnerSortDraggedName: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
  },
  winnerSortDragHandle: {
    position: 'absolute',
    left: spacing[2],
    top: spacing[5],
    width: spacing[6],
    height: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerSortNameLayer: {
    flex: 1,
    minWidth: 0,
  },
  winnerSortName: {
    ...figmaTextStyles.buttonActions,
    color: colors.white,
    includeFontPadding: false,
  },
  winnerSortRank: {
    width: spacing[8],
    height: spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerSortRankLabel: {
    ...figmaTextStyles.buttonActions,
    color: colors.textSmooth,
    includeFontPadding: false,
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
