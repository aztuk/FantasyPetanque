# CLAUDE.md — Fantasy Pétanque

## Protocole de synchronisation roadmap

Exécuter ce protocole **uniquement quand l'utilisateur demande la prochaine tâche** — formulations typiques : "quelle est la prochaine tâche ?", "qu'est-ce qu'on fait ?", "on commence quoi ?", ou équivalent. Peut aussi être déclenché via `/start`.

**Ne pas exécuter automatiquement à chaque début de session.**

1. Lire l'inbox de `TODO.md` — si des items sont présents, les fusionner avec `ROADMAP.md` par priorité, puis vider l'inbox.
2. Sinon, prendre la prochaine tâche `[ ]` de `ROADMAP.md`, analyser (scope, archi, tests), poser les questions nécessaires, puis marquer `[en cours]` avant de coder.
3. Une fois le développement terminé : **demander à l'utilisateur d'effectuer un test manuel** (décrire précisément le scénario), et attendre sa validation explicite.
4. Seulement après validation : committer, passer à `[fait]` dans `ROADMAP.md`, et mettre à jour `MEMORY.md` si besoin.

---

## Contexte du projet

Application mobile iOS/Android permettant de jouer à la pétanque avec des règles "fantasy" tirées aléatoirement à chaque mène. L'app compte les scores, applique automatiquement les bonus/malus/effets spéciaux, et conserve un historique de partie.

**Spec principale** : `fantasy-petanque.md` — c'est la source de vérité absolue.

---

## Stack technique

- **React Native** avec **Expo** (SDK 51+)
- **TypeScript** strict
- **Zustand** pour l'état global
- **Jest** + **React Native Testing Library** pour les tests
- **React Navigation** (Stack + Bottom Tabs)
- **Expo Router** si applicable

---

## Architecture du projet

```
src/
  app/
    navigation/         # Navigation principale
  features/
    game/
      components/       # Composants UI du jeu
      screens/          # Écrans de jeu (GameScreen, ScoringScreen, SummaryScreen)
      hooks/            # Hooks React (useGame, useRuleDraw, etc.)
      state/            # Store Zustand de partie
  domain/
    game/
      models/           # Types TypeScript (Game, Round, Rule, Team, Score)
      rules/            # Logique de chaque règle
      scoring/          # Moteur de score (applyScore, applyBonus, etc.)
      engine/           # Moteur de jeu (drawRule, applyVeto, resolveRound)
  data/
    rules/              # Banque de règles (données JSON/TS)
  shared/
    components/         # Composants réutilisables (Button, ScoreBlock)
    constants/          # Constantes (WINNING_SCORE = 13, etc.)
    utils/              # Utilitaires
  __tests__/            # Tests unitaires et d'intégration
```

---

## Conventions de code

- **TypeScript strict** : `strict: true` dans tsconfig, pas de `any` implicite
- **Nommage** :
  - Composants : `PascalCase` (ex: `ScoreBlock`, `RuleCard`)
  - Fonctions/hooks : `camelCase` (ex: `drawRule`, `useGameState`)
  - Constantes : `UPPER_SNAKE_CASE` (ex: `WINNING_SCORE`, `MAX_MALUS_CENSURE`)
  - Fichiers : `kebab-case` pour les fichiers de données, `PascalCase` pour les composants
  - Types/interfaces : `PascalCase` avec préfixe `I` pour les interfaces si nécessaire
- **Exports** : préférer les named exports
- **Pas de `console.log`** en production (utiliser un logger conditionnel si besoin)

---

## Modèle de données clé

```typescript
type Team = 'blue' | 'red';

interface GameState {
  mode: 'simple' | 'fantasy';
  rounds: Round[];
  currentRound: CurrentRound | null;
  scores: Record<Team, number>;
  vetos: Record<Team, boolean>; // true = véto disponible
  playedRules: string[];        // ids des règles jouées ce cycle
  pendingNextRule: Rule | null; // règle pré-tirée par Totem
  immuneTeam: Team | null;      // équipe immunisée (après Totem)
}

interface Round {
  number: number;
  rule: Rule | null;
  normalPoints: Record<Team, number>;
  bonuses: BonusMalus[];
  maluses: BonusMalus[];
  specialEffects: SpecialEffect[];
  scoreAfter: Record<Team, number>;
  vetoUsed: Team | null;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  tags: RuleTag[];
  uiType: 'none' | 'bonus-buttons' | 'setup' | 'complex';
  condition?: (state: GameState) => boolean;
  skipNormalScore?: boolean;
}

type RuleTag =
  | 'fast'
  | 'setup'
  | 'specific'
  | 'bonus'
  | 'malus'
  | 'skip-normal-score'
  | 'requires-next-rule'
  | 'totem-compatible'
  | 'needs-manual-resolution'
  | 'score-modifier'
  | 'auto-resolution'
  | 'specific-ui'
  | 'gesture'
  | 'auto-arbitrage'
  | 'scoring-constraint'
  | 'instant-resolution'
  | 'bet'
  | 'not-available-at-zero'
  | 'future-rule'
  | 'skip-random-draw-next-turn'
  | 'mission'
  | 'reroll';
```

