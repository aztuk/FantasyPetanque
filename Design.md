# Design.md — Fantasy Pétanque

> **Source de vérité** : Figma. Ce fichier documente les décisions de Figma — pas l'implémentation code.
> En cas de divergence entre Design.md et le code, Figma/Design.md prime.
>
> **Usage agent** : avant toute tâche UI, lire les sections pertinentes. Pour vérifier la conformité code/design, utiliser le skill `/design-check` (à venir).

Figma principal : <!-- URL fichier Figma principal -->

---

## TOKENS — Couleurs

> Référence Figma : [node-id=26:1950](https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=26-1950)
>
> **15 tokens (13 Figma + 2 team darks hors frame).** Aucun token couleur non listé ici ne doit être utilisé dans le code. Aucun token couleur non listé ici ne doit être utilisé dans le code.

| Nom Figma        | Variable CSS         | Valeur                   | Rôle                              |
|------------------|----------------------|--------------------------|-----------------------------------|
| Primary          | `--primary`          | `#E7C241`                | Jaune brand — accent principal    |
| Secondary        | `--secondary`        | `#41E79A`                | Vert brand — highlight secondaire |
| Dark             | `--dark`             | `#28261F`                | Fond le plus sombre               |
| DarkSmooth       | `--darksmooth`       | `#3B382E`                | Surface sombre                    |
| DarkSmoother     | `--darksmoother`     | `rgba(59, 56, 46, 0.20)` | Overlay sombre semi-transparent   |
| Disabled         | `--disabled`         | `#453F2D`                | État désactivé (couleur de fond)  |
| TextSmooth       | `--textsmooth`       | `#949084`                | Texte secondaire / annotations    |
| White            | `--white`            | `#ECEBE8`                | Texte principal / blanc cassé     |
| RedTeamSurface   | `--redteamsurface`   | `#DC3939`                | Équipe rouge — fond, boutons      |
| RedTeamText      | `--redteamtext`      | `#E86868`                | Équipe rouge — texte, labels      |
| BlueTeamSurface  | `--blueteamsurface`  | `#395ADC`                | Équipe bleue — fond, boutons      |
| BlueTeamText     | `--blueteamtext`     | `#778EED`                | Équipe bleue — texte, labels      |
| BlueTeamDark     | `--blueteamdark`     | `#1D3287`                | Équipe bleue — variante sombre    |
| RedTeamDark      | `--redteamdark`      | `#A92828`                | Équipe rouge — variante sombre    |
| Shadow           | `--shadow`           | `#1F1D15`                | Ombre portée brand                |
| OverlayBackdrop  | `--overlaybdrop`     | `rgba(0,0,0,0.6)`        | Fond semi-transparent des modales |

---

## TOKENS — Typographie

> Référence Figma : [node-id=26:1951](https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=26-1951&t=qil4nd06wX0YCs6f-11)

> **10 styles bruts uniquement.** `Design.md` est la source de vérité : le code doit reprendre ces noms et ces valeurs.
>
> Conversion React Native : `lineHeight` et `letterSpacing` sont documentés en pixels, calculés depuis les pourcentages Figma.

| Nom Figma | Famille | Style | Taille | Poids | Line height Figma | Line height RN | Letter spacing Figma | Letter spacing RN | Casse |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| PageTitles | Google Sans Flex | Bold | 28 | 700 | 170% | 47.6 | -4% | -1.12 | Original |
| ButtonCTA | Google Sans Flex | SemiBold | 28 | 600 | 170% | 47.6 | -3% | -0.84 | UPPER |
| ButtonActions | Google Sans Flex | SemiBold | 21 | 600 | 150% | 31.5 | -4% | -0.84 | Original |
| BodyMd | Google Sans Flex | Regular | 21 | 400 | 170% | 35.7 | -4% | -0.84 | Original |
| BodySm | Google Sans Flex | Regular | 18 | 400 | 170% | 30.6 | -4% | -0.72 | Original |
| Labels | Google Sans Flex | Bold | 18 | 700 | 100% | 18 | -4% | -0.72 | UPPER |
| NumberLg-100 | Cascadia Mono | Regular | 60 | 400 | 170% | 102 | -4% | -2.4 | Original |
| NumberMd-80 | Cascadia Mono | Regular | 48 | 400 | 170% | 81.6 | -4% | -1.92 | Original |
| NumberSm-60 | Cascadia Mono | Regular | 40 | 400 | 170% | 68 | -4% | -1.6 | Original |
| NumberXs-40 | Cascadia Mono | Bold | 24 | 700 | 170% | 40.8 | -4% | -0.96 | Original |

