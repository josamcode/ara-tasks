import React, { useState } from "react";
import {
  Home, ListChecks, Clock, User, Bell, Camera, MapPin, Check, X, ShieldCheck,
  Building2, Users, Calendar, CreditCard, Settings, Search, ChevronDown,
  TriangleAlert, Filter, BarChart3, Plus, Info, CheckCircle2
} from "lucide-react";

/* ============================================================
   ARA Tasks — Component Library (real React reference)
   Every control here is custom & reusable. Tokens drive everything.
   Toggle AR-RTL ⇄ EN-LTR at the top to see the bidirectional system.
   ============================================================ */

const T = {
  brand:"#0C5A54", brand700:"#083F3A", brand50:"#E4F0EE",
  ink:"#14201C", muted:"#63726C", paper:"#EAEEEC", surface:"#FFFFFF", line:"#D8E0DD",
  ok:"#1E8E5A", ok50:"#E4F3EB", warn:"#C4841A", warn50:"#F7EEDD",
  bad:"#C0392B", bad50:"#F8E7E4", gold:"#A9812F", gold50:"#F4EEDF",
};
const UI = "'IBM Plex Sans Arabic', system-ui, 'Segoe UI', Tahoma, sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, Menlo, monospace";

const STR = {
  ar:{ subtitle:"مرجع مكتبة الواجهات — كل عنصر مخصّص وقابل لإعادة الاستخدام",
    components:"المكوّنات", screens:"الشاشات", buttons:"الأزرار", status:"الحالات",
    forms:"حقول الإدخال", feedback:"التنبيهات", data:"عرض البيانات", domain:"مكوّنات المنتج",
    present:"حاضر", late:"متأخر", absent:"غياب", verified:"موثّق",
    name:"الاسم الكامل", namePh:"اكتب الاسم", branch:"الفرع", pickBranch:"اختر الفرع",
    remember:"تذكّرني", notify:"تفعيل الإشعارات", save:"حفظ", checkin:"تسجيل الحضور",
    submit:"إرسال للمراجعة", approve:"اعتماد", reject:"رفض", capture:"التقط صورة",
    liveOnly:"الكاميرا المباشرة فقط", inside:"أنت داخل النطاق", offline:"غير متصل — سيُزامَن تلقائيًا",
    lateNote:"سيُسجَّل حضورك متأخرًا 3 دقائق.", present_now:"الحاضرون الآن",
    ontime:"الالتزام بالمواعيد", proofRate:"المهام بإثبات", overdue:"مهام متأخرة",
    myday:"يومك", morning:"صباح الخير", shift:"وردية الصباح", tasksToday:"مهام اليوم",
    approvals:"الموافقات", pending:"مهام بانتظار مراجعتك", compare:"مقارنة الفروع",
    high:"عالية", inprog:"قيد التنفيذ", notstarted:"لم تبدأ", awaiting:"بانتظار الموافقة",
    tasks:"المهام", attendance:"الحضور", account:"حسابي", team:"الفريق", reports:"التقارير",
    saved:"تم الحفظ بنجاح", from:"من مركز الفرع", ready:"جاهز للتسجيل" },
  en:{ subtitle:"UI component library reference — every control is custom & reusable",
    components:"Components", screens:"Screens", buttons:"Buttons", status:"Status",
    forms:"Form controls", feedback:"Feedback", data:"Data display", domain:"Domain components",
    present:"Present", late:"Late", absent:"Absent", verified:"Verified",
    name:"Full name", namePh:"Enter name", branch:"Branch", pickBranch:"Select branch",
    remember:"Remember me", notify:"Enable notifications", save:"Save", checkin:"Check in",
    submit:"Submit for review", approve:"Approve", reject:"Reject", capture:"Take photo",
    liveOnly:"Live camera only", inside:"You're inside the zone", offline:"Offline — will sync automatically",
    lateNote:"You'll be marked 3 minutes late.", present_now:"Present now",
    ontime:"On-time rate", proofRate:"Tasks with proof", overdue:"Overdue tasks",
    myday:"Your day", morning:"Good morning", shift:"Morning shift", tasksToday:"Today's tasks",
    approvals:"Approvals", pending:"tasks awaiting your review", compare:"Branch comparison",
    high:"High", inprog:"In progress", notstarted:"Not started", awaiting:"Awaiting approval",
    tasks:"Tasks", attendance:"Attendance", account:"Account", team:"Team", reports:"Reports",
    saved:"Saved successfully", from:"from branch center", ready:"Ready to check in" },
};

