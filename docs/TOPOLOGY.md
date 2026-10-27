# Storage topology plan

This plan covers the open requests that change the storage part of the schematic: a combined/layered storage ([#50](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/50)), a wood stove feeding the buffer ([#36](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36)) and a second heat generator in hybrid/bivalent systems ([#51](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/51)). The standby loss of the hot-water tank ([#32](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/32)) is analysis rather than drawing and ships on its own; its interaction with a combined storage is listed below.

The aim is to design the storage geometry once for all of these instead of adding a special case per request.

## Principles

- **No generic topology engine.** A freely composable graph of generators, storages and circuits would replace the fixed geometry the card is built on (effort XL, every layout, test and accessibility path changes). The card keeps fixed slots; each request becomes an opt-in variant of one slot.
- **Existing configurations do not change.** Every variant is off by default and selected by an explicit option or by entities that only exist on such installations.
- **Reuse entity keys where the meaning holds.** Presets, the editor and the diagnostic report keep working without a parallel set of keys.
- **No guessed semantics.** A variant that depends on integration states (#51) waits for a reviewed diagnostic report from a real installation.
- **Same quality gate as other features:** layout signature, EN/DE texts, editor fields, keyboard access, compact/wide/wall layouts and full screen, demo setup, self-test with geometry collision checks (as for the series buffer), README section.

## Current geometry

The SVG is 1000 units wide; height grows by 250 per extra heating circuit.

| Area | Position | Notes |
| --- | --- | --- |
| Power sources | x 40–300, y 10–190 | PV, battery, grid above the heat pump |
| Heat pump block | x 50–290, y 190–425 | source loop below (air, brine, water) |
| Flow / return to the valve | y 250 / y 380 | optional primary pump at x 340 |
| Diverter valve | x 420, y 250 | DHW branch up to y 80, heating branch down to y 360 |
| Storage column | x 520–640 | DHW tank y 40–240, buffer y 320–520 |
| Buffer bypass / series buffer | x 520–640, y 360–495 | when no parallel buffer is drawn |
| Heating circuits | from x 640, rows of 250 | up to six; house x 720–940 above |

The DHW branch already enters the column at y 80 (top) and the heating branch at y 360 (middle), with returns at y 215 and y 495. A tall single tank in the same column fits these heights without moving any pipe.

## Phase 1 – combined/layered storage (#50)

**Option:** `storage: separate | combined` (default `separate`).

**Drawing:** one tall tank in the storage column (x 520–640, y 40–520) with a hot-water zone at the top and a heating zone below, marked by a subtle zone line and the zone titles. The diverter valve feeds the two zones at the existing heights: DHW charging enters at the top, heating at the middle. Heating circuits draw from the lower zone exactly as from a buffer today.

**Sensors:** no new keys. The six existing keys map to heights in the one tank, top to bottom: `dhw_top`, `dhw_middle`, `dhw_bottom`, `buffer_top`, `buffer_middle`, `buffer_bottom`. That gives up to six sensors (the request asked for five), and presets that already report a DHW and a buffer temperature (HeishaMon, Lambda, EMS-ESP) show both in the one tank. The gradient uses every available sensor at its height.

**Hot-water part:** `dhw_type: coil | fresh_water | tank_in_tank` (default `coil`) only changes the small drawing inside the upper zone: a coil, a fresh-water station beside the tank, or an inner tank. The tap side is not drawn.

**Charging variants:** the first version supports the diverter valve into two heights. A stratification valve (one charging pipe, the valve chooses the height) is a later option `storage_charge: stratified` once an installation reports it.

**Rules:**

- `storage: combined` with `series_buffer: true` is rejected in `setConfig` with a clear message (one replaces the other).
- Hot-water mode, valve text and the DHW heater rod keep their meaning; the buffer heater rod is drawn in the lower zone.
- The tile and badge contracts do not change.

**Open questions** (asked in #50, no answer yet; defaults above are used until then): storage type, how the heat pump charges it, whether a DHW target entity exists, number and height of the sensors.

**Done when:** both storage modes render in every layout, flows animate along the right zones for heating and hot water, the self-test covers sensor placement, zone flows, the `series_buffer` conflict, editor fields and a geometry check against circuits 2–6, and a demo setup "Combined storage" exists.

## Phase 2 – wood stove feeding the storage (#36)

**Keys:** `stove_temp`, `stove_pump`; option `stove_fire_temp` (°C, default 60) above which the fire is drawn burning.

**Drawing:** a stove below the storage column with its own flow into the upper heating zone and its return from the bottom of the buffer or the combined storage. Without a buffer or combined storage the stove is not drawn and the editor explains why.

**Geometry:** the space below the storage column is shared with the bypass/series buffer and with the risers of circuits 2–6. A short geometry spike decides the routing before the public options are fixed; the SVG grows in height only when a stove is present. The collision check from the series buffer is extended to the stove, its pipes and labels.

**Done when:** the block is absent without its entities, works in all layouts, is keyboard accessible (one tab stop, tap opens `stove_temp`), animates only while the stove pump runs, and has demo and self-test coverage.

## Phase 3 – second heat generator in hybrid systems (#51)

**Blocked** until a reviewed diagnostic report from a real hybrid installation (for example Intergas Xtend with ESPHome) shows the boiler's states and power values.

**Proposed model** (to be confirmed with that data):

- Keys `boiler_state`, `boiler_power`, optional `boiler_flow`; a normalised mode `boiler_only`, `hp_only` or `both` derived from heat pump and boiler activity.
- First variant: boiler in series after the heat pump on the flow pipe (the heat pump preheats, the boiler tops up), drawn as a small block between the heat pump and the diverter valve, separate from the inline heater rod.
- Later variant: boiler in parallel into the buffer or combined storage, reusing the generator connection of phase 2.
- Whether the boiler also heats DHW is decided from the sample data, not assumed.

## Standby loss of the hot-water tank (#32)

Shipped separately as the tile `dhw_loss` (cool-down in K/h from verified standby windows of the recorder history). With `storage: combined` the upper zone also loses heat to the lower zone while circuits draw from it, so phase 1 has to decide whether windows with running circuit pumps are excluded or the tile is marked approximate for combined storage. A loss in W or kWh per day needs the tank volume and is a possible follow-up (`dhw_volume`).

## Order and releases

| Step | Content | Release | Depends on |
| --- | --- | --- | --- |
| 1 | Phase 1: `storage: combined`, sensor heights, `dhw_type`, demo, tests | next minor | – |
| 2 | Geometry spike below the storage column (stove and future generator connection) | with phase 2 | phase 1 |
| 3 | Phase 2: wood stove | following minor | step 2 |
| 4 | Phase 3: second heat generator | when data is available | reviewed diagnostic report |

Each phase is one pull request with its changelog fragment. Umbrella issues stay open while only part of the scope is delivered, as described in [CONTRIBUTING.md](../CONTRIBUTING.md).

## Risks

- **Height and narrow layouts:** a taller schematic (stove) makes the compact and phone views smaller; phone layouts ([#4](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4)) are not part of this plan.
- **Preset defaults:** reusing the DHW and buffer keys means a preset cannot know whether an installation has one combined tank or two tanks. `storage: combined` therefore stays a user choice, never set by a preset.
- **Test data:** phases 1 and 2 are tested with simulated data only until real installations report back; the README marks them accordingly.
