# Wolf preset (CHA and other Wolf heat pumps with a compressor status)

One preset, `wolf`, serves two integrations:

- the core [Wolf SmartSet Service](https://www.home-assistant.io/integrations/wolflink/) integration (`wolflink`), read-only, built on [wolf-comm](https://github.com/janrothkegel/wolf-comm);
- the custom [Wolf SmartSet (read/write)](https://github.com/tibuntu/homeassistant-wolf-smartset) integration (`wolf_smartset`, HACS).

Both talk to the Wolf SmartSet cloud through the WOLF Link home gateway and both also serve gas and oil boilers, so the preset only detects a system that reports a compressor status (Verdichterstatus). `wolf_smartset` is checked first; when both integrations are installed, its entities are used. The integration README recommends disabling `wolflink` for the same account anyway, because two logins from one address make Wolf block the address.

The mapping comes from the integration sources, the wolf-comm heat pump example and the live states of the reference installation (see Evidence). Detection and drawing are confirmed on the reference installation with `wolf_smartset` (card 0.13.1, 2026-10-28), so the preset is marked `tested`. The `wolflink` branch comes from the same installation's entity registry and states and has not been run live.

## wolflink (core)

Entity ids are `sensor.<device slug>_<parameter name>` with the names in the language of the SmartSet account (English expected). The preset finds the device slug from `sensor.<slug>_compressor_status` and returns it as the prefix; the `device:` option limits the search to one device. List states are the slugs or texts the integration reports (`heizbetrieb`, `at_abschaltung`, `Abtaubetrieb`). Parameter names that repeat get `_2`, `_3` in no fixed order and are never used.

## wolf_smartset (custom)

Since release 0.3.0 (2026-10-26) the integration sets a fixed `translation_key` on curated entities ([ADR-Model-016](https://github.com/tibuntu/homeassistant-wolf-smartset/blob/main/docs/adr/ADR-Model-016-stable-translation-keys.md)). The preset finds entities through the entity registry (`platform: wolf_smartset`), so entity ids, device names and the Home Assistant language do not matter; the prefix is `''`. Leave the `device:` option unset: the entities sit on several Home Assistant devices (Heizgerät, Bedienmodul BM-2, Mischermodul MM1 and the system itself), and the option limits every lookup to one device, so it either loses the circuit keys or finds no compressor status at all. The keys follow the `wolflink` entity-id suffixes where the same value exists there. The source of truth is the [translation keys table in the integration README](https://github.com/tibuntu/homeassistant-wolf-smartset#translation-keys); the table below lists the keys the card uses.

| Card key | Platform | Translation key | Wolf parameter (German label) |
|---|---|---|---|
| `mode` | sensor | `operating_mode_heater` | Betriebsart Heizgerät |
| `status` | sensor | `compressor_status` | Verdichterstatus |
| `compressor` | sensor | `compressor_frequency` | Verdichterfrequenz |
| `compressor_speed` | sensor | `current_capacity_specification_compressor` | Aktuelle Leistungsvorgabe Verdichter |
| `power` | sensor | `power_consumption_wp_ehz` | Leistungsaufnahme (WP + EHZ) |
| `heat` | sensor | `current_secondary_power` | Aktuelle Sekundärleistung |
| `flow` | sensor | `boiler_water_temperature` | Kesseltemperatur |
| `return` | sensor | `return_temperature` | Rücklauftemperatur |
| `volume` | sensor | `hc_flow_rate` | Heizkreisdurchfluss |
| `outdoor` | sensor | `outside_temperature` | Außentemperatur (Heizung) |
| `valve` | sensor | `3_way_diverter_valve_htg_dhw` | 3-Wege-Umschaltventil HZ/WW |
| `heater` | sensor | `electric_booster_heater` | E-Heizung |
| `dhw_top` | sensor | `dhw_temperature` | Warmwassertemperatur |
| `dhw_target` | sensor, else number | `set_dhw_temperature_adjusted`, else `set_dhw_temperature` | Warmwassersolltemperatur (effective target), else Warmwassersolltemperatur eingestellt |
| `hc_flow` | sensor | `flow_temperature` | Vorlauftemperatur (Bedienmodul BM-2) |
| `hc_pump` | sensor | `mixer_circuit_pump`, else `mkp_mixer_circuit_pump` | Mischerkreispumpe, else Ausgang MKP |
| `hc_mode` | sensor | `mixer_circuit_status` | Mischerkreis Status |
| `hc_pressure` | sensor | `system_pressure` | Anlagendruck |
| `room` | sensor | `room_temperature` | Raumtemperatur |
| `room_target` | number | `day_temperature_mixer_circuit_1` | Tagtemperatur (Heizung) (Mischerkreis 1) |
| `program` | sensor | `mixer_circuit_demand` | Anforderung Mischerkreis |
| `hours` | sensor | `compressor_operating_hours` | Betriebsstunden Verdichter |
| `aux_hours` | sensor | `e_heating_operating_hours` | Betriebsstunden E-Heizung |

Tiles, the same as with `wolflink`: `heat` yesterday, month and year from `heat_generated_previous_day`, `heat_generated_current_month` and `heat_generated_current_year`; the `heat_heating`, `heat_dhw` and `heat_cooling` totals from `energy_amount_htg`, `energy_amount_dhw` and `clg_energy_amount`; the `hours` and `aux_hours` totals from the two hours counters.

Differences from the `wolflink` branch, following the integration source:

- `hc_pump`: `wolflink` uses `mkp_mixer_circuit_pump` (Ausgang MKP). In `wolf_smartset` that entity duplicates `mixer_circuit_pump` (Mischerkreispumpe) and starts disabled, so `mixer_circuit_pump` comes first and the MKP output is the fallback.
- `dhw_target`: the sensor `set_dhw_temperature_adjusted` ("Warmwassersolltemperatur", 27000800001) is the effective target: it follows the DHW status and drops to 10 °C (frost protection) while hot water is off. The number `set_dhw_temperature` ("Warmwassersolltemperatur eingestellt", 35000900000, 25 to 65 °C) holds the configured value around the clock and is the fallback when the sensor is missing. The integration binds these two keys the other way round from the `wolflink` suffixes; the `wolflink` branch is unchanged and keeps `set_dhw_temperature_adjusted` (48 °C in the reference export of PR 57).
- `room_target`: the number `day_temperature_mixer_circuit_1` instead of the `wolflink` sensor `day_temperature`.
- `program`: the sensor `mixer_circuit_demand` ("Anforderung Mischerkreis", 36000400001). `Automatik aus`, outside the heating time program, is night; `Automatik ein` shows nothing; `Partymodus`, `Urlaubsmodus` and `Sparbetrieb` match the card's default patterns (party, holiday, eco). The other options of the entity (Standby, Permanentbetrieb, Deaktiviert, Estrichtrocknung, Schornsteinfeger, the cooling variants) show nothing. `wolflink` keeps the holiday mode (`holiday_mode`: aktiviert, deaktiviert).
- `errors`: empty. The translation key table has no fault code, and the wolf-comm heat pump example description has no fault code parameter either (`Störung` is a state of the compressor status, not a parameter). `wolflink` keeps `sub_fault_code`. Configure `errors:` by hand if your installation has one.
- `room_temperature` starts disabled in `wolf_smartset` (no value without a room sensor at the control unit). Enable it there if you have one; the card then picks it up.

### State texts

`wolf_smartset` reports list states as Wolf delivers them, capitalised German texts (`Heizbetrieb`, `Warmwasser`, `Betrieb`, `Ein`, `Aus`); `wolflink` reports slugs for some of them (`heizbetrieb`, `ein`). The card's maps are case-insensitive, so one entry covers both for most states. Four mixer-circuit states contain a space that `wolflink` turns into an underscore (`AT Abschaltung` becomes `at_abschaltung`); the `hc_mode_map` lists both spellings. The compressor status labels for `Vorspülen` and `Nachspülen` exist for both spellings as well.

## Deliberately not mapped

The same gaps as with `wolflink`:

- Buffer: `header_temperature` (Sammlertemperatur) is the header of the heat pump, not a buffer tank sensor. If your system has a buffer on the header, add `entities: { buffer_top: <the header sensor> }` yourself (the demo does this).
- Electricity counters (`consumption_*`, `jaz_*`, `maz_*`, `taz_*`): they stay 0 without an S0 electricity meter (WP110) and start disabled in `wolf_smartset`, which would give empty COP tiles. `power_consumption_wp_ehz` is used as the live power only.
- `heating_circuit_pump` and `feed_heating_circuit_pump`: the heat generator's own pumps; the card draws the mixer circuit pump.
- `dhw_status`, `set_boiler_temperature`, `average_outside_temperature`, `3_way_diverter_valve_htg_clg`, `mixer_motor`, `mixer_flow_sensor_vf`: no matching card key.
- `set_dhw_temperature`, `day_temperature_heating`, `setpoint_correction`, `program_heating`, `program_dhw`, `time_program_heating`, `time_program_dhw`, `one_time_dhw_charge`: settings; add them to `controls` if you want them on the card.

## Evidence

- `wolf_smartset`: `custom_components/wolf_smartset/translation_keys.py` (the ParameterId to key table), `model.py` (`Parameter.translation_key`, the platform a parameter maps to), `entity.py` (keyed entities drop the name attribute), `sensor.py` (enum sensors return the Wolf display text), `translations/en.json` and `strings.json`, the README sections "Translation keys" and "Entities disabled by default", ADR-Model-016. Checked at release 0.3.0 and on `main` at commit e0b859a (2026-10-26, PR 10, which adds the two time program keys; none of the keys the card uses changed).
- `wolflink`: `homeassistant/components/wolflink/const.py` (the `STATES` slug table), see `upstream/wolf.json`.
- State texts: `parameters-examples/heatpumpparameter.json` of wolf-comm, the list items of Betriebsart Heizgerät (27005000001), Verdichterstatus (27005100001), Mischerkreis Status (36000500001), the diverter valve (27001300001) and the Ein/Aus outputs.
- Reference installation (Wolf CHA with BM-2, one mixer circuit and a buffer, `wolf_smartset` 0.5.0, Home Assistant 2026.10.4, card 0.13.0, heating time program 05:00 to 22:00, recorder history 2026-10-25 to 2026-10-27): the live states `Heizbetrieb`, `Standby`, `Heizen`, `Ein` and `Aus`, the units and the German entity ids (`sensor.heizgerat_*`, `sensor.bedienmodul_bm_2_0_*`, `sensor.zuhause_*` on the system device). The sensor `set_dhw_temperature_adjusted` followed the DHW status: 48 °C with `Ein`, `1x Warmwasser` and `Bereit, keine Ladung`, 10 °C with `Aus` outside the DHW window (frost protection), while the number `set_dhw_temperature` stayed at the configured 48 °C (47 °C after a manual change). The earlier reading of "10 °C against a 42 °C tank" was the same effect: the tank was still warm from its last charge. `mixer_circuit_demand` switched to `Automatik aus` at 22:02 and back to `Automatik ein` at 05:01, matching the time program, with `mixer_circuit_status` at `Eco` in between, while the select `program_heating` stayed at `Auto`; `Partymodus`, `Urlaubsmodus` and `Sparbetrieb` were not observed and come from the entity's option list. Every translation key the preset uses resolves to exactly one entity there; `room_temperature` reads `unknown` without a room sensor at the BM-2.
- Confirmation (2026-10-28): the same installation with card 0.13.1, `preset: wolf`, diagnostic report taken during a hot-water charge. `wolf_smartset` 0.5.0 is detected and every preset key resolves to its entity: mode and valve `Warmwasser`, compressor status `Betrieb` at 38 Hz, DHW target 48 °C from the effective target sensor, mixer circuit `Warmwasservorrang` with the pump `Aus`, program `Automatik ein` without a chip. Manual entities on top of the preset: the header sensor as `buffer_top` (as documented), an external electricity meter for `power`, `grid` and `energy_total`, a room sensor for `room` and a template sensor for `starts_today`.

## Known limits

- Confirmed on hardware with `wolf_smartset` only. The `wolflink` branch is built from the same installation's entity registry and seven days of states (PR 57), not from a live run with that integration.
- One mixer circuit. Neither the `wolflink` names nor the `wolf_smartset` keys carry a circuit number, so with `hc_count: 2` the second circuit stays empty instead of repeating circuit 1. The integration will add `_mixer_circuit_2` keys once an installation provides the IDs; the preset then needs a mapping for them.
- `device:` must stay unset for `wolf_smartset` (see above). With `wolflink`, whose entities share one device, it works as usual.
- `wolf_smartset` 0.3.0 or newer is required. With 0.2.1 or older the entities have no translation key and the preset does not detect the integration.
- The SmartSet cloud is polled every 120 s by default with `wolf_smartset` (`wolflink`: 60 s).
