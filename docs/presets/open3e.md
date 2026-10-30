# Viessmann Vitocal (Open3E)

Preset `open3e`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-flow-card
preset: open3e
hc_type: radiator
```
For the [Open3E Home Assistant integration](https://github.com/MojoOli/open3e-ha), which connects to the Open3E server over MQTT. The server communicates with the Vitocal over CAN. The preset uses the integration's entity-registry translation keys, so entity IDs and the Home Assistant language do not matter. If you have multiple Open3E devices, set `device:` to the Vitocal device ID.

It maps the refrigeration-circuit mode, compressor and diverter valve; system electrical and thermal power; flow and return temperatures; DHW and buffer temperatures; and the first heating circuit, room temperature, and target. Daily COP and energy sensors, compressor and additional-heater counters, and available refrigerant sensors are mapped as well. Open3E's `hot_water` valve state is recognized as DHW operation. Add a power meter if your installation does not expose `power_consumption_system`.
