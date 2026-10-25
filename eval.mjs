const API='https://olkhmscftouksbgjmtjt.supabase.co/functions/v1/arshow';
const empty={current:{n:1,title:'',blocks:[]},slides:[{n:1,title:'',types:[]}],recent:[],lastAction:null,mode:'summary'};
const cards4={current:{n:2,title:'',blocks:[{id:'b0',type:'cards',items:[{label:'أزرق',color:'blue'},{label:'أخضر',color:'green'},{label:'برتقالي',color:'orange'},{label:'بنفسجي',color:'purple'}]}]},slides:[{n:1,title:'مقدمة',types:['bullets']},{n:2,title:'',types:['cards']}],recent:['ابي اربع كروت'],lastAction:'cards:4',mode:'summary'};
const bul={current:{n:1,title:'خطة التسويق',blocks:[{id:'b0',type:'bullets',items:['زيادة المتابعين','تحسين المحتوى','إطلاق حملة رمضان']}]},slides:[{n:1,title:'خطة التسويق',types:['bullets']}],recent:['اليوم بنتكلم عن خطة التسويق'],lastAction:'bullets:3',mode:'summary'};
const big={current:{n:3,title:'',blocks:[{id:'b0',type:'bigcard',text:'رؤيتنا',color:'gold'}]},slides:[{n:1,title:'مقدمة',types:['bullets']},{n:2,title:'الصقر',types:['draw:falcon']},{n:3,title:'',types:['bigcard']}],recent:['بطاقة ذهبية فيها رؤيتنا'],lastAction:'bigcard',mode:'summary'};
const drw={current:{n:4,title:'النخلة',blocks:[{id:'b0',type:'draw',art:'palm'}]},slides:[{n:1,title:'مقدمة',types:['bullets']},{n:2,title:'الصقر',types:['draw:falcon']},{n:3,title:'الأرقام',types:['stats']},{n:4,title:'النخلة',types:['draw:palm']}],recent:['ارسم نخلة'],lastAction:'draw:palm',mode:'summary'};
const chartc={current:{n:2,title:'المبيعات',blocks:[{id:'b0',type:'chart',kind:'bar',data:[{label:'دبي',value:200},{label:'أبوظبي',value:150}]}]},slides:[{n:1,title:'',types:[]},{n:2,title:'المبيعات',types:['chart']}],recent:[],lastAction:'chart',mode:'summary'};
const write={...empty,mode:'write'};
const T=(a,t)=>a.some(x=>x.type===t), F=(a,t)=>a.find(x=>x.type===t)||{};
const C=[
// creation, dialect
[empty,'ابي اربع كروت',a=>F(a,'cards').items?.length===4],
[empty,'سو لي خمس بطاقات',a=>F(a,'cards').items?.length===5],
[empty,'طلع لي ست كروت ملونة',a=>F(a,'cards').items?.length===6],
[empty,'ابغى بطاقة ذهبية كبيرة مكتوب فيها رؤيتنا ٢٠٣٠',a=>T(a,'bigcard')&&F(a,'bigcard').color==='gold'],
[empty,'طلع لي صقر',a=>F(a,'draw').art==='falcon'],
[empty,'ارسم لي جمل',a=>F(a,'draw').art==='camel'],
[empty,'ابي رسمة نخلة',a=>F(a,'draw').art==='palm'],
[empty,'ارسم محمل في البحر',a=>F(a,'draw').art==='dhow'],
[empty,'سو لي رسمة مسجد',a=>F(a,'draw').art==='mosque'],
[empty,'ارسم علم الدولة',a=>F(a,'draw').art==='flag'],
[empty,'ارسم لي سيارة',a=>T(a,'draw')&&(F(a,'draw').paths?.length>2)],
[empty,'وريني خريطة فيها موقعنا',a=>F(a,'draw').art==='map'],
[empty,'سو لي مخطط لخطوات التسجيل',a=>F(a,'diagram').nodes?.length>=3],
[empty,'هات جدول فيه الباقات: الأساسية بعشرين والمتقدمة بخمسين والاحترافية بمية',a=>F(a,'table').rows?.length===3],
[empty,'مبيعاتنا في دبي ميتين وأبوظبي ميه وخمسين والشارقة ميه',a=>F(a,'chart').data?.length===3],
[empty,'نسب العملاء: رجال ستين بالمية وحريم أربعين',a=>F(a,'chart').kind==='pie'||T(a,'stats')],
[empty,'سو رسم خطي لعدد الزوار يناير عشرة فبراير عشرين مارس خمسة وثلاثين',a=>F(a,'chart').kind==='line'],
[empty,'نسبة الرضا عندنا تسعين بالمية',a=>T(a,'stats')||T(a,'chart')],
[empty,'حط أيقونات للسرعة والأمان والدعم',a=>F(a,'icons').items?.length===3],
[empty,'سو لي عرض عن الصقارة',a=>T(a,'title')&&F(a,'bullets').items?.length>=3&&(T(a,'draw')||T(a,'icons'))],
[empty,'ابي عرض عن النخلة في الإمارات',a=>T(a,'title')&&T(a,'bullets')],
[empty,'سو لي عرض قصير عن الذكاء الاصطناعي',a=>T(a,'title')&&T(a,'bullets')],
[empty,'اليوم بنتكلم عن خطتنا للتوسع، أول شي بنفتح فرع في العين وبعدين نركز على التسويق الرقمي',a=>T(a,'bullets')],
[empty,'الهدف إننا نوصل لعشرة آلاف عميل قبل نهاية السنة',a=>T(a,'bullets')||T(a,'stats')],
[empty,'خل الخط أزرق',a=>F(a,'textcolor').color==='blue'||T(a,'edit')],
[empty,'خله ليلي',a=>F(a,'theme').name==='dark'||F(a,'theme').name==='night'],
[empty,'رجعه نهاري',a=>F(a,'theme').name==='light'],
[empty,'امسح كل شي',a=>T(a,'clear')],
[empty,'شل كل شي من الشاشة',a=>T(a,'clear')],
[empty,'تراجع',a=>T(a,'undo')],
[empty,'الشريحة الجاية',a=>T(a,'next')],
[empty,'شغل وضع الكتابة',a=>F(a,'mode').name==='write'],
[empty,'طيب',a=>a.length===0],
[empty,'السلام عليكم ورحمة الله',a=>a.length===0||T(a,'title')],
[empty,'امم',a=>a.length===0],
[empty,'حط شي عن الأمان',a=>T(a,'suggest')||T(a,'bullets')],
// follow-ups on cards
[cards4,'شل الثالثة',a=>F(a,'remove').target==='b0'&&F(a,'remove').item===3],
[cards4,'زيد بطاقة',a=>F(a,'add_items').target==='b0'&&F(a,'add_items').items?.length===1],
[cards4,'زيد بطاقتين',a=>F(a,'add_items').items?.length===2],
[cards4,'الثانية خلها ذهبية',a=>F(a,'edit').item===2&&F(a,'edit').set?.color==='gold'],
[cards4,'خلهم كلهم حمر',a=>{const e=a.filter(x=>x.type==='edit');return e.length&&e.every(x=>x.set?.color==='red')}],
[cards4,'كبرهم',a=>F(a,'scale').factor>1],
[cards4,'شل الأخيرة',a=>F(a,'remove').item===4],
[cards4,'غير اسم الأولى إلى الرؤية',a=>F(a,'edit').item===1&&/الرؤية/.test(F(a,'edit').set?.label||F(a,'edit').set?.text||'')],
[cards4,'خل الأولى آخر وحدة',a=>F(a,'move').item===1&&F(a,'move').to===4],
[cards4,'نفس اللي قبل',a=>F(a,'cards').items?.length===4],
// bullets follow-ups
[bul,'شل النقطة الثانية',a=>F(a,'remove').item===2],
[bul,'عدل الأولى خلها زيادة المتابعين إلى مليون',a=>F(a,'edit').item===1&&/مليون/.test(F(a,'edit').set?.text||'')],
[bul,'زيد نقطة عن التعاون مع المؤثرين',a=>(F(a,'add_items').items?.length===1)||(F(a,'bullets').items?.length===1)],
[bul,'غير العنوان إلى خطة ٢٠٢٦',a=>T(a,'settitle')],
[bul,'صغر الكلام شوي',a=>F(a,'scale').factor<1],
[bul,'خل النقطة الثالثة حمرا',a=>F(a,'edit').item===3&&F(a,'edit').set?.color==='red'],
[bul,'وبعدين بنسوي مسابقات أسبوعية للمتابعين',a=>T(a,'bullets')||T(a,'add_items')],
// bigcard
[big,'خلها حمرا',a=>F(a,'edit').target==='b0'&&F(a,'edit').set?.color==='red'],
[big,'كبرها',a=>F(a,'scale').factor>1],
[big,'غير الكلام اللي فيها إلى رسالتنا',a=>/رسالتنا/.test(F(a,'edit').set?.text||'')],
[big,'الرسم اللي قبل',a=>F(a,'goto').slide===2],
// drawing
[drw,'كبرها شوي',a=>F(a,'scale').target==='b0'&&F(a,'scale').factor>1],
[drw,'رجعني للصقر',a=>F(a,'goto').slide===2],
[drw,'ودني الشريحة الثالثة',a=>F(a,'goto').slide===3],
[drw,'شلها',a=>F(a,'remove').target==='b0'],
[drw,'ارجع ورا',a=>T(a,'prev')||T(a,'undo')],
// chart
[chartc,'زيد الشارقة ميه',a=>F(a,'add_items').items?.[0]?.value==100],
[chartc,'خله دائري',a=>F(a,'edit').set?.kind==='pie'||F(a,'chart').kind==='pie'],
[chartc,'أبوظبي طلعت ميتين وخمسين مو ميه وخمسين',a=>F(a,'edit').item===2&&+F(a,'edit').set?.value===250],
// write mode
[write,'كان يا ما كان في قديم الزمان',a=>!T(a,'bullets')&&!T(a,'title')],
[write,'رجعني للوضع العادي',a=>F(a,'mode').name==='summary'],
[write,'امسح الشاشة',a=>T(a,'clear')],
];
let models={};let ok=0,fails=[],lat=[];const q=[...C.entries()];
async function run(){while(q.length){const [i,[ctx,t,chk]]=q.shift();const s=Date.now();let j;
 for(let k=0;k<2;k++){try{const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:t,state:ctx})});j=await r.json();if(!j.error)break}catch(e){j={error:String(e)}}}
 lat.push(Date.now()-s);models[j._m]=(models[j._m]||0)+1;const a=j.actions||[];let pass=false;try{pass=!j.error&&chk(a)}catch(e){}
 await new Promise(r=>setTimeout(r,2200)); if(pass)ok++;else fails.push({i,t,got:JSON.stringify(j).slice(0,260)})}}
await Promise.all([run()]);
lat.sort((a,b)=>a-b);
console.log(`SCORE ${ok}/${C.length} = ${(ok/C.length*100).toFixed(1)}%  median ${lat[lat.length>>1]}ms p90 ${lat[Math.floor(lat.length*.9)]}ms`);
console.log(models);for(const f of fails)console.log('FAIL',f.i,f.t,'=>',f.got);
