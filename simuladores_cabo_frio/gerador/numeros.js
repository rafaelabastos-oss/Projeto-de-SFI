// Imprime os numeros-chave de cada simulador (sem autoteste).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const br=await chromium.launch();
  for(const f of process.argv.slice(2)){
    const pg=await br.newPage();const er=[];pg.on('pageerror',e=>er.push(String(e)));pg.on('dialog',d=>d.dismiss());
    await pg.goto('file://'+require('path').resolve(f));await pg.waitForTimeout(800);
    const r=await pg.evaluate(()=>{const R=calc();const m=monteCarlo(400);return {
      preco:+R.precoMedio.toFixed(2),cvUnit:+R.matMedio.toFixed(2),mc:+R.mc.toFixed(2),mcPct:+R.mcPct.toFixed(1),
      fixoMes:Math.round(R.fixoCaixa),folha:Math.round(R.folha),capex:Math.round(R.capex),eq:Math.round(R.eqTotal),obra:Math.round(R.obraTotal),
      giro:Math.round(R.giro),inv:Math.round(R.investimento),pessoas:R.nPessoas,
      etapas:R.etapas.map(e=>e.n+'='+Math.round(e.v*10)/10).join(' | '),
      dre:R.dre.map(d=>Math.round(d.vol*1000)+'u '+Math.round(d.rec/1000)+'k eb'+Math.round(d.ebitda/1000)+'k').join(' ; '),
      perda3:R.perda3Pct.toFixed(1),pe:Math.round(R.pePct),mcP:[m.p10,m.p50,m.p90].map(v=>Math.round(v/1000)+'k').join('/'),pVence:m.pVence.toFixed(2),
      sobra:Math.round((R.dre[2].ebitda-S.alugMerc*12)/R.capex*100)+'%',viol:ZV.map(v=>v.cod+':'+v.sev).join(' ')}});
    console.log('=== '+f);console.log(JSON.stringify(r,null,1));if(er.length)console.log('ERROS',er);
    await pg.close();
  }
  await br.close();
})();
