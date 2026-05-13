# MEMORY — Fantasy Pétanque

## Décisions produit

- Les "mènes de comptage classique" correspondent à toutes les mènes où `shouldSkipNormalScore(round)` vaut `false` : mode simple et règles fantasy qui utilisent le score normal.
- Les écrans principaux utilisent `react-native-safe-area-context` pour respecter la barre d'état / l'encoche. En partie, `GameTopBar` porte l'annulation de partie et les actions hautes comme les vétos.
- L'iconographie de l'application doit utiliser Phosphor (`phosphor-react-native`) pour les nouvelles icônes React Native, afin de rester cohérente avec les maquettes.
- En mode fantasy, une mène démarre en phase `pre-mene` pour afficher la règle, les vétos et l'action `COMMENCER`, puis passe en phase `playing` avant la saisie des points.
- Les descriptions longues de règles supportent uniquement `<b>...</b>` pour mettre un segment en couleur secondaire, ainsi que `\n` pour les retours à la ligne. Le texte atténué reste porté par `shortDescription`, pas par un tag `<weak>`.
