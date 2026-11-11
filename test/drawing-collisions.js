// Element to schematic (viewBox) coordinates, including parts in translated circuit rows. getScreenCTM includes the viewBox
// scaling of the outer svg in every browser; getCTM of the outer svg leaves it out in Firefox, which mixed screen pixels with
// schematic units (a pipe radius of 4.5 units against a rod box scaled to 0.39).
function schematicMatrix(el, svg) {
  return svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
}

// Text gets its height from the font size: from cap height above to descender depth below the baseline of every character.
// getBBox uses the line metrics of whatever font the browser picked, and Firefox on Linux reports a line about a third taller
// than Chromium, so stacked labels 22 units apart (power over COP) touched there only. The width stays measured.
const CAP = 0.72; const DESCENT = 0.22;
function localBox(el) {
  const bounds = el.getBBox();
  const chars = el instanceof SVGTextElement ? el.getNumberOfChars() : 0;
  if (!chars) return bounds;
  const size = Math.max(...[el, ...el.querySelectorAll('tspan')].map((n) => parseFloat(getComputedStyle(n).fontSize)).filter(Number.isFinite));
  let top = Infinity; let bottom = -Infinity;
  for (let n = 0; n < chars; n++) {
    let y;
    try { ({ y } = el.getStartPositionOfChar(n)); } catch (err) { continue; }
    top = Math.min(top, y - CAP * size); bottom = Math.max(bottom, y + DESCENT * size);
  }
  return Number.isFinite(top) ? { x: bounds.x, y: top, width: bounds.width, height: bottom - top } : bounds;
}

function rootBox(el, svg) {
  const bounds = localBox(el);
  const matrix = schematicMatrix(el, svg);
  const corners = [bounds.x, bounds.x + bounds.width].flatMap((x) =>
    [bounds.y, bounds.y + bounds.height].map((y) => new DOMPoint(x, y).matrixTransform(matrix)));
  return { l: Math.min(...corners.map((p) => p.x)), r: Math.max(...corners.map((p) => p.x)),
    t: Math.min(...corners.map((p) => p.y)), b: Math.max(...corners.map((p) => p.y)) };
}

// A shared edge and sub-pixel rounding in font metrics are harmless.
function boxesOverlap(a, b) {
  return Math.min(a.r, b.r) - Math.max(a.l, b.l) > 1 && Math.min(a.b, b.b) - Math.max(a.t, b.t) > 1;
}

// Two labels need a gap of at least LABEL_GAP schematic units, or they read as one text (#395).
const LABEL_GAP = 2;
function labelsTooClose(a, b) {
  return Math.min(a.r, b.r) - Math.max(a.l, b.l) > -LABEL_GAP && Math.min(a.b, b.b) - Math.max(a.t, b.t) > -LABEL_GAP;
}

