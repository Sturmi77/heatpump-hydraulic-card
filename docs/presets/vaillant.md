# Vaillant, Saunier Duval, Bulex, Glow-worm, DemirDöküm (myPyllant)

Preset `vaillant`. Back to the [README](../../README.md#supported-heat-pumps).

Confirmed on a real Vaillant aroTHERM plus installation with the myPyllant integration (#1, #211). Installation-specific PV, battery, grid and external electricity-meter entities remain optional manual overrides.

## Setup

```yaml
type: custom:heatpump-flow-card
preset: vaillant
```
The home name prefix is detected from `sensor.<home>_energy_manager_state`. An entity id that ends in a number (`…_energy_manager_state_2`, which Home Assistant adds to an id that was already taken) is found as well; where both exist, the plain id wins. If the detection picks the wrong home or fails, set `prefix: <home>` (the part of the entity ids before the name of the entity).

What you get:
- the energy manager state (standby, heating, DHW, cooling) as the mode
- system flow temperature
- DHW tank and buffer
- circuit 0 flow, setpoint and state
- zone room temperature and target; without zone sensors the zone thermostat (`climate.<home>_zone_…`) serves as room temperature and target
- device power and heating efficiency
- system water pressure as heating pressure
- operating hours and on/off cycles of the heat pump (`<home> Device <n> <product> Operation Time`, `… On/Off Cycles`; the device that reports its power, else the first device that is not the hydraulic station) for the details and the hours and starts tiles
- the hydraulic station's operating hours and on/off cycles as the backup heater (aux hours and starts); on the installation that reported them they matched the heater (1.5 h against 4,165 h of the compressor)
- trouble codes

The Vaillant cloud API has no return temperature and no compressor state, and values update every few minutes. Use `index: {hc: 1, dhw: 1}` for a second circuit or DHW system.
