'use strict';
const API='https://olkhmscftouksbgjmtjt.supabase.co/functions/v1/arshow';
const $=s=>document.querySelector(s);
const COL={blue:'أزرق',green:'أخضر',orange:'برتقالي',purple:'بنفسجي',pink:'وردي',gold:'ذهبي',red:'أحمر',teal:'فيروزي'};
const HEX={blue:'#0A84FF',green:'#30D158',orange:'#FF9F0A',purple:'#BF5AF2',pink:'#FF375F',gold:'#D9A514',red:'#FF453A',teal:'#32BCD6',black:null};
const ORDER=['blue','green','orange','purple','pink','gold','red','teal'];
const THEMES={light:'فاتح',dark:'داكن',sand:'رملي',ocean:'محيطي',night:'ليلي'};
const AR_DIG='٠١٢٣٤٥٦٧٨٩';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).replace(/[٠-٩]/g,d=>AR_DIG.indexOf(d)).replace(/[إأآ]/g,'ا').replace(/ة\b/g,'ه').replace(/ى\b/g,'ي');
const toAr=n=>String(n).replace(/\d/g,d=>AR_DIG[d]);
const newSlide=()=>({id:Date.now()+Math.random(),title:'',blocks:[],tc:null,overlay:null});

let S={slides:[newSlide()],idx:0,theme:'light',raw:false,mode:'summary',calli:false};
let hist=[];
const snap=()=>{hist.push(JSON.stringify(S));if(hist.length>60)hist.shift()};
const cur=()=>S.slides[S.idx];
function persist(){try{localStorage.setItem('arshow.cur',JSON.stringify(S))}catch(e){}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),1900)}

