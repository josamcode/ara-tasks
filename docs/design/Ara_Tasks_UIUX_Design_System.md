# ARA Tasks — UI/UX Design System

**Purpose:** The single source of truth for how ARA Tasks looks, behaves, and is built on screen. It defines the foundations (tokens), the bilingual/bidirectional system, every reusable component, the page catalog for all surfaces, and the interaction patterns. It builds on the visual direction already approved (deep-petrol palette, IBM Plex type, geofence + verified-seal signatures).

**Two hard rules that govern everything:**

1. **The product name is always written `ARA Tasks` in Latin** — never translated, never transliterated to Arabic, never lowercased in the wordmark. Even inside Arabic RTL text it stays LTR Latin (see §2.2).
2. **Nothing native. Every control is a custom, reusable component** — buttons, inputs, selects, checkboxes, radios, switches, date/time pickers, alerts, toasts, tooltips, tables, everything. No browser-default `<select>`, `<input type=date>`, `alert()`, or platform-styled checkbox ever ships. This guarantees identical behavior across AR/EN, RTL/LTR, iOS/Android/Web.

**Stack:** tokens are defined once and expressed for **Web (Next.js + React + TypeScript)** and **Mobile (Flutter/Dart)**. Every component below has a real implementation in both. A rendered, interactive React reference of the core library ships alongside this doc.

---
---

# 1. Foundations — Design Tokens

Tokens are the atomic values. **Components only ever consume tokens, never raw hex/px.** Defined once, mirrored across three targets.

## 1.1 Color

Semantic roles first (what components reference), raw scale second.

| Role | Token | Value | Use |
|---|---|---|---|
| Brand | `--brand` | `#0C5A54` | primary actions, headers, brand |
| Brand strong | `--brand-700` | `#083F3A` | pressed, dark surfaces, avatars |
| Brand tint | `--brand-50` | `#E4F0EE` | badges, active nav, subtle fills |
| Ink (text) | `--ink` | `#14201C` | primary text, headings |
| Muted | `--muted` | `#63726C` | secondary text, captions |
| Paper (canvas) | `--paper` | `#EAEEEC` | app background |
| Surface | `--surface` | `#FFFFFF` | cards, sheets, inputs |
| Line | `--line` | `#D8E0DD` | borders, dividers |
| Success / present | `--ok` / `--ok-50` | `#1E8E5A` / `#E4F3EB` | on-time, present, approved |
| Warning / late | `--warn` / `--warn-50` | `#C4841A` / `#F7EEDD` | late, pending, caution |
| Danger / absent | `--bad` / `--bad-50` | `#C0392B` / `#F8E7E4` | absent, overdue, reject, destructive |
| Verified (signature) | `--gold` / `--gold-50` | `#A9812F` / `#F4EEDF` | proof-verified seal only |
| Focus ring | `--focus` | `#0C5A54` @ 40% | keyboard focus outline |

**Rules:** status colors carry meaning — never use `--ok` for decoration. `--gold` is reserved for the verified-proof seal (the signature); using it elsewhere dilutes it. A **dark theme** is a later phase; tokens are structured so only values swap, not component code.

## 1.2 Typography

| Role | Family | Notes |
|---|---|---|
| UI (AR + Latin) | **IBM Plex Sans Arabic** | all interface text, both scripts |
| Data / numerals / time / code | **IBM Plex Mono** | KPIs, times (`08:03`), percentages, IDs, codes |
| Wordmark | IBM Plex Sans Arabic 700 | `ARA Tasks`, always LTR, `ARA` tracked +0.02em |

**Type scale** (rem @ 16px base):

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `display` | 30 / 36 | 600 | dashboard hero numbers |
| `h1` | 22 / 30 | 700 | screen titles |
| `h2` | 18 / 26 | 700 | section titles |
| `h3` | 16 / 24 | 600 | card titles |
| `body` | 14.5 / 22 | 400–500 | default text |
| `label` | 13 / 18 | 500 | form labels, list meta |
| `caption` | 11.5 / 16 | 500 | hints, timestamps |
| `mono-lg` | 24 / 28 | 600 | check-in clock |
| `mono` | 12.5 / 18 | 500 | inline data |

**Numerals:** Western digits (`0-9`) in mono for all data/times (precision feel), even in Arabic UI. Arabic-Indic digits are available as a per-tenant setting later. Numbers stay LTR inside RTL via bidi isolation (§2.4).

## 1.3 Spacing — 4px base scale

`space-0.5=2 · 1=4 · 1.5=6 · 2=8 · 3=12 · 4=16 · 5=20 · 6=24 · 8=32 · 10=40 · 12=48`. Components use these steps only; no arbitrary margins.

## 1.4 Radius · Elevation · Borders

