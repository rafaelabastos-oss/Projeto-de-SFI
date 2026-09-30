// Abre cada simulador no Chromium, roda calc() e o autoteste embutido.
// uso: node testar.js arquivo.html [...]
const {chromium}=require(process.env.PW||'/opt/node22/lib/node_modules/playwright');
(async()=>{
  const br=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  for(const f of process.argv.slice(2)){
    const pg=await br.newPage({viewport:{width:1400,height:900}});
    const erros=[];
    pg.on('pageerror',e=>erros.push(String(e)));
    pg.on('dialog',d=>d.dismiss());
    await pg.goto('file://'+require('path').resolve(f));
    await pg.waitForTimeout(1500);
    const r=await pg.evaluate(async()=>{
      const R=calc();
      const T=await new Promise(res=>{let done=false;try{diagnostico(t=>{done=true;res(t)})}catch(e){res([{nome:'EXC '+e.message,ok:false,esperado:'',obtido:''}])}
        setTimeout(()=>{if(!done)res(S.diag||[])},9000)});
      const fal=T.filter(t=>!t.ok&&t.esperado!=="informativo").map(t=>t.grupo+' | '+t.nome+' | obtido '+t.obtido+' | esperado '+t.esperado);
      // exercita todas as fases e acoes pesadas
      const fases=[];for(const k of Object.keys(PNL)){try{PNL[k](calc())}catch(e){fases.push(k+': '+e.message)}}
      let extra=[];
      try{const s=sensibilidade();extra.push('sens ok '+s.linhas.length)}catch(e){extra.push('sens ERRO '+e.message)}
      try{const m=monteCarlo(200);extra.push('mc pVence '+m.pVence.toFixed(2))}catch(e){extra.push('mc ERRO '+e.message)}
      try{auditoria();leiaMe();relatoTexto();extra.push('audit ok')}catch(e){extra.push('audit ERRO '+e.message)}
      try{const s=simulaTurno(MOD);extra.push('turno '+s.kgTurno+' desvio '+Math.round(s.desvio))}catch(e){extra.push('turno ERRO '+e.message)}
      return {gl:G.ok,capex:Math.round(R.capex),inv:Math.round(R.investimento),eb3:Math.round(R.dre[2].ebitda),
        rec3:Math.round(R.dre[2].rec),pessoas:R.nPessoas,cap:R.capKgDia,garg:R.gargalo.n,pe:Math.round(R.pePct),
        perda:R.perda3Pct.toFixed(1),viol:ZV.map(v=>v.cod+':'+v.sev).join(' '),
        diag:T.length,falhas:fal,fases,extra,vpl:Math.round(R.vpl)};
    });
    console.log('=== '+f);console.log(JSON.stringify(r,null,1));
    if(erros.length)console.log('ERROS DE PAGINA:',erros.slice(0,5));
    await pg.close();
  }
  await br.close();
})();
