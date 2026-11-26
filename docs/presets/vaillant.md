# Vaillant, Saunier Duval, Bulex, Glow-worm, DemirDöküm (myPyllant)

Preset `vaillant`. Back to the [README](../../README.md#supported-heat-pumps).

Confirmed on a real Vaillant aroTHERM plus installation with the myPyllant integration (#1, #211). Installation-specific PV, battery, grid and external electricity-meter entities remain optional manual overrides.

With several heating circuits, myPyllant zones are matched through the circuit number in their entity id (`zone_1_circuit_0_…`, `zone_2_circuit_1_…`) ([#223](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/223)). Set `hc_count` to the number of circuits; each zone's actual and target room temperature then appears in its own row of the house overview.

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
- device power and heating efficiency: the value of the system (`<home>_heating_energy_efficiency`), else that of the heat pump; the hydraulic station (1.0) and a gas boiler of a hybrid are not taken (#502)
- an installation with two prefixes in one home (home-level entities under the account, circuits, zones and devices under the home name, seen after re-adding the integration, #502): with a single home the card also finds the entities under the other prefix; with several homes it keeps to the selected one
- system water pressure as heating pressure
- operating hours and on/off cycles of the heat pump (`<home> Device <n> <product> Operation Time`, `… On/Off Cycles`; the device that reports its power, else the device with the highest heating efficiency) for the details and the hours and starts tiles
- the hydraulic station's operating hours and on/off cycles as the backup heater (aux hours and starts); on the installation that reported them they matched the heater (1.5 h against 4,165 h of the compressor)
- trouble codes

The Vaillant cloud API has no return temperature and no compressor state, and values update every few minutes. Use `index: {hc: 1, dhw: 1}` for a second circuit or DHW system.
