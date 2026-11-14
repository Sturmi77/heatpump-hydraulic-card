# Issue plan

**GitHub assignments · state on 14 November 2026, with 0.19.0.** The milestone table records the assigned issues, including the three lead issues. The recommendations below give the scope and evidence for each item. A field report can belong to a milestone without committing an entire preset or layout to that release. [Roadmap and milestone criteria](ROADMAP.md) · [Open issues](https://github.com/Sturmi77/heatpump-hydraulic-card/issues?q=is%3Aissue+is%3Aopen)

## Pull requests

No open pull requests. Everything on `main` up to 14 November is in `0.19.0`: since beta.4 [#408](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/408) (local access of the Bosch/Buderus Home Comfort integration 0.9.0, by SoftwareSchmied) and #409 (the flow label next to a boiler on phones, forum).

## GitHub milestones

| Milestone | Assigned issues | Scope |
| --- | --- | --- |
| [0.18.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/11) | closed | Released on 4 November. |
| [Field baseline (0.18.x)](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/13) | #298 (lead), #1, #254 (#282 done) | Supported-preset cohort and field confirmations. Daikin is a separate exploratory pilot outside the cohort. |
| [0.19.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/14) | closed with the release: #300 (lead), #23, #4, #344, #349, #359, #195 (done before: #289, #290, #323–#327, #333, #338, #346, #357, #360, #361, #365, #367) | Released on 14 November: cycle details, circuit spread, complete heat/power pairs on a real cascade, display units and the phone readability trial. |
| [0.20.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/12) | #299 (lead), #173 (second unit `target: buffer`), #395 (stage 3) (#269 done) | Installation confirmation, chosen from the field baseline. |
| [Later](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/15) | #12, #27, #31, #36, #82, #101, #114, #224, #248, #250, #252, #253, #255, #256, #260, #261, #267, #276, #309, #315–#318, #322, #331, #366 | Open follow-ups with no release commitment. For analytics, take #27 before #114. |

## Lead issues

| Order | Issue | Acceptance evidence |
| --- | --- | --- |
| 1 | [#298 · Measure first setup on real installations](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/298) | A short voluntary field-test form linked from #1, a versioned ten-installation cohort, and a published baseline with unsuccessful and pending cases. Record setup time, manual fields, YAML and confirmation of the actual flow path. |
| 2 | [#300 · Show measurements for a selected operating cycle](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/300) | Extend the existing timeline selection with heating and DHW run details. Match two real recorder traces, label mode-only phases and partial runs, and leave unsupported measurements empty. |
| 3 | [#299 · Confirm ambiguous hydraulic layouts in the editor](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/299) | Choose the first prompts from milestone 1 evidence; this milestone now follows the cycle details (0.20). Provide preview, skip, cancel and explicit save. Compare fresh setup outcomes with the baseline and test existing overrides. |

## 0.19.0 · Understand a cycle

Released on 14 November after four pre-releases (6 to 13 November). Agreed on 4 November after the mockup of the run details: one pull request per step, each with self-test, topology test and changelog fragment, each from `main`. During the field test ([#298](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/298)) preset detection and the setup path stay unchanged.

Done: field-test form ([#321](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/321)); ESPAltherma refrigerant values ([#323](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/323)); runs, phases and partial runs ([#324](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/324)); the detail panel and values per run ([#325](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/325), [#326](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/326)); circuit spread tiles ([#290](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/290)); several entities per key ([#23](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23)); cascades with `units`, `heat_max_age` and `power_threshold` ([#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173)); energy and COP per run ([#327](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/327)); `flow_rate_unit` ([#289](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/289)); `narrow_focus` by n42net ([#4](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4)); `run_signal` ([#365](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/365)).

Acceptance ([#300](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/300)): compare the run details with recorder traces of two installations. The maintainer's Lambda is checked against its counters ([#353](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/353) came out of it). The cascade in [#173](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) checked beta.3 on 11 November: run bounds, hot water and the totals match its recorder and counters within a few percent; a unit's standby after a hot-water charge made extra heating runs, fixed in beta.4 ([#401](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/401)) and confirmed by the reporter on 13 November.

Left for later from the field feedback: a heating piece under a minute after a hot-water charge is shown as its own run (cosmetic, reported in #173), counting defrosts from the history ([#407](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/407)), and stage 3 of the drawing tests ([#395](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/395), 0.20.0).

## Scope and follow-up by issue

### Correct the hydraulic view and follow up field reports

The 0.18 items (#34, #283, #291) are closed; #282 confirmed ViCare with a charging signal. The temperature-based ViCare fallback of #286 still needs a unit without that signal.

| Issue | Recommendation |
| --- | --- |
| [#344 · Vitocal shared pump](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/344), [#359 · OpenEMS SG-Ready](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/359), [#349 · EMS-ESP long names](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/349) | Fixed in 0.19.0 (#349 in #375: no heat total smaller than one of its split counters, the long names of the split counters for the tiles). Closed with the release. |
| [#360 · Flow rates on phones](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/360) | Confirmed by the reporter on beta.3 and closed. |
| [#195 · Home Comfort pumps](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/195) | Mapped in 0.19.0 by the integration's maintainer ([#408](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/408)): the primary flow rate PC0, the circuit pump and flow rate PC1 and the 3-way valve, from the source of integration 0.9.0 and compared with a manual configuration on one installation. Closed with the release; a field report on a second installation is welcome. |

### Measure setup and simplify the editor

| Issue | Recommendation |
| --- | --- |
| [#1 · Call for testers](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/1) | Keep as the recruitment entry point. Link the milestone 1 protocol, request underrepresented configurations and report trial results in the new lead issue. |
| [#269 · Heating-circuit remapping](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/269) | Closed: the existing start index and count cover the contiguous Open3E circuits 2–4. Use it as an example for the 0.20 prompts. Consider arbitrary reordering only if a different installation requires it. |
| [#4 · Phone layout](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4) | `narrow_focus` by n42net shipped in 0.19.0 (#330); closed with the release. Use it in the 0.20 usability checks as well. Decide about a separate portrait schematic after observing phone use. |
| [#276 · Panasonic suggestions](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/276) | Keep as field evidence for #289 and #290. The missing spread and the grey timeline came from a select mapped as `mode`; the editor flags that since #304. Close the umbrella once the reporter confirms and both requests are tracked. |

### Make measurements useful in an operating cycle

| Issue | Recommendation |
| --- | --- |
| [#23 · Multiple entities per key](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23) | Done for 0.19 in #341: room temperature and humidity average a list, power and heat sum it, an incomplete sum gives no COP. Shipped in 0.19.0 and closed with the release; `env_power`, minimum/maximum and a multi-entity picker stay demand-driven. |
| [#173 · Cascade power and COP](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/173) | `units` with `heat_max_age` and `power_threshold` and `run_signal: units` shipped in 0.19.0 and are in use on the reporting cascade, which is the second installation for #300. The issue stays open in 0.20.0 for the second unit's own target (`target: buffer`). |
| [#31 · Pump counters](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/31) and [#260 · Second fan speed](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/260) | Accept opportunistic detail mappings once states, units and a tester are available. They do not determine the cycle milestone. |
| [#27 · Seasonal brine minimum](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/27) | First analytics follow-up after cycle details. Show the minimum and its date only with valid seasonal statistics. |
| [#114 · DHW energy balance](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/114) | Follow #27. Pilot with a household that meters heat in, auxiliary input where present, and draw-off over the same interval. Keep the existing temperature-loss measurement separate. |

### Grow preset coverage with field evidence

| Issue | Recommendation |
| --- | --- |
| [#12 · Preset wishlist](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/12) | Keep as intake. Rank candidates by a willing tester, usable entity data and a repeatable mapping. Track first-setup results per integration and model. |
| [#403 · Samsung via EHS Sentinel](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/403) | Proposed for 0.20 (not assigned yet): a variant of the `samsung` preset for the `samsung_ehssentinel_` names, from the reporter's full mapping; asked for the defrost and valve states during a charge. |
| [#402 · Bosch/Buderus local API (K40RF/MX400)](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/402) | Covered by the local access of integration 0.9.0, which the `bosch_buderus_heating` preset reads since 0.19.0 ([#408](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/408)). Local access alone is checked with synthetic data only; close once the reporter has tried it. |
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
