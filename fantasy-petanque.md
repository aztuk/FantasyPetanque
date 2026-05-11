# Fantasy Pétanque — Spécification fonctionnelle

## Pitch

Application mobile permettant de modifier les règles de la pétanque pour rendre les parties plus fun, plus chaotiques et plus mémorables.

L'application permet aussi de compter les scores en direct.

Elle propose deux usages principaux :

1. **Mode simple** : compter les points d'une partie classique.
2. **Mode fantasy** : tirer une règle spéciale à chaque mène et gérer automatiquement les bonus, malus ou effets spécifiques.

L'objectif est de garder une application très rapide à utiliser. Les joueurs doivent passer le moins de temps possible dans l'interface et le plus de temps possible à jouer.

---

# Principes de design

L'application doit être :

- **rapide** : peu de clics, peu d'écrans, peu de friction ;
- **lisible** : le score et la règle en cours doivent être visibles immédiatement ;
- **fun** : le ton peut être léger, absurde ou provocateur ;
- **souple** : les joueurs arbitrent eux-mêmes les situations limites ;
- **directe** : l'app accompagne la partie, elle ne doit pas la ralentir.

L'application ne cherche pas à tout vérifier automatiquement. Elle sert surtout à :

- tirer les règles ;
- afficher clairement la règle en cours ;
- compter les points ;
- enregistrer les bonus/malus ;
- garder un historique des mènes.

---

# Modes de jeu

## Mode simple

Dans ce mode, seul un compteur de points apparaît.

L'écran affiche :

- le score total de l'équipe bleue ;
- le score total de l'équipe rouge ;
- une action rapide pour ajouter les points d'une mène ;
- une action pour annuler en cas d'erreur.

Aucune règle spéciale n'est tirée.

---

## Mode fantasy

Dans ce mode, chaque mène reçoit sa propre règle, choisie aléatoirement depuis une banque de règles.

### Tirage des règles

- Une règle ne peut pas apparaître deux fois dans une même partie tant que toutes les autres règles disponibles n'ont pas été jouées.
- Chaque équipe dispose d'un **véto** par partie.
- Un véto permet de refuser une règle tirée et de relancer un tirage.
- Un bouton est disponible pour chaque équipe pour véto, utilisation unique, passant ainsi à la mène suivante.
- Une règle refusée par véto peut réapparaître plus tard si toutes les autres règles ont été épuisées.

### Tags techniques invisibles

Les règles ne sont pas présentées aux joueurs par catégories.

En revanche, chaque règle possède des **tags techniques invisibles** utilisés uniquement par le moteur de jeu.

Ces tags permettent notamment de :

- filtrer les règles compatibles avec certains effets ;
- empêcher certaines règles d'apparaître dans des situations impossibles ;
- permettre à **Totem d'immunité** de sélectionner une règle compatible pour la prochaine mène ;
- identifier les règles qui remplacent le score normal ;
- identifier les règles qui nécessitent une interface spécifique.

Exemples de tags techniques invisibles :

```json
{
  "id": "gauche-caviar",
  "name": "Gauche caviar",
  "tags": ["fast", "totem-compatible", "bonus", "specific-ui"]
}
```

Les tags ne doivent jamais être visibles dans l'interface joueur, sauf si une vue debug est créée plus tard.

---

# Interface globale

## Objectif d'interface

L'application se veut très rapide et directe.

Les joueurs ne doivent pas être pollués par des interactions inutiles, des textes trop longs ou trop d'icônes.

Une fois la partie commencée, l'écran doit permettre de comprendre en moins de deux secondes :

- qui gagne ;
- quelle est la règle en cours ;
- quelles actions sont disponibles ;
- comment terminer la mène.

---

## Structure de l'écran de partie

En haut de l'écran :

- un gros carré bleu à gauche ;
- un gros carré rouge à droite.

Ces deux blocs affichent les scores totaux des équipes.

