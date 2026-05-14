# MEMORY — Fantasy Pétanque

## Décisions produit

- Les options du flow Setup utilisent trois variantes Figma : `default` (`darkSmooth` + texte blanc), `primary` (`primary` + texte sombre) et `fantasy` (gradient `primary` vers `secondary` + texte sombre).
- `AppHeader` peut être rendu en mode `floating` pour les headers overlay : le wrapper ne porte alors aucun fond, seul `ButtonIcon` conserve son fond translucide.
- Les animations premium de l'UI game doivent utiliser le token `gameUiMotion.curves.premium` afin de garder une courbe cohérente entre ouverture, translation, fondu et reflets.
- Les "mènes de comptage classique" correspondent à toutes les mènes où `shouldSkipNormalScore(round)` vaut `false` : mode simple et règles fantasy qui utilisent le score normal.
- Les écrans principaux utilisent `react-native-safe-area-context` pour respecter la barre d'état / l'encoche. En partie, `GameTopBar` porte l'annulation de partie et les actions hautes comme les vétos.
- L'iconographie de l'application doit utiliser Phosphor (`phosphor-react-native`) pour les nouvelles icônes React Native, afin de rester cohérente avec les maquettes.
- En mode fantasy, une mène démarre en phase `pre-mene` pour afficher la règle, les vétos et l'action `COMMENCER`, puis passe en phase `playing` avant la saisie des points.
- Les descriptions longues de règles supportent uniquement `<b>...</b>` pour mettre un segment en couleur secondaire, ainsi que `\n` pour les retours à la ligne. Le texte atténué reste porté par `shortDescription`, pas par un tag `<weak>`.
- Dans `RuleDisplay`, le texte atténué sous une règle vient du champ explicite `rule.note`; il n'est plus extrait automatiquement de `description`.
- Les règles fantasy avec choix à faire avant la première boule passent par une phase dédiée `rule-setup` entre `pre-mene` et `playing`. Pour l'instant, ce flow s'applique à `Contrat`, `Assurance vie` et `Frontière`; les autres règles `setup` seront ajustées pendant la QA règle par règle.
- Les refontes des UI de règles spécifiques sont cadrées dans `UI_RULES_CADRAGE.md` : bonus/malus simples restent groupées, les règles à flow dédié sont traitées une par une, et `L'impair contre-attaque` reste séparée car elle explique une résolution automatique sensible.
- Casino utilise un flow en deux temps : setup avant mène pour choisir les mises, puis résolution pendant la mène avec une action `Gagnant` attachée au bloc scoreboard, pas au contenu scrollable.
- Les mises Casino valent 1 par défaut, sont bornées entre 1 et 6, et ne peuvent jamais dépasser le score de l'adversaire. Casino n'est tirable que si les deux équipes ont au moins 1 point.
- Les actions d'équipe liées au score pendant une mène doivent être attachées à la zone scoreboard via un composant partagé, afin de rester cohérentes avec les futures UI bonus/malus.
- Les UI bonus/malus simples utilisent le même composant d'action d'équipe que Casino, attaché au scoreboard. Pour les bonus/malus à maximum 1, un second tap annule l'action ; pour les compteurs, un long press décrémente.
- Totem d'immunité révèle la prochaine règle via la variante compacte de `RuleDisplay` sous la règle courante. Même si la maquette mentionne l'équipe gagnante, `fantasy-petanque.md` prime : le perdant de la mène Totem est immunisé.
