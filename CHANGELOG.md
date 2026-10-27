# Changelog

## Unreleased

## 0.13.1 – 2026-10-27
- Heating circuit 1 is drawn when there is a buffer, even without an entity of the circuit itself (`hc_flow`, `hc_mode`, `hc_pump`), as it was without a buffer. It hangs on the buffer, takes the colour of its pipes from the buffer temperature and runs while the heat pump heats. Before, `hc_count: 1` showed no circuit and no radiators until a circuit entity was mapped, while `hc_count: 2` drew both (#118).
- Vaillant (myPyllant): the preset is found when the entity ids end in a number (`sensor.home_energy_manager_state_2`, as Home Assistant adds it to an id that was already taken). Before, the home was not detected and every entity of the preset showed as "not found". The plain id wins over the numbered one, and the same tolerance applies to all entities of the preset (#120).
- Vaillant (myPyllant): without zone sensors the zone thermostat (`climate.<home>_zone_…`) serves as room temperature and target; zone sensors still win (#120).
- Wolf (`wolf_smartset`): the DHW target comes from the sensor `set_dhw_temperature_adjusted`, the effective target that drops to 10 °C while hot water is off; the number `set_dhw_temperature` is the fallback. Before, the card showed the configured value while hot water was off.
- Wolf (`wolf_smartset`): the heating program chip comes from the mixer circuit demand (`mixer_circuit_demand`): "Automatik aus" shows night, party, holiday and Sparbetrieb (eco) are recognised. Confirmed on the reference installation for "Automatik ein" and "Automatik aus".

## 0.13.0 – 2026-10-27
- New preset `stiebel_isg` for Stiebel Eltron and Tecalor heat pumps with an ISG (WPM 3, WPM 3i, WPMsystem, LWZ) through the [Stiebel Eltron ISG](https://github.com/pail23/stiebel_eltron_isg_component) integration (HACS, `stiebel_eltron_isg`), requested in #69. Entities are found through translation keys, so entity ids and the Home Assistant language do not matter. The mode comes from the compressor, defrost and hot water flags (the integration has no status sensor); flow and return of heat pump 1, flow rate, hot water, buffer, heating circuits 1 to 3, inverter power (WPMsystem), refrigerant circuit, quick controls, the fault flag and heat and electricity counters per use as tiles. Hardware that is not installed reads unavailable in the integration and is left out. Built from the integration source and marked untested; cooling is not shown. See `docs/presets/stiebel-isg.md`.
- New preset `bosch_buderus_heating` for Bosch and Buderus heat pumps in the Home Comfort app (Bosch/Buderus Home Comfort integration, PointT cloud), using stable registry identities for measurements, statistics and details. The default controls are limited to the selected heating and DHW circuit modes and one-time DHW charge; further controls are opt-in. The card and editor share registry loading and check only the integration's registered states during updates. A mapping guide, synthetic regression checks and an upstream manifest. The automatic preset still needs its own installation test.
- Wolf: the `wolf` preset also serves the custom `wolf_smartset` integration (Wolf SmartSet read/write, HACS). Its entities are found through the entity registry by translation key, so entity ids, device names and the Home Assistant language do not matter; it wins when both integrations are installed. Needs `wolf_smartset` 0.3.0 or newer. With `hc_count: 2` the preset no longer repeats circuit 1 as circuit 2. Details in `docs/presets/wolf.md`.
- New option `primary_pump` (also in the editor, default from the preset): draws the heat pump's own primary pump on the flow pipe next to the heat pump block, centred under the flow temperature and over the flow rate. It turns while the flow rate is above 0, else with the heating or hot-water loop. A single direct circuit without a `hc_pump` sensor then shows no pump of its own. The HeishaMon preset turns it on, because the Aquarea primary pump sits in the outdoor unit (monobloc) or the hydro module (split) and also runs for hot water.
- Samsung and Kronoterm: the presets turn on `primary_pump`, so the primary pump of the heat pump (Samsung: the water pump 0x4089, which also runs for hot water; Kronoterm: the main circulation pump, register 2038) is drawn on the flow pipe next to the heat pump block instead of as a pump of the heating circuit. A single direct circuit without a pump signal (Samsung) then has no pump of its own; the Kronoterm loop pumps stay in their circuits. `primary_pump: false` brings the old drawing back.
- New entity key `fan_speed` (rpm or binary): the fan of the unit drawing turns while it is above 0 (or on), and faster at a higher speed. Without it the fan follows the running state as before. The HeishaMon preset maps `fan1_motor_speed`, so the fan also turns while it runs on after the compressor stops. An `unavailable` or `unknown` fan entity counts as missing, so the fan then follows the running state.
- New option `series_buffer` (default `false`, also in the editor): draws a series buffer in the return of the heating circuits with a 3-way bypass valve (A: bypass from the flow, B: circuit return, AB: buffer). Normally the circuit return runs through the buffer. While the new entity `bypass_valve` is on, or without it while the heat pump defrosts, the flow runs straight into the buffer and the circuits stand still, so the heat pump defrosts from the buffer water. The buffer needs no sensors; a parallel buffer with its own sensors (`buffer_top`, `buffer_mode`) wins. New text keys `series_tank` and `bypass`.
- Series buffer without a bypass valve: set `series_bypass: false` (default `true`, in the editor only with `series_buffer`). The card then draws no valve, the circuit return always runs through the buffer and the circuits keep running in defrost. Without this option and without `bypass_valve`, the valve follows the defrost signal and stops the circuits while the heat pump defrosts.
- Flow animation: the dash speed is proportional to the flow rate (1000 l/h = one dash cycle per second), so the water visibly speeds up and slows down with the pump. Before, 600 and 1200 l/h looked almost the same.
- Sniffing: the heat waves above the emitter stop, because the circulating water brings no heat to the circuit (only without a buffer).
- Heating curve shift: new entity keys `hc_curve_offset` (and `hc2_curve_offset` to `hc6_curve_offset`), read only. With a shift, the label above the circuit pump shows the target with its parts, for example "Target 36 °C (curve 34 °C + 2 K shift)": the target already contains the shift, so the curve is target − shift. The label ends at the pump; where it does not fit, the word for the shift and then the brackets are left out. The flow temperature moves below the pump, the flow rate below it. A shift is a difference, so °C shows as K. Without the key the label stays as before. The HeishaMon preset maps `number.<prefix>_main_z1_heat_request_temp` (`z2_` for circuit 2) when the heating mode is "compensation curve"; in direct mode that number is the flow target itself and is left out. New text keys `curve_offset` and `curve_shift`.
- Heating curve shift: the flow temperature under the circuit comes only from the circuit's own flow sensor (`hc_flow`). Without one the heat pump's flow stands only at the VL label and is not shown twice.
- Heating curve shift: with a shift of 0 the label shows only the target ("Target 34 °C"), without "(curve 34 °C + 0 K shift)".
- New entity key `pv_boost` for a PV surplus mode (a binary entity that is on, or a power above 0), requested in #108. The card shows a "PV surplus" chip, the timeline turns the heating periods in which the mode was active into their own kind "Heating · PV surplus", and the new tile `pv_boost_share` shows the share of the heating time in PV surplus mode for today, yesterday and the week from the recorder history. The Lambda preset maps the E-Manager setpoint `emgr_power_consumption_setpoint` (W, register 104), so Lambda installations with the E-Manager get it without configuration. Other systems set `entities: pv_boost`. Only the time in which the PV entity has a known state counts for the share: without a PV history, or with only `unavailable` states, the tile shows a dash instead of 0 %.
- New option `valve_map` (raw state of the `valve` entity → `dhw` or `heating`) for a diverter or zone valve that does not follow "on = hot water", requested in #109. Example for a valve that reports 1 for heating and 0 for hot water: `valve_map: { 0: dhw, 1: heating }`. States outside the map keep the default reading, and the map applies to the timeline that is drawn from the compressor and the valve as well. The keys match a state in any case (`Tank: heating` also matches `tank`).
- New tile `dhw_loss`: standby loss of the hot-water tank in K/h over the last 48 hours from the recorder history. Only verified standby windows of at least 3 hours count; hot-water operation, the DHW heater rod, the solar pump, unknown states, draw-off and heating the card cannot explain are excluded with 30 minutes to settle. Unknown or missing compressor and valve states and a draw-off in the first 30 minutes of the history count as not verified. Needs a plain tank sensor at the top (not a thermostat entity) and an operating mode or compressor entity. The tile shows a temperature rate, not an energy (#32); an energy balance from heat meters is tracked in #114.
- Power sources: a source the installation does not have is no longer drawn. Without a battery (no battery entity in `power_sources: manual`, or none in the Energy dashboard) only PV and grid appear; a configured source that is unavailable stays dimmed as before (#102).
- Energy dashboard: several grid sources (for example two tariffs on one meter) count as configured when at least one of them has a power sensor, so the grid is no longer reported as missing and the PV / grid split stays live. The same power sensor behind several sources counts once. Several PV arrays or batteries still need a power sensor each (#103).
- Built-in languages beyond English and German can be contributed: a language is one entry in `HFC_LANGUAGES` plus a block in `HFC_I18N` and `HFC_EDITOR`, may be partial (missing texts fall back to English) and is selected from the Home Assistant language. The language list of the editor is built from them, and the visual editor follows a built-in language, too. `npm run i18n:check` verifies the blocks and lists missing texts. Guide in `docs/TRANSLATING.md`, issue template "Translation".
- Editor: a regional language block (`pt-br`) is used when Home Assistant runs in that locale, then its language (`pt`), then English; before, the locale was cut to two letters.
- `npm run i18n:check` rejects a group where English has text, an empty group included, instead of reporting "i18n OK" for a translation that would show `[object Object]`.
- Stiebel ISG and Luxtronik presets: parts that are mapped by their readings (buffer, solar, circuits, counters) and report only after the card has started are found within a minute, without reloading the card. A sensor that drops out for a moment does not remove a mapping.
- Radiators and column radiators: the ribs show the flow and return colours again instead of black. The card defined the gradient `g-rad` twice (once for the whole card, once for circuit 1); the ribs used the second one, which never got a colour. Only the circuit's own gradient is left.
- Kronoterm: preset documentation in `docs/presets/kronoterm.md`. With the Cloud API the heating pressure is the measured pressure only with Kronoterm 1.7.3 or newer; 1.7.2 and older report the setting of the low-pressure alarm (register 2325, 0.8 bar on the reference installation) under the same sensor. The card needs no change; it finds the sensor by its translation key.
- Luxtronik preset documentation: some controllers (reported on an Alpha Innotec WWC 100 H/X) leave `current_heat_output` at 0 and have no `current_power_consumption`. The README and `docs/presets/luxtronik.md` now describe the workaround with an own power meter and `heat: none` (#75). The question about the compressor hours counter is answered: `operation_hours` equals `compressor1_operation_hours` on a single-compressor unit.

## 0.12.0 – 2026-10-26
- New preset `luxtronik` for heat pumps with a Luxtronik controller (Alpha Innotec, Novelan, Roth, Siemens, Elco, Buderus, Nibe, Wolf) through the [Luxtronik](https://github.com/BenPru/luxtronik) integration (HACS, `luxtronik2`), requested in #75. Entities are found through translation keys. Status, flow and return, heat flow rate, power and heat output (disabled in the integration by default), hot water with target, solar, heating mode (party, holidays), mixing circuits 1 to 3 where installed, refrigerant circuit and kWh counters per use as tiles. Built from the integration source and marked untested until an installation confirms it; set `source_type` for brine and water heat pumps. See `docs/presets/luxtronik.md`.
- New preset `samsung` for Samsung EHS heat pumps (Mono, Split, TDM) with Beormund's ESPHome component esphome-samsung-nasa. Based on its message mapping; entity names from its example.yaml and README plus a tested installation (EHS Mono AE050JXYDEH). Detected by the 3-way valve together with the error code.
- New preset `ebusd` for Vaillant aroTHERM / aroTHERM plus (HMU) via ebusd with Home Assistant MQTT discovery (#24): outdoor unit, VWZ hydraulic station and sensoCOMFORT / multiMATIC controller. Operating states come from the `RunDataStatuscode` values of ebusd-configuration; entity ids with and without a leading device name are found. The mapping is taken from the entity list of a real installation (two circuits, aroTHERM plus cascade); the buffer stays a manual mapping because its sensor depends on the hydraulic scheme. New demo setup and self-test checks.
- Kronoterm preset (`preset: kronoterm`) for the [Kronoterm integration](https://github.com/Favio25/Kronoterm-homeassistant), Cloud API or Modbus. Entities are found through the entity registry (platform `kronoterm` + translation key), so entity ids and the language do not matter; the Cloud and Modbus names of the circuit and tank values are both candidates. Mode from the working function, HP load as compressor and modulation, defrost status, the hot water circulator as the valve, electrical power and heat output for the live COP, the hot water tank from the tank sensor (Modbus) or the DHW thermostat (Cloud), loops 1 to 4 with pumps, flow and the room thermostat, heating pressure, error/warning with `error_ok`, the ECO mode as program chip, and tiles for electricity today, COP total (SCOP) and compressor starts. Confirmed with the Cloud API on a Hydro S 2 + ADAPT 0312; the Modbus names come from the integration's register map. Left out on purpose: the heat counter `heating_energy_heating_dhw` (a tenth of the heat that the SCOP implies on the reference installation), the reservoir (no tank sensor) and compressor hours (per heating and DHW only). Demo installation and self-tests.
- New preset `wolf` for Wolf heat pumps (CHA) through the core `wolflink` integration, marked untested. Built from the entity states of one CHA-07/10 installation with English parameter names and checked against the `wolflink` and `wolf-comm` sources: detection by the compressor status, which Wolf gas and oil boilers do not report; mode, compressor, power and heat in kW, flow rate in L/min, diverter valve, DHW, mixer circuit, room, holiday mode, pressure, sub fault code and heat-only tiles. The header sensor, the electricity counters (0 without an energy meter) and parameters with repeated names (`_2`, `_3`) are deliberately not mapped. The card now treats `ein` as on for pumps, heaters, badges and timeline marks. Also in the live demo.
- Added an Open3E preset for Viessmann Vitocal heat pumps, using the integration's translation keys for device-independent entity discovery.
- Open3E preset: the hot water status `domestic_hot_water_status` (idle, active, postrun) is mapped to the card's modes, and the Viessmann Vitocal outdoor-unit drawing is selected like for the ViCare preset. `upstream/` manifests for the Kronoterm, Open3E, Samsung and ebusd presets, so changes in their integrations are reported.
- Up to six heating circuits (#33): `hc_count` accepts 1 to 6, with `hc4_` to `hc6_` entity keys, `hc4_type` to `hc6_type`, `hc4_name` to `hc6_name`, their editor fields and groups, English and German labels and the diagnostic report. Presets fill circuits 4 to 6 with the next circuit numbers, and the automatic circuit detection of the editor stub counts up to six. The schematic stacks the circuits as before and grows by one row per circuit. Existing configurations with one to three circuits are unchanged.
- New option `hc_return_label` (default `false`, also in the editor): shows the return temperature of each heating circuit as `RL 27.4 °C` under its return pipe, from `hc_return`, `hc2_return` and so on. Only a circuit's own return sensor is used; narrow cards hide the label like the other secondary labels, and a tap opens the sensor. The prefix is the text `return_short`. Where the circuit's status line needs the room, the room target is left out first (#63).
- Room temperature per heating circuit: optional entity keys `hc2_room` to `hc6_room` and `hc2_room_target` to `hc6_room_target`, for houses with one circuit per floor and a room sensor of its own on each floor. The value appears in the status line under the emitter of its circuit, "Heating · Room 21.4 °C · Target 22.0", as a part of its own (tap and actions open the room sensor, screen readers read its name and value). Mode and room are centred together and never overlap each other, the emitter, its heat waves or the risers of further circuits; without a room sensor the target stands alone, and where both do not fit (long mode texts, narrow cards) the target is left out. `room` and `room_target` stay with circuit 1 and the house. Editor fields in the groups of circuits 2 to 6 with the labels of the room keys, the diagnostic report, new text keys `room` and `room_target` ("Room", "Room target"; German "Raum", "Raum-Soll"), the ground source demo (upstairs with its own room sensor) and self-tests. Presets do not fill the new keys yet.
- Entity lists: `power`, `heat`, `pv`, `battery` and `grid` accept a list of entities and show the sum of the members that report a number, with W and kW mixed. The first entity opens on tap. The editor shows a picker for several entities when the configuration holds a list, and the diagnostic report lists every member. Use case: S0 meters on the HeishaMon board for heat pump and internal heater (`sensor.<prefix>_s0_watt_1`, `_2`) as the heat pump power; README example in the HeishaMon section.
- Thermostats as temperature sources: temperature keys also accept `climate` and `water_heater` entities. The card reads their `current_temperature`, and the target `temperature` for `dhw_target`, `room_target` and the `_setpoint` keys. The diagnostic report shows the attribute next to the state, and screen readers read the temperature instead of the HVAC mode.
- Diagnostic report: new line "Loaded from" with the address of the card file, so an outdated dashboard resource is visible at once. The bug report template now names the browser console or the diagnostic report as the source of the card version instead of HACS, which can list a newer version than the one the browser runs (#47).
- Logo: a small schematic of the card (PV, heat pump, diverter valve, hot water tank, radiator) as SVG and PNG in `docs/logo/`, used in the README (light and dark variant) and as favicon, touch icon and header of the live demo. The demo title now uses the current name.
- Presets: an entity candidate that exists but is `unavailable` or `unknown` (not reported by this model) no longer blocks a later candidate that has a value. HeishaMon now reads the holiday mode from `switch.<prefix>_main_holiday_mode_state` when `sensor.<prefix>_main_holiday_mode_state` is unavailable (#56).
- HeishaMon preset: entity ids that differ with the current heishamon-homeassistant (#56). Heat, hot water and cooling power are found with both the Power and the Energy spelling of the id (the integration reads either topic, depending on firmware). Power and heat in the schematic prefer the total sensors `sensor.aquarea_energy_consumption` and `_production`, which include hot water. The heating setpoint comes from the zone target temperature (`z1_water_target_temp`, `z2_water_target_temp`) instead of the outlet target, which follows the hot-water target while the valve is on the tank. The holiday program also works with the on/off switch when the sensor is unavailable. README notes on the zone temperature (room) and the low-pressure value of some models.
- HeishaMon preset: power and heat in the schematic come from the integration totals `sensor.<prefix>_consumption` and `sensor.<prefix>_production` (heating, hot water and cooling together). The heating sensors `…_main_heat_power_consumption` and `_production` stay at 0 W while the 3-way valve is on the tank, so hot-water runs showed no power and no heat. They come before `sensor.aquarea_energy_consumption` / `_production` from #56, which not every installation has. Without any total the preset falls back to the heating sensors. The period tiles keep the values per mode.
- HeishaMon preset: the room temperature follows the zone sensor setting (`sensor.<prefix>_main_z1_sensor_settings`). `…_main_z1_temp` is a room temperature only with "Internal Thermostat" or "Thermistor"; with "Water Temperature" or "External Thermostat" it is the zone water temperature, so the room showed the flow temperature. The preset then uses the remote control sensor `…_main_room_thermostat_temp`, and `z1_temp` only when that sensor does not exist.
- HeishaMon preset: values that the integration provides but the preset did not map, checked on a real WH-MDC05J3E5 installation. Error chip from `sensor.<prefix>_main_error` ("No error" is no error). `energy_total` and `heat_total` from `sensor.aquarea_pump_total_consumption_total` and `_production_total`. These are not counters of the heat pump: the integration integrates its W sensors over time, so they start with the integration and stop without data. They also fill the energy, heat and total COP tiles. The tiles per mode get the totals `sensor.aquarea_heat_power_consumed_total`, `…_dhw_power_produced_total` and so on for all periods. Without a zone sensor the zone water temperature reads about −78 °C; the preset then leaves `hc_flow` out, so the circuit shows the heat pump's flow. Presets can read a current state with `ctx.state()`. Refrigerant circuit in the details drawer: evaporation from the outdoor pipe temperature, suction gas from the evaporator outlet, liquid line from the indoor pipe temperature, so the card computes the superheat. These roles hold only in heating: while the defrost entity is on (or the mode is defrost or cooling) the three values and the computed superheat show '–'. Presets list such keys in `heating_roles`; an entity set in the config keeps its value.
- HeishaMon preset: marked as confirmed on a real installation after feedback that the default MQTT mapping is detected correctly. The combined/layered store in that installation remains outside the supported topology and was mapped manually.
- Kronoterm: with integration v1.7.3 the heating system pressure (`hc_pressure`) shows the measured pressure (register 2326) instead of the low-pressure alarm limit (register 2325). The preset needs no change. Modbus energy values stay unavailable until the integration has selected its thermal scaling (0.1 or 1.0), see its v1.7.3 notes (#78).
- DHW tank with only a middle or bottom sensor: the tank is drawn when any of `dhw_top`, `dhw_middle`, `dhw_bottom` or `dhw_mode` exists, not only with `dhw_top` or `dhw_mode`. Without a top sensor the large value in the tank stays empty, the lower sensors show their value at their own position (a single bottom sensor without the word "bottom"), the tank colour comes from the highest sensor that exists, and a tap on the tank opens that sensor. HeishaMon has a single tank sensor; where it sits near the bottom, move it with `entities: {dhw_top: null, dhw_bottom: sensor.<prefix>_main_dhw_temp}`.
- Defrost without an operating-mode entity: an active defrost entity now wins over a stopped compressor. HeishaMon stops the compressor for about a minute twice during each defrost (4-way valve switching), and the card showed "Ready" then.
- An active `defrost` entity now shows defrost in the heat pump block and the mode chip even when the `mode` entity keeps reporting heating, cooling or hot water.
- The diverter valve also counts as hot water on the state "Tank (DHW)".
- Presets no longer copy `hc_pressure` to circuits 2 to 6 (it is the pressure of the whole heating system); the diagnostic report listed a stray `hc2_pressure`.
- Upstream watch: `upstream/<preset>.json` lists the integrations and files each preset is built on. A weekly workflow opens one issue per preset (label `upstream-change`) with the new releases and commits to those files, so renamed entities or changed state texts are noticed. Dependabot now also keeps the GitHub Actions and the dev dependencies up to date.
- Upstream review of the HeishaMon (2.12.1) and Kronoterm (v1.7.3) integrations: no entity id or translation key used by the presets changed (#77, #78).
- Contribution workflow: changelog entries go into `changelog.d/` as one file per change and are compiled into `CHANGELOG.md` at release time (`npm run changelog:compile`), preset documentation goes into `docs/presets/`, and pull requests no longer edit `README.md`, so open pull requests stop conflicting with each other. The header comment of the card file no longer lists the presets, the German README summary has one sentence per line, and there is a pull request template with a checklist.
- Bug report template: the preset list now contains every preset (open3e, ebusd, wolf, luxtronik and samsung were missing), and the preset feedback template names the presets that are still untested.
- README: the preset table now puts confirmed presets first and names each automatic outdoor-unit schematic. The animated demo keeps one Lambda unit while showing heating, hot water, defrost, standby, the timeline, quick controls and statistics at the card's real animation speed.
- README: explicit steps for installations made before the rename. HACS keeps the old folder and the old dashboard resource, so the update was not loaded; the new section lists remove, resource cleanup, download and check.
- Self-test: 833 checks.

## 0.11.0 – 2026-10-25
- Cut-out counters (#35): optional entities `cutout_high_pressure`, `cutout_low_pressure` and `cutout_temperature` in the details drawer, in their own section "Cut-outs (number of events)". They show event counts as whole numbers with a times sign, never with a pressure or temperature unit. Also in the editor, the diagnostic report and the demo. No preset mappings until the entity meaning is verified.
- Timeline marks (`timeline_marks`): a thin lane under the timeline for every badge, for example a Boost switch, with the periods in which it was on, listed in the legend and selectable by tap. A list of entities or `{ entity, label }` entries works as well. Also in the editor.
- Updated installation guidance for the HACS default listing: search and download through HACS first, with the custom-repository flow retained only as a fallback.
- Added an optional environmental-energy total counter with details and calendar-period tiles. When delivered heat is unavailable, total COP can be derived as `(environmental energy + electricity) / electricity`; all counters must cover the same time range (#26).
- Added a simplified, logo-free Panasonic Aquarea outdoor-unit drawing. The HeishaMon preset selects it automatically; `unit_style: panasonic` makes it available to custom configurations.
- Added logo-free Viessmann Vitocal, Bosch/Buderus, Saunier Duval GeniaAir and Samsung EHS Mono outdoor-unit drawings plus a documented brand-to-style overview. ViCare and EMS-ESP select their drawings automatically; Saunier Duval and Samsung remain explicit choices where the preset cannot identify the brand yet.
- Refreshed the README, development plan and tester guidance after the 0.10.0 release; completed release issues are now tracked under the 0.10.0 milestone.
- Self-test: 524 checks.

## 0.10.0 – 2026-10-24
- Added optional brine and heating-circuit pressure entities, unit conversion to bar, configurable low/critical/high thresholds, accessible warning symbols, live tiles and details rows (#22).
- Added optional middle temperature sensors for DHW and buffer tanks, producing a three-point gradient without changing existing two-sensor tanks (#29).
- Added restrained vapour during air-source defrost for every unit drawing, respecting the animation and reduced-motion settings (#30).
- Added an original, theme-aware column-radiator emitter available for every heating circuit (#37).
- Updated the editor, live demo, custom-text reference and README for the new entities and options.
- Added a locked Node.js/Playwright developer flow: one local HTTP entry point, Chromium and Firefox regression runs, failure artifacts and a small release-contract check in CI.
- Pinned the GitHub Actions runner to Ubuntu 24.04 and protected `main` with required HACS, quality, Chromium and Firefox checks.
- Self-test: 480 checks.

## 0.9.6 – 2026-10-24
- Added a local, clipboard-only diagnostic report with resolved preset and entity mappings, current states/units, errors and quick controls. The report warns that entity ids may contain private names (#7).
- Added an accessible full-screen overlay using the same card instance, with focus trapping, Escape/backdrop/close-button handling, focus restoration and `fullscreen: false` (#9).
- Added recursive custom text/language maps through YAML `texts`, strict key/type validation, English fallback and a stable key reference in `docs/TEXTS.md` (#11).
- Added fixed per-card `auto`, `night` and high-contrast themes in the editor and live demo (#13).
- Replaced the repository social preview with the feature-led Heat Pump Hydraulic Card artwork (proposal C).
- Updated README, roadmap and issue templates for the renamed repository and a diagnostic-report-based real-installation test campaign. PR #16 remains contributor-owned and outside this work.
- Self-test: 460 checks.

## 0.9.5 – 2026-10-24
- The repository is now called `heatpump-hydraulic-card`, the file `dist/heatpump-hydraulic-card.js` and the HACS name "Heat Pump Hydraulic Card". The element names are unchanged: `custom:heatpump-flow-card` keeps working, `custom:heatpump-hydraulic-card` is the unique name.
- Direct systems without buffer or circuit-specific sensors now draw a closed heating circuit and use the heat pump's flow and return temperatures (#18).
- The visual editor accepts object-form quick controls without showing `[object Object]` and preserves their `name` and `icon` while the entity remains selected (#17).
- Energy-dashboard sources without a live power sensor are named in the card and editor. With exactly one missing source, its displayed share is the unexplained remainder of the heat-pump power; manual source sign conventions are documented (#19).
- Text error sensors can use `error_ok` (for example `["No Error", "OK"]`); any other known text then shows the error chip. Numeric and binary behaviour is unchanged, and the editor explains the rules (#21).
- Total COP documentation and editor help now warn that heat and electricity counters need the same start time and that environmental energy is not delivered heat (#20).
- Ground and groundwater loops show `source_in − source_out` while the compressor runs; `source_spread: false` hides the label (#25).
- `animations: auto | always | off` controls reduced-motion behaviour, and `flow_speed` from 0.2 to 3 scales all movement. Both are available in the editor and the live-demo hint points to the override (#6).
- Added a utility-lock badge example to the README (#28).
- Added `docs/ROADMAP.md` with the bug-first release plan, quick wins and impact/effort ordering of feature requests.
- Self-test: 435 checks.

## 0.9.3 – 2026-10-24
Timeline of the operating mode, a fading heating surface, and no more clash with other cards of the same name.
- Timeline (`timeline: true`, `timeline_hours`): a strip under the schematic shows heating, hot water, defrost, blocked and standby over the last 24 hours (3 to 72), from the history of the `mode` entity; without it from the `compressor` and the `valve`. Tap or arrow keys show start, end and duration. One history query per card, kept for five minutes. Also in the editor.
- The heating surface (underfloor loop and radiator) fades from the flow colour to the return colour; one colour when flow and return do not differ.
- The card is also registered as `heatpump-hydraulic-card` (editor `heatpump-hydraulic-card-editor`), the same card under its own name. `type: custom:heatpump-flow-card` keeps working.
- Other cards use the generic element names too, and a browser keeps only the first definition. When another card already owns `heatpump-flow-card`, this card now says so in the console, tells which type to use, and the card picker lists it as "Heatpump Hydraulic Card". Before, it skipped its registration without a word.
- Self-test: 405 checks, including a page where another card registered the generic names first (`test/collision.html`).

## 0.9.2 – 2026-10-23
Small refinements of the heat pump block.
- The frame of the heat pump block follows the mode while running: orange for heating, red for hot water, blue for defrost and cooling; standby stays grey. It was always orange.
- Air sources: the outdoor temperature is shown under the unit next to the air inlet instead of in the house. Ground and groundwater sources keep it in the house.
- A status line that is too long for the block (for example "Hot water · starting compressor" or the German "Warmwasser · Verdichter startet") wraps into mode and status on two lines; a single long word is squeezed to fit.
- Self-test: 378 checks.

## 0.9.1 – 2026-10-23
Keyboard and screen readers.
- Every clickable part is a button: header chips, the parts of the schematic, tiles and details rows. Tab reaches them; the schematic, the tiles and the details are one tab stop each, with arrow keys, Home and End moving inside.
- Enter or Space runs the tap action (default: more-info), Shift+Enter the hold action, Alt+Enter the double-tap action.
- A focus frame in the primary colour marks the focused part (a rectangle inside the schematic, an outline elsewhere).
- Parts of the schematic carry a label with the entity name and value for screen readers; the schematic is a group instead of an image so its parts are announced. Hidden or empty parts are skipped.
- A tile keeps the keyboard focus when its value is redrawn.
- Self-test: 365 checks.

## 0.9.0 – 2026-10-23
Outdoor unit drawings.
- The heat pump block draws the outdoor unit: the anthracite Lambda EU-L (tall, laser-cut pattern over the fan, solid lower panel) and the Vaillant aroTHERM plus in three sizes (one fan low, one fan, two fans). Drawn from photos and published sizes; simplified original drawings, no logos.
- `unit_style: auto | generic | lambda | vaillant` (default `auto`: the style of the preset) and `unit_size: small | medium | large` for Vaillant. Also in the editor.
- **What changes on existing cards:** Lambda and Vaillant cards now show their unit instead of the generic fan. Keep the old look with `unit_style: generic`.
- The anthracite stays the same in every theme; a thin rim in the theme text colour keeps it visible on dark cards. New variables `--hfc-anthracite` and `--hfc-casing`.
- Several fans spin and defrost independently (one snowflake per fan). Ground and groundwater sources keep their loop symbol.
- Self-test: 342 checks.

## 0.8.1 – 2026-10-23
Looks.
- Narrow cards: the type size follows the width of the schematic. Below about 640 px labels grow, below about 500 px they grow further and secondary labels (flow rates, tank bottom temperature, VL / RL prefixes, valve, circulation and hot water target line) are hidden, so the main numbers stay readable on phones.
- Chips: text colour is mixed with the theme text colour, so the mode, program, error and badge chips read in dark themes too (they were hard to see before).
- Power sources: name and value on two lines with a halo, so the labels no longer run into each other and the lines do not cut through the text.
- Tanks: a four-step scale (blue, cyan, orange, red) mixed in oklch instead of a blue-red mix that turned muddy violet. New variables `--hfc-tank-cool` and `--hfc-tank-warm`.
- DHW coil: calmer, so it no longer clutters the temperature.
- Idle pipes are solid pale tints instead of transparent, which removes the dark dots where pipes meet.
- Multiple circuits: the riser bridges the return line of circuit 1 where they cross.
- Self-test: 326 checks.

## 0.8.0 – 2026-10-22
Wall display.
- `layout: wall` for wall tablets: the wide layout with about 30 % larger type. The quick controls and the details toggle are hidden and not clickable until a touch or mouse move wakes the card, and fade out again after `wall_timeout` seconds (default 10, `0` = always visible); an open details drawer closes with them. Also in the editor.
- Self-test: 314 checks.

## 0.7.0 – 2026-10-22
Layouts, colours you can change, actions on every element, heating program, solar thermal.
- Colours: all colours are CSS variables (`--hfc-heat`, `--hfc-pv`, `--hfc-tank-cold` …) with the previous colours as defaults. A theme or card-mod can restyle the card; the temperature scales of pipes and tanks follow the variables too. Without a theme nothing changes, apart from slightly different tints of chip text and the grid line.
- Layout: `layout: compact` (tighter spacing for narrow columns) and `layout: wide` (schematic left, controls, tiles and details right, from 760 px card width; for wall tablets). Also in the editor.
- Actions: `actions` gives every element of the schematic its own `tap_action`, `hold_action` and `double_tap_action`, keyed by entity key; badges can carry them directly. A tap without a configured action still opens more-info.
- Heating program chip (eco, night, party, holiday) from the new `program` entity or, without one, from the heating circuit mode (Lambda `ECO`). `program_map` maps raw states; common words in English and German are recognised. Presets: EMS-ESP `modetype`, HeishaMon holiday mode, myPyllant special function (the last two and the solar preset below not yet tested on a real installation).
- Solar thermal: `solar_collector` and `solar_pump` draw a collector on the roof edge of the house with a loop into the DHW tank, animated while the pump runs. ViCare preset. Needs the DHW tank.
- Animation speed: fan, pumps and flow lines follow the compressor modulation (`compressor_speed`; Hz and rpm against `compressor_speed_max`). Without a modulation value the fan keeps following the power.
- Self-test: 302 checks.

## 0.5.0 – 2026-10-21
Your own stat tiles, with costs and actions.
- Customizable stat tiles (`tiles`): pick tiles, order and period (`now`, `today`, `yesterday`, `week`, `month`, `year`, `total`) from a catalog of more than 40 tiles – COP per mode, SPF, electricity and heat per mode (including defrost and standby), starts, cycles, defrosts, hours, runtime per start, load classes, heater hours and starts, live values, PV and solar thermal yield, cost. Free entities can be mixed in. Without `tiles` nothing changes; `tiles: []` hides the row.
- Presets map the tiles: Lambda (periods day/month/year/total, cycles, defrost and standby energy), ViCare (COP, SPF, consumption per period, hours, load classes, heater rod, PV, solar thermal), EMS-ESP (totals per mode), HeishaMon (heat and electricity as current power), Vaillant (daily energy per mode).
- Periods an integration does not provide come from the long-term statistics of its total counters (`recorder/statistic_during_period`); a COP for a period is computed as heat ÷ electricity (marked ≈).
- Card editor: "Own tile selection" with a sortable list of the tiles this installation can fill.
- Cost tile with a card-wide `price` (number or entity, also in the editor) and `currency`. With a dynamic tariff the card bills every hour at that hour's mean price from the long-term statistics, the current hour at the current price; year and total use daily and monthly values (≈). ct/kWh and per-MWh prices are converted.
- Tile actions: `tap_action`, `hold_action` and `double_tap_action` on every tile (also `stats`), handled by Home Assistant (navigate, url, toggle, perform-action, more-info, none, confirmation). The default stays more-info.
- Self-test: 248 checks.

## 0.4.3 – 2026-10-21
- Detection: Viessmann (ViCare) and EMS-ESP gas boilers are no longer taken for heat pumps; ViCare needs a compressor entity, EMS-ESP needs heat pump entities (`hpactivity` / `hptc1`). The Lambda preset only accepts entities of the lambda_heat_pumps integration.
- Error boundary: unexpected data shows a short message in the card instead of an empty card; the editor never breaks the dialog.
- Editor marks presets that are not yet tested on a real installation and asks for feedback.
- Self-test (`test/selftest.html`, 182 checks) runs in headless Chrome in CI; demo data moved to `demo/setups.js`.

## 0.4.2 – 2026-10-21
Easier setup in the card editor.
- Card editor shows the entities found by the preset (marked "Found by the preset"); only differences are saved: another entity overrides, a cleared field hides the entity (`null`).
- The preset field reports the detection (prefix, number of entities) or why nothing was found; the card shows a hint when the preset finds nothing.
- Editor offers circuit 2/3 fields only up to `hc_count`.
- Editor layout: preset, title, emitter and number of circuits on top; prefix, device, heat source, power sources, threshold, language, circuit names and details option under "Advanced".
- Editor warns about missing core entities and what the card cannot show without them (running state, live COP, spread, estimated heat output).
- New cards: `hc_count` and `source_type` are detected where reliable (circuits: Lambda, EMS-ESP, Vaillant; brine: EMS-ESP).

## 0.4.1 – 2026-10-21
- Details drawer: energy counters reported in Wh (e.g. Lambda) are shown in kWh.

## 0.4.0 – 2026-10-21

**What may change on existing cards after the update** (no configuration breaks):
- Without own `pv` / `battery` / `grid` sensors, PV / battery / grid now appear if your Energy dashboard has power sensors. Turn off with `power_sources: manual`.
- Presets now map a backup heater (Lambda: 2nd heating stage, EMS-ESP: auxiliary heater, HeishaMon: internal heater), shown as a small box in the heat pump. Hide with `entities: {heater: null}`.
- A collapsed **Details** section appears below the statistics when the integration provides counters or refrigerant values.

**New**
- Quick controls (`controls`): toggle, press, dropdown and number input for switch, button, script, select, water_heater, climate, number and their input_* helpers.
- Details drawer below the statistics: operating hours, total starts, total electricity and heat with total COP, refrigerant circuit (compressor speed, evaporation, condensation, suction gas, hot gas, liquid line, pressures, expansion valve, superheat, subcooling; superheat and subcooling computed when missing) and own rows (`details`, `details_open`). Presets: Lambda, ViCare, EMS-ESP, HeishaMon.
- Up to three heating circuits (`hc_count`, `hc2_type`, `hc3_type`, `hc_name`…, entity keys `hc2_*` / `hc3_*`). Presets fill circuits 2 and 3 with the next circuit numbers (Lambda, EMS-ESP, Vaillant, HeishaMon zone 2).
- Heat source `source_type: air | brine | water`: ground loop or groundwater wells below the heat pump, with source inlet and outlet (`source_out`).
- Heater rods in the DHW tank and buffer (`dhw_heater`, `buffer_heater`) and a backup / inline heater (`heater`), glowing while on, red at stage 2+. Presets: Lambda 2nd heating stage, EMS-ESP auxiliary heater, HeishaMon internal heater.
- PV / battery / grid from the Energy dashboard: without own `pv` / `battery` / `grid` sensors, the card reads the power sensors of the Energy dashboard and splits the heat pump's power by the current supply mix (marked ≈). New option `power_sources: auto | manual`.
- Live demo on GitHub Pages (`demo/`, formerly `test/index.html`): all presets and scenarios, light/dark, English/German, with the matching card configuration.
- README: "Where the numbers come from" section, link to the live demo and the community thread; emojis removed.
- Card: the error chip and the defrost indicator use drawn SVG symbols instead of the ⚠ and ❄ characters, which some devices render as colour emoji.

## 0.3.1 – 2026-10-19
- README: animated demo GIF, "Open in HACS" button, CI and release badges, feedback section.
- Issue templates: bug report and preset feedback / new brand.
- No functional changes to the card.

## 0.3.0 – 2026-10-19
- **Preset `emsesp`** (not yet tested on real installations): Bosch, Buderus, Junkers, Nefit, Worcester, Sieger, elm.leblanc and iVT heat pumps via the EMS-ESP gateway; instance prefix detection, English and German activity texts.
- **Preset `heishamon`** (not yet tested on real installations): Panasonic Aquarea via HeishaMon + heishamon-homeassistant; MQTT prefix detection.
- New entity key `defrost` (binary). `compressor` may be numeric (frequency/speed > 0 = running). `valve` accepts states such as `Tank`/`DHW`.
- Without an operating-mode entity the card derives the mode (heating / hot water / defrost / standby) from compressor, valve and defrost.
- Without circuit pump or circuit mode, the heating circuit runs whenever the heat pump heats or cools.
- Preset entities that do not exist in Home Assistant no longer count as configured.
- README lists all supported brands per preset.

## 0.2.0 – 2026-10-19
- **Presets** (not yet tested on real installations) for Viessmann (core ViCare integration, language-independent via entity registry translation keys) and Vaillant aroTHERM (myPyllant, home prefix auto-detected).
- **Heat emitter:** `hc_type: radiator` draws radiators with rising heat waves; underfloor now shows a screed layer.
- **Flow rates:** shown on the heating-side loop; new optional `hc_volume` and `source_volume`.
- **Estimated heat output** from flow rate × spread when no heat sensor exists (marked ≈), including COP.
- **Units:** power in W or kW, heat in kW or W, flow rate in l/h, l/min or m³/h are converted.
- `device` option to restrict preset detection to one device; binary error sensors supported.
- Mode chip shows "Hot water" when the valve is on DHW even if the integration reports "heating".
- Pipes without a temperature sensor keep their base colour instead of turning grey.

## 0.1.0 – 2026-10-19
First public version.
- Animated schematic: power sources (PV / battery / grid) → heat pump → diverter valve → DHW tank / buffer → heating circuit, house.
- Vendor-neutral core with normalized modes and `mode_map` overrides.
- Preset `lambda` for lambda_heat_pumps, supporting legacy (`sensor.<prefix>_hp1_…`) and new (`sensor.hp1_…`) naming, with automatic prefix detection.
- Optional blocks are hidden when their entities are missing, with a bypass line when there is no buffer.
- UI editor (`getConfigForm`) with grouped entity pickers; English and German.
- Statistics row, custom stat tiles, badges, error chip, more-info on click, reduced-motion support.
