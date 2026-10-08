const transactions = [
  { score: .97, actual: 1 }, { score: .91, actual: 1 },
  { score: .84, actual: 0 }, { score: .79, actual: 1 },
  { score: .72, actual: 0 }, { score: .67, actual: 1 },
  { score: .61, actual: 0 }, { score: .56, actual: 1 },
  { score: .49, actual: 0 }, { score: .44, actual: 0 },
  { score: .39, actual: 1 }, { score: .35, actual: 0 },
  { score: .29, actual: 0 }, { score: .24, actual: 0 },
  { score: .18, actual: 1 }, { score: .14, actual: 0 },
  { score: .11, actual: 0 }, { score: .08, actual: 0 },
  { score: .04, actual: 0 }, { score: .02, actual: 0 }
];

const fmt = value => Number.isFinite(value) ? value.toFixed(2) : '—';
const pct = value => Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—';

function confusionAt(threshold) {
  return transactions.reduce((m, item) => {
    const predicted = item.score >= threshold ? 1 : 0;
    if (predicted === 1 && item.actual === 1) m.tp++;
    if (predicted === 1 && item.actual === 0) m.fp++;
    if (predicted === 0 && item.actual === 1) m.fn++;
    if (predicted === 0 && item.actual === 0) m.tn++;
    return m;
  }, { tp: 0, fp: 0, fn: 0, tn: 0 });
}

