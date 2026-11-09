from datetime import date, timedelta
from homeassistant.components.calendar import CalendarEntity, CalendarEvent
from homeassistant.util import dt as dt_util
from homeassistant.core import callback
from .const import DOMAIN

async def async_setup_entry(hass, entry, async_add_entities):
    manager = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([PelletCalendar(manager)])

class PelletCalendar(CalendarEntity):
    _attr_has_entity_name = True
    _attr_name = "Achats et entretiens"
    _attr_icon = "mdi:calendar-check"
    _attr_should_poll = False
    def __init__(self, manager):
        self.manager = manager
        self._attr_unique_id = f"{manager.entry.entry_id}_calendar"

    async def async_added_to_hass(self):
        @callback
        def notify():
            self.async_write_ha_state()
        self.manager.listeners.append(notify)
        self.async_on_remove(lambda: self.manager.listeners.remove(notify) if notify in self.manager.listeners else None)

    def events(self):
        result = []
        for x in self.manager.data["purchases"]:
            try:
                d = date.fromisoformat(x["date"])
                result.append(CalendarEvent(start=d, end=d + timedelta(days=1), summary=f"Achat {x['bags']:g} sacs ({x['kg']:g} kg)", description=f"{x['total_eur']:.2f} € — {x.get('note', '')}"))
            except (ValueError, TypeError):
                continue
        for x in self.manager.data["maintenances"]:
            try:
                d = date.fromisoformat(x["date"])
                result.append(CalendarEvent(start=d, end=d + timedelta(days=1), summary=f"Entretien : {x['description']}", description=x.get("note", "")))
                if x.get("next_due"):
                    due = date.fromisoformat(x["next_due"])
                    result.append(CalendarEvent(start=due, end=due + timedelta(days=1), summary=f"Entretien prévu : {x['description']}"))
            except (ValueError, TypeError):
                continue
        return sorted(result, key=lambda x: x.start)

    @property
    def event(self):
        today = dt_util.as_local(dt_util.utcnow()).date()
        return next((event for event in self.events() if event.end > today), None)

    async def async_get_events(self, hass, start_date, end_date):
        begin, end = start_date.date(), end_date.date()
        return [x for x in self.events() if x.start < end and x.end > begin]
