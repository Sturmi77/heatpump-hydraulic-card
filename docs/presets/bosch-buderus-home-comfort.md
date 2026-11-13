# Bosch/Buderus Home Comfort

This preset is for the [Bosch/Buderus Home Comfort integration](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating), domain `bosch_buderus_heating`. It covers the PointT cloud, the local access that integration 0.9.0 added (K40RF/MX400 gateways, read-only), and both together. It is separate from the EMS-ESP MQTT preset.

```yaml
type: custom:heatpump-hydraulic-card
preset: bosch_buderus_heating
```

The preset selects the Bosch outdoor-unit drawing (`unit_style: bosch`). It does not identify the exact outdoor-unit model: the integration reports the controller type, not the heat pump model. Choose another `unit_style` by hand if it fits your unit better, `source_type: brine` for a ground-source installation, and adjust the emitter type to match the installation.

## Setup

```yaml
type: custom:heatpump-hydraulic-card
preset: bosch_buderus_heating
source_type: air        # air (default) or brine
# Indoor units with a buffer cylinder and a primary pump PC0 next to the circuit pump PC1 (for example TP70 units):
buffer: true
primary_pump: true
```

The preset finds the entities through the stable resource identities of the integration in the local entity registry (the card reads the registry once, and only for this preset), so entity names, entity ids and the Home Assistant language do not matter. It only uses enabled entities. With several gateways select the gateway's device with `device`.

The preset does not set `primary_pump` or `buffer`: whether the indoor unit has a buffer cylinder and its own primary pump depends on the installation, and turning the primary pump on for every installation would move the circuit pump of installations without one. With the local access the primary flow rate PC0 drives the primary pump when `primary_pump: true` is set.

What you get with the cloud:
- the operating mode from the compressor status, flow, return and outdoor temperature, heating pressure and compressor modulation
- DHW temperature and target; flow, room temperature and target of the selected heating circuit (`index: {hc: 2, dhw: 2}` selects another one, `hc_count` shows further circuits)
- compressor starts and runtime, electricity, heat and environmental energy totals as tiles (calendar periods from the long-term statistics), the holiday indicator and the fault chip
- quick controls: operating mode of the heating and the DHW circuit and the one-time DHW charge; further controls are opt-in

What the local access adds (integration 0.9.0, entities enabled by default):
- the heat pump's own flow TC1; the supply temperature behind the buffer cylinder then becomes the flow of the first circuit
- the refrigerant circuit status, which also shows a defrost and a passive defrost
- the electric power of the compressor and the auxiliary heater as one sum, so the live power and the running state come from a measurement; the auxiliary heater from its electric power
- the primary flow rate PC0, the circuit pump PC1 and the current supply setpoint
- the outdoor unit's fan (PL3), the air intake temperature TL2 and in the details the refrigerant circuit temperatures TR6, TR5, TR3, JR0 and JR1 and the speed of the primary pump
- from the controller signals: the compressor, the hot water 3-way valve VW1, the heat output of the compressor (so a live COP), the flow rate of circuit 1 (PC1), the expansion valve VR1, and in the details the relay of the primary pump PC0 and the 4-way valve VR4

With the local access alone, without the cloud, the same readings are mapped; the operating mode then comes from the refrigerant circuit status. The local access never writes, so there are no quick controls, and the fault and holiday state of the cloud are not available.

## Evidence and test status

I maintain the Home Comfort integration.

