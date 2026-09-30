const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const br=await chromium.launch();
for(const f of process.argv.slice(2)){const pg=await br.newPage();pg.on('dialog',d=>d.dismiss());
await pg.goto('file://'+require('path').resolve(f));await pg.waitForTimeout(700);
console.log('=== '+f);console.log((await pg.evaluate(()=>ZV.map(v=>v.cod+' '+v.sev+': '+v.msg))).join('\n'));
console.log(await pg.evaluate(()=>{const L=validaLayout();return 'deficit '+L.deficit+' faltando '+L.setoresFaltando+' viol '+L.viol+' flow '+L.flowPct+' ligFalt '+L.ligFalt.map(l=>l.d)+' | rota '+(MOD.rota?JSON.stringify({len:MOD.rota.len,larg:MOD.rota.larg,x:MOD.rota.x,z:MOD.rota.z}):'')}));
await pg.close();}
await br.close();})();
