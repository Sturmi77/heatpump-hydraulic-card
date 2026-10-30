# Viessmann Vitocal (ViCare)

Preset `vicare`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-flow-card
preset: vicare
hc_type: radiator
```
Entities are found through the entity registry (platform `vicare` + translation key), so entity ids and the HA language don't matter. If you have several Viessmann devices, pick one with `device:` (device id, or use the editor).

What you get:
- flow and return of the secondary circuit
- source temperature and flow rate
- DHW tank top and bottom, buffer
- compressor phase, with DHW recognised via "DHW charging"
- compressor running and circulation pump
- COP heating and DHW, energy today, compressor starts
- details: compressor hours and starts, heater rod hours, compressor modulation, inlet/outlet temperatures and pressures, liquid line, subcooling and superheat

ViCare has no live electrical power, so add `power` from a meter if you have one; the heat output is estimated from flow rate × spread. For a Vitocal with a ground source, set `source_type: brine`: the primary circuit supply and return become brine in and out. Circuits 2 and 3 share the same translation keys in ViCare, so map their entities manually (`hc2_flow`, …).
