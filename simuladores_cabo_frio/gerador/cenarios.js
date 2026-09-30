// Avalia variacoes de configuracao: node cenarios.js arquivo.html 'nome=>codigo JS que altera S' ...
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const br=await chromium.launch();const pg=await br.newPage();pg.on('dialog',d=>d.dismiss());
await pg.goto('file://'+require('path').resolve(process.argv[2]));await pg.waitForTimeout(700);
for(const c of process.argv.slice(3)){const [nome,cod]=c.split('=>');
 const r=await pg.evaluate(cod=>{const x=avaliar(()=>{eval(cod)},false);const R=x.R;return {capex:Math.round(R.capex),eb3:Math.round(R.dre[2].ebitda),perda:R.perda3Pct.toFixed(1),garg:R.gargalo.n,pess:R.nPessoas,sobra:Math.round((R.dre[2].ebitda-S.alugMerc*12)/R.capex*100)}},cod);
 console.log(nome.padEnd(28),JSON.stringify(r));}
await br.close();})();
