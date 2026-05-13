# ROADMAP — Fantasy Pétanque

Fichier géré par les agents. Ne pas éditer manuellement — utiliser l'inbox de `TODO.md`.

Statuts : `[ ]` à faire · `[en cours]` pris par un agent · `[fait]` terminé et commité

---

## Priorité haute

<!-- tâches critiques pour le fonctionnement de base -->

- [fait] Fix warnings Expo / edge-to-edge : retirer `newArchEnabled: false` de `app.json` et supprimer ou adapter les appels non supportés `setPositionAsync` / `setBehaviorAsync` quand l'edge-to-edge est activé.
- [fait] Bug — Totem d'immunité (et potentiellement d'autres règles) : la règle s'affiche deux fois sur l'écran de mène. Identifier la cause et vérifier que le problème ne touche pas d'autres règles. (commit `83bb4a2`)
- [fait] Top bar / bouton retour en haut à gauche (tous les modes) : ajouter un bouton permettant d'annuler la partie en cours. Une alerte de confirmation prévient que la partie sera perdue si l'utilisateur confirme. Corriger aussi le placement de la top bar pour respecter la barre d'état / safe area du téléphone : aucun élément de l'app ne doit passer sous l'heure, les icônes système ou l'encoche. (commit `2e54068`)

## Priorité moyenne

<!-- fonctionnalités importantes mais non bloquantes -->

- [fait] Mode simple — ajustements layout : blocs en bas, historique ancré au-dessus (pousse vers le haut), skip inter-mène. (commit `142a1dc`)
- [en cours] Refonte HomeScreen selon les maquettes Figma fournies.
- [fait] Plein écran avec navigation OS accessible : passer l'app en mode immersif (edge-to-edge) tout en permettant aux boutons de navigation OS d'apparaître sur swipe/tap. (commit `c5c04ed`)
- [fait] Refonte SetupScreen selon les maquettes Figma fournies (à décomposer en sous-tâches par écran lors de l'implémentation). (commit `45bc3c8`)
- [fait] Refonte écrans de jeu selon les maquettes Figma fournies — 4 écrans : Mène classique, Mène fantasy, Inter-mène fantasy, Fin de partie. (commit `08ad8bd`)
- [ ] Affichage enrichi des textes de règles : supporter le highlight `<b>...</b>`, le style atténué `<weak>...</weak>` et les retours à la ligne `\n` dans les règles affichées.
- [fait] Config création de partie (commits `7b186e8`, `ac355d6`) : par défaut, sélectionner la condition de fin "score 13 points" plutôt que le nombre de mènes.
- [fait] Ajustements interaction score classique (commit `7b186e8`) : supprimer le bouton "Annuler" au profit du tap sur l'équipe adverse, afficher "Tapez pour annuler" côté adverse, garder les boutons de score carrés et stables, et positionner le "+X" en absolu pour éviter tout agrandissement.
- [fait] Refonte UI GameScreen (commit `5e83607`) : (1) supprimer les labels "Partie en cours" et "Mène X" ; (2) centrer et mettre en avant le nom + description de la règle ; (3) boutons véto positionnés tout en haut de l'écran (collés) ; (4) bouton "Terminer la mène" ancré en bas de l'écran.
- [fait] Flow de création de partie (commit `e13c775`) : HomeScreen épuré (logo + JOUER, 5 taps debug), wizard 4 étapes (mode → condition de fin score/mènes → valeur WheelPicker → véto), bouton ancré en bas.
- [fait] Mode debug : sélection manuelle de règle avant chaque mène via DebugRuleSelectScreen (commit `e13c775`).
- [fait] Interaction classique d'ajout de point (commit `de53135`) : pour les mènes de comptage classique, remplacer les boutons "Rouge marque" et "Bleu marque" par une interaction sur les carrés de score total en haut. Appuyer sur le carré rouge ou bleu affiche un "+X" sous le score total. Le bouton pour terminer ne s'active que lorsqu'au moins un point est ajouté. Sur ces parties, le score total se déplace au milieu de l'écran avec le texte "Tapez le nombre de points marqués" au-dessus. Enlever le label ROUGE et BLEU dans les carrés.

## Priorité basse

<!-- améliorations, polish, nice-to-have -->

- [ ] Refonte écrans de jeu spécifiques selon les maquettes Figma fournies (à décomposer par type de règle nécessitant un UI dédié).
- [fait] Créer un design system tokénisé et en profiter pour créer une identité visuelle à l'application. (commit `7b186e8`)
- [ ] Transitions animées au début de mène — séquence en 6 temps : (A) titre + description de règle apparaissent progressivement style "ChatGPT" ; (B) le bloc remonte en haut de l'écran, toujours visible ; (C) blocs de score total apparaissent en bas puis le label au-dessus ; (D) éléments spécifiques à la mène apparaissent au milieu ; (E) boutons véto apparaissent sous les blocs score, décalant le score vers le haut ; (F) bouton "Terminer la mène" apparaît grisé en bas, décalant le score vers le haut. Dépend de la tâche "Refonte UI GameScreen".

## Fait

<!-- tâches terminées — archivées ici pour mémoire -->

- [fait] Bootstrap architecture complète — 24 règles, moteur de jeu, store Zustand, 65 tests (commit `90708aa`)
- [fait] Splash screen (commit `0aafe5d`)
- [fait] Debug rule picker — sélection manuelle de règle (commit `5c8bc97`)
- [fait] Bug : le véto apparaît si je marque puis annule les points dans un écran de mène (commits `cbb4367`, `c0d6c77`)