/* ---------- rendering ---------- */
function colorClass(c){return 'c-'+(HEX[c]!==undefined&&c!=='black'?c:'blue')}
function renderBlock(b,i){const h=renderBlock0(b,i);return b.scale&&b.scale!==1?`<div class="scl" style="zoom:${b.scale}">${h}</div>`:h}
function renderBlock0(b,i){
  const dl=`style="--dl:${(i*0.06).toFixed(2)}s"`;
  switch(b.type){
  case 'write':return `<div class="write"><span class="fin">${esc(b.text)} </span><span class="int"></span><i class="caret"></i></div>`;
  case 'bullets':return `<ul class="bul blk" ${dl}>${b.items.map((t,j)=>`<li style="animation-delay:${b.fresh&&j>=b.fresh?(j-b.fresh)*0.12:0}s${b.colors&&b.colors[j]?';--acc:'+HEX[b.colors[j]]+';color:'+HEX[b.colors[j]]:''}">${esc(t)}</li>`).join('')}</ul>`;
  case 'raw':return `<div class="raw blk" ${dl}>${esc(b.text)}</div>`;
  case 'cards':{const n=b.items.length;return `<div class="cards blk ${n>4?'many':''}" ${dl}>${b.items.map((c,j)=>`<div class="card ${colorClass(c.color)}" style="animation-delay:${j*0.08}s">${esc(c.label||COL[c.color]||'')}</div>`).join('')}</div>`}
  case 'bigcard':return `<div class="big ${colorClass(b.color||'gold')} blk" ${dl}>${esc(b.text||'')}</div>`;
  case 'stats':return `<div class="stats blk" ${dl}>${b.items.map((s,j)=>`<div class="stat" style="animation-delay:${j*0.1}s"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>`;
  case 'chart':return `<div class="chart blk" ${dl}>${b.title?`<h4>${esc(b.title)}</h4>`:''}${chartSVG(b)}</div>`;
  case 'table':return `<div class="tbl blk" ${dl}>${b.title?`<h4>${esc(b.title)}</h4>`:''}<table><thead><tr>${(b.headers||[]).map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${(b.rows||[]).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  case 'icons':return `<div class="icons blk" ${dl}>${b.items.map((c,j)=>`<div class="icon" style="animation-delay:${j*0.08}s"><div>${esc(c.emoji)}</div><span>${esc(c.label)}</span></div>`).join('')}</div>`;
  case 'draw':return `<div class="drawb blk" ${dl}${b.tint?` style="color:${HEX[b.tint]}"`:''}>${b.title?`<h4>${esc(b.title)}</h4>`:''}${drawSVG(b.paths,b.vb||'0 0 200 200',b.sw||3)}</div>`;
  case 'diagram':return `<div class="diag blk" ${dl}>${b.title?`<h4>${esc(b.title)}</h4>`:''}<div class="flow">${b.nodes.map((n,j)=>(j?`<svg class="arrow" viewBox="0 0 20 30" style="animation-delay:${j*0.25-0.1}s"><path pathLength="1" style="animation-delay:${j*0.25-0.1}s" d="M10 2v24M4 20l6 7 6-7"/></svg>`:'')+`<div class="node" style="animation-delay:${j*0.25}s">${esc(n)}</div>`).join('')}</div></div>`;
  }return '';
}
function drawSVG(paths,vb,sw){
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${paths.map((p,j)=>`<path class="dp" pathLength="1" style="--d:${(j*0.28).toFixed(2)}s" d="${p.d}" stroke="${p.stroke||'currentColor'}" fill="${p.fill||'none'}" stroke-width="${p.w||sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;
}
function chartSVG(b){
  const d=(b.data||[]).filter(x=>isFinite(+x.value)).slice(0,10);if(!d.length)return '';
  const cols=d.map((x,i)=>HEX[x.color||ORDER[i%ORDER.length]]);
  if(b.kind==='pie'){
    const tot=d.reduce((a,x)=>a+ +x.value,0)||1;let a0=-Math.PI/2,out='';
    d.forEach((x,i)=>{const a1=a0+2*Math.PI*(+x.value/tot);const L=a1-a0>Math.PI?1:0;
      const p=(a)=>[100+80*Math.cos(a),100+80*Math.sin(a)].map(v=>v.toFixed(2)).join(' ');
      out+= d.length===1?`<circle class="slice" cx="100" cy="100" r="80" fill="${cols[i]}"/>`:`<path class="slice" style="animation-delay:${i*0.12}s" d="M100 100 L${p(a0)} A80 80 0 ${L} 1 ${p(a1)}Z" fill="${cols[i]}" stroke="var(--card)" stroke-width="2"/>`;a0=a1});
    return `<svg viewBox="0 0 200 200" style="max-width:240px;margin:auto">${out}<circle cx="100" cy="100" r="42" fill="var(--card)"/></svg><div class="legend">${d.map((x,i)=>`<span><i style="background:${cols[i]}"></i>${esc(x.label)} · ${toAr(Math.round(+x.value/tot*100))}٪</span>`).join('')}</div>`;
  }
  const W=320,H=200,P=28,max=Math.max(...d.map(x=>+x.value))||1,bw=(W-P)/d.length;
  if(b.kind==='line'){const pts=d.map((x,i)=>[W-(bw*i+bw/2),H-P-(+x.value/max)*(H-P-24)]);
    return `<svg viewBox="0 0 ${W} ${H}"><path class="dp" pathLength="1" style="--d:0s" d="M${pts.map(p=>p.map(v=>v.toFixed(1)).join(' ')).join(' L')}" stroke="${HEX.blue}" stroke-width="3.5" fill="none" stroke-linecap="round"/>${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${HEX.blue}"/><text x="${p[0]}" y="${p[1]-10}" text-anchor="middle">${esc(d[i].value)}</text><text x="${p[0]}" y="${H-8}" text-anchor="middle">${esc(d[i].label)}</text>`).join('')}</svg>`}
  return `<svg viewBox="0 0 ${W} ${H}">${d.map((x,i)=>{const h=(+x.value/max)*(H-P-24),xx=W-(bw*(i+1))+bw*0.18,w=bw*0.64,y=H-P-h;
    return `<rect class="bar" style="animation-delay:${i*0.1}s" x="${xx.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="8" fill="${cols[i]}"/><text x="${(xx+w/2).toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="middle">${esc(x.value)}</text><text x="${(xx+w/2).toFixed(1)}" y="${H-8}" text-anchor="middle">${esc(x.label)}</text>`}).join('')}</svg>`;
}
function ovHTML(o){return o?(o.paths?drawSVG(o.paths,o.vb,6):`<img src="${o.png}" alt="">`):''}
function slideHTML(sl,withOv){
  let h=sl.title?`<h2 class="title blk">${esc(sl.title)}</h2>`:'';
  h+=sl.blocks.map(renderBlock).join('');
  if(sl.overlay&&withOv)h+=`<div class="overlay">${sl.overlay.paths?drawSVG(sl.overlay.paths,sl.overlay.vb,6):`<img src="${sl.overlay.png}" alt="">`}</div>`;
  return h;
}
let lastIdx=-1,lastText='';
function chartKind(t,fallback){const n=norm(t);
  if(/اعمد|عمود|عواميد|بار/.test(n))return 'bar';if(/دائري|دايري|كعكه|فطيره/.test(n))return 'pie';if(/خطي|خط بياني/.test(n))return 'line';
  if(/نسب|حصص|حصه|توزيع|بالمي|٪|%/.test(n))return 'pie';if(/تطور|عبر الزمن|على مدى|مع الوقت|اتجاه|نمو .*(شهر|سن)/.test(n))return 'line';return 'bar'}
function render(anim){
  document.body.className=document.body.className.replace(/t-\w+/,'t-'+S.theme);
  const sl=cur(),el=$('#slide');
  const tc=sl.tc&&HEX[sl.tc]?HEX[sl.tc]:'';
  document.documentElement.style.setProperty('--tc',tc||'var(--fg)');
  document.documentElement.style.setProperty('--acc',tc||'var(--blue)');
  const go=()=>{el.innerHTML=slideHTML(sl);el.style.zoom=sl.scale&&sl.scale!==1?sl.scale:'';$('#ovl').innerHTML=ovHTML(sl.overlay);el.classList.remove('out');if(anim){el.classList.remove('in');void el.offsetWidth;el.classList.add('in')}
    sl.blocks.forEach(b=>delete b.fresh);const w=$('#slideWrap');anim?w.scrollTo({top:0}):w.scrollTo({top:w.scrollHeight,behavior:'smooth'})};
  if(anim==='slide'&&lastIdx!==-1&&el.innerHTML){el.classList.add('out');setTimeout(go,240)}else go();
  lastIdx=S.idx;
  $('#counter').textContent=`${toAr(S.idx+1)} / ${toAr(S.slides.length)}`;
  $('#bPrev').style.opacity=S.idx>0?1:.3;$('#bNext').style.opacity=S.idx<S.slides.length-1?1:.3;
  $('#bUndo').style.opacity=hist.length?1:.35;
  persist();
}

/* ---------- actions ---------- */
const VIS=['cards','bigcard','stats','chart','table','icons','draw','diagram'];
const isEmpty=sl=>!sl.title&&!sl.blocks.length&&!sl.overlay;
function addSlide(){const sl=newSlide();sl.tc=cur().tc;S.slides.splice(S.idx+1,0,sl);S.idx++;return sl}
let lastActions=null;
const blk=id=>{const i=+String(id||'').replace(/\D/g,'');const bs=cur().blocks;return Number.isInteger(i)&&bs[i]?bs[i]:null};
const lastBlk=()=>{const bs=cur().blocks;return bs[bs.length-1]||null};
const listOf=b=>!b?null:b.type==='chart'?b.data:b.type==='table'?b.rows:b.type==='diagram'?b.nodes:b.items||null;
function idxOf(list,item){if(!list)return -1;let i=+item;if(!isFinite(i)||i===0)i=list.length;if(i<0)i=list.length+1+i;return Math.min(list.length,Math.max(1,i))-1}
function itemFor(b,x){const t=b.type;
  if(t==='cards'){const c=okCol(x.color||ORDER[b.items.length%ORDER.length]);return {color:c,label:String(x.label||COL[c]).slice(0,40)}}
  if(t==='bullets')return String(typeof x==='string'?x:x.text||'').slice(0,120)||null;
  if(t==='stats')return {value:String(x.value??'').slice(0,12),label:String(x.label??'').slice(0,40)};
  if(t==='icons')return {emoji:String(x.emoji||'✨').slice(0,8),label:String(x.label||'').slice(0,40)};
  if(t==='chart'){const v=+x.value;return isFinite(v)?{label:String(x.label||'').slice(0,14),value:v}:null}
  if(t==='table')return Array.isArray(x)?x.map(String):Object.values(x).map(String);
  if(t==='diagram')return String(typeof x==='string'?x:x.text||x.label||'').slice(0,60)||null;
  return null}
function applyEdit(b,a){const st=a.set||{};const list=listOf(b);
  const hasItem=a.item!=null&&list;
  if(st.kind&&b.type==='chart'&&['bar','pie','line'].includes(st.kind))b.kind=st.kind;
  if(hasItem){const i=idxOf(list,a.item);if(i<0)return false;
    if(b.type==='bullets'){if(st.text)list[i]=String(st.text);if(st.color){b.colors=b.colors||{};b.colors[i]=okCol(st.color)}}
    else if(b.type==='diagram'){if(st.text||st.label)list[i]=String(st.text||st.label)}
    else if(b.type==='table'){if(Array.isArray(st.row))list[i]=st.row.map(String)}
    else{const it=list[i];if(st.label||st.text)it.label=String(st.label||st.text);if(st.color&&b.type==='cards')it.color=okCol(st.color);if(st.color&&b.type==='chart')it.color=okCol(st.color);if(st.value!=null)it.value=b.type==='chart'?+st.value:String(st.value);if(st.emoji)it.emoji=String(st.emoji)}
    return true}
  if(st.color){const c=okCol(st.color);if(b.type==='cards')b.items.forEach(x=>x.color=c);else if(b.type==='bigcard')b.color=c;else if(b.type==='bullets'){b.colors={};b.items.forEach((_,i)=>b.colors[i]=c)}else if(b.type==='chart')b.data.forEach(x=>x.color=c);else b.tint=c}
  if(st.text&&(b.type==='bigcard'||b.type==='raw'||b.type==='write'))b.text=String(st.text);
  if(st.title!=null)b.title=String(st.title);
  return true}
function apply(actions,src){
  if(!actions||!actions.length)return false;
  snap();let mode=false;
  for(const a of actions){
    const t=a&&a.type;
    if(t==='undo'){hist.pop();return doUndo()}
    if(t==='clear'){S.slides.splice(S.idx+1,0,newSlide());S.idx++;mode='slide';toast('تم مسح الشاشة');continue}
    if(t==='next'){if(S.idx<S.slides.length-1){S.idx++;mode='slide'}else toast('هذه آخر شريحة');continue}
    if(t==='prev'){if(S.idx>0){S.idx--;mode='slide'}else toast('هذه أول شريحة');continue}
    if(t==='goto'){const n=(+a.slide|0)-1;if(n>=0&&n<S.slides.length){S.idx=n;mode='slide'}continue}
    if(t==='mode'){setMode(a.name==='write'?'write':'summary');mode=mode||'soft';continue}
    if(t==='suggest'){showChip(String(a.text||'تقصد…؟'),Array.isArray(a.actions)?a.actions:[]);continue}
    if(t==='textcolor'){cur().tc=a.color==='black'?null:okCol(a.color);mode=mode||'soft';toast('لون النص: '+(COL[a.color]||'أسود'));continue}
    if(t==='theme'&&THEMES[a.name]){S.theme=a.name;mode=mode||'soft';toast('المظهر: '+THEMES[a.name]);continue}
    if(t==='settitle'&&a.text){cur().title=String(a.text).slice(0,80);mode=mode||'soft';continue}
    if(t==='title'&&a.text){let sl=cur();if(!isEmpty(sl)&&a.where!=='current'){sl=addSlide();mode='slide'}sl.title=String(a.text).slice(0,80);mode=mode||'soft';continue}
    if(t==='edit'){const b=blk(a.target)||lastBlk();if(b&&applyEdit(b,a))mode=mode||'soft';continue}
    if(t==='remove'){const sl=cur();const b=blk(a.target)||lastBlk();if(!b)continue;const list=listOf(b);
      if(a.item!=null&&list&&list.length>1){const i=idxOf(list,a.item);list.splice(i,1);if(b.colors){const nc={};Object.entries(b.colors).forEach(([k,v])=>{k=+k;if(k<i)nc[k]=v;else if(k>i)nc[k-1]=v});b.colors=nc}}
      else sl.blocks.splice(sl.blocks.indexOf(b),1);mode=mode||'soft';continue}
    if(t==='scale'){const f=Math.min(2,Math.max(.4,+a.factor||1.2));if(a.target){const b=blk(a.target);if(b)b.scale=Math.min(2.2,Math.max(.5,(b.scale||1)*f))}else cur().scale=Math.min(1.8,Math.max(.6,(cur().scale||1)*f));mode=mode||'soft';continue}
    if(t==='move'){const b=blk(a.target)||lastBlk();const list=listOf(b);if(!list)continue;const i=idxOf(list,a.item),j=idxOf(list,a.to);const [x]=list.splice(i,1);list.splice(j,0,x);mode=mode||'soft';continue}
    if(t==='add_items'){const b=blk(a.target)||lastBlk();const list=listOf(b);if(!list)continue;for(const x of (a.items||[]).slice(0,8)){const it=itemFor(b,x);if(it!=null)list.push(it)}b.fresh=b.type==='bullets'?list.length-1:undefined;mode=mode||'soft';continue}
    if(t==='bullets'&&Array.isArray(a.items)){
      if(S.raw||S.mode==='write')continue;let sl=cur();let b=[...sl.blocks].reverse().find(x=>x.type==='bullets');
      const items=a.items.map(String).filter(x=>x.trim()&&!(b&&b.items.includes(x))).slice(0,6);if(!items.length)continue;
      if(a.where==='new'||(b&&b.items.length+items.length>6)){const tt=sl.title;sl=addSlide();sl.title=a.where==='new'?'':(tt?tt+' (تابع)':'');b=null;mode='slide'}
      if(!b||sl.blocks[sl.blocks.length-1]!==b){b={type:'bullets',items:[]};sl.blocks.push(b)}
      b.fresh=b.items.length;b.items.push(...items);mode=mode||'soft';continue}
    if(t==='raw'){let sl=cur();let b=sl.blocks[sl.blocks.length-1];if(!b||b.type!=='raw'){b={type:'raw',text:''};sl.blocks.push(b)}b.text=(b.text+' '+a.text).trim();mode=mode||'soft';continue}
    if(VIS.includes(t)){
      const b=sanitize(a);if(!b)continue;if(b.type==='chart'&&!a.keepKind)b.kind=chartKind(lastText,b.kind);let sl=cur();
      const full=sl.blocks.some(x=>VIS.includes(x.type))||sl.blocks.length>2;
      if(a.where==='new'||(full&&a.where!=='current')){sl=addSlide();mode='slide'}
      sl.blocks.push(b);mode=mode||'soft';continue}
  }
  if(!mode){hist.pop();return actions.some(a=>a.type==='suggest'||a.type==='mode')}
  lastActions=actions.filter(a=>!['undo','next','prev','goto','suggest'].includes(a.type));
  render(mode==='slide'?'slide':false);return true;
}
const okD=d=>typeof d==='string'&&d.length<4000&&/^[MLCQAZHVSTmlcqazhvst0-9\s.,\-]+$/.test(d);
const okC=c=>typeof c==='string'&&/^(#[0-9a-fA-F]{3,8}|none|currentColor|rgba\([\d.,\s]+\))$/.test(c)?c:null;
const okCol=c=>ORDER.includes(c)?c:({black:'blue',yellow:'gold',white:'teal'}[c]||'blue');
function sanitize(a){
  const s=x=>String(x??'').slice(0,60);
  switch(a.type){
  case 'cards':{const it=(a.items||[]).slice(0,8).map(c=>({color:okCol(c.color),label:s(c.label||COL[okCol(c.color)])}));return it.length?{type:'cards',items:it}:null}
  case 'bigcard':return {type:'bigcard',text:s(a.text).slice(0,120),color:okCol(a.color||'gold')};
  case 'stats':{const it=(a.items||[]).slice(0,6).map(x=>({value:s(x.value).slice(0,12),label:s(x.label)}));return it.length?{type:'stats',items:it}:null}
  case 'chart':{const d=(a.data||[]).map(x=>({label:s(x.label).slice(0,14),value:+x.value})).filter(x=>isFinite(x.value)&&x.value>=0);return d.length?{type:'chart',kind:['bar','pie','line'].includes(a.kind)?a.kind:'bar',title:s(a.title),data:d.slice(0,10)}:null}
  case 'table':{const h=(a.headers||[]).slice(0,5).map(s);const r=(a.rows||[]).slice(0,10).map(x=>(x||[]).slice(0,5).map(s));return h.length||r.length?{type:'table',title:s(a.title),headers:h,rows:r}:null}
  case 'icons':{const it=(a.items||[]).slice(0,9).map(x=>({emoji:s(x.emoji).slice(0,8),label:s(x.label)}));return it.length?{type:'icons',items:it}:null}
  case 'draw':{if(a.art&&ART[a.art]){const r=artFor(ART[a.art].t);r.art=a.art;if(a.title)r.title=s(a.title);return r}
    const p=(a.paths||[]).filter(x=>okD(x.d)).slice(0,30).map(x=>({d:x.d,stroke:okC(x.stroke)||'currentColor',fill:okC(x.fill)||'none',w:(+x.w>0&&+x.w<14)?+x.w:undefined}));return p.length?{type:'draw',title:s(a.title),paths:p}:null}
  case 'diagram':{const n=(a.nodes||[]).slice(0,8).map(s).filter(Boolean);return n.length?{type:'diagram',title:s(a.title),nodes:n}:null}
  }return null;
}
function doUndo(){if(!hist.length){toast('لا يوجد ما يمكن التراجع عنه');return false}S=JSON.parse(hist.pop());render('slide');syncMode();toast('تم التراجع');return true}

/* ---------- local fast path: only unambiguous short commands ---------- */
const CW={'ازرق':'blue','زرقاء':'blue','زرقا':'blue','اخضر':'green','خضراء':'green','خضرا':'green','برتقالي':'orange','بنفسجي':'purple','وردي':'pink','زهري':'pink','ذهبي':'gold','احمر':'red','حمراء':'red','حمرا':'red','فيروزي':'teal','اسود':'black'};
const NUMW={'اثنين':2,'ثنتين':2,'ثلاث':3,'ثلاثه':3,'اربع':4,'اربعه':4,'خمس':5,'خمسه':5,'ست':6,'سته':6,'سبع':7,'ثمان':8};
function local(text){
  const n=norm(text).replace(/[؟?!.,،]/g,' ').replace(/\s+/g,' ').trim();const wc=n.split(' ').length;
  if(/^(امسح|شل|نظف)\s*(كل شي|كل شيء|كل شيئ|الكل|الشاشه|كلشي)( من الشاشه)?$/.test(n)||n==='امسح')return [{type:'clear'}];
  if(/^(تراجع|تراجع خطوه|رجع خطوه)$/.test(n))return [{type:'undo'}];
  if(/^(الشريحه|الصفحه)\s*(التاليه|الجايه|اللي بعد)$|^التالي$/.test(n))return [{type:'next'}];
  if(/^(الشريحه|الصفحه)\s*(السابقه|اللي قبل)$|^السابق$/.test(n))return [{type:'prev'}];
  if(/^(الوضع|المظهر)\s*(الليلي|الداكن)$/.test(n))return [{type:'theme',name:'dark'}];
  if(/^(الوضع|المظهر)\s*(النهاري|الفاتح)$/.test(n))return [{type:'theme',name:'light'}];
  if(/^(شغل|فعل|افتح)?\s*وضع الكتابه$/.test(n))return [{type:'mode',name:'write'}];
  if(/^(سكر|اطفي|وقف|الغ)\s*وضع الكتابه$|^(الوضع العادي|وضع العرض)$/.test(n))return [{type:'mode',name:'summary'}];
  let m=n.match(/^(\d+|اثنين|ثنتين|ثلاثه|ثلاث|اربعه|اربع|خمسه|خمس|سته|ست|سبع|ثمان)\s*(بطاقات|كروت|مربعات)$/);
  if(m){const k=Math.min(8,Math.max(1,parseInt(m[1])||NUMW[m[1]]||4));return [{type:'cards',items:Array.from({length:k},(_,i)=>({color:ORDER[i],label:COL[ORDER[i]]}))}]}
  m=n.match(/^(لون|اللون|باللون)\s*(ال)?(\S+)$/);if(m&&CW[m[3]])return [{type:'textcolor',color:CW[m[3]]}];
  m=n.match(/^(ارسم|ارسملي)\s*(لي)?\s*(\S+)$/);if(m){const a=artFor(m[3]);if(a)return [a]}
  return null;
}

/* ---------- LLM ---------- */
let buf='',timer=null,inflight=0,recent=[];
function setThinking(on){inflight+=on?1:-1;document.body.classList.toggle('thinking',inflight>0);updStatus()}
function ctxState(){
  const sl=cur();const sb=b=>{const o={type:b.type};
    if(b.type==='bullets')o.items=b.items;else if(b.type==='cards')o.items=b.items;else if(b.type==='bigcard'){o.text=b.text;o.color=b.color}
    else if(b.type==='stats'||b.type==='icons')o.items=b.items;else if(b.type==='chart'){o.kind=b.kind;o.title=b.title;o.data=b.data.map(x=>({label:x.label,value:x.value}))}
    else if(b.type==='table'){o.headers=b.headers;o.rows=b.rows}else if(b.type==='diagram')o.nodes=b.nodes;else if(b.type==='draw'){o.title=b.title;if(b.art)o.art=b.art}
    else if(b.type==='raw'||b.type==='write')o.text=String(b.text).slice(-200);if(b.scale)o.scale=b.scale;return o};
  return {current:{n:S.idx+1,title:sl.title,textColor:sl.tc,blocks:sl.blocks.map((b,i)=>({id:'b'+i,...sb(b)}))},
    slides:S.slides.map((s,i)=>({n:i+1,title:s.title,types:s.blocks.map(b=>b.type+(b.art?':'+b.art:''))})),
    recent:recent.slice(-6),lastAction:lastActions?JSON.stringify(lastActions).slice(0,600):null,mode:S.mode==='write'?'write':S.raw?'raw':'summary'};
}
const DIRECTED=/ارسم|سو|سوي|طلع|حط|هات|ابي|ابغ|بغيت|ودي|اعرض|وري|خل|غير|بدل|حول|شل|شيل|احذف|امسح|زيد|زود|ضيف|كبر|صغر|عدل|رجع|ودني|لون|بطاق|كرت|جدول|مخطط|رسم/;
async function llm(text){
  const state=ctxState();setThinking(true);
  try{const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,state}),signal:AbortSignal.timeout?AbortSignal.timeout(20000):undefined});
    const j=await r.json();if(j.error)throw new Error(j.error);
    let acts=Array.isArray(j.actions)?j.actions:[];if(S.raw||S.mode==='write')acts=acts.filter(a=>a.type!=='bullets'&&a.type!=='title');
    const done=apply(acts);
    if(!done){if(S.mode==='write'||S.raw)return;
      if(DIRECTED.test(norm(text)))showChip(`ما فهمت تمامًا «${text.slice(0,40)}» — أضيفها كنقطة؟`,[{type:'bullets',items:[text.length>90?text.slice(0,88)+'…':text]}]);
      else heard(text,true)}
  }catch(e){toast('تعذّر الاتصال بالذكاء — جرّب مرة أخرى');if(S.mode!=='write')showChip(`أضيف «${text.slice(0,40)}» كنص؟`,[{type:'raw',text}])}
  finally{setThinking(false)}
}
function heard(t,ignored){const e=$('#heard');e.textContent=(ignored?'سمعت: ':'✓ ')+'«'+t.slice(0,60)+'»';e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),2600)}
function showChip(text,acts){const c=$('#chips');c.innerHTML='';const b=document.createElement('button');b.className='chip';b.innerHTML=`<span>${esc(text)}</span><b>نعم</b>`;
  const x=document.createElement('button');x.className='chip x';x.textContent='✕';
  b.onclick=()=>{c.innerHTML='';apply(acts.map(a=>({...a})))};x.onclick=()=>{c.innerHTML=''};c.append(b,x);clearTimeout(c._t);c._t=setTimeout(()=>{c.innerHTML=''},12000)}
function handleFinal(text){
  text=text.replace(/\s+/g,' ').trim();if(!text)return;lastText=text;recent.push(text);if(recent.length>12)recent.shift();
  const loc=local(text);
  if(loc){heard(text);apply(loc);return}
  if(S.mode==='write'){
    if(DIRECTED.test(norm(text).split(' ').slice(0,3).join(' '))&&text.split(' ').length<=9){llm(text);return}
    writeCommit(text);return}
  heard(text);
  if(S.raw)apply([{type:'raw',text}]);
  buf=(buf+' '+text).trim();clearTimeout(timer);
  const cmd=DIRECTED.test(norm(text));
  timer=setTimeout(()=>{const t=buf;buf='';lastText=t;llm(t)},cmd?150:700);
}

/* ---------- write (dictation) mode ---------- */
function writeBlock(create){const sl=cur();let b=sl.blocks[sl.blocks.length-1];if((!b||b.type!=='write')&&create){b={type:'write',text:''};sl.blocks.push(b);render()}return b&&b.type==='write'?b:null}
function writeEl(){const a=document.querySelectorAll('#slide .write');return a[a.length-1]||null}
function writeCommit(text){const b=writeBlock(true);const el=writeEl();if(!b||!el)return;
  snapOnce();b.text=(b.text?b.text+' ':'')+text;
  const fin=el.querySelector('.fin'),int=el.querySelector('.int');int.innerHTML='';
  const words=text.split(' ');words.forEach((w,i)=>{const sp=document.createElement('span');sp.className='w';sp.style.animationDelay=(i*0.07)+'s';sp.textContent=w+' ';fin.appendChild(sp)});
  scrollWrite();persist()}
let lastSnapAt=0;function snapOnce(){if(Date.now()-lastSnapAt>4000){snap();lastSnapAt=Date.now()}}
function writeInterim(text){if(S.mode!=='write')return setLive(text);setLive('');
  if(!text){const el=writeEl();if(el)el.querySelector('.int').innerHTML='';return}
  writeBlock(true);const el=writeEl();if(!el)return;const int=el.querySelector('.int');
  const words=text.trim().split(/\s+/);const kids=[...int.children];
  words.forEach((w,i)=>{if(kids[i]){if(kids[i].dataset.w!==w){kids[i].dataset.w=w;kids[i].textContent=w+' '}}else{const sp=document.createElement('span');sp.className='w soft';sp.dataset.w=w;sp.textContent=w+' ';int.appendChild(sp)}});
  kids.slice(words.length).forEach(k=>k.remove());scrollWrite()}
function scrollWrite(){const w=$('#slideWrap');w.scrollTo({top:w.scrollHeight,behavior:'smooth'})}
function setMode(m){$('#chips').innerHTML='';if(m==='write'&&S.mode!=='write'){const sl=cur();if(!isEmpty(sl)&&!(sl.blocks.length===1&&sl.blocks[0].type==='write'))addSlide();render('slide')}S.mode=m;syncMode();persist();toast(m==='write'?'وضع الكتابة: سأكتب كل ما تقوله':'وضع العرض الذكي')}
function syncMode(){document.body.classList.toggle('writing',S.mode==='write');document.querySelectorAll('#modeSeg button').forEach(b=>b.classList.toggle('on',b.dataset.m===(S.mode==='write'?'write':'summary')));
  document.body.classList.toggle('calli',!!S.calli)}

/* ---------- speech (robust for iOS Safari) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,listening=false,consumed='',pending='',idleT=null,restarts=0;
function updStatus(){$('#statusText').textContent=inflight>0?'أفكّر…':listening?(S.mode==='write'?'أكتب ما تقوله…':'أستمع إليك… تحدّث بحرية'):'متوقف'}
function setLive(t){$('#live').textContent=t}
function commitPending(){clearTimeout(idleT);const t=pending.trim();pending='';if(S.mode==='write')writeInterim('');else setLive('');if(t)handleFinal(t)}
function startRec(){
  if(!SR){openType();toast('الصوت غير مدعوم هنا — اكتب أوامرك');return}
  try{rec&&rec.abort()}catch(_){}
  rec=new SR();rec.lang='ar-AE';rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;consumed='';pending='';
  rec.onresult=e=>{let full='',anyFinal=false;for(let i=0;i<e.results.length;i++){full+=e.results[i][0].transcript+' ';if(i===e.results.length-1&&e.results[i].isFinal)anyFinal=true}
    full=full.replace(/\s+/g,' ').trim();
    if(consumed&&full.startsWith(consumed))pending=full.slice(consumed.length).trim();else if(consumed&&!full.startsWith(consumed)&&full.length<consumed.length){consumed='';pending=full}else pending=consumed?full.slice(Math.min(consumed.length,full.length)).trim():full;
    if(S.mode==='write')writeInterim(pending);else setLive(pending);
    clearTimeout(idleT);
    if(anyFinal){consumed=full;commitPending()}else idleT=setTimeout(()=>{consumed=full;commitPending()},S.mode==='write'?900:1200)};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){listening=false;setMic();toast('اسمح بالوصول إلى الميكروفون من إعدادات Safari');openType()}};
  rec.onend=()=>{if(pending)commitPending();consumed='';if(listening){restarts++;setTimeout(()=>{if(listening)try{startRec()}catch(_){}},restarts>20?800:120)}};
  rec.onspeechstart=()=>{restarts=0};
  try{rec.start();listening=true}catch(e){listening=false}
  setMic();
}
function stopRec(){listening=false;if(pending)commitPending();try{rec&&rec.stop()}catch(_){}setMic();setLive('')}
function setMic(){document.body.classList.toggle('listening',listening);$('#micLabel').textContent=listening?'إيقاف الاستماع':'ابدأ الاستماع';updStatus()}

/* ---------- UI wiring ---------- */
function begin(){document.body.classList.add('started');$('#dock').hidden=false}
$('#bStart').onclick=()=>{begin();startRec()};
$('#bTypeStart').onclick=()=>{begin();openType()};
if(!SR){$('#unsupported').hidden=false;$('#bStart').textContent='ابدأ بالكتابة';$('#bStart').onclick=()=>{begin();openType()}}
$('#bMic').onclick=()=>listening?stopRec():startRec();
function openType(){const f=$('#typeForm');f.hidden=false;$('#bKbd').classList.add('on');setTimeout(()=>$('#typeIn').focus(),50)}
$('#bKbd').onclick=()=>{const f=$('#typeForm');if(f.hidden)openType();else{f.hidden=true;$('#bKbd').classList.remove('on')}};
$('#typeForm').onsubmit=e=>{e.preventDefault();const v=$('#typeIn').value;$('#typeIn').value='';handleFinal(v)};
$('#bUndo').onclick=doUndo;
$('#bPrev').onclick=()=>{if(S.idx>0){S.idx--;render('slide')}};
$('#bNext').onclick=()=>{if(S.idx<S.slides.length-1){S.idx++;render('slide')}};
let sx=null;$('#slideWrap').addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
$('#slideWrap').addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>70){dx>0?$('#bNext').onclick():$('#bPrev').onclick()}});

