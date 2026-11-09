# Mon Poêle à Granulés — Home Assistant

Intégration personnalisée pour suivre le stock de granulés **en kg et en sacs**, la consommation estimée selon le temps de marche détecté via le capteur électrique, les achats et les entretiens.

## Installation via HACS
1. HACS → menu ⋮ → Dépôts personnalisés.
2. Ajouter `https://github.com/denisb1973/home-assistant-mon-poele-granules` avec la catégorie **Intégration**.
3. Installer **Mon Poêle à Granulés** dans HACS.
4. Redémarrer Home Assistant.
5. Paramètres → Appareils et services → Ajouter une intégration → **Mon Poêle à Granulés**.
6. Choisir les capteurs de puissance et d'énergie, poids d'un sac (15 kg par défaut), stock initial et débit estimé.

## Fonctionnement
La puissance supérieure au seuil réglé indique que le poêle est en marche. À chaque cycle (30 s), les heures sont comptées et les kg estimés à l'aide d'un débit **kg/h**. L'électricité ne permet pas à elle seule de mesurer la quantité de granulés. Une calibration sur un nombre connu de sacs consommés améliore le débit.

## Actions
- `mon_poele_granules.ajouter_achat` : sacs, montant_eur, date, note.
- `mon_poele_granules.corriger_stock` : sacs_reels, date, note (inventaire sans double comptage).
- `mon_poele_granules.ajouter_entretien` : entretien, date, prochaine_date, note.
- `mon_poele_granules.demarrer_calibration`.
- `mon_poele_granules.terminer_calibration` : sacs_consommes.

Un calendrier affiche achats, entretiens effectués et prochaines échéances.

**Version 0.1.1 expérimentale** : pas encore testée en situation réelle sur ton Home Assistant. L'interface native HA fournit les capteurs, les actions et le calendrier ; une carte graphique dédiée reste à développer.
