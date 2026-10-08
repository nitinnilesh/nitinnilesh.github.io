document.addEventListener('DOMContentLoaded', () => {
  setupReveals();
  setupNavigation();
  drawXor();
  drawActivations();
  drawNetwork();
  drawLoss();
  drawTraining();
  setupBackpropAnimation();
});

function setupReveals() {
  document.querySelectorAll('[data-reveal]').forEach((button) => {
    const target = document.getElementById(button.dataset.reveal);
    if (!target) return;
    button.addEventListener('click', () => {
      const opening = target.hidden;
      target.hidden = !opening;
      button.setAttribute('aria-expanded', String(opening));
      button.textContent = opening ? 'Hide answer' : 'Reveal answer';
    });
  });
}

function setupNavigation() {
  const previous = document.body.dataset.prev;
  const next = document.body.dataset.next;
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('input,button,select,textarea')) return;
    if (event.key === 'ArrowLeft' && previous) window.location.href = previous;
    if (event.key === 'ArrowRight' && next) window.location.href = next;
  });
}

function axes(ctx, width, height, xMin, xMax, yMin, yMax) {
  const pad = 46;
  const sx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const sy = (y) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);
  ctx.strokeStyle = '#d8e0e8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(sx(xMin), sy(0)); ctx.lineTo(sx(xMax), sy(0)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx(0), sy(yMin)); ctx.lineTo(sx(0), sy(yMax)); ctx.stroke();
  return { sx, sy, pad };
}

