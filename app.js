(function(){
  const $=id=>document.getElementById(id);
  // Tabs
  document.querySelectorAll('.tabs button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tabs button').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(s=>s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
      if(btn.dataset.tab==='graficos'){ drawCharts(currentRangeData); }
      if(btn.dataset.tab==='jumbos_sector'){ js_render(); }
      if(btn.dataset.tab==='ratios_word'){ renderRatiosFromWord(); }
    });
  });

  // Datos (24–30/09/2025)
  const DATA=[
    ["2025-09-24",2250,0,30.0,12.3,800,0,240,63,60,0,46,63,95,42,87,70,90,38],
    ["2025-09-25",1950,1996,33.0,18.9,800,705,240,224,120,60,90,68,90,47,80,61,95,48],
    ["2025-09-26",1950,1710,35.0,29.7,800,450,240,290,120,63,66,72,89,61,90,63,92,53],
    ["2025-09-27",1950,1678,33.0,19.9,800,180,240,253,120,36,72,79,95,52,95,61,95,57],
    ["2025-09-28",1900,1797,36.0,26.5,800,0,240,183,120,62,69,69,95,55,92,66,95,55],
    ["2025-09-29",1900,1156,33.0,22.8,800,705,240,292,120,101,67,79,89,44,60,72,95,54],
    ["2025-09-30",1900,1496,38.0,13.8,800,795,240,94,120,155,73,77,89,39,95,50,95,45],
  ];

  // Ratios/Inventario del Word (embebido)
  const WORD={
    taladrosLargos:[
      {codigo:"JU-05",marca:"RESEMIN",modelo:"RAPTOR 44 2R",tipo:"Raptor"},
      {codigo:"JU-09",marca:"HAKIM DRILL",modelo:"MINI TITAN THL",tipo:"Mini Titan"},
    ],
    jumbosFrontoneros:[
      {codigo:"JU-02",marca:"SANDVIK",modelo:"DD212"},
      {codigo:"JU-03",marca:"SANDVIK",modelo:"DD212"},
      {codigo:"JU-04",marca:"SANDVIK",modelo:"DD212"},
      {codigo:"JU-07",marca:"SANDVIK",modelo:"DD212"},
      {codigo:"JU-08",marca:"SANDVIK",modelo:"DD311"},
    ],
    jumbosEmpernadores:[
      {codigo:"JE-01",marca:"RESEMIN",modelo:"BOLTER 99"},
      {codigo:"JE-02",marca:"RESEMIN",modelo:"SMALL BOLTER 99"},
      {codigo:"JE-03",marca:"SANDVIK",modelo:"DS2710"},
      {codigo:"JE-04",marca:"SANDVIK",modelo:"DS311"},
    ],
    scoops4:[
      {codigo:"SC-02",marca:"CATERPILLAR",modelo:"R1300G"},
      {codigo:"SC-03",marca:"CATERPILLAR",modelo:"R1300G"},
      {codigo:"SC-08",marca:"CATERPILLAR",modelo:"R1300G"},
    ],
    scoops6:[
      {codigo:"SC-04",marca:"CATERPILLAR",modelo:"R1600H"},
      {codigo:"SC-05",marca:"CATERPILLAR",modelo:"R1600H"},
      {codigo:"SC-09",marca:"CATERPILLAR",modelo:"R1600H"},
      {codigo:"SC-10",marca:"CATERPILLAR",modelo:"R1600H"},
      {codigo:"SC-11",marca:"CATERPILLAR",modelo:"R1600H"},
    ],
    desatadores:[
      {codigo:"DR-01",marca:"RESEMIN",modelo:"SCALEMIN HT"},
      {codigo:"DR-02",marca:"RESEMIN",modelo:"SCALEMIN HT"},
      {codigo:"DR-03",marca:"CATERPILLAR",modelo:"PAUS"},
    ],
    telehandler:[
      {codigo:"SL-01",marca:"MANITOU",modelo:"MT-X 1035"},
      {codigo:"SL-02",marca:"MANITOU",modelo:"MT-X 625"},
    ],
    promedios:{
      raptor_mph:23.72, mini_mph:9.91,
      frontonero_mph:65.47, empernador_mph:33.42,
      scoop4_tnh:58.39, scoop6_tnh:92.93
    }
  };

  // Utils
  const pct=(real,prog)=>{real=+real||0;prog=+prog||0;return prog?real/prog*100:0};
  const renderTable=(id,head,rows)=>{$(id).innerHTML=`<thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`};
  const downloadCSV=(rows,name)=>{const csv=rows.map(r=>r.join(',')).join('\\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=name; a.click();};

  const resumenHead=['Fecha','Prod Prog','Prod Real','% Prod','Av Prog','Av Real','% Av','Rel Prog','Rel Real','% Rel','Raptor P/R (m)','% Raptor','Mini P/R (m)','% Mini','Scoop 4 Util %','Scoop 6 Util %'];
  const makeResumenRows=a=>a.map(r=>[r[0],r[1],r[2],pct(r[2],r[1]).toFixed(1)+'%',r[3],r[4],pct(r[4],r[3]).toFixed(1)+'%',r[5],r[6],pct(r[6],r[5]).toFixed(1)+'%',`${r[7]}/${r[8]}`,pct(r[8],r[7]).toFixed(1)+'%',`${r[9]}/${r[10]}`,pct(r[10],r[9]).toFixed(1)+'%',r[11],r[12]]);

  let currentRangeData=DATA.slice();
  function renderAll(arr){
    currentRangeData=arr.slice();
    renderTable('tbl_resumen',resumenHead,makeResumenRows(arr));
    document.getElementById('export_resumen').onclick=()=>downloadCSV([resumenHead,...makeResumenRows(arr)],'resumen_24_30sep.csv');

    const prodHead=['Fecha','Programado (TMS)','Real (TMS)','Cumpl %'];
    const prodRows=arr.map(r=>[r[0],r[1],r[2],pct(r[2],r[1]).toFixed(1)+'%']); renderTable('tbl_prod',prodHead,prodRows);
    document.getElementById('export_prod').onclick=()=>downloadCSV([prodHead,...prodRows],'produccion_24_30sep.csv');

    const avHead=['Fecha','Programado (m)','Real (m)','Cumpl %'];
    const avRows=arr.map(r=>[r[0],r[3],r[4],pct(r[4],r[3]).toFixed(1)+'%']); renderTable('tbl_av',avHead,avRows);
    document.getElementById('export_av').onclick=()=>downloadCSV([avHead,...avRows],'avance_24_30sep.csv');

    const tlHead=['Fecha','Raptor Prog (m)','Raptor Real (m)','Cumpl %','Mini Prog (m)','Mini Real (m)','Cumpl %'];
    const tlRows=arr.map(r=>[r[0],r[7],r[8],pct(r[8],r[7]).toFixed(1)+'%',r[9],r[10],pct(r[10],r[9]).toFixed(1)+'%']); renderTable('tbl_tl',tlHead,tlRows);
    document.getElementById('export_tl').onclick=()=>downloadCSV([tlHead,...tlRows],'taladros_24_30sep.csv');

    const relHead=['Fecha','Programado (m³)','Real (m³)','Cumpl %'];
    const relRows=arr.map(r=>[r[0],r[5],r[6],pct(r[6],r[5]).toFixed(1)+'%']); renderTable('tbl_rel',relHead,relRows);
    document.getElementById('export_rel').onclick=()=>downloadCSV([relHead,...relRows],'relleno_24_30sep.csv');

    const scHead=['Fecha','Utilización 4 yd³ (%)','Utilización 6 yd³ (%)'];
    const scRows=arr.map(r=>[r[0],r[11],r[12]]); renderTable('tbl_sc',scHead,scRows);
    document.getElementById('export_sc').onclick=()=>downloadCSV([scHead,...scRows],'scoops_24_30sep.csv');

    const jbHead=['Fecha','Frontoneros D.Mec %','Frontoneros Util %','Empernadores D.Mec %','Empernadores Util %','JT D.Mec %','JT Util %'];
    const jbRows=arr.map(r=>[r[0],r[13],r[14],r[15],r[16],r[17],r[18]]); renderTable('tbl_jb',jbHead,jbRows);
    document.getElementById('export_jb').onclick=()=>downloadCSV([jbHead,...jbRows],'jumbos_24_30sep.csv');
  }
  function applyFilters(){const a=$('f_ini').value,b=$('f_fin').value;const sub=DATA.filter(r=>r[0]>=a && r[0]<=b); renderAll(sub); drawCharts(sub);}
  document.getElementById('filtrar').addEventListener('click',applyFilters);

  function drawCharts(arr){
    const c=document.getElementById('ch_cumpl'); if(!c) return; const ctx=c.getContext('2d');
    ctx.clearRect(0,0,c.width,c.height); const m=40,W=c.width,H=c.height,iw=W-m*2,ih=H-m*2;
    const yMap=v=>H-m-(Math.min(130,Math.max(0,v))/130)*ih, xMap=(i,n)=>m+(n<=1?iw/2:i*(iw/(n-1)));
    ctx.strokeStyle='#2a3340'; for(let y=0;y<=130;y+=10){const yy=yMap(y);ctx.beginPath();ctx.moveTo(m,yy);ctx.lineTo(W-m,yy);ctx.stroke();}
    ctx.strokeStyle='#8aa0b6'; ctx.beginPath();ctx.moveTo(m,m/2);ctx.lineTo(m,H-m);ctx.lineTo(W-m,H-m);ctx.stroke();
    ctx.fillStyle='#8aa0b6'; ctx.font='12px system-ui'; for(let y=0;y<=130;y+=20){ctx.fillText(y+'%',6,yMap(y)+4);}
    const series=[
      {n:'% Producción', d:arr.map(r=>pct(r[2],r[1]))},
      {n:'% Avance', d:arr.map(r=>pct(r[4],r[3]))},
      {n:'% Relleno', d:arr.map(r=>pct(r[6],r[5]))},
      {n:'% Raptor', d:arr.map(r=>pct(r[8],r[7]))},
      {n:'% Mini', d:arr.map(r=>pct(r[10],r[9]))},
    ], colors=['#6bdba7','#7bb5ff','#f6c14d','#f77676','#c78bff'];
    series.forEach((s,i)=>{ctx.beginPath();ctx.lineWidth=2;ctx.strokeStyle=colors[i%colors.length];
      s.d.forEach((v,j)=>{const x=xMap(j,arr.length),y=yMap(v);if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}); ctx.stroke();
      s.d.forEach((v,j)=>{const x=xMap(j,arr.length),y=yMap(v);ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=colors[i%colors.length];ctx.fill();});
    });
    let lx=m,ly=m-14; ctx.fillStyle='#eaf2fb'; ctx.font='12px system-ui';
    series.forEach((s,i)=>{ctx.fillStyle=colors[i%colors.length];ctx.fillRect(lx,ly-10,12,12);ctx.fillStyle='#eaf2fb';ctx.fillText(s.n,lx+16,ly);lx+=140;});
    const c2=document.getElementById('ch_prod').getContext('2d');
    c2.clearRect(0,0,800,360);
    const W2=800,H2=360,m2=40,iw2=W2-m2*2,ih2=H2-m2*2,maxV=Math.max(...arr.flatMap(r=>[r[1],r[2]]))*1.15||1,xw=iw2/(arr.length||1);
    c2.strokeStyle='#8aa0b6'; c2.beginPath();c2.moveTo(m2,m2/2);c2.lineTo(m2,H2-m2);c2.lineTo(W2-m2,H2-m2);c2.stroke();
    c2.strokeStyle='#2a3340'; for(let y=0;y<=5;y++){const yy=H2-m2 - ih2*(y/5);c2.beginPath();c2.moveTo(m2,yy);c2.lineTo(W2-m2,yy);c2.stroke();}
    arr.forEach((r,i)=>{const x=m2+i*xw+xw*0.15,w=xw*0.32,hP=(r[1]/maxV)*ih2,hR=(r[2]/maxV)*ih2;
      c2.fillStyle='#7bb5ff'; c2.fillRect(x,H2-m2-hP,w,hP);
      c2.fillStyle='#6bdba7'; c2.fillRect(x+w+6,H2-m2-hR,w,hR);
      c2.fillStyle='#8aa0b6'; c2.font='11px system-ui'; c2.fillText(r[0].slice(5),x,H2-m2+14);
    });
    c2.fillStyle='#eaf2fb'; c2.font='12px system-ui'; c2.fillRect(W2-m2-160,m2-18,12,12); c2.fillText('Programado',W2-m2-140,m2-8);
    c2.fillStyle='#6bdba7'; c2.fillRect(W2-m2-80,m2-18,12,12); c2.fillStyle='#eaf2fb'; c2.fillText('Real',W2-m2-60,m2-8);
  }

  // ---- Jumbos por sector (editable, localStorage) ----
  const STORE_KEY='jumbos_por_sector_v2';
  const SEED=(()=>{const front=["JU-02","JU-03","JU-04","JU-07","JU-08"], emp=["JE-01","JE-02","JE-03","JE-04"];
    const eqs=front.map(c=>({codigo:c,tipo:"Frontonero"})).concat(emp.map(c=>({codigo:c,tipo:"Empernador"})));
    const dates=["2025-09-24","2025-09-25","2025-09-26","2025-09-27","2025-09-28","2025-09-29","2025-09-30"];
    const rows=[]; dates.forEach(f=>eqs.forEach(e=>rows.push({fecha:f,equipo:e.codigo,tipo:e.tipo,sector:"",prog_m:"",real_m:""})));
    return {meta:{rango:[dates[0],dates[dates.length-1]]},equipos:eqs,rows};})();
  const js_load=()=>{try{const s=localStorage.getItem(STORE_KEY);return s?JSON.parse(s):SEED;}catch(_){return SEED}};
  const js_save=x=>{try{localStorage.setItem(STORE_KEY,JSON.stringify(x));}catch(_){}};
  function js_filtered(st){
    const a=document.getElementById('js_ini').value||st.meta.rango[0], b=document.getElementById('js_fin').value||st.meta.rango[1];
    const tipo=(document.getElementById('js_tipo').value||'').trim(), sector=(document.getElementById('js_sector').value||'').trim().toLowerCase();
    let rows=st.rows.filter(r=>r.fecha>=a && r.fecha<=b);
    if(tipo) rows=rows.filter(r=>r.tipo===tipo);
    if(sector) rows=rows.filter(r=>(r.sector||'').toLowerCase().includes(sector));
    return rows;
  }
  function js_render(){
    const st=js_load();
    document.getElementById('js_ini').value=document.getElementById('js_ini').value||st.meta.rango[0];
    document.getElementById('js_fin').value=document.getElementById('js_fin').value||st.meta.rango[1];
    const rows=js_filtered(st), head=['Fecha','Equipo','Tipo','Sector','Prog (m)','Real (m)','Cumpl %'];
    const body=rows.map((r,i)=>{const p=+r.prog_m||0, rr=+r.real_m||0, pc=p?rr/p*100:0;
      return `<tr><td>${r.fecha}</td><td>${r.equipo}</td><td>${r.tipo}</td>
      <td><input class="cell sector" data-i="${i}" value="${r.sector||''}"></td>
      <td><input class="cell prog" data-i="${i}" type="number" step="0.1" value="${r.prog_m}"></td>
      <td><input class="cell real" data-i="${i}" type="number" step="0.1" value="${r.real_m}"></td>
      <td>${pc.toFixed(1)}%</td></tr>`;}).join('');
    document.getElementById('js_tbl').innerHTML=`<thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${body}</tbody>`;
    document.getElementById('js_tbl').querySelectorAll('input.cell').forEach(inp=>{
      inp.addEventListener('input',()=>{
        const st2=js_load();
        const a=document.getElementById('js_ini').value||st2.meta.rango[0], b=document.getElementById('js_fin').value||st2.meta.rango[1];
        const tipo=(document.getElementById('js_tipo').value||'').trim(), sector=(document.getElementById('js_sector').value||'').trim().toLowerCase();
        const orig=st2.rows.filter(r=>r.fecha>=a && r.fecha<=b).filter(r=>!tipo||r.tipo===tipo).filter(r=>!sector||(r.sector||'').toLowerCase().includes(sector));
        const row=orig[+inp.dataset.i], idx=st2.rows.indexOf(row);
        const key=inp.classList.contains('sector')?'sector':(inp.classList.contains('prog')?'prog_m':'real_m');
        st2.rows[idx][key]=inp.value; js_save(st2); js_render_totals(); js_render_charts();
        const tr=inp.closest('tr'), p=+tr.querySelector('input.prog').value||0, rr=+tr.querySelector('input.real').value||0;
        tr.querySelectorAll('td')[6].textContent=(p?(rr/p*100).toFixed(1):'0.0')+'%';
      });
    });
    js_render_totals(); js_render_charts();
  }
  function js_render_totals(){
    const st=js_load(), rows=js_filtered(st), map=new Map();
    rows.forEach(r=>{const k=`${r.fecha}||${r.sector||''}`; const a=map.get(k)||{fecha:r.fecha,sector:r.sector||'',prog:0,real:0}; a.prog+=+r.prog_m||0; a.real+=+r.real_m||0; map.set(k,a);});
    const arr=[...map.values()].sort((a,b)=>(a.fecha+a.sector).localeCompare(b.fecha+b.sector));
    const head=['Fecha','Sector','Prog (m)','Real (m)','Cumpl %'], out=arr.map(k=>[k.fecha,k.sector,k.prog.toFixed(1),k.real.toFixed(1),(k.prog?(k.real/k.prog*100).toFixed(1):'0.0')+'%']);
    document.getElementById('js_tot').innerHTML=buildTable(head,out);
  }
  function js_render_charts(){
    const st=js_load(), rows=js_filtered(st);
    const c1=document.getElementById('js_ch_eq').getContext('2d'); c1.clearRect(0,0,800,360);
    const W=800,H=360,m=40,iw=W-m*2,ih=H-m*2, fechas=[...new Set(rows.map(r=>r.fecha))].sort(), equipos=[...new Set(rows.map(r=>r.equipo))].sort();
    const xMap=(i,n)=>m+(n<=1?iw/2:i*(iw/(n-1))), yMap=v=>H-m-(Math.min(130,Math.max(0,v))/130)*ih;
    c1.strokeStyle='#2a3340'; for(let y=0;y<=130;y+=10){const yy=yMap(y);c1.beginPath();c1.moveTo(m,yy);c1.lineTo(W-m,yy);c1.stroke();}
    c1.strokeStyle='#8aa0b6'; c1.beginPath();c1.moveTo(m,m/2);c1.lineTo(m,H-m);c1.lineTo(W-m,H-m);c1.stroke();
    c1.fillStyle='#8aa0b6'; c1.font='12px system-ui'; for(let y=0;y<=130;y+=20){c1.fillText(y+'%',6,yMap(y)+4);}
    const pal=['#6bdba7','#7bb5ff','#f6c14d','#f77676','#c78bff','#66d1ff','#ffa07a','#9fe070'];
    equipos.forEach((eq,i)=>{const serie=fechas.map(f=>{const recs=rows.filter(r=>r.fecha===f&&r.equipo===eq);let p=0,rr=0;recs.forEach(r=>{p+=+r.prog_m||0;rr+=+r.real_m||0});return p?rr/p*100:0;});
      c1.beginPath();c1.lineWidth=2;c1.strokeStyle=pal[i%pal.length];
      serie.forEach((v,j)=>{const x=xMap(j,fechas.length),y=yMap(v);if(j===0)c1.moveTo(x,y);else c1.lineTo(x,y);}); c1.stroke();
      serie.forEach((v,j)=>{const x=xMap(j,fechas.length),y=yMap(v);c1.beginPath();c1.arc(x,y,3,0,Math.PI*2);c1.fillStyle=pal[i%pal.length];c1.fill();});
    });
    let lx=m,ly=m-14; c1.font='12px system-ui';
    equipos.slice(0,8).forEach((eq,i)=>{c1.fillStyle=pal[i%pal.length];c1.fillRect(lx,ly-10,12,12);c1.fillStyle='#eaf2fb';c1.fillText(eq,lx+16,ly);lx+=100;});
    const c2=document.getElementById('js_ch_tot').getContext('2d'); c2.clearRect(0,0,800,360);
    const xw=iw/(fechas.length||1); const totals=fechas.map(f=>{const recs=rows.filter(r=>r.fecha===f);let p=0,rr=0;recs.forEach(r=>{p+=+r.prog_m||0;rr+=+r.real_m||0});return {f,prog:p,real:rr}});
    const maxV=Math.max(1,...totals.flatMap(t=>[t.prog,t.real]))*1.15;
    c2.strokeStyle='#8aa0b6'; c2.beginPath(); c2.moveTo(m,m/2); c2.lineTo(m,H-m); c2.lineTo(W-m,H-m); c2.stroke();
    c2.strokeStyle='#2a3340'; for(let y=0;y<=5;y++){const yy=H-m-ih*(y/5); c2.beginPath(); c2.moveTo(m,yy); c2.lineTo(W-m,yy); c2.stroke();}
    totals.forEach((t,i)=>{const x=m+i*xw+xw*0.15,w=xw*0.32,hP=(t.prog/maxV)*ih,hR=(t.real/maxV)*ih;
      c2.fillStyle='#7bb5ff'; c2.fillRect(x,H-m-hP,w,hP);
      c2.fillStyle='#6bdba7'; c2.fillRect(x+w+6,H-m-hR,w,hR);
      c2.fillStyle='#8aa0b6'; c2.font='11px system-ui'; c2.fillText(t.f.slice(5),x,H-m+14);
    });
    c2.fillStyle='#eaf2fb'; c2.font='12px system-ui'; c2.fillRect(W-m-160,m-18,12,12); c2.fillText('Programado',W-m-140,m-8);
    c2.fillStyle='#6bdba7'; c2.fillRect(W-m-80,m-18,12,12); c2.fillStyle='#eaf2fb'; c2.fillText('Real',W-m-60,m-8);
  }
  const buildTable=(head,rows)=>`<thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;

  // Ratios (Word) Tab
  function renderRatiosFromWord(){
    const counts=[
      ['Taladros Largos', WORD.taladrosLargos.length, 'Promedios: Raptor '+WORD.promedios.raptor_mph+' m/h; Mini '+WORD.promedios.mini_mph+' m/h'],
      ['Jumbos Frontoneros', WORD.jumbosFrontoneros.length, 'Promedio: '+WORD.promedios.frontonero_mph+' m/h'],
      ['Jumbos Empernadores', WORD.jumbosEmpernadores.length, 'Promedio: '+WORD.promedios.empernador_mph+' m/h'],
      ['Scoops 4 yd³', WORD.scoops4.length, 'Promedio: '+WORD.promedios.scoop4_tnh+' tn/h'],
      ['Scoops 6 yd³', WORD.scoops6.length, 'Promedio: '+WORD.promedios.scoop6_tnh+' tn/h'],
      ['Desatadores', WORD.desatadores.length, '—'],
      ['Telehandler', WORD.telehandler.length, '—'],
    ];
    renderTable('tbl_counts',['Categoría','Cantidad de equipos','Ratio promedio'],counts);
    renderTable('tbl_taladros',['Taladros Largos','Marca','Modelo','Tipo','Promedio m/h'],
      WORD.taladrosLargos.map(e=>[e.codigo,e.marca,e.modelo,e.tipo,(e.tipo==='Raptor'?WORD.promedios.raptor_mph:WORD.promedios.mini_mph)])
    );
    renderTable('tbl_jumbos_det',['Jumbos — Tipo','Código','Marca','Modelo','Promedio m/h'],
      WORD.jumbosFrontoneros.map(e=>['Frontonero',e.codigo,e.marca,e.modelo,WORD.promedios.frontonero_mph])
      .concat(WORD.jumbosEmpernadores.map(e=>['Empernador',e.codigo,e.marca,e.modelo,WORD.promedios.empernador_mph]))
    );
    renderTable('tbl_sc4',['Scoops 4 yd³','Marca','Modelo','Promedio tn/h'],
      WORD.scoops4.map(e=>[e.codigo,e.marca,e.modelo,WORD.promedios.scoop4_tnh])
    );
    renderTable('tbl_sc6',['Scoops 6 yd³','Marca','Modelo','Promedio tn/h'],
      WORD.scoops6.map(e=>[e.codigo,e.marca,e.modelo,WORD.promedios.scoop6_tnh])
    );
    renderTable('tbl_otros',['Otros','Código','Marca','Modelo'],
      WORD.desatadores.map(e=>['Desatador',e.codigo,e.marca,e.modelo])
      .concat(WORD.telehandler.map(e=>['Telehandler',e.codigo,e.marca,e.modelo]))
    );
  }

  // Boot
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('f_ini').value=DATA[0][0];
    document.getElementById('f_fin').value=DATA[DATA.length-1][0];
    renderAll(DATA); drawCharts(DATA);

    const st={meta:{rango:[DATA[0][0],DATA[DATA.length-1][0]]}};
    document.getElementById('js_ini').value=st.meta.rango[0];
    document.getElementById('js_fin').value=st.meta.rango[1];
    document.getElementById('js_filter').addEventListener('click',js_render);
    document.getElementById('js_clear').addEventListener('click',()=>{document.getElementById('js_ini').value=st.meta.rango[0];document.getElementById('js_fin').value=st.meta.rango[1];document.getElementById('js_tipo').value='';document.getElementById('js_sector').value='';js_render();});
    document.getElementById('js_export').addEventListener('click',()=>{const rows=js_filtered(js_load());const head=['fecha','equipo','tipo','sector','prog_m','real_m','cumpl_%'];const body=rows.map(r=>[r.fecha,r.equipo,r.tipo,r.sector,r.prog_m,r.real_m,(+r.prog_m?((+r.real_m||0)/(+r.prog_m||0)*100).toFixed(1):'0.0')]);const csv=[head,...body];const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv.map(r=>r.join(',')).join('\\n')],{type:'text/csv'}));a.download='jumbos_por_sector.csv';a.click();});
    document.getElementById('js_reset').addEventListener('click',()=>{if(confirm('Esto borrará los datos guardados y restaurará la plantilla.')){localStorage.removeItem('jumbos_por_sector_v2'); js_render();}});
    js_render();
    renderRatiosFromWord();
    document.getElementById('status').className='status ok';
    document.getElementById('status').textContent='OK — Datos cargados y pestaña Ratios (Word) lista.';
  });
})();