---

## Règles produit importantes

### Score
- Une équipe ne peut jamais descendre sous 0
- Score cible par défaut : **13 points**
- Une seule équipe marque les points normaux par mène
- Les bonus/malus sont cumulables selon les limites de chaque règle

### Tirage de règles
- Pool sans répétition jusqu'à épuisement, puis recommence
- Véto = relance immédiate, la règle refusée peut réapparaître plus tard
- Totem d'immunité : tire une règle `totem-compatible` pour la mène suivante
- Si aucune règle `totem-compatible` disponible dans le pool actuel → recycler les règles compatibles déjà jouées

### Décisions produit prises (ambiguïtés résolues)

1. **Mène Totem nulle** : pas d'immunité accordée, la règle suivante s'applique aux deux équipes.
2. **Totem sans règle compatible disponible** : recycler les règles `totem-compatible` déjà jouées pour ce tirage uniquement.
3. **Contrat** : les deux équipes peuvent choisir la même mission (non interdit par la spec).
4. **Véto en chaîne** : chaque véto est indépendant — après un premier véto, l'autre équipe peut vétower la nouvelle règle.

---

## Règles de travail obligatoires

### Pas de checkup visuel seul

Ne jamais conclure qu'une fonctionnalité est correcte uniquement parce qu'elle "semble bonne visuellement".

Chaque session doit inclure au moins :
- des tests unitaires ou d'intégration
- une vérification fonctionnelle du comportement
- une vérification de non-régression (`npm test`)
- un commit Git clair si le travail est valide

### Tests obligatoires

À chaque session de développement :
- lancer les tests : `npm test`
- ajouter ou modifier les tests pour couvrir les nouvelles fonctionnalités
- ne pas laisser une fonctionnalité critique sans test
- documenter ce qui a été testé

Tests minimum obligatoires :
- ajout de points normaux
- annulation de points normaux
- désactivation de l'équipe adverse pendant le score
- bonus/malus (Gauche caviar, Censure)
- score minimum à 0
- Casino (mise, résolution, gains/pertes)
- Prédiction (vérification auto, malus si réussie)
- Totem d'immunité (tirage de la prochaine règle, immunité)
- L'impair contre-attaque (résolution auto)
- Sortie de porc (saut du score normal)
- Assurance vie (effet sur score)
- Frontière (affichage du rappel)
- tirage sans répétition
- véto
- historique de mène

### Commit obligatoire (après validation manuelle)

À la fin de chaque session cohérente, et **uniquement après que l'utilisateur a validé le test manuel** :
- `git add` des fichiers concernés
- message de commit clair et précis
- pas de mélange de sujets non liés

**Ne jamais committer ni marquer `[fait]` dans `ROADMAP.md` sans confirmation explicite de l'utilisateur.**

Format de commit recommandé :
```
feat(rules): add Casino rule with betting UI
fix(scoring): prevent score going below zero
test(engine): add veto and draw tests
```

### Questions produit/design

Si une incohérence, une ambiguïté ou un problème apparaît :
1. Décrire précisément le problème
2. Proposer 1 à 3 options
3. Recommander une option
4. **Poser la question** si la décision impacte le flow utilisateur ou le score

Pour les détails mineurs : prendre une décision raisonnable, la documenter ici, et continuer.

---

## Commandes utiles

```bash
# Démarrer le projet
npx expo start

# Tests
npm test
npm test -- --watch
npm test -- --coverage

# TypeScript
npx tsc --noEmit

# Lint
npm run lint
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `fantasy-petanque.md` | Spec principale — source de vérité |
| `src/data/rules/rules.ts` | Banque de toutes les règles |
| `src/domain/game/engine/` | Moteur de tirage et de résolution |
| `src/domain/game/scoring/` | Moteur de score |
| `src/features/game/state/gameStore.ts` | État global de partie (Zustand) |
| `src/__tests__/` | Tous les tests |

---

## Interdictions

- Ne jamais conclure une fonctionnalité terminée sur la seule base d'un test visuel
- Ne jamais sauter les tests pour livrer plus vite
- Ne jamais mélanger plusieurs sujets dans un commit
- Ne jamais inventer silencieusement une décision produit structurante
- Ne jamais ajouter de `any` TypeScript sans justification explicite
- **Ne jamais committer sans avoir demandé un test manuel à l'utilisateur et reçu sa validation explicite**
- **Ne jamais modifier `ROADMAP.md` (passer `[en cours]` → `[fait]`) sans validation manuelle confirmée**
