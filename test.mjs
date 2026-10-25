import { webkit, devices } from 'playwright';
const b = await webkit.launch();
const ctx = await b.newContext({ ...devices['iPhone 13'], locale:'ar-AE' });
const p = await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8931/');await p.waitForTimeout(1200);
let n=0;const shot=async(name)=>{await p.waitForTimeout(1800);await p.screenshot({path:`/workspace/shots/${String(++n).padStart(2,'0')}-${name}.png`})};
await shot('home');
await p.click('#bTypeStart');
const say=async(t,name,wait=0)=>{await p.fill('#typeIn',t);await p.press('#typeIn','Enter');
  await p.waitForTimeout(1300);await p.waitForFunction(()=>!document.body.classList.contains('thinking'),null,{timeout:45000});await p.waitForTimeout(wait);await shot(name)};
p.on('console',m=>console.log('C',m.text()));const steps=[['أربع بطاقات','cards4'],['خمس بطاقات','cards5'],['ست بطاقات','cards6'],['لون أزرق','blue'],['امسح كل شيء','clear'],
 ['بطاقة ذهبية','gold'],['اليوم راح نتكلم عن إطلاق تطبيقنا الجديد، الهدف إننا نوصل لعشرة آلاف مستخدم في أول شهر ونحسن تجربة الدفع','bullets'],
 ['المبيعات في يناير مئة وفي فبراير مئة وخمسين وفي مارس مئتين وأربعين','chart'],['اعرض حصص السوق دائرة: نحن أربعين بالمية والمنافس الأول ثلاثين والباقي ثلاثين','pie'],
 ['سو جدول لثلاث باقات: الأساسية بعشرين درهم، المتقدمة بخمسين، والاحترافية بمئة','table'],
 ['اعرض أرقام: رضا العملاء ٩٥٪ وعدد المستخدمين ١٢ ألف ونمو ٣٠٪','stats'],
 ['ارسم لي بيت','house'],['ارسم لي صقر','falcon'],['ارسم مخطط لخطوات التسجيل في التطبيق','diagram'],
 ['ارسم لي خريطة','map'],['ارسم سهم','arrow'],['اعرض أيقونات للسرعة والأمان والدعم','icons'],['الوضع الليلي','dark'],['تراجع','undo']];
for(const [t,nm] of steps){await say(t,nm, nm==='house'||nm==='falcon'?1500:0)}
// drawing
await p.click('#bDraw');await p.waitForTimeout(500);
const box=await p.locator('#ink').boundingBox();
const stroke=async(pts)=>{await p.mouse.move(box.x+pts[0][0],box.y+pts[0][1]);await p.mouse.down();for(const q of pts.slice(1))await p.mouse.move(box.x+q[0],box.y+q[1],{steps:4});await p.mouse.up()};
const circ=[];for(let i=0;i<=36;i++){const a=i/36*Math.PI*2;circ.push([195+70*Math.cos(a)+(i%3)*3,250+65*Math.sin(a)])}
await stroke(circ);await stroke([[80,420],[150,415],[230,425],[310,418]]);await stroke([[290,400],[312,418],[288,440]]);
await shot('ink');
await p.click('#bTidy');await p.waitForTimeout(500);await p.waitForFunction(()=>!document.body.classList.contains('thinking'),null,{timeout:45000});await shot('tidy');
await p.click('#bMenu');await shot('sheet');
await p.click('#bSave');await shot('saved');
console.log(JSON.stringify(await p.evaluate(()=>window.__arshow.S.slides.map(s=>({t:s.title,b:s.blocks.map(x=>x.type+(x.items?':'+x.items.length:'')),ov:!!s.overlay})))));
console.log('ERRS',errs);
await b.close();