/* ---------- primitives ---------- */
function Wordmark({ color = T.ink, size = 17 }) {
  return (
    <span dir="ltr" style={{ unicodeBidi:"isolate", fontFamily:UI, fontWeight:700, color, fontSize:size, whiteSpace:"nowrap", letterSpacing:"-0.01em" }}>
      <span style={{ letterSpacing:"0.04em" }}>ARA</span> Tasks
    </span>
  );
}

function Btn({ variant="brand", icon:Icon, children, onClick, full, sm, disabled }) {
  const skins = {
    brand:{ background:T.brand, color:"#fff", border:"none" },
    ok:{ background:T.ok, color:"#fff", border:"none" },
    danger:{ background:T.bad, color:"#fff", border:"none" },
    ghost:{ background:"#fff", color:T.brand, border:`1.5px solid ${T.brand50}` },
    line:{ background:"#fff", color:T.ink, border:`1px solid ${T.line}` },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8,
        width:full?"100%":undefined, padding:sm?"9px 14px":"13px 16px", borderRadius:11,
        fontFamily:UI, fontWeight:600, fontSize:sm?13.5:15, cursor:disabled?"not-allowed":"pointer",
        opacity:disabled?0.55:1, transition:"all .15s", ...skins }}>
      {Icon && <Icon size={sm?15:18} strokeWidth={2.2} />}{children}
    </button>
  );
}

function Pill({ tone="muted", icon:Icon, children }) {
  const c = { ok:[T.ok50,T.ok], warn:[T.warn50,T.warn], bad:[T.bad50,T.bad],
    brand:[T.brand50,T.brand], gold:[T.gold50,T.gold], muted:["#EEF1F0",T.muted] }[tone];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11.5, fontWeight:600,
      padding:"3px 9px", borderRadius:999, background:c[0], color:c[1] }}>
      {Icon && <Icon size={12} strokeWidth={2.4} />}{children}
    </span>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:16 }}>
      {label && <label style={{ fontSize:13, fontWeight:500, color:T.ink }}>
        {label}{required && <span style={{ color:T.bad, marginInlineStart:4 }}>*</span>}</label>}
      {children}
      {error ? <span style={{ fontSize:11.5, color:T.bad }}>{error}</span>
        : hint ? <span style={{ fontSize:11.5, color:T.muted }}>{hint}</span> : null}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, icon:Icon, dir="auto" }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
      {Icon && <span style={{ position:"absolute", insetInlineStart:12, color:T.muted, display:"flex" }}><Icon size={18}/></span>}
      <input dir={dir} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
        style={{ width:"100%", height:48, borderRadius:11, background:T.surface,
          border:`${foc?1.5:1}px solid ${foc?T.brand:T.line}`, paddingInline:Icon?"40px 14px":"14px",
          fontFamily:UI, fontSize:14.5, color:T.ink, outline:"none" }} />
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display:"inline-flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>onChange(!checked)}>
      <span style={{ width:21, height:21, borderRadius:6, display:"grid", placeItems:"center", flex:"none",
        border:`1.5px solid ${checked?T.ok:T.line}`, background:checked?T.ok:"#fff", transition:"all .12s" }}>
        {checked && <Check size={13} color="#fff" strokeWidth={3}/>}
      </span>
      {label && <span style={{ fontSize:14 }}>{label}</span>}
    </label>
  );
}

