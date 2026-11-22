# Luxtronik preset (Alpha Innotec, Novelan, Roth, Siemens, Elco, Buderus, Nibe, Wolf)

Source: the [Luxtronik integration](https://github.com/BenPru/luxtronik) (HACS, domain `luxtronik2`, MIT), version 2026.10.18. It is built on [Bouni/luxtronik](https://github.com/Bouni/luxtronik), which can run side by side. The preset is confirmed on one real water-to-water installation with a combined storage and fresh-water station ([#75](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/75), #208). Reports from air units (including the Hybrox drawing) and brine installations are still welcome.

The integration sets the translation key of every entity to its `SensorKey` value, so the preset finds entities through the entity registry (platform `luxtronik2`). Entity ids (`sensor.luxtronik2_flow_in_temperature` with the default prefix) and the Home Assistant language do not matter.

## Setup

```yaml
type: custom:heatpump-flow-card
preset: luxtronik
source_type: brine   # air (default), brine or water
```
For heat pumps with a Luxtronik controller and the [Luxtronik](https://github.com/BenPru/luxtronik) integration (HACS, platform `luxtronik2`). The integration names these manufacturers as users of the controller:

- Alpha Innotec
- Novelan
- Roth
- Siemens
- Elco
- Buderus
- Nibe
- Wolf Heiztechnik

The controller sits in air, brine and water heat pumps alike. For air units the card draws the Alpha Innotec Hybrox; the other brands share the controller but not the casing, so set `unit_style: generic` (or another style) if the drawing does not match your unit. Brine and water units get the ground or water loop with `source_type: brine` or `water`.
 Entities are found through the entity registry (platform + translation key), so entity ids and the HA language don't matter. The controller does not tell the heat source, so set `source_type` for brine and water heat pumps.

What you get:
- the operating status (heating, hot water, defrost, cooling, grid lock, idle) as the mode, the compressor as running
- flow (Vorlauf) and return (Rücklauf), heating flow rate, outdoor temperature, heat source in and out
- electrical power and heat output, giving a live COP: enable "Current power consumption" and "Current heat output" in the integration, both are disabled by default. Not every controller reports them: on an Alpha Innotec WWC 100 H/X the heat output stays 0 and the power value does not exist ([#75](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/75)). In that case use your own electricity meter and drop the heat sensor, so that the card estimates the heat output from flow rate and spread (needs a flow rate from the controller):
  ```yaml
  entities:
    power: sensor.my_heat_pump_power
    heat: none
  ```
- hot water temperature and target, solar collector and pump where installed, the additional heat generator as the backup heater
- mixing circuits 1 to 3 as heating circuits (`hc_count`), only where they report a flow and a target; room unit temperature and target; the heating mode (party, holidays) as the program chip
- refrigerant circuit in the details: hot gas, suction gas, superheat, high and low pressure; on inverters the compressor speed (Hz on brine inverters, rpm on air inverters)
- on air inverters the fan speed, so the fan stands still when the controller reports 0
- tiles from the kWh counters per use (heating, hot water, cooling), the heat amount, compressor hours and impulses, each as a total with the periods from long-term statistics

Not mapped: the last error (it stays after a reset), the circulation pump (the integration names it ambiguously), the buffer and multifunction storage (not exposed). Add them with `entities` if you want them.

## Mapped

- `mode`: `status` (values `heating`, `hot_water`, `swimming_pool_solar`, `evu`, `defrost`, `heating_external_source`, `cooling`, `no_request`). Pool and external heat source count as heating, `evu` (grid lock) as blocked, `no_request` as idle.
- `compressor`: `compressor` (output VD1).
- `flow` / `return`: `flow_in_temperature` (TVL, Vorlauf) / `flow_out_temperature` (TRL, Rücklauf). "In" and "out" are seen from the heating system.
- `volume`: `heat_amount_flow_rate` (l/h). With it the card computes the heat output from flow rate and spread when `heat` is missing.
- `power` / `heat`: `current_power_consumption` / `current_heat_output`. **Both are disabled in the integration by default.** The power value is a calculation without a documented name in the controller (`Unknown_Calculation_268`); compare it with a meter before trusting the COP. **Not every controller fills them:** on an Alpha Innotec WWC 100 H/X the heat output reads 0 all the time and the power value is not available ([#75](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/75)). The card takes a mapped heat entity at its word, so a 0 stays 0. For such a controller set `power` to an electricity meter of your own and remove the heat entity with `heat: none`; the card then estimates the heat output from `volume` and the flow/return spread, if the controller reports a flow rate:

  ```yaml
  entities:
    power: sensor.my_heat_pump_power
    heat: none
  ```
- `outdoor`: `outdoor_temperature`. `source_in` / `source_out` / `source_volume`: `heat_source_input_temperature` / `heat_source_output_temperature` / `heat_source_flow_rate`.
- `dhw_top`: `dhw_temperature`. `dhw_target`: the number `dhw_target_temperature`.
- `heater`: binary sensor `additional_heat_generator`. `aux_hours`: `additional_heat_generator_operation_hours`.
- `solar_collector` / `solar_pump`: `solar_collector_temperature` / `solar_pump`, present only where the controller reports solar.
- `program`: the select `heating_mode` (`Automatic`, `Off`, `Second heatsource`, `Party`, `Holidays`); Party and Holidays show their chip.
- Heating circuit 1 to 3: the mixing circuits, `flow_in_circuitN_temperature` as `hc_flow` and `flow_in_circuitN_target_temperature` as `hc_setpoint`. A mixing circuit that is not installed still has both sensors, so a circuit counts only when the flow is a number and the target is 10 °C or more. Without a mixing circuit the card draws the heat pump flow as the circuit flow (direct circuit). `hc_pump` (circuit 1): `circulation_pump_heating`. `room` / `room_target` (circuit 1): `room_thermostat_temperature` and its target.
- Details: `compressor1_operation_hours` (else `operation_hours`), `compressor1_impulses`, `heat_amount_counter` as `heat_total`, refrigerant circuit (`hot_gas_temperature`, `suction_compressor_temperature`, `overheating_temperature`, `high_pressure`, `low_pressure`).
- `compressor_speed`: `pump_frequency`, else `compressor_speed`. Both read calculation 231 `ID_WEB_Freq_VD` (VD = Verdichter, compressor), the compressor speed. The integration renamed `pump_frequency` to "Compressor frequency" after release 2026.11.01 ([BenPru/luxtronik 44a3c21](https://github.com/BenPru/luxtronik/commit/44a3c21b5b375600551f8ee6f84aa361c0db01a5), upstream #863). Up to 2026.11.01 the entity is disabled by default; enabled on an air-source inverter, it reads rpm under a Hz unit, so the details show rpm and the compressor turns at full speed. From release 2026.11.18 the integration splits the register by the heat source medium (parameter 975, 2 = air) on inverters (calculation 238, the maximum frequency, above 0): `pump_frequency` in Hz on the other inverters, the new `compressor_speed` in rpm on air inverters ([d1f98ed](https://github.com/BenPru/luxtronik/commit/d1f98ed58df42ea6375146e78b3abfb65567d587); `sensor_entities_predefined.py` at 2026.11.18, gates `P0975_HEAT_SOURCE_MEDIUM != 2` and `== 2`). An installation has one of the two; the card reads rpm against 6000 rpm as full speed unless `compressor_speed_max` is set. Fixed-speed units have neither; the animation then runs at full speed while the compressor is on.
- `fan_speed`: `fan_speed`, calculation 184 (C0184) in rpm, the heat-source fan of air inverters ([8bbca99](https://github.com/BenPru/luxtronik/commit/8bbca99f4cc915926bfb5517b16fbca7069cb130), release 2026.11.18). It reads 0 on brine and fixed-speed units, which have no such entity. In 2026.11.18 the sensor starts disabled; enable "Fan speed" in the integration. On the LD9V family the register holds the fan's 2-10 V control signal in 0.1 V (59 running, 5 at rest), so with 2026.11.18 the fan keeps turning at rest there; after that release the integration moves the LD9V to its own sensor `fan_control_signal` and enables `fan_speed` by default on the confirmed rpm models ([caeb3f2](https://github.com/BenPru/luxtronik/commit/caeb3f2042c6887addbaaf7c4628cf3fd6374fde), [b4337a5](https://github.com/BenPru/luxtronik/commit/b4337a50e4b792ad06c7ed45a7129767ee4bc298)). `fan_control_signal` is not mapped: a control voltage never reads 0, so the fan would never stop. Without a fan entity the fan turns while the compressor runs.
- Tiles (total counters, periods from long-term statistics): electricity per use `heat_energy_input`, `dhw_energy_input`, `cooling_energy_input`, `additional_heat_generator_energy`; heat `heat_amount_counter`, `heat_amount_heating`, `dhw_heat_amount`, `cooling_heat_amount`; compressor hours and impulses. The per-use counters exist on newer firmware only.

## Deliberately not mapped

- `errors`: `error_reason` holds the last error in the controller's memory. It stays after a reset, so it would show the error chip forever. `disturbance_output` is the fault output, which can also be configured as the second heat generator.
- `circulation`: the integration names the outputs BUP/ZIP `dhw_recirculation_pump`, `dhw_circulation_pump` and `dhw_charging_pump` (the last two share one register); which of them is the circulation pump depends on the installation.
- `valve`: no entity reports the diverter valve; hot water comes from the status.
- Buffer and multifunction storage (MFS): the integration exposes no buffer sensors except the solar buffer.
- `source_type`: the controller does not tell the heat source. Set `source_type: brine` or `water` for ground and water heat pumps.
- Circuits 4 to 6: the controller has three mixing circuits.

## Open questions for a real installation

- Do `flow_in_circuit1_temperature` and its target read sensible values on a system with only a direct circuit, or are they unavailable? (Rule above assumes a plain number and a target of 10 °C or more.)
- Is `current_power_consumption` the electrical input of the heat pump, and does `current_heat_output` match the heat meter?
- How is the multifunction storage connected (buffer for heating only, or also hot water)?
- Does the controller report a flow rate (`heat_amount_flow_rate`) while it runs? Without one the heat output cannot be estimated when `current_heat_output` stays 0.