$('#modeSeg').onclick=e=>{const b=e.target.closest('button');if(!b)return;snap();setMode(b.dataset.m)};
$('#calliToggle').onchange=e=>{S.calli=e.target.checked;syncMode();persist()};
/* sheet */
function openSheet(){
  const st=$('#stage').getBoundingClientRect(),W=st.width||390,H=st.height||640,TW=104,sc=TW/W;
  $('#thumbs').innerHTML=S.slides.map((s,i)=>`<button class="th ${i===S.idx?'cur':''}" data-i="${i}" style="width:${TW}px;height:${Math.round(H*sc)}px" aria-label="شريحة ${toAr(i+1)}"><div class="mini" style="width:${W}px;height:${H}px;transform:scale(${sc});--tc:${HEX[s.tc]||'var(--fg)'};--acc:${HEX[s.tc]||'var(--blue)'}">${isEmpty(s)?'<div class="mini-empty">شريحة فارغة</div>':slideHTML(s,true)}</div><small>${toAr(i+1)}</small></button>`).join('');
  setTimeout(()=>{const c=$('#thumbs .cur');c&&c.scrollIntoView({inline:'center',block:'nearest'})},30);
  $('#rawToggle').checked=S.raw;$('#calliToggle').checked=!!S.calli;
  $('#themes').innerHTML=Object.entries(THEMES).map(([k,v])=>`<button class="t-${k} ${S.theme===k?'on':''}" data-t="${k}" style="background:var(--bg);color:var(--fg)">${v}</button>`).join('');
  listSaved();$('#sheet').hidden=false;
}
const summ=s=>{const b=s.blocks[0];if(!b)return s.overlay?'رسم يدوي':'شريحة فارغة';return {bullets:'نقاط',raw:'نص',cards:'بطاقات',bigcard:'بطاقة كبيرة',stats:'أرقام',chart:'رسم بياني',table:'جدول',icons:'أيقونات',draw:'رسم',diagram:'مخطط'}[b.type]||''};
$('#bMenu').onclick=openSheet;
$('#sheet').onclick=e=>{const t=e.target.closest('[data-i],[data-t],[data-close]');if(!t)return;
  if(t.dataset.close!==undefined){$('#sheet').hidden=true;return}
  if(t.dataset.i){S.idx=+t.dataset.i;$('#sheet').hidden=true;render('slide')}
  if(t.dataset.t){snap();S.theme=t.dataset.t;render();openSheet()}};