function Switch({ checked, onChange }) {
  return (
    <button onClick={()=>onChange(!checked)} role="switch" aria-checked={checked}
      style={{ width:46, height:28, borderRadius:999, border:"none", cursor:"pointer",
        background:checked?T.brand:T.line, padding:3, transition:"background .15s", display:"inline-flex" }}>
      <span style={{ width:22, height:22, borderRadius:"50%", background:"#fff",
        transform:`translateX(${checked?18:0}px)`, transition:"transform .15s", boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
    </button>
  );
}

function Segmented({ value, onChange, options }) {
  return (
    <div style={{ display:"inline-flex", background:T.surface, border:`1px solid ${T.line}`, borderRadius:11, overflow:"hidden" }}>
      {options.map(o=>(
        <button key={o.value} onClick={()=>onChange(o.value)}
          style={{ border:"none", padding:"8px 16px", fontFamily:UI, fontSize:13, fontWeight:600, cursor:"pointer",
            background:value===o.value?T.brand:"transparent", color:value===o.value?"#fff":T.muted }}>{o.label}</button>
      ))}
    </div>
  );
}

function SelectField({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const sel = options.find(o=>o.value===value);
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(o=>!o)}
        style={{ width:"100%", height:48, borderRadius:11, background:T.surface, border:`1px solid ${open?T.brand:T.line}`,
          paddingInline:14, display:"flex", alignItems:"center", justifyContent:"space-between",
          fontFamily:UI, fontSize:14.5, color:sel?T.ink:T.muted, cursor:"pointer" }}>
        <span>{sel?sel.label:placeholder}</span>
        <ChevronDown size={18} color={T.muted} style={{ transform:open?"rotate(180deg)":"none", transition:".15s" }}/>
      </button>
      {open && (
        <div style={{ position:"absolute", insetInlineStart:0, insetInlineEnd:0, top:54, background:"#fff",
          border:`1px solid ${T.line}`, borderRadius:12, boxShadow:"0 24px 48px -20px rgba(20,32,28,.28)", padding:6, zIndex:20 }}>
          {options.map(o=>(
            <button key={o.value} onClick={()=>{ onChange(o.value); setOpen(false); }}
              style={{ width:"100%", textAlign:"start", border:"none", background:value===o.value?T.brand50:"transparent",
                color:value===o.value?T.brand:T.ink, padding:"10px 12px", borderRadius:8, fontFamily:UI, fontSize:14, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              {o.label}{value===o.value && <Check size={15}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineAlert({ tone="warn", icon:Icon=TriangleAlert, children }) {
  const c = { warn:[T.warn50,T.warn], bad:[T.bad50,T.bad], ok:[T.ok50,T.ok], brand:[T.brand50,T.brand], muted:["#EEF1F0",T.muted] }[tone];
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", background:c[0], color:c[1],
      fontSize:12.5, fontWeight:600, padding:"10px 12px", borderRadius:11 }}>
      <Icon size={16} style={{ flex:"none" }}/>{children}
    </div>
  );
}

function Ring({ value=0, size=34, color=T.ok, track="#eef1f0", w=4 }) {
  const r=(size-w)/2, c=2*Math.PI*r, off=c*(1-value);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex:"none" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={w}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={w}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

function KPITile({ label, icon:Icon, value, unit, delta, deltaDir="up", tint=T.ok }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:14, padding:16, flex:1, minWidth:150 }}>
      <div style={{ fontSize:12.5, color:T.muted, fontWeight:500, display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ width:26, height:26, borderRadius:8, display:"grid", placeItems:"center",
          background:tint+"22", color:tint }}><Icon size={15}/></span>{label}
      </div>
      <div style={{ fontFamily:MONO, fontSize:29, fontWeight:600, letterSpacing:"-0.02em", margin:"10px 0 4px" }}>
        {value}{unit && <span style={{ fontSize:16, color:T.muted }}>{unit}</span>}
      </div>
      <div style={{ fontSize:11.5, fontWeight:600, color:deltaDir==="up"?T.ok:T.bad }}>{delta}</div>
    </div>
  );
}

function GeofenceRing({ inside=true, distance=18, dict }) {
  const col = inside?T.ok:T.bad;
  return (
    <div style={{ display:"grid", placeItems:"center" }}>
      <svg viewBox="0 0 236 236" width="200" height="200">
        <circle cx="118" cy="118" r="112" fill={col} fillOpacity="0.05"/>
        <circle cx="118" cy="118" r="112" fill="none" stroke={col} strokeOpacity="0.18"/>
        <circle cx="118" cy="118" r="78" fill={col} fillOpacity="0.07"/>
        <circle cx="118" cy="118" r="78" fill="none" stroke={col} strokeOpacity="0.28" strokeDasharray="3 5"/>
        <circle cx="118" cy="118" r="44" fill={col} fillOpacity="0.10"/>
        <rect x="109" y="109" width="18" height="18" rx="4" fill={T.brand}/>
        <g transform="translate(150 92)">
          <circle r="17" fill={col} fillOpacity="0.16"/>
          <path d="M0 -11 C6 -11 10 -7 10 -2 C10 4 0 12 0 12 C0 12 -10 4 -10 -2 C-10 -7 -6 -11 0 -11Z" fill={col}/>
          <circle cy="-2" r="3.4" fill="#fff"/>
        </g>
      </svg>
      <div style={{ textAlign:"center", marginTop:-6 }}>
        <div style={{ fontSize:14.5, fontWeight:700, color:col, display:"inline-flex", gap:6, alignItems:"center" }}>
          <Check size={16}/>{dict.inside}
        </div>
        <div style={{ fontFamily:MONO, fontSize:12.5, color:T.muted, marginTop:3 }} dir="ltr">{distance} m · {dict.from}</div>
      </div>
    </div>
  );
}

function ProofUploader({ dict }) {
  return (
    <div style={{ display:"flex", gap:10 }}>
      <div style={{ width:96, borderRadius:13, overflow:"hidden", border:`1px solid ${T.line}` }}>
        <div style={{ height:74, background:"linear-gradient(135deg,#c9d6d1,#eef2f0)", display:"grid", placeItems:"center", color:"#9fb0aa" }}><Camera size={24}/></div>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:9.5, fontWeight:700, color:T.gold, background:T.gold50, padding:"4px 6px" }}>
          <ShieldCheck size={11}/>{dict.verified} · GPS
        </div>
      </div>
      <button style={{ flex:1, border:`1.5px dashed ${T.line}`, borderRadius:13, background:T.brand50, color:T.brand,
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:7, cursor:"pointer", padding:16 }}>
        <Camera size={22}/>
        <span style={{ fontSize:12.5, fontWeight:600 }}>{dict.capture}</span>
        <span style={{ fontSize:10.5, color:T.muted }}>{dict.liveOnly}</span>
      </button>
    </div>
  );
}

function TaskCard({ title, priority, deadline, statusTone, statusLabel, ring, ringColor }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:16, padding:14, display:"flex", gap:12, alignItems:"flex-start", marginBottom:10 }}>
      <Ring value={ring} color={ringColor}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14.5, fontWeight:600, marginBottom:6 }}>{title}</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          {priority && <Pill tone="bad">{priority}</Pill>}
          {deadline && <span style={{ fontSize:12, color:T.muted, display:"flex", gap:4, alignItems:"center" }}><Clock size={13}/><span style={{ fontFamily:MONO }}>{deadline}</span></span>}
          <Pill tone={statusTone}>{statusLabel}</Pill>
        </div>
      </div>
    </div>
  );
}

