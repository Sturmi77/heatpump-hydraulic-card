# NIBE F series (NIBE Heat Pump)

Preset `nibe`. Back to the [README](../../README.md#supported-heat-pumps).

## Setup

```yaml
type: custom:heatpump-hydraulic-card
preset: nibe
```
For NIBE F series heat pumps with the Home Assistant core integration [NIBE Heat Pump](https://www.home-assistant.io/integrations/nibe_heatpump/) (domain `nibe_heatpump`), connected locally over Modbus or through a NIBE gateway: the exhaust air models F370, F470, F730 and F750 and the brine models F1145, F1155, F1245 and F1255. Set `source_type: brine` for a brine model, and `source_type: exhaust` to draw the ventilation ducts on an F730 or F750.

The integration takes each entity id from the coil name of the [nibe library](https://github.com/yozik04/nibe): `BT1 Outdoor Temperature` with register 40004 becomes `sensor.bt1_outdoor_temperature_40004`. The ids stay English in every Home Assistant language and end in the register number. The S series uses the same numbers for other values (40012 is the return temperature on the F series and degree minutes on the S1255), so the preset matches the whole id, not the number alone. A NIBE S series heat pump and the cloud integration myUplink are not covered. If you renamed an entity id, map that field with `entities`.

The preset was built from the coil lists of the nibe library 2.26 (every mapped coil exists in all five F model files) and the entity list of an F470 (#253). It is not confirmed on a running installation yet, so the editor marks it as untested. Reports are welcome, from brine models in particular.

### F370 and F470

The card recognises these two by the model of the Home Assistant device, for example "F470 R 3x400V". In the [installer manual of the F470](https://assetstore.nibe.se/hcms/v2.3/entity/document/880832/storage/ODgwODMyLzAvbWFzdGVy) (IHB EN 2340-1, system diagram, page 18) the condenser is a coil in the lower part of a water jacket, the hot-water tank hangs in that jacket from above, the immersion heater sits between them, and the only circulation pump (GP1) stands in the heating circuit. No water line and no reversing valve lies between heat pump and tank. So on an F370 or F470 the preset

- draws a combined storage with a tank in the tank, the condenser coil with its refrigerant lines, and the exhaust and vented air (BT20/BT21) as the source (`condenser: tank`, `dhw_type: tank_in_tank`, `source_type: exhaust`)
- maps BT2 and BT3 to the heating circuit (`hc_flow`, `hc_return`), GP1 to its pump (`hc_pump`) and the electric addition to the tank (`buffer_heater`); `flow`, `return`, `heater` and `primary_pump_state` stay empty

Any of these can be set in the card configuration, which wins; `storage: separate` gives the former drawing, without the water temperatures. The F370 is included because it shares the register list and the sensors BT18 and BT19 with the F470; its diagram was not available. The F372 shares the register list too, but nothing confirms its hydraulics, so it stays with the general mapping, as do the F730 and F750, which have a normal flow line. If Home Assistant shows no model for the device, the general mapping applies.

What you get:
- the priority (`Prio`, 43086) as the operating mode: HEAT is heating, HOT WATER is hot water, COOLING is cooling, OFF is idle, POOL and POOL 2 count as heating. TRANSFER, which follows a hot-water charge on the F370/F470 and keeps the compressor at the hot-water stop temperature, counts as hot water (#253)
- the compressor from its state (43427): STARTING and RUNNING are on, STOPPED and STOPPING are off
- supply (BT2, 40008) and return (BT3, 40012), outdoor temperature (BT1, 40004); on the F370 and F470 the first two belong to the heating circuit
- the heating medium pump GP1 (supply pump state, 43431) as the primary pump, drawn on the flow next to the heat pump: it runs for heating and for hot water. ON is on; STARTING, 10-DAY MODE and CALIBRATION are not
- the heat source: brine in and out (BT10/BT11, 40015/40016) on brine models, else exhaust air and vented air (BT20/BT21, 40025/40026)
- the internal electric addition from its power (43084, kW): above 0 means on; on the F370 and F470 drawn in the tank
- the hot-water tank top (BT7, 40013) and charging sensor (BT6, 40014)
- circuit 1: the calculated supply temperature (43009) as the target, the room sensor BT50 (40033) where one is fitted and reports a number
- holiday mode (48043, ACTIVE) as the program chip
- the alarm (45001) as the error chip; alarm 183, "defrosting in progress", is no error
- details: compressor frequency (43136) on inverter models (F730, F750, F1155, F1255), evaporator (BT16, 40020) and suction gas (BT17, 40022)

No superheat is derived: BT16 measures the evaporator surface, not the saturation temperature.

## Not mapped

- **Electrical power, heat output, flow rate:** the F series model files have no such coils (the current of the three phases, BE1 to BE3, is no power). Add `power` from a meter. Without a flow rate the card cannot estimate the heat output.
- **Diverter valve:** no coil; hot water comes from the priority.
- **Defrost:** reported only as alarm 183, so the card shows no defrost state of its own. The alarm does not show the error chip.
- **Hot-water target:** the water heater entity has start and stop temperatures (`target_temp_low`, `target_temp_high`) but no single target. A template sensor on `target_temp_high` can be mapped as `dhw_target`.
- **Climate systems 2 to 4:** the preset maps circuit 1. Add `hc2_flow` and the other keys with `entities` for further circuits.
- **Ventilation:** fan speeds and supply air (BT22) are not drawn.
- **BT18, BT19 (F370, F470):** the manual names them the sensors for compressor and immersion heater operation; neither is the water line of the heat pump, so they are not mapped.
- **Shunt valve (QN11):** no coil with its position.