Le bleu est toujours à gauche.  
Le rouge est toujours à droite.

Les scores totaux doivent rester visibles sur tous les écrans pendant la partie.

Sous les scores :

- nom de la règle en cours ;
- description courte de la règle ;
- éventuelles actions spécifiques liées à la règle.

En bas :

- un gros bouton **Mène terminée**.

Une fois la mène résolue :

- un gros bouton **Nouvelle mène** permet de lancer la prochaine règle.

---

# Flow de score rapide

À la fin d'une mène, l'utilisateur appuie sur **Mène terminée**.

L'application affiche alors deux gros boutons :

- **Bleu marque** ;
- **Rouge marque**.

Appuyer sur un bouton ajoute progressivement les points normaux de la mène à cette équipe.

Exemple :

- premier appui sur **Bleu marque** : Bleu +1 ;
- deuxième appui : Bleu +2 ;
- troisième appui : Bleu +3 ;
- etc.

Dès qu'une équipe reçoit un point normal, l'autre bouton est désactivé naturellement, car une seule équipe peut marquer les points normaux d'une mène.

L'utilisateur peut annuler le dernier point ajouté avec un bouton **Annuler**.

Si l'utilisateur annule tous les points normaux, les deux équipes redeviennent sélectionnables.

Les bonus et malus déjà enregistrés pendant la mène restent visibles à côté du score normal.

L'objectif est d'éviter un sélecteur de points ou un flow en plusieurs étapes.

---

# Affichage du delta de mène

Pendant l'écran de fin de mène, l'application affiche clairement le delta de la mène à côté du score total.

Exemple :

```txt
Bleu
Score total : 8
Cette mène : +3

Rouge
Score total : 5
Cette mène : -1
```

Le delta inclut :

- les points normaux ;
- les bonus ;
- les malus ;
- les effets spéciaux de la règle en cours.

---

# Historique et résumé

Une fois la partie terminée, un résumé affiche le breakdown de chaque mène avec :

- règle jouée ;
- points normaux ;
- bonus ;
- malus ;
- raison de chaque bonus/malus ;
- score après la mène.

Exemple :

```txt
Mène 4 — Censure
Rouge : +2 points normaux
Bleu : -1 point, a parlé pendant la mène
Score après mène : Bleu 5 / Rouge 8
```

---

# Règles

## Gauche caviar

Chaque joueur doit lancer avec sa mauvaise main.

Un tir réussi vaut **+1 point bonus**.

Maximum : **1 bonus par équipe**.

### Interface spécifique

Bouton pour chaque équipe :

- **Tir réussi +1**

Le bouton ajoute un point bonus à l'équipe concernée.

Il doit être possible de retirer ce point bonus en cas d'erreur de manipulation.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "bonus", "specific-ui"]
```

---

## Les extrêmes

Lancez le cochonnet, puis déplacez-le à environ 10 cm du bord.

Placer une boule entre le cochonnet et le bord vaut **+1 point bonus**.

Maximum : **1 bonus par équipe**.

### Interface spécifique

Bouton pour chaque équipe :

- **Boule entre bord et cochonnet +1**

Le bouton ajoute un point bonus à l'équipe concernée.

Il doit être possible de retirer ce point bonus en cas d'erreur de manipulation.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "bonus", "specific-ui"]
```

---

## Censure

Vous pouvez émettre des sons, mais un vrai mot prononcé condamne votre équipe à **-1 point**.

Le roi du silence commence quand la première boule est lancée.

Il se termine quand la dernière boule de la mène s'est arrêtée.

Maximum : **3 malus par équipe**.

### Interface spécifique

Bouton pour chaque équipe :

- **A parlé -1**

Le bouton retire un point à l'équipe concernée.

Il doit être possible d'annuler ce malus en cas d'erreur de manipulation.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "malus", "specific-ui"]
```

---

## Dôme de fer

Si votre adversaire mène de deux points dans cette mène, vous êtes obligés de tirer.

Cette règle demande un auto-arbitrage des joueurs.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "auto-arbitrage"]
```

