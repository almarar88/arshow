import { webkit, devices } from 'playwright';
const b=await webkit.launch();const p=await (await b.newContext({...devices['iPhone 13']})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('https://almarar88.github.io/arshow/');await p.waitForTimeout(1500);await p.screenshot({path:'/workspace/arshow-live-home.png'});
await p.click('#bTypeStart');
for(const t of ['ارسم لي صقر','نسب الحضور: الحضور ٧٠ والغياب ٣٠']){await p.fill('#typeIn',t);await p.press('#typeIn','Enter');await p.waitForTimeout(1300);await p.waitForFunction(()=>!document.body.classList.contains('thinking'),null,{timeout:45000});await p.waitForTimeout(2500)}
await p.screenshot({path:'/workspace/arshow-live-pie.png'});
console.log(JSON.stringify(await p.evaluate(()=>window.__arshow.S.slides.map(s=>s.blocks.map(x=>x.type+(x.kind?':'+x.kind:''))))),errs);await b.close();
