# Development plan

This plan keeps correctness and supportability ahead of new surface area. Impact is the expected benefit across installations; effort is relative (`S` local, `M` several code paths, `L` public API or data logic, `XL` architecture or a second layout).

## Current status after 0.15.0

Version 0.15.0 is released ([milestone](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/8)); it is about onboarding and polish. A new card without a supported integration shows a start hint instead of a Lambda fallback ([#142](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/142)); with two integrations for one heat pump the richer preset wins ([#143](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/143)) and the editor lists the detected presets first ([#145](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/145)). The editor names what each field expects ([#180](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/180)), checks every mapping ([#192](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/192)), offers fitting entities first ([#194](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/194)), shows the core fields first ([#193](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/193)) and names disabled entities ([#146](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/146)); the diagnostic report says what the detection looked for and where each mapping comes from ([#147](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/147)). Every preset has its own outdoor-unit drawing (Wolf, Kronoterm, Alpha Innotec, Stiebel Eltron, Panasonic with two fans), heater rods can sit at three heights, an older copy of the card is reported ([#171](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/171)), Slovak and Czech are built in, the Open3E preset is confirmed on a real installation with two heating circuits ([#168](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/168)), the Stiebel Eltron ISG preset on a WPMsystem ([#154](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/154)), and the README starts with five steps and a troubleshooting table ([#148](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/148), [#204](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/204)).

Next ([milestone 0.16.0](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/9)): preset gaps found in reports, each waiting for data from the reporter (Bosch/Buderus Home Comfort pumps [#195](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/195), the ViCare hot-water signal of the Vitocal 250 [#196](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/196), two ebusd entity sets [#197](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/197)), the house drawing with a room overview per circuit ([#140](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/140)) and a guided setup without a preset ([#149](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/149)), to be decided once the 0.15 editor is in use. After 0.15.0 the presets are announced in the communities of their integrations.

Version 0.14.0 is released ([milestone](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/7)). It delivers sprints 1 and 2 of the storage topology plan ([TOPOLOGY.md](TOPOLOGY.md)): the snapshot and combination test and one flow model ([#111](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/111)), one water loop without a parallel buffer ([#124](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/124)), combined storage and the hot-water preparation `dhw_type` ([#50](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/50)) and the edge cases found afterwards ([#134](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/134)). It also brings `valve_map` to the visual editor ([#126](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/126)), the value maps and hydraulic options in the diagnostic report ([#125](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/125)), the fixes from [#129](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/129) and [#135](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/135), and the Wolf preset confirmed with `wolf_smartset` ([#128](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/128)). The boiler in series (phase 3a) waits for data from a hybrid installation ([#51](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/51)); the decision point for the rarer variants is not reached.

Version 0.13.1 is released ([milestone](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/6)). It fixes the heating circuit that was not drawn with a buffer and no circuit entity ([#118](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/118)), the myPyllant detection with numbered entity ids and the zone thermostat as room ([#120](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/120), first two points) and two Wolf `wolf_smartset` mappings ([#119](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/119)). The rest of #120 (heating pressure, operating hours and starts of the device) waits for a second installation.

Version 0.13.0 is released ([milestone](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/5)). It ships the presets Stiebel Eltron ISG ([#69](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/69)) and Bosch/Buderus Home Comfort ([#68](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/68)), the `wolf_smartset` integration for the Wolf preset, the primary pump of the heat pump, the fan speed and the series buffer with a defrost bypass valve (from the contributor PRs [#95](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/95), [#96](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/96) and [#97](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/97), later also for Samsung and Kronoterm), the heating curve shift, the PV surplus mode with a timeline kind and a share tile ([#108](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/108), mapped for the Lambda E-Manager), `valve_map` ([#109](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/109)), the DHW standby-loss tile ([#32](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/32)), power sources that are left out when the installation does not have them ([#102](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/102), [#103](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/103)) and the framework for built-in languages beyond English and German ([#98](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/98), [#101](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/101)). The new presets ship as untested until a real installation confirms them. The storage topology plan ([TOPOLOGY.md](TOPOLOGY.md)) was written during this release; its first steps are not part of it.

Version 0.12.0 ([milestone](https://github.com/Sturmi77/heatpump-hydraulic-card/milestone/4)) shipped the presets for Wolf, Kronoterm, ebusd ([#24](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/24)), Open3E, Luxtronik ([#75](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/75)) and Samsung, up to six heating circuits ([#33](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/33)), the circuit return label ([#63](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/63)), room temperature per circuit, the HeishaMon fixes ([#56](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/56)), the weekly upstream watch for the preset integrations and the changelog-fragment workflow. The new presets ship as untested until a real installation confirms them; [#75](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/75) stays open for that.

Version 0.11.0 shipped environmental energy [#26](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/26), compressor cut-out counters [#35](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/35), timeline marks for badges such as Boost, and the Panasonic, Viessmann, Bosch/Buderus, Saunier Duval and Samsung EHS Mono unit drawings (part of the umbrella issue [#5](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/5), which stays open for the remaining brands). Version 0.10.0 shipped [#22](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/22), [#29](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/29), [#30](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/30) and [#37](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/37).

The immediate work is evidence gathering rather than another broad feature release:

1. Recruit real-installation testers through [#1](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/1) for Viessmann, Vaillant and EMS-ESP. HeishaMon's default MQTT mapping is now [confirmed on a real installation](https://github.com/heishamon/HeishaMon/discussions/1025#discussioncomment-19174931); additional Aquarea models and generations remain useful coverage. Treat findings as bug fixes before feature work.
2. Ask for real-installation reports for the new presets (Open3E, Luxtronik, Stiebel Eltron ISG, Bosch/Buderus Home Comfort; Wolf is confirmed with `wolf_smartset` since [#128](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/128), `wolflink` reports remain welcome) and review the upstream-watch issues (label `upstream-change`) each week, so renamed entities in the integrations show up before users report them. The reporters of [#69](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/69) and [#109](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/109) were asked to try the new release.
3. Use diagnostic reports and verified integration data to unblock pump/runtime mappings ([#31](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/31)) and the ebusd follow-up for older brine heat pumps ([#82](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/82)). The circulation time windows ([#34](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/34)) and the energy balance of the DHW loss from heat meters ([#114](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/114)) are set aside until someone provides a data set.

## Next low-risk work

1. Treat the remaining brand drawings in [#5](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/5) as one brand per change, each with its own visual and browser checks and original references. Every preset now has its own drawing (Wolf CHA in #156, Kronoterm ADAPT in #157, Alpha Innotec Hybrox in #158, Stiebel Eltron WPL-A in #159). Open candidates: the other Luxtronik brands (Novelan, Roth, Siemens, Elco, Nibe) if their units differ enough; air units only, brine and water units keep the loop symbol.
2. Map the cut-out counters of [#35](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/35) in presets only from verified integration or installation data.

Multiple entities per key [#23](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23) remains a separate later sprint because it changes entity resolution, calculations and the editor contract. Recorder- and time-window-based features stay outside this small-work track unless a real data set backs them; 0.13.0 added two (the PV surplus share and the DHW standby loss), each with conservative exclusion rules and documented limits.

## 0.10.0 – hydraulic clarity and small visual additions

The compact follow-up sprint is released in 0.10.0:

| Order | Issue | Scope | State |
| --- | --- | --- | --- |
| 1 | [#22](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/22) | Brine and heating pressure with unit conversion, thresholds, tiles, details and accessible status. | Released in 0.10.0 and closed; automated tests added. |
| 2 | [#29](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/29) | Optional middle sensors for three-point DHW and buffer gradients. | Released in 0.10.0 and closed; two-sensor behaviour retained. |
| 3 | [#30](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/30) | Restrained defrost vapour for all air-source unit styles. | Released in 0.10.0 and closed with animation and reduced-motion controls. |
| 4 | [#37](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/37) | Theme-aware column-radiator emitter. | Released in 0.10.0 and closed as the sprint stretch item. |

The HACS, quality, Chromium and Firefox checks passed before release, including 480 browser self-tests. Real-installation testing remains a follow-up as soon as suitable testers respond. [PR #16](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/16) remains contributor-owned and untouched.

## 0.9.6 – support and presentation

This minor adds the support and presentation features that make broader real-installation testing practical:

| Order | Issue | Scope | State |
| --- | --- | --- | --- |
| 1 | [#7](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/7) | Local diagnostic report for preset/entity/state feedback. | Included in 0.9.6; browser self-test passed. |
| 2 | [#9](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/9) | Accessible full-screen overlay without a second card instance. | Included in 0.9.6; browser self-test passed. |
| 3 | [#11](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/11) | Stable custom text/language map with English fallback. | Included in 0.9.6; self-test and reference documentation complete. |
| 4 | [#13](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/13) | Fixed night and high-contrast card themes. | Included in 0.9.6; self-test and visual review passed. |

JavaScript syntax, browser self-test and visual checks across the three card themes passed before release. Real-installation tests were the follow-up; HeishaMon's default MQTT mapping has since been [confirmed on a real installation](https://github.com/heishamon/HeishaMon/discussions/1025#discussioncomment-19174931), while Viessmann, Vaillant and EMS-ESP still need suitable testers. The diagnostic report is the preferred, privacy-reviewed input for that outreach and for preset issues.

[PR #16](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/16) remains with its contributor and is not modified or absorbed here. It can be reassessed after the requested contributor changes arrive.

## 0.9.5 – stabilization and quick wins

Ship the first feedback fixes after 0.9.3 together with the small, self-contained improvements below. The planned 0.9.4 work is included in 0.9.5; there is no separate 0.9.4 release.

| Order | Issue | Scope | Impact | Effort |
| --- | --- | --- | --- | --- |
| 1 | [#18](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/18) | Close the hydraulic path of a direct system and fall back from circuit temperatures to heat-pump flow/return. | High | S–M |
| 2 | [#17](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/17) | Give object-form quick controls to the editor as entity ids and preserve their name/icon metadata. | Medium–high | S–M |
| 3 | [#19](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/19) | Explain missing Energy-dashboard power sensors, document signs and assign one missing source the unexplained remainder. | High | M |
| 4 | [#21](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/21) | Support text error sensors through a configurable list of no-error states while preserving numeric/binary behaviour. | High | M |
| 5 | [#20](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/20) | Explain that total counters need the same start time and that environmental energy is not delivered heat. | Medium–high | S |

Release gate:

- JavaScript syntax check, HACS validation and browser self-test pass.
- Every fix above has a regression test and English/German editor or README guidance where applicable.
- [PR #16](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/16) stays outside this release. It must be rebased after the repository/file rename, resolve the requested cooling-mode change and report green checks before merge.
- No counter-offset option in 0.9.5: silently offsetting unrelated totals could hide a wrong measurement window. Home Assistant helpers remain the explicit remedy.

## Quick wins in 0.9.5

1. Close [#8](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/8) and [#10](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/10), shipped in 0.9.3.
2. Add the utility-lock badge example from [#28](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/28).
3. Show the already computed source spread on the source loop ([#25](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/25)).
4. Add animation mode and speed controls ([#6](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/6)).
5. Split the independent requests in [#14](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/14) into [#29](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/29), [#30](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/30), [#33](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/33), [#36](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36) and [#37](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/37), and [#28](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/28) into [#31](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/31), [#32](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/32), [#34](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/34) and [#35](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/35).

Pump counters remain follow-up work in [#31](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/31): the open presets do not currently provide verified, unambiguous entity semantics and units for heating-circuit or source-pump hours/starts. No guessed mappings are shipped. The tester and preset meta issues will be updated after the separate Samsung contribution is ready to merge.

## Storage topology

Combined/layered storage ([#50](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/50)), the wood stove ([#36](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36)) and a second heat generator ([#51](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/51)) share one plan: [TOPOLOGY.md](TOPOLOGY.md). Weighted by prevalence, the card already covers about three quarters of installations, and combined storage plus a boiler in series bring it to about 90 %. The plan therefore starts with what helps in every case – a geometry snapshot test with a generated combination test, then one flow model – and adds combined storage (phase 1) and the boiler in series (once a hybrid installation has supplied data) as fixed slots. An internal component model for the drawing is decided only before the rarer variants (wood stove, boiler in parallel), when further hydraulic requests justify it. Sprints 1 and 2 of the [sprint plan](TOPOLOGY.md#sprint-plan) shipped with 0.14.0: the snapshot and combination test and the flow model ([#111](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/111)), one water loop without a parallel buffer ([#130](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/130)), combined storage and `dhw_type` ([#133](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/133)) and the edge cases found afterwards ([#134](https://github.com/Sturmi77/heatpump-hydraulic-card/pull/134)). The boiler in series (phase 3a) waits for a diagnostic report of a hybrid installation, requested in [#51](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/51).

## Larger feature priority

| Rank | Issue | Impact | Effort | Reason / dependency |
| ---: | --- | --- | --- | --- |
| 1 | [#23 Multiple entities per key](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/23) | High | L–XL | Broad value but changes resolution, editor and calculation contracts. |
| 2 | [#27 Seasonal brine minimum](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/27) | Medium | M–L | Valuable for ground sources; needs recorder, season and date logic. |
| 3 | [#4 Phone layouts](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/4) | High | XL | Use feedback from the full-screen view before maintaining a second schematic geometry. |

## Deferred or demand-driven

- [#3 History replay](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/3): benefit is unproven and implementation is XL.
- Remaining brand drawings in [#5](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/5): one brand per issue when original references are available.
- [#36 wood-stove topology](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/36): phase 2 of the [storage topology plan](TOPOLOGY.md).
- [#34 circulation time windows](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/34) and [#114 DHW loss from an energy balance](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/114): require real entity samples (no integration is known to expose the program times; the balance needs heat meters and the tank volume).
- [#15 Video promotion](https://github.com/Sturmi77/heatpump-hydraulic-card/issues/15): operational work after a stable patch release and HACS default listing.