---

## Apollo boule

Toutes les boules doivent être lancées en cloche.

Le cochonnet est lancé normalement.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "gesture"]
```

---

## Drunk simulator

Avant chaque lancer, le joueur doit faire trois tours complets sur lui-même.

Le cochonnet est lancé normalement.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "gesture"]
```

---

## Footanque

Toutes les boules doivent être jouées avec le pied.

Le cochonnet est lancé normalement.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "gesture"]
```

---

## Sortie de porc

Si un joueur parvient à faire sortir le cochonnet, son équipe gagne immédiatement **6 points** et la mène se termine.

### Interface spécifique

Bouton pour chaque équipe :

- **Cochonnet sorti +6**

Si l'utilisateur clique ensuite sur **Mène terminée**, l'étape de score normal est sautée.

L'application ajoute directement 6 points à l'équipe concernée.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "instant-resolution", "skip-normal-score", "specific-ui"]
```

---

## Dos Santos

Toutes les boules doivent être jouées en arrière.

Le joueur peut regarder avant de se placer, mais doit lancer dos au terrain.

Le cochonnet est lancé normalement.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "gesture"]
```

---

## Perte d'aura

Toutes les boules doivent être jouées en prenant de l'élan.

Le cochonnet est lancé normalement.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "gesture"]
```

---

## L'impair contre-attaque

L'équipe gagnante doit gagner avec un nombre impair de points normaux.

Si ce n'est pas le cas, l'équipe gagnante ne marque rien et l'autre équipe remporte **1 point de consolation**.

Exemples :

- Bleu gagne avec 1 point : Bleu marque 1.
- Bleu gagne avec 3 points : Bleu marque 3.
- Bleu gagne avec 2 points : Bleu marque 0, Rouge marque 1.
- Bleu gagne avec 4 points : Bleu marque 0, Rouge marque 1.

### Interface spécifique

Pas de bouton spécifique.

Le comptage des points doit absolument prendre en compte cette règle au moment d'écrire le score normal.

L'utilisateur doit être informé que l'application calculera automatiquement le résultat final.

Il n'a besoin de renseigner que le score normal de la mène.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "score-modifier", "auto-resolution"]
```

---

## Make Pétanque Great Again

Avant la mène, chaque équipe choisit son **Trump**.

Pendant cette mène, seules les boules des Trump peuvent marquer des points.

Les autres joueurs peuvent toujours jouer, mais leurs boules servent uniquement à :

- gêner ;
- protéger ;
- tirer ;
- déplacer le cochonnet ;
- bloquer une trajectoire.

À la fin de la mène, les boules des joueurs qui ne sont pas Trump ne comptent pas dans le score normal.

### Interface spécifique

Aucune interface spécifique obligatoire.

L'application affiche simplement un rappel visible :

> Seules les boules des Trump peuvent marquer.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "scoring-constraint", "auto-arbitrage"]
```

---

## Deuxième service

Pendant cette mène, la boule la plus proche ne compte pas.

Le comptage commence à partir de la deuxième boule la plus proche.

Exemple :

- la meilleure boule est bleue ;
- la deuxième et la troisième sont rouges ;
- rouge marque 2 points.

### Interface spécifique

Pas de bouton spécifique.

L'application affiche simplement un rappel au moment de compter les points.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "scoring-constraint", "auto-arbitrage"]
```

---

## Ctrl + Z

Pendant cette mène, chaque joueur peut décider de relancer une fois s'il n'est pas satisfait de son lancer.

La première tentative est alors annulée.

Chaque joueur ne peut utiliser cette relance qu'une fois pendant la mène.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["fast", "totem-compatible", "reroll", "auto-arbitrage"]
```

---

## Permis de construire

