# Open3E preset (Viessmann Vitocal)

For the [Open3E Home Assistant integration](https://github.com/MojoOli/open3e-ha), which connects to an Open3E server over MQTT. The server communicates with the Vitocal over CAN. The preset resolves entities through the integration's translation keys, so entity IDs and the Home Assistant language do not matter. Set `device:` when multiple Open3E devices are present.

## Mapped

- Refrigeration circuit mode, compressor, diverter valve, system electrical and thermal power, flow and return temperatures, primary inlet temperature, outdoor temperature and water pressure.
- DHW tank levels, target and status; heating buffer temperature and mode; additional heater.
- Heating circuits: `flow_circuitN_temperature`, `flow_circuit_N_supply_temp_setpoint`, `circuit_N_pump`, `climate_circuit_N` and `roomN_temperature`. The preset maps each circuit independently.
- COP and energy for today, compressor and additional-heater counters, and available refrigerant measurements.

`hc_count` can be set when the automatically detected circuit count needs adjusting. Configure each circuit's emitter separately, for example:

```yaml
hc_count: 2
hc_type: radiator
hc2_type: underfloor
```

The Open3E `hot_water` valve state is recognized as DHW operation. Add a power meter if the installation does not expose `power_consumption_system`.

## Evidence and limits

Entity keys are based on the `open3e-ha` sensor, binary sensor, climate and select definitions listed in [`upstream/open3e.json`](../../upstream/open3e.json). The multiple-circuit mapping was tested with an Open3E installation and is covered by the browser self-test. Circuit count detection depends on the circuit entities exposed by the integration.