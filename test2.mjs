import { webkit, devices } from 'playwright';
const URL=process.env.URL||'http://localhost:8931/';
const b=await webkit.launch();const ctx=await b.newContext({...devices['iPhone 13'],locale:'ar-AE'});
await ctx.addInitScript(()=>{class FakeSR{start(){window.__sr=this}stop(){setTimeout(()=>this.onend&&this.onend(),10)}abort(){}};window.webkitSpeechRecognition=FakeSR;
 window.__say=(parts)=>{const res=parts.map(([t,f])=>{const r=[{transcript:t}];r.isFinal=f;return r});window.__sr.onresult({resultIndex:0,results:res})}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(URL);await p.waitForTimeout(1200);
let n=0;const shot=async(nm,w=1500)=>{await p.waitForTimeout(w);await p.screenshot({path:`/workspace/shots2/${String(++n).padStart(2,'0')}-${nm}.png`})};
const idle=async()=>{await p.waitForTimeout(900);await p.waitForFunction(()=>!document.body.classList.contains('thinking'),null,{timeout:45000})};
await shot('home');
await p.click('#bStart');await shot('listening',600);
// speak via fake SR: interim then final
const speak=async(t,nm,w)=>{const words=t.split(' ');for(let i=1;i<=words.length;i+=2){await p.evaluate(x=>__say([[x,false]]),words.slice(0,i).join(' '));await p.waitForTimeout(90)}
  await p.evaluate(x=>__say([[x,true]]),t);await p.evaluate(()=>{__sr.onend&&__sr.onend()});await idle();await p.waitForTimeout(2300);if(nm)await shot(nm,w??900)};
const steps=[['ابي اربع كروت','cards'],['شل الثالثة','remove3'],['الثانية خلها ذهبية','recolor2'],['زيد بطاقة','addcard'],['كبرهم','scale'],
 ['امسح كل شي','clear'],['بطاقة ذهبية فيها رؤيتنا','big'],['خلها حمرا','bigred'],
 ['سو لي عرض عن الصقارة','topic'],['عدل النقطة الثانية خلها الصقر رمز الفخر والأصالة','editpt'],['شل النقطة الأخيرة','rmpt'],
 ['مبيعاتنا في دبي ميتين وأبوظبي ميه وخمسين والشارقة ميه','chart'],['خله دائري','pie'],
 ['ارسم لي جمل','camel'],['كبرها شوي','camelbig'],['رجعني للصقر','gotofalcon'],
 ['اليوم بنتكلم عن خطتنا للتوسع، أول شي بنفتح فرع في العين وبعدين نركز على التسويق الرقمي','bullets'],
 ['حط شي عن الأمان','chip']];
for(const [t,nm] of steps)await speak(t,nm);
// dictation mode
await p.click('#modeSeg [data-m=write]');await p.waitForTimeout(400);
const dict=async(t)=>{const w=t.split(' ');for(let i=1;i<=w.length;i++){await p.evaluate(x=>__say([[x,false]]),w.slice(0,i).join(' '));await p.waitForTimeout(140)}};
await dict('في قديم الزمان كان أهل الإمارات يعيشون على البحر');await shot('write-interim',200);
await p.evaluate(x=>{__say([[x,true]])},'في قديم الزمان كان أهل الإمارات يعيشون على البحر');await p.waitForTimeout(250);await shot('write-inking',50);
await p.evaluate(()=>__sr.onend());await p.waitForTimeout(300);
await dict('ويغوصون بحثًا عن اللؤلؤ في الخليج');await p.evaluate(x=>__say([[x,true]]),'ويغوصون بحثًا عن اللؤلؤ في الخليج');await p.evaluate(()=>__sr.onend());await shot('write-final',1500);
await speak('لون أزرق','write-blue');
await p.click('#bMenu');await p.waitForTimeout(400);await p.click('label:has(#calliToggle)');await p.click('.scrim',{position:{x:50,y:40}});await shot('write-calli');
await speak('امسح كل شي','write-clear');
await dict('بسم الله نبدأ');await p.evaluate(x=>__say([[x,true]]),'بسم الله نبدأ');await p.evaluate(()=>__sr.onend());await shot('write-after-clear',1200);
await p.click('#modeSeg [data-m=summary]');await p.click('#bUndo');await shot('undo');
await p.click('#bMenu');await shot('sheet');
const st=await p.evaluate(()=>window.__arshow.S.slides.map(s=>({t:s.title,b:s.blocks.map(x=>x.type+(x.kind?':'+x.kind:'')+(x.art?':'+x.art:'')+(listOf(x)?':'+listOf(x).length:'')+(x.scale?'@'+x.scale.toFixed(2):'')+(x.color?'#'+x.color:''))})));
console.log(JSON.stringify(st));console.log('ERRS',errs);await b.close();