Chaque équipe peut ajouter un obstacle sur le terrain.

La taille de l'obstacle est illimitée.

L'obstacle peut être placé à n'importe quel moment de la mène, mais jamais pendant qu'une boule est en mouvement.

Une fois placé, l'obstacle reste en jeu jusqu'à la fin de la mène, sauf accord explicite entre les joueurs.

### Interface spécifique

Aucune interface spécifique.

L'application affiche seulement le rappel :

> Les obstacles peuvent être placés n'importe quand, mais jamais pendant qu'une boule est en mouvement.

### Tags techniques invisibles

```json
["setup", "totem-compatible", "auto-arbitrage"]
```

---

## Contrat

Chaque équipe choisit une mission parmi les cinq suivantes :

1. Toucher et déplacer le cochonnet.
2. Faire un carreau.
3. Finir avec exactement 2 points.
4. Réussir 2 tirs.
5. Avoir la boule la plus éloignée mais encore en jeu.

Mission réussie : **+2 points bonus**.

Maximum : **1 mission réussie par équipe**.

### Interface spécifique

Chaque mission est affichée au centre.

À gauche de chaque mission : bouton bleu pour sélectionner cette mission pour l'équipe bleue.

À droite de chaque mission : bouton rouge pour sélectionner cette mission pour l'équipe rouge.

Chaque équipe ne peut sélectionner qu'une seule mission.

Une fois les deux missions sélectionnées, l'interface affiche :

- un bouton **Annuler** pour permettre une resélection ;
- un bouton **Mission réussie +2** côté bleu ;
- un bouton **Mission réussie +2** côté rouge.

Chaque bouton de réussite ajoute 2 points bonus à l'équipe concernée.

Maximum : **1 réussite par équipe**.

### Tags techniques invisibles

```json
["setup", "bonus", "specific-ui", "mission"]
```

---

## La boule maudite

L'équipe qui lance le cochonnet lance aussi une boule neutre.

Pendant cette mène, si une équipe touche cette boule, elle perd **1 point**.

Maximum : **1 malus par équipe**.

### Interface spécifique

Bouton pour chaque équipe :

- **A touché la boule -1**

Le bouton retire un point à l'équipe concernée.

Il doit être possible de retirer ce malus en cas d'erreur de manipulation.

### Tags techniques invisibles

```json
["setup", "totem-compatible", "malus", "specific-ui"]
```

---

## King of the Hill

Autour du cochonnet, placez le cercle de position.

Les boules finissant dans cette zone comptent double si elles rapportent un point.

Exemple :

- Bleu a 2 boules gagnantes.
- Une boule gagnante est dans la zone.
- Bleu marque 3 points au lieu de 2.

### Interface spécifique

Bouton pour chaque équipe :

- **Boule gagnante dans zone +1**

Le bouton ajoute un point bonus à l'équipe concernée.

Il doit être possible de retirer ce bonus en cas d'erreur de manipulation.

Maximum : **6 bonus par équipe**.

### Tags techniques invisibles

```json
["setup", "totem-compatible", "bonus", "specific-ui"]
```

---

## Le duel

Pendant cette mène, chaque équipe choisit son champion.

Les deux champions lancent toutes les boules de leur équipe.

Les autres encouragent.

Le champion perdant doit être humilié, débrouillez-vous.

### Interface spécifique

Aucune interface spécifique.

### Tags techniques invisibles

```json
["setup", "totem-compatible", "auto-arbitrage"]
```

---

## Assurance vie

Avant la mène, chaque équipe peut choisir de prendre une assurance.

Si une équipe assurée perd la mène, elle marque quand même **1 point**.

Mais si une équipe assurée gagne la mène, elle marque **1 point de moins** sur ses points normaux.

Une équipe ne peut pas descendre sous 0 point sur le score de la mène.

Exemples :

