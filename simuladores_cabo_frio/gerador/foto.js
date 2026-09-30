// Captura a tela de cada simulador (fase indicada) para conferencia visual.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const out=process.env.OUT||'.';
  const br=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  for(const f of process.argv.slice(2)){
    const pg=await br.newPage({viewport:{width:1500,height:950}});
    pg.on('dialog',d=>d.dismiss());
    await pg.goto('file://'+require('path').resolve(f));
    await pg.waitForTimeout(2500);
    const nome=require('path').basename(f,'.html');
    await pg.screenshot({path:out+'/'+nome+'_a.png'});
    await pg.evaluate(()=>{CAM.modo="top";CAM.corte=1.20;ACOES3.fit();S.fase="3";tudo();});
    await pg.waitForTimeout(800);
    await pg.screenshot({path:out+'/'+nome+'_b.png'});
    await pg.close();
  }
  await br.close();
})();
