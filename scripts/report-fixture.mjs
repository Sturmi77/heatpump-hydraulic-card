// Field case from a diagnostic report (#395): a layout bug report becomes a test case of test/topology.html.
//
//   node scripts/report-fixture.mjs <report.txt> --issue <number> [--name "<short description>"] [--set key=value ...] [--write]
//
// The input may be the whole issue text; the report is taken from its first line ("Heat Pump Hydraulic Card diagnostic report")
// on. Without --write the case is printed; with --write it is added to test/field-cases.js (or replaces the case with the same
// issue and name). --set adds card options the report does not list (from the YAML in the issue), e.g. --set hc_type=radiator.
//
// Privacy: entity ids are replaced by neutral ones (sensor.f_<key>), names by placeholders of the same length (the report only
// gives their length), and nothing else of the report is kept. Values, units, value maps and the Energy dashboard sources stay,
// because the drawing depends on them. Review the case before committing it.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const values = (name) => args.flatMap((a, n) => (a === `--${name}` && args[n + 1] !== undefined ? [args[n + 1]] : []));
const file = args[0];
const issue = Number(values('issue')[0]);
if (!file || file.startsWith('--') || !Number.isInteger(issue) || issue < 1) {
  console.error('usage: report-fixture.mjs <report.txt> --issue <number> [--name "<text>"] [--set key=value ...] [--write]');
  process.exit(2);
}

