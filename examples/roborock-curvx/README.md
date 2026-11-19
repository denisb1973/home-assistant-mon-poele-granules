# Dashboard indépendant — Roborock Qrevo CurvX

Ce dossier est un **exemple Lovelace distinct de l'intégration du poêle à granulés**. Il ne modifie ni les données ni l'intégration du poêle.

## Éléments fournis
- `dashboard.yaml` : six vues (Accueil, Carte, Historique, Station, Entretien, Réglages) et liens de navigation.
- Le fond photographique `roborock_salon.png` doit être ajouté séparément : l'API GitHub de cette connexion n'autorise pas l'envoi d'une image binaire.

## Installation dans Home Assistant

1. Placer `roborock_salon.png` dans `/config/www/roborock/`. Le fichier doit être servi à `/local/roborock/roborock_salon.png`.
2. Dans **Paramètres > Tableaux de bord**, créer un tableau de bord neuf dont le chemin est **roborock-curvx**.
3. Ouvrir **Modifier > Éditeur de configuration brute** de ce nouveau tableau de bord, puis y coller **tout** le contenu de `dashboard.yaml` (ce n'est pas le YAML d'une carte manuelle).
4. Enregistrer et contrôler les vues. Tester les commandes de lavage/vidage uniquement lorsque la station est prête.

### Points de vigilance
- Le dépôt GitHub **n'est pas synchronisé automatiquement** à la configuration locale de Home Assistant. Il sert à versionner et télécharger le YAML.
- Le fond est une illustration, pas une photo de l'habitation.
- La carte `image.salle_a_manger_roborock_qrevo_curvx_map_0` affiche la carte existante ; son rafraîchissement pendant le mouvement doit encore être testé.
- La sélection tactile des pièces dans l'image n'est **pas** implémentée.
- Les noms des entités sont basés sur les captures de l'installation ; si une entité se signale indisponible, vérifier son ID exact dans les outils de développement.
- Les menus de ce tableau de bord sont créés par des boutons Lovelace natifs, sans dépendance HACS supplémentaire.
- Cette configuration est une première version à tester sur l'iPad ; elle ne reproduit pas encore parfaitement tous les effets graphiques de la maquette.

Ne pas copier ce fichier dans `custom_components/mon_poele_granules` : ce n'est pas un composant Python.