function metrics(m) {
  const accuracy = (m.tp + m.tn) / (m.tp + m.tn + m.fp + m.fn);
  const precision = m.tp / (m.tp + m.fp);
  const recall = m.tp / (m.tp + m.fn);
  const f1 = 2 * precision * recall / (precision + recall);
  const fpr = m.fp / (m.fp + m.tn);
  return { accuracy, precision, recall, f1, fpr };
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateMetricBars(values) {
  Object.entries(values).forEach(([key, value]) => {
    const fill = document.querySelector(`[data-bar="${key}"]`);
    const out = document.querySelector(`[data-value="${key}"]`);
    if (fill) fill.style.width = `${Math.max(0, Math.min(1, value || 0)) * 100}%`;
    if (out) out.textContent = pct(value);
  });
}

function renderCases(threshold) {
  const strip = document.getElementById('case-strip');
  if (!strip) return;
  strip.innerHTML = transactions.map((item, index) => {
    const predicted = item.score >= threshold;
    return `<span class="case-dot ${item.actual ? 'pos' : 'neg'} ${predicted ? 'pred-pos' : ''}" title="Case ${index + 1}: score ${item.score}; actual ${item.actual ? 'fraud' : 'legitimate'}">${Math.round(item.score * 100)}</span>`;
  }).join('');
}

function initThresholdDemo() {
  const slider = document.getElementById('threshold');
  if (!slider) return;
  const update = () => {
    const threshold = Number(slider.value);
    const m = confusionAt(threshold);
    const values = metrics(m);
    setText('threshold-value', threshold.toFixed(2));
    setText('tp', m.tp); setText('fp', m.fp); setText('fn', m.fn); setText('tn', m.tn);
    updateMetricBars(values);
    renderCases(threshold);
  };
  slider.addEventListener('input', update);
  update();
}

function initMatrixCalculator() {
  const inputs = [...document.querySelectorAll('[data-count]')];
  if (!inputs.length) return;
  const update = () => {
    const m = Object.fromEntries(inputs.map(input => [input.dataset.count, Number(input.value)]));
    const values = metrics(m);
    setText('calc-accuracy', pct(values.accuracy));
    setText('calc-precision', pct(values.precision));
    setText('calc-recall', pct(values.recall));
    setText('calc-f1', pct(values.f1));
  };
  inputs.forEach(input => input.addEventListener('input', update));
  update();
}

function initAccuracyTrap() {
  const button = document.getElementById('reveal-trap');
  if (!button) return;
  button.addEventListener('click', () => {
    document.getElementById('trap-answer').classList.add('show');
    button.textContent = 'Revealed: recall is 0%';
    button.disabled = true;
  });
}

function initAnswers() {
  document.querySelectorAll('[data-reveal]').forEach(button => {
    button.addEventListener('click', () => {
      const answer = document.getElementById(button.dataset.reveal);
      if (!answer) return;
      answer.classList.toggle('show');
      button.textContent = answer.classList.contains('show') ? 'Hide answer' : 'Reveal answer';
    });
  });
}

function initR2Demo() {
  const slider = document.getElementById('fit-quality');
  const svg = document.getElementById('r2-plot');
  if (!slider || !svg) return;
  const xs = [1, 2, 3, 4, 5, 6, 7, 8];
  const actual = [2.0, 2.9, 3.7, 5.2, 5.8, 7.1, 7.7, 9.2];
  const weak = [5.45, 5.45, 5.45, 5.45, 5.45, 5.45, 5.45, 5.45];
  const strong = [1.9, 2.9, 3.9, 4.9, 5.9, 6.9, 7.9, 8.9];
  const mapX = x => 45 + x * 42;
  const mapY = y => 250 - y * 21;
  const update = () => {
    const q = Number(slider.value);
    const pred = weak.map((v, i) => v * (1 - q) + strong[i] * q);
    const mean = actual.reduce((a, b) => a + b, 0) / actual.length;
    const ssRes = actual.reduce((sum, y, i) => sum + (y - pred[i]) ** 2, 0);
    const ssTot = actual.reduce((sum, y) => sum + (y - mean) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;
    setText('fit-value', `${Math.round(q * 100)}%`);
    setText('r2-value', r2.toFixed(2));
    setText('ss-res', ssRes.toFixed(1));
    setText('ss-tot', ssTot.toFixed(1));
    const predictionPoints = pred.map((y, i) => `${mapX(xs[i])},${mapY(y)}`).join(' ');
    const residuals = actual.map((y, i) => `<line x1="${mapX(xs[i])}" y1="${mapY(y)}" x2="${mapX(xs[i])}" y2="${mapY(pred[i])}" stroke="#c53c36" stroke-width="2" stroke-dasharray="4 3" />`).join('');
    const actualPoints = actual.map((y, i) => `<circle cx="${mapX(xs[i])}" cy="${mapY(y)}" r="5" fill="#1769e0" />`).join('');
    svg.querySelector('#dynamic-r2').innerHTML = `${residuals}<polyline points="${predictionPoints}" fill="none" stroke="#0b8f63" stroke-width="4" />${actualPoints}`;
  };
  slider.addEventListener('input', update);
  update();
}

function averagePrecisionScore() {
  const ranked = [...transactions].sort((a, b) => b.score - a.score);
  const positives = ranked.filter(item => item.actual === 1).length;
  let tp = 0;
  let precisionSum = 0;
  ranked.forEach((item, index) => {
    if (item.actual === 1) {
      tp += 1;
      precisionSum += tp / (index + 1);
    }
  });
  return precisionSum / positives;
}

function initPrDemo() {
  const slider = document.getElementById('pr-threshold');
  const curve = document.getElementById('pr-curve-path');
  const point = document.getElementById('pr-operating-point');
  if (!slider || !curve || !point) return;

  const mapX = recall => 58 + 307 * recall;
  const mapY = precision => 250 - 205 * precision;
  const thresholds = [1.01, ...transactions.map(item => item.score)];
  const points = thresholds.map(threshold => {
    const values = metrics(confusionAt(threshold));
    return {
      recall: Number.isFinite(values.recall) ? values.recall : 0,
      precision: Number.isFinite(values.precision) ? values.precision : 1
    };
  });
  curve.setAttribute('points', points.map(p => `${mapX(p.recall)},${mapY(p.precision)}`).join(' '));

  const prevalence = transactions.filter(item => item.actual === 1).length / transactions.length;
  const baseline = document.getElementById('pr-baseline-line');
  if (baseline) {
    baseline.setAttribute('y1', mapY(prevalence));
    baseline.setAttribute('y2', mapY(prevalence));
  }
  setText('pr-baseline', pct(prevalence));
  setText('average-precision', averagePrecisionScore().toFixed(2));

  const update = () => {
    const threshold = Number(slider.value);
    const m = confusionAt(threshold);
    const values = metrics(m);
    const precision = Number.isFinite(values.precision) ? values.precision : 1;
    setText('pr-threshold-value', threshold.toFixed(2));
    setText('pr-precision', pct(precision));
    setText('pr-recall', pct(values.recall));
    setText('pr-alerts', m.tp + m.fp);
    point.setAttribute('cx', mapX(values.recall));
    point.setAttribute('cy', mapY(precision));
  };
  slider.addEventListener('input', update);
  update();
}

document.addEventListener('DOMContentLoaded', () => {
  initThresholdDemo();
  initMatrixCalculator();
  initAccuracyTrap();
  initAnswers();
  initR2Demo();
  initPrDemo();
});
