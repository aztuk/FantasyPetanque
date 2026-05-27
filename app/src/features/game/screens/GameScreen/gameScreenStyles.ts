import { StyleSheet } from 'react-native';
import { colors, componentSizes } from '../../../../shared/constants';
import { gameUiColors } from '../../components/gameUiTheme';

// ScoreBoard section heights matching Figma
export const MENE_HEIGHT = 150;   // big score bars only
export const SCORE_TOTAL_HEIGHT = 59;  // dark total bar only (always visible)

export const gameScreenStyles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
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
  ruleTopContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHead: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  ruleSetupContent: {
    flex: 1,
    width: '100%',
  },
  ruleSetupScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  contratRuleSetupScrollContent: {
    paddingHorizontal: 0,
    paddingTop: 80,
    paddingBottom: 0,
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 80,
  },
  casinoRuleScrollContent: {
    paddingBottom: 24,
  },
  drawerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  meneWrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  preMeneRule: {
    marginTop: 0,
  },
  bottomActions: {
    width: '100%',
    gap: 4,
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
