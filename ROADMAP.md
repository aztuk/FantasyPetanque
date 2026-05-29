# ROADMAP — Fantasy Pétanque

Fichier géré par les agents. Ne pas éditer manuellement — utiliser l'inbox de `TODO.md`.

Statuts : `[ ]` à faire · `[en cours]` pris par un agent · `[fait]` terminé et commité

---

## Priorité haute

<!-- tâches critiques pour le fonctionnement de base -->

- [fait] Ranking — Setup Supabase + modèle de données : créer le projet Supabase, configurer le client dans l'app, définir les tables `players` (id, name, elo_petanque, elo_flechettes) et `matches` (id, sport, date, participants, result). Ajouter les variables d'environnement nécessaires. - Difficulté 2/5 - Codex
- [fait] Ranking — Navigation : ajouter une section "Ranking" accessible depuis la Home (bouton ou tab). Créer le skeleton de navigation (RankingScreen, sous-pages) avec les deux sports Pétanque et Fléchettes. - Difficulté 2/5 - Codex
- [fait] Ranking — Page classement : afficher la liste des joueurs triés par ELO décroissant pour chaque sport (onglets Pétanque / Fléchettes). Deux boutons en bas : "Ajouter un joueur" et "Ajouter un match". - Difficulté 2/5 - Claude
- [fait] Ranking — Ajouter un joueur : formulaire simple (champ nom), création du joueur en base avec ELO initial par défaut (1000). Retour automatique à la page classement. - Difficulté 1/5 - Claude
- [fait] Ranking — Ajouter un match Pétanque : sélection des joueurs participants, désignation des gagnants, calcul et mise à jour des ELO selon l'algorithme standard, sauvegarde en base. - Difficulté 3/5 - Claude
- [fait] Ranking — Ajouter un match Fléchettes : sélection des joueurs participants, saisie de l'ordre d'arrivée, calcul et mise à jour des ELO, sauvegarde en base. - Difficulté 3/5 - Claude
- [fait] Ranking — Bouton "Enregistrer la partie" (End Game) : ajouter un bouton Default "Enregistrer la partie" sur l'écran End Game (`node-id=7-783`), redirigant vers le flow d'ajout d'un match Pétanque dans le classement. - Difficulté 2/5 - Codex
- [fait] Ranking — Fléchettes drag/drop : améliorer le feedback utilisateur — au début du drag, garder un slot fantôme à la position d'origine (les autres joueurs ne se décalent pas), déplacer ce ghost pendant le survol pour indiquer l'emplacement cible, animer les changements de position avec une transition smooth. - Difficulté 3/5 - Codex
- [fait] Ranking — Masquer bouton "Suivant" quand le clavier est ouvert sur l'ajout de joueur (étape 1 du flow AddMatch). - Difficulté 2/5 - Claude
- [fait] Ranking — Debug tools : en mode debug, ajouter un bouton "Réinitialiser l'ELO" dans chaque page de classement par sport, et un long press sur les joueurs pour les supprimer (avec confirmation AlertSheet). - Difficulté 1/5 - Claude
- [fait] Ranking — ELO fléchettes trop volatile : avec 5 joueurs, les deltas pairwise peuvent dépasser ±100 par match. Calibrer le K-factor pour les matchs à N joueurs (diviser par N-1 ou ajuster la constante). - Difficulté 1/5 - Claude
- [fait] Ranking — Bug drag-and-drop fléchettes (flickering + joueurs cachés) : corriger deux bugs liés au tri des gagnants dans l'écran fléchettes — (1) flickering visuel au moment du drop, (2) quand on repose un joueur puis on le reprend et le remonte, chaque joueur survolé devient invisible. - Difficulté 3/5 - Claude
- [fait] Ranking — Sélection gagnants pétanque "winners only" : à l'étape de sélection des gagnants (mode pétanque), l'utilisateur peut ne désigner QUE les gagnants — les joueurs laissés "undecided" deviennent automatiquement perdants à la confirmation. Afficher 1 seconde le feedback visuel (tag "perdant" appliqué sur les undecided) avant de passer à l'écran suivant. - Difficulté 1/5 - Claude