const parseReport =(text, sets = []) => {
  const start = text.indexOf('Heat Pump Hydraulic Card diagnostic report');
  if (start < 0) throw new Error('no diagnostic report in the input');
  // Blank lines are dropped: reports pasted from a rich-text editor have one after every line.
  const lines = text.slice(start).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const head = {};
  for (const l of lines) { const m = /^([A-Z][A-Za-z ]+): (.*)$/.exec(l); if (m && !(m[1] in head)) head[m[1]] = m[2]; }
  const section = (title) => {
    const n = lines.findIndex((l) => l.startsWith(title));
    if (n < 0) return [];
    const out = [];
    for (const l of lines.slice(n + 1)) { if (!l.startsWith('- ')) break; out.push(l.slice(2)); }
    return out;
  };

  const config = {};
  if (head['Card language']) config.language = head['Card language'];
  if (head['Source type'] && head['Source type'] !== 'air') config.source_type = head['Source type'];
  const hcs = Number(head['Heating circuits']) || 1;
  if (hcs > 1) config.hc_count = hcs;
  const storage = Object.fromEntries((head.Storage || '').split(' · ').map((part, n) => (n === 0 ? ['storage', part] : part.split(': '))));
  if (storage.storage === 'combined') config.storage = 'combined';
  if (['fresh_water', 'tank_in_tank'].includes(storage['hot water'])) config.dhw_type = storage['hot water'];
  if (['yes, configured', 'yes, from the heat generator'].includes(storage['parallel buffer'])) config.buffer = true;
  if (storage['series buffer']?.startsWith('yes')) config.series_buffer = true;
  if (storage['series buffer'] === 'yes, no bypass valve') config.series_bypass = false;
  if (storage['primary pump']) config.primary_pump = storage['primary pump'].startsWith('yes');
  if (head.Layout && head.Layout !== 'default') config.layout = head.Layout;
  if (head['Flow rates shown in'] && head['Flow rates shown in'] !== 'l/h') config.flow_rate_unit = head['Flow rates shown in'].replace('m³/h', 'm3/h');
  if (/flow hidden/.test(head['Circuit labels'] || '')) config.hc_flow_label = false;
  if (/return shown/.test(head['Circuit labels'] || '')) config.hc_return_label = true;
  // A name keeps its length: the drawing depends on it, the test does not need the name itself.
  const placeholder = (length, n) => `Placeholder name ${n} ${'abcdefghijklmnopqrstuvwxyz'.repeat(4)}`.slice(0, length).trimEnd().padEnd(length, 'x');
  const option = (key, value) => {
    const chars = /^(\d+) characters$/.exec(value);
    if (chars) return placeholder(Number(chars[1]), key);
    if (value === 'true' || value === 'false') return value === 'true';
    return /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
  };
  if (head['Drawing options'] && head['Drawing options'] !== 'defaults') {
    for (const pair of head['Drawing options'].split(', ')) { const [k, ...v] = pair.split('='); config[k] = option(k, v.join('=')); }
  }
  for (const pair of sets) { const [k, ...v] = pair.split('='); config[k] = option(k, v.join('=')); }

  // Entities: every mapped key with its value. Ids are replaced, one neutral id per original id (two keys may share a sensor).
  const ids = new Map();
  const anon = (id, key) => {
    if (!ids.has(id)) ids.set(id, `${id.split('.')[0]}.f_${key.replace(/[^a-z0-9_]/gi, '_').toLowerCase()}`);
    return ids.get(id);
  };
  const states = {};
  // One thermostat may fill two keys, each line with its own attribute (dhw_top: current_temperature, dhw_target: temperature):
  // the attributes of both lines are kept.
  const put = (to, v) => {
    const old = states[to];
    const isState = (s) => !!s && typeof s === 'object' && !Array.isArray(s);
    states[to] = isState(old) && isState(v) ? { ...old, ...v, attributes: { ...old.attributes, ...v.attributes } } : v;
  };
  const value = (rest) => {
    if (/^unavailable \(entity not found\)$/.test(rest)) return undefined;
    const m = /^(.*?)(?: \(([a-z_]+) (.*)\))?$/.exec(rest);
    const raw = m[1] === '(empty)' ? '' : m[1];
    const num = /^(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?) (.+)$/i.exec(raw);
    const [state, unit] = num ? [num[1], num[2]] : [raw, ''];
    if (!m[2] && !unit) return state;
    if (!m[2]) return [state, unit];
    const attr = /^-?\d+(\.\d+)?$/.test(m[3]) ? Number(m[3]) : m[3];
    return { state, attributes: { ...(unit ? { unit_of_measurement: unit } : {}), [m[2]]: attr } };
  };
  const entities = {};
  for (const l of section('Entity mappings')) {
    const m = /^([a-z0-9_]+)(?: \((?:sum|average) (\d+)\))?: ([a-z_]+\.[^ ]+) = (.*?)(?: \[[^\]]*\])?$/.exec(l);
    if (!m) continue;
    const [, key, part, id, rest] = m;
    const to = anon(id, part ? `${key}_${part}` : key);
    if (part) entities[key] = [...(entities[key] || []), to]; else entities[key] = to;
    const v = value(rest);
    if (v !== undefined) put(to, v);
  }
  config.entities = entities;

  // Value maps with their entries (a long map of a preset only shows its size and cannot be carried over). The report lists the
  // preset's map before the configuration's, and the card lets the configuration win, so a later entry replaces an earlier one.
  // A map given with --set is kept as it is.
  const setKeys = new Set(sets.map((pair) => pair.split('=')[0]));
  for (const l of section('Maps')) {
    const m = /^([a-z_]+_map): (.*) \((preset|configuration)\)$/.exec(l);
    if (!m || /^\d+ entries$/.test(m[2]) || setKeys.has(m[1])) continue;
    config[m[1]] = { ...(config[m[1]] || {}), ...Object.fromEntries(m[2].split(', ').map((e) => e.split('='))) };
  }

  // Power sources of the Energy dashboard: each source with its power sensor and value.
  let energy;
  for (const l of section('Power sources')) {
    if (/^off \(power_sources: manual\)$/.test(l)) config.power_sources = 'manual';
    const m = /^(solar|battery|grid) (\d+): (.*)$/.exec(l);
    if (!m) continue;
    const [, type, n, rest] = m;
    const source = { type: type === 'solar' ? 'solar' : type };
    const sensor = (text, suffix) => {
      const s = /^([a-z_]+\.[^ ]+) = (.*?)( \(not a power value, ignored\))?$/.exec(text);
      if (!s) return undefined;
      const to = anon(s[1], `${type}_${n}${suffix}`);
      const v = value(s[2]); if (v !== undefined) put(to, v);
      return to;
    };
    const both = /^from (.*); to (.*)$/.exec(rest);
    if (both) {
      source.power_config = {};
      if (both[1] !== 'none') source.power_config.stat_rate_from = sensor(both[1], '_from');
      if (both[2] !== 'none') source.power_config.stat_rate_to = sensor(both[2], '_to');
    } else if (!/^no power sensor/.test(rest)) {
      const inverted = / \(inverted in the Energy dashboard\)$/.test(rest);
      source.stat_rate = sensor(rest.replace(/ \(inverted in the Energy dashboard\)$/, ''), '');
      if (inverted) source.power_config = { stat_rate: source.stat_rate, stat_rate_inverted: true };
    }
    (energy = energy || { energy_sources: [] }).energy_sources.push(source);
  }
  return { preset: head.Preset && head.Preset !== 'none' ? head.Preset : undefined, version: head['Card version'], config, states, energy };
};

const parsed = parseReport(readFileSync(file, 'utf8'), values('set'));
const fieldCase = { issue, name: values('name')[0] || `issue ${issue}`, ...parsed };
if (!flag('write')) {
  console.log(JSON.stringify(fieldCase, null, 2));
} else {
  const target = resolve(root, 'test/field-cases.js');
  const text = readFileSync(target, 'utf8');
  const begin = text.indexOf('[\n'); const end = text.lastIndexOf('\n];');
  const list = JSON.parse(`[${text.slice(begin + 2, end).trim().replace(/,$/, '')}]`);
  const at = list.findIndex((c) => c.issue === fieldCase.issue && c.name === fieldCase.name);
  if (at >= 0) list[at] = fieldCase; else list.push(fieldCase);
  list.sort((a, b) => a.issue - b.issue || (a.name < b.name ? -1 : 1));
  writeFileSync(target, `${text.slice(0, begin)}[\n${list.map((c) => `  ${JSON.stringify(c)},`).join('\n')}\n];\n`);
  console.log(`${at >= 0 ? 'replaced' : 'added'} field case ${fieldCase.issue} "${fieldCase.name}" in test/field-cases.js (${list.length} cases)`);
}
