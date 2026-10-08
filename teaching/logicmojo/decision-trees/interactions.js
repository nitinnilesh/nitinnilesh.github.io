document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('entropy-slider');
  if (!slider) return;

  const p1Text = document.getElementById('entropy-p1');
  const p0Text = document.getElementById('entropy-p0');
  const valueText = document.getElementById('entropy-value');
  const class1Bar = document.getElementById('entropy-class-1');
  const class0Bar = document.getElementById('entropy-class-0');

  const entropyTerm = (p) => p === 0 ? 0 : -p * Math.log2(p);
  const update = () => {
    const p1 = Number(slider.value) / 100;
    const p0 = 1 - p1;
    const h = entropyTerm(p1) + entropyTerm(p0);
    p1Text.textContent = p1.toFixed(2);
    p0Text.textContent = p0.toFixed(2);
    valueText.textContent = h.toFixed(3) + ' bits';
    class1Bar.style.width = (p1 * 100) + '%';
    class0Bar.style.width = (p0 * 100) + '%';
    class1Bar.textContent = p1 >= 0.16 ? Math.round(p1 * 100) + '%' : '';
    class0Bar.textContent = p0 >= 0.16 ? Math.round(p0 * 100) + '%' : '';
  };

  slider.addEventListener('input', update);
  update();
});