## Priorité moyenne

<!-- fonctionnalités importantes mais non bloquantes -->

- [en cours] Ranking — Repositionner le bouton "Ajouter un joueur" : déplacer le bouton dans les pages de classement selon la maquette Figma (`node-id=62-1601`).

- [fait] Logo et nom de l'appli : modifier le logo, le nom affiché et le slug de l'application. - Difficulté 1/5 - Codex
- [fait] Ranking — Écran winner fléchettes et composants : mettre à jour `Design.md` avec l'écran de choix du gagnant en mode tri (fléchettes) depuis Figma (`node-id=69-159`) et ses composants spécifiques (`node-id=69-190`), puis implémenter l'écran et les composants dans le flow d'ajout de match Fléchettes. Mettre à jour le catalogue de composants et les tokens si nécessaire. - Difficulté 3/5 - Codex
- [fait] Design check — Composants partagés : comparer chacun des 14 composants listés dans `COMPOSANTS — Partagés` de `Design.md` avec son équivalent Figma. Vérifier récursivement : couleurs, typographie, tailles, paddings, gaps, rayons, états. Couvrir : ScoreBoard, Rule, HistoryItem, History, Button, ButtonIcon, Head, AlertBox, Logo, WheelPicker, SetupOption, IncrementalInput, Readonly, BonusButton. - Difficulté 2/5 - Codex
- [fait] Design check — Écrans Setup : vérifier la conformité Figma des 4 étapes Setup — Mode Choice (`node-id=1-5`), End Condition (`node-id=4-116`), Target Value (`node-id=4-124`), Veto Toggle (`node-id=4-234`). Même protocole : couleurs, typo, layout, espaces. - Difficulté 2/5 - Codex
- [fait] Design check — Écrans Game : vérifier la conformité Figma de tous les états de jeu — Classic ingame (`node-id=1-12`), Fantasy scoreState (`node-id=4-638`), Fantasy ruleState (`node-id=8-1013`), Inter-mène (`node-id=4-742`), Post-mène (`node-id=18-1857`), End Game (`node-id=7-783`). Inclut création de `GameScreenLayout` master template (drawer collapsible, back button fixe, scrollView unifié) et migration de PlayingView / PreMeneView / SimpleModeView. - Difficulté 4/5 - Claude
- [fait] AlertBox confirmation Véto : avant d'appliquer un véto, afficher une AlertBox de confirmation ("Utiliser votre véto sur cette règle ?") avec les boutons Confirmer / Annuler. Le véto ne doit être consommé qu'après confirmation explicite. - Difficulté 1/5 - Claude

## Priorité basse

<!-- améliorations, polish, nice-to-have -->

