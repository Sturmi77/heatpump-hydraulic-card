# Lambda (lambda_heat_pumps)

Preset `lambda`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-flow-card
preset: lambda
```
That's it. The card finds your entities itself, including the 2nd heating stage as backup heater, total starts, energy and heat, and the refrigerant circuit values for the details drawer (`sensor.<prefix>_hp1_…` with legacy naming, or `sensor.hp1_…` with the new naming). If you have several heat pumps or the detection picks the wrong one, set the prefix explicitly (`prefix: eu08l`) or the unit numbers (`index: {hp: 2, hc: 2}`).

With the E-Manager enabled in the integration, the card also shows when it asks the heat pump to take up PV surplus (the E-Manager setpoint above 0): a "PV surplus" chip, hatched "Heating · PV surplus" periods in the timeline (`timeline: true`) and the tile `pv_boost_share`. See `pv_boost` under "Entity keys".

PV, battery and grid come from your Energy dashboard automatically, as long as it has power sensors configured (Settings → Dashboards → Energy). Power sensors may report W, kW or MW; Wh, kWh and MWh are energy counters and cannot provide a live flow. If you already have sensors for the heat pump's share of PV, battery and grid, or want a room average, add them yourself; own `pv` / `battery` / `grid` sensors replace the Energy dashboard:
```yaml
type: custom:heatpump-flow-card
preset: lambda
title: Heat pump
entities:
  room: sensor.living_room_temperature
  pv: sensor.heatpump_power_from_pv          # W
  battery: sensor.heatpump_power_from_battery
  grid: sensor.heatpump_power_from_grid
  energy_today: sensor.heatpump_energy_today # kWh
badges:
  - entity: input_boolean.heatpump_boost
    label: Boost
  - entity: binary_sensor.heat_pump_utility_lock
    label: Utility lock
```

Manual power-source sensors use positive values for power flowing **to the heat pump**:

| Key | Positive value means |
|---|---|
| `pv` | supplied by PV |
| `battery` | battery discharging into the house / heat pump |
| `grid` | imported from the grid |

If an inverter reports battery charging as positive, invert it with a template sensor before assigning it:

```yaml
template:
  - sensor:
      - name: Heat pump battery power
        unit_of_measurement: W
        device_class: power
        state_class: measurement
        state: "{{ states('sensor.inverter_battery_power') | float(0) * -1 }}"
```

For automatic detection, each configured Energy-dashboard source needs a current-power sensor (`stat_rate`) in W, kW or MW, not only a Wh, kWh or MWh counter. Several grid sources (for example two tariffs on one meter) are covered by one power sensor on any of them; several PV arrays or batteries need one each. The card and editor name sources that are missing one. If exactly one configured source has no usable live power, its displayed share is the remainder between heat-pump power and the known sources.

Only the sources the installation has are drawn: without a battery entity (manual) or a battery in the Energy dashboard, the schematic shows PV and grid only. A configured source whose sensor is unavailable stays visible, dimmed.