### Mapping code canonique

| Nom Figma | Nom code |
|---|---|
| PageTitles | `figmaTextStyles.pageTitles` |
| ButtonCTA | `figmaTextStyles.buttonCTA` |
| ButtonActions | `figmaTextStyles.buttonActions` |
| BodyMd | `figmaTextStyles.bodyMd` |
| BodySm | `figmaTextStyles.bodySm` |
| Labels | `figmaTextStyles.labels` |
| NumberLg-100 | `figmaTextStyles.numberLg100` |
| NumberMd-80 | `figmaTextStyles.numberMd80` |
| NumberSm-60 | `figmaTextStyles.numberSm60` |
| NumberXs-40 | `figmaTextStyles.numberXs40` |

---

## TOKENS — Espacements

> Référence Figma : <!-- node-id= --> *(à compléter)*

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

---

## TOKENS — Rayons de bordure

> Référence Figma : <!-- node-id= --> *(à compléter)*

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

---

## TOKENS — Ombres

> Référence Figma : <!-- node-id= --> *(à compléter)*

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

---

## COMPOSANTS — Partagés

> Référence Figma composants : [node-id=27:1028](https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=27-1028&t=qil4nd06wX0YCs6f-11)
>
> Ces composants sont les briques communes à réutiliser avant de créer un composant ou un style local. Les tailles ci-dessous viennent de Figma ; en React Native, elles peuvent devenir responsives, mais les couleurs, typographies, espacements internes, états et rôles doivent rester alignés.

### Inventaire

| Composant Figma | Variantes / états | Usage produit | Mapping code attendu |
|---|---|---|---|
| ScoreBoard | Standard | Affiche les points de mène, les totaux, les bonus/malus et le badge de mène. | `GameScoreBoard` |
| Rule | Standard | Affiche le nom d'une règle, sa description enrichie et sa note. | `RuleDisplay` |
| HistoryItem | Standard | Ligne d'historique d'une mène : score bleu, numéro de mène, score rouge. | `GameHistoryItem` |
| History | `Orientation=top`, `Orientation=bottom` | Liste d'historique avec fondu. `top` sert aux vues récapitulatives, `bottom` garde les dernières mènes visibles en jeu. | `GameHistoryList` |
| Button | `Primary`, `Fantasy`, `Default`, `Secondary`, `Disabled` | CTA pleine largeur et actions principales. | `FullWidthCtaButton`, `GameActionButton`, boutons de setup |
| ButtonIcon | Standard | Bouton rond translucide pour action iconographique, notamment retour/annulation. | `AppHeader` / futur `ButtonIcon` partagé si réutilisé hors header |
| Head | `Type=WithTitle`, `Type=NoTitle` | En-tête avec bouton retour seul ou bouton retour + titre de page. | `AppHeader`, `GameTopBar` |
| AlertBox | Standard | Bottom sheet de confirmation avec titre, message et deux actions. | `AlertSheet`, `CancelGameSheet` |
| Logo | Standard | Logo de marque Fantasy Pétanque. | `BrandLogo` |
| WheelPicker | Standard | Sélecteur vertical de valeur numérique avec unité. | `WheelPicker` |
| SetupOption | Standard | Option de choix dans le parcours de configuration. | `SetupOption` |
| IncrementalInput | Standard | Stepper vertical avec +, valeur numérique, - et label d'équipe. | `TeamStepper` |
| Readonly | Standard | Valeur numérique verrouillée avec label d'équipe. | lecture seule dans `CasinoUI` et `PredictionUI` |
| BonusButton | Standard | Bouton d'action compact pour un événement de règle, par exemple "Tir réussi". | `GameTeamActionRow` / `BonusButtonsUI` selon le besoin d'équipe |

### ScoreBoard