| Token | Value |
|---|---|
| `radius-sm` | 8px (chips, small controls) |
| `radius-md` | 11px (buttons, inputs) |
| `radius-lg` | 16px (cards) |
| `radius-xl` | 22–30px (sheets, phone screen) |
| `radius-full` | 999px (pills, avatars) |
| `border` | 1px `--line`; inputs 1px, focus 1.5px `--brand` |
| `shadow-sm` | `0 1px 2px rgba(20,32,28,.05)` |
| `shadow-card` | `0 1px 2px rgba(20,32,28,.05), 0 8px 24px -12px rgba(20,32,28,.18)` |
| `shadow-pop` | `0 2px 4px rgba(20,32,28,.06), 0 24px 48px -20px rgba(20,32,28,.28)` |

## 1.5 Motion

| Token | Value | Use |
|---|---|---|
| `dur-fast` | 120ms | hover, press, toggles |
| `dur-base` | 200ms | sheets, dropdowns, toasts |
| `dur-slow` | 320ms | page/screen transitions |
| `ease-standard` | `cubic-bezier(.2,.8,.2,1)` | most |
| `ease-in` | `cubic-bezier(.4,0,1,1)` | exits |

Motion is functional (state changes, entrances), never ambient. **`prefers-reduced-motion` disables all non-essential transitions.**

## 1.6 Breakpoints & z-index

Breakpoints: `sm 480 · md 768 · lg 1024 · xl 1280`. Mobile app is fixed-fluid (single column); web dashboard is responsive from `md` up (sidebar collapses to a drawer below `lg`).
z-index: `base 0 · sticky 100 · dropdown 1000 · sheet/drawer 1100 · modal 1200 · toast 1300 · tooltip 1400`.

## 1.7 Iconography

A **custom 24×24 line-icon set** (2px stroke, round caps/joins) — no icon-font, no third-party pack shipped raw. Sizes: `14 · 16 · 18 · 22 · 24`. Icons inherit `currentColor`. Directional icons mirror in RTL (§2.3).

## 1.8 Token code (three targets)

**Web — CSS variables (source of truth):**
```css
:root{
  --brand:#0C5A54; --brand-700:#083F3A; --brand-50:#E4F0EE;
  --ink:#14201C; --muted:#63726C; --paper:#EAEEEC; --surface:#FFFFFF; --line:#D8E0DD;
  --ok:#1E8E5A; --ok-50:#E4F3EB; --warn:#C4841A; --warn-50:#F7EEDD;
  --bad:#C0392B; --bad-50:#F8E7E4; --gold:#A9812F; --gold-50:#F4EEDF;
  --r-sm:8px; --r-md:11px; --r-lg:16px; --r-xl:22px;
  --font-ui:'IBM Plex Sans Arabic',system-ui,'Segoe UI',Tahoma,sans-serif;
  --font-mono:'IBM Plex Mono',ui-monospace,Menlo,monospace;
  --shadow-card:0 1px 2px rgba(20,32,28,.05),0 8px 24px -12px rgba(20,32,28,.18);
  --dur-base:200ms; --ease:cubic-bezier(.2,.8,.2,1);
}
```

**Web — Tailwind theme (`tailwind.config.ts`):**
```ts
export default {
  theme:{ extend:{
    colors:{ brand:{DEFAULT:'#0C5A54',700:'#083F3A',50:'#E4F0EE'},
      ink:'#14201C', muted:'#63726C', paper:'#EAEEEC', surface:'#FFFFFF', line:'#D8E0DD',
      ok:{DEFAULT:'#1E8E5A',50:'#E4F3EB'}, warn:{DEFAULT:'#C4841A',50:'#F7EEDD'},
      bad:{DEFAULT:'#C0392B',50:'#F8E7E4'}, gold:{DEFAULT:'#A9812F',50:'#F4EEDF'} },
    borderRadius:{ sm:'8px', md:'11px', lg:'16px', xl:'22px' },
    fontFamily:{ ui:['IBM Plex Sans Arabic','system-ui','sans-serif'], mono:['IBM Plex Mono','monospace'] },
    boxShadow:{ card:'0 1px 2px rgba(20,32,28,.05),0 8px 24px -12px rgba(20,32,28,.18)' },
  }}
}
```

**Mobile — Flutter tokens (`app_tokens.dart`):**
```dart
class T {
  static const brand   = Color(0xFF0C5A54);
  static const brand700= Color(0xFF083F3A);
  static const brand50 = Color(0xFFE4F0EE);
  static const ink     = Color(0xFF14201C);
  static const muted   = Color(0xFF63726C);
  static const paper   = Color(0xFFEAEEEC);
  static const surface = Color(0xFFFFFFFF);
  static const line    = Color(0xFFD8E0DD);
  static const ok=Color(0xFF1E8E5A);   static const ok50=Color(0xFFE4F3EB);
  static const warn=Color(0xFFC4841A); static const warn50=Color(0xFFF7EEDD);
  static const bad=Color(0xFFC0392B);  static const bad50=Color(0xFFF8E7E4);
  static const gold=Color(0xFFA9812F); static const gold50=Color(0xFFF4EEDF);
  static const rSm=8.0, rMd=11.0, rLg=16.0, rXl=22.0;
  static const ui='IBMPlexSansArabic', mono='IBMPlexMono';
}
```