function drawingCollisions(svg) {
  const hits = [];
  const view = svg.viewBox.baseVal;
  const visible = (el) => el.getClientRects().length && getComputedStyle(el).visibility === 'visible';
  const name = (el) => el.id || el.closest('.rod')?.id || [el.getAttribute('class'), el.textContent].filter(Boolean).join(' ');
  const labels = [...svg.querySelectorAll('text')].filter((el) => visible(el) && el.textContent.trim())
    .map((el) => {
      const b = rootBox(el, svg);
      // The name column in the room overview is explicitly clipped in local SVG units.
      if (el.matches('.house-row-name')) {
        const clip = /^polygon\([^,]+, ([\d.]+)px /.exec(getComputedStyle(el).clipPath);
        if (clip) b.r = Math.min(b.r, b.l + Number(clip[1]));
      }
      return { el, b };
    });
  for (const [n, { el, b }] of labels.entries()) {
    if (b.l < view.x - 1 || b.r > view.x + view.width + 1 || b.t < view.y - 1 || b.b > view.y + view.height + 1) {
      hits.push(`${name(el)} outside viewBox`);
    }
    for (const other of labels.slice(n + 1)) {
      if (boxesOverlap(b, other.b)) hits.push(`${name(el)} overlaps ${name(other.el)}`);
      else if (labelsTooClose(b, other.b)) hits.push(`${name(el)} is closer than ${LABEL_GAP} units to ${name(other.el)}`);
    }
  }
  // Labels painted inside an appliance belong to it. All other labels need to
  // clear its body, even when their anchor still falls outside the appliance. The flow label next to a boiler (.no-pre) ends in
  // front of the boiler box and may reach over the edge of the heat pump on a narrow card, where its halo keeps it readable.
  const bodies = [
    ['#hp-box', '.unit-title, .unit-status, .unit-val, .no-pre'],
    ['rect.tank', '.tank-temp, .tank-sub, .on-tank, .series-title, #cs-tank ~ #t-dhw-mode'],
    ['rect.boiler-box', '.boiler-value'],
    ['rect.fws', '#t-dhw-top'],
    ['rect.radiator, rect.column-rib, circle.pump', null],
  ];
  for (const [selector, inside] of bodies) for (const el of svg.querySelectorAll(selector)) {
    if (!visible(el)) continue;
    const b = rootBox(el, svg);
    for (const label of labels) {
      if ((!inside || !label.el.matches(inside)) && boxesOverlap(b, label.b)) hits.push(`${name(label.el)} overlaps ${name(el)}`);
    }
  }
  // Labels must not lie on a pipe: sample every visible pipe every 4 units along its stroke (the flow overlay runs on the same path).
  // A pipe runs under the appliances it connects (tank, series buffer, valve, pump); there it is hidden, and a label inside the
  // appliance does not lie on it.
  const covers = [...svg.querySelectorAll('#hp-box, rect.tank, rect.boiler-box, rect.fws, circle.valve, circle.pump, rect.radiator, rect.column-rib, rect.collector')]
    .filter(visible).map((el) => rootBox(el, svg));
  const covered = (x, y) => covers.some((c) => x > c.l && x < c.r && y > c.t && y < c.b);
  for (const pipe of svg.querySelectorAll('path.pipe')) {
    if (!visible(pipe)) continue;
    const m = schematicMatrix(pipe, svg);
    const r = parseFloat(getComputedStyle(pipe).strokeWidth) / 2 || 2;
    let len = 0; try { len = pipe.getTotalLength(); } catch (err) { continue; }
    const hitBy = new Set();
    for (let at = 0; at <= len; at += 4) {
      const { x, y } = pipe.getPointAtLength(at).matrixTransform(m);
      if (covered(x, y)) continue;
      const dot = { l: x - r, r: x + r, t: y - r, b: y + r };
      for (const label of labels) if (!hitBy.has(label) && boxesOverlap(label.b, dot)) hitBy.add(label);
    }
    for (const label of hitBy) hits.push(`${name(label.el)} lies on pipe ${name(pipe)}`);
  }
  const flanges = [...svg.querySelectorAll('.heater-flange')].filter(visible).map((el) => ({ el, b: rootBox(el, svg) }));
  for (const [n, rod] of flanges.entries()) {
    for (const other of flanges.slice(n + 1)) {
      if (boxesOverlap(rod.b, other.b)) hits.push(`${name(rod.el)} overlaps ${name(other.el)}`);
    }
  }
  // A mounting flange must leave pipe ports free, including the painted pipe cap.
  if (flanges.length) for (const pipe of svg.querySelectorAll('path.pipe')) {
    const m = schematicMatrix(pipe, svg);
    const r = parseFloat(getComputedStyle(pipe).strokeWidth) / 2;
    for (const end of [0, pipe.getTotalLength()]) {
      const { x, y } = pipe.getPointAtLength(end).matrixTransform(m);
      for (const rod of flanges) {
        if (boxesOverlap(rod.b, { l: x - r, r: x + r, t: y - r, b: y + r })) hits.push(`${name(rod.el)} covers port of ${name(pipe)}`);
      }
    }
  }
  return hits;
}
