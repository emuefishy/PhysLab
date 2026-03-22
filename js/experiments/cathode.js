/*  Cathode Rays e/m — Label + Calc + Lab Sim  */
(function(){
  const C={e:1.6e-19,me:9.11e-31,emRatio:1.76e11};
  let trial=null;

  function renderDiagram(container){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1000 700');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.classList.add('main-diagram');svg.innerHTML=`<defs><filter id="lcs"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".15"/></filter><radialGradient id="lcsc" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#68d391" stop-opacity=".6"/><stop offset="100%" stop-color="#68d391" stop-opacity="0"/></radialGradient></defs><rect width="1000" height="700" fill="#faf8f4"/><rect x="60" y="230" width="880" height="240" rx="120" fill="#e8eef4" stroke="#a0b0c4" stroke-width="2.5" opacity=".5"/><rect x="60" y="230" width="880" height="240" rx="120" fill="none" stroke="#8898b0"/><g filter="url(#lcs)"><rect x="90" y="310" width="12" height="80" rx="2" fill="#5a6a80" stroke="#7a8a9e"/></g><line x1="96" y1="320" x2="96" y2="380" stroke="#f59e0b" stroke-width="2" opacity=".5"/><g filter="url(#lcs)"><rect x="180" y="300" width="8" height="100" rx="2" fill="#5a6a80" stroke="#7a8a9e"/></g><rect x="178" y="340" width="12" height="20" fill="#e8eef4"/><line x1="106" y1="350" x2="530" y2="350" stroke="#4a7cff" stroke-width="3" opacity=".5"/>${Array.from({length:15},(_,i)=>`<circle cx="${120+i*28}" cy="350" r="2" fill="#4a7cff" opacity=".7"><animate attributeName="cx" values="${120+i*28};${530}" dur="${.6+i*.04}s" repeatCount="indefinite"/></circle>`).join('')}<g filter="url(#lcs)"><rect x="320" y="270" width="160" height="8" rx="2" fill="#c0392b" stroke="#a0302a"/></g><g filter="url(#lcs)"><rect x="320" y="422" width="160" height="8" rx="2" fill="#2980b9" stroke="#1a6090"/></g>${Array.from({length:4},(_,i)=>`<line x1="${350+i*35}" y1="290" x2="${350+i*35}" y2="415" stroke="#c0392b" stroke-width=".6" stroke-dasharray="4,8" opacity=".15"/>`).join('')}<rect x="530" y="260" width="180" height="180" rx="8" fill="#9b59b6" opacity=".05" stroke="#9b59b6" stroke-dasharray="4,4"/>${Array.from({length:9},(_,i)=>{const r=Math.floor(i/3),cl=i%3;return`<text x="${570+cl*50}" y="${305+r*50}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="16" fill="#9b59b6" opacity=".35">×</text>`}).join('')}<path d="M530,350 C 580,310 700,260 920,290" fill="none" stroke="#4a7cff" stroke-width="2.5" opacity=".5" stroke-linecap="round" stroke-dasharray="6,4"/><circle cx="916" cy="290" r="4" fill="#4a7cff" opacity=".6"/><g filter="url(#lcs)"><rect x="920" y="260" width="16" height="180" rx="4" fill="#2d3748" stroke="#4a5568"/></g><rect x="920" y="260" width="16" height="180" rx="4" fill="url(#lcsc)" opacity=".5"/><circle cx="928" cy="292" r="6" fill="#68d391" opacity=".7"/><ellipse cx="620" cy="215" rx="100" ry="18" fill="none" stroke="#9b59b6" stroke-width="3" opacity=".25"/><ellipse cx="620" cy="485" rx="100" ry="18" fill="none" stroke="#9b59b6" stroke-width="3" opacity=".25"/><g filter="url(#lcs)"><rect x="100" y="560" width="90" height="55" rx="6" fill="#3e4860" stroke="#5a6a80"/><text x="145" y="592" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#4a7cff">V_a</text></g><line x1="96" y1="395" x2="96" y2="560" stroke="#c0392b" stroke-width="2"/><line x1="184" y1="405" x2="184" y2="575" stroke="#2980b9" stroke-width="2"/><g filter="url(#lcs)"><rect x="340" y="560" width="90" height="55" rx="6" fill="#3e4860" stroke="#5a6a80"/><text x="385" y="592" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="#4a7cff">V_d</text></g><line x1="400" y1="430" x2="400" y2="560" stroke="#c0392b" stroke-width="1.5"/><line x1="420" y1="278" x2="420" y2="560" stroke="#2980b9" stroke-width="1.5"/><text x="500" y="680" text-anchor="middle" font-family="DM Serif Display,serif" font-size="15" fill="#b8b4aa">Cathode Ray Tube — e/m Apparatus</text>`;container.appendChild(svg)}

  function renderSim(t){const c=PhysLab.getSimDiagram();const rPx=Math.min(Math.max(t.r*400,30),180);c.innerHTML=`<svg viewBox="0 0 1000 700" style="width:100%;height:100%;display:block"><defs><filter id="cs2"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".15"/></filter></defs><rect width="1000" height="700" fill="#faf8f4"/><rect x="60" y="230" width="880" height="240" rx="120" fill="#e8eef4" stroke="#a0b0c4" stroke-width="2.5" opacity=".5"/><rect x="60" y="230" width="880" height="240" rx="120" fill="none" stroke="#8898b0"/><g filter="url(#cs2)"><rect x="90" y="310" width="12" height="80" rx="2" fill="#5a6a80" stroke="#7a8a9e"/></g><g filter="url(#cs2)"><rect x="180" y="300" width="8" height="100" rx="2" fill="#5a6a80" stroke="#7a8a9e"/></g><line x1="106" y1="350" x2="530" y2="350" stroke="#4a7cff" stroke-width="3" opacity=".6"/><rect x="530" y="260" width="180" height="180" rx="8" fill="#9b59b6" opacity=".05" stroke="#9b59b6" stroke-dasharray="4,4"/>${Array.from({length:9},(_,i)=>{const row=Math.floor(i/3),col=i%3;return`<text x="${570+col*50}" y="${305+row*50}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="16" fill="#9b59b6" opacity=".4">×</text>`}).join('')}<path d="M530,350 C 580,${350-rPx*0.4} 700,${350-rPx*1.1} 920,${350-rPx*0.7}" fill="none" stroke="#4a7cff" stroke-width="3" opacity=".6" stroke-linecap="round"/><circle cx="916" cy="${350-rPx*0.7}" r="5" fill="#4a7cff" opacity=".8"/><g filter="url(#cs2)"><rect x="920" y="260" width="16" height="180" rx="4" fill="#2d3748" stroke="#4a5568"/></g><circle cx="928" cy="${350-rPx*0.7}" r="6" fill="#68d391" opacity=".8"/><ellipse cx="620" cy="210" rx="100" ry="20" fill="none" stroke="#9b59b6" stroke-width="3" opacity=".3"/><ellipse cx="620" cy="490" rx="100" ry="20" fill="none" stroke="#9b59b6" stroke-width="3" opacity=".3"/><g filter="url(#cs2)"><rect x="100" y="560" width="90" height="60" rx="6" fill="#3e4860" stroke="#5a6a80"/><text x="145" y="595" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="#4a7cff">${t.Va} V</text></g><text x="500" y="680" text-anchor="middle" font-family="DM Serif Display,serif" font-size="15" fill="#b8b4aa">Cathode Ray Tube — e/m</text></svg>`}

  function initExp(){
    let Va,B,v,r,ok=false;while(!ok){Va=Math.round((500+Math.random()*4500)/10)*10;v=Math.sqrt(2*C.e*Va/C.me);B=(0.5+Math.random()*4.5)*1e-3;r=C.me*v/(C.e*B);ok=r>0.01&&r<0.5}
    trial={Va,B,v,r};const T=PhysLab.tex;const sb=PhysLab.getSimSidebar();
    sb.innerHTML=`<div class="sim-card"><h3>Constants</h3><div class="constants-ref">\\(e=1.60\\times10^{-19}\\;\\text{C}\\), \\(m_e=9.11\\times10^{-31}\\;\\text{kg}\\)<br>\\(e/m_e=1.76\\times10^{11}\\;\\text{C kg}^{-1}\\)</div></div><div class="sim-card"><h3>Readings</h3><table class="data-table"><tr><th>Quantity</th><th>Value</th></tr><tr><td>\\(V_a\\)</td><td>\\(${Va}\\;\\text{V}\\)</td></tr><tr><td>\\(B\\)</td><td>\\(${T(B)}\\;\\text{T}\\)</td></tr><tr><td>\\(r\\)</td><td>\\(${(r*100).toFixed(1)}\\;\\text{cm}=${r.toFixed(3)}\\;\\text{m}\\)</td></tr></table></div><div class="sim-card"><h3>Calculate \\(e/m\\)</h3><div class="calc-steps" id="cCalcSteps"></div></div><div id="cResult" style="display:none"></div><button class="btn btn-primary" id="cBtnNew" style="display:none;width:100%" onclick="PhysLab._cathode.init()">New Trial</button>`;
    renderSim(trial);const v_calc=Math.sqrt(2*C.e*Va/C.me),em_calc=2*Va/(B*B*r*r);
    PhysLab.buildCalcSteps('cCalcSteps',[{id:'cv',label:'Step 1: Electron speed',formula:`\\[v=\\sqrt{2\\cdot\\frac{e}{m}\\cdot V_a}\\]`,answer:v_calc,tolerance:.08,formatAnswer:()=>`\\(v=${T(v_calc)}\\;\\text{m s}^{-1}\\)`,hint:`\\(v=\\sqrt{2\\times1.76\\times10^{11}\\times${Va}}=${T(v_calc)}\\)`,placeholder:'e.g. 4.20e7'},{id:'cem',label:'Step 2: e/m',formula:`\\[\\frac{e}{m}=\\frac{2V_a}{B^2r^2}\\]`,answer:em_calc,tolerance:.1,formatAnswer:()=>`\\(e/m=${T(em_calc)}\\;\\text{C kg}^{-1}\\)`,hint:`\\(\\frac{2\\times${Va}}{(${T(B)})^2(${r.toFixed(3)})^2}=${T(em_calc)}\\)`,placeholder:'e.g. 1.76e11'}],()=>{const d=document.getElementById('cResult');d.style.display='';d.innerHTML=`<div class="trial-result"><h3>Complete!</h3><div class="charge-value">\\(e/m=${T(em_calc)}\\;\\text{C kg}^{-1}\\)</div></div>`;document.getElementById('cBtnNew').style.display='';PhysLab.typesetMathJax()});
    PhysLab.typesetMathJax();
  }

  // ── Lab Sim: user adjusts Va slider, reads r from ruler on diagram ──
  let labNoise=0.02;
  function initLabSim(){
    let Va,B,v,r,ok=false;while(!ok){Va=Math.round((500+Math.random()*4500)/10)*10;v=Math.sqrt(2*C.e*Va/C.me);B=(0.5+Math.random()*4.5)*1e-3;r=C.me*v/(C.e*B);ok=r>0.01&&r<0.5}
    trial={Va,B,v,r};labNoise=0.02;
    const T=PhysLab.tex,sb=PhysLab.getSimSidebar();
    sb.innerHTML=`
      <div class="sim-card"><h3>Constants</h3><div class="constants-ref">\\(e=1.60\\times10^{-19}\\;\\text{C}\\), \\(m_e=9.11\\times10^{-31}\\;\\text{kg}\\)</div></div>
      <div class="sim-card"><h3>Controls</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:10px;line-height:1.5">Adjust \\(V_a\\) and observe the beam curvature. The magnetic field \\(B\\) is fixed.</p>
        <label style="font-size:12px;font-weight:500;color:var(--text-dim)">Measurement Noise</label>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><input type="range" id="clNoiseSlider" min="0" max="15" value="2" step="1" style="flex:1;accent-color:var(--accent)" oninput="PhysLab._cathode.setNoise(this.value)"><span id="clNoiseVal" style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text-dim);min-width:35px">±2%</span></div>
        <label>\\(V_a\\) (accelerating voltage)</label>
        <input type="range" id="clVaSlider" min="500" max="5000" value="${Va}" step="10" style="width:100%" oninput="PhysLab._cathode.labUpdateVa(this.value)">
        <div class="value-display" id="clVaDisplay">${Va} V</div>
        <div style="margin-top:8px"><strong>\\(B\\) = \\(${T(B)}\\;\\text{T}\\)</strong> (fixed)</div>
      </div>
      <div class="sim-card"><h3>Take Reading</h3>
        <p style="font-size:12px;color:var(--text-dim);margin-bottom:10px;line-height:1.5">Read the beam radius from the ruler on the diagram and record it.</p>
        <button class="btn btn-primary" id="clBtnRead" onclick="PhysLab._cathode.labReadRadius()" style="width:100%">Record Radius Reading</button>
        <div id="clReadingDisplay" style="display:none;margin-top:12px"></div>
      </div>
      <div class="sim-card" id="clCalcCard" style="display:none"><h3>Calculate \\(e/m\\)</h3><div class="calc-steps" id="clCalcSteps"></div></div>
      <div id="clResult" style="display:none"></div>
      <button class="btn btn-primary" id="clBtnNew" style="display:none;width:100%" onclick="PhysLab._cathode.initLab()">New Trial</button>`;
    renderSim(trial);PhysLab.typesetMathJax();
  }

  function labUpdateVa(val){trial.Va=+val;document.getElementById('clVaDisplay').textContent=val+' V';trial.v=Math.sqrt(2*C.e*trial.Va/C.me);trial.r=C.me*trial.v/(C.e*trial.B);renderSim(trial)}
  function setNoiseCathode(val){labNoise=parseInt(val)/100;document.getElementById('clNoiseVal').textContent='±'+val+'%'}

  function labReadRadius(){
    const noise=1+(Math.random()-0.5)*2*labNoise;
    const r_meas=trial.r*noise;
    const Va=trial.Va,B=trial.B,T=PhysLab.tex;
    document.getElementById('clBtnRead').disabled=true;document.getElementById('clBtnRead').textContent='✓ Recorded';
    document.getElementById('clNoiseSlider').disabled=true;document.getElementById('clVaSlider').disabled=true;
    document.getElementById('clReadingDisplay').style.display='';
    document.getElementById('clReadingDisplay').innerHTML=`<div style="background:var(--success-glow);border:1px solid var(--success);border-radius:var(--radius-sm);padding:10px;font-size:12px;color:var(--success)">\\(V_a=${Va}\\;\\text{V}\\), \\(B=${T(B)}\\;\\text{T}\\), \\(r=${(r_meas*100).toFixed(1)}\\;\\text{cm}=${r_meas.toFixed(3)}\\;\\text{m}\\)</div>`;

    document.getElementById('clCalcCard').style.display='';
    const v_calc=Math.sqrt(2*C.e*Va/C.me),em_calc=2*Va/(B*B*r_meas*r_meas);
    PhysLab.buildCalcSteps('clCalcSteps',[
      {id:'clv',label:'Step 1: Electron speed',formula:`\\[v=\\sqrt{2\\cdot\\frac{e}{m}\\cdot V_a}\\]`,answer:v_calc,tolerance:.1,formatAnswer:()=>`\\(v=${T(v_calc)}\\;\\text{m s}^{-1}\\)`,hint:`\\(v=${T(v_calc)}\\)`,placeholder:'e.g. 4.20e7'},
      {id:'clem',label:'Step 2: e/m',formula:`\\[\\frac{e}{m}=\\frac{2V_a}{B^2r^2}\\]`,answer:em_calc,tolerance:.15,formatAnswer:()=>`\\(e/m=${T(em_calc)}\\;\\text{C kg}^{-1}\\)`,hint:`\\(e/m=${T(em_calc)}\\)`,placeholder:'e.g. 1.76e11'},
    ],()=>{const d=document.getElementById('clResult');d.style.display='';const pct=Math.abs(em_calc-C.emRatio)/C.emRatio*100;d.innerHTML=`<div class="trial-result"><h3>Lab Complete!</h3><div class="charge-value">\\(e/m=${T(em_calc)}\\;\\text{C kg}^{-1}\\)</div><div class="multiple">Accepted: \\(1.76\\times10^{11}\\) (${pct.toFixed(1)}% off)</div></div>`;document.getElementById('clBtnNew').style.display='';PhysLab.typesetMathJax()});
    PhysLab.typesetMathJax();
  }

  PhysLab._cathode={init:initExp,initLab:initLabSim,labUpdateVa,labReadRadius,setNoise:setNoiseCathode};

  PhysLab.register('cathode',{
    title:"Cathode Rays (e/m)",labelTitle:"Cathode Rays — Label Mode",expTitle:"Cathode Rays — Calculation Mode",labSimTitle:"Cathode Rays — Lab Simulation",
    labelDesc:"Identify components. 12 labels.",expDesc:"Use Va, B, r to determine e/m.",labSimDesc:"Adjust the accelerating voltage, observe beam curvature, record the radius, and calculate e/m from your own measurement.",
    labels:[{id:'cathode',text:'Cathode (−)',hint:'Emits electrons'},{id:'anode',text:'Anode (+)',hint:'Accelerates beam'},{id:'egun',text:'Electron Gun',hint:'Cathode + anode'},{id:'beam',text:'Electron Beam',hint:'Fast electrons'},{id:'e_plates',text:'Electric Deflection Plates',hint:'Vertical E field'},{id:'b_field',text:'Magnetic Field Region',hint:'Helmholtz coils'},{id:'screen',text:'Fluorescent Screen',hint:'Shows beam'},{id:'spot',text:'Beam Spot',hint:'Visible point'},{id:'va_supply',text:'Accelerating Voltage',hint:'Sets KE'},{id:'vd_supply',text:'Deflecting Voltage',hint:'Controls E'},{id:'vacuum',text:'Evacuated Tube',hint:'No air'},{id:'coils',text:'Helmholtz Coils',hint:'Uniform B'}],
    targetDots:{cathode:{x:8,y:50},anode:{x:18,y:50},egun:{x:13,y:35},beam:{x:45,y:50},e_plates:{x:42,y:35},b_field:{x:62,y:35},screen:{x:92,y:50},spot:{x:90,y:45},va_supply:{x:13,y:85},vd_supply:{x:42,y:85},vacuum:{x:50,y:15},coils:{x:62,y:75}},
    renderDiagram,initExp,initLabSim,
  });
})();