function ApprovalCard({ initial, name, task, time, meta, dict }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:16, padding:14, marginBottom:12 }}>
      <div style={{ display:"flex", gap:11, alignItems:"center", marginBottom:12 }}>
        <span style={{ width:40, height:40, borderRadius:11, background:T.brand50, color:T.brand, display:"grid", placeItems:"center", fontWeight:700 }}>{initial}</span>
        <div><div style={{ fontSize:14.5, fontWeight:700 }}>{name}</div><div style={{ fontSize:12.5, color:T.muted }}>{task}</div></div>
        <span style={{ fontFamily:MONO, fontSize:11.5, color:T.muted, marginInlineStart:"auto" }}>{time}</span>
      </div>
      <div style={{ display:"flex", gap:11, alignItems:"center", padding:11, background:T.paper, borderRadius:12, marginBottom:12 }}>
        <div style={{ width:46, height:46, borderRadius:9, background:"linear-gradient(135deg,#c9d6d1,#eef2f0)", display:"grid", placeItems:"center", color:"#9fb0aa" }}><Camera size={20}/></div>
        <div><div style={{ fontSize:13.5, fontWeight:600 }}>{meta[0]}</div><div style={{ fontSize:11.5, color:T.muted, fontFamily:MONO }} dir="ltr">{meta[1]}</div></div>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <Btn variant="ok" sm full icon={Check}>{dict.approve}</Btn>
        <Btn variant="line" sm full icon={X}>{dict.reject}</Btn>
      </div>
    </div>
  );
}

