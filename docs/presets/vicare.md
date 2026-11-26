# Viessmann Vitocal (ViCare)

Preset `vicare`. Back to the [README](../../README.md#supported-heat-pumps).

Confirmed on a Vitocal 250 (#186, #196) and on a Vitocal 200-S with combined storage and fresh-water station, heating and hot-water charging (#282). Other Vitocal models remain welcome test coverage.

## Setup

```yaml
type: custom:heatpump-flow-card
preset: vicare
hc_type: radiator
```
Entities are found through the entity registry (platform `vicare` + translation key), so entity ids and the HA language don't matter. If you have several Viessmann devices, pick one with `device:` (device id, or use the editor).

What you get:
- flow and return of the secondary circuit
- source temperature and flow rate
- DHW tank top and bottom, buffer
- compressor phase, with DHW recognised via "DHW charging" (or from the flow temperature, see below)
- compressor running and circulation pump
- COP heating and DHW, energy today, compressor starts
- from Home Assistant 2026.12, where the device reports it: the heat output and the heat for heating and hot water today (see Notes)
- details: compressor hours and starts, heater rod hours, compressor modulation, inlet/outlet temperatures and pressures, liquid line, subcooling and superheat

## Hot water without a charging signal

The compressor phase has no hot-water state, and some units, such as the Vitocal 250 (#186, #196), report no "DHW charging" either. Their phase can also stay on idle ("ready" or "pause") while the compressor runs. The preset therefore reads:

- **running:** a running compressor wins over an idle phase;
- **hot water:** while the heat pump runs and the flow temperature is above the tank temperature (`flow` above `dhw_top`). Heating keeps the flow below a charged tank, a charge heats it beyond.

Limits:

- At the start of a charge the flow first has to rise above the tank, so the first minutes still show heating.
- A tank that has cooled below the heating flow reads as hot water for that time, unless hot water is switched off: while the DHW operating mode is "off" (else while the water heater is), the rule does not apply, except during a one-time charge (#489). The preset maps them as `dhw_enabled` and `dhw_once`; an own entity for `dhw_enabled` counts as off only with the state `off`.

  Source (home-assistant/core, `homeassistant/components/vicare`, November 2026):

  | Key | Entity | Translation key | States |
  |---|---|---|---|
  | `dhw_enabled` | select | `dhw_operating_mode` (`select.py`) | `efficient`, `efficient_with_min_comfort`, `off` (API `off`); only units with this feature (E3, for example the Vitocal 250) have it |
  | `dhw_enabled` (else) | water_heater | `domestic_hot_water` (`water_heater.py`) | operation `on` / `off`; `off` also for the API modes `standby`, `heating` and `forcedReduced` |
  | `dhw_once` | binary_sensor | `one_time_charge` (`binary_sensor.py`, `getOneTimeCharge()`) | `on` while a one-time charge runs |

  Installation: Vitocal 250A of #489 (card 0.20.0, HA 2026.11): with hot water off the tank was at 30.6 °C and the heating flow at 33.3 °C, so the rule showed a charge. Where the water heater is also the tank temperature (`dhw_top`), the timeline reads its state for the switch and its `current_temperature` for the tank.

A mapped `valve` (for example your own template sensor) or a reported "DHW charging" entity replaces the rule. The diagnostic report says when the rule is in use. Confirmed on a Vitocal 250 by the reporter of #186: the compressor is on while heating and while charging hot water, and the flow rises above the tank during a charge.

## Circuit pump without a buffer

Without a buffer and with one heating circuit, the pump ViCare reports as the circuit pump (`circulation_pump`) is the indoor unit's own pump in front of the 3-way valve. It also runs while hot water charges. The card therefore draws it as the primary pump on the flow next to the heat pump: it turns for heating and for hot water, and the circuit has no pump of its own. During a charge the circuit stands still, as the valve closes the heating side (#344).

With a buffer, with several circuits or with your own `hc_pump` in the configuration, the pump stays in the circuit. `primary_pump: false` keeps it there as well.

## Notes

ViCare has no live electrical power, so add `power` from a meter if you have one.

Heat output: Home Assistant 2026.12 adds the heat production sensors ([core #192458](https://github.com/home-assistant/core/pull/192458), merged into dev on 14 Nov 2026): `heat_production_current` (kW, PyViCare `getHeatProductionCurrent`), `heat_production_heating_today` and `heat_production_dhw_today` (kWh, the current day of the heat production summary). The preset maps them as `heat` and as the tiles heat for heating and heat for hot water, today. ViCare creates them only where the device reports these values. Without them, on older Home Assistant versions or devices without the feature, the heat output is estimated from flow rate × spread. For a Vitocal with a ground source, set `source_type: brine`: the primary circuit supply and return become brine in and out. Circuits 2 and 3 share the same translation keys in ViCare, so map their entities manually (`hc2_flow`, …).
