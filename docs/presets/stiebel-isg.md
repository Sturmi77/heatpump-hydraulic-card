# Stiebel Eltron ISG preset (WPM 3, WPM 3i, WPMsystem, LWZ; Tecalor)

Source: the [Stiebel Eltron ISG integration](https://github.com/pail23/stiebel_eltron_isg_component) (HACS, domain `stiebel_eltron_isg`, MIT), release 2026.9, which talks Modbus TCP to the Internet Service Gateway. The preset is **not tested on an installation**: it is derived from the integration source (`const.py`, `sensor.py`, `binary_sensor.py`, `select.py`, `number.py`, `strings.json`) and from the entity list in [#69](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/69). The core Home Assistant integration `stiebel_eltron` (a climate entity only) is not covered.

The integration sets the translation key of every entity to its key (`flow_temperature_wp1`, `compressor_on` …), so the preset finds entities through the entity registry (platform `stiebel_eltron_isg`). Entity ids and the Home Assistant language do not matter: a French Home Assistant calls the heat pump flow `sensor.stiebel_eltron_wpmsystem_temperature_de_depart_pac1`, and the preset finds it all the same.

## How the card gets its state

The integration has no status sensor: the select `operation_mode` is the heating program the user chose (emergency, ready, program, comfort, eco, water heating), not what the heat pump does. The preset therefore maps no `mode` entity and the card derives the mode from three flags of the operating status: the compressor, the defrost flag and the hot water flag. A running compressor means heating, with the hot water flag hot water, with the defrost flag defrost. **Cooling is not shown.**

## Optional hardware reads unavailable

The integration creates the sensors of the whole controller family, also for hardware that is not installed (buffer, solar collector, heat source, circuits 2 and 3 …). They read `unavailable` instead of being left out. A mapped entity would draw the part, so the preset maps these only where they report a number: buffer, solar collector, heat source temperature and pressure, refrigerant circuit, compressor speed, circuits 2 and 3. While every sensor is unavailable (Modbus connection down, Home Assistant just started) the preset reports "not ready" and the card retries every 30 seconds, so the layout does not settle without the buffer.

## Mapped

- `compressor`: binary sensor `compressor_on` (operating status), else `heat_pump_1_on`. `defrost`: `evaporator_defrost`. `valve`: `is_heating_water`, the hot water flag of the operating status.
- `flow` / `return`: heat pump 1 (`flow_temperature_wp1` / `return_temperature_wp1`), else the heat pump of the single-pump controllers (`flow_temperature_wp`), else the system flow (`flow_temperature`, `return_temperature`; the only pair on the LWZ). `volume`: `volume_stream_wp1`, else `volume_stream` (l/min; the card converts). With it the card computes the heat output from flow rate and spread, as the integration has no heat output sensor.
- `power`: `current_power_consumption` (kW, the inverter power). **Only the WPMsystem reports it**; the other controllers have no electrical power sensor, so there is no live COP there. Map your own meter with `entities: power:` if you have one.
- `outdoor`: `outdoor_temperature`. `source_in` / `brine_pressure`: `source_temperature` / `source_pressure`, brine heat pumps only. The editor stub then proposes `source_type: brine`.
- `dhw_top` / `dhw_target`: `actual_temperature_water` / `target_temperature_water`. `circulation`: binary sensor `circulation_pump` (WPMsystem and LWZ R290 only).
- `buffer_top`: `actual_temperature_buffer`. `solar_collector`: `solar_collector_temperature`.
- `heater`: the electric reheating (NHZ): `nhz_stages_running`, else `emergency_heating_1_2`, `emergency_heating_1`, `electric_reheating`. `aux_hours`: `nhz_1_2_runtime`, else `electrical_booster_heating`.
- Heating circuits 1 to 3: `hc_flow` from `actual_temperature_hkN`, `hc_setpoint` from `target_temperature_hkN`, `hc_pump` from `heating_circuit_N_pump` (WPM) or `pump_on_hkN` (WPM 3i, LWZ). Circuits 2 and 3 count when `actual_temperature_hkN` reports a number. `room` / `room_target` of circuit 1: `actual_room_temperature_hk1` / `target_room_temperature_hk1`, else the sensors of the FEK and FE7 room units; circuits 2 and 3 show their own room values. `hc_pressure`: `heater_pressure`.
- `program`: the select `operation_mode`. Eco shows the eco chip; the other modes have no chip.
- `errors`: the binary sensor `error_status` (fault flag). The sensor `active_error` shows "error N" as text and is not used.
- Refrigerant circuit: `hot_gas_temperature_wp1` and the pressures `high_pressure_wp1`, `low_pressure_wp1` (else the single-pump variants), `compressor_speed` (LWZ, Hz; the animation takes 100 Hz as full speed). `starts_total`: `compressor_starts` (LWZ).
- Quick controls: the select `operation_mode` and the number `comfort_water_temperature_target`.
- Details: runtimes (`compressor_heating`, `compressor_heating_water`, `compressor_heating_hp_1`, `cooling_runtime`, `nhz_1_runtime`, `nhz_2_runtime`, `electrical_booster_heating`, `electrical_booster_heating_water`, `solar_runtime`), the window efficiencies (`efficiency_*_1_12_m`) and `sg_ready_state`, each where it reports.
- Tiles (totals, the periods come from long-term statistics): electricity per use `consumed_heating`, `consumed_water_heating`; heat per use `produced_heating`, `produced_water_heating`, `produced_cooling_total`; `compressor_starts`; booster hours. The combined sensors (day and total) come first because the plain `*_total` sensors count whole kWh only: at midnight the controller moves whole kWh into the total register and keeps the remainder in the day register, which the combined sensor adds back.

## Deliberately not mapped

- `mode`: see above; the select is the program.
- Cooling: `is_cooling`, `cooling_mode` and `produced_cooling_total` exist, but one mode entity cannot combine them with the flags used for heating. Cooling runs show as heating.
- `compressor_heating` and `compressor_heating_water` are separate counters (heating and hot water); the card has one `hours` entity, so both stay in the details.
- Total electricity and total heat as one counter: the integration has them per use only, so `COP total` and the yearly COP tile are not offered; the per-use COP tiles (`cop_heating`, `cop_dhw`) work.
- The ventilation values of the LWZ, the humidity and dew point sensors, the cooling circuits and the 24 h and 12-month windows: no matching card key. They can be added to `details`.
- Circuits 4 and 5 (the integration disables them by default) and the second and further heat pumps of a cascade.
- `hc_curve_offset`: the heating curve numbers of the integration are the curve rise (slope), not a shift.

## Open questions for a real installation

- Is the hot water flag (`is_heating_water`) on exactly while the diverter valve points to the tank? A WPM run for the buffer after a hot water run would show hot water for too long if it stays on.
- Which flow temperature belongs to the heat pump on a WPMsystem with one heat pump: `flow_temperature_wp1` or the system flow `flow_temperature`? The preset takes the first one that reports.
- Do the optional sensors really read `unavailable` where the hardware is missing, or a fixed value? The integration marks entities unavailable for the controller's "no value" marker; a buffer or solar collector that reads a number without a sensor would be drawn.
- Is `source_temperature` the heat source inlet on brine heat pumps? The card shows it as the source inlet.
- LWZ: do `pump_on_hk1` and the room values of the circuit match the circuit drawing?

## Evidence

- Report in [#69](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/69): a WPMsystem (entity prefix `stiebel_eltron_wpmsystem`) in a French Home Assistant, card 0.11.0, preset not detected. The entity ids in it are the French names of the integration (its `translations/fr.json`): "Température de départ PAC1" is `flow_temperature_wp1`, "Température de retour PAC1" `return_temperature_wp1`, "Débit volumique PAC1" `volume_stream_wp1`, "Compresseur" `compressor_on`, "Dégivrage évaporateur" `evaporator_defrost`, "Pompe circuit chauffage 1" `heating_circuit_1_pump`, "Température actuelle tampon" `actual_temperature_buffer`, "Température cible CC 1" `target_temperature_hk1`, "Chaleur produite chauffage" `produced_heating` and so on. The reporter mapped heat pump 1 flow, return and flow rate by hand; the preset takes the same sensors. The reporter's mapping also used the heat quantity counter as `heat`, which the preset does not, because a counter is not a power.
- Integration source: the files listed above, release 2026.9; the comments there document the register scaling (inverter power 0.1 kW verified against the ISG display on a WPMsystem) and the day-and-total behaviour of the energy registers.
