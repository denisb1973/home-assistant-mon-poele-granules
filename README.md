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

## Tableau de bord personnalisé — version 0.2.1
La carte `mon-poele-granules-card` (compatible iPhone et PC) affiche le stock en sacs/kg, la consommation du jour/mois et sur sept jours, les heures de fonctionnement, les achats et l'entretien.

Après la mise à jour HACS et le redémarrage Home Assistant :

1. Ouvrir un tableau de bord puis **Modifier le tableau de bord**.
2. Dans **⋮ → Gérer les ressources** (parfois Paramètres → Tableaux de bord → Ressources), ajouter le module JavaScript suivant :
   - URL : `/mon_poele_granules/mon-poele-card.js?v=021`
   - Type : **Module JavaScript**.
3. Créer une nouvelle carte **Manuelle** et saisir :

```yaml
type: custom:mon-poele-granules-card
```

Si les valeurs restent absentes en raison de noms d'entités différents, fournir les ID exacts :

```yaml
type: custom:mon-poele-granules-card
entities:
  stock: sensor.mon_poele_a_granules_stock_granules
  sacs: sensor.mon_poele_a_granules_stock_sacs
  today: sensor.mon_poele_a_granules_granules_aujourd_hui
  month: sensor.mon_poele_a_granules_granules_ce_mois
  total: sensor.mon_poele_a_granules_granules_consommes_total
  hours: sensor.mon_poele_a_granules_heures_fonctionnement_total
  hoursToday: sensor.mon_poele_a_granules_heures_fonctionnement_aujourd_hui
  rate: sensor.mon_poele_a_granules_debit_granules_estime
  power: sensor.mon_poele_a_granules_puissance_electrique_poele
  energy: sensor.mon_poele_a_granules_index_electrique_poele
  running: sensor.mon_poele_a_granules_poele_en_marche
  spent: sensor.mon_poele_a_granules_achats_granules
  next: sensor.mon_poele_a_granules_prochain_entretien
```

Ces ID sont des exemples : ils doivent être adaptés aux vrais ID visibles dans **Outils de développement → États**.

La carte utilise les actions de l'intégration pour les formulaires d'achat, correction du stock, entretien et calibration. Elle affiche l'historique récemment stocké dans les attributs des capteurs.

**Version 0.2.1 expérimentale** : installation du tableau de bord à valider dans Home Assistant. Aucune modification des données existantes du poêle n'est effectuée par l'ajout de la carte.

## Types d'intervention
Le formulaire **+ Entretien** offre trois choix : Entretien, Dépannage et Révision. Chaque intervention garde ses dates et sa description. Les anciennes interventions restent inchangées.