---
---

# 2. Bilingual & Bidirectional System

ARA Tasks is **Arabic-first with full English parity**, and every screen works in both **RTL and LTR**. This is a system, not a translation layer.

## 2.1 Language & direction model

- One `locale` per user (`ar` default, `en`). Locale → `dir` (`ar → rtl`, `en → ltr`).
- Direction is set once at the root (`<html dir>` on web, `Directionality` in Flutter) and **the entire layout mirrors automatically** because we use logical properties (§2.3) — no per-component `if(rtl)` branches.
- All copy lives in translation files (`ar.json` / `en.json`); no hardcoded strings in components.

## 2.2 The `ARA Tasks` wordmark rule

`ARA Tasks` is **always LTR Latin**, even mid-sentence in Arabic. Implement with bidi isolation so surrounding RTL text never reorders it.

```tsx
// Web — a dedicated, reusable component. Never type the name inline.
export const Wordmark = ({size='md'}:{size?:'sm'|'md'|'lg'}) => (
  <span dir="ltr" style={{unicodeBidi:'isolate', fontFamily:'var(--font-ui)', fontWeight:700,
        letterSpacing:'-0.01em', whiteSpace:'nowrap'}} className={`wm-${size}`}>
    <span style={{letterSpacing:'0.03em'}}>ARA</span>&nbsp;Tasks
  </span>
);
```
```dart
// Flutter
Text.rich(TextSpan(children:[
  TextSpan(text:'ARA ', style: TextStyle(letterSpacing:1)),
  TextSpan(text:'Tasks'),
]), textDirection: TextDirection.ltr, style: TextStyle(fontFamily:T.ui, fontWeight:FontWeight.w700));
```
Never write the name as a plain string in markup — always the `Wordmark` component, so the rule can never be broken by accident.

## 2.3 Logical properties & mirroring

**Never use `left`/`right`, `margin-left`, `text-align:left`.** Use logical equivalents so RTL/LTR mirror for free:

| Physical (banned) | Logical (use) |
|---|---|
| `margin-left/right` | `margin-inline-start/end` |
| `left / right` | `inset-inline-start/end` |
| `text-align:left` | `text-align:start` |
| `border-left` | `border-inline-start` |
| `padding-left` | `padding-inline-start` |

**Icon mirroring:** directional icons **flip** in RTL (back/forward chevrons, arrows, progress, list indents, "reply", pagination). Non-directional icons **do not flip** (clock, camera, pin, bell, user, checkmark, brand). Each icon declares `mirror: true|false`; the `<Icon>` component applies `scaleX(-1)` when `dir=rtl && mirror`.

## 2.4 Numerals, dates, times

- **Numbers/times stay LTR** inside RTL via `unicode-bidi:isolate` + `direction:ltr` on the mono span (so `08:03` and `+4%` never reorder).
- **Dates:** show **Hijri + Gregorian** together where dates matter (`17 يوليو · ٢٢ محرّم`). The DatePicker (§3) supports both calendars.
- **Formatting** via `Intl` (web) / `intl` (Flutter) keyed to locale; never hand-format.

## 2.5 Implementation notes

