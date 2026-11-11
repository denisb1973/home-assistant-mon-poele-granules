"""Estimation des granulés consommés grâce aux heures de fonctionnement électrique."""
from datetime import timedelta
import csv
import io
import hashlib
from pathlib import Path
from homeassistant.components.http import StaticPathConfig
import voluptuous as vol
from homeassistant.core import callback
from homeassistant.helpers.storage import Store
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.util import dt as dt_util
from .const import DOMAIN

PLATFORMS = ["sensor", "calendar"]

class PelletManager:
    def __init__(self, hass, entry):
        self.hass, self.entry = hass, entry
        self.store = Store(hass, 1, f"{DOMAIN}_{entry.entry_id}")
        self.data = {}
        self.listeners = []
        self.last_tick = None

    async def load(self):
        self.data = await self.store.async_load() or {
            "stock_kg": float(self.entry.data["initial_bags"]) * float(self.entry.data["bag_weight"]),
            "consumed_kg": 0.0, "runtime_h": 0.0, "by_day": {},
            "purchases": [], "maintenances": [], "adjustments": [], "calibration": None
        }
        self.last_tick = dt_util.utcnow()

    @property
    def power(self):
        state = self.hass.states.get(self.entry.data["power_entity"])
        try:
            return float(state.state)
        except (TypeError, ValueError, AttributeError):
            return None

    @property
    def energy(self):
        key = self.entry.data.get("energy_entity")
        state = self.hass.states.get(key) if key else None
        try:
            return float(state.state)
        except (TypeError, ValueError, AttributeError):
            return None

    @property
    def running(self):
        return self.power is not None and self.power > float(self.entry.data["threshold_w"])

    @property
    def rate(self):
        return float(self.data.get("kg_per_hour", self.entry.data["kg_per_hour"]))

    @property
    def bag_weight(self):
        return float(self.entry.data["bag_weight"])

    async def tick(self, now=None):
        current = dt_util.utcnow()
        seconds = max(0, min((current - self.last_tick).total_seconds(), 120)) if self.last_tick else 0
        self.last_tick = current
        if self.running and seconds:
            hours = seconds / 3600
            kg = hours * self.rate
            self.data["runtime_h"] += hours
            self.data["consumed_kg"] += kg
            self.data["stock_kg"] -= kg
            day = dt_util.as_local(current).date().isoformat()
            bucket = self.data["by_day"].setdefault(day, {"kg": 0.0, "hours": 0.0})
            bucket["kg"] += kg
            bucket["hours"] += hours
            self.store.async_delay_save(lambda: self.data, 10)
        self.notify()

    @callback
    def notify(self):
        for listener in list(self.listeners):
            listener()

    async def save(self):
        await self.store.async_save(self.data)
        self.notify()

    async def purchase(self, bags, total_eur, date, note):
        kg = bags * self.bag_weight
        self.data["stock_kg"] += kg
        self.data["purchases"].append({"date": date, "bags": bags, "kg": kg, "total_eur": total_eur, "note": note})
        await self.save()

    async def reconcile(self, actual_bags, date, note):
        actual = actual_bags * self.bag_weight
        delta = actual - self.data["stock_kg"]
        self.data["stock_kg"] = actual
        self.data["adjustments"].append({"date": date, "delta_kg": delta, "actual_kg": actual, "note": note})
        await self.save()

    async def maintenance(self, description, date, next_due, note):
        self.data["maintenances"].append({"date": date, "description": description, "next_due": next_due, "note": note})
        await self.save()

    async def import_legacy_csv(self, csv_text):
        """Import historical operations for display only; never change current stock."""
        rows = list(csv.DictReader(io.StringIO(csv_text.lstrip("\ufeff")), delimiter=";"))
        if not rows:
            raise ValueError("Le fichier CSV est vide")
        expected = {"Saison", "Date", "Type", "Quantite", "Prix par sac", "Prix total", "Note"}
        if not expected.issubset(set(rows[0])):
            raise ValueError("Format CSV incompatible avec l'export Suivi Stock Pellet")
        records = []
        for row in rows:
            date = (row.get("Date") or "").strip()
            event = (row.get("Type") or "").strip()
            if not date or not event:
                continue
            from datetime import date as date_type
            date_type.fromisoformat(date)
            def value(key):
                raw = (row.get(key) or "").strip().replace(",", ".")
                return float(raw) if raw else None
            qty, unit, total = value("Quantite"), value("Prix par sac"), value("Prix total")
            records.append({"date": date, "season": (row.get("Saison") or "").strip(),
                "type": event, "bags": qty, "unit_price": unit,
                "total_eur": total, "note": (row.get("Note") or "").strip()})
        # Replace an import snapshot rather than appending: reimporting is idempotent.
        self.data["legacy_history"] = records
        self.data["legacy_source_hash"] = hashlib.sha256(csv_text.encode("utf-8")).hexdigest()
        await self.save()
        return len(records)

    async def start_calibration(self):
        self.data["calibration"] = {
            "start_runtime": self.data["runtime_h"], "start_energy": self.energy,
            "start_date": dt_util.as_local(dt_util.utcnow()).date().isoformat()
        }
        await self.save()

    async def end_calibration(self, consumed_bags):
        calibration = self.data.get("calibration")
        if not calibration:
            raise ValueError("Démarrer la calibration avant de la terminer")
        runtime = self.data["runtime_h"] - calibration["start_runtime"]
        if runtime <= 0:
            raise ValueError("Aucune heure mesurée pendant la calibration")
        actual_kg = consumed_bags * self.bag_weight
        correction = actual_kg - runtime * self.rate
        self.data["consumed_kg"] += correction
        self.data["stock_kg"] -= correction
        self.data["kg_per_hour"] = actual_kg / runtime
        self.data["last_calibration"] = {
            **calibration, "end_date": dt_util.as_local(dt_util.utcnow()).date().isoformat(),
            "consumed_bags": consumed_bags, "actual_kg": actual_kg,
            "runtime_h": runtime, "new_rate": self.data["kg_per_hour"],
            "electric_delta": None if calibration["start_energy"] is None or self.energy is None else self.energy - calibration["start_energy"]
        }
        self.data["calibration"] = None
        self.data["adjustments"].append({"date": self.data["last_calibration"]["end_date"],
            "delta_kg": -correction, "note": "Correction après calibration"})
        await self.save()