- Dimensions Figma : `393 x 215`, deux colonnes séparées par `4`.
- Couleurs : surfaces `--blueteamsurface` et `--redteamsurface`; texte principal `--white`; modificateurs `--secondary`; badge sur `--dark`.
- Typographie : score de mène `NumberLg-100`; total et modificateur `NumberXs-40`; badge `Labels`.
- Le score de mène affiche les points en cours de mène. Le total affiche le score cumulé après application de la mène courante ou du dernier état connu.
- Les bonus/malus s'affichent dans la colonne de l'équipe concernée sous forme signée (`+1`, `-1`), sans remplacer le score de mène.
- Le badge central affiche `Mène XX` en uppercase et reste centré au-dessus des deux colonnes.

### Rule

- Largeur Figma : `345`.
- Le titre utilise `PageTitles` en `--primary`, centré.
- La description utilise `BodyMd` en `--white`, centrée, avec un espace vertical de `24` entre paragraphes.
- Les segments mis en valeur dans la spec (`<b>...</b>`) utilisent `--secondary`.
- La note utilise `BodySm` en `--textsmooth`.
- Ce composant ne contient pas de logique de règle : il rend uniquement le contenu fourni par le moteur ou la banque de règles.

### HistoryItem et History

- `HistoryItem` mesure `393 x 49`, bordure supérieure `--darksmooth`, padding vertical `4`.
- Scores : `NumberXs-40`, bleu en `--blueteamtext`, rouge en `--redteamtext`.
- Numéro de mène : `BodySm`, `--textsmooth`, centré entre les deux scores, format `Mène 01`.
- `History Orientation=top` affiche le contenu depuis le haut avec un fondu en bas.
- `History Orientation=bottom` ancre les dernières mènes en bas avec un fondu en haut.
- Le composant doit être scrollable dès que le contenu dépasse la hauteur disponible.

### Button

- Largeur Figma : `393`. Hauteur de référence : `86` pour `Primary`, `Default`, `Secondary`, `Disabled`; `80` pour `Fantasy`.
- Padding interne : horizontal `10`, vertical `12`.
- Typographie : `ButtonCTA`, uppercase, centrée.
- `Primary` : fond `--primary`, texte `--dark`.
- `Fantasy` : gradient horizontal `--primary` vers `--secondary`, texte `--dark`.
- `Default` : fond `--darksmooth`, texte `--white`.
- `Secondary` : fond `--secondary`, texte `--dark`.
- `Disabled` : fond `--disabled`, texte `--textsmooth`; ne doit pas déclencher d'action.

### ButtonIcon et Head

- `ButtonIcon` mesure `56 x 56`, padding `12`, rayon `70`, fond `--darksmoother`, blur `12`.
- L'icône standard est une flèche gauche de `32`, utilisée pour retour ou annulation.
- `Head Type=WithTitle` mesure `393 x 72`, padding `8`, gap `16`.
- Le titre utilise `PageTitles` en `--white`.
- `Head Type=NoTitle` mesure `88 x 88`, padding `16`, et conserve uniquement le `ButtonIcon`.

### AlertBox

- Largeur Figma : `391`, coins supérieurs `30`, fond `--darksmooth`.
- Ombre : offset `0, -12`, radius `12`, couleur `--dark`.
- Wrapper contenu : padding `24`, gap `4`.
- Titre : `PageTitles` en `--white`, centré.
- Message : `BodyMd` en `--white`, centré; les segments critiques utilisent `--secondary`.
- Footer : deux boutons côte à côte, gap `4`; action secondaire fond `--darksmooth`, action de confirmation fond `--primary`.
- Labels de footer : `ButtonCTA`, uppercase; texte blanc pour l'action secondaire, `--dark` pour la confirmation.

### Logo

- Dimensions Figma : `298 x 220`.
- Le logo utilise la composition Figma comme asset ou rendu équivalent, avec l'ombre `Title shadow`.
- Il doit rester lisible sur `--dark` et ne pas être reconstruit avec une typographie approximative dans les écrans.

### WheelPicker

> Référence Figma : [node-id=28:1155](https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=28-1155&t=qil4nd06wX0YCs6f-11)

- Dimensions Figma : `121 x 480`.
- Le picker affiche cinq valeurs visibles : deux précédentes, la valeur sélectionnée, deux suivantes.
- Hauteurs : extrêmes `80`, adjacentes `100`, zone sélectionnée `120`.
- La zone sélectionnée a une bordure haute et basse `2` en `--primary`.
- Valeur sélectionnée : `NumberLg-100`, `--white`.
- Valeurs adjacentes : `NumberMd-80`, `--textsmooth`.
- Valeurs extrêmes : `NumberSm-60`, `--textsmooth`, opacity `50%`.
- L'unité est affichée à droite de la valeur sélectionnée avec `BodyMd`, `--textsmooth`.
- Le scroll doit snapper par pas de `100` pour garder la valeur choisie alignée dans la zone centrale.

