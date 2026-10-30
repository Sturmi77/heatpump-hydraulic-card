# Bosch, Buderus, Junkers, Nefit, Worcester, Sieger, elm.leblanc, iVT (EMS-ESP)

Preset `emsesp`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-flow-card
preset: emsesp
```
For heat pumps on the EMS bus via the [EMS-ESP](https://github.com/emsesp/EMS-ESP32) gateway with Home Assistant MQTT discovery. The entity ids come from the EMS-ESP short names (`boiler_hpactivity`, `boiler_hptc1`, …), so the EMS-ESP language does not matter for the ids. An instance prefix from the "multiple instances" entity format (e.g. `sensor.ems_esp_boiler_…`) is detected automatically. Compressor activity texts are understood in English and German.

What you get:
- compressor activity (heating, hot water, cooling, defrost) as the mode
- compressor running, 3-way valve, current compressor power
- heat carrier flow and return (TC1/TC0, falling back to the boiler flow and return)
- flow rate PC0
- air inlet (TL2), or brine inlet and outlet for ground source heat pumps (`source_type: brine`)
- auxiliary heater status as the backup heater
- outdoor temperature
- DHW temperature, target and circulation
- mixer circuit 1 flow and pump
- thermostat room temperature and target
- details: compressor operating time and starts, total energy consumed and supplied, compressor speed, refrigerant temperatures (PL1, PH1, TR3, TR5, TR6)

Without a heat output sensor, the heat output is estimated from flow rate × spread. With `hc_count: 2` (up to 6) the mixer and thermostat entities of the further circuits are added; `index: {hc: 2}` starts at circuit 2 instead.
