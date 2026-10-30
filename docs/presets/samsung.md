# Samsung EHS (esphome-samsung-nasa)

Preset `samsung`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-flow-card
preset: samsung
```
For Samsung EHS heat pumps (Mono, Split, TDM) with an ESP32 on the F1/F2 (NASA) bus and Beormund's [esphome-samsung-nasa](https://github.com/Beormund/esphome-samsung-nasa) component. The preset is based on its message mapping and builds on top of it: the entity names come from its `example.yaml` and README, plus the names of the installation the preset was tested on (EHS Mono AE050JXYDEH). ESPHome entity ids are `<node>_<name>`, and the names are set in your own YAML, so the node prefix is detected from the 3-way valve together with the error code (`sensor.<node>_3_way_valve`, `sensor.<node>_error_code`). If you named your sensors differently, map those entities manually; the preset fills in the rest.

What you get:
- outlet and return water temperature, flow rate
- compressor status (or the compressor frequency) and defrost
- 3-way valve (`Room (Heating)` / `Tank (DHW)` as a text sensor, or 0/1 as a plain sensor)
- power consumed and produced (last minute), giving a live COP
- outdoor temperature
- DHW tank temperature and target, booster heater in the tank, backup heater
- zone 1 room temperature and target, water law target as the circuit setpoint
- away (outing) mode as the holiday chip
- error code: "No Error" is fine, any other text shows the error chip
- tiles: energy, heat and COP today from the template sensors of `example.yaml`, totals from the NASA counters
- details: total energy consumed and produced, compressor frequency, discharge temperature, expansion valve

Samsung has no "current activity" value: like HeishaMon, the card shows heating while the compressor runs, hot water when the valve is on the tank, and defrost from the defrost sensor. The primary water pump belongs to the heat pump and runs for hot water as well, so the card draws it on the flow pipe next to the heat pump block (`primary_pump: false` draws the pump in the circuit again) and the heating circuit follows the valve. Some values are not fitted on every unit (no flow sensor, no wattmeter); they stay unknown. Without a wattmeter, add `power` from a meter of your own.