- [fait] UI spécifique règle Totem d'immunité : refonte selon maquette Figma. - Difficulté 2/5 - Codex
- [fait] UI spécifique règle Sortie de porc : refonte selon maquette Figma. - Difficulté 2/5 - Codex
- [fait] UI spécifique règle Contrat : refonte selon maquette Figma. - Difficulté 2/5 - Codex
- [fait] EndGame screen — vérifier padding : inspecter l'écran de fin de partie et corriger tout padding excessif ou manquant selon `Design.md` (`node-id=7-783`). - Difficulté 1/5 - Claude
- [fait] UI spécifique règle Assurance vie : refonte selon maquette Figma. - Difficulté 2/5 - Codex
- [fait] UI spécifique règle Frontière : refonte selon maquette Figma. - Difficulté 2/5 - Codex
- [en cours] UI spécifique règle L'impair contre-attaque : vérifier/refondre l'affichage d'aide au scoring automatique.
- [ ] Animation UI — lévitation point bonus : le badge "+X" vert dans le bloc score de la mène doit avoir une animation de lévitation (flottement léger en boucle).
- [fait] Animation UI — chiffres du score : modifier l'animation des chiffres pour qu'on voie clairement l'incrémentation chiffre après chiffre. L'unité doit réagir sans délai perceptible au touché ; utiliser une courbe d'accélération plus directe (moins d'ease-in). - Difficulté 1/5 - Claude
- [fait] Ranking — Stats fléchettes : remplacer le nombre de victoires/défaites par un taux de victoire affiché sous la forme "31% winrate" (victoires ÷ matchs joués, arrondi à l'entier). - Difficulté 1/5 - Claude
- [fait] Ranking — Taille des icônes trophée top 3 : ajuster la taille des icônes trophée pour les 3 premiers du classement (informer l'utilisateur de la taille actuelle, puis demander la nouvelle taille souhaitée avant d'implémenter). - Difficulté 1/5 - Codex
- [ ] UI polish — supprimer les bordures des scores de mène dans l'écran de jeu en cours.
- [ ] Polish UI — tailles de textes : réduire la taille du score de mène dans l'interface partie en cours ; réduire globalement les tailles de textes d'un cran.
- [ ] Design system / bouton disabled : ajouter le token de couleur disabled et appliquer le style du bouton disabled depuis la maquette Figma `node-id=4-276`.
- [ ] Home — tagline : réduire la police de la tagline à 21 px.
- [ ] Inter-mène UI — règle alignée en haut : dans l'écran inter-mène (affichage règle + vétos), aligner le contenu de la règle en haut de l'écran plutôt qu'en bas.
- [ ] Config règles — padding excessif : réduire le padding autour des règles dans les écrans de config (mode CONFIG).
- [ ] Harmoniser les espaces dans le scoreboard et autour des boutons conditionnels (bonus/malus/véto) qui peuvent apparaître dynamiquement.
- [ ] Mène classique UI : ajouter un espace de 4 px entre le score board et le bouton.
- [ ] Mène classique UI : ajouter un masque gradient ou progressive blur en haut sous le header et dans l'historique pour un effet smooth.
- [ ] Fin de partie UI : ajouter un masque gradient ou progressive blur en bas au-dessus du bouton et dans l'historique pour un effet smooth.
- [ ] Inter-mène fantasy UI : ajouter un espace entre les vétos et le bouton.
- [ ] Transitions animées au début de mène — séquence en 6 temps : (A) titre + description de règle apparaissent progressivement style "ChatGPT" ; (B) le bloc remonte en haut de l'écran, toujours visible ; (C) blocs de score total apparaissent en bas puis le label au-dessus ; (D) éléments spécifiques à la mène apparaissent au milieu ; (E) boutons véto apparaissent sous les blocs score, décalant le score vers le haut ; (F) bouton "Terminer la mène" apparaît grisé en bas, décalant le score vers le haut. Dépend de la tâche "Refonte UI GameScreen".
- [ ] Cadrage animations/transitions Game : à reprendre seulement quand le flow de partie est stabilisé ; demander où les transitions doivent avoir lieu, évaluer si une librairie est nécessaire, puis créer une tâche par transition avec un brief précis validé par l'utilisateur.
- [ ] Design check — UIs règles spécifiques : vérifier la conformité Figma des UIs de règles — TeamRowButton (`node-id=15-1468`, `15-1509`), Config ValueInput (`node-id=16-1569`), Casino (`node-id=17-1625`), Prediction (`node-id=18-1701`). À faire après la refonte des UIs spécifiques de toutes les règles.

---

## Fait

<!-- tâches terminées — archivées ici pour mémoire -->

### Priorité haute (historique)

- [fait] Vérifier les instructions Claude et Codex (`CLAUDE.md` / `AGENTS.md`) et les harmoniser pour qu'elles appliquent le même protocole. - Difficulté 1/5 - Codex
- [fait] Fix warnings Expo / edge-to-edge : retirer `newArchEnabled: false` de `app.json` et supprimer ou adapter les appels non supportés `setPositionAsync` / `setBehaviorAsync` quand l'edge-to-edge est activé.
- [fait] Bug — Totem d'immunité (et potentiellement d'autres règles) : la règle s'affiche deux fois sur l'écran de mène. Identifier la cause et vérifier que le problème ne touche pas d'autres règles. (commit `83bb4a2`)
- [fait] Top bar / bouton retour en haut à gauche (tous les modes) : ajouter un bouton permettant d'annuler la partie en cours. Une alerte de confirmation prévient que la partie sera perdue si l'utilisateur confirme. Corriger aussi le placement de la top bar pour respecter la barre d'état / safe area du téléphone : aucun élément de l'app ne doit passer sous l'heure, les icônes système ou l'encoche. (commit `2e54068`)

