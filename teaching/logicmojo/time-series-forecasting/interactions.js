const COLORS = { ink: '#17202a', muted: '#5d6874', line: '#d9e1e8', blue: '#1769aa', teal: '#087f6b', red: '#c43b36', gold: '#a96700', violet: '#6346b8' };

const weekly = [-20, -10, 0, 5, 15, 45, 30];
const noise = [0, 4, -3, 2, -2, 5, -4, 3, -1, 4, -5, 2, 1, -2, 5, -4, 3, 0, -3, 4, -1];
const demand = Array.from({ length: 70 }, (_, t) => {
  const event = t === 31 ? 52 : (t === 47 ? -32 : 0);
  return 120 + 0.8 * t + weekly[t % 7] + noise[t % noise.length] + event;
});

function setupReveals() {
  document.querySelectorAll('[data-reveal]').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.dataset.reveal);
      const opening = answer.hidden;
      answer.hidden = !opening;
      button.textContent = opening ? 'Hide answer' : 'Reveal answer';
    });
  });
}

function setupKeys() {
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input, button')) return;
    if (event.key === 'ArrowLeft' && document.body.dataset.prev) location.href = document.body.dataset.prev;
    if (event.key === 'ArrowRight' && document.body.dataset.next) location.href = document.body.dataset.next;
  });
}

function canvasContext(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  return { canvas, ctx: canvas.getContext('2d') };
}