### SetupOption

> Référence Figma : [node-id=31:1213](https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=31-1213&t=qil4nd06wX0YCs6f-11)

- Dimensions Figma : `1230 x 284`.
- Fond : `--darksmooth`.
- Layout : colonne centrée horizontalement et verticalement, padding `24`.
- Texte : centré, `--white`.
- Titre : `ButtonCTA`, uppercase.
- Description : `BodyMd`.
- Sert aux options du flow Setup : choix de mode, condition de fin, activation du véto.

### IncrementalInput et Readonly

- `IncrementalInput` est un contrôle vertical : bouton `+`, valeur, bouton `-`, puis label.
- Boutons `+` / `-` : fond de l'équipe (`--blueteamsurface` ou `--redteamsurface`), padding horizontal `20`, vertical `16`, rayon supérieur/inférieur `10` selon la position.
- Valeur centrale : fond `--darksmooth`, rayon `10`, padding horizontal `32`, vertical `8`, typographie `NumberMd-80`, texte `--white`.
- Label : `Labels`, uppercase, couleur texte de l'équipe (`--blueteamtext` ou `--redteamtext`).
- `Readonly` reprend la valeur `NumberMd-80` et le label d'équipe sans boutons. Il sert à afficher une saisie déjà verrouillée pendant la résolution.

### BonusButton

- Fond `--darksmooth`, padding horizontal `16`, vertical `24`, gap `16`.
- Label : `ButtonActions`, `--white`, centré.
- Sert aux actions compactes déclenchées pendant une règle, par exemple "Tir réussi".
- Si l'action cible une équipe, préférer une composition avec boutons d'équipe cohérente avec les écrans spécifiques Figma.

---

## ÉCRANS

> Référence Figma flows : <!-- URL frame principal flows Figma --> *(à compléter)*

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

Home: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=1-2&t=qil4nd06wX0YCs6f-11
Home Debug: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=1-74&t=qil4nd06wX0YCs6f-11
Setup 01 Mode Choice: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=1-5&t=qil4nd06wX0YCs6f-11
Setup 02 End condition:https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=4-116&t=qil4nd06wX0YCs6f-11
Setup 03 Target Value: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=4-124&t=qil4nd06wX0YCs6f-11
Setup 04 Veto toggle: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=4-234&t=qil4nd06wX0YCs6f-11
Game ingame Classic: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=1-12&t=qil4nd06wX0YCs6f-11
Game ingame scoreState Fantasy: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=4-638&t=qil4nd06wX0YCs6f-11
Game ingame ruleState Fantasy: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=8-1013&t=qil4nd06wX0YCs6f-11
Game intermene fantasy: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=4-742&t=qil4nd06wX0YCs6f-11
Game postmene fantasy: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=18-1857&t=qil4nd06wX0YCs6f-11
Game endGame: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=7-783&t=qil4nd06wX0YCs6f-11
Game Fantasy Specific InGame TeamRowButton: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1468&t=qil4nd06wX0YCs6f-11
Game Fantasy Specific InGame TeamRowButtonSelected: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1509&t=qil4nd06wX0YCs6f-11
Game Fantasy Specific Config ValueInput: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=16-1569&t=qil4nd06wX0YCs6f-11
Game Fantasy Specific InGame Casino: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=17-1625&t=qil4nd06wX0YCs6f-11
Game Fantasy Specific InGame Prediction: https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=18-1701&t=qil4nd06wX0YCs6f-11


---

## FLOWS

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

---

## CONVENTIONS UI

- **Safe area** : aucun élément ne passe sous la barre de statut (heure, icônes système) ni l'encoche.
- **Immersive mode** : l'app est en edge-to-edge. La navigation OS apparaît sur swipe/tap.
- **Score minimum** : une équipe ne peut jamais descendre sous 0.
- **Couleurs équipes** : toujours `--redteamsurface` / `--redteamtext` / `--blueteamsurface` / `--blueteamtext` — jamais de valeur hex directe.
- **Highlight règle** : balise `<b>...</b>` rendue en `--secondary`. Retours à la ligne avec `\n`.
