const KEY = Deno.env.get("TV_AI_API_KEY") ?? "";
const MODELS = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-3.5-flash"];
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const SYS = `أنت محرّك عرض تقديمي صوتي عربي. يصلك كلام منطوق (قد يحتوي أخطاء تعرّف صوتي) وحالة الشاشة. أعد JSON فقط بالشكل {"actions":[...]}.
الأنواع المسموحة:
- {"type":"title","text":"..."} عنوان قصير جديد (يبدأ شريحة جديدة)
- {"type":"bullets","items":["..."]} لخّص الكلام العادي في نقاط موجزة أنيقة (٢-٥ كلمات إلى جملة قصيرة) بعربية فصحى سليمة طبيعية، لا تنسخ كل كلمة
- {"type":"cards","items":[{"label":"أزرق","color":"blue"}]} بطاقات ملونة؛ الألوان: blue green orange purple pink gold red teal
- {"type":"bigcard","text":"...","color":"gold"} بطاقة كبيرة واحدة
- {"type":"stats","items":[{"value":"٧٥٪","label":"..."}]}
- {"type":"chart","kind":"bar"|"pie"|"line","title":"...","data":[{"label":"...","value":رقم}]}
- {"type":"table","headers":["..."],"rows":[["..."]]}
- {"type":"icons","items":[{"emoji":"🚀","label":"..."}]}
- {"type":"textcolor","color":"blue|green|orange|purple|pink|gold|red|black"}
- {"type":"theme","name":"light|dark|sand|ocean|night"}
- {"type":"draw","title":"...","paths":[{"d":"SVG path","stroke":"#hex","fill":"none|#hex"}]} رسم توضيحي نظيف بخطوط في viewBox 0 0 200 200، 4-14 مسار، خطوط واضحة بسيطة أنيقة (بيت، شجرة، صقر، خريطة، سهم، دائرة...). استخدم أوامر M L C Q A Z فقط. اجعل الرسم معروفًا فورًا كأيقونة خطية احترافية (مثل أيقونات Apple SF Symbols): نسب صحيحة، تفاصيل مميزة للشكل (الصقر: رأس بمنقار معقوف وجناحان مفرودان بريش وذيل؛ البيت: سقف وباب ونوافذ ومدخنة)، ألوان متناسقة هادئة، stroke داكن موحد، وتعبئة فاتحة اختيارية.
- {"type":"diagram","title":"...","nodes":["..."]} مخطط انسيابي متسلسل (٢-٧ عقد قصيرة)
- {"type":"clear"} مسح الشاشة
- {"type":"undo"} | {"type":"next"} | {"type":"prev"}
القواعد: إذا كان الكلام أمرًا صريحًا نفّذه. إذا كان كلامًا عاديًا أعد bullets (وعنوانًا إن بدأ موضوع جديد واضح). إذا ذُكرت أرقام لمقارنة فاعرض chart أو stats. إذا لم يكن هناك محتوى مفيد أعد {"actions":[]}. لا تكرر نقاطًا موجودة في الحالة.`;
const TIDY = `حوّل خطوط رسم يدوي تقريبية إلى أشكال نظيفة. يصلك قائمة خطوط (نقاط مبسطة على لوحة 1000x1000). أعد JSON {"paths":[{"d":"SVG path","stroke":"#hex"}]} بنفس الإحداثيات تقريبًا: الدوائر دوائر مثالية، المستطيلات مستقيمة، الخطوط مستقيمة، الأسهم واضحة، والمنحنيات ناعمة.`;
async function gem(sys: string, user: string, models = MODELS) {
  let last = "";
  for (const m of models) {
    let r: Response;
    try { r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 } }),
      signal: AbortSignal.timeout(m.includes("3.5-flash") && !m.includes("lite") ? 14000 : 7000),
    }); } catch (_e) { last = `${m}:timeout`; continue; }
    if (r.ok) { const j = await r.json(); const t = j.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? "").join("") ?? "{}"; return JSON.parse(t); }
    last = `${m}:${r.status}`;
  }
  throw new Error(last);
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const b = await req.json();
    const text = String(b.text ?? "").slice(0, 2000);
    const out = b.mode === "tidy" ? await gem(TIDY, JSON.stringify(b.strokes ?? []).slice(0, 20000))
      : await gem(SYS, `حالة الشاشة: ${JSON.stringify(b.state ?? {}).slice(0, 1500)}\nالكلام: ${text}`, /ارسم|ارسملي|رسمة|ارسمي/.test(text) ? ["gemini-3.5-flash", "gemini-3.1-flash-lite"] : MODELS);
    return new Response(JSON.stringify(out), { headers: { ...cors, "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: { ...cors, "content-type": "application/json" } });
  }
});
