# AUDIT TECHNIQUE — Fantasy Pétanque

## Résumé Exécutif

La codebase présente une architecture globalement solide avec une bonne séparation domain/features/shared, mais souffre de plusieurs dettes techniques critiques : (1) le store Zustand est monolithique et surdimensionné (534 lignes), mélangeant logique métier et état UI ; (2) duplication logique importante entre l'engine et le store ; (3) `RuleUI` accumule 10 composants sur 501 lignes sans séparation ; (4) tests fragmentés et incomplets pour des fonctionnalités critiques. Les composants screens restent relativement sains mais certains cumulent trop de responsabilités. Pas d'usage d'`any` détecté, bonne utilisation de TypeScript.

---

## Table des matières

1. [Architecture & Séparation des Responsabilités](#1-architecture--séparation-des-responsabilités)
2. [Store & Gestion d'État](#2-store--gestion-détat)
3. [Engine & Rules](#3-engine--rules)
4. [Scoring & Bonus/Malus](#4-scoring--bonusmalus)
5. [Composants UI & Screens](#5-composants-ui--screens)
6. [Tests](#6-tests)
7. [TypeScript & Type Safety](#7-typescript--type-safety)
8. [Performance](#8-performance)
9. [Refactors Prioritaires](#9-refactors-prioritaires)
10. [Tableau Récapitulatif](#10-tableau-récapitulatif)

---

## 1. Architecture & Séparation des Responsabilités

### 1.1 Violation d'imports croisés — Moyen

**Fichiers** : `features/game/state/gameStore.ts`, `features/game/components/RuleUI.tsx`

`CONTRAT_MISSIONS` est importé depuis `data/rules/rules.ts` à la fois par le store et par l'UI. Cette donnée métier (missions du contrat) devrait être en `domain/game/models`, pas dans `data/rules` qui est une couche de configuration.

**Recommandation** : déplacer `CONTRAT_MISSIONS` vers `domain/game/models/index.ts` et réexporter depuis `data/rules/rules.ts`.

---

### 1.2 Engine crée des `fakeState` pour les calculs — Moyen

**Fichier** : `domain/game/engine/index.ts:36-50`

Le code crée des états partiels fictifs juste pour appeler `ruleIsAvailable()`, avec des valeurs hardcodées (`vetos: { blue: true, red: true }`). Si les champs par défaut changent ou si `ruleIsAvailable()` utilise d'autres propriétés, ce code devient fragile.

**Recommandation** : passer uniquement les données strictement nécessaires (`scores`, `playedRuleIds`) plutôt qu'un `GameState` partiel fabriqué.

---

## 2. Store & Gestion d'État

### 2.1 CRITIQUE — `gameStore` surdimensionné, mélange logique métier et état — 534 lignes

**Fichier** : `features/game/state/gameStore.ts`

Le store est devenu un « god object » qui mélange :
- Gestion d'état UI (phase, debugMode)
- Résolution de règles métier (`finishRound` appelle `resolveCasino`, `resolveImpair`, etc.)
- Transitions de gameplay (`startNewRound` gère l'immunité du Totem)

**`finishRound()` = ~90 lignes** contenant toute la logique de fin de mène :
- Ligne 268–273 : résout casino
- Ligne 281–284 : résout impair
- Ligne 285–290 : résout assurance
- Ligne 306–313 : applique bonuses/maluses
- Ligne 316–323 : gère immunité Totem

**Duplication logique** avec `GameScreen.tsx` — la logique du gagnant est répétée dans les deux fichiers.

**Recommandation** : créer un `GameEngine` dans `domain/game/engine/gameEngine.ts` responsable de la résolution des règles. Le store devient simple coordinateur d'état.

---

### 2.2 Actions du store sans validation d'état — Moyen

**Fichier** : `features/game/state/gameStore.ts`

`addBonus` (ligne 390) et d'autres actions ne vérifient pas que la phase courante est correcte. Si un bug UI appelle `addBonus` en phase `pre-mene`, l'état se corrompt silencieusement.

**Recommandation** : faire retourner un booléen de succès aux actions, ajouter une vérification de phase en entrée.

---

### 2.3 `useGameStore` importé directement dans tous les composants — Moyen

Le store est injecté comme dépendance globale à travers toute la hiérarchie, rendant les composants difficiles à tester isolément.

**Recommandation** : exposer des sélecteurs nommés (`useGamePhase`, `useCurrentRound`, etc.) plutôt que d'exposer le store entier.

---

## 3. Engine & Rules

### 3.1 `ruleIsAvailable` dépend de l'état global entier — Moyen

**Fichier** : `domain/game/engine/index.ts:11-26`

La signature accepte un `GameState` complet mais n'utilise que `scores`. La signature ment sur les dépendances réelles.

**Recommandation** :
```typescript
export function ruleIsAvailable(rule: Rule, scores: Record<Team, number>): boolean
```

---

### 3.2 `drawRule` et `drawTotemRule` presque identiques — Moyen

**Fichier** : `domain/game/engine/index.ts:29-112`

Les deux fonctions ont la même structure : construire un `fakeState`, filtrer les règles disponibles, gérer le fallback si aucune n'est disponible.

**Recommandation** : extraire une fonction privée `drawFromPool(pool, playedRuleIds, scores)` partagée par les deux.

---

### 3.3 Conditions de règles hardcodées dans un `switch` — Mineur

**Fichier** : `domain/game/engine/index.ts:14-25`

Ajouter une règle conditionnelle nécessite de modifier l'engine.

**Recommandation** : ajouter une callback `isAvailable?: (scores: Record<Team, number>) => boolean` dans le modèle `Rule`, puis dans les données de règles pour casino et prediction.

---

## 4. Scoring & Bonus/Malus

### 4.1 `buildBonusMalusFromRound` = 87 lignes avec 9 `switch` cases — Moyen

**Fichier** : `domain/game/scoring/index.ts:134-221`

Chaque règle a son propre code pour construire sa liste bonus/malus dans un `switch` monolithique. Ajouter une règle nécessite de modifier ce fichier.

**Recommandation** : ajouter une méthode `resolveBonuses?: (round: RoundState) => BonusMalus[]` dans l'interface `Rule`, déplacer la logique dans les données de chaque règle.

---

### 4.2 `resolveAssuranceVie` ne gère pas le cas égalité — Moyen

**Fichier** : `domain/game/scoring/index.ts:62-84`

Si `winner === null` (égalité), la fonction peut crasher ou produire un comportement indéfini.

**Recommandation** : ajouter un guard explicite pour le cas égalité et retourner `scores` inchangés.

---

## 5. Composants UI & Screens

### 5.1 CRITIQUE — `RuleUI.tsx` = 501 lignes, 10+ composants imbriqués

**Fichier** : `features/game/components/RuleUI.tsx`

Un seul fichier contient tous les UIs des règles : `BonusButtonsUI`, `MalusButtonsUI`, `SortieDePorc`, `ContratSetupUI`, `ContratResolutionUI`, `AssuranceVieSetupUI`, `AssuranceVieReminderUI`, `FrontiereSetupUI`, `FrontiereReminderUI`, `CasinoUI`, `PredictionUI`, `TotemUI`, `ImpairUI`.

Difficile à naviguer, impossible à tester isolément, ~15 appels `useGameStore()` éparpillés.

**Recommandation** : créer `features/game/components/rule-uis/` avec un fichier par règle et un `index.tsx` dispatcher.

---

### 5.2 `GameScreen` = 422 lignes, gère 6 phases — Moyen

**Fichier** : `features/game/screens/GameScreen.tsx`

Un seul composant gère `game-over`, `round-summary`, mode `simple`, `pre-mene`, `rule-setup`, `playing`. L'état local d'animation (drawer) y est aussi géré.

**Recommandation** : créer `features/game/screens/GameScreen/` avec un `index.tsx` dispatcher et des fichiers `PlayingView.tsx`, `PreMeneView.tsx`, `RoundSummaryView.tsx`, `GameOverView.tsx`.

---

### 5.3 `GameScoreBoard` surparamétrisé — Mineur

**Fichier** : `features/game/components/GameScoreBoard.tsx`

9 props dont plusieurs combinaisons ne font pas sens ensemble (`showTotals=false && showRoundBar=false`).

**Recommandation** : remplacer les booleans `compact`, `showTotals`, `showRoundBar` par une prop `variant: 'full' | 'compact' | 'totals-only' | 'round-only'`.

---

### 5.4 `RuleDisplay` parse du HTML-lite à la main — Mineur

**Fichier** : `features/game/components/RuleDisplay.tsx:18-65`

Les descriptions de règles contiennent du `<b>...</b>` et `\n` stockés dans des strings, parsés côté frontend avec un parser maison. Fragile si le format change.

**Recommandation** : pré-parser les descriptions en `RuleDescriptionSegment[]` directement dans `data/rules/rules.ts` pour éliminer le parser runtime.

---

## 6. Tests

### 6.1 CRITIQUE — `finishRound` non testée, règles critiques sans couverture

**Fichiers** : `src/__tests__/`

État actuel :
- `gameStore.test.ts` (~100 lignes) : teste seulement `startGame`, `addNormalPoint`, `undoNormalPoint` — **`finishRound` = 0 test**
- `engine.test.ts` (~100 lignes) : tests de surface, un test casino commenté
- `scoring.test.ts` (~50 lignes) : `resolveImpair`, `resolveCasino`, `resolvePrediction` non testés
- `GameScreen.test.tsx` (~80 lignes) : seulement le bouton d'annulation

**Manquent en priorité** :
- Tests de `finishRound` pour chaque cas de règle (casino, impair, assurance, contrat, totem)
- Tests des edge cases de scoring (égalité, score à 0, malus Censure)
- Tests d'intégration du cycle complet de mène

**Recommandation** : créer une suite complète :
```
__tests__/
  ├── domain/
  │   ├── engine.test.ts           (étendre)
  │   ├── scoring.test.ts          (étendre)
  │   └── rules.test.ts            (nouveau — valider chaque règle)
  ├── features/game/
  │   ├── gameStore.finishRound.test.ts  (nouveau — PRIORITÉ 1)
  │   ├── gameStore.veto.test.ts         (nouveau)
  │   ├── gameStore.bonus.test.ts        (nouveau)
  │   └── integration.test.ts            (nouveau)
```

---

## 7. TypeScript & Type Safety

### 7.1 Aucun `any` détecté ✓

Bonne hygiène TypeScript générale. Types bien définis, unions discriminées correctes, `Record<Team, ...>` utilisé systématiquement.

---

## 8. Performance

### 8.1 `GameHistoryList` — animations complexes, 4 `Animated.Value` par item — Moyen

**Fichier** : `features/game/components/GameHistoryList.tsx`

Chaque item crée 4 `Animated.Value` + `requestAnimationFrame` + `setTimeout`. Peut causer des freezes si plusieurs items arrivent simultanément.

`useNativeDriver: true` est déjà utilisé pour certaines animations — bien. Mais la séquence reste lourde.

**Recommandation** : wrapper chaque item dans `React.memo`, simplifier la séquence si possible.

---

### 8.2 `SetupScreen` — styles d'animation recalculés à chaque scroll — Moyen

**Fichier** : `features/game/screens/SetupScreen.tsx:326-365`

Dans la boucle `map` du picker, chaque item crée 4–5 nouvelles `Animated.interpolate` à chaque render.

**Recommandation** : extraire un composant `PickerItem` wrappé dans `React.memo`.

---

## 9. Refactors Prioritaires

Les 5 actions les plus impactantes, dans l'ordre :

### 1. Extraire `finishRound` dans un `GameEngine` — Effort ~4h

**Fichier cible** : `domain/game/engine/gameEngine.ts`

Déplacer toute la logique de résolution des règles (casino, impair, assurance, contrat, totem) hors du store vers un module pur testable. Le store devient un coordinateur d'état.

**Impact** : store -100 lignes, logique métier isolée et testable indépendamment.

---

### 2. Tester `finishRound` avec tous les cas de règles — Effort ~6h

**Fichier cible** : `__tests__/features/game/gameStore.finishRound.test.ts`

Un test par cas du switch (casino, impair, assurance, contrat, prédiction, totem), plus les edge cases (égalité, immunité, score plancher à 0).

**Impact** : confiance dans les refactors, bugs en production évités.

---

### 3. Splitter `RuleUI.tsx` en 10+ fichiers séparés — Effort ~3h

**Répertoire cible** : `features/game/components/rule-uis/`

Un fichier par composant de règle, un `index.tsx` dispatcher. Tests unitaires par règle.

**Impact** : navigation et testabilité drastiquement améliorées.

---

### 4. Refactoriser `GameScreen` en views séparées — Effort ~3h

**Répertoire cible** : `features/game/screens/GameScreen/`

Dispatcher + `PlayingView`, `PreMeneView`, `RoundSummaryView`, `GameOverView`.

**Impact** : composants plus petits, tests de phase isolables.

---

### 5. Paramétrer les conditions de règles — Effort ~2h

**Fichiers cibles** : `domain/game/models/index.ts` + `data/rules/rules.ts`

Ajouter `isAvailable?: (scores) => boolean` dans `Rule`. Simplifier `ruleIsAvailable` pour déléguer au callback.

**Impact** : nouvelles règles conditionnelles sans modifier l'engine.

---

## 10. Tableau Récapitulatif

| Sévérité | Zone | Problème | Effort |
|---|---|---|---|
| CRITIQUE | Store | `finishRound` = god function, logique métier dans le store | 4h |
| CRITIQUE | Components | `RuleUI.tsx` = 501 lignes, 10 composants imbriqués | 3h |
| CRITIQUE | Tests | `finishRound` et règles critiques non testées | 6h |
| Moyen | Store | Actions sans validation de phase | 1h |
| Moyen | Store | `useGameStore` dépendance globale | 3h |
| Moyen | Engine | `fakeState` fragile dans `drawRule` | 1h |
| Moyen | Engine | `drawRule`/`drawTotemRule` dupliqués | 1.5h |
| Moyen | Scoring | `buildBonusMalusFromRound` switch monolithique | 2h |
| Moyen | Scoring | `resolveAssuranceVie` — cas égalité non géré | 0.5h |
| Moyen | Screens | `GameScreen` = 422 lignes, 6 phases | 3h |
| Moyen | Animation | `GameHistoryList` — 4 Animated.Value par item | 1.5h |
| Moyen | Animation | `SetupScreen` picker — interpolations recalculées | 0.5h |
| Mineur | Architecture | `CONTRAT_MISSIONS` mal placée (data vs domain) | 0.5h |
| Mineur | Engine | `ruleIsAvailable` signature trop large | 0.5h |
| Mineur | Components | `GameScoreBoard` surparamétrisé (9 props) | 1h |
| Mineur | Components | `RuleDisplay` parser HTML maison | 1h |

**Total estimé** : ~29h pour traiter l'ensemble · **5 refactors prioritaires** : ~18h