- Bleu prend une assurance et perd la mène : Bleu marque +1.
- Bleu prend une assurance et gagne avec 3 points normaux : Bleu marque 2 points.
- Bleu prend une assurance et gagne avec 1 point normal : Bleu marque 0 point.

### Interface spécifique

Avant la mène, afficher pour chaque équipe :

- **Prendre assurance**

Chaque équipe peut activer ou désactiver son assurance avant la première boule.

Au moment du score normal, l'application applique automatiquement l'effet :

- perdant assuré : +1 point ;
- gagnant assuré : -1 point sur ses points normaux.

### Tags techniques invisibles

```json
["setup", "score-modifier", "specific-ui", "auto-resolution"]
```

---

## Frontière

Après le lancer du cochonnet, on définit une ligne gauche/droite sur le terrain.

Chaque équipe choisit un côté de la frontière.

À la fin de la mène, seules les boules situées du bon côté peuvent compter pour chaque équipe.

Les boules placées du mauvais côté restent sur le terrain et peuvent gêner, protéger ou servir d'obstacle, mais elles ne comptent pas dans le score normal.

### Interface spécifique

Avant la mène, afficher :

- **Bleu choisit gauche** ;
- **Bleu choisit droite** ;
- **Rouge choisit gauche** ;
- **Rouge choisit droite**.

Chaque équipe doit choisir un côté.

L'application affiche ensuite un rappel visible :

> Seules les boules situées du bon côté de la frontière peuvent marquer.

### Tags techniques invisibles

```json
["setup", "scoring-constraint", "specific-ui", "auto-arbitrage"]
```

---

## Casino

Avant la mène, chaque équipe mise autant de points qu'elle le souhaite parmi les points déjà accumulés.

Une équipe ne peut pas miser plus de points qu'elle n'en possède.

Une équipe peut miser 0.

À la fin de la mène, il n'y a pas de score normal à ajouter.

L'application demande uniquement quelle équipe a gagné la mène :

- **Bleu gagne** ;
- **Rouge gagne**.

Résolution :

- l'équipe perdante perd définitivement sa mise ;
- l'équipe gagnante récupère sa mise et gagne le même montant en bonus.

Exemple :

```txt
Avant la mène :
Bleu a 8 points.
Rouge a 4 points.

Mises :
Bleu mise 3.
Rouge mise 4.

Résultat :
Rouge gagne.

Bleu perd 3 points.
Rouge récupère ses 4 points et gagne +4.

Nouveau score :
Bleu : 5
Rouge : 8
```

Cette règle peut créer de gros retournements de situation.

C'est volontaire.

### Condition d'apparition

Casino ne peut apparaître que si au moins une équipe possède au moins 1 point.

### Interface spécifique

Avant la mène :

- bouton **Mise bleue** ;
- bouton **Mise rouge** ;
- champ numérique pour chaque équipe ;
- la mise ne peut pas dépasser le score actuel de chaque équipe.

Pendant la résolution :

- pas de saisie de score normal ;
- seulement deux boutons :
  - **Bleu gagne** ;
  - **Rouge gagne**.

L'application applique automatiquement les gains et pertes.

### Tags techniques invisibles

```json
["specific", "bet", "specific-ui", "skip-normal-score", "not-available-at-zero"]
```

---

## Prédiction

Avant la mène, chaque équipe prédit de combien de points elle va gagner la mène.

Si le pari est réussi, l'équipe adverse perd ce nombre de points.

Il n'est pas possible d'aller en dessous de 0.

### Interface spécifique

Bouton pour chaque équipe :

- **Votre prédiction**

Cliquer sur ce bouton ouvre un champ numérique.

La prédiction doit être comprise entre 1 et 6.

Lorsque la mène est terminée, le score normal doit être renseigné.

Le moteur vérifie automatiquement si une des deux équipes a réussi sa prédiction et modifie les points en conséquence.

### Condition d'apparition

Cette règle ne peut jamais apparaître si au moins une équipe a 0 point.

