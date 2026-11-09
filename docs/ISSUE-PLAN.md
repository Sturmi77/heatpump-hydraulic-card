# Issue plan for the roadmap draft

**GitHub assignments · 3 November 2026, updated on 9 November after 0.19.0-beta.2.** The milestone table records the assigned issues, including three lead issues. The recommendations below give the scope and evidence for each item. A field report can belong to a milestone without committing an entire preset or layout to that release. [Roadmap and milestone criteria](ROADMAP-DRAFT.md) · [Open issues](https://github.com/Sturmi77/heatpump-hydraulic-card/issues?q=is%3Aissue+is%3Aopen)

## Pull requests

| PR | State at review | Proposed treatment |
| --- | --- | --- |
| [#370 · Full screen in nested dashboard popups](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/370) | Contributor PR from a fork. Reviewed on 8 November with seven suggestions (a popover around backdrop and card, taps in a Home Assistant dialog above the card, double dimming). The fork's checks wait for approval. | Wait for the author's update, then approve the checks and test with a real more-info dialog. Not needed for 0.19.0. |

Everything up to `0.19.0-beta.2` is merged. Since then `main` has #364 (heat of `units`, flow rates with `narrow_values`), #368 (myPyllant power of the split unit), #369 (boiler flow label) and #371 (valve position at a standstill), none of them in a pre-release yet.

## GitHub milestones

| Milestone | Assigned issues | Scope |
| --- | --- | --- |
| [0.18.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/11) | closed | Released on 4 November. |
| [Field baseline (0.18.x)](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/13) | #298 (lead), #1, #254 (#282 done) | Supported-preset cohort and field confirmations. Daikin is a separate exploratory pilot outside the cohort. |
| [0.19.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/14) | #300 (lead), #23, #4, #365, the beta reports #344, #349, #359, #360 (done: #289, #290, #323–#327, #333, #338, #346, #357, #361, #367) | Cycle details, circuit spread, complete heat/power pairs on a real cascade, display units and the phone readability trial. Moved ahead on 4 November, see [order](ROADMAP-DRAFT.md). |
| [0.20.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/12) | #299 (lead), #173 (second unit `target: buffer`) (#269 done) | Installation confirmation, chosen from the field baseline. |
| [Later](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/15) | #12, #27, #31, #36, #82, #101, #114, #195, #224, #248, #250, #252, #253, #255, #256, #260, #261, #267, #276, #309, #315–#318, #322, #331, #366 | Open follow-ups with no release commitment. For analytics, take #27 before #114. |

## Lead issues

| Order | Issue | Acceptance evidence |
| --- | --- | --- |
| 1 | [#298 · Measure first setup on real installations](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/298) | A short voluntary field-test form linked from #1, a versioned ten-installation cohort, and a published baseline with unsuccessful and pending cases. Record setup time, manual fields, YAML and confirmation of the actual flow path. |
| 2 | [#300 · Show measurements for a selected operating cycle](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/300) | Extend the existing timeline selection with heating and DHW run details. Match two real recorder traces, label mode-only phases and partial runs, and leave unsupported measurements empty. |
| 3 | [#299 · Confirm ambiguous hydraulic layouts in the editor](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/299) | Choose the first prompts from milestone 1 evidence; this milestone now follows the cycle details (0.20). Provide preview, skip, cancel and explicit save. Compare fresh setup outcomes with the baseline and test existing overrides. |

## Plan for 0.19.0 · Understand a cycle

Agreed on 4 November after the mockup of the run details. One pull request per step, each with self-test, topology test, changelog fragment and README. Steps that change the same code run one after the other, each from `main` (no stacked pull requests). During the field test ([#298](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/298)) preset detection and the setup path stay unchanged; display options do not affect the measurement. State as of 9 November.

| Phase | Step | Issue | Content | State |
| --- | --- | --- | --- | --- |
| 0 · Housekeeping | 1 | [#321](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/321) | Field-test form, milestones swapped, #289 and #4 moved. | done |
| | 2 | [#254](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/254), [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173), [#322](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/322) | Replies; condensate tray heater to Later; Luxtronik in the upstream discussion. | done |
| 1 · Bugs and presets | 3 | [#323](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/323) | ESPAltherma: no derived superheat, evaporation from `low_pressuret`. | done ([#328](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/328)) |
| 2 · Runs and the detail panel | 4 | [#324](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/324) | Runs from the compressor, phases without one, partial runs at the window edges. | done ([#329](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/329)) |
| | 5 | [#325](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/325) | Detail panel under the timeline; `timeline_details`. | done ([#335](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/335)) |
| | 6 | [#326](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/326) | Values per run for hot water and heating, fetched for the run window only. | done ([#335](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/335), review follow-ups [#339](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/339)) |
| 3 · Measurements | 7 | [#290](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/290) | Circuit spread tiles; the run details use the same rule since [#326](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/326). | done ([#340](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/340), review fixes [#345](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/345)) |
| | 8 | [#23](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23) | Several entities per key: averages for temperature and humidity, rules for units and missing values. | done ([#341](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/341), review fixes [#345](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/345)); `env_power` and a multi-entity picker are left for later |
| | 9 | [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) | Cascade: power and heat of both units through [#23](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23), per-key entries stay possible, no system COP with a unit missing. | done ([#343](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/343): `units` with power and heat per unit, [#352](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/352): `heat_max_age`); beta feedback: with `units` the heat comes from the units only ([#364](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/364)) |
| | 10 | [#327](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/327) | Energy and COP per run, only where power and heat cover the run. | done ([#347](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/347)) |
| 4 · Independent | 11 | [#289](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/289) | Flow rates in l/min as a display option. | done ([#348](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/348)) |
| | 12 | [#4](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4) | Phone readability: `narrow_focus` by n42net. | done ([#330](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/330)) |
| | 13 | [#365](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/365) | Beta feedback from [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173): opt-in `run_signal`, run bounds from unit power and the kind from the valve where the mode updates only hourly. Does not block the release; moves to 0.20.0 if the field answers come late. | specified: the answers from [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) are in the issue (8 November), not built |
| 5 · Acceptance and release | 14 | [#300](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/300) | Compare the run details with recorder traces of at least two installations (the maintainer's Lambda, the cascade in [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) or the Daikin in [#254](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/254)); then release 0.19.0. | in progress: the Lambda is checked against its counters ([#353](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/353) came out of it); the cascade in #173 reports runs on beta.2, whose bounds follow hourly signals there (→ #365) |

### Open before 0.19.0 final

State on 9 November. The self-test (1973 checks), the coverage, i18n and link checks pass on `main`.

1. **Bug from the beta cohort:** [#349](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/349) – EMS-ESP with long entity names: the heat total takes a counter that equals the heater rod's energy on a Nefit EnviLine, so the total COP reads 0.1; the split counters of heat and electricity are missing under their long names. The compressor hours of the same report are fixed since beta.1 (#333).
2. **One rule for "compressor on":** the timeline segments, the runs and the live view read a compressor state each in their own way (for example `0.00`, or a text such as `standby`), so the timeline can show heating while the live view shows the compressor off.
3. **Decide #365:** build `run_signal` for the final or move it to 0.20.0.
4. **Second installation for #300**, or a decision to release with the Lambda and the cascade traces.
5. Changes since beta.2 (#364, #368, #369, #371) in a third beta or directly in the final; release notes with the Polish translation (#342), which had no changelog line.

## Scope and follow-up by issue

### Correct the hydraulic view and follow up field reports

The 0.18 items (#34, #283, #291) are closed; #282 confirmed ViCare with a charging signal. The temperature-based ViCare fallback of #286 still needs a unit without that signal.

| Issue | Recommendation |
| --- | --- |
| [#344 · Vitocal shared pump](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/344), [#359 · OpenEMS SG-Ready](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/359), [#360 · Flow rates on phones](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/360) | Fixed in beta.2 or on `main`; close with the 0.19.0 release once the reporters had a chance to confirm. |
| [#349 · EMS-ESP long names](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/349) | Fix before the final: no heat total that is smaller than one of its split counters (no wrong total COP), and the long names of the split counters for the tiles. The blank card without `preset` shows the start hint by design (#142); the card picker proposes the preset. |
| [#195 · Home Comfort pumps](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/195) | Keep evidence-dependent. Obtain the Home Comfort PC0/PC1 resource keys and compare WP and circuit flow when only PC1 runs. The EMS-ESP mapping in #297 covers a different integration. |

### Measure setup and simplify the editor

| Issue | Recommendation |
| --- | --- |
| [#1 · Call for testers](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/1) | Keep as the recruitment entry point. Link the milestone 1 protocol, request underrepresented configurations and report trial results in the new lead issue. |
| [#269 · Heating-circuit remapping](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/269) | Closed: the existing start index and count cover the contiguous Open3E circuits 2–4. Use it as an example for the 0.20 prompts. Consider arbitrary reordering only if a different installation requires it. |
| [#4 · Phone layout](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4) | `narrow_focus` by n42net is in beta.1 (#330); close with 0.19.0. Use it in the 0.20 usability checks as well. Decide about a separate portrait schematic after observing phone use. |
| [#289 · Flow units](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/289) | Done in #348 (`flow_rate_unit`). |
| [#276 · Panasonic suggestions](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/276) | Keep as field evidence for #289 and #290. The missing spread and the grey timeline came from a select mapped as `mode`; the editor flags that since #304. Close the umbrella once the reporter confirms and both requests are tracked. |

### Make measurements useful in an operating cycle

| Issue | Recommendation |
| --- | --- |
| [#290 · Circuit spread](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/290) | Done in #340: tiles `hc_spread` … `hc6_spread`; the heating-run details use the same rule. |
| [#23 · Multiple entities per key](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23) | Done for 0.19 in #341: room temperature and humidity average a list, power and heat sum it, an incomplete sum gives no COP. Close with 0.19.0; `env_power`, minimum/maximum and a multi-entity picker stay demand-driven. |
| [#173 · Cascade power and COP](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) | `units` with `heat_max_age` shipped in the betas and is in use on the reporting cascade. The issue stays open in 0.20.0 for the second unit's own target (`target: buffer`); run bounds from fast signals are #365. |
| [#31 · Pump counters](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/31) and [#260 · Second fan speed](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/260) | Accept opportunistic detail mappings once states, units and a tester are available. They do not determine the cycle milestone. |
| [#27 · Seasonal brine minimum](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/27) | First analytics follow-up after cycle details. Show the minimum and its date only with valid seasonal statistics. |
| [#114 · DHW energy balance](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/114) | Follow #27. Pilot with a household that meters heat in, auxiliary input where present, and draw-off over the same interval. Keep the existing temperature-loss measurement separate. |

### Grow preset coverage with field evidence

| Issue | Recommendation |
| --- | --- |
| [#12 · Preset wishlist](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/12) | Keep as intake. Rank candidates by a willing tester, usable entity data and a repeatable mapping. Track first-setup results per integration and model. |
| [#254 · Daikin Altherma](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/254) | First pilot. The `espaltherma` preset (#306) is confirmed for heating and a hot-water charge on the reporting EPRA12EAV3 and marked as tested since beta.1; the refrigerant values follow the pressure saturation temperatures (#323). Track Onecta separately. |
| [#82 · Older ebusd brine units](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/82) | Continue from the existing `ehp` mapping once the entity list and mode meanings are confirmed. |
| [#253 · NIBE](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/253) and [#255 · Mitsubishi](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/255) | Candidate queue. Pick a specific local or cloud integration, obtain states and units, and recruit an operator for mode checks before assigning a version. |
| [#256 · Viessmann Optolink](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/256) | Start with a verified example profile from the submitted splitter configuration. User-defined MQTT names limit automatic detection across installations. |
| [#101 · Translations](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/101) | Continue as contributor-led work. Include new prompts and cycle details in the existing translation workflow. |

### Defer additions to the schematic

| Issue | Recommendation |
| --- | --- |
| [#248 · Pool](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/248) | First candidate for a new consumer after the three product milestones. Request a charging signal and a real pipe layout because pool mode can currently appear as space heating. |
| [#36 · Wood stove](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36), [#250 · Ventilation](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/250) and [#267 · Domestic-water side](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/267) | Hold for a field diagram, sensors, and a question the addition would answer in operation. Revisit layout architecture if several variants qualify. |
| [#224 · Indoor enclosure](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/224) | The pump evidence is used in #297 (credited in the issue). Park the enclosure itself until it clarifies an operator decision. |
| [#261 · Resizable segments](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/261) | Park per-segment controls. Use the #4 phone trial to identify which components actually need more space. |
| [#252 · House load and wallbox](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/252) | Keep in Later. The current roadmap focuses on the heat pump's own supply and consumption. |
