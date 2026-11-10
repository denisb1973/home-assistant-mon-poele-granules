from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.core import callback
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.util import dt as dt_util
from .const import DOMAIN

SENSORS = {
    "stock_kg": ("Stock granulés", "kg", "mdi:weight-kilogram"),
    "stock_sacs": ("Stock sacs", None, "mdi:package-variant"),
    "consommation_totale": ("Granulés consommés total", "kg", "mdi:fire"),
    "consommation_jour": ("Granulés aujourd'hui", "kg", "mdi:fire"),
    "consommation_mois": ("Granulés ce mois", "kg", "mdi:chart-bar"),
    "consommation_heure": ("Débit granulés estimé", "kg/h", "mdi:speedometer"),
    "heures_totales": ("Heures fonctionnement total", "h", "mdi:timer"),
    "heures_jour": ("Heures fonctionnement aujourd'hui", "h", "mdi:clock-outline"),
    "puissance": ("Puissance électrique poêle", "W", "mdi:flash"),
    "energie": ("Index électrique poêle", "kWh", "mdi:lightning-bolt"),
    "en_marche": ("Poêle en marche", None, "mdi:power"),
    "achats_total": ("Achats granulés", "€", "mdi:currency-eur"),
    "sacs_achetes": ("Sacs achetés", None, "mdi:cart"),
    "entretien_prochain": ("Prochain entretien", None, "mdi:calendar-clock"),
}

async def async_setup_entry(hass, entry, async_add_entities):
    manager = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([PelletSensor(manager, key, *spec) for key, spec in SENSORS.items()])

class PelletSensor(SensorEntity):
    _attr_has_entity_name = True
    _attr_should_poll = False
    def __init__(self, manager, key, label, unit, icon):
        self.manager, self.key = manager, key
        self._attr_name = label
        self._attr_unique_id = f"{manager.entry.entry_id}_{key}"
        self._attr_icon = icon
        self._attr_native_unit_of_measurement = unit
        self._attr_device_info = DeviceInfo(identifiers={(DOMAIN, manager.entry.entry_id)}, name="Mon Poêle à Granulés", manufacturer="Personnalisé")
        if key in {"consommation_totale", "heures_totales", "achats_total"}:
            self._attr_state_class = SensorStateClass.TOTAL
        elif key in {"stock_kg", "consommation_jour", "consommation_mois", "consommation_heure", "heures_jour", "puissance"}:
            self._attr_state_class = SensorStateClass.MEASUREMENT

    async def async_added_to_hass(self):
        @callback
        def update():
            self.async_write_ha_state()
        self.manager.listeners.append(update)
        self.async_on_remove(lambda: self.manager.listeners.remove(update) if update in self.manager.listeners else None)

    @property
    def native_value(self):
        d, m = self.manager.data, self.manager
        today = dt_util.as_local(dt_util.utcnow()).date().isoformat()
        days = d.get("by_day", {})
        month = today[:7]
        values = {
            "stock_kg": d["stock_kg"],
            "stock_sacs": d["stock_kg"] / m.bag_weight,
            "consommation_totale": d["consumed_kg"],
            "consommation_jour": days.get(today, {}).get("kg", 0),
            "consommation_mois": sum(v.get("kg", 0) for k, v in days.items() if k.startswith(month)),
            "consommation_heure": m.rate,
            "heures_totales": d["runtime_h"],
            "heures_jour": days.get(today, {}).get("hours", 0),
            "puissance": m.power,
            "energie": m.energy,
            "en_marche": "Oui" if m.running else "Non" if m.power is not None else "Indisponible",
            "achats_total": sum(x["total_eur"] for x in d["purchases"]),
            "sacs_achetes": sum(x["bags"] for x in d["purchases"]),
            "entretien_prochain": min((x["next_due"] for x in d["maintenances"] if x.get("next_due") and x["next_due"] >= today), default="Aucun"),
        }
        value = values[self.key]
        return round(value, 3) if isinstance(value, float) else value

    @property
    def extra_state_attributes(self):
        d = self.manager.data
        if self.key == "consommation_totale":
            return {"historique_jour": d.get("by_day", {}), "derniere_calibration": d.get("last_calibration"), "historique_importe": d.get("legacy_history", [])}
        if self.key == "stock_kg":
            return {"achats_recents": d["purchases"][-10:], "ajustements_recents": d["adjustments"][-10:]}
        if self.key == "entretien_prochain":
            return {"entretiens_recents": d["maintenances"][-10:]}
        return None