function BottomNav({ items, active, onChange }) {
  return (
    <div style={{ display:"flex", background:T.surface, borderTop:`1px solid ${T.line}`, padding:"8px 8px 14px" }}>
      {items.map(it=>{
        const on = it.key===active;
        return (
          <button key={it.key} onClick={()=>onChange(it.key)}
            style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, border:"none",
              background:"none", color:on?T.brand:T.muted, fontFamily:UI, fontWeight:600, fontSize:11, cursor:"pointer" }}>
            <span style={{ padding:"5px 14px", borderRadius:10, background:on?T.brand50:"transparent" }}><it.icon size={22}/></span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- phone frame ---------- */
function Phone({ children, dark }) {
  return (
    <div style={{ background:"#0b1512", borderRadius:38, padding:10, boxShadow:"0 24px 48px -20px rgba(20,32,28,.4)", width:320 }}>
      <div style={{ background:T.paper, borderRadius:29, overflow:"hidden", height:640, display:"flex", flexDirection:"column" }}>
        <div style={{ height:34, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px",
          fontFamily:MONO, fontSize:12, fontWeight:600, color:dark?"#fff":T.ink, background:dark?T.brand:"transparent" }}>
          <span>9:41</span><span style={{ display:"flex", gap:4 }}><span style={{ width:16, height:9, border:`1.3px solid ${dark?"#fff":T.ink}`, borderRadius:2 }}/></span>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ============================================================ */
export default function App() {
  const [lang, setLang] = useState("ar");
  const [tab, setTab] = useState("components");
  const [cb, setCb] = useState(true);
  const [sw, setSw] = useState(true);
  const [seg, setSeg] = useState("today");
  const [sel, setSel] = useState("olaya");
  const [name, setName] = useState("");
  const [emp, setEmp] = useState("myday");
  const s = STR[lang];
  const dir = lang==="ar" ? "rtl" : "ltr";

  const branchOpts = lang==="ar"
    ? [{value:"olaya",label:"فرع العليا"},{value:"nakheel",label:"فرع النخيل"},{value:"malqa",label:"فرع الملقا"}]
    : [{value:"olaya",label:"Olaya branch"},{value:"nakheel",label:"Nakheel branch"},{value:"malqa",label:"Malqa branch"}];

  const empNav = [
    {key:"myday",icon:Home,label:s.myday},{key:"tasks",icon:ListChecks,label:s.tasks},
    {key:"att",icon:Clock,label:s.attendance},{key:"me",icon:User,label:s.account},
  ];

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontSize:11, fontFamily:MONO, fontWeight:600, color:T.muted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12 }}>{title}</div>
      <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:16, padding:20, display:"flex", flexWrap:"wrap", gap:18, alignItems:"flex-start" }}>{children}</div>
    </div>
  );

  return (
    <div dir={dir} style={{ fontFamily:UI, background:T.paper, color:T.ink, minHeight:"100vh", padding:"28px 24px 60px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`}</style>

      {/* header */}
      <div style={{ maxWidth:1120, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, marginBottom:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ width:38, height:38, borderRadius:11, background:T.brand, display:"grid", placeItems:"center" }}><ShieldCheck size={20} color="#fff"/></span>
            <div>
              <Wordmark size={20}/>
              <div style={{ fontSize:12.5, color:T.muted, marginTop:2 }}>{s.subtitle}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Segmented value={lang} onChange={setLang} options={[{value:"ar",label:"عربي · RTL"},{value:"en",label:"EN · LTR"}]}/>
            <Segmented value={tab} onChange={setTab} options={[{value:"components",label:s.components},{value:"screens",label:s.screens}]}/>
          </div>
        </div>

        <div style={{ height:1, background:T.line, margin:"20px 0 26px" }}/>

        {tab==="components" ? (
          <>
            <Section title={s.buttons}>
              <Btn variant="brand" icon={Check}>{s.checkin}</Btn>
              <Btn variant="ok" icon={Check}>{s.approve}</Btn>
              <Btn variant="danger" icon={X}>{s.reject}</Btn>
              <Btn variant="ghost" icon={Plus}>{s.save}</Btn>
              <Btn variant="line">{s.save}</Btn>
              <Btn variant="brand" disabled icon={Check}>{s.submit}</Btn>
            </Section>

            <Section title={s.status}>
              <Pill tone="ok" icon={Check}>{s.present}</Pill>
              <Pill tone="warn">{s.late}</Pill>
              <Pill tone="bad">{s.absent}</Pill>
              <Pill tone="brand" icon={MapPin}>{lang==="ar"?"داخل الفرع":"On-site"}</Pill>
              <Pill tone="gold" icon={ShieldCheck}>{s.verified}</Pill>
              <Pill tone="muted">{s.notstarted}</Pill>
            </Section>

            <Section title={s.forms}>
              <div style={{ width:260 }}>
                <Field label={s.name} required hint={lang==="ar"?"كما في الهوية":"As on ID"}>
                  <TextInput value={name} onChange={setName} placeholder={s.namePh} icon={User}/>
                </Field>
                <Field label={s.branch}>
                  <SelectField value={sel} onChange={setSel} options={branchOpts} placeholder={s.pickBranch}/>
                </Field>
              </div>
              <div style={{ width:230, display:"flex", flexDirection:"column", gap:18 }}>
                <Checkbox checked={cb} onChange={setCb} label={s.remember}/>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:14 }}>{s.notify}</span><Switch checked={sw} onChange={setSw}/>
                </div>
                <Segmented value={seg} onChange={setSeg} options={[
                  {value:"today",label:lang==="ar"?"اليوم":"Today"},
                  {value:"week",label:lang==="ar"?"الأسبوع":"Week"},
                  {value:"month",label:lang==="ar"?"الشهر":"Month"}]}/>
              </div>
            </Section>

            <Section title={s.feedback}>
              <div style={{ width:280, display:"flex", flexDirection:"column", gap:10 }}>
                <InlineAlert tone="warn">{s.lateNote}</InlineAlert>
                <InlineAlert tone="muted" icon={Info}>{s.offline}</InlineAlert>
                <InlineAlert tone="ok" icon={CheckCircle2}>{s.saved}</InlineAlert>
              </div>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <Ring value={0.72} size={54} color={T.warn} w={6}/>
                <Ring value={1} size={54} color={T.ok} w={6}/>
                <Ring value={0.35} size={54} color={T.brand} w={6}/>
              </div>
            </Section>

            <Section title={s.data}>
              <KPITile label={s.present_now} icon={Users} value="128" unit=" / 150" delta={lang==="ar"?"85% من المتوقع":"85% of expected"} tint={T.ok}/>
              <KPITile label={s.ontime} icon={Clock} value="91" unit="%" delta={lang==="ar"?"+4% عن أمس":"+4% vs yesterday"} tint={T.ok}/>
              <KPITile label={s.proofRate} icon={ShieldCheck} value="87" unit="%" delta="+2%" tint={T.gold}/>
              <KPITile label={s.overdue} icon={TriangleAlert} value="12" delta={lang==="ar"?"3 حرجة":"3 critical"} deltaDir="down" tint={T.bad}/>
            </Section>

            <Section title={s.domain}>
              <div style={{ width:230 }}><GeofenceRing inside distance={18} dict={s}/></div>
              <div style={{ width:230 }}><ProofUploader dict={s}/></div>
            </Section>
          </>
        ) : (
          /* ---------------- SCREENS ---------------- */
          <div style={{ display:"flex", gap:30, flexWrap:"wrap", justifyContent:"center" }}>

            {/* My Day */}
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>{s.myday} · Employee</div>
              <Phone dark>
                <div style={{ padding:"6px 18px 14px", background:T.brand, color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><div style={{ fontSize:12, opacity:.85 }}>{s.morning}</div><div style={{ fontSize:17, fontWeight:700 }}>{lang==="ar"?"محمد الشهري":"Mohammed"}</div></div>
                  <span style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.15)", display:"grid", placeItems:"center" }}><Bell size={18}/></span>
                </div>
                <div style={{ padding:16, overflow:"auto" }}>
                  <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:16, padding:16, marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                      <div><div style={{ fontWeight:700 }}>{s.shift}</div><div style={{ fontSize:12, color:T.muted }}>{branchOpts[0].label}</div></div>
                      <Pill tone="muted">{lang==="ar"?"لم تُسجّل بعد":"Not checked in"}</Pill>
                    </div>
                    <div style={{ fontFamily:MONO, fontSize:22, fontWeight:600, marginBottom:14 }} dir="ltr">08:00 <span style={{ color:T.muted }}>—</span> 17:00</div>
                    <div style={{ marginBottom:12 }}><InlineAlert tone="ok" icon={MapPin}>{s.inside} · {s.ready}</InlineAlert></div>
                    <Btn variant="brand" full icon={Check}>{s.checkin}</Btn>
                  </div>
                  <div style={{ fontSize:15, fontWeight:700, margin:"6px 2px 12px" }}>{s.tasksToday} · 3</div>
                  <TaskCard title={lang==="ar"?"فحص درجة حرارة الثلاجات":"Check fridge temperatures"} priority={s.high} deadline="10:00" statusTone="warn" statusLabel={s.inprog} ring={0.4} ringColor={T.warn}/>
                  <TaskCard title={lang==="ar"?"تجهيز الفرع للافتتاح":"Open-up checklist"} priority={null} deadline="09:30" statusTone="muted" statusLabel={s.notstarted} ring={0} ringColor={T.ok}/>
                </div>
                <div style={{ marginTop:"auto" }}><BottomNav items={empNav} active={emp} onChange={setEmp}/></div>
              </Phone>
            </div>

            {/* Check-in */}
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>{s.checkin} · Geofence</div>
              <Phone>
                <div style={{ padding:"8px 18px 10px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:17, fontWeight:700 }}>{s.checkin}</div>
                  <span style={{ width:36, height:36, borderRadius:10, border:`1px solid ${T.line}`, background:"#fff", display:"grid", placeItems:"center" }}><X size={18}/></span>
                </div>
                <div style={{ padding:16, overflow:"auto" }}>
                  <div style={{ textAlign:"center", fontSize:14, color:T.muted, marginBottom:8 }}>{branchOpts[0].label}</div>
                  <GeofenceRing inside distance={18} dict={s}/>
                  <div style={{ background:T.surface, border:`1px solid ${T.line}`, borderRadius:16, padding:"4px 16px", margin:"18px 0 14px" }}>
                    {[[Clock,lang==="ar"?"الوقت الآن":"Time now","08:03",T.ink],
                      [Calendar,lang==="ar"?"الوردية":"Shift","08:00 — 17:00",T.ink],
                      [Building2,lang==="ar"?"الجهاز":"Device",lang==="ar"?"مربوط":"Bound",T.ok],
                      [MapPin,lang==="ar"?"الموقع":"Location",lang==="ar"?"تم التحقق":"Verified",T.ok]].map((r,i)=>(
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderTop:i?`1px solid ${T.line}`:"none" }}>
                        <span style={{ fontSize:13.5, color:T.muted, display:"flex", gap:8, alignItems:"center" }}><r[0] size={16}/>{r[1]}</span>
                        <span style={{ fontSize:14, fontWeight:600, color:r[3], fontFamily:i<2?MONO:UI }} dir={i<2?"ltr":"auto"}>{r[2]}{i>=2 && <Check size={13} style={{ marginInlineStart:4 }}/>}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:14 }}><InlineAlert tone="warn">{s.lateNote}</InlineAlert></div>
                  <Btn variant="brand" full icon={Check}>{lang==="ar"?"تأكيد تسجيل الحضور":"Confirm check-in"}</Btn>
                </div>
              </Phone>
            </div>

            {/* Approvals */}
            <div>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>{s.approvals} · Manager</div>
              <Phone dark>
                <div style={{ padding:"6px 18px 14px", background:T.brand, color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:17, fontWeight:700 }}>{s.approvals}</div>
                  <span style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,.15)", display:"grid", placeItems:"center" }}><Bell size={18}/></span>
                </div>
                <div style={{ padding:16, overflow:"auto" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", marginBottom:14, background:T.brand, color:"#fff", borderRadius:13 }}>
                    <span style={{ fontFamily:MONO, fontSize:22, fontWeight:600 }}>7</span>
                    <span style={{ fontSize:13 }}>{s.pending}</span>
                  </div>
                  <ApprovalCard initial={lang==="ar"?"س":"S"} name={lang==="ar"?"سعود القحطاني":"Saud Alqahtani"} task={lang==="ar"?"تجهيز الفرع للافتتاح":"Open-up checklist"}
                    time={lang==="ar"?"قبل 6 د":"6m ago"} meta={[lang==="ar"?"3 صور إثبات مرفقة":"3 proof photos", "GPS · 07:58"]} dict={s}/>
                  <ApprovalCard initial={lang==="ar"?"ف":"F"} name={lang==="ar"?"فهد العتيبي":"Fahad Alotaibi"} task={lang==="ar"?"طلب تصحيح حضور":"Attendance correction"}
                    time={lang==="ar"?"قبل 22 د":"22m ago"} meta={[lang==="ar"?"تصحيح وقت الحضور":"Fix check-in time", "GPS · 08:00"]} dict={s}/>
                </div>
              </Phone>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