$('#rawToggle').onchange=e=>{S.raw=e.target.checked;persist();toast(S.raw?'وضع النص الحرفي':'وضع التلخيص الذكي')};
function saves(){try{return JSON.parse(localStorage.getItem('arshow.saves')||'[]')}catch(e){return []}}
function listSaved(){const a=saves();$('#saved').innerHTML=a.length?a.map((x,i)=>`<div class="sv"><span>${esc(x.name)} · ${toAr(x.data.slides.length)} شرائح</span><span><button data-open="${i}">فتح</button> &nbsp; <button class="del" data-del="${i}">حذف</button></span></div>`).join(''):'<p class="tips" style="padding:0">لا توجد عروض محفوظة بعد.</p>'}
$('#saved').onclick=e=>{const o=e.target.dataset.open,d=e.target.dataset.del,a=saves();
  if(o!==undefined){snap();S=JSON.parse(JSON.stringify(a[o].data));S.idx=0;$('#sheet').hidden=true;render('slide');toast('تم فتح العرض')}
  if(d!==undefined){a.splice(d,1);localStorage.setItem('arshow.saves',JSON.stringify(a));listSaved()}};
$('#bSave').onclick=()=>{const a=saves();const name=(S.slides.find(s=>s.title)||{}).title||'عرض '+new Date().toLocaleDateString('ar-AE');
  const ex=a.findIndex(x=>x.name===name);const rec={name,at:Date.now(),data:S};ex>=0?a[ex]=rec:a.unshift(rec);
  try{localStorage.setItem('arshow.saves',JSON.stringify(a.slice(0,20)));toast('تم الحفظ على هذا الجهاز')}catch(e){toast('المساحة ممتلئة')}listSaved()};
