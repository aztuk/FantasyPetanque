# Cadrage UI regles specifiques

Ce document cadre les refontes des interfaces de regles dediees. Les maquettes Figma ne sont pas encore referencees dans le repo ; chaque ligne reste donc a associer a une maquette ou un node Figma avant implementation.

## Regles avec UI dediee

| Regle | `uiType` | Composant actuel | Phase | Tache roadmap | Maquette Figma |
|---|---|---|---|---|---|
| Gauche caviar | `bonus-buttons` | `BonusButtonsUI` | Pendant la mene | UI specifique regles bonus/malus simples | https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=14-1140&t=qil4nd06wX0YCs6f-11 et https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=14-1188&t=qil4nd06wX0YCs6f-11|
| Les extremes | `bonus-buttons` | `BonusButtonsUI` | Pendant la mene | UI specifique regles bonus/malus simples | https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1299&t=qil4nd06wX0YCs6f-11 et https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1340&t=qil4nd06wX0YCs6f-11 |
| Censure | `malus-buttons` | `MalusButtonsUI` | Pendant la mene | UI specifique regles bonus/malus simples | https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1385&t=qil4nd06wX0YCs6f-11 et https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1427&t=qil4nd06wX0YCs6f-11 |
| La boule maudite | `malus-buttons` | `MalusButtonsUI` | Pendant la mene | UI specifique regles bonus/malus simples | https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1468&t=qil4nd06wX0YCs6f-11 et https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=15-1509&t=qil4nd06wX0YCs6f-11 |
| King of the Hill | `bonus-buttons` | `BonusButtonsUI` | Pendant la mene | UI specifique regles bonus/malus simples | A fournir |
| Sortie de porc | `cochonnet-sorti` | `SortieDePorc` | Pendant la mene, peut sauter le score normal | UI specifique regle Sortie de porc | A fournir |
| Contrat | `contrat` | `ContratSetupUI`, `ContratResolutionUI` | Setup avant mene + pendant la mene | UI specifique regle Contrat | A fournir |
| Assurance vie | `assurance-vie` | `AssuranceVieSetupUI`, `AssuranceVieReminderUI` | Setup avant mene + rappel pendant la mene | UI specifique regle Assurance vie | A fournir |
| Frontiere | `frontiere` | `FrontiereSetupUI`, `FrontiereReminderUI` | Setup avant mene + rappel pendant la mene | UI specifique regle Frontiere | A fournir |
| Casino | `casino` | `CasinoSetupUI` (stepper TeamStepper) + `CasinoResolutionUI` | Setup avant mene + resolution gagnant, pas de score normal | UI specifique regle Casino | Setup : https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=16-1569&t=qil4nd06wX0YCs6f-11 / Ingame : https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=17-1625&t=qil4nd06wX0YCs6f-11 |
| Prediction | `prediction` | `PredictionSetupUI` (stepper TeamStepper) + `PredictionUI` (readonly) | Setup avant mene + lecture seule pendant la mene | UI specifique regle Prediction | Setup : https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=17-1676 / Ingame : https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=18-1701 |
| Totem d'immunite | `totem` | `TotemUI` | Pendant la mene + revelation regle suivante | UI specifique regle Totem d'immunite | A fournir |
| L'impair contre-attaque | `impair` | `ImpairUI` | Aide au scoring automatique | UI specifique regle L'impair contre-attaque | A fournir |

## Regles a ne pas traiter comme UI dediee

Ces regles ont une contrainte ou un rappel, mais pas de controle dedie obligatoire dans la spec actuelle. Elles restent portees par `RuleDisplay`, sauf nouvelle maquette explicite.

| Regle | Raison |
|---|---|
| Dome de fer | Auto-arbitrage, aucun bouton specifique. |
| Apollo boule | Contrainte de geste, aucun bouton specifique. |
| Drunk simulator | Contrainte de geste, aucun bouton specifique. |
| Footanque | Contrainte de geste, aucun bouton specifique. |
| Dos Santos | Contrainte de geste, aucun bouton specifique. |
| Perte d'aura | Contrainte de geste, aucun bouton specifique. |
| Make Petanque Great Again | Rappel de scoring constraint, pas de controle obligatoire. |
| Deuxieme service | Rappel de scoring constraint, pas de controle obligatoire. |
| Ctrl + Z | Auto-arbitrage, aucun bouton specifique. |
| Permis de construire | Setup dans la spec, mais aucune UI specifique obligatoire. |
| Le duel | Setup dans la spec, mais aucune UI specifique obligatoire. |

## Surfaces partagees a surveiller

- `app/src/features/game/components/rule-uis/shared.tsx` : conteneur commun des blocs de regle. Une refonte ici impacte toutes les UI specifiques.
- Composants de saisie / lecture seule des mises : Input https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=17-1611&t=qil4nd06wX0YCs6f-11 / Readonly https://www.figma.com/design/nfmjDHM2oIiYwHujG8vxOS/FantasyPetanque?node-id=18-1775&t=qil4nd06wX0YCs6f-11
- `app/src/shared/components/TeamButton.tsx` : bouton equipe utilise par bonus, malus, Sortie de porc, Contrat et Assurance vie.
- `app/src/features/game/components/RuleUI.tsx` : routage entre `uiType` et composant dedie.
- `app/src/features/game/screens/GameScreen/RuleSetupView.tsx` : layout des choix avant mene pour Contrat, Assurance vie et Frontiere.
- `app/src/features/game/screens/GameScreen/PlayingView.tsx` : layout pendant la mene, scoring normal et bouton de fin de mene.
- `app/src/features/game/state/gameStore.ts` et `app/src/domain/game/engine/roundResolver.ts` : a toucher seulement si une maquette change le flow ou les conditions de validation, pas pour une refonte visuelle pure.

## Decoupage valide

Le decoupage actuel de `ROADMAP.md` est coherent :

1. Bonus/malus simples ensemble, car ils partagent les memes composants et les memes interactions add/remove.
2. Une tache separee pour chaque regle qui a un flow ou un etat dedie.
3. `L'impair contre-attaque` reste separee malgre une UI simple, car son affichage explique une resolution automatique sensible.

Casino et Prediction sont les plus susceptibles de depasser une refonte visuelle : leurs maquettes peuvent impliquer le flow de mise, de prediction ou de resolution. Les autres taches devraient pouvoir rester majoritairement UI si les maquettes ne changent pas les interactions.
