import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import selector
from .const import DOMAIN, DEFAULT_BAG_WEIGHT, DEFAULT_THRESHOLD, DEFAULT_KG_PER_HOUR

class PelletConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            await self.async_set_unique_id("main")
            self._abort_if_unique_id_configured()
            return self.async_create_entry(title="Mon Poêle à Granulés", data=user_input)
        return self.async_show_form(step_id="user", data_schema=vol.Schema({
            vol.Required("power_entity"): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Optional("energy_entity"): selector.EntitySelector(selector.EntitySelectorConfig(domain="sensor")),
            vol.Required("bag_weight", default=DEFAULT_BAG_WEIGHT): vol.All(vol.Coerce(float), vol.Range(min=0.1)),
            vol.Required("initial_bags", default=0): vol.All(vol.Coerce(float), vol.Range(min=0)),
            vol.Required("threshold_w", default=DEFAULT_THRESHOLD): vol.All(vol.Coerce(float), vol.Range(min=0)),
            vol.Required("kg_per_hour", default=DEFAULT_KG_PER_HOUR): vol.All(vol.Coerce(float), vol.Range(min=0.01)),
        }))
