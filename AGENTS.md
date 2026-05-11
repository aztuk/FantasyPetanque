# AGENTS.md — Fantasy Pétanque

## Contexte du projet

Application mobile iOS/Android — Fantasy Pétanque.

Permet de jouer à la pétanque avec des règles spéciales tirées aléatoirement à chaque mène. L'app compte les scores, applique les bonus/malus/effets automatiquement, et conserve un historique complet.

**Spec principale** : `fantasy-petanque.md` — source de vérité absolue. En cas de doute, la spec prime sur tout le reste.

---

## Stack technique

- **React Native** + **Expo** (SDK 51+)
- **TypeScript** strict
- **Zustand** pour l'état global de partie
- **Jest** + **React Native Testing Library** pour les tests
- **React Navigation** pour la navigation

---

## Architecture

```
src/
  app/navigation/           # Stack de navigation
  features/game/
    components/             # Composants UI du jeu
    screens/                # Écrans (GameScreen, ScoringScreen, SummaryScreen)
    hooks/                  # Hooks React (useGame, useRuleDraw)
    state/                  # Store Zustand
  domain/game/
    models/                 # Types TypeScript
    rules/                  # Logique de chaque règle
    scoring/                # Moteur de score
    engine/                 # Moteur de tirage et résolution
  data/rules/               # Banque de règles (données)
  shared/
    components/             # Composants partagés
    constants/              # Constantes globales
    utils/                  # Utilitaires
  __tests__/                # Tests
```

**Principe fondamental** : séparer strictement le moteur de jeu (logique pure, testable sans UI) des composants React Native.

---

## Conventions de code

- TypeScript strict — pas de `any` implicite
- Composants : `PascalCase`
- Fonctions/hooks : `camelCase`
- Constantes : `UPPER_SNAKE_CASE`
- Fichiers de données : `kebab-case`
- Named exports préférés aux default exports

---

## Règles de travail obligatoires

### Interdiction du checkup visuel seul

Ne jamais conclure qu'une fonctionnalité est correcte uniquement parce qu'elle "semble bonne visuellement".

Chaque session doit inclure :
- des tests unitaires ou d'intégration
- une vérification fonctionnelle du comportement attendu
- une vérification de non-régression (`npm test`)
- un commit Git si le travail est valide

### Tests obligatoires

À chaque session :
1. Lancer les tests existants : `npm test`
2. Ajouter les tests couvrant les nouvelles fonctionnalités
3. Ne pas laisser de fonctionnalité critique sans test

Tests minimum requis (voir `CLAUDE.md` pour la liste complète) :
- score normal (ajout, annulation)
- désactivation de l'équipe adverse
- bonus/malus avec limites
- score minimum à 0
- Casino, Prédiction, Totem d'immunité
- L'impair contre-attaque
- Assurance vie, Frontière
- Tirage sans répétition + véto
- Historique de mène

### Commit obligatoire

En fin de session cohérente :
- `git add` des fichiers concernés
- message de commit explicite et ciblé
- pas de mélange de sujets non liés dans un commit

Format recommandé :
```
feat(rules): implement Casino rule
fix(scoring): clamp score at zero
test(engine): cover veto and round draw
```

### Questions produit/design

Si une ambiguïté ou incohérence est détectée dans `fantasy-petanque.md` :
1. Décrire précisément l'incohérence
2. Proposer 1 à 3 options
3. Recommander une option
4. Demander validation si la décision impacte le score, le flow, ou l'architecture

Décisions mineures : les prendre, les documenter dans `CLAUDE.md`, continuer.

---

## Règles produit clés

### Score

- Une équipe ne peut jamais descendre sous 0
- Score cible : **13 points**
- Une seule équipe marque les points normaux par mène
- Bonus/malus cumulables dans les limites de chaque règle

### Tirage de règles

- Pool sans répétition jusqu'à épuisement, puis recommence
- Véto : relance immédiate, la règle refusée peut revenir
- Totem d'immunité : pré-tire une règle `totem-compatible` pour la mène suivante

### Décisions produit prises

| Point ambigu | Décision retenue |
|---|---|
| Mène Totem nulle | Pas d'immunité accordée |
| Totem sans règle compatible | Recycler les règles `totem-compatible` déjà jouées |
| Contrat : même mission possible | Autorisé (non interdit par la spec) |
| Véto en chaîne | Chaque véto est indépendant |

---

## Commandes utiles

```bash
npx expo start          # Lancer le projet
npm test                # Tests
npm test -- --watch     # Tests en watch mode
npm test -- --coverage  # Couverture
npx tsc --noEmit        # Vérification TypeScript
npm run lint            # Lint
```

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `fantasy-petanque.md` | Spec — source de vérité |
| `src/data/rules/rules.ts` | Banque de règles |
| `src/domain/game/engine/` | Moteur de tirage et résolution |
| `src/domain/game/scoring/` | Moteur de score |
| `src/features/game/state/gameStore.ts` | État global Zustand |
| `src/__tests__/` | Tests |

---

## Interdictions

- Conclure une fonctionnalité terminée sur la seule base d'un test visuel
- Sauter les tests pour livrer plus vite
- Mélanger plusieurs sujets dans un commit
- Inventer silencieusement une décision produit structurante
- Ajouter `any` TypeScript sans justification explicite
- Modifier `fantasy-petanque.md` (c'est la spec, pas le code)
