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

> Référence Figma composants : <!-- URL frame composants Figma --> *(à compléter)*

<!-- Section à mettre à jour depuis Figma — ne pas utiliser le code comme référence -->

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