function lineChart(id, series, options = {}) {
  const target = canvasContext(id);
  if (!target) return;
  const { canvas, ctx } = target;
  const w = canvas.width, h = canvas.height;
  const pad = { l: 48, r: 18, t: 25, b: 36 };
  const all = series.flatMap(s => s.values.filter(v => Number.isFinite(v)));
  const min = options.min ?? Math.min(...all);
  const max = options.max ?? Math.max(...all);
  const span = Math.max(1, max - min);
  const n = Math.max(...series.map(s => s.values.length));
  const x = i => pad.l + i * (w - pad.l - pad.r) / Math.max(1, n - 1);
  const y = value => pad.t + (max + span * .08 - value) * (h - pad.t - pad.b) / (span * 1.16);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '12px system-ui';
  ctx.strokeStyle = COLORS.line;
  ctx.fillStyle = COLORS.muted;
  for (let i = 0; i <= 4; i += 1) {
    const value = min + span * i / 4;
    const py = y(value);
    ctx.beginPath(); ctx.moveTo(pad.l, py); ctx.lineTo(w - pad.r, py); ctx.stroke();
    ctx.fillText(value.toFixed(options.decimals ?? 0), 5, py + 4);
  }
  if (options.splitAt !== undefined) {
    const sx = x(options.splitAt);
    ctx.fillStyle = 'rgba(169,103,0,.08)';
    ctx.fillRect(sx, pad.t, w - pad.r - sx, h - pad.t - pad.b);
    ctx.strokeStyle = COLORS.gold; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(sx, pad.t); ctx.lineTo(sx, h - pad.b); ctx.stroke(); ctx.setLineDash([]);
  }
  series.forEach((s) => {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2.5; ctx.setLineDash(s.dash || []);
    ctx.beginPath(); let started = false;
    s.values.forEach((value, i) => {
      if (!Number.isFinite(value)) { started = false; return; }
      if (!started) { ctx.moveTo(x(i), y(value)); started = true; } else ctx.lineTo(x(i), y(value));
    });
    ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.strokeStyle = COLORS.muted; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, h - pad.b); ctx.lineTo(w - pad.r, h - pad.b); ctx.stroke();
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(options.xLabel || 'Time', w / 2 - 15, h - 8);
  ctx.save(); ctx.translate(14, h / 2 + 22); ctx.rotate(-Math.PI / 2); ctx.fillText(options.yLabel || 'Value', 0, 0); ctx.restore();
}

function setupOverview() {
  lineChart('demand-chart', [{ values: demand.slice(0, 56), color: COLORS.blue }], { xLabel: 'Day', yLabel: 'Bike rentals' });
}

function setupDecomposition() {
  if (!document.getElementById('decomposition-chart')) return;
  const n = 49;
  const trend = Array.from({ length: n }, (_, t) => 120 + 0.8 * t);
  const season = Array.from({ length: n }, (_, t) => weekly[t % 7]);
  const residual = demand.slice(0, n).map((v, i) => v - trend[i] - season[i]);
  decompositionChart('decomposition-chart', [
    { label: 'Observed', values: demand.slice(0, n), color: COLORS.ink },
    { label: 'Trend', values: trend, color: COLORS.blue },
    { label: 'Seasonality', values: season, color: COLORS.teal, symmetric: true },
    { label: 'Remainder', values: residual, color: COLORS.red, symmetric: true },
  ]);
}

function decompositionChart(id, panels) {
  const target = canvasContext(id); if (!target) return;
  const { canvas, ctx } = target; const w = canvas.width, h = canvas.height;
  const left = 92, right = 20, top = 22, bottom = 38, gap = 18;
  const panelH = (h - top - bottom - gap * (panels.length - 1)) / panels.length;
  const n = panels[0].values.length;
  const x = i => left + i * (w - left - right) / (n - 1);
  ctx.clearRect(0, 0, w, h); ctx.font = '12px system-ui';
  panels.forEach((panel, index) => {
    const yTop = top + index * (panelH + gap);
    let min = Math.min(...panel.values), max = Math.max(...panel.values);
    if (panel.symmetric) { const bound = Math.max(Math.abs(min), Math.abs(max), 1); min = -bound; max = bound; }
    const span = Math.max(1, max - min);
    const y = value => yTop + 8 + (max - value) * (panelH - 16) / span;
    ctx.fillStyle = index % 2 ? '#fbfcfd' : '#f6f8fa';
    ctx.fillRect(left, yTop, w - left - right, panelH);
    ctx.strokeStyle = COLORS.line; ctx.lineWidth = 1;
    [0, .5, 1].forEach(frac => { const py=yTop+frac*panelH; ctx.beginPath(); ctx.moveTo(left,py); ctx.lineTo(w-right,py); ctx.stroke(); });
    if (min < 0 && max > 0) { ctx.strokeStyle='#9aa4ad';ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(left,y(0));ctx.lineTo(w-right,y(0));ctx.stroke();ctx.setLineDash([]); }
    ctx.strokeStyle = panel.color; ctx.lineWidth = 2.5; ctx.beginPath();
    panel.values.forEach((value, i) => { if (i===0) ctx.moveTo(x(i),y(value)); else ctx.lineTo(x(i),y(value)); }); ctx.stroke();
    ctx.fillStyle = panel.color; ctx.font = '600 13px system-ui'; ctx.fillText(panel.label, 8, yTop + panelH / 2 + 4);
    ctx.fillStyle = COLORS.muted; ctx.font = '11px system-ui'; ctx.fillText(max.toFixed(0), left + 5, yTop + 13); ctx.fillText(min.toFixed(0), left + 5, yTop + panelH - 5);
  });
  ctx.fillStyle = COLORS.muted; ctx.font = '12px system-ui'; ctx.fillText('Day', w / 2, h - 10);
  [0, 7, 14, 21, 28, 35, 42, 48].forEach(i => ctx.fillText(String(i + 1), x(i) - 5, h - 22));
}

function mae(actual, predicted) {
  return actual.reduce((sum, v, i) => sum + Math.abs(v - predicted[i]), 0) / actual.length;
}

function setupBaselines() {
  if (!document.getElementById('baseline-chart')) return;
  const trainN = 42, horizon = 14;
  const actual = demand.slice(0, trainN + horizon);
  const last = demand[trainN - 1];
  const naive = Array(trainN).fill(NaN).concat(Array(horizon).fill(last));
  const seasonalForecast = Array(trainN).fill(NaN).concat(Array.from({ length: horizon }, (_, h) => demand[trainN - 7 + (h % 7)]));
  const seasonalLine = demand.slice(0, trainN).concat(seasonalForecast.slice(trainN));
  lineChart('baseline-chart', [
    { values: actual, color: COLORS.ink, width: 2 },
    { values: naive, color: COLORS.red, dash: [7, 5] },
    { values: seasonalLine, color: COLORS.teal, dash: [4, 4] },
  ], { splitAt: trainN - 1, yLabel: 'Bike rentals' });
  const test = actual.slice(trainN);
  document.getElementById('naive-mae').textContent = mae(test, naive.slice(trainN)).toFixed(1);
  document.getElementById('seasonal-mae').textContent = mae(test, seasonalForecast.slice(trainN)).toFixed(1);
}

function autocorrelation(values, maxLag) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const denominator = values.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return Array.from({ length: maxLag + 1 }, (_, lag) => {
    let numerator = 0;
    for (let t = lag; t < values.length; t += 1) numerator += (values[t] - mean) * (values[t - lag] - mean);
    return numerator / denominator;
  });
}

