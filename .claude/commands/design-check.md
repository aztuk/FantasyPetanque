# /design-check — Audit design system

Produit un rapport de conformité entre `Design.md` et le code React Native.

## Déclenchement

Utilise cette commande quand l'utilisateur demande `/design-check`, "design check", "audit design", "vérifie la conformité Figma", "vérifie les tokens", "vérifie les composants", ou équivalent.

La commande produit un rapport. Elle ne corrige pas le code sauf si l'utilisateur le demande explicitement après lecture du rapport.

## Scope par défaut

Auditer :

1. `Design.md`
2. `app/src/shared/constants/theme.ts`
3. Tous les fichiers UI dans `app/src/**/*.tsx`
4. Les helpers UI dans `app/src/**/*.ts` quand ils exportent des styles, thèmes, mappings visuels ou composants

Exclure :

- `app/src/__tests__/`
- `app/src/domain/`
- `app/src/data/`, sauf si une règle contient du texte enrichi ou une configuration UI explicitement auditée
- fichiers générés, assets binaires, `node_modules`

## Étape 1 — Lire la source design

Lire dans `Design.md` :

- `## TOKENS — Couleurs`
- `## TOKENS — Typographie`
- `## TOKENS — Espacements`
- `## TOKENS — Rayons de bordure`
- `## COMPOSANTS — Partagés`
- `## ÉCRANS`
- `## FLOWS`

Signaler les sections incomplètes (`à compléter`, URL vide, node-id manquant) comme risque de référence, sans bloquer l'audit des sections disponibles.

## Étape 2 — Vérifier les tokens

Scanner les fichiers du scope avec `rg`.

Contrôles obligatoires :

- Aucune couleur hex directe dans les styles UI, hors définition centrale de `palette` dans `theme.ts`.
- Aucun `rgba(...)` direct hors tokens documentés dans `Design.md` et `theme.ts`.
- Les couleurs UI doivent passer par `colors.*`.
- Les typographies UI doivent passer par `figmaTextStyles.*`.
- Signaler tout usage de `textStyles.*`, `typography.size.*`, `typography.weight.*`, `fontSize`, `lineHeight`, `letterSpacing` ou `fontWeight` hors `theme.ts`.
- Comparer les tokens de `theme.ts` avec `Design.md` : noms, valeurs, présence/absence.

Classer en :

- **Bloquant** : valeur visuelle hardcodée ou token non présent dans `Design.md`.
- **Majeur** : usage legacy (`textStyles.*`, `typography.*`) qui contourne les presets Figma.
- **Mineur** : commentaire obsolète, alias temporaire documenté, section Design.md incomplète.

## Étape 3 — Vérifier la parité d'utilisation des composants

À partir de `## COMPOSANTS — Partagés`, construire le mapping attendu entre composants Figma et composants code :

- ScoreBoard -> `GameScoreBoard`
- Rule -> `RuleDisplay`
- HistoryItem / History -> `GameHistoryList`
- Button -> `FullWidthCtaButton`, `GameActionButton`, boutons de setup
- ButtonIcon / Head -> `AppHeader`, `GameTopBar`, `ButtonIcon`
- AlertBox -> `AlertSheet`, `CancelGameSheet`
- Logo -> `BrandLogo`
- WheelPicker -> `WheelPicker`
- SetupOption -> `SetupOption`
- IncrementalInput -> `TeamStepper`
- Readonly -> `ReadonlyValue`
- BonusButton -> `GameTeamActionRow`, `BonusButtonsUI`, `MalusButtonsUI`

Pour chaque page référencée dans `## ÉCRANS`, identifier le fichier écran probable :

- Home, Home Debug -> `HomeScreen.tsx`
- Setup 01/02/03/04 -> `SetupScreen.tsx`
- Game ingame / inter-mène / post-mène / endGame -> `GameScreen.tsx` et `GameScreen/*.tsx`
- UIs spécifiques -> `features/game/components/rule-uis/*.tsx`

Contrôles obligatoires :

- Vérifier que les composants partagés attendus sont importés et utilisés sur les pages référencées.
- Signaler toute reconstruction locale d'un composant déjà listé dans `Design.md` : bouton custom, header local, score board local, liste d'historique locale, stepper local, readonly local.
- Signaler les composants partagés manquants quand un écran implémente le même rôle avec `View`, `Pressable`, `Text` et styles locaux.
- Signaler les usages divergents quand un écran utilise le bon composant mais surcharge ses tokens, tailles, paddings ou états au lieu de passer par son API.
- Ne pas exiger un composant quand `Design.md` ne définit pas encore son mapping ou quand l'écran a un besoin explicitement spécifique.

## Étape 4 — Vérifier les écrans référencés

Pour chaque entrée de `## ÉCRANS` :

1. Vérifier que le node-id Figma existe dans `Design.md`.
2. Vérifier qu'un fichier code plausible correspond à l'écran.
3. Lister les composants partagés attendus et observés.
4. Lister les écarts de tokens, typographie, spacing, radius et états.
5. Si l'accès Figma est disponible, comparer avec le node-id ; sinon indiquer clairement que l'audit repose sur `Design.md` uniquement.

## Format du rapport

Répondre en français avec :

1. **Résumé** : statut global, nombre de violations bloquantes/majeures/mineures.
2. **Références incomplètes** : sections de `Design.md` manquantes ou partielles.
3. **Tokens** : violations par fichier avec ligne et recommandation.
4. **Parité composants** : par écran, composants attendus, composants observés, écarts.
5. **Priorités de correction** : ordre recommandé, en privilégiant les corrections bloquantes et les composants partagés.

Utiliser des liens de fichiers avec lignes quand possible. Ne pas modifier `ROADMAP.md`, ne pas committer, ne pas marquer de tâche `[fait]` pendant un simple audit.
