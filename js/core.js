/*  ╔═══════════════════════════════════════════╗
    ║  PhysLab Core Engine                      ║
    ║  Handles: registry, nav, label mode,      ║
    ║  calc steps, connectors, toasts, modals   ║
    ╚═══════════════════════════════════════════╝ */

window.PhysLab = (function () {
  const experiments = {};
  let currentKey = null;
  let currentMode = null; // 'label' | 'experiment'
  let matched = {};
  let selectedLabel = null;
  let activeLine = null;

  // ── Public: register an experiment ──
  function register(key, config) {
    /*  config = {
          title, labelTitle, expTitle,
          labelDesc, expDesc,
          labels: [{id, text, hint}],
          targetDots: {id: {x, y}},
          renderDiagram: fn(container),
          initExp: fn(),
        }  */
    experiments[key] = config;
  }

  // ── Navigation ──
  function goHome() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageLanding').classList.add('active');
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('btnReset').style.display = 'none';
    document.getElementById('modalOverlay').classList.remove('visible');
    selectedLabel = null;
    clearConnectorSvg();
    currentKey = null;
    currentMode = null;
  }

  function showModePicker(key) {
    currentKey = key;
    const e = experiments[key];
    if (!e) return;
    const labSimOption = e.initLabSim ? `<div class="mode-option" onclick="PhysLab.loadLabSim('${key}')"><h3>Lab Simulation</h3><p>${e.labSimDesc || 'Perform the full experiment yourself — take your own readings in real time.'}</p></div>` : '';
    document.getElementById('modePickerInner').innerHTML = `
      <h2>${e.title}</h2><p>Choose how you'd like to learn this experiment.</p>
      <div class="mode-options">
        <div class="mode-option" onclick="PhysLab.loadLabel('${key}')"><h3>Label Mode</h3><p>${e.labelDesc}</p></div>
        <div class="mode-option" onclick="PhysLab.loadExp('${key}')"><h3>Calculation Mode</h3><p>${e.expDesc}</p></div>
        ${labSimOption}
      </div>
      <div style="margin-top:16px;text-align:center"><button class="btn" onclick="PhysLab.hideModePicker()">Cancel</button></div>`;
    document.getElementById('modePicker').classList.add('visible');
  }

  function hideModePicker() {
    document.getElementById('modePicker').classList.remove('visible');
  }

  function resetCurrent() {
    if (currentMode === 'label') {
      matched = {};
      selectedLabel = null;
      document.getElementById('scoreCount').textContent = '0';
      document.getElementById('modalOverlay').classList.remove('visible');
      clearConnectorSvg();
      renderLabelMode(experiments[currentKey]);
    } else if ((currentMode === 'experiment' || currentMode === 'labsim') && experiments[currentKey]) {
      if (currentMode === 'labsim' && experiments[currentKey].initLabSim) {
        experiments[currentKey].initLabSim();
      } else {
        experiments[currentKey].initExp();
      }
    }
  }

  function loadLabSim(key) {
    hideModePicker();
    currentKey = key;
    currentMode = 'labsim';
    const e = experiments[key];
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageExpMode').classList.add('active');
    document.getElementById('expModeTitle').textContent = e.labSimTitle || (e.title + ' — Lab Simulation');
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('btnReset').style.display = '';
    e.initLabSim();
  }

  // ── Label Mode ──
  function loadLabel(key) {
    hideModePicker();
    currentKey = key;
    currentMode = 'label';
    matched = {};
    selectedLabel = null;
    const e = experiments[key];
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageLabelMode').classList.add('active');
    document.getElementById('labelTitle').textContent = e.labelTitle;
    document.getElementById('scoreDisplay').style.display = '';
    document.getElementById('btnReset').style.display = '';
    document.getElementById('scoreTotal').textContent = e.labels.length;
    document.getElementById('scoreCount').textContent = '0';
    renderLabelMode(e);
  }

  function renderLabelMode(e) {
    const panel = document.getElementById('diagramPanel');
    const lp = document.getElementById('labelsPanel');
    panel.innerHTML = '';
    lp.innerHTML = '<div class="labels-heading">Labels</div><div class="labels-instruction">Click a label, then click the matching point on the diagram.</div>';

    e.renderDiagram(panel);

    Object.entries(e.targetDots).forEach(([id, pos]) => {
      const d = document.createElement('div');
      d.className = 'target-dot';
      d.dataset.id = id;
      d.style.left = pos.x + '%';
      d.style.top = pos.y + '%';
      if (matched[id]) d.classList.add('matched');
      d.addEventListener('click', () => handleDotClick(id, e));
      d.addEventListener('mouseenter', () => { if (selectedLabel && !matched[id]) d.classList.add('active'); });
      d.addEventListener('mouseleave', () => d.classList.remove('active'));
      panel.appendChild(d);
    });

    const shuffled = [...e.labels].sort(() => Math.random() - 0.5);
    shuffled.forEach(l => {
      const it = document.createElement('div');
      it.className = 'label-item';
      it.dataset.id = l.id;
      if (matched[l.id]) it.classList.add('matched');
      it.innerHTML = `${l.text}<span class="label-hint">${l.hint}</span>`;
      it.addEventListener('click', () => {
        if (matched[l.id]) return;
        if (selectedLabel === l.id) {
          selectedLabel = null;
          document.querySelectorAll('.label-item.selected').forEach(el => el.classList.remove('selected'));
        } else {
          selectedLabel = l.id;
          document.querySelectorAll('.label-item.selected').forEach(el => el.classList.remove('selected'));
          it.classList.add('selected');
        }
      });
      lp.appendChild(it);
    });
    drawMatchedLines(e);
  }

  function handleDotClick(dotId, e) {
    if (!selectedLabel || matched[dotId]) return;
    if (selectedLabel === dotId) {
      matched[dotId] = true;
      document.querySelector(`.target-dot[data-id="${dotId}"]`)?.classList.add('matched');
      const l = document.querySelector(`.label-item[data-id="${dotId}"]`);
      if (l) { l.classList.remove('selected'); l.classList.add('matched'); }
      selectedLabel = null;
      document.getElementById('scoreCount').textContent = Object.keys(matched).length;
      showToast('Correct!', 'success');
      drawMatchedLines(e);
      if (Object.keys(matched).length === e.labels.length) {
        setTimeout(() => document.getElementById('modalOverlay').classList.add('visible'), 600);
      }
    } else {
      const d = document.querySelector(`.target-dot[data-id="${dotId}"]`);
      if (d) { d.classList.add('wrong'); setTimeout(() => d.classList.remove('wrong'), 500); }
      showToast('Not quite — try again', 'error');
    }
  }

  // ── Connector lines ──
  function drawMatchedLines(e) {
    clearConnectorSvg();
    const svg = document.getElementById('connectorSvg');
    const p = document.getElementById('diagramPanel');
    if (!p || !e) return;
    const pr = p.getBoundingClientRect();
    Object.keys(matched).forEach(id => {
      const dp = e.targetDots[id];
      const el = document.querySelector(`.label-item[data-id="${id}"]`);
      if (!dp || !el) return;
      const lr = el.getBoundingClientRect();
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('matched-line');
      line.setAttribute('x1', pr.left + dp.x / 100 * pr.width);
      line.setAttribute('y1', pr.top + dp.y / 100 * pr.height);
      line.setAttribute('x2', lr.left);
      line.setAttribute('y2', lr.top + lr.height / 2);
      svg.appendChild(line);
    });
  }

  function clearConnectorSvg() {
    document.getElementById('connectorSvg').innerHTML = '';
  }

  // Mouse tracking for active line
  document.addEventListener('mousemove', e => {
    if (currentMode !== 'label' || !selectedLabel || matched[selectedLabel]) {
      if (activeLine) { activeLine.remove(); activeLine = null; }
      return;
    }
    const svg = document.getElementById('connectorSvg');
    const el = document.querySelector(`.label-item[data-id="${selectedLabel}"]`);
    if (!el) return;
    if (!activeLine) {
      activeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      activeLine.classList.add('active-line');
      svg.appendChild(activeLine);
    }
    const r = el.getBoundingClientRect();
    activeLine.setAttribute('x1', r.left);
    activeLine.setAttribute('y1', r.top + r.height / 2);
    activeLine.setAttribute('x2', e.clientX);
    activeLine.setAttribute('y2', e.clientY);
  });

  // Click empty space to deselect
  document.addEventListener('click', e => {
    if (currentMode !== 'label') return;
    if (!e.target.closest('.label-item') && !e.target.closest('.target-dot')) {
      selectedLabel = null;
      document.querySelectorAll('.label-item.selected').forEach(el => el.classList.remove('selected'));
      if (activeLine) { activeLine.remove(); activeLine = null; }
    }
  });

  window.addEventListener('resize', () => {
    if (currentMode === 'label' && currentKey) drawMatchedLines(experiments[currentKey]);
  });
  window.addEventListener('scroll', () => {
    if (currentMode === 'label' && currentKey) drawMatchedLines(experiments[currentKey]);
  }, true);

  // ── Experiment Mode ──
  function loadExp(key) {
    hideModePicker();
    currentKey = key;
    currentMode = 'experiment';
    const e = experiments[key];
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('pageExpMode').classList.add('active');
    document.getElementById('expModeTitle').textContent = e.expTitle;
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('btnReset').style.display = '';
    e.initExp();
  }

  // ── Difficulty ──
  let calcDifficulty = 'standard'; // 'standard' | 'exam'

  function setCalcDifficulty(d) {
    calcDifficulty = d;
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.className = 'btn diff-btn' + (b.dataset.diff === d ? ' btn-primary' : '');
    });
  }

  // Builds a difficulty selector + injects into a container
  function buildDifficultySelector(parentId) {
    const el = document.getElementById(parentId);
    if (!el) return;
    const sel = document.createElement('div');
    sel.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
    sel.innerHTML = `
      <button class="btn diff-btn${calcDifficulty==='standard'?' btn-primary':''}" data-diff="standard" onclick="PhysLab.setCalcDifficulty('standard')" style="flex:1;font-size:11px;padding:6px 8px">Standard</button>
      <button class="btn diff-btn${calcDifficulty==='exam'?' btn-primary':''}" data-diff="exam" onclick="PhysLab.setCalcDifficulty('exam')" style="flex:1;font-size:11px;padding:6px 8px">Exam</button>`;
    el.insertBefore(sel, el.querySelector('.calc-steps'));
  }

  // ── Shared Calc Steps Builder ──
  function buildCalcSteps(containerId, steps, onComplete) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Difficulty selector
    const selDiv = document.createElement('div');
    selDiv.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
    selDiv.innerHTML = `
      <button class="btn diff-btn${calcDifficulty==='standard'?' btn-primary':''}" data-diff="standard" onclick="PhysLab.setCalcDifficulty('standard');PhysLab._rebuildCurrentCalc()" style="flex:1;font-size:11px;padding:6px 8px">Standard</button>
      <button class="btn diff-btn${calcDifficulty==='exam'?' btn-primary':''}" data-diff="exam" onclick="PhysLab.setCalcDifficulty('exam');PhysLab._rebuildCurrentCalc()" style="flex:1;font-size:11px;padding:6px 8px">Exam</button>`;
    container.appendChild(selDiv);

    const d = calcDifficulty;
    const isExam = d === 'exam';
    const lastIdx = steps.length - 1;

    steps.forEach((step, i) => {
      const div = document.createElement('div');
      div.id = 'step-' + step.id;
      div._stepData = step;
      div._index = i;

      if (isExam) {
        // ── EXAM: Only the final step gets an input. Previous steps just show what to find. ──
        const isLast = i === lastIdx;
        const examLabel = step.examLabel || step.label.replace(/Step \d+:\s*/i, '');
        div.className = 'calc-step';
        if (isLast) {
          div.innerHTML = `
            <div class="step-label" style="font-size:13px;font-weight:600;color:var(--text)">Find: ${examLabel}</div>
            <div class="step-input-row" style="margin-top:8px">
              <input type="text" id="input-${step.id}" placeholder="Enter your answer" autocomplete="off">
              <button class="btn btn-primary step-check" onclick="PhysLab.checkStep('${containerId}','${step.id}')">Submit</button>
            </div>
            <div class="step-result" id="result-${step.id}" style="display:none"></div>`;
        } else {
          // Just show what this quantity is — no input, no formula
          div.style.cssText = 'padding:8px 14px;opacity:.6;';
          div.innerHTML = `<div class="step-label" style="margin:0">${examLabel}</div>`;
        }
      } else {
        // ── STANDARD: current behaviour ──
        const locked = i > 0;
        div.className = 'calc-step' + (locked ? ' locked' : '');
        div.innerHTML = `
          <div class="step-label">${step.label}</div>
          <div class="step-formula">${step.formula}</div>
          <div class="step-hint" onclick="this.nextElementSibling.style.display='block';this.style.display='none'">Show hint</div>
          <div class="step-hint-text">${step.hint}</div>
          <div class="step-input-row">
            <input type="text" id="input-${step.id}" placeholder="${step.placeholder}" autocomplete="off">
            <button class="btn btn-primary step-check" onclick="PhysLab.checkStep('${containerId}','${step.id}')">Check</button>
          </div>
          <div class="step-result" id="result-${step.id}" style="display:none"></div>`;
      }

      container.appendChild(div);
    });

    container._steps = steps;
    container._onComplete = onComplete;
    container._containerId = containerId;
    // Store for rebuild on difficulty change
    _lastCalcBuild = { containerId, steps, onComplete };
    typesetMathJax();
  }

  let _lastCalcBuild = null;
  function _rebuildCurrentCalc() {
    if (_lastCalcBuild) {
      buildCalcSteps(_lastCalcBuild.containerId, _lastCalcBuild.steps, _lastCalcBuild.onComplete);
    }
  }

  function checkStep(containerId, stepId) {
    const container = document.getElementById(containerId);
    const steps = container._steps;
    const stepDiv = document.getElementById('step-' + stepId);
    const step = stepDiv._stepData;
    const idx = stepDiv._index;
    const input = document.getElementById('input-' + stepId);
    const resultDiv = document.getElementById('result-' + stepId);
    const num = step.isInteger ? parseInt(input.value.trim()) : parseFloat(input.value.trim().replace(/\s/g, ''));
    const d = calcDifficulty;

    if (isNaN(num)) {
      resultDiv.style.display = 'block';
      resultDiv.className = 'step-result wrong';
      resultDiv.textContent = d === 'exam'
        ? 'Invalid input.'
        : 'Enter a valid number (use e notation, e.g. 3.45e-15)';
      return;
    }

    const ratio = step.isInteger ? Math.abs(num - step.answer) : Math.abs(num - step.answer) / Math.abs(step.answer);
    const ok = step.isInteger ? (num === step.answer) : (ratio < step.tolerance);

    if (ok) {
      resultDiv.style.display = 'block';
      resultDiv.className = 'step-result correct';
      if (d === 'exam') {
        resultDiv.textContent = '✓ Correct';
      } else {
        resultDiv.textContent = '✓ Correct! ';
        const s = document.createElement('span');
        s.innerHTML = step.formatAnswer();
        resultDiv.appendChild(s);
      }
      stepDiv.classList.add('complete');
      input.disabled = true;
      typesetMathJax();
      // Unlock next (standard only — guided and exam don't lock)
      if (d === 'standard' && idx < steps.length - 1) {
        document.getElementById('step-' + steps[idx + 1].id).classList.remove('locked');
      }
      if (idx === steps.length - 1 && container._onComplete) container._onComplete();
    } else {
      resultDiv.style.display = 'block';
      resultDiv.className = 'step-result wrong';
      if (d === 'exam') {
        resultDiv.textContent = '✗ Incorrect.';
      } else {
        resultDiv.textContent = step.isInteger
          ? '✗ Not quite. Check your division.'
          : `✗ Not quite (${num.toExponential(2)}). Check your working.`;
      }
    }
  }

  // ── Helpers ──
  function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast visible ' + type;
    setTimeout(() => t.classList.remove('visible'), 1400);
  }

  function typesetMathJax() {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
      MathJax.typesetPromise().catch(e => console.log('MathJax:', e));
    }
  }

  function tex(val, dp) {
    dp = dp || 2;
    const exp = Math.floor(Math.log10(Math.abs(val)));
    const c = (val / Math.pow(10, exp)).toFixed(dp);
    return c + ' \\times 10^{' + exp + '}';
  }

  // ── Theme ──
  function setTheme(theme) {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('.theme-option').forEach(el => el.classList.toggle('active', (el.dataset.theme || '') === theme));
    const dd = document.getElementById('themeDropdown'); if (dd) dd.classList.remove('open');
    try { localStorage.setItem('physlab-theme', theme) } catch(e) {}
  }
  try { const s = localStorage.getItem('physlab-theme'); if (s) { document.documentElement.setAttribute('data-theme', s); setTimeout(() => document.querySelectorAll('.theme-option').forEach(el => el.classList.toggle('active', (el.dataset.theme || '') === s)), 0) } } catch(e) {}
  document.addEventListener('click', e => { if (!e.target.closest('.theme-picker')) { const dd = document.getElementById('themeDropdown'); if (dd) dd.classList.remove('open') } });

  // ══════════════════════════════════════════════════
  //  SHARED INTERACTIVE GRAPH ANALYSIS ENGINE
  // ══════════════════════════════════════════════════
  // Usage: const ga = PhysLab.createGraphAnalysis({ ... })
  // Then ga.render() to draw, ga.getResults() after line drawn

  function createGraphAnalysis(config) {
    /*  config = {
          container: DOM element (the sim diagram div),
          title: 'ln V vs t',
          xLabel: 't / s',
          yLabel: 'ln V',
          data: [{x, y}],         // the data points
          xKey: 'x', yKey: 'y',   // keys in data objects (optional, default x/y)
          onLineDrawn: fn({gradient, intercept, lsGradient, lsIntercept, lsR2, lsSE}) — called when user draws line
        }  */
    const xK = config.xKey || 'x', yK = config.yKey || 'y';
    const data = config.data.map(d => ({ x: d[xK], y: d[yK], outlier: d.isOutlier || false }));
    const n = data.length;

    // Least-squares
    let Sx=0,Sy=0,Sxy=0,Sxx=0;
    data.forEach(d => { Sx+=d.x; Sy+=d.y; Sxy+=d.x*d.y; Sxx+=d.x*d.x });
    const lsM = (n*Sxy - Sx*Sy) / (n*Sxx - Sx*Sx);
    const lsB = (Sy - lsM*Sx) / n;
    const meanY = Sy/n;
    let ssRes=0, ssTot=0;
    data.forEach(d => { const pred=lsM*d.x+lsB; ssRes+=(d.y-pred)**2; ssTot+=(d.y-meanY)**2 });
    const lsR2 = ssTot>0 ? 1-ssRes/ssTot : 1;
    const lsSE = n>2 ? Math.sqrt(ssRes/(n-2)/((n*Sxx-Sx*Sx)/n)) : 0;

    // State
    let linePoints = [];
    let userM = null, userB = null;
    let showLS = false;
    let mousePos = null;

    // Axis range with padding
    const xs = data.map(d=>d.x), ys = data.map(d=>d.y);
    const xMin = 0, xMax = Math.max(...xs) * 1.2;
    const yPad = (Math.max(...ys)-Math.min(...ys)) * 0.15 || 0.5;
    const yMin = Math.min(...ys) - yPad, yMax = Math.max(...ys) + yPad;

    const gx=120, gw=790, gy=80, gh=520;
    const sx = v => gx + (v-xMin)/(xMax-xMin)*gw;
    const sy = v => gy + gh - (v-yMin)/(yMax-yMin)*gh;

    function render() {
      const c = config.container;
      const canClick = linePoints.length < 2;

      // Data dots
      const dots = data.map(d => `<circle cx="${sx(d.x)}" cy="${sy(d.y)}" r="5" fill="${d.outlier?'#c0392b':'#3d6b8e'}" stroke="#fff" stroke-width="1.5"/>`).join('');

      // Clicked markers
      let cd = '';
      linePoints.forEach(p => {
        cd += `<circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="8" fill="none" stroke="var(--accent)" stroke-width="2.5"/><circle cx="${sx(p.x)}" cy="${sy(p.y)}" r="3" fill="var(--accent)"/>`;
      });

      // Rubber band
      let rb = '';
      if (linePoints.length === 1 && mousePos) {
        const p = linePoints[0];
        rb = `<line x1="${sx(p.x)}" y1="${sy(p.y)}" x2="${mousePos.x}" y2="${mousePos.y}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6,4" opacity=".5"/>`;
      }

      // User line
      let ul = '';
      if (userM !== null) {
        ul = `<line x1="${sx(xMin)}" y1="${sy(userM*xMin+userB)}" x2="${sx(xMax)}" y2="${sy(userM*xMax+userB)}" stroke="var(--accent)" stroke-width="2.5" opacity=".7"/>`;
      }

      // LS line
      let ll = '';
      if (showLS) {
        ll = `<line x1="${sx(xMin)}" y1="${sy(lsM*xMin+lsB)}" x2="${sx(xMax)}" y2="${sy(lsM*xMax+lsB)}" stroke="#c0392b" stroke-width="2" stroke-dasharray="8,5" opacity=".7"/>`;
      }

      // Legend
      let leg = '';
      if (userM !== null) leg += `<rect x="${gx+gw-220}" y="${gy+12}" width="14" height="3" fill="var(--accent)" rx="1"/><text x="${gx+gw-200}" y="${gy+16}" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--accent)">Your line</text>`;
      if (showLS) leg += `<line x1="${gx+gw-220}" y1="${gy+32}" x2="${gx+gw-206}" y2="${gy+32}" stroke="#c0392b" stroke-width="2" stroke-dasharray="4,3"/><text x="${gx+gw-200}" y="${gy+36}" font-family="IBM Plex Mono,monospace" font-size="10" fill="#c0392b">Least-squares (R²=${lsR2.toFixed(3)})</text>`;

      // Ticks
      let ticks = '';
      for (let i=0;i<=6;i++){const v=xMin+i*(xMax-xMin)/6;ticks+=`<line x1="${sx(v)}" y1="${gy+gh}" x2="${sx(v)}" y2="${gy+gh+6}" stroke="#8898b0" stroke-width="1"/><text x="${sx(v)}" y="${gy+gh+20}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">${v.toFixed(config.xDP||1)}</text>`}
      for (let i=0;i<=5;i++){const v=yMin+i*(yMax-yMin)/5;ticks+=`<line x1="${gx-6}" y1="${sy(v)}" x2="${gx}" y2="${sy(v)}" stroke="#8898b0" stroke-width="1"/><text x="${gx-10}" y="${sy(v)+4}" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">${v.toFixed(config.yDP||1)}</text><line x1="${gx}" y1="${sy(v)}" x2="${gx+gw}" y2="${sy(v)}" stroke="#e8e4dc" stroke-width=".5"/>`}

      const subtitle = canClick ? (linePoints.length===0 ? 'Click two points to draw your best-fit line' : 'Click a second point to complete your line') : '';

      c.innerHTML = `<svg id="labGraphSvg" viewBox="0 0 1000 700" style="width:100%;height:100%;display:block;cursor:${canClick?'crosshair':'default'}">
        <rect width="1000" height="700" style="fill:var(--diagram-bg)"/>
        <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" style="fill:var(--surface);stroke:var(--border)" rx="4"/>
        ${ticks}
        <line x1="${gx}" y1="${gy+gh}" x2="${gx+gw}" y2="${gy+gh}" style="stroke:var(--text-muted)" stroke-width="1.5"/>
        <line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy+gh}" style="stroke:var(--text-muted)" stroke-width="1.5"/>
        <text x="${gx+gw/2}" y="${gy+gh+45}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" style="fill:var(--text-dim)">${config.xLabel}</text>
        <text x="${gx-50}" y="${gy+gh/2}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" style="fill:var(--text-dim)" transform="rotate(-90,${gx-50},${gy+gh/2})">${config.yLabel}</text>
        ${ll}${ul}${rb}${dots}${cd}${leg}
        <text x="${gx+gw/2}" y="55" text-anchor="middle" font-family="DM Serif Display,serif" font-size="18" fill="#2c2c2c">${config.title}</text>
        <text x="${gx+gw/2}" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="#9a9490">${subtitle}</text>
      </svg>`;

      if (canClick) {
        const svgEl = document.getElementById('labGraphSvg');
        if (svgEl) {
          svgEl.onclick = handleClick;
          svgEl.onmousemove = handleMouseMove;
        }
      }
    }

    function handleClick(e) {
      if (linePoints.length >= 2) return;
      const svg = document.getElementById('labGraphSvg'); if (!svg) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      if (sp.x < gx || sp.x > gx+gw || sp.y < gy || sp.y > gy+gh) return;

      const xVal = xMin + (sp.x-gx)/gw * (xMax-xMin);
      const yVal = yMax - (sp.y-gy)/gh * (yMax-yMin);
      linePoints.push({ x: xVal, y: yVal });

      if (linePoints.length === 2) {
        const p1=linePoints[0], p2=linePoints[1];
        userM = (p2.y-p1.y)/(p2.x-p1.x);
        userB = p1.y - userM*p1.x;
        mousePos = null;
        if (config.onLineDrawn) {
          config.onLineDrawn({ gradient:userM, intercept:userB, lsGradient:lsM, lsIntercept:lsB, lsR2, lsSE });
        }
      }
      render();
    }

    function handleMouseMove(e) {
      if (linePoints.length !== 1) return;
      const svg = document.getElementById('labGraphSvg'); if (!svg) return;
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const sp = pt.matrixTransform(svg.getScreenCTM().inverse());
      mousePos = { x: sp.x, y: sp.y };
      render();
    }

    function revealLS() { showLS = true; render(); }

    function reset() {
      linePoints = []; userM = null; userB = null; showLS = false; mousePos = null;
      render();
    }

    function getResults() {
      return { gradient:userM, intercept:userB, lsGradient:lsM, lsIntercept:lsB, lsR2, lsSE };
    }

    return { render, revealLS, reset, getResults };
  }

  return {
    register,
    goHome,
    showModePicker,
    hideModePicker,
    loadLabel,
    loadExp,
    loadLabSim,
    resetCurrent,
    buildCalcSteps,
    checkStep,
    setCalcDifficulty,
    _rebuildCurrentCalc,
    showToast,
    typesetMathJax,
    tex,
    createGraphAnalysis,
    setTheme,
    getSimDiagram: () => document.getElementById('simDiagram'),
    getSimSidebar: () => document.getElementById('simSidebar'),
  };
})();