$('#bNew').onclick=()=>{snap();S={slides:[newSlide()],idx:0,theme:S.theme,raw:S.raw};$('#sheet').hidden=true;render('slide');toast('عرض جديد')};
$('#bPdf').onclick=()=>{const p=$('#print');p.className='t-'+S.theme;
  p.innerHTML=S.slides.filter(s=>!isEmpty(s)).map(s=>`<section class="pslide" style="--tc:${HEX[s.tc]||'var(--fg)'};--acc:${HEX[s.tc]||'var(--blue)'}">${slideHTML(s,true)}</section>`).join('')||'<section class="pslide"><h2 class="title">عرض فارغ</h2></section>';
  $('#sheet').hidden=true;setTimeout(()=>window.print(),300)};

/* ---------- freehand ink ---------- */
const ink=$('#ink');let ctx,strokes=[],curS=null,pen={c:'#0A84FF',w:4,er:false};
const PENS=['#0b0b0f','#0A84FF','#FF453A','#30D158','#FF9F0A','#BF5AF2','#D9A514','#ffffff'];
$('#penColors').innerHTML=PENS.map((c,i)=>`<button class="pc ${i===1?'on':''}" data-c="${c}" style="background:${c}" aria-label="لون"></button>`).join('');
function sizeInk(){const r=ink.getBoundingClientRect(),dp=devicePixelRatio||1;ink.width=r.width*dp;ink.height=r.height*dp;ctx=ink.getContext('2d');ctx.scale(dp,dp);redraw()}
function redraw(){if(!ctx)return;const r=ink.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);for(const s of strokes)drawStroke(s)}
function drawStroke(s){ctx.globalCompositeOperation=s.er?'destination-out':'source-over';ctx.strokeStyle=s.c;ctx.lineWidth=s.w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  s.p.forEach((p,i)=>{if(!i)ctx.moveTo(p[0],p[1]);else{const q=s.p[i-1];ctx.quadraticCurveTo(q[0],q[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}});if(s.p.length===1)ctx.lineTo(s.p[0][0]+.1,s.p[0][1]);ctx.stroke();ctx.globalCompositeOperation='source-over'}
ink.addEventListener('pointerdown',e=>{ink.setPointerCapture(e.pointerId);curS={c:pen.c,w:pen.er?pen.w*3:pen.w,er:pen.er,p:[[e.offsetX,e.offsetY]]};strokes.push(curS);redraw()});
ink.addEventListener('pointermove',e=>{if(!curS)return;curS.p.push([e.offsetX,e.offsetY]);redraw()});
const endS=()=>{curS=null};ink.addEventListener('pointerup',endS);ink.addEventListener('pointercancel',endS);
function enterDraw(){if(listening)stopRec();$('#dock').hidden=true;$('#drawbar').hidden=false;ink.hidden=false;strokes=[];
  const ov=cur().overlay;sizeInk();
  if(ov&&ov.png){const im=new Image();im.onload=()=>{const r=ink.getBoundingClientRect();strokes.push({img:im});ctx.drawImage(im,0,0,r.width,r.height)};im.src=ov.png;}
  toast('ارسم بإصبعك فوق الشريحة')}
const _drawStroke=drawStroke;drawStroke=s=>{if(s.img){const r=ink.getBoundingClientRect();ctx.drawImage(s.img,0,0,r.width,r.height)}else _drawStroke(s)};
function exitDraw(save){
  if(save){const real=strokes.filter(s=>!s.img);if(real.length||strokes.length){snap();cur().overlay=strokes.length?{png:ink.toDataURL('image/png')}:null}}
  ink.hidden=true;$('#drawbar').hidden=true;$('#dock').hidden=false;$('#bDraw').classList.remove('on');render();
}
$('#bDraw').onclick=enterDraw;
$('#drawbar').onclick=e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.c){pen.c=b.dataset.c;pen.er=false;document.querySelectorAll('.pc,#bEraser').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
  if(b.dataset.w){pen.w=+b.dataset.w;document.querySelectorAll('.sz').forEach(x=>x.classList.remove('on'));b.classList.add('on')}
  if(b.id==='bEraser'){pen.er=!pen.er;b.classList.toggle('on',pen.er)}
  if(b.id==='bInkUndo'){strokes.pop();redraw()}
  if(b.id==='bInkClear'){strokes=[];redraw()}
  if(b.id==='bInkDone')exitDraw(true);
  if(b.id==='bTidy')tidy();
};
async function tidy(){
  const real=strokes.filter(s=>!s.img&&!s.er&&s.p.length>1);if(!real.length){toast('ارسم شيئًا أولًا');return}
  const r=ink.getBoundingClientRect(),sc=1000/Math.max(r.width,r.height);
  const data=real.map(s=>({color:s.c,pts:simplify(s.p,3).map(p=>[Math.round(p[0]*sc),Math.round(p[1]*sc)]).slice(0,80)}));
  setThinking(true);toast('أرتّب رسمتك…');
  try{const res=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:'tidy',strokes:data})});const j=await res.json();
    const paths=(j.paths||[]).filter(p=>okD(p.d)).map(p=>({d:p.d,stroke:okC(p.stroke)||'#0A84FF',fill:'none'}));
    if(!paths.length)throw 0;
    snap();cur().overlay={paths,vb:`0 0 ${Math.round(r.width*sc)} ${Math.round(r.height*sc)}`};
    ink.hidden=true;$('#drawbar').hidden=true;$('#dock').hidden=false;render();toast('تم ترتيب الرسمة ✨');
  }catch(e){toast('تعذّر الترتيب، جرّب مرة أخرى')}finally{setThinking(false)}
}
function simplify(p,tol){if(p.length<3)return p;const out=[p[0]];let last=p[0];for(const q of p){if(Math.hypot(q[0]-last[0],q[1]-last[1])>tol*3){out.push(q);last=q}}out.push(p[p.length-1]);return out}
addEventListener('resize',()=>{if(!ink.hidden)sizeInk()});

/* ---------- boot ---------- */
try{const s=JSON.parse(localStorage.getItem('arshow.cur'));if(s&&s.slides&&s.slides.length){S=s;if(S.slides.some(x=>!isEmpty(x))){}}}catch(e){}
S.mode=S.mode||'summary';render(true);syncMode();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
window.__arshow={handleFinal,apply,get S(){return S},local,writeInterim,ctxState};
