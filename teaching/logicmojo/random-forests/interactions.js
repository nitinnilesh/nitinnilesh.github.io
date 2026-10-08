document.addEventListener('DOMContentLoaded', () => {
  const oob = document.getElementById('oob-size');
  if (oob) {
    const sizeText = document.getElementById('oob-size-value');
    const oobText = document.getElementById('oob-probability');
    const uniqueText = document.getElementById('unique-probability');
    const update = () => {
      const n = Number(oob.value);
      const pOob = Math.pow(1 - 1 / n, n);
      sizeText.textContent = n;
      oobText.textContent = pOob.toFixed(3);
      uniqueText.textContent = (1 - pOob).toFixed(3);
    };
    oob.addEventListener('input', update); update();
  }

  const trees = document.getElementById('trees-slider');
  const rho = document.getElementById('rho-slider');
  if (trees && rho) {
    const treesText = document.getElementById('trees-value');
    const rhoText = document.getElementById('rho-value');
    const varianceText = document.getElementById('variance-factor');
    const update = () => {
      const B = Number(trees.value);
      const correlation = Number(rho.value) / 100;
      const factor = correlation + (1 - correlation) / B;
      treesText.textContent = B;
      rhoText.textContent = correlation.toFixed(2);
      varianceText.textContent = factor.toFixed(3);
    };
    trees.addEventListener('input', update); rho.addEventListener('input', update); update();
  }
});
