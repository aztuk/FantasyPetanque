// Figma design tokens — source: Design.md (node-id=26:1950)
// RULE: Never add a color here that doesn't exist in Design.md.
const palette = {
  primary:        '#E7C241',
  secondary:      '#41E79A',
  dark:           '#28261F',
  darkSmooth:     '#3B382E',
  darkSmoother:   'rgba(59, 56, 46, 0.20)',
  disabled:       '#453F2D',
  textSmooth:     '#949084',
  white:          '#ECEBE8',
  redTeamSurface: '#DC3939',
  redTeamText:    '#E86868',
  redTeamDark:    '#A92828',
  blueTeamSurface:'#395ADC',
  blueTeamText:   '#778EED',
  blueTeamDark:   '#1D3287',
  shadow:         '#1F1D15',
} as const;

export const colors = {
  primary:      palette.primary,
  secondary:    palette.secondary,
  dark:         palette.dark,
  darkSmooth:   palette.darkSmooth,
  darkSmoother: palette.darkSmoother,
  disabled:     palette.disabled,
  textSmooth:   palette.textSmooth,
  white:        palette.white,
  shadow:       palette.shadow,
  team: {
    blue:     palette.blueTeamSurface,
    red:      palette.redTeamSurface,
    blueText: palette.blueTeamText,
    redText:  palette.redTeamText,
    blueDark: palette.blueTeamDark,
    redDark:  palette.redTeamDark,
  },
} as const;

// Minimum 18px — rien en dessous
export const typography = {
  family: {
    // Source Figma / Design.md typography tokens.
    // TODO A REMPLACER ou documenter comme exception dans Design.md.
    display: 'RoadRage_400Regular',
    body: 'GoogleSansFlex_400Regular',
    bodySemibold: 'GoogleSansFlex_600SemiBold',
    bodyBold: 'GoogleSansFlex_700Bold',
    number: 'CascadiaMono_400Regular',
    numberBold: 'CascadiaMono_700Bold',
  },
  // TODO A REMPLACER: legacy scale. Use figmaTextStyles instead of raw sizes.
  size: {
    base: 18,  // minimum absolu — body, labels, notes
    md: 20,    // corps mis en avant
    lg: 24,    // titres d'options, valeurs
    xl: 36,    // titres d'étape, en-têtes de section
    xxl: 44,   // noms de règle, grandes déclarations
    hero: 64,  // titre HomeScreen
    score: 80, // chiffres du score
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// Presets typographiques complets — toutes les propriétés de police en un seul endroit.
// Usage dans StyleSheet : { ...textStyles.ctaLabel, color: ... }
// Figma typography tokens - source: Design.md (node-id=26:1951).
// RULE: New UI work must use these styles, then map them per screen in Design.md.
export const figmaTextStyles = {
  pageTitles: {
    fontFamily: typography.family.bodyBold,
    fontSize: 28,
    lineHeight: 47.6,
    fontWeight: typography.weight.bold,
    letterSpacing: -1.12,
  },
  buttonCTA: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 28,
    lineHeight: 47.6,
    fontWeight: typography.weight.semibold,
    letterSpacing: -0.84,
    textTransform: 'uppercase' as const,
  },
  buttonActions: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 21,
    lineHeight: 31.5,
    fontWeight: typography.weight.semibold,
    letterSpacing: -0.84,
  },
  bodyMd: {
    fontFamily: typography.family.body,
    fontSize: 21,
    lineHeight: 35.7,
    fontWeight: typography.weight.regular,
    letterSpacing: -0.84,
  },
  bodySm: {
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 30.6,
    fontWeight: typography.weight.regular,
    letterSpacing: -0.72,
  },
  labels: {
    fontFamily: typography.family.bodyBold,
    fontSize: 18,
    lineHeight: 18,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.72,
    textTransform: 'uppercase' as const,
  },
  numberLg100: {
    fontFamily: typography.family.number,
    fontSize: 60,
    lineHeight: 102,
    fontWeight: typography.weight.regular,
    letterSpacing: -2.4,
  },
  numberMd80: {
    fontFamily: typography.family.number,
    fontSize: 48,
    lineHeight: 81.6,
    fontWeight: typography.weight.regular,
    letterSpacing: -1.92,
  },
  numberSm60: {
    fontFamily: typography.family.number,
    fontSize: 40,
    lineHeight: 68,
    fontWeight: typography.weight.regular,
    letterSpacing: -1.6,
  },
  numberXs40: {
    fontFamily: typography.family.numberBold,
    fontSize: 24,
    lineHeight: 40.8,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.96,
  },
} as const;