### Tags techniques invisibles

```json
["specific", "bet", "specific-ui", "score-modifier", "not-available-at-zero"]
```

---

## Totem d'immunité

Cette mène est jouée normalement.

Mais dès que la règle **Totem d'immunité** est tirée, l'application tire immédiatement la règle de la prochaine mène et l'affiche.

Les équipes savent donc immédiatement quel sera l'enjeu de la mène suivante.

L'équipe qui perd la mène Totem gagne une immunité pour la prochaine règle.

À la prochaine mène :

- la règle affichée précédemment est jouée ;
- l'équipe immunisée n'est pas soumise à cette règle ;
- seule l'équipe gagnante de la mène Totem doit respecter la règle.

### Exemple

Mène 5 : l'app tire **Totem d'immunité**.

L'app affiche immédiatement :

> Prochaine règle révélée : Gauche caviar

La mène Totem est jouée normalement.

Bleu gagne la mène.

Rouge perd, donc Rouge gagne l'immunité.

Mène 6 : **Gauche caviar**.

Bleu doit jouer avec sa mauvaise main.

Rouge joue normalement.

### Condition d'apparition

La règle révélée par Totem doit posséder le tag technique invisible :

```json
"totem-compatible"
```

### Interface spécifique

Quand Totem est tiré :

- afficher la règle Totem ;
- afficher aussi la prochaine règle révélée ;
- afficher clairement :

> Le perdant de cette mène sera immunisé contre cette règle.

À la mène suivante :

- charger automatiquement la règle révélée ;
- afficher quelle équipe est immunisée ;
- afficher quelle équipe subit la contrainte.

### Tags techniques invisibles

```json
["specific", "future-rule", "specific-ui", "skip-random-draw-next-turn"]
```

---

# Règles techniques de score

## Points normaux

Dans une mène classique, une seule équipe peut marquer les points normaux.

Le flow doit rester rapide :

- l'utilisateur clique sur **Bleu marque** ou **Rouge marque** ;
- chaque clic ajoute 1 point normal à cette équipe ;
- dès qu'une équipe marque, l'autre bouton est désactivé ;
- le bouton **Annuler** retire le dernier point normal ajouté ;
- si tous les points normaux sont annulés, les deux équipes redeviennent sélectionnables.

---

## Bonus et malus

Les bonus/malus sont ajoutés pendant la mène ou pendant sa résolution via les interfaces spécifiques.

Chaque bonus/malus doit être stocké avec :

- l'équipe concernée ;
- la valeur ;
- la règle associée ;
- la raison.

Exemple :

```json
{
  "team": "blue",
  "value": -1,
  "rule": "Censure",
  "reason": "A parlé pendant la mène"
}
```

---

## Score minimum

Une équipe ne peut pas descendre sous 0 point.

Si un malus devrait faire passer une équipe sous 0, son score reste à 0.

---

## Règles qui sautent le score normal

Certaines règles remplacent complètement le score normal.

Exemples :

- Casino ;
- Sortie de porc si le cochonnet est sorti.

Dans ces cas, l'application ne doit pas afficher le flow classique de points normaux.

---

# Fin de partie

La partie se termine quand une équipe atteint ou dépasse le score cible.

Score cible par défaut : **13 points**.

L'application affiche alors :

- équipe gagnante ;
- score final ;
- nombre de mènes jouées ;
- règles jouées ;
- vétos utilisés ;
- détail des points normaux ;
- détail des bonus ;
- détail des malus ;
- règle la plus rentable ;
- règle la plus punitive.

---

# Ton éditorial

Le ton peut être drôle, direct et un peu absurde.

Exemples :

- “Dignité optionnelle.”
- “Débrouillez-vous.”
- “C'est le jeu ma pauvre Lucette.”
- “La mauvaise foi ne compte pas comme un vrai mot.”

Le ton ne doit jamais empêcher de comprendre la règle rapidement.
