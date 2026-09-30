// Mede a linha de base de cada simulador e grava em estudos.json (capex, ebitda do ano 3, pessoas).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs'),path=require('path');
(async()=>{const br=await chromium.launch();
const arq=path.join(__dirname,'estudos.json');const est=JSON.parse(fs.readFileSync(arq,'utf8'));
for(const f of process.argv.slice(2)){const pg=await br.newPage();pg.on('dialog',d=>d.dismiss());
 await pg.goto('file://'+path.resolve(f));await pg.waitForTimeout(700);
 const r=await pg.evaluate(()=>{const R=calc();return {slug:NEG.slug,capex:Math.round(R.capex),ebitda:Math.round(R.dre[2].ebitda),pessoas:R.nPessoas}});
 const e=est.find(x=>x.slug===r.slug);if(e)Object.assign(e,r);console.log(JSON.stringify(r));await pg.close();}
fs.writeFileSync(arq,JSON.stringify(est,null,1));await br.close();})();