- **Web:** `next-intl` (or `i18next`) for strings; `<html lang dir>` from the locale; a `useDirection()` hook exposes `dir` to components that need mirroring; Tailwind logical utilities (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`).
- **Flutter:** `MaterialApp(locales:[ar,en], localizationsDelegates:...)`, wrap in `Directionality`; use `EdgeInsetsDirectional`, `AlignmentDirectional`, `PositionedDirectional` everywhere.
- **QA gate:** every screen is reviewed in **both** `ar-RTL` and `en-LTR` before merge. A screenshot pair is part of the PR.

---
---

# 3. Component Library

**Convention for every component:** *Anatomy → Variants → States → Props (API) → code.* All are custom and token-driven. Below: the full inventory with APIs, plus reference code for the highest-value ones (React primary; Flutter for mobile-critical). Components not fully coded here follow the identical patterns and ship in the shared package `@ara/ui` (web) and `ara_ui` (Flutter).

## 3.1 Primitives

### Button
- **Variants:** `brand` (primary), `ok`, `danger`, `ghost` (brand outline-tint), `line` (neutral outline), `subtle`.
- **Sizes:** `sm` (h36), `md` (h48), `lg` (h52).
- **States:** default, hover, pressed, focus-visible, loading (spinner + disabled), disabled, icon-only.
- **Props:** `variant, size, leadingIcon, trailingIcon, loading, disabled, fullWidth, onPress, children`.
```tsx
export function Button({variant='brand',size='md',leadingIcon:L,loading,disabled,fullWidth,children,...p}:BtnProps){
  const bg={brand:'var(--brand)',ok:'var(--ok)',danger:'var(--bad)'}[variant];
  const base:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,
    fontFamily:'var(--font-ui)',fontWeight:600,borderRadius:'var(--r-md)',cursor:disabled?'not-allowed':'pointer',
    width:fullWidth?'100%':undefined,opacity:disabled?.55:1,transition:'all var(--dur-base) var(--ease)',
    padding:size==='sm'?'8px 14px':'14px 16px', fontSize:size==='sm'?13.5:15.5, border:'none'};
  const skin = variant==='ghost'?{background:'#fff',color:'var(--brand)',border:'1.5px solid var(--brand-50)'}
    : variant==='line'?{background:'#fff',color:'var(--ink)',border:'1px solid var(--line)'}
    : {background:bg,color:'#fff'};
  return <button {...p} disabled={disabled||loading} style={{...base,...skin}}>
    {loading? <Spinner size={16}/> : L && <L size={18}/>}{children}
  </button>;
}
```
```dart
// Flutter — AppButton
class AppButton extends StatelessWidget {
  final String label; final VoidCallback? onPressed;
  final AppBtn variant; final IconData? icon; final bool loading, fullWidth;
  const AppButton(this.label,{this.onPressed,this.variant=AppBtn.brand,this.icon,this.loading=false,this.fullWidth=true,super.key});
  @override Widget build(BuildContext c){
    final bg={AppBtn.brand:T.brand,AppBtn.ok:T.ok,AppBtn.danger:T.bad}[variant];
    return SizedBox(width: fullWidth?double.infinity:null, child: FilledButton(
      onPressed: loading?null:onPressed,
      style: FilledButton.styleFrom(backgroundColor:bg,foregroundColor:Colors.white,
        padding: const EdgeInsets.symmetric(vertical:15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(T.rMd))),
      child: loading? const SizedBox(height:18,width:18,child:CircularProgressIndicator(strokeWidth:2,color:Colors.white))
        : Row(mainAxisAlignment:MainAxisAlignment.center, children:[
            if(icon!=null)...[Icon(icon,size:18), const SizedBox(width:8)],
            Text(label, style: const TextStyle(fontFamily:T.ui,fontWeight:FontWeight.w600,fontSize:15.5)),
          ])));
  }
}
```

### IconButton
Square, `sm/md`, variants `solid|ghost|onBrand`, optional badge dot. Props: `icon, variant, badge, aria-label (required), onPress`.

### Link
Inline text action, brand color, underline on hover, focus ring. Props: `href|onPress, external`.

## 3.2 Form controls — all custom

Every form control is wrapped by a shared **FormField** (label + required mark + hint + error + the control) so validation, spacing, and RTL are uniform.

### FormField (wrapper)
- **Anatomy:** label · optional required `*` · control slot · hint (muted) / error (danger) — one at a time.
- **Props:** `label, htmlFor, required, hint, error, children`.
```tsx
export function FormField({label,required,hint,error,children,htmlFor}:FieldProps){
  return <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
    {label && <label htmlFor={htmlFor} style={{fontSize:13,fontWeight:500,color:'var(--ink)'}}>
      {label}{required && <span style={{color:'var(--bad)',marginInlineStart:4}}>*</span>}</label>}
    {children}
    {error ? <span style={{fontSize:11.5,color:'var(--bad)'}}>{error}</span>
      : hint ? <span style={{fontSize:11.5,color:'var(--muted)'}}>{hint}</span> : null}
  </div>;
}
```

### TextField / Textarea
- **States:** default, focus (brand 1.5px ring), filled, error, disabled, with leading/trailing icon or unit, character count (textarea).
- **Props:** `value, onChange, placeholder, type, leadingIcon, trailingSlot, error, disabled, dir?('auto')`.
```tsx
export function TextField({error,leadingIcon:L,dir='auto',...p}:TFProps){
  return <div style={{position:'relative',display:'flex',alignItems:'center'}}>
    {L && <span style={{position:'absolute',insetInlineStart:12,color:'var(--muted)'}}><L size={18}/></span>}
    <input dir={dir} {...p} style={{width:'100%',height:48,borderRadius:'var(--r-md)',background:'var(--surface)',
      border:`1px solid ${error?'var(--bad)':'var(--line)'}`, paddingInline: L?'40px 14px':'14px',
      fontFamily:'var(--font-ui)',fontSize:14.5,color:'var(--ink)',outline:'none'}}
      onFocus={e=>e.target.style.borderColor='var(--brand)'} />
  </div>;
}
```
> `dir="auto"` lets a field hold Arabic or Latin/numeric input and align correctly (e.g. phone numbers stay LTR).

### Select (custom dropdown) — **replaces native `<select>`**
- **Anatomy:** trigger (value + chevron) · popover list · options (checkable, with optional icon) · search (if `searchable`) · empty state.
- **States:** closed, open, focus, selected, disabled option, loading options.
- **Behavior:** opens below/above with collision flip; keyboard (↑↓ Enter Esc); closes on outside click; RTL-aligned; chevron mirrors.
- **Props:** `value, onChange, options[{value,label,icon,disabled}], placeholder, searchable, multiple, error`.

### MultiSelect / Combobox
Same as Select with chips for selected values + inline search. Props add `max, createable`.

### Checkbox (custom) — **no native checkbox**
- **States:** unchecked, checked, indeterminate, focus, disabled, error.
- **Props:** `checked, indeterminate, onChange, label, disabled`.
```tsx
export function Checkbox({checked,indeterminate,onChange,label,disabled}:CbProps){
  return <label style={{display:'inline-flex',alignItems:'center',gap:10,cursor:disabled?'default':'pointer'}}>
    <span role="checkbox" aria-checked={indeterminate?'mixed':checked} tabIndex={0}
      onClick={()=>!disabled&&onChange(!checked)}
      onKeyDown={e=>{if(e.key===' '){e.preventDefault();!disabled&&onChange(!checked);}}}
      style={{width:21,height:21,borderRadius:6,display:'grid',placeItems:'center',flex:'none',
        border:`1.5px solid ${checked||indeterminate?'var(--ok)':'var(--line)'}`,
        background:checked||indeterminate?'var(--ok)':'#fff',transition:'all var(--dur-fast) var(--ease)'}}>
      {checked && <CheckIcon size={13} color="#fff"/>}
      {indeterminate && <span style={{width:11,height:2.5,background:'#fff',borderRadius:2}}/>}
    </span>
    {label && <span style={{fontSize:14}}>{label}</span>}
  </label>;
}
```

### Radio / RadioGroup
Custom dot, single-select group, keyboard arrow navigation. Props: `value, onChange, options, name`.

### Switch (custom toggle)
- **States:** off, on (brand track), focus, disabled, loading.
- **Props:** `checked, onChange, disabled, size`.
```tsx
export function Switch({checked,onChange,disabled}:SwProps){
  return <button role="switch" aria-checked={checked} disabled={disabled}
    onClick={()=>onChange(!checked)}
    style={{width:46,height:28,borderRadius:999,border:'none',cursor:disabled?'default':'pointer',
      background:checked?'var(--brand)':'var(--line)',padding:3,transition:'background var(--dur-fast)'}}>
    <span style={{display:'block',width:22,height:22,borderRadius:'50%',background:'#fff',
      transform:`translateX(${checked?'-18px':'0'})`, transition:'transform var(--dur-fast) var(--ease)',
      boxShadow:'0 1px 2px rgba(0,0,0,.2)'}}/>
  </button>;
}
```
> The knob translates toward `inline-start`; in RTL the direction flips automatically via a `dir`-aware sign.

### SegmentedControl
Pill group, single active (used for period `اليوم/الأسبوع/الشهر` and small filters). Props: `value, onChange, segments`.

### DatePicker (custom, Hijri + Gregorian) — **no native date input**
- **Anatomy:** trigger (formatted date, dual-calendar) · popover calendar with calendar-system toggle (هجري/ميلادي) · month/year nav (mirrored) · today · range mode.
- **Props:** `value, onChange, calendar('hijri'|'gregorian'|'both'), min, max, range`.
- **Behavior:** weekday header starts on the tenant's first weekday; Fri/Sat shaded as weekend; holidays dotted.

### TimePicker
Custom wheel/stepper (`08:03`), 24h, mono display. Props: `value, onChange, minuteStep`.

### QuantityStepper / OTPInput / PhotoInput
- **OTPInput:** 4–6 isolated boxes, auto-advance, paste-fill, LTR digits. Props: `length, value, onChange`.
- **PhotoInput → see ProofUploader (§3.7).**

## 3.3 Feedback — all custom (no `alert()`, no native tooltip)

### Toast
- **Variants:** `info, ok, warn, danger`. Auto-dismiss (default 4s) + manual close; stacks top-center (mobile) / top-`inline-end` (web); swipe/tap to dismiss; queue.
- **Props (imperative):** `toast.show({variant,title,message,action?,duration?})`.
- **Voice:** states what happened + next step, never apologizes vaguely.

### InlineAlert / Banner
Non-blocking, sits in-flow (e.g. the "سيُسجَّل متأخرًا 3 دقائق" note, offline banner). Variants + optional action. Props: `variant, title, message, action`.

### Tooltip
Custom popover on hover/focus/long-press, arrow, collision-aware, RTL-aligned. Props: `content, side`.

### ProgressRing / ProgressBar
Ring for task completion (the list rings) and KPIs; bar for branch-compare. Props: `value(0–1), size, color, track`.

### Skeleton / Spinner / EmptyState / ErrorState
- **Skeleton:** shimmer blocks matching the real layout (list rows, cards, table). Reduced-motion → static.
- **EmptyState:** icon + title + one-line direction + primary action ("لا مهام اليوم — أنشئ مهمة").
- **ErrorState:** what failed + how to retry, in the interface voice, with a Retry button.

### ConfirmDialog
Custom modal for destructive/irreversible actions (reject, cancel task, offboard). Props: `title, message, confirmLabel, tone('danger'), onConfirm`.

## 3.4 Containers & overlays

### Card
Surface + line + `shadow-card` + `radius-lg`. Slots: header, body, footer. Props: `padding, interactive`.

### Modal / Dialog (web) & BottomSheet (mobile)
Same component, responsive: centered modal ≥`md`, bottom sheet on mobile. Focus-trap, scrim, Esc/scrim close, drag-handle on sheet. Props: `open, onClose, title, size, children, footer`.
```dart
// Flutter — AraSheet (bottom sheet)
Future<T?> showAraSheet<T>(BuildContext c, {required Widget child, String? title}) =>
  showModalBottomSheet<T>(context:c, backgroundColor:T.surface, isScrollControlled:true,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(T.rXl))),
    builder:(_)=>Padding(padding: const EdgeInsets.fromLTRB(16,10,16,24), child: Column(mainAxisSize:MainAxisSize.min, children:[
      Container(width:40,height:4,decoration:BoxDecoration(color:T.line,borderRadius:BorderRadius.circular(2))),
      if(title!=null)Padding(padding: const EdgeInsetsDirectional.only(top:14,bottom:8),
        child: Text(title, style: const TextStyle(fontFamily:T.ui,fontWeight:FontWeight.w700,fontSize:18))),
      child,
    ])));