function drawXor() {
  const canvas = document.getElementById('xor-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { sx, sy } = axes(ctx, canvas.width, canvas.height, -0.35, 1.35, -0.35, 1.35);
  ctx.strokeStyle = '#6842c2'; ctx.lineWidth = 4; ctx.setLineDash([10,7]);
  ctx.beginPath(); ctx.moveTo(sx(-.2), sy(.65)); ctx.lineTo(sx(1.2), sy(.65)); ctx.stroke(); ctx.setLineDash([]);
  const points = [{x:0,y:0,c:0},{x:0,y:1,c:1},{x:1,y:0,c:1},{x:1,y:1,c:0}];
  points.forEach((p) => { ctx.beginPath(); ctx.fillStyle = p.c ? '#1769e0' : '#c33b35'; ctx.arc(sx(p.x),sy(p.y),14,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.font='700 13px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(p.c),sx(p.x),sy(p.y)); });
  ctx.fillStyle='#5d6875'; ctx.font='14px sans-serif'; ctx.textAlign='left'; ctx.fillText('One straight line always leaves at least one class on the wrong side.',48,28);
}

const activationFns = {
  identity: { f:(x)=>x, d:()=>1, color:'#1769e0' },
  sigmoid: { f:(x)=>1/(1+Math.exp(-x)), d:(x)=>{const s=1/(1+Math.exp(-x));return s*(1-s);}, color:'#6842c2' },
  tanh: { f:(x)=>Math.tanh(x), d:(x)=>1-Math.tanh(x)**2, color:'#087f8c' },
  relu: { f:(x)=>Math.max(0,x), d:(x)=>x>0?1:0, color:'#12805c' },
  leaky: { f:(x)=>x>0?x:.1*x, d:(x)=>x>0?1:.1, color:'#b85c00' }
};

function drawActivations() {
  document.querySelectorAll('canvas[data-activation]').forEach((canvas) => {
    const spec = activationFns[canvas.dataset.activation];
    const derivative = canvas.dataset.derivative === 'true';
    const ctx = canvas.getContext('2d');
    const yRange = canvas.dataset.activation === 'relu' || canvas.dataset.activation === 'leaky' || canvas.dataset.activation === 'identity' ? 4 : 1.4;
    const { sx, sy } = axes(ctx, canvas.width, canvas.height, -4,4,-yRange,yRange);
    ctx.strokeStyle = derivative ? '#c33b35' : spec.color; ctx.lineWidth=3; ctx.beginPath();
    for(let i=0;i<=320;i+=1){const x=-4+(i/320)*8;const y=derivative?spec.d(x):spec.f(x);if(i===0)ctx.moveTo(sx(x),sy(y));else ctx.lineTo(sx(x),sy(y));}
    ctx.stroke();
  });
}

function drawNetwork() {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const layers = [{x:120,ys:[160,320],labels:['x₁','x₂']},{x:440,ys:[160,320],labels:['h₁','h₂']},{x:770,ys:[242],labels:['ŷ']}];
  ctx.lineWidth=1.5; ctx.strokeStyle='#b6c2cf';
  layers[0].ys.forEach(y1=>layers[1].ys.forEach(y2=>{ctx.beginPath();ctx.moveTo(layers[0].x,y1);ctx.lineTo(layers[1].x,y2);ctx.stroke();}));
  layers[1].ys.forEach(y1=>{ctx.beginPath();ctx.moveTo(layers[1].x,y1);ctx.lineTo(layers[2].x,layers[2].ys[0]);ctx.stroke();});
  layers.forEach((layer,li)=>layer.ys.forEach((y,i)=>{ctx.beginPath();ctx.fillStyle=li===0?'#eef4ff':li===1?'#eef9f8':'#f6f3ff';ctx.strokeStyle=li===0?'#1769e0':li===1?'#087f8c':'#6842c2';ctx.lineWidth=3;ctx.arc(layer.x,y,28,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#17212b';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(layer.labels[i],layer.x,y);}));
  ctx.fillStyle='#1756b5';ctx.font='700 14px sans-serif';ctx.fillText('W[1]',280,116);ctx.fillText('W[2]',605,150);
  ctx.fillStyle='#422d7d';ctx.font='700 13px sans-serif';ctx.fillText('+ b[1]',495,160);ctx.fillText('+ b[1]',495,320);ctx.fillText('+ b[2]',826,242);
  ctx.fillStyle='#5d6875';ctx.font='700 14px sans-serif';ctx.fillText('Input',120,405);ctx.fillText('Hidden activations',440,405);ctx.fillText('Probability',770,405);
  ctx.font='13px sans-serif';ctx.textAlign='left';ctx.fillText('W = trainable connection weights',165,455);ctx.fillText('b = trainable bias added before activation',485,455);
}

function drawLoss() {
  const canvas=document.getElementById('loss-canvas'); if(!canvas)return; const ctx=canvas.getContext('2d'); const {sx,sy}=axes(ctx,canvas.width,canvas.height,0,1,0,5);
  const curves=[{color:'#1769e0',fn:(p)=>-Math.log(Math.max(p,.007)),label:'y = 1'},{color:'#c33b35',fn:(p)=>-Math.log(Math.max(1-p,.007)),label:'y = 0'}];
  curves.forEach((c,k)=>{ctx.strokeStyle=c.color;ctx.lineWidth=3;ctx.beginPath();for(let i=2;i<319;i+=1){const p=i/320;const y=Math.min(5,c.fn(p));if(i===2)ctx.moveTo(sx(p),sy(y));else ctx.lineTo(sx(p),sy(y));}ctx.stroke();ctx.fillStyle=c.color;ctx.font='700 14px sans-serif';ctx.fillText(c.label,k===0?700:115,50);});
  ctx.fillStyle='#5d6875';ctx.font='14px sans-serif';ctx.fillText('Predicted probability p',370,430);ctx.save();ctx.translate(18,250);ctx.rotate(-Math.PI/2);ctx.fillText('Binary cross-entropy loss',0,0);ctx.restore();
}

function drawTraining() {
  const canvas=document.getElementById('training-canvas'); if(!canvas)return; const ctx=canvas.getContext('2d'); const {sx,sy}=axes(ctx,canvas.width,canvas.height,0,1000,0,0.75);
  ctx.strokeStyle='#1769e0';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=250;i+=1){const epoch=i*4;const loss=.58*Math.exp(-epoch/230)+.08+Math.sin(epoch/42)*.018*Math.exp(-epoch/350);if(i===0)ctx.moveTo(sx(epoch),sy(loss));else ctx.lineTo(sx(epoch),sy(loss));}ctx.stroke();ctx.fillStyle='#5d6875';ctx.font='14px sans-serif';ctx.fillText('Epoch',430,430);ctx.save();ctx.translate(18,250);ctx.rotate(-Math.PI/2);ctx.fillText('Loss',0,0);ctx.restore();
}

function setupBackpropAnimation() {
  const canvas = document.getElementById('backprop-animation-canvas');
  if (!canvas) return;
  const steps = [...document.querySelectorAll('[data-bp-step]')];
  const previous = document.getElementById('bp-previous');
  const next = document.getElementById('bp-next');
  const play = document.getElementById('bp-play');
  const reset = document.getElementById('bp-reset');
  const status = document.getElementById('bp-status');
  let current = 0;
  let timer = null;

  const render = () => {
    steps.forEach((step, index) => { step.hidden = index !== current; });
    status.textContent = `Step ${current + 1} of ${steps.length}`;
    previous.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    drawBackpropFrame(canvas, current);
  };
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
    play.textContent = '▶';
    play.title = 'Play animation';
  };
  const advance = () => {
    if (current === steps.length - 1) { stop(); return; }
    current += 1;
    render();
  };

  previous.addEventListener('click', () => { stop(); current = Math.max(0, current - 1); render(); });
  next.addEventListener('click', () => { stop(); current = Math.min(steps.length - 1, current + 1); render(); });
  reset.addEventListener('click', () => { stop(); current = 0; render(); });
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (current === steps.length - 1) current = 0;
    render();
    play.textContent = 'Ⅱ';
    play.title = 'Pause animation';
    timer = setInterval(advance, 2400);
  });
  render();
}

function drawBackpropFrame(canvas, step) {
  const ctx = canvas.getContext('2d');
  const forward = '#1769e0';
  const backward = '#b85c00';
  const ink = '#17212b';
  const muted = '#697583';
  const faint = '#cbd4de';
  const inputs = [{x:105,y:155,label:'x₁',value:'1.0'},{x:105,y:335,label:'x₂',value:'0.5'}];
  const hidden = [{x:445,y:155,label:'h₁'},{x:445,y:335,label:'h₂'}];
  const output = {x:775,y:245,label:'ŷ'};
  const loss = {x:980,y:245};
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const line = (from, to, color, width=2) => {
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath(); ctx.moveTo(from.x,from.y); ctx.lineTo(to.x,to.y); ctx.stroke();
  };
  inputs.forEach(i=>hidden.forEach(h=>line(i,h,step>=1?forward:faint,step>=1?2.4:1.4)));
  hidden.forEach(h=>line(h,output,step>=3?forward:faint,step>=3?2.4:1.4));
  line(output,loss,step>=5?forward:faint,step>=5?2.4:1.4);

  if(step>=6){
    line(loss,output,backward,4);
    if(step>=8) hidden.forEach(h=>line(output,h,backward,4));
    if(step>=10) hidden.forEach(h=>inputs.forEach(i=>line(h,i,backward,3.5)));
  }

  const weightLabel = (text,x,y) => {
    ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const width=ctx.measureText(text).width+10;ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(x-width/2,y-10,width,20);
    ctx.fillStyle='#1756b5';ctx.fillText(text,x,y);
  };
  weightLabel('w₁₁[1] = 0.4',270,126);
  weightLabel('w₁₂[1] = −0.2',270,225);
  weightLabel('w₂₁[1] = 0.1',270,266);
  weightLabel('w₂₂[1] = 0.3',270,365);
  weightLabel('w₁[2] = 0.7',610,174);
  weightLabel('w₂[2] = −0.5',610,316);

  const biasLabel = (text,x,y) => {
    ctx.font='700 12px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    const width=ctx.measureText(text).width+10;ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(x-5,y-10,width,20);
    ctx.fillStyle='#6842c2';ctx.fillText(text,x,y);
  };
  biasLabel('b₁[1] = 0',488,155);
  biasLabel('b₂[1] = 0',488,335);
  biasLabel('b[2] = 0',819,245);

  const node = (p,label,fill,stroke) => {
    ctx.beginPath();ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.arc(p.x,p.y,31,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle=ink;ctx.font='700 17px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,p.x,p.y);
  };
  inputs.forEach(i=>node(i,i.label,'#eef4ff',forward));
  hidden.forEach(h=>node(h,h.label,'#eef9f8','#087f8c'));
  node(output,output.label,'#f6f3ff','#6842c2');
  ctx.fillStyle='#fff6e8';ctx.strokeStyle='#b98200';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(loss.x-54,loss.y-31,108,62,8);ctx.fill();ctx.stroke();ctx.fillStyle=ink;ctx.font='700 16px sans-serif';ctx.fillText('Loss',loss.x,loss.y);

  ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.font='700 14px sans-serif';ctx.fillStyle=forward;
  inputs.forEach(i=>ctx.fillText(`${i.label} = ${i.value}`,i.x,i.y+54));
  if(step>=1){ctx.fillText('z₁ = 0.45',hidden[0].x,hidden[0].y-55);ctx.fillText('z₂ = −0.05',hidden[1].x,hidden[1].y-55);}
  if(step>=2){ctx.fillText('a₁ = 0.4219',hidden[0].x,hidden[0].y+56);ctx.fillText('a₂ = −0.0500',hidden[1].x,hidden[1].y+56);}
  if(step>=3)ctx.fillText('z = 0.3203',output.x,output.y-58);
  if(step>=4)ctx.fillText('a = 0.5794',output.x,output.y+59);
  if(step>=5)ctx.fillText('L = 0.5458',loss.x,loss.y+58);

  ctx.fillStyle=backward;
  if(step>=6)ctx.fillText('dZ[2] = −0.4206',860,150);
  if(step>=7){ctx.fillText('dW[2] = [−0.1775, 0.0210]ᵀ',610,440);ctx.fillText('db[2] = −0.4206',610,466);}
  if(step>=8){ctx.fillText('dA₁ = −0.2944',hidden[0].x,70);ctx.fillText('dA₂ = 0.2103',hidden[1].x,427);}
  if(step>=9){ctx.fillText('dZ₁ = −0.2420',hidden[0].x,93);ctx.fillText('dZ₂ = 0.2098',hidden[1].x,450);}
  if(step>=10){ctx.fillText('dW[1] = [[−0.2420, 0.2098], [−0.1210, 0.1049]]',275,500);ctx.fillText('db[1] = [−0.2420, 0.2098]',730,500);}

  ctx.fillStyle=muted;ctx.font='700 13px sans-serif';ctx.fillText('INPUT',105,50);ctx.fillText('HIDDEN LAYER',445,50);ctx.fillText('OUTPUT',775,50);ctx.fillText('OBJECTIVE',980,50);
  ctx.textAlign='left';ctx.fillStyle=step<6?forward:backward;ctx.font='800 14px sans-serif';ctx.fillText(step<6?'FORWARD PASS →':'← BACKWARD PASS',38,535);
}
