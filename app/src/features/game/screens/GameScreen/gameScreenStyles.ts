import { StyleSheet } from 'react-native';
import { gameUiColors } from '../../components/gameUiTheme';

export const COMPACT_SCORE_HEIGHT = 59;

export const gameScreenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: gameUiColors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  fantasyContent: {
    flex: 1,
    width: '100%',
  },
  centerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleSetupContent: {
    flex: 1,
    width: '100%',
  },
  ruleSetupScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  ruleSetupScrollContentFocused: {
    justifyContent: 'flex-start',
    paddingTop: 24,
    paddingBottom: 220,
  },
  simpleHistory: {
    flex: 1,
  },
  ruleArea: {
    flex: 1,
    width: '100%',
  },
  ruleScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20,
    paddingBottom: COMPACT_SCORE_HEIGHT + 20,
  },
  casinoRuleScrollContent: {
    paddingTop: 0,
    paddingBottom: 260,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionScoreGap: {
    height: 2,
    width: '100%',
    backgroundColor: gameUiColors.background,
  },
  drawerGradient: {
    position: 'absolute',
    bottom: COMPACT_SCORE_HEIGHT,
    left: 0,
    right: 0,
    height: 80,
  },
  preMeneRule: {
    marginTop: -16,
  },
  vetoRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
  },
  vetoButton: {
    flex: 1,
  },
  endContent: {
    flex: 1,
    width: '100%',
  },
  endHistory: {
    flex: 1,
  },
});