// TODO A REMPLACER: legacy typography aliases.
// Keep temporarily so the app remains stable while screens migrate one by one.
export const textStyles = {
  // Libellés de boutons CTA pleine largeur (letterSpacing resserré pour l'impact visuel)
  // → FullWidthCtaButton, SetupScreen (choiceLabel, bottomButtonLabel), CancelGameSheet (cancelLabel, confirmLabel)
  // TODO A REMPLACER par figmaTextStyles.buttonCTA.
  ctaLabel: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 28,
    lineHeight: 54,
    fontWeight: typography.weight.semibold,
    letterSpacing: -1.2,
  },
  // Titres et boutons dans le contexte de jeu (letterSpacing neutre)
  // → GameActionButton, AppHeader (titre), RuleDisplay (nom de règle), GameScoreBoard (modificateur +/-)
  // TODO A REMPLACER par figmaTextStyles.pageTitles ou figmaTextStyles.buttonCTA selon l'ecran.
  titleLg: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 28,
    lineHeight: 54,
    fontWeight: typography.weight.semibold,
    letterSpacing: -1.2,
  },
  // Valeurs numériques moyennes — scores et totaux
  // → GameScoreBoard (total sous la mène), GameHistoryList (score par mène)
  // TODO A REMPLACER par figmaTextStyles.numberXs40.
  labelMd: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 24,
    lineHeight: 43,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0,
  },
  // Texte de marque et unités de mesure (letterSpacing légèrement resserré)
  // → BrandTagline ("Le jeu qui vous fera perdre..."), SetupScreen (unité du picker ex: "pts")
  // TODO A REMPLACER apres mapping ecran Home dans Design.md.
  tagline: {
    fontFamily: typography.family.body,
    fontSize: 21,
    lineHeight: 34,
    fontWeight: typography.weight.regular,
    letterSpacing: -1,
  },
  // Libellés des boutons d'action par équipe et des steppers
  // → GameTeamActionRow (label équipe), CasinoUI (betLabel), PredictionUI (readonlyLabel), TeamStepper (label)
  // TODO A REMPLACER par figmaTextStyles.buttonActions.
  actionLabel: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 18,
    lineHeight: 32,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0,
  },
  // Corps de texte long — description des règles
  // → RuleDisplay (description, paragraphes)
  // TODO A REMPLACER par figmaTextStyles.bodyMd.
  bodyMd: {
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: typography.weight.regular,
    letterSpacing: -0.6,
  },
  // Texte secondaire — notes, annotations, numéros de mène
  // → RuleDisplay (note de bas de règle, texte immunité), GameHistoryList (label "Mène XX")
  // TODO A REMPLACER par figmaTextStyles.bodySm.
  bodySm: {
    fontFamily: typography.family.body,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: typography.weight.regular,
    letterSpacing: -0.4,
  },
  // Texte display décoratif (police RoadRage)
  // → DebugModeBadge ("Debug MODE")
  // TODO A REMPLACER ou documenter comme exception dans Design.md.
  displaySm: {
    fontFamily: typography.family.display,
    fontSize: 45,
    lineHeight: 54,
    fontWeight: typography.weight.regular,
    letterSpacing: 0,
  },
  // Grandes valeurs numériques interactives dans les règles
  // → TeamStepper (valeur centrale), CasinoUI (mise en lecture seule), PredictionUI (prédiction en lecture seule)
  // TODO A REMPLACER par figmaTextStyles.numberSm60 ou figmaTextStyles.numberXs40 selon l'ecran.
  uiValueLg: {
    fontFamily: typography.family.bodySemibold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: typography.weight.semibold,
    letterSpacing: 0,
  },
  // Options du picker Setup — état non sélectionné (letterspacing progressif via animation)
  // → SetupScreen (pickerText, base de l'interpolation animée)
  // TODO A REMPLACER par figmaTextStyles.numberMd80.
  pickerText: {
    fontFamily: typography.family.bodyBold,
    fontSize: 48,
    lineHeight: 82,
    fontWeight: typography.weight.bold,
    letterSpacing: -1.92,
  },
  // Options du picker Setup — état sélectionné (valeur centrale en évidence)
  // → SetupScreen (pickerSelectedText, cible de l'interpolation animée)
  // TODO A REMPLACER par figmaTextStyles.numberLg100.
  pickerSelected: {
    fontFamily: typography.family.bodyBold,
    fontSize: 60,
    lineHeight: 102,
    fontWeight: typography.weight.bold,
    letterSpacing: -2.4,
  },
} as const;


export const spacing = {
  half: 2,
  control: 10,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  input: 10,
  lg: 12,
  xl: 16,
  sheet: 30,
  pill: 40,
  round: 70,
} as const;

export const componentSizes = {
  buttonHeight: 86,
  buttonFantasyHeight: 80,
  iconButton: 56,
  headerHeight: 72,
  headerNoTitleHeight: 88,
  scoreBoardHeight: 215,
  compactScoreHeight: 59,
  historyItemHeight: 49,
  setupOptionHeight: 284,
  wheelPickerWidth: 121,
  wheelPickerHeight: 480,
  wheelPickerItemHeight: 100,
  wheelPickerSelectedHeight: 120,
} as const;

export const opacity = {
  disabled: 0.35,
} as const;

export const shadows = {
  title: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  alertBox: {
    shadowColor: palette.dark,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  debug: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
