# Storage topology plan

This plan covers the open requests that change the storage part of the schematic: a combined/layered storage ([#50](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/50)), a wood stove feeding the buffer ([#36](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36)) and a second heat generator in hybrid/bivalent systems ([#51](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/51)). The standby loss of the hot-water tank ([#32](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/32)) is analysis rather than drawing and ships on its own; its interaction with a combined storage is listed below.

It answers four questions: how the schematic should grow (fixed slots or an internal component model), what each variant costs, which combinations exist and how common they are, and which variants exclude each other.

## Principles

- **No user-facing topology language.** A freely composable graph in the configuration would make every dashboard a hydraulic design task. The configuration stays semantic (`storage: combined`, stove entities, boiler entities); how the card draws it is internal.
- **Existing configurations do not change.** Every variant is off by default and selected by an explicit option or by entities that only exist on such installations.
- **Reuse entity keys where the meaning holds.** Presets, the editor and the diagnostic report keep working without a parallel set of keys.
- **No guessed semantics.** A variant that depends on integration states (#51) waits for a reviewed diagnostic report from a real installation.
- **Invalid combinations are rejected or resolved visibly**, never drawn as plumbing that cannot exist.
- **Same quality gate as other features:** layout signature, EN/DE texts, editor fields, keyboard access, compact/wide/wall layouts and full screen, demo setup, self-test with geometry collision checks, README section.

## Current geometry and coupling

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

How tightly the drawing is coupled today (main, 0.12.0): about 4,300 lines in one file; the SVG is built in `_render` and a few helpers (`_circuitSvg`, `_seriesSvg`, `_solarSvg`, `_sourceSvg`, `_heaterSvg`, `_unitArt`) with 42 literal pipe paths and about 220 hard-coded coordinates. Which pipe animates is decided in `_update` from flags such as `toDhw`, `flowHeat`, `flowLoop` and `bypass`. The merges of the primary pump (#95), the fan speed (#96) and the series buffer (#97) each needed manual conflict resolution in exactly these flags and paths; that is the cost every further variant will pay under the current structure.

## Two ways to grow

### Option A – fixed slots, one variant at a time

Each request is added as an opt-in variant of the existing slot: new SVG strings, new flags in `_update`, a new collision check.

- **Benefit:** smallest first step, no change to existing code paths, no freeze for contributors.
- **Cost that grows:** every new variant has to be checked by hand against every existing one (storage type × generators × stove × solar × 1–6 circuits × series buffer × three layouts). Flow logic stays spread over flags; conflicts between parallel pull requests stay frequent.

### Option B – internal component model ("phase 0")

A refactor of the drawing, without any change to the configuration or to what users see:

1. **Components.** Heat pump, valve, DHW tank, buffer, series buffer, circuit, solar, and later combined storage, stove and boiler become components with one shape: the entity keys they use, their size, named **ports** (`flow_in`, `return_out`, `dhw_in` …), their SVG, their value update, editor fields and keyboard access.
2. **Columns with automatic stacking.** The columns stay fixed (generators, switching, storage, distribution); components inside a column are stacked from their sizes, so the height follows the content.
3. **Pipes as connections between ports**, routed on fixed lanes between neighbouring columns (orthogonal, no general path finding).
4. **One flow model.** Which generator runs and which path is open is decided once; each connection derives whether it animates. This replaces the scattered flags.
5. **Generated combination tests.** The self-test enumerates every valid combination of the matrix below and checks the same invariants for each: no overlaps, every pipe ends at a port (the lesson of #18), one tab stop per component, all layouts render.

- **Benefit:** a new storage type, generator or circuit element becomes one component plus its ports and texts; the generated tests check it against everything that exists. Merge conflicts shrink because a variant touches its own component instead of shared flags.
- **Cost and risk:** see the effort and risk tables below.

### Recommendation: staged option B

Not a big-bang rewrite, and not option A forever. The parts of option B that pay off immediately come first; the rest follows only when it is needed:

| Stage | Content | Pays off for |
| --- | --- | --- |
| 0a | **Safety net:** geometry snapshot test (position and size of every element for each demo setup, compared before/after) and the combination test harness, still over today's code | any refactor, and option A as well |
| 0b | **Flow model:** one function decides active generator and open paths; `_update` reads from it. No visual change. | every new hydraulic variant |
| 0c | **Storage column as components** (DHW tank, buffer, series buffer, bypass) with ports; combined storage is built as the first new component on top | phase 1 |
| 0d | Other columns (generators, distribution) only when phase 2 or 3 needs them | phases 2 and 3 |

Decision rule: if after phase 1 no further hydraulic variant is requested within two releases, stop after 0c. Each additional variant (pool, cascade, mixing valves, hydraulic separator …) tips the balance further towards finishing 0d.

## Effort

Relative sizes as in the [roadmap](ROADMAP.md) (`S` local, `M` several code paths, `L` public API or data logic, `XL` architecture). Days are rough estimates for one focused working day each, including tests, demo, texts and documentation; they assume no surprises from real installations.

| Work | Option A | Staged option B | Note |
| --- | --- | --- | --- |
| 0a safety net | – (optional, M, 2 d) | M, 2 d | useful for A as well |
| 0b flow model | – | M–L, 2–3 d | highest regression risk of the stages |
| 0c storage column as components | – | L, 3–4 d | |
| 0d remaining columns | – | L, 3–5 d | only when needed |
| Phase 1 combined storage | M, 2–3 d | S–M, 1–2 d | |
| Phase 2 wood stove (incl. geometry spike) | L, 3–5 d | M, 2–3 d | B: stove = component in the generator column |
| Phase 3 second generator (after data) | M–L, 2–4 d | M, 2 d | |
| **Sum for the three requests** | **7–12 d** | **12–19 d** (incl. 0d) | B costs about 5–7 d more up front |
| Each further variant | M–L, growing | S–M, roughly constant | break-even after about 3–5 further variants |

The time is not the only difference: under option B the generated combination tests cover combinations nobody tried by hand, which is where option A will produce bugs on real installations.

## Risks

| Risk | Option A | Option B | Mitigation |
| --- | --- | --- | --- |
| Regression on existing installations (the card is in the HACS default list) | low per step, rising with each variant | medium during 0b–0d | 0a snapshot test first; each stage a separate release; no visual change allowed in 0b–0d |
| Conflicts with contributor pull requests | frequent (shared flags and paths) | high during the refactor, low afterwards | announce a short freeze window right after a release; merge open contributions first; one column per pull request |
| Combinations nobody tested | grows with every variant | covered by generated tests | – |
| Scope creep (generic engine) | – | medium | no user-facing topology, fixed columns and lanes, stop rule after 0c |
| Single-file size and review effort | grows slowly | grows during the refactor, then flatter | keep one file (HACS), group components in sections |
| Performance | unchanged | layout computed once per layout signature, as today | measure render time in the self-test |
| Narrow and phone layouts (#4) | each variant needs its own check | column stacking makes a second geometry easier later | out of scope here |

## Variants, prevalence and data

Prevalence is a qualitative estimate for single-family houses in Central Europe. Public statistics do not break heat pump installations down by storage configuration; the classes below come from manufacturer guidance, installer forums and the requests reaching this project, and should be corrected when better data appears.

| Variant | Status | Prevalence | Basis / evidence |
| --- | --- | --- | --- |
| Separate DHW tank with diverter valve | supported | very common | standard design of split and monobloc units |
| No buffer, direct circuit | supported | common (new builds with underfloor heating) | manufacturers recommend no buffer for modulating units with floor heating |
| Parallel buffer | supported | common (existing buildings, radiators, several circuits) | |
| Series buffer in the return | supported (0.12/main) | common | #97 |
| Solar thermal into the DHW tank | supported | uncommon, declining with PV | |
| Combined / layered storage | phase 1 | uncommon to medium; typical with solar thermal or a stove | #50, a HeishaMon installation |
| Fresh-water station on buffer or combined storage | with phase 1 (`dhw_type`) | uncommon to medium | |
| Tank-in-tank | with phase 1 (`dhw_type`) | rare with heat pumps | |
| Stratification valve instead of diverter valve | later | rare | |
| Wood stove with water jacket into the storage | phase 2 | rare; needs a large buffer (typically 800–1,000 l) and is connected as secondary generator | #36 |
| Boiler in series after the heat pump (hybrid) | phase 3 | regional: common in retrofit hybrids (for example the Netherlands), less in Germany | #51 (Intergas Xtend) |
| Boiler in parallel into a buffer (bivalent) | phase 3, later | medium in existing buildings | |
| Cooling through the heating circuits | supported | medium (mainly air source and underfloor heating) | |

## Combinations and exclusions

Not every combination exists, and that is intended: a storage strategy is one choice per installation, while additional generators combine but need a suitable storage.

**Storage strategy – exactly one of:**

| Strategy | DHW | Heating side |
| --- | --- | --- |
| direct | separate tank or none | no buffer |
| parallel buffer | separate tank or none | buffer between valve and circuits |
| series buffer | separate tank or none | buffer in the return, optional bypass valve |
| combined | upper zone of the one tank | lower zone of the one tank |

**Additions and their requirements:**

| Addition | direct | parallel buffer | series buffer | combined | Rule in the card |
| --- | :---: | :---: | :---: | :---: | --- |
| Separate DHW tank | yes | yes | yes | – | combined replaces it |
| Fresh-water station (`dhw_type`) | – | yes | – | yes | needs a heating-side store to draw from |
| Tank-in-tank (`dhw_type`) | – | – | – | yes | only inside a combined storage |
| Solar thermal | into DHW tank | into DHW tank | into DHW tank | into the lower zone | target follows the storage |
| Wood stove | – | yes | – | yes | needs thermal separation and volume; series buffers are too small |
| Boiler in series (hybrid) | yes | yes | yes | yes | sits on the flow pipe before the valve |
| Boiler in parallel (bivalent) | – | yes | – | yes | needs a store as hydraulic separation |
| Cooling | yes | yes, if the buffer is a cooling buffer | yes | bypasses the storage | a combined tank holds hot water and is never cooled |
| Heating circuits 1–6 | yes | yes | yes | yes | |

**Tendencies** (not enforced, but useful for defaults and demos): combined storage often comes together with solar thermal or a stove; hybrid retrofits often have no buffer; installations with several circuits and radiators usually have a parallel buffer; a stove almost always means a large buffer or combined storage.

**How the card handles invalid combinations:** a direct conflict in the configuration (for example `storage: combined` with `series_buffer: true`) is rejected in `setConfig` with a clear message; a missing requirement (a stove without buffer or combined storage) leaves the addition out and the editor says why; entities that imply two strategies (buffer sensors and `series_buffer`) keep the existing rule that the parallel buffer wins.

With the four strategies, the additions above and 1–6 circuits, the valid set is several hundred combinations per layout (roughly 800 when DHW variants, solar, stove, boiler variants and cooling are counted). That is far too many to check by hand and the main argument for the generated tests of stage 0a.

## Phase 1 – combined/layered storage (#50)

**Option:** `storage: separate | combined` (default `separate`).

**Drawing:** one tall tank in the storage column (x 520–640, y 40–520) with a hot-water zone at the top and a heating zone below, marked by a subtle zone line and the zone titles. The diverter valve feeds the two zones at the existing heights: DHW charging enters at the top, heating at the middle. Heating circuits draw from the lower zone exactly as from a buffer today.

**Sensors:** no new keys. The six existing keys map to heights in the one tank, top to bottom: `dhw_top`, `dhw_middle`, `dhw_bottom`, `buffer_top`, `buffer_middle`, `buffer_bottom`. That gives up to six sensors (the request asked for five), and presets that already report a DHW and a buffer temperature show both in the one tank. The gradient uses every available sensor at its height.

**Hot-water part:** `dhw_type: coil | fresh_water | tank_in_tank` (default `coil`) only changes the small drawing inside or beside the upper zone. The tap side is not drawn.

**Charging variants:** the first version supports the diverter valve into two heights. A stratification valve is a later option `storage_charge: stratified` once an installation reports it.

**Rules:** `storage: combined` with `series_buffer: true` is rejected; cooling bypasses the tank; hot-water mode, valve text and the DHW heater rod keep their meaning; the buffer heater rod is drawn in the lower zone; tile and badge contracts do not change; a preset never sets `storage: combined` (it cannot know whether one or two tanks exist).

**Open questions** (asked in #50, no answer yet; the defaults above are used until then): storage type, how the heat pump charges it, whether a DHW target entity exists, number and height of the sensors.

**Done when:** both storage modes render in every layout, flows animate along the right zones for heating and hot water, the self-test covers sensor placement, zone flows, the conflict rules, editor fields and the geometry against circuits 2–6, and a demo setup "Combined storage" exists.

## Phase 2 – wood stove feeding the storage (#36)

**Keys:** `stove_temp`, `stove_pump`; option `stove_fire_temp` (°C, default 60) above which the fire is drawn burning.

**Drawing:** a stove below the storage column with its own flow into the upper heating zone and its return from the bottom of the buffer or the combined storage. Without a buffer or combined storage the stove is not drawn and the editor explains why.

**Geometry:** the space below the storage column is shared with the bypass/series buffer and with the risers of circuits 2–6. Under option A a geometry spike decides the routing first; under option B the stove is a component in the generator column and the lanes are already defined.

**Done when:** the block is absent without its entities, works in all layouts, is keyboard accessible (one tab stop, tap opens `stove_temp`), animates only while the stove pump runs, and has demo and self-test coverage.

## Phase 3 – second heat generator in hybrid systems (#51)

**Blocked** until a reviewed diagnostic report from a real hybrid installation (for example Intergas Xtend with ESPHome) shows the boiler's states and power values.

**Proposed model** (to be confirmed with that data): keys `boiler_state`, `boiler_power`, optional `boiler_flow`; a normalised mode `hp_only`, `boiler_only` or `both`; first the boiler in series on the flow pipe between heat pump and valve, separate from the inline heater rod; later the boiler in parallel into the buffer or combined storage. Whether the boiler also heats DHW is decided from the data, not assumed.

## Standby loss of the hot-water tank (#32)

Shipped separately as the tile `dhw_loss` (cool-down in K/h from verified standby windows of the recorder history). With `storage: combined` the upper zone also loses heat to the lower zone while circuits draw from it, so phase 1 has to decide whether windows with running circuit pumps are excluded or the tile is marked approximate for combined storage. A loss in W or kWh per day needs the tank volume and is a possible follow-up (`dhw_volume`).

## Order and releases

| Step | Content | Release | Depends on |
| --- | --- | --- | --- |
| 1 | 0a safety net (snapshot + combination harness) | patch | – |
| 2 | 0b flow model, no visual change | minor, right after a release, short contributor freeze | step 1 |
| 3 | 0c storage column as components + phase 1 combined storage | next minor | step 2 |
| 4 | Decision point: stop after 0c, or 0d for phases 2/3 | – | demand after phase 1 |
| 5 | Phase 2 wood stove | following minor | step 3 (A) or 0d (B) |
| 6 | Phase 3 second heat generator | when data is available | reviewed diagnostic report |

Each step is one pull request with its changelog fragment. Umbrella issues stay open while only part of the scope is delivered, as described in [CONTRIBUTING.md](../CONTRIBUTING.md).