async def async_setup_entry(hass, entry):
    if not hass.data.get('_mon_poele_granules_card_registered'):
        www_path = Path(__file__).parent / 'www'
        card_path = www_path / 'mon-poele-card.js'
        static_paths = [StaticPathConfig('/mon_poele_granules/mon-poele-card.js', str(card_path), False)]
        gif_path = www_path / 'poele-granules-anime.gif'
        if gif_path.is_file():
            static_paths.append(StaticPathConfig('/mon_poele_granules/poele-granules-anime.gif', str(gif_path), False))
        flame_path = www_path / 'flamme_reelle_transparente.webp'
        if flame_path.is_file():
            static_paths.append(StaticPathConfig('/mon_poele_granules/flamme_reelle_transparente.webp', str(flame_path), False))
        await hass.http.async_register_static_paths(static_paths)
        hass.data['_mon_poele_granules_card_registered'] = True
    manager = PelletManager(hass, entry)
    await manager.load()
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = manager
    unsub = async_track_time_interval(hass, manager.tick, timedelta(seconds=30))
    entry.async_on_unload(unsub)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    if not hass.services.has_service(DOMAIN, "ajouter_achat"):
        def current_date():
            return dt_util.as_local(dt_util.utcnow()).date().isoformat()
        def get_manager():
            return next(iter(hass.data[DOMAIN].values()))
        async def add_purchase(call):
            await get_manager().purchase(float(call.data["sacs"]), float(call.data["montant_eur"]), call.data.get("date", current_date()), call.data.get("note", ""))
        async def adjust(call):
            await get_manager().reconcile(float(call.data["sacs_reels"]), call.data.get("date", current_date()), call.data.get("note", "Inventaire"))
        async def maintain(call):
            await get_manager().maintenance(call.data["entretien"], call.data.get("date", current_date()), call.data.get("prochaine_date", ""), call.data.get("note", ""))
        async def import_history(call):
            await get_manager().import_legacy_csv(call.data["csv_text"])
        async def calib_start(call):
            await get_manager().start_calibration()
        async def calib_end(call):
            await get_manager().end_calibration(float(call.data["sacs_consommes"]))
        nonnegative = vol.All(vol.Coerce(float), vol.Range(min=0))
        hass.services.async_register(DOMAIN, "ajouter_achat", add_purchase, schema=vol.Schema({vol.Required("sacs"): nonnegative, vol.Required("montant_eur"): nonnegative, vol.Optional("date"): str, vol.Optional("note"): str}))
        hass.services.async_register(DOMAIN, "corriger_stock", adjust, schema=vol.Schema({vol.Required("sacs_reels"): nonnegative, vol.Optional("date"): str, vol.Optional("note"): str}))
        hass.services.async_register(DOMAIN, "ajouter_entretien", maintain, schema=vol.Schema({vol.Required("entretien"): str, vol.Optional("date"): str, vol.Optional("prochaine_date"): str, vol.Optional("note"): str}))
        hass.services.async_register(DOMAIN, "importer_historique", import_history, schema=vol.Schema({vol.Required("csv_text"): str}))
        hass.services.async_register(DOMAIN, "demarrer_calibration", calib_start)
        hass.services.async_register(DOMAIN, "terminer_calibration", calib_end, schema=vol.Schema({vol.Required("sacs_consommes"): vol.All(vol.Coerce(float), vol.Range(min=0.01))}))
    return True

async def async_unload_entry(hass, entry):
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        manager = hass.data[DOMAIN].pop(entry.entry_id, None)
        if manager:
            await manager.save()
        if not hass.data[DOMAIN]:
            for action in ("ajouter_achat", "corriger_stock", "ajouter_entretien", "demarrer_calibration", "terminer_calibration", "importer_historique"):
                hass.services.async_remove(DOMAIN, action)
    return ok
