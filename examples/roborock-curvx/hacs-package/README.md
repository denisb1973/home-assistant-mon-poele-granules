# Roborock Qrevo CurvX — Carte Home Assistant

Carte Lovelace **personnalisée** avec onglets Accueil, Carte, Historique, Station, Entretien et Réglages.

## État
Version de développement **0.1.0**. Non testée dans l'interface Home Assistant de l'utilisateur. Le code est indépendant du composant poêle à granulés.

## Structure pour un futur dépôt HACS
Ce dossier doit devenir la **racine** d'un dépôt GitHub dédié (par exemple `denisb1973/roborock-curvx-card`) ; HACS ne peut **pas** installer ce sous-dossier directement depuis le dépôt du poêle. Les fichiers attendus sont :
- `hacs.json`
- `dist/roborock-curvx-card.js`
- `README.md`

Les versions GitHub sont facultatives pour les cartes de tableau de bord ; GitHub Actions n'est pas nécessaire.

## Utilisation après installation de la ressource

Dans une carte **Manuelle** :

```yaml
type: custom:roborock-curvx-card
background: /local/roborock/roborock_salon.png
```

Le fond `roborock_salon.png` doit être placé dans `/config/www/roborock/`, séparément. Il n'est pas encore inclus au dépôt car les opérations GitHub actuellement disponibles ne permettent d'y déposer que du texte.

L'identifiant du robot est `vacuum.salle_a_manger_roborock_qrevo_curvx` ; la carte utilise la carte `image.salle_a_manger_roborock_qrevo_curvx_map_0`. Il est possible de les remplacer :

```yaml
type: custom:roborock-curvx-card
vacuum: vacuum.salle_a_manger_roborock_qrevo_curvx
map: image.salle_a_manger_roborock_qrevo_curvx_map_0
background: /local/roborock/roborock_salon.png
```

## Limitations
- Les identifiants d'autres capteurs/commandes proviennent des noms supposés d'après les captures, à vérifier dans Home Assistant.
- La carte reprend l'image fournie par Roborock, mais ne permet pas encore de choisir une pièce en touchant l'image.
- La mise à jour de la position du robot dépend de l'intégration Roborock.
- Les boutons actionnent réellement le robot et sa station.
- Aucune installation ou synchronisation sur Home Assistant n'est déclenchée par un commit GitHub seul.
