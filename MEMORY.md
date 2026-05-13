# MEMORY — Fantasy Pétanque

## Décisions produit

- Les animations premium de l'UI game doivent utiliser le token `gameUiMotion.curves.premium` afin de garder une courbe cohérente entre ouverture, translation, fondu et reflets.
- Les "mènes de comptage classique" correspondent à toutes les mènes où `shouldSkipNormalScore(round)` vaut `false` : mode simple et règles fantasy qui utilisent le score normal.
- Les écrans principaux utilisent `react-native-safe-area-context` pour respecter la barre d'état / l'encoche. En partie, `GameTopBar` porte l'annulation de partie et les actions hautes comme les vétos.
- L'iconographie de l'application doit utiliser Phosphor (`phosphor-react-native`) pour les nouvelles icônes React Native, afin de rester cohérente avec les maquettes.
- En mode fantasy, une mène démarre en phase `pre-mene` pour afficher la règle, les vétos et l'action `COMMENCER`, puis passe en phase `playing` avant la saisie des points.
- Les descriptions longues de règles supportent uniquement `<b>...</b>` pour mettre un segment en couleur secondaire, ainsi que `\n` pour les retours à la ligne. Le texte atténué reste porté par `shortDescription`, pas par un tag `<weak>`.
- Les règles fantasy avec choix à faire avant la première boule passent par une phase dédiée `rule-setup` entre `pre-mene` et `playing`. Pour l'instant, ce flow s'applique à `Contrat`, `Assurance vie` et `Frontière`; les autres règles `setup` seront ajustées pendant la QA règle par règle.
- Les refontes des UI de règles spécifiques sont cadrées dans `UI_RULES_CADRAGE.md` : bonus/malus simples restent groupées, les règles à flow dédié sont traitées une par une, et `L'impair contre-attaque` reste séparée car elle explique une résolution automatique sensible.
