# MEMORY — Fantasy Pétanque

## Décisions produit

- Les "mènes de comptage classique" correspondent à toutes les mènes où `shouldSkipNormalScore(round)` vaut `false` : mode simple et règles fantasy qui utilisent le score normal.
- Les écrans principaux utilisent `react-native-safe-area-context` pour respecter la barre d'état / l'encoche. En partie, `GameTopBar` porte l'annulation de partie et les actions hautes comme les vétos.