### Priorité moyenne (historique)

- [fait] Créer `Design.md` : dictionnaire des styles (tokens de couleur, typographie, espacements), liste des écrans avec leurs liens Figma. Servira de référence centrale pour tous les agents. - Difficulté 2/5 - Claude
- [fait] Skill `/design-check` : skill Claude Code qui lit `Design.md`, parcourt les fichiers de style du code (`theme.ts`, composants), vérifie la parité d'utilisation des composants partagés sur les pages référencées, et produit un rapport de divergences. Modifier aussi `CLAUDE.md` et `AGENTS.md` pour demander l'usage de ce skill quand l'utilisateur le demande. Dépend de `Design.md` stable (liens Figma remplis). - Difficulté 1/5 - Codex
- [fait] Design check — Tokens globaux : scanner tous les fichiers UI (`*.tsx`, `*.ts` dans `src/`) et vérifier qu'aucune couleur hex ni valeur typographique (fontSize, lineHeight, letterSpacing, fontWeight) n'est hardcodée — tout doit passer par `colors.*` et `figmaTextStyles.*`. Lister toutes les violations trouvées et les corriger. - Difficulté 2/5 - Claude
- [fait] Design check — Écrans Home : vérifier la conformité Figma des écrans Home (`node-id=1-2`) et Home Debug (`node-id=1-74`). Couleurs, typo, layout, espaces, alignements, composants utilisés. - Difficulté 2/5 - Claude
- [fait] Écran post-mène : après la fin d'une mène, afficher un écran intermédiaire qui anime l'incrément du score et résume les mini-objectifs/bonus/malus accomplis durant la mène. - Difficulté 3/5 - Claude
- [fait] BUG — Drawer score en partie en cours : ouvrir le drawer clique accidentellement les boutons bonus/malus en-dessous (les boutons se togglent). Identifier et neutraliser les touch events pendant l'ouverture du drawer. - Difficulté 1/5 - Claude
- [fait] Short description absente en mène : dans l'écran de mène (PlayingView), ne pas afficher la short description de la règle — elle doit apparaître uniquement en inter-mène (inter-round) et en écran de config. - Difficulté 2/5 - Codex
- [fait] Bug AlertBox : l'AlertBox custom n'est pas utilisée lors de l'annulation d'une partie fantasy. - Difficulté 1/5 - Codex
- [fait] Mode simple — ajustements layout : blocs en bas, historique ancré au-dessus (pousse vers le haut), skip inter-mène. (commit `142a1dc`)
- [fait] Refonte HomeScreen selon les maquettes Figma fournies.
- [fait] Plein écran avec navigation OS accessible : passer l'app en mode immersif (edge-to-edge) tout en permettant aux boutons de navigation OS d'apparaître sur swipe/tap. (commit `c5c04ed`)
- [fait] Refonte SetupScreen selon les maquettes Figma fournies (à décomposer en sous-tâches par écran lors de l'implémentation). (commit `45bc3c8`)
- [fait] Refonte écrans de jeu selon les maquettes Figma fournies — 4 écrans : Mène classique, Mène fantasy, Inter-mène fantasy, Fin de partie. (commit `08ad8bd`)
- [fait] Affichage enrichi des textes de règles : supporter le highlight `<b>...</b>` en couleur secondaire et les retours à la ligne `\n` dans les règles affichées.
- [fait] Scroll adaptatif écran de mène : quand le texte d'une règle est trop long, permettre de scroller la vue. Adapter la gesture selon l'intention : lire la règle (scroll) vs ajouter les points (interaction score).
- [fait] Historique de mène classique : conserver l'empilement avec la dernière mène en bas et, lors de l'ajout d'une mène, garder la nouvelle mène visible en masquant d'abord les anciennes mènes en haut.
- [fait] Flow règles à interface spécifique : pour les règles nécessitant un choix avant la mène, afficher ce choix dans un écran séparé entre l'inter-mène et la mène (exemple : choix du côté pour la règle Frontière).
- [fait] Review technique de milieu de projet : auditer l'ensemble de la codebase pour repérer la dette technique, les incohérences d'architecture, les risques de tests manquants et les refactors prioritaires avant d'accumuler davantage. (commit `58e903d`)
- [fait] Header commun des écrans de jeu : factoriser la top bar et le bouton retour dans un composant partagé utilisant l'icône Phosphor, aligné avec les pages setup.
- [fait] AlertBox custom : remplacer les alertes système par des alertes custom alignées avec la maquette Figma à fournir. - Difficulté 2/5 - Claude
- [fait] Config création de partie (commits `7b186e8`, `ac355d6`) : par défaut, sélectionner la condition de fin "score 13 points" plutôt que le nombre de mènes.
- [fait] Ajustements interaction score classique (commit `7b186e8`) : supprimer le bouton "Annuler" au profit du tap sur l'équipe adverse, afficher "Tapez pour annuler" côté adverse, garder les boutons de score carrés et stables, et positionner le "+X" en absolu pour éviter tout agrandissement.
- [fait] Refonte UI GameScreen (commit `5e83607`) : (1) supprimer les labels "Partie en cours" et "Mène X" ; (2) centrer et mettre en avant le nom + description de la règle ; (3) boutons véto positionnés tout en haut de l'écran (collés) ; (4) bouton "Terminer la mène" ancré en bas de l'écran.
- [fait] Flow de création de partie (commit `e13c775`) : HomeScreen épuré (logo + JOUER, 5 taps debug), wizard 4 étapes (mode → condition de fin score/mènes → valeur WheelPicker → véto), bouton ancré en bas.
- [fait] Mode debug : sélection manuelle de règle avant chaque mène via DebugRuleSelectScreen (commit `e13c775`).
- [fait] Interaction classique d'ajout de point (commit `de53135`) : pour les mènes de comptage classique, remplacer les boutons "Rouge marque" et "Bleu marque" par une interaction sur les carrés de score total en haut.

### Priorité basse (historique)

- [fait] UI règles : aligner le contenu des règles en haut de l'écran plutôt qu'au milieu. - Difficulté 1/5 - Claude
- [fait] UI composant Rule : ajuster le composant selon la maquette Figma mise à jour (`node-id=4-730`). - Difficulté 2/5 - Codex
- [fait] UI Scoreboard : ajuster le composant selon la maquette Figma mise à jour avec le total sous la mène (`node-id=4-268`). - Difficulté 1/5 - Claude
- [fait] Cadrage UI règles spécifiques : lister les règles avec UI dédiée, associer chaque règle à sa maquette Figma, valider le découpage et identifier les conflits éventuels avec les composants partagés. - Difficulté 1/5 - Codex
- [fait] UI spécifique règle Casino : refonte selon maquette Figma. - Difficulté 4/5 - Codex
- [fait] UI spécifique règle Prédiction : refonte selon maquette Figma. - Difficulté 3/5 - Claude
- [fait] UI spécifique règles bonus/malus simples : Gauche caviar, Les extrêmes, Censure, La boule maudite, King of the Hill. - Difficulté 3/5 - Codex
- [fait] Score board UI : animer le changement de tous les chiffres style tableau de gare. - Difficulté 2/5 - Claude
- [fait] Créer un design system tokénisé et en profiter pour créer une identité visuelle à l'application. (commit `7b186e8`)
- [fait] Typographie centralisée : créer un fichier de design system pour toutes les propriétés de chaque style de police. - Difficulté 3/5 - Claude
- [fait] QA manuelle des règles une par une : vérifier pour chacune des 24 règles la description, l'interface, la logique de jeu et l'équilibrage. - Difficulté 1/5 - Codex

### Sans catégorie (historique)

- [fait] Bootstrap architecture complète — 24 règles, moteur de jeu, store Zustand, 65 tests (commit `90708aa`)
- [fait] Splash screen (commit `0aafe5d`)
- [fait] Debug rule picker — sélection manuelle de règle (commit `5c8bc97`)
- [fait] Bug : le véto apparaît si je marque puis annule les points dans un écran de mène (commits `cbb4367`, `c0d6c77`)