- Cloud mapping: I checked a manual configuration of card version 0.11.0 against live data on my Buderus installation with an MX400 gateway and Home Comfort 0.8.2-beta.7. That check covered the saved mappings and their display. It did not exercise the controls or every operating mode through the card. I also ran the original preset resolver against my entity registry without using current states or making writes; all 15 schematic/detail mappings matched the manual configuration.
- Local access (this revision): I took the keys and their meaning from the [0.9.0 source](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating/tree/9b1e2e05f49e3b5776e54c4675d59a4d8d96e7f2/custom_components/bosch_buderus_heating): the unique ID of a local-only reading in [`local_only_sensor.py`](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating/blob/9b1e2e05f49e3b5776e54c4675d59a4d8d96e7f2/custom_components/bosch_buderus_heating/local_only_sensor.py), the reviewed readings and their default activation in [`local_only.py`](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating/blob/9b1e2e05f49e3b5776e54c4675d59a4d8d96e7f2/custom_components/bosch_buderus_heating/local_only.py), the pairs of cloud and local readings in [`observations.py`](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating/blob/9b1e2e05f49e3b5776e54c4675d59a4d8d96e7f2/custom_components/bosch_buderus_heating/observations.py) and the entities of an installation without the cloud in [`local_plant_view.py`](https://github.com/SoftwareSchmied/ha-bosch-buderus-heating/blob/9b1e2e05f49e3b5776e54c4675d59a4d8d96e7f2/custom_components/bosch_buderus_heating/local_plant_view.py).
- On my installation (an air-to-water heat pump with a buffer cylinder in the indoor unit, MX400 gateway, cloud and local access, integration 0.9.0) I compared these keys with the entity registry without writing anything: every local-access key in the table below is registered and enabled there, except the room temperature (the installation has no room sensor). From its recorded history: the refrigerant circuit status and the cloud's compressor status both reported `defrost` in all eight defrosts between 6 and 10 November; during a hot-water charge the supply temperature behind the buffer read 20.9 °C while TC1 read 51.8 °C; the primary flow rate reports `unknown` below about 1000 l/h.
- This preset revision with the card on my installation: I loaded the build in Home Assistant and compared the preset alone with my previous manual configuration during heating; all mapped entities and the drawing were identical. Defrost (both stages), hot water, standby and the phase with the primary flow rate `unknown` I replayed from recorded states of my installation into the card; the preset and the manual configuration gave the same result.
- Not tested yet: an installation with the local access alone. The integration's documentation and tests describe that case; I have no such installation. The demo setups "Bosch/Buderus Home Comfort (cloud and local)" and "(local only)" and the automated tests use invented identifiers and values.
- The local-only setup therefore stays untested on a real installation; the test status in the README is left to the maintainer.

## Detection and several gateways

Entity names and entity ids can change with language, device renaming or manual edits. The preset resolves the integration's stable `unique_id` resource keys through Home Assistant's local entity registry. It supports the retained `gateway:` identities, current resource-path identities and, since integration 0.9.0, the readings only the local access provides, `<gateway>:local_only:<resource path>` (the path with `:` instead of `/`). The preset tries every resource path in both forms, the cloud's first: when the cloud starts to offer a path, the integration hands the local-only entity over to the cloud's key, so only one of them is registered. The comparison copies of paired readings (`…:source_local`, `…:source_cloud`) are never used.

A gateway is a heat pump when it reports the cloud's compressor status. A gateway with the local access alone has no compressor status; it is recognised by the heat pump type or the refrigerant circuit status of its heat source. This second rule applies only when no gateway reports a compressor status, so cloud installations resolve exactly as before.

Only this preset requests `config/entity_registry/list`. The card and editor share the request within the same Home Assistant connection. The result is refreshed when the frontend entity registry changes; ordinary state updates do not repeat it. This adds no requests to the cloud or the gateway. Gateway identifiers stay in the local resolver and are not written into the card configuration or its diagnostic report.

For state updates, the card and editor share a cache of this integration's enabled entity ids. They check whether those states are present without enumerating every state in Home Assistant. Added or removed entities, renamed entities and changed registry metadata refresh the mappings, including when the number of available entities stays the same.

In the [Home Assistant 2026.10.3 source](https://github.com/home-assistant/core/blob/2026.10.3/homeassistant/components/config/entity_registry.py#L39-L64), the read-only registry list command has no administrator requirement. I have not yet verified this preset in a real non-admin session. If registry access fails, the manual mappings described below remain usable.

When several gateways expose a heat pump, select the gateway's device in the card editor or provide its Home Assistant device id:

```yaml
type: custom:heatpump-hydraulic-card
preset: bosch_buderus_heating
device: YOUR_HOME_ASSISTANT_DEVICE_ID
```

The device selection scopes measurements, counters and controls to one gateway. Without an unambiguous selection the preset leaves automatic mappings empty; a gateway with the local access alone next to a cloud gateway is only used when its device is selected. If the registry request fails, manual `entities`, `controls` and `details` still work. Reload the page to retry after restoring registry access.

The preset covers one heat pump per gateway. Cascades with several reported heat sources and `index.hp` values other than 1 require manual mappings because the available compressor status and energy totals describe the gateway as a whole.

## Mapped values

Keys after `<gateway>:`. "Local" is the form of a reading only the local access provides; the preset also accepts the same path in the cloud's form.

| Card value | Cloud | Local access |
|---|---|---|
| Operating mode | `heatSources:compressor:status` | without the cloud: `local_only:heatSources:hs1:refrigerant:status` |
| Status (defrost, passive defrost) | – | `local_only:heatSources:hs1:refrigerant:status` |
| Running compressor | – | signal `local_only:signals:SRC.CUHP.HMI.CompressorActive`; otherwise `local_only:heatSources:hs1:refrigerant:compressorActualSpeed` (above 0; disabled by default) |
| Diverter valve (VW1) | – | signal `local_only:signals:SRC.CUHP.HP1.DHWValve` (`on` = hot water) |
| Heat output | – | signal `local_only:signals:SRC.CUHP.HP1.CompressorPower` (kW; the compressor's heat output despite its name) |
| Power | – | sum of `local_only:heatSources:compressor:powerElecActual` and `local_only:heatSources:eHeater:powerElecActual` |
| Auxiliary heater | – | `local_only:heatSources:eHeater:powerElecActual` (above 0 W) |
| Flow | `gateway:supply_temperature` when there is no TC1 | TC1: `local_only:heatSources:additionalHeater:flowTemp`; otherwise its signal `local_only:signals:SRC.IntFlowTemp` (disabled by default) |
| Return | `gateway:return_temperature` (TC0) | the same (paired reading) |
| Circuit flow | `heatingCircuits:hcN:actualSupplyTemperature`, if available | first circuit with TC1 and no own sensor: `gateway:supply_temperature` |
| Flow rate (primary, PC0) | – | `local_only:heatSources:hs1:pumpVolumeFlow`; otherwise the signal `local_only:signals:SRC.SystemPumpVolumeFlow` (disabled by default) |
| Circuit flow rate (PC1) | – | first circuit: signal `local_only:signals:SRC.HC1.FlowCtrl.PumpVolumeFlow` |
| Circuit pump (PC1) | – | `local_only:heatingCircuits:hcN:pumpStatus` |
| Circuit setpoint | – | first circuit: `local_only:heatSources:currentSupplySetpoint`; otherwise the signal `local_only:signals:SC.HC1.FlowTempSetp` |
| Fan | – | `local_only:heatSources:hs1:oduFanSpeed` (PL3, %) |
| Air intake | – | `local_only:heatSources:sensors:evaporatorTemp_tl2` (TL2) |
| Outdoor temperature | `gateway:outdoor_temperature` | the same (paired reading) |
| DHW temperature and target | selected `dhwCircuits:dhwN:actualTemp` and `currentSetpoint`; retained DHW1 temperature identity | the same (paired readings) |
| Room temperature and target | selected `heatingCircuits:hcN:roomtemperature` and `currentRoomSetpoint`, if available | room temperature as a local-only reading |
| Heating pressure and modulation | `gateway:system_pressure` and `gateway:modulation`, with resource-path equivalents | the same; modulation falls back to the compressor speed |
| Refrigerant circuit (details drawer) | – | hot gas TR6 `…:refrigerant:hotGasTemp`, suction line TR5 `…:suctionGasTemp`, condenser heating TR3 `…:liquidPipeHeatingTemp`, low pressure JR0 `…:lowPressureTemp` as evaporating and high pressure JR1 `…:highPressureTemp` as condensing temperature; expansion valve VR1, signal `local_only:signals:SRC.CUHP.HP1.ExpansionValveActual` |
| Additional values (Details) | – | speed of PC0 `…:refrigerant:heatCarrierPumpSpeed`, PC0 relay `local_only:signals:SRC.CUHP.HP1.CHPumpRelay`, 4-way valve VR4 `local_only:signals:SRC.CUHP.HP1.FourwayValve` |
| Compressor starts and runtime | `heatSources:hs1:numberOfStarts:total` and `heatSources:hs1:workingTime:total` | the same (paired counters) |
| Electricity, heat and environmental energy | retained gateway identities and `heatSources:emon:totalConsumption` component identities | the same (paired counters) |
| Holiday indicator and fault chip | `holiday_active` and `system_fault` binary sensors | – |

JR0 and JR1 are the saturation temperatures of the low and the high pressure. Their values fit evaporating and condensing on my installation; the manufacturer does not document that assignment.

Use `index: {hc: 2, dhw: 2}` to select a different circuit. Set `hc_count` to show further hydraulic circuits; their individual flow readings and circuit pumps are mapped when the integration supplies them. The supply temperature behind the buffer and the current supply setpoint belong to the heat source and go to the first circuit only. The room display and quick controls refer to the circuit selected by `index.hc`; a missing circuit never falls back to HC1. Set the count explicitly because this preset does not infer it from temperature settings.

The statistics catalog receives total electricity and heat for heating/DHW, total auxiliary electricity, environmental energy, compressor starts by operating mode and total runtime. A complete cooling electricity total is used when available. A compressor-only cooling counter stays in Details: the integration itself derives a total only from the compressor and the auxiliary heater counters together. Calendar-period tiles need the corresponding Home Assistant long-term statistics; cumulative values are never substituted for a daily reading.

Energy counters describe the gateway's complete heating or DHW operation. Selecting `index.hc` or `index.dhw` changes the circuit temperatures and controls; it does not apportion gateway energy totals to that circuit.

General start counts, total system runtime, separate compressor/auxiliary electricity, per-mode runtime, TC3 condenser-outlet water temperature and the speed of the primary pump remain additional values in Details. TC3 is distinct from the refrigerant condensing temperature.

## How the local readings are used

- Running: the compressor signal `on`, the compressor speed above 0 or a power above `power_threshold` (100 W by default) means the heat pump runs. A running compressor wins over a cloud compressor status that still reports `off`: the cloud updates less often than the local access.
- Defrost: the refrigerant circuit status `defrost` or `passive_defrost` shows the defrost, also with the cloud's compressor status.
- Without the cloud the refrigerant circuit status is the operating mode: `idle`, `startup` and `shutoff` are standby, `passive_defrost` is a defrost; `test_mode`, `pool` and `pool_heat` remain raw labels.
- Flow rate: below about 1000 l/h the primary flow rate reports `unknown` (attribute `measuring_range: below`). The card then shows no flow rate and lets the primary pump follow the heating or hot-water loop instead of showing it as stopped; the estimated heat output is not available in that phase.
- Controller signals depend on the gateway's signal list. I have seen some signals of the heat pump disappear from that list for hours and come back; their entities are then `unavailable`. The compressor, VW1 and VR4 were not among them. The preset therefore takes resource paths first wherever one exists, and the power keeps the running state when the compressor signal is unavailable. Without the heat output the live COP is not available, and without VW1 the hot-water side follows the operating mode.
- The integration documents the heat output signal as the compressor's heat output, which matches the heat meter. Live COP is the heat output divided by the summed electric power.
- The power is the sum of the compressor and the auxiliary heater. Without the compressor's own power the preset maps no power, so the auxiliary heater alone is never taken for the heat pump.

## Controls

By default, the preset offers only three controls, when they are available and enabled: the selected heating circuit's operating mode, the selected DHW circuit's operating mode and one-time DHW charge. The duplicate climate/water-heater mode selectors are omitted. No temperature sliders, flow limits, silent mode, auxiliary-heater, season or away controls appear automatically. The local access is read-only and adds no controls.

The editor can change the selection. To add temperatures or other settings, explicitly select their existing entities or provide a `controls` list. Controls use the available `select`, `number` and `switch` entities, with options, bounds and steps supplied by those entities. A configured list replaces the entire preset list, so include any default controls you want to keep. Custom labels and order are preserved; `controls: []` hides all quick controls. Likewise, `details` replaces the preset's additional values and `details: []` hides them. Rendering or updating the card does not call control services.

## Upstream changes

I list the integration files that define resource identities, local-only readings, state values, control availability, units and labels in `upstream/bosch_buderus_heating.json`. The upstream watcher reports changes to those files for review. The recorded source version is Home Comfort 0.9.0; it does not claim an installation test of this preset.

## Deliberate gaps

- The integration reports no return temperature per heating circuit. The card's return is the heat pump's return TC0; a circuit return needs your own sensor in `hc_return`.
- The fan speed is a percentage. The card reads a number as revolutions per minute, so the fan turns while the value is above 0 but its speed barely changes with the value.
- The primary pump PC0 has no input of its own in the card; it follows the primary flow rate. Its relay and speed are shown in Details.
- The 4-way valve VR4 has no input of its own either; the defrost comes from the refrigerant circuit status. VR4 is shown in Details.
- The circuit flow rate is a signal of circuit 1; further circuits get none.
- Without the local access: a cumulative kWh counter is not an instantaneous W measurement, so live COP, heat output and a PV/battery/grid split need your own power and flow sensors.
- An operating-mode setting does not prove a running circuit pump. The preset does not map those settings as pump signals.
- `pool` and `pool_heat` remain raw status labels. They do not animate space heating on a schematic without a pool circuit.
- `alarm` stops compressor animation. The separate `system_fault` entity supplies the fault chip.
- The SG Ready state, the operating modes of the circuits and the DHW and the buffer cylinder have no automatic mapping.
- Gateway metadata, personal identifiers, event timestamps and holiday dates are not automatically added to the hydraulic display.

## Suggested installation checks

After installing a build containing the preset, compare the resolved mappings with an existing manual card. Check heating, DHW, standby, defrost and any available cooling mode; with the local access also a phase in which the primary flow rate reports `unknown`, the live power and the auxiliary heater. Verify the timeline and fault/holiday indicators. Check renamed entities and device selection if several gateways are present. A control test should be a deliberate, reversible change to the intended circuit, followed by verification in Home Assistant and the manufacturer's app. Report which checks were actually performed.