function barChart(id, values, sampleSize) {
  const target = canvasContext(id); if (!target) return;
  const { canvas, ctx } = target; const w = canvas.width, h = canvas.height;
  const p = { l: 48, r: 18, t: 24, b: 38 }; const plotH = h - p.t - p.b;
  const y = value => p.t + (1.1 - value) * plotH / 2.2;
  ctx.clearRect(0, 0, w, h); ctx.font = '12px system-ui';
  ctx.strokeStyle = COLORS.line;
  [-1, -.5, 0, .5, 1].forEach(v => { ctx.beginPath(); ctx.moveTo(p.l, y(v)); ctx.lineTo(w-p.r, y(v)); ctx.stroke(); ctx.fillStyle=COLORS.muted; ctx.fillText(v.toFixed(1), 8, y(v)+4); });
  if (sampleSize) {
    const limit = 1.96 / Math.sqrt(sampleSize);
    ctx.fillStyle = 'rgba(99,70,184,.08)'; ctx.fillRect(p.l, y(limit), w-p.l-p.r, y(-limit)-y(limit));
    ctx.strokeStyle = COLORS.violet; ctx.lineWidth = 1.5; ctx.setLineDash([6,5]);
    [limit, -limit].forEach(v => { ctx.beginPath(); ctx.moveTo(p.l,y(v)); ctx.lineTo(w-p.r,y(v)); ctx.stroke(); });
    ctx.setLineDash([]);
  }
  const slot = (w - p.l - p.r) / values.length;
  values.forEach((v, i) => { ctx.strokeStyle = (i === 7 || i === 14 || i === 21) ? COLORS.red : COLORS.blue; ctx.lineWidth = 4; const px=p.l+slot*(i+.5); ctx.beginPath(); ctx.moveTo(px,y(0)); ctx.lineTo(px,y(v)); ctx.stroke(); if(i%7===0){ctx.fillStyle=COLORS.muted;ctx.fillText(String(i),px-4,h-12);} });
  ctx.fillStyle=COLORS.muted; ctx.fillText('Lag',w/2-10,h-8);
}

function setupLags() {
  barChart('acf-chart', autocorrelation(demand.slice(0, 56), 21), 56);
}

function setupStationarity() {
  const values = demand.slice(0, 56);
  const diff = values.map((v, i) => i === 0 ? NaN : v - values[i - 1]);
  const seasonalDiff = values.map((v, i) => i < 7 ? NaN : v - values[i - 7]);
  lineChart('raw-chart', [{ values, color: COLORS.blue }], { yLabel: 'Demand' });
  lineChart('difference-chart', [{ values: diff, color: COLORS.gold }, { values: seasonalDiff, color: COLORS.teal }], { yLabel: 'Difference' });
}

function setupSmoothing() {
  const slider = document.getElementById('alpha-slider'); if (!slider) return;
  const update = () => {
    const alpha = Number(slider.value) / 100;
    const smoothNoise = [0, 5, -3, 2, -5, 4, -1, 3, -4, 2, 1, -2];
    const values = Array.from({ length: 49 }, (_, t) => 105 + (t >= 25 ? 24 : 0) + smoothNoise[t % smoothNoise.length]);
    const level = [values[0]];
    for (let t = 1; t < values.length; t += 1) level.push(alpha * values[t] + (1 - alpha) * level[t - 1]);
    document.getElementById('alpha-value').textContent = alpha.toFixed(2);
    lineChart('smoothing-chart', [{ values, color: COLORS.ink, width: 2 }, { values: level, color: COLORS.violet, width: 3 }], { yLabel: 'Bike rentals' });
  };
  slider.addEventListener('input', update);
  slider.addEventListener('change', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  setupReveals(); setupKeys(); setupOverview(); setupDecomposition(); setupBaselines(); setupLags(); setupStationarity(); setupSmoothing();
});