```

### Popover / Menu / ActionSheet
Anchored menu of actions (row overflow `⋯`, filters). Mobile → action sheet from bottom. Props: `items[{label,icon,tone,onSelect}]`.

### Tabs / Accordion / Drawer
Custom tabs (underline indicator that mirrors), accordion (chevron mirrors), web drawer for collapsed sidebar `< lg`.

## 3.5 Data display

### StatusPill / Badge / Chip
The status vocabulary made visual. Props: `tone(ok|warn|bad|brand|muted|gold), icon?, label`. **Maps 1:1 to Business-Logic states** (present/on-time→ok, late→warn, absent/overdue→bad).
```tsx
export const StatusPill=({tone='muted',icon:I,children}:PillProps)=>{
  const c={ok:['#E4F3EB','#1E8E5A'],warn:['#F7EEDD','#C4841A'],bad:['#F8E7E4','#C0392B'],
    brand:['#E4F0EE','#0C5A54'],gold:['#F4EEDF','#A9812F'],muted:['#EEF1F0','#63726C']}[tone];
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:11.5,fontWeight:600,
    padding:'3px 9px',borderRadius:999,background:c[0],color:c[1]}}>{I&&<I size={12}/>}{children}</span>;
};
```

### Avatar / AvatarGroup
Initials or photo, sizes, brand-tint bg. Props: `name, src, size`.

### DataTable
Custom table: sticky header, sortable columns, row hover, cell renderers (status pill, progress bar, mono numbers), zebra optional, pagination, empty/loading rows, horizontal scroll on mobile → card mode. Props: `columns[{key,header,align,render,sortable}], rows, onSort, page`.

### KPITile
Label + icon chip + big mono number (+unit) + delta (up/down colored) + optional sparkline. Props: `label, icon, value, unit, delta{dir,text}, tone`.

### ListRow / TaskCard / Timeline / Pagination
Reusable row with leading (ring/avatar), title, meta chips, trailing action. Timeline for attendance/audit history. Custom pager (mirrored arrows).

## 3.6 Navigation

### TopAppBar
Brand or title variant; leading (back/menu, mirrored) + title/greeting + trailing actions (bell with badge). Props: `variant, title, greeting, actions`.

### BottomNav (mobile)
4 items, active = brand pill behind icon + brand label; **role-aware** (employee vs manager sets show different items). Reads RTL right-to-left automatically. Props: `items[{icon,label,key}], active, onChange`.

### SidebarNav (web)
Vertical nav, brand `Wordmark` top, sections, active = brand-tint row, user footer. In RTL the sidebar sits on the **right** (inline-start), in LTR on the left — via grid order + logical borders. Props: `items, active, user`.

### Breadcrumb / SegmentedFilter
Breadcrumb (mirrored separators) for deep web pages; segmented filter for scoped views (branch/department).

## 3.7 Domain components (product-specific, reusable)

These encode ARA Tasks' identity and are used across screens.

### GeofenceRing (the signature)
Concentric SVG rings = branch zone; center marker = branch; pin = user; label shows in/out + distance. Colors by state (inside→ok, outside→bad). Props: `state('inside'|'outside'), distanceM, radiusM`.
```dart
// Flutter — GeofenceRing (CustomPainter core)
class GeofenceRing extends StatelessWidget {
  final bool inside; final int distanceM;
  const GeofenceRing({required this.inside, required this.distanceM, super.key});
  @override Widget build(BuildContext c)=> SizedBox(width:236,height:236,
    child: CustomPaint(painter: _RingPainter(inside), child: Center(child: Column(
      mainAxisSize: MainAxisSize.min, children:[
        Icon(inside?Icons.check_circle:Icons.error, color: inside?T.ok:T.bad, size:20),
      ]))));
}
```

### ProofThumb (with verified seal)
Media thumbnail + gold `موثّق · GPS + وقت` seal (the signature accent). Props: `src, verified, meta`.

### ProofUploader
Grid of ProofThumbs + an "add" tile that opens **live camera only** (gallery disabled), enforces required-proof count, shows upload progress, GPS/time auto-stamp. Props: `taskId, required{photo,note}, value, onChange`.

### TaskCard / ApprovalCard / ShiftCard / PresenceRow / CheckInPanel / ConsentGate
- **ApprovalCard:** avatar + name + task + submitted-time (mono) + proof preview + approve/reject actions; also renders correction requests. Props: `subject, onApprove, onReject`.
- **ConsentGate:** a blocking screen/step that must be satisfied (PDPL) before location capture; renders once, records consent. Props: `type, onGrant`.

---
---

# 4. Layout System

## 4.1 App shells

**Mobile app shell:** `StatusBar → TopAppBar → scrollable Body (paper) → BottomNav`. Sheets/dialogs overlay. Safe-area insets respected.

**Web dashboard shell (RTL/LTR aware):**
```
RTL:  [ main content ........................ ][ sidebar ]
LTR:  [ sidebar ][ main content ........................ ]
```
`SidebarNav` (fixed 236px) + `TopBar` (title, period, tools, user) + `Main` (content grid). Below `lg`, sidebar collapses into a `Drawer` toggled from the TopBar.

**Auth/onboarding shell:** centered single-column card on paper; brand `Wordmark`; minimal.

**Operator console shell:** same web shell, distinct top accent to signal "you are in the operator plane," separate nav set.

## 4.2 Grid & density

- Mobile: single column, 16px gutters, cards stack with 10–16px gaps.
- Web content: 12-col fluid; KPI row = 4 tiles ≥`lg`, 2 ≤`md`; main/side split `1fr 300px` ≥`lg`, stacked below.

---
---

# 5. Page / Screen Catalog

Each screen: **purpose · layout regions · key components · states · primary action.** States always cover *loading · empty · error · offline · no-permission* where relevant.

## 5.1 Employee (mobile)

| Screen | Purpose | Key components | Primary action |
|---|---|---|---|
| **Login** | Sign in | Wordmark, TextField, Button, Link | Sign in |
| **OTP verify** | Confirm phone | OTPInput, Button, countdown | Verify |
| **Consent gate** | PDPL location consent | ConsentGate, InlineAlert, Button | Grant consent |
| **Device binding** | Bind this device | InlineAlert, Button, StatusPill | Bind device |
| **My Day** | Today at a glance | ShiftCard, Button (check-in), TaskCard, BottomNav | Check in |
| **Check-in** | Presence-verified clock-in | GeofenceRing, KV rows, InlineAlert(late), Button | Confirm check-in |
| **Check-out** | End shift | KV rows, Button | Check out |
| **Tasks** | All my tasks | SegmentedFilter, TaskCard list, EmptyState | Open task |
| **Task detail** | Do + prove work | Checklist(Checkbox), ProofUploader, StatusPill, Button | Submit for review |
| **Attendance timeline** | My history | Timeline, StatusPill | — |
| **Correction request** | Fix a record | FormField, TextField, DatePicker/TimePicker, Button | Send request |
| **Notifications** | Alerts feed | ListRow, StatusPill, EmptyState | — |
| **Profile** | Self-service | Avatar, FormField, Switch(prefs), Button | Save changes |

**Check-in states:** inside-geofence (ok, enabled), outside (bad, blocked + reason), device-not-bound (blocked + rebind CTA), no-consent (routes to Consent gate), offline (captured-locally banner).

## 5.2 Manager (mobile)

| Screen | Purpose | Key components | Primary action |
|---|---|---|---|
| **Approvals inbox** | Clear pending decisions | Summary strip, ApprovalCard list, SegmentedFilter | Approve / Reject |
| **Approval detail** | Review one item | ProofThumb gallery, KV, ConfirmDialog(reject) | Approve / Reject + reason |
| **Live presence** | Who's in now | PresenceRow list, KPITile(present/expected/absent) | — |
| **Team** | My people | ListRow, StatusPill | Open member |
| **Reports (summary)** | Scoped KPIs | KPITile, ProgressBar | Open report |
| **Escalations** | What's overdue | ListRow(danger), Timeline | Act |

## 5.3 Web — Owner / Admin

| Screen | Purpose | Key components |
|---|---|---|
| **Login + 2FA** | Secure sign-in | Wordmark, TextField, OTPInput, Button |
| **Overview** | Company at a glance | KPITile ×4, DataTable(branch compare), Attention panel |
| **Branches** | Manage locations | DataTable, Button; **Branch detail** = map + **GeofenceEditor** (radius/polygon), working hours, TimePicker |
| **Departments / Teams** | Structure | DataTable, Modal(create), MultiSelect(branches) |
| **Employees** | Roster | DataTable(search, filters), Modal(invite: FormField+Select role+scope), employee detail |
| **Roles & Permissions** | Access control | **PermissionMatrix** (custom grid of Checkbox × scope), role editor, StatusPill |
| **Shifts** | Scheduling | Calendar/DataTable, shift editor (TimePicker, SegmentedControl pattern) |
| **Attendance** | Live + records | **Live board** (PresenceRow grid + KPITile), records DataTable, filters, export |
| **Tasks** | Assign & track | Board/List toggle, task editor Modal (FormField, Select, DatePicker, ProofUploader config, recurring rule), Checklist builder |
| **Reports** | Decide on data | KPITile, DataTable(branch compare), charts, **Export** (Modal → format Select) |
| **Billing** | Subscription | Plan cards, invoices DataTable, **Checkout** (MyFatoorah redirect), StatusPill(account state) |
| **Settings** | Configure | Tabbed sections, FormField, Switch (feature toggles: face/AI), DatePicker/retention, InlineAlert(PDPL) |
| **Audit log** | Accountability | DataTable(filter by actor/resource/date), Timeline |

## 5.4 Operator console (web, brief)

Login+2FA → **Tenant directory** (DataTable) → **Provision** (Modal, region Select) → **Tenant detail** (lifecycle Buttons, **Impersonate** → ConfirmDialog with reason + TTL + read-only Switch) → **Plans** / **Feature flags** (Switch grid) / **Platform billing** (DataTable) / **Staff & roles** / **Platform audit**. Distinct top accent marks the operator plane.

---
---

# 6. Interaction & UX Patterns

## 6.1 Navigation
- **Mobile:** BottomNav (role-aware) + push screens + sheets for focused tasks. Back is a mirrored chevron.
- **Web:** persistent SidebarNav + in-page tabs + modals for create/edit. Deep pages use Breadcrumb.

## 6.2 Forms & validation
- Every control wrapped in **FormField**; labels above, hint or error below (never both).
- **Validate on blur + on submit**, not on every keystroke. Errors are specific and actionable in the interface voice.
- Submit buttons show a loading state and disable while pending; the button label is the action ("Send request" → toast "Request sent").

## 6.3 Feedback: toast vs banner vs dialog
- **Toast** — transient result of an action ("Task approved").
- **InlineAlert/Banner** — persistent state in context (offline, late warning, PDPL notice).
- **ConfirmDialog** — before destructive/irreversible actions (reject, cancel, offboard).

## 6.4 Loading · empty · error · offline
- **Loading:** skeletons that match the real layout (not spinners on full pages).
- **Empty:** an invitation to act, with the primary action.
- **Error:** what failed + Retry, never a raw code.
- **Offline:** a persistent top **InlineAlert** ("غير متصل — سيُزامَن تلقائيًا"); captured actions show a "بانتظار المزامنة" pill; on reconnect a toast confirms sync, conflicts route to a review sheet.
- **Optimistic UI** for check-in/submit (instant state + queued), reconciled on sync.

## 6.5 Permission-driven UI
- Actions the user cannot perform are **hidden** (not shown-but-broken) when the whole feature is out of scope; **disabled with a tooltip** when contextually blocked (e.g. can't approve own submission). Server remains the real boundary.

---
---

# 7. Accessibility

- **Touch targets ≥ 44×44**; spacing prevents mis-taps on the frontline app.
- **Contrast:** text ≥ 4.5:1, large ≥ 3:1; status colors paired with icon/label (never color-only).
- **Focus:** every interactive element has a visible `--focus` ring; logical tab order; Esc closes overlays; focus-trap in modals/sheets.
- **Screen readers:** bilingual `aria-label`s from the same translation files; custom controls expose correct roles (`role="checkbox|switch|radio|dialog"`, `aria-checked`, `aria-expanded`).
- **Reduced motion:** honored globally.
- **RTL correctness:** every screen QA'd in both directions.

---
---

# 8. Content & Voice

- **Bilingual, parity-first:** every string exists in `ar` and `en`; no screen is Arabic-only or English-only.
- **`ARA Tasks`** — always the `Wordmark` component (Latin, LTR). Never a translated or inline string.
- **Active voice, action-consistent:** the button that says "تسجيل الحضور" produces a toast "تم تسجيل الحضور." "Approve" → "Approved."
- **Errors/empties give direction, not mood.** Name things by what the user controls ("الإشعارات", not "webhook config").
- **Numbers/times** in mono, Western digits, LTR-isolated.

---
---

# 9. Traceability

- **Components → screens:** the shared `@ara/ui` / `ara_ui` packages are the only source of controls; screens compose them, never re-style primitives.
- **Status components → Business Logic:** StatusPill tones map 1:1 to `task_state` / `attendance` flags / `account_status`.
- **Screens → Features & API:** each screen in §5 consumes the endpoints from the *API Contract* and enforces the scopes from *Roles & Permissions* (permission-driven UI, §6.5).

---

*A rendered, interactive React reference implementing this library (with a live AR-RTL ⇄ EN-LTR toggle) ships alongside this document as `ARA Tasks — Component Library`.*
