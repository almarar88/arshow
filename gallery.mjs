import { webkit, devices } from 'playwright';
const b=await webkit.launch();const p=await (await b.newContext({...devices['iPhone 13']})).newPage();
await p.goto('http://localhost:8931/');await p.waitForTimeout(800);
await p.evaluate(()=>{document.body.classList.add('started');const keys=Object.keys(ART);
 document.body.innerHTML='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px">'+keys.map(k=>{const a=artFor(k==='falcon'?'صقر':ART[k].t);return `<div class="drawb" style="padding:6px"><h4 style="font-size:12px;margin:0">${a.title}</h4>${'<svg viewBox="0 0 200 200">'+a.paths.map(x=>`<path d="${x.d}" stroke="${x.stroke}" fill="${x.fill}" stroke-width="${x.w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')+'</svg>'}</div>`}).join('')+'</div>'});
await p.waitForTimeout(500);await p.screenshot({path:'/workspace/shots/gallery.png',fullPage:true});await b.close();
