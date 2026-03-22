/*  Capacitor Charge & Discharge (RP09)
    - Label / Calculation / Lab Simulation with noise slider + full analysis  */

(function () {

  // ══════ LABEL SVG ══════
  function renderDiagram(container) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1000 700'); svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.classList.add('main-diagram');
    svg.innerHTML = `<defs><filter id="cds"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".15"/></filter></defs><rect width="1000" height="700" fill="#faf8f4"/><g filter="url(#cds)"><rect x="100" y="200" width="80" height="50" rx="6" fill="#3e4860" stroke="#5a6a80"/><text x="140" y="230" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#4a7cff">V₀</text></g><g filter="url(#cds)"><circle cx="300" cy="225" r="15" fill="#fff" stroke="#3e4860" stroke-width="2"/><line x1="290" y1="225" x2="312" y2="215" stroke="#3e4860" stroke-width="2.5" stroke-linecap="round"/></g><g filter="url(#cds)"><rect x="420" y="210" width="80" height="30" rx="4" fill="#e8e4dc" stroke="#b8b4aa"/><text x="460" y="230" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#5a6a80">R</text></g><g filter="url(#cds)"><line x1="630" y1="200" x2="630" y2="250" stroke="#3e4860" stroke-width="4"/><line x1="660" y1="200" x2="660" y2="250" stroke="#3e4860" stroke-width="4"/><text x="645" y="270" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#5a6a80">C</text></g><g filter="url(#cds)"><circle cx="645" cy="380" r="28" fill="#fff" stroke="#3e4860" stroke-width="2"/><text x="645" y="376" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="16" fill="#3e4860">V</text></g><g filter="url(#cds)"><circle cx="540" cy="225" r="20" fill="#fff" stroke="#3e4860" stroke-width="1.5"/><text x="540" y="222" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="12" fill="#3e4860">A</text></g><path d="M180,225 L280,225" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M315,215 L420,225" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M500,225 L520,225" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M560,225 L630,225" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M660,225 L750,225 L750,450 L100,450 L100,250" fill="none" stroke="#2980b9" stroke-width="2.5"/><text x="500" y="680" text-anchor="middle" font-family="DM Serif Display,serif" font-size="15" fill="#b8b4aa">Capacitor Charge &amp; Discharge — RP09</text>`;
    container.appendChild(svg);
  }

  // ══════ CALCULATION MODE ══════
  let trialData = null;
  function initExp() {
    const R=[10e3,22e3,47e3,100e3][0|Math.random()*4],C=[100e-6,220e-6,470e-6,1000e-6][0|Math.random()*4],tau=R*C,V0=6+(0|Math.random()*4)*2;
    const readings=[];for(let i=0;i<=8;i++){const t=i*tau*.5;const V=V0*Math.exp(-t/tau)*(1+(Math.random()-.5)*.02);readings.push({t,V,lnV:Math.log(V)})}
    trialData={R,C,tau,V0,readings};
    const r1=readings[1],r7=readings[7],grad=(r7.lnV-r1.lnV)/(r7.t-r1.t),tc=-1/grad,Cc=tc/R,T=PhysLab.tex;
    const sb=PhysLab.getSimSidebar();
    sb.innerHTML=`<div class="sim-card"><h3>Setup</h3><div class="constants-ref">\\(R=${(R/1e3).toFixed(0)}\\;\\text{k}\\Omega\\), \\(V_0=${V0}\\;\\text{V}\\)</div></div><div class="sim-card"><h3>Discharge Readings</h3><table class="data-table"><tr><th>\\(t\\)/s</th><th>\\(V\\)/V</th><th>\\(\\ln V\\)</th></tr>${readings.map(r=>`<tr><td>${r.t.toFixed(2)}</td><td>${r.V.toFixed(2)}</td><td>${r.lnV.toFixed(3)}</td></tr>`).join('')}</table></div><div class="sim-card"><h3>Find \\(\\tau\\) and \\(C\\)</h3><div class="calc-steps" id="cdCalcSteps"></div></div><div id="cdResult" style="display:none"></div><button class="btn btn-primary" id="cdBtnNew" style="display:none;width:100%" onclick="PhysLab._capacitor.init()">New</button>`;
    const c=PhysLab.getSimDiagram(),pts=Array.from({length:50},(_,i)=>{const t=i*tau*4/49;return`${100+i*16},${550-V0*Math.exp(-t/tau)/V0*400}`}).join(' ');
    c.innerHTML=`<svg viewBox="0 0 1000 700" style="width:100%;height:100%;display:block"><rect width="1000" height="700" fill="#faf8f4"/><line x1="100" y1="550" x2="900" y2="550" stroke="#8898b0" stroke-width="1.5"/><line x1="100" y1="550" x2="100" y2="100" stroke="#8898b0" stroke-width="1.5"/><polyline points="${pts}" fill="none" stroke="#3d6b8e" stroke-width="2.5"/>${readings.map(r=>`<circle cx="${100+(r.t/(tau*4))*800}" cy="${550-r.V/V0*400}" r="4" fill="#3d6b8e" stroke="#fff" stroke-width="1.5"/>`).join('')}</svg>`;
    PhysLab.buildCalcSteps('cdCalcSteps',[{id:'cdG',label:'Gradient of ln(V) vs t',formula:`\\[\\text{grad}=\\frac{\\Delta\\ln V}{\\Delta t}\\]`,answer:grad,tolerance:.08,formatAnswer:()=>`\\(${grad.toFixed(4)}\\;\\text{s}^{-1}\\)`,hint:`${grad.toFixed(4)}`,placeholder:'e.g. -0.215'},{id:'cdT',label:'τ',formula:`\\[\\tau=-1/\\text{grad}\\]`,answer:tc,tolerance:.08,formatAnswer:()=>`\\(\\tau=${tc.toFixed(2)}\\;\\text{s}\\)`,hint:`${tc.toFixed(2)}`,placeholder:'e.g. 4.65'},{id:'cdC',label:'C',formula:`\\[C=\\tau/R\\]`,answer:Cc,tolerance:.1,formatAnswer:()=>`\\(C=${(Cc*1e6).toFixed(0)}\\;\\mu\\text{F}\\)`,hint:`${T(Cc)}`,placeholder:'e.g. 4.7e-4'}],()=>{document.getElementById('cdResult').style.display='';document.getElementById('cdResult').innerHTML=`<div class="trial-result"><h3>Complete!</h3><div class="charge-value">\\(\\tau=${tc.toFixed(2)}\\;\\text{s}\\), \\(C=${(Cc*1e6).toFixed(0)}\\;\\mu\\text{F}\\)</div></div>`;document.getElementById('cdBtnNew').style.display='';PhysLab.typesetMathJax()});
    PhysLab.typesetMathJax();
  }

  // ══════ LAB SIMULATION ══════
  let lab = null;

  function initLabSim() {
    const R=[10e3,22e3,47e3,100e3][0|Math.random()*4];
    const C=[220e-6,470e-6,1000e-6,2200e-6][0|Math.random()*4];
    const tau=R*C, V0=[6,9,12][0|Math.random()*3];
    lab={R,C,tau,V0,state:'idle',voltage:0,time:0,readings:[],animFrame:null,dischStartTime:0,
      noiseLevel:0.02, // default 2%
      graphMode:'V',linePoints:[],userGradient:null,userIntercept:null,lsGradient:null,lsIntercept:null,lsR2:null,showLS:false,_mousePos:null};

    const sb=PhysLab.getSimSidebar();
    sb.innerHTML=`
      <div class="sim-card"><h3>Circuit</h3><div class="constants-ref" style="font-size:13px">\\(R=${(R/1e3).toFixed(0)}\\;\\text{k}\\Omega\\)<br>\\(C=\\;?\\) (to determine)<br>Supply: \\(${V0}\\;\\text{V}\\)</div></div>

      <div class="sim-card" id="labControls"><h3>Controls</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:10px;line-height:1.5">Charge, discharge, and record readings in real time.</p>

        <label style="font-size:12px;font-weight:500;color:var(--text-dim)">Experimental Noise</label>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          <input type="range" id="labNoiseSlider" min="0" max="15" value="2" step="1" style="flex:1;accent-color:var(--accent)" oninput="PhysLab._capacitor.setNoise(this.value)">
          <span id="labNoiseVal" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text-dim);min-width:35px">±2%</span>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn btn-primary" id="labBtnCharge" onclick="PhysLab._capacitor.labCharge()" style="flex:1">Charge</button>
          <button class="btn" id="labBtnDischarge" onclick="PhysLab._capacitor.labDischarge()" style="flex:1" disabled>Discharge</button>
        </div>
        <div id="labStatus" style="font-size:13px;color:var(--text-muted);min-height:20px">Set noise level, then press Charge.</div>
      </div>

      <div class="sim-card"><h3>Meters</h3>
        <div style="display:flex;gap:12px;margin-bottom:10px">
          <div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px">VOLTMETER</div><div id="labVoltDisplay" style="font-family:'IBM Plex Mono',monospace;font-size:28px;color:var(--accent);background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px">0.00 V</div></div>
          <div style="flex:1;text-align:center"><div style="font-size:10px;color:var(--text-muted);margin-bottom:3px">STOPWATCH</div><div id="labTimeDisplay" style="font-family:'IBM Plex Mono',monospace;font-size:28px;color:var(--text);background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px">0.0 s</div></div>
        </div>
        <button class="btn btn-primary" id="labBtnRecord" onclick="PhysLab._capacitor.labRecord()" style="width:100%" disabled>Record Reading</button>
      </div>

      <div class="sim-card"><h3>Your Data</h3>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Aim for 8–10 readings.</p>
        <table class="data-table"><thead><tr><th>#</th><th>\\(t\\)/s</th><th>\\(V\\)/V</th><th>\\(\\ln V\\)</th></tr></thead><tbody id="labDataBody"></tbody></table>
        <div style="margin-top:10px;display:flex;gap:8px">
          <button class="btn" id="labBtnUndo" onclick="PhysLab._capacitor.labUndo()" disabled style="flex:1">Undo</button>
          <button class="btn btn-primary" id="labBtnAnalyse" onclick="PhysLab._capacitor.labAnalyse()" disabled style="flex:1">Analyse →</button>
        </div>
      </div>

      <div class="sim-card" id="labAnalysisCard" style="display:none">
        <h3>Graph Analysis</h3>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="btn" id="labBtnViewV" onclick="PhysLab._capacitor.setGraphMode('V')" style="flex:1;opacity:.5">V vs t</button>
          <button class="btn btn-primary" id="labBtnViewLn" onclick="PhysLab._capacitor.setGraphMode('lnV')" style="flex:1">ln V vs t</button>
        </div>
        <p id="labGraphInstruction" style="font-size:12px;color:var(--accent);line-height:1.5;margin-bottom:8px">Click two points on the ln V graph to draw your best-fit line.</p>
        <div id="labLineInfo" style="font-size:12px;color:var(--text-dim);min-height:20px"></div>
        <button class="btn" id="labBtnRedraw" onclick="PhysLab._capacitor.labRedraw()" style="display:none;width:100%;margin-top:8px">Redraw Line</button>
      </div>

      <div class="sim-card" id="labStatsCard" style="display:none">
        <h3>Statistics</h3>
        <div id="labStatsContent" style="font-size:12px;color:var(--text-dim);line-height:1.8"></div>
      </div>

      <div class="sim-card" id="labCalcCard" style="display:none">
        <h3>Calculate \\(\\tau\\) and \\(C\\)</h3>
        <div class="calc-steps" id="labCalcSteps"></div>
      </div>

      <div id="labResult" style="display:none"></div>
      <button class="btn btn-primary" id="labBtnNewCircuit" style="display:none;width:100%" onclick="PhysLab._capacitor.initLab()">New Circuit</button>`;

    renderLabDiagram();
    PhysLab.typesetMathJax();
  }

  function setNoise(val) {
    lab.noiseLevel = parseInt(val) / 100;
    document.getElementById('labNoiseVal').textContent = '±' + val + '%';
  }

  // ── Charge / Discharge / Record ──
  function labCharge() {
    if(lab.state!=='idle')return;lab.state='charging';
    document.getElementById('labBtnCharge').disabled=true;document.getElementById('labBtnCharge').textContent='Charging…';
    document.getElementById('labNoiseSlider').disabled=true;
    document.getElementById('labStatus').innerHTML='<span style="color:var(--accent)">Charging…</span>';
    const t0=performance.now();
    (function a(){const f=Math.min((performance.now()-t0)/2000,1);lab.voltage=lab.V0*(1-Math.exp(-3*f));document.getElementById('labVoltDisplay').textContent=lab.voltage.toFixed(2)+' V';renderLabDiagram();if(f<1)lab.animFrame=requestAnimationFrame(a);else{lab.voltage=lab.V0;lab.state='charged';document.getElementById('labVoltDisplay').textContent=lab.V0.toFixed(2)+' V';document.getElementById('labBtnCharge').textContent='✓ Charged';document.getElementById('labBtnDischarge').disabled=false;document.getElementById('labStatus').innerHTML='<span style="color:var(--success)">Charged. Press Discharge when ready.</span>';renderLabDiagram()}})();
  }

  function labDischarge() {
    if(lab.state!=='charged')return;lab.state='discharging';lab.dischStartTime=performance.now();lab.time=0;lab.readings=[];
    document.getElementById('labBtnDischarge').disabled=true;document.getElementById('labBtnDischarge').textContent='Discharging…';
    document.getElementById('labBtnRecord').disabled=false;
    document.getElementById('labStatus').innerHTML='<span style="color:#d4960a">Discharging — record now!</span>';
    (function a(){if(lab.state!=='discharging')return;const el=(performance.now()-lab.dischStartTime)/1000;lab.time=el;
      // Live display has tiny flicker
      lab.voltage=Math.max(0,lab.V0*Math.exp(-el/lab.tau)*(1+Math.sin(el*47)*.002));
      document.getElementById('labVoltDisplay').textContent=lab.voltage.toFixed(2)+' V';document.getElementById('labTimeDisplay').textContent=el.toFixed(1)+' s';renderLabDiagram();
      if(lab.voltage<0.01){lab.state='discharged';lab.voltage=0;document.getElementById('labVoltDisplay').textContent='0.00 V';document.getElementById('labBtnRecord').disabled=true;document.getElementById('labBtnDischarge').textContent='✓ Done';document.getElementById('labStatus').innerHTML='<span style="color:var(--success)">Complete. Analyse your data.</span>';if(lab.readings.length>=3)document.getElementById('labBtnAnalyse').disabled=false;renderLabDiagram();return}
      lab.animFrame=requestAnimationFrame(a)})();
  }

  function labRecord() {
    if(lab.state!=='discharging'||lab.voltage<0.05)return;
    const t=parseFloat(lab.time.toFixed(1));
    // Apply noise to the RECORDED value (simulates reading error)
    const trueV=lab.V0*Math.exp(-t/lab.tau);
    const noise=1+(Math.random()-0.5)*2*lab.noiseLevel;
    // Small chance of outlier at high noise
    const outlierChance=lab.noiseLevel>0.05?0.08:0;
    const isOutlier=Math.random()<outlierChance;
    const outlierFactor=isOutlier?(1+(Math.random()-0.5)*0.4):1;
    const V=parseFloat(Math.max(0.01,trueV*noise*outlierFactor).toFixed(2));
    const lnV=Math.log(V);

    lab.readings.push({t,V,lnV,isOutlier});
    const idx=lab.readings.length;
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${idx}</td><td>${t.toFixed(1)}</td><td>${V.toFixed(2)}</td><td>${lnV.toFixed(3)}</td>`;
    if(isOutlier) tr.style.color='var(--error)';
    tr.style.animation='modalIn 0.2s ease';
    document.getElementById('labDataBody').appendChild(tr);
    document.getElementById('labBtnUndo').disabled=false;if(lab.readings.length>=3)document.getElementById('labBtnAnalyse').disabled=false;
    const btn=document.getElementById('labBtnRecord');btn.textContent='✓';btn.style.background='var(--success)';setTimeout(()=>{btn.textContent='Record Reading';btn.style.background=''},350);
    PhysLab.showToast(`#${idx}: ${V.toFixed(2)} V at ${t.toFixed(1)} s`,'success');renderLabDiagram();
  }

  function labUndo() {
    if(!lab.readings.length)return;lab.readings.pop();const tb=document.getElementById('labDataBody');if(tb.lastChild)tb.removeChild(tb.lastChild);
    document.getElementById('labBtnUndo').disabled=!lab.readings.length;document.getElementById('labBtnAnalyse').disabled=lab.readings.length<3;renderLabDiagram();
  }

  // ── Compute stats ──
  function computeLS() {
    const r=lab.readings,n=r.length;
    let St=0,Sl=0,Stl=0,Stt=0;
    r.forEach(d=>{St+=d.t;Sl+=d.lnV;Stl+=d.t*d.lnV;Stt+=d.t*d.t});
    const m=(n*Stl-St*Sl)/(n*Stt-St*St);
    const b=(Sl-m*St)/n;
    // R² = 1 - SS_res/SS_tot
    const meanLn=Sl/n;
    let ssRes=0,ssTot=0;
    r.forEach(d=>{const pred=m*d.t+b;ssRes+=(d.lnV-pred)**2;ssTot+=(d.lnV-meanLn)**2});
    const R2=1-ssRes/ssTot;
    // Uncertainty in gradient (standard error)
    const se=Math.sqrt(ssRes/(n-2)/((n*Stt-St*St)/n));
    lab.lsGradient=m;lab.lsIntercept=b;lab.lsR2=R2;lab.lsSE=se;
  }

  // ── Analysis Mode ──
  function labAnalyse() {
    if(lab.readings.length<3)return;lab.state='analysis';if(lab.animFrame)cancelAnimationFrame(lab.animFrame);
    document.getElementById('labBtnRecord').disabled=true;document.getElementById('labBtnAnalyse').disabled=true;
    document.getElementById('labAnalysisCard').style.display='';

    computeLS();
    lab.graphMode='lnV';lab.linePoints=[];lab.userGradient=null;lab.showLS=false;lab._mousePos=null;
    renderLabDiagram();PhysLab.typesetMathJax();
  }

  function labRedraw() {
    lab.linePoints=[];lab.userGradient=null;lab.userIntercept=null;lab.showLS=false;lab._mousePos=null;
    document.getElementById('labBtnRedraw').style.display='none';
    document.getElementById('labCalcCard').style.display='none';
    document.getElementById('labStatsCard').style.display='none';
    document.getElementById('labResult').style.display='none';
    document.getElementById('labBtnNewCircuit').style.display='none';
    document.getElementById('labGraphInstruction').textContent='Click two points on the graph to draw your best-fit line.';
    document.getElementById('labLineInfo').innerHTML='';
    renderLabDiagram();
  }

  function setGraphMode(mode) {
    lab.graphMode=mode;
    document.getElementById('labBtnViewV').style.opacity=mode==='V'?'1':'.5';
    document.getElementById('labBtnViewV').className=mode==='V'?'btn btn-primary':'btn';
    document.getElementById('labBtnViewLn').style.opacity=mode==='lnV'?'1':'.5';
    document.getElementById('labBtnViewLn').className=mode==='lnV'?'btn btn-primary':'btn';
    renderLabDiagram();
  }

  // ── Graph Click ──
  function handleGraphClick(e) {
    if(lab.state!=='analysis'||lab.graphMode!=='lnV'||lab.linePoints.length>=2)return;
    const svg=document.getElementById('labGraphSvg');if(!svg)return;
    const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
    const sp=pt.matrixTransform(svg.getScreenCTM().inverse());
    const gx=120,gw=790,gy=80,gh=520;
    if(sp.x<gx||sp.x>gx+gw||sp.y<gy||sp.y>gy+gh)return;
    const r=lab.readings,tMin=0,tMax=r[r.length-1].t*1.2;
    const lnVals=r.map(d=>d.lnV),lnMin=Math.min(...lnVals)-.3,lnMax=Math.max(...lnVals)+.3;
    const tc=tMin+(sp.x-gx)/gw*(tMax-tMin);
    const lc=lnMax-(sp.y-gy)/gh*(lnMax-lnMin);
    lab.linePoints.push({t:tc,lnV:lc});

    if(lab.linePoints.length===1){
      document.getElementById('labLineInfo').innerHTML='<span style="color:var(--accent)">Point 1 placed. Click a second point far from the first.</span>';
      document.getElementById('labGraphInstruction').textContent='Click a second point…';
    }

    if(lab.linePoints.length===2){
      const p1=lab.linePoints[0],p2=lab.linePoints[1];
      lab.userGradient=(p2.lnV-p1.lnV)/(p2.t-p1.t);
      lab.userIntercept=p1.lnV-lab.userGradient*p1.t;

      // Show redraw option
      document.getElementById('labBtnRedraw').style.display='';
      document.getElementById('labGraphInstruction').innerHTML='Your line is in <strong style="color:var(--accent)">blue</strong>. Calculate below, or redraw.';
      document.getElementById('labLineInfo').innerHTML=`
        <div style="background:var(--accent-glow);border:1px solid var(--accent);border-radius:var(--radius-sm);padding:10px;font-size:12px">
          <strong>Your line:</strong> gradient = \\(${lab.userGradient.toFixed(4)}\\;\\text{s}^{-1}\\)<br>
          y-intercept = \\(${lab.userIntercept.toFixed(3)}\\) (expect \\(\\ln V_0=${Math.log(lab.V0).toFixed(3)}\\))
        </div>`;

      // Show calc + stats
      document.getElementById('labCalcCard').style.display='';
      showCalcSteps();
      PhysLab.typesetMathJax();
    }
    renderLabDiagram();
  }

  function showCalcSteps() {
    const T=PhysLab.tex,grad=lab.userGradient,tc=-1/grad,Cc=tc/lab.R;
    PhysLab.buildCalcSteps('labCalcSteps',[
      {id:'lG',label:'Step 1: Gradient (from your line)',formula:`\\[\\text{gradient}=\\frac{-1}{\\tau}\\]`,answer:grad,tolerance:.2,formatAnswer:()=>`\\(${grad.toFixed(4)}\\;\\text{s}^{-1}\\)`,hint:`Your line gives gradient = ${grad.toFixed(4)}`,placeholder:'e.g. -0.215'},
      {id:'lT',label:'Step 2: Time constant τ',formula:`\\[\\tau=\\frac{-1}{\\text{gradient}}\\]`,answer:tc,tolerance:.2,formatAnswer:()=>`\\(\\tau=${tc.toFixed(2)}\\;\\text{s}\\)`,hint:`\\(\\tau=${tc.toFixed(2)}\\;\\text{s}\\)`,placeholder:'e.g. 4.65'},
      {id:'lC',label:'Step 3: Capacitance',formula:`\\[C=\\frac{\\tau}{R}\\]`,answer:Cc,tolerance:.22,formatAnswer:()=>`\\(C=${T(Cc)}\\;\\text{F}=${(Cc*1e6).toFixed(0)}\\;\\mu\\text{F}\\)`,hint:`\\(C=${T(Cc)}\\;\\text{F}\\)`,placeholder:'e.g. 4.7e-4'},
    ],()=>{
      // Reveal LS line + stats + result
      lab.showLS=true;renderLabDiagram();
      showStats();
      showResult();
    });
  }

  function showStats() {
    document.getElementById('labStatsCard').style.display='';
    const ls_tau=-1/lab.lsGradient,user_tau=-1/lab.userGradient;
    const actual_tau=lab.R*lab.C;
    const user_pct=Math.abs(user_tau-actual_tau)/actual_tau*100;
    const ls_pct=Math.abs(ls_tau-actual_tau)/actual_tau*100;
    // Uncertainty: δτ/τ = δm/m → δτ = τ² × δm
    const delta_tau_ls=lab.lsSE*ls_tau*ls_tau;

    document.getElementById('labStatsContent').innerHTML=`
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">Your readings</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">${lab.readings.length} points</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">Noise setting</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">±${(lab.noiseLevel*100).toFixed(0)}%</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">\\(R^2\\) (least-squares)</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace;color:${lab.lsR2>.99?'var(--success)':lab.lsR2>.95?'var(--accent)':'var(--error)'}">${lab.lsR2.toFixed(4)}</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">LS gradient ± SE</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">${lab.lsGradient.toFixed(4)} ± ${lab.lsSE.toFixed(4)}</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">\\(\\tau\\) (LS) ± uncertainty</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">${ls_tau.toFixed(2)} ± ${delta_tau_ls.toFixed(2)} s</td></tr>
        <tr style="border-bottom:1px solid var(--border)"><td style="padding:4px 0;color:var(--text-muted)">Your \\(\\tau\\) vs actual</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">${user_tau.toFixed(2)} s (${user_pct.toFixed(1)}% off)</td></tr>
        <tr><td style="padding:4px 0;color:var(--text-muted)">LS \\(\\tau\\) vs actual</td><td style="padding:4px 0;font-family:'IBM Plex Mono',monospace">${ls_tau.toFixed(2)} s (${ls_pct.toFixed(1)}% off)</td></tr>
      </table>
      <div style="margin-top:10px;padding:10px;background:var(--bg);border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:var(--text-dim)">
        ${lab.lsR2>.995?'\\(R^2\\) very close to 1 — excellent linearity, minimal scatter.':
          lab.lsR2>.98?'\\(R^2\\) is high — good data quality. Small scatter visible.':
          lab.lsR2>.95?'\\(R^2\\) indicates moderate scatter. More readings or lower noise would improve the fit.':
          'Significant scatter in the data. The relationship is still clear but uncertainty is high.'}
        ${user_pct<3?' Your line is very close to the LS fit — good graphical technique.':
          user_pct<8?' Your line is reasonable — try placing points closer to the trend centre.':
          ' Your line diverges from the LS fit. Try the "Redraw" button to improve.'}
      </div>`;
    PhysLab.typesetMathJax();
  }

  function showResult() {
    const tc=-1/lab.userGradient,Cc=tc/lab.R,actual_tau=lab.R*lab.C,pct=Math.abs(tc-actual_tau)/actual_tau*100;const T=PhysLab.tex;
    const d=document.getElementById('labResult');d.style.display='';
    d.innerHTML=`<div class="trial-result"><h3>Lab Complete!</h3>
      <div class="charge-value">\\(\\tau=${tc.toFixed(2)}\\;\\text{s}\\)</div>
      <div class="multiple">\\(C=${(Cc*1e6).toFixed(0)}\\;\\mu\\text{F}\\) (actual: ${(lab.C*1e6).toFixed(0)} μF)</div>
      <p style="margin-top:8px;font-size:12px;color:var(--text-dim);line-height:1.6">
        <span style="color:var(--accent)">━━</span> Your line &nbsp;&nbsp;
        <span style="color:#c0392b">┅┅</span> Least-squares fit<br>
        ${pct<5?'Excellent result!':pct<12?'Good — check the stats panel for details.':'Try redrawing your line or recording more evenly-spaced data.'}
      </p>
    </div>`;
    document.getElementById('labBtnNewCircuit').style.display='';
    PhysLab.typesetMathJax();
  }

  // ══════ RENDER ══════
  function renderLabDiagram() {
    const c=PhysLab.getSimDiagram();if(!lab)return;
    if(lab.state==='analysis'){renderAnalysisGraph(c);return}
    const V=lab.voltage,V0=lab.V0,vFrac=V/V0,isD=lab.state==='discharging';
    const capFill=`rgba(74,124,255,${vFrac*.4})`;
    const sw=(lab.state==='idle'||lab.state==='charging')?-20:20;
    let gp='',ld='';
    if(lab.readings.length>0){const mt=Math.max(lab.tau*5,lab.readings[lab.readings.length-1].t*1.2);
      gp=lab.readings.map(r=>`<circle cx="${590+(r.t/mt)*345}" cy="${615-(r.V/V0)*240}" r="4" fill="${r.isOutlier?'#c0392b':'#3d6b8e'}" stroke="#fff" stroke-width="1.5"/>`).join('');
      if(isD){const cx=Math.min(590+(lab.time/mt)*345,935),cy=Math.max(615-vFrac*240,375);ld=`<circle cx="${cx}" cy="${cy}" r="6" fill="#c0392b" opacity=".5"><animate attributeName="r" values="6;9;6" dur="1s" repeatCount="indefinite"/></circle>`}}
    const st=lab.state==='idle'?'Ready':lab.state==='charging'?'Charging…':lab.state==='charged'?'Charged':isD?'DISCHARGING':lab.state==='discharged'?'Complete':'';
    const sc=isD?'#c0392b':lab.state==='charged'?'var(--success)':'#9a9490';
    c.innerHTML=`<svg viewBox="0 0 1000 700" style="width:100%;height:100%;display:block"><defs><filter id="lsf"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".15"/></filter></defs><rect width="1000" height="700" fill="#faf8f4"/><g filter="url(#lsf)"><rect x="40" y="180" width="80" height="50" rx="6" fill="#3e4860" stroke="#5a6a80"/><text x="80" y="210" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="#4a7cff">${V0} V</text></g><g filter="url(#lsf)"><circle cx="200" cy="205" r="14" fill="#fff" stroke="#3e4860" stroke-width="2"/><line x1="190" y1="205" x2="${200+18*Math.cos(sw*Math.PI/180)}" y2="${205+18*Math.sin(sw*Math.PI/180)}" stroke="${isD?'#c0392b':'#3e4860'}" stroke-width="3" stroke-linecap="round"/></g><g filter="url(#lsf)"><rect x="280" y="190" width="80" height="30" rx="4" fill="#e8e4dc" stroke="#b8b4aa"/><text x="320" y="210" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#5a6a80">${(lab.R/1e3).toFixed(0)}kΩ</text></g><g filter="url(#lsf)"><rect x="425" y="170" width="8" height="70" rx="1" fill="#3e4860"/><rect x="455" y="170" width="8" height="70" rx="1" fill="#3e4860"/><rect x="435" y="${170+70*(1-vFrac)}" width="18" height="${Math.max(1,70*vFrac)}" fill="${capFill}" rx="2"/></g><path d="M120,205 L186,205" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M214,205 L280,205" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M360,205 L425,205" fill="none" stroke="#c0392b" stroke-width="2.5"/><path d="M463,205 L520,205 L520,320 L40,320 L40,230" fill="none" stroke="#2980b9" stroke-width="2.5"/><g filter="url(#lsf)"><rect x="380" y="350" width="130" height="70" rx="8" fill="#fff" stroke="#3e4860" stroke-width="2"/><text x="445" y="340" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#6b6560">VOLTMETER</text><text x="440" y="395" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="28" fill="${isD?'#c0392b':'var(--accent)'}">${V.toFixed(2)}</text><text x="486" y="395" font-family="IBM Plex Mono,monospace" font-size="12" fill="#6b6560">V</text></g><path d="M425,240 L425,350" fill="none" stroke="#5a6a80" stroke-width="1.5" stroke-dasharray="4,4"/><path d="M463,240 L463,350" fill="none" stroke="#5a6a80" stroke-width="1.5" stroke-dasharray="4,4"/><rect x="555" y="355" width="400" height="280" rx="6" fill="#fff" stroke="#d4cfc5"/><line x1="580" y1="620" x2="940" y2="620" stroke="#8898b0" stroke-width="1"/><line x1="580" y1="620" x2="580" y2="370" stroke="#8898b0" stroke-width="1"/><text x="760" y="647" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">t / s</text><text x="565" y="365" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">V</text>${gp}${ld}<text x="280" y="470" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="12" fill="${sc}">${st}</text></svg>`;
  }

  function renderAnalysisGraph(c) {
    const r=lab.readings,isLn=lab.graphMode==='lnV';
    // Add 5% padding on left so t=0 doesn't sit on axis
    const tMin=0, tMax=r[r.length-1].t*1.2;
    let yMin,yMax,yLbl;
    if(isLn){const v=r.map(d=>d.lnV);yMin=Math.min(...v)-.3;yMax=Math.max(...v)+.3;yLbl='ln V'}
    else{yMin=0;yMax=lab.V0*1.1;yLbl='V / V'}
    const gx=120,gw=790,gy=80,gh=520;
    const sx=t=>gx+(t-tMin)/(tMax-tMin)*gw, sy=v=>gy+gh-(v-yMin)/(yMax-yMin)*gh;

    const dots=r.map(d=>{const v=isLn?d.lnV:d.V;return`<circle cx="${sx(d.t)}" cy="${sy(v)}" r="5" fill="${d.isOutlier?'#c0392b':'#3d6b8e'}" stroke="#fff" stroke-width="1.5"/>`}).join('');

    let cd='',ul='',ll='',leg='',rubberBand='';
    if(isLn){
      // Clicked point markers
      lab.linePoints.forEach(p=>{cd+=`<circle cx="${sx(p.t)}" cy="${sy(p.lnV)}" r="8" fill="none" stroke="var(--accent)" stroke-width="2.5"/><circle cx="${sx(p.t)}" cy="${sy(p.lnV)}" r="3" fill="var(--accent)"/>`});

      // After first click: rubber-band line from point 1 to current mouse position
      if(lab.linePoints.length===1&&lab._mousePos){
        const p=lab.linePoints[0];
        rubberBand=`<line x1="${sx(p.t)}" y1="${sy(p.lnV)}" x2="${lab._mousePos.x}" y2="${lab._mousePos.y}" stroke="var(--accent)" stroke-width="2" stroke-dasharray="6,4" opacity=".5"/>`;
      }

      // Final user line (solid)
      if(lab.userGradient!==null){
        ul=`<line x1="${sx(tMin)}" y1="${sy(lab.userIntercept)}" x2="${sx(tMax)}" y2="${sy(lab.userGradient*tMax+lab.userIntercept)}" stroke="var(--accent)" stroke-width="2.5" opacity=".7"/>`;
        leg+=`<rect x="${gx+gw-220}" y="${gy+12}" width="14" height="3" fill="var(--accent)" rx="1"/><text x="${gx+gw-200}" y="${gy+16}" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--accent)">Your line</text>`;
      }
      // LS line (dashed red, shown after completion)
      if(lab.showLS){
        ll=`<line x1="${sx(tMin)}" y1="${sy(lab.lsIntercept)}" x2="${sx(tMax)}" y2="${sy(lab.lsGradient*tMax+lab.lsIntercept)}" stroke="#c0392b" stroke-width="2" stroke-dasharray="8,5" opacity=".7"/>`;
        leg+=`<line x1="${gx+gw-220}" y1="${gy+32}" x2="${gx+gw-206}" y2="${gy+32}" stroke="#c0392b" stroke-width="2" stroke-dasharray="4,3"/><text x="${gx+gw-200}" y="${gy+36}" font-family="IBM Plex Mono,monospace" font-size="10" fill="#c0392b">Least-squares (R²=${lab.lsR2.toFixed(3)})</text>`;
      }
    }

    let ticks='';
    for(let i=0;i<=6;i++){const t=tMin+i*(tMax-tMin)/6;ticks+=`<line x1="${sx(t)}" y1="${gy+gh}" x2="${sx(t)}" y2="${gy+gh+6}" stroke="#8898b0" stroke-width="1"/><text x="${sx(t)}" y="${gy+gh+20}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">${t.toFixed(1)}</text>`}
    for(let i=0;i<=5;i++){const v=yMin+i*(yMax-yMin)/5;ticks+=`<line x1="${gx-6}" y1="${sy(v)}" x2="${gx}" y2="${sy(v)}" stroke="#8898b0" stroke-width="1"/><text x="${gx-10}" y="${sy(v)+4}" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" fill="#9a9490">${v.toFixed(1)}</text><line x1="${gx}" y1="${sy(v)}" x2="${gx+gw}" y2="${sy(v)}" stroke="#e8e4dc" stroke-width=".5"/>`}

    c.innerHTML=`<svg id="labGraphSvg" viewBox="0 0 1000 700" style="width:100%;height:100%;display:block;cursor:${isLn&&lab.linePoints.length<2?'crosshair':'default'}">
    <rect width="1000" height="700" fill="#faf8f4"/>
    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="#fff" stroke="#d4cfc5" rx="4"/>
    ${ticks}
    <line x1="${gx}" y1="${gy+gh}" x2="${gx+gw}" y2="${gy+gh}" stroke="#8898b0" stroke-width="1.5"/>
    <line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy+gh}" stroke="#8898b0" stroke-width="1.5"/>
    <text x="${gx+gw/2}" y="${gy+gh+45}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="#6b6560">t / s</text>
    <text x="${gx-50}" y="${gy+gh/2}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="#6b6560" transform="rotate(-90,${gx-50},${gy+gh/2})">${yLbl}</text>
    ${ll}${ul}${rubberBand}${dots}${cd}${leg}
    <text x="${gx+gw/2}" y="55" text-anchor="middle" font-family="DM Serif Display,serif" font-size="18" fill="#2c2c2c">${isLn?'ln V vs t':'V vs t'}</text>
    <text x="${gx+gw/2}" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="#9a9490">${isLn?(lab.linePoints.length===0?'Click two points to define your best-fit line':lab.linePoints.length===1?'Now click a second point to complete your line':''):'Switch to ln V view to draw your line'}</text>
    </svg>`;
    if(isLn&&lab.linePoints.length<2){
      const s=document.getElementById('labGraphSvg');
      if(s){
        s.onclick=handleGraphClick;
        s.onmousemove=function(e){
          if(lab.linePoints.length!==1)return;
          const pt=s.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
          const sp=pt.matrixTransform(s.getScreenCTM().inverse());
          lab._mousePos={x:sp.x,y:sp.y};
          renderAnalysisGraph(c);
        };
      }
    }
  }

  // ══════ EXPOSE ══════
  PhysLab._capacitor={init:initExp,initLab:initLabSim,labCharge,labDischarge,labRecord,labUndo,labAnalyse,labRedraw,setGraphMode,setNoise};

  PhysLab.register('capacitor',{
    title:"Capacitor Charge & Discharge",
    labelTitle:"Capacitor Charge & Discharge — Label Mode",
    expTitle:"Capacitor Discharge — Calculation Mode",
    labSimTitle:"Capacitor Discharge — Lab Simulation",
    labelDesc:"Identify each component of the RC circuit. 10 labels.",
    expDesc:"Given discharge data, calculate τ = RC and determine C.",
    labSimDesc:"Full lab: charge, discharge in real time, record readings with adjustable noise, then analyse with interactive graphing — draw your best-fit line and compare to least-squares.",
    labels:[{id:'battery',text:'Battery / PSU',hint:'Charges to V₀'},{id:'switch2',text:'Two-Way Switch',hint:'Charge or discharge'},{id:'resistor',text:'Resistor R',hint:'Controls rate'},{id:'capacitor',text:'Capacitor C',hint:'Stores charge'},{id:'voltmeter',text:'Voltmeter',hint:'Across C'},{id:'ammeter',text:'Ammeter',hint:'In series'},{id:'logger',text:'Data Logger',hint:'Records over time'},{id:'charge_wire',text:'Charging Circuit',hint:'Battery path'},{id:'discharge_wire',text:'Discharge Circuit',hint:'Through R'},{id:'v_across_c',text:'Voltage Across C',hint:'Exponential decay'}],
    targetDots:{battery:{x:14,y:31},switch2:{x:30,y:31},resistor:{x:46,y:31},capacitor:{x:65,y:31},voltmeter:{x:65,y:55},ammeter:{x:54,y:31},logger:{x:86,y:52},charge_wire:{x:22,y:25},discharge_wire:{x:55,y:65},v_across_c:{x:65,y:42}},
    renderDiagram,initExp,initLabSim,
  });
})();
