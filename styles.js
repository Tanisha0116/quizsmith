/* =========================================================
   QUIZSMITH · STYLES (JSS)
   Concept: an optical answer sheet floating over a glowing 3D
   grid floor at night. Deep navy panels, electric-blue "form
   ink" for structure and pencil marks, timing marks down the
   sheet's edge. Dark everywhere, by design (no light theme).
   3D: an isometric tech stack, tilt-to-cursor tiles, pressable
   answer keys, swing-in questions, flip cards.
   ========================================================= */

const THEME = {
  '--paper': '#0A0E1A', '--sheet': '#121A2E', '--ink': '#E8ECF8', '--ink-2': '#9AA4C0', '--rule': '#263152',
  '--form': '#7C9CFF', '--form-edge': '#3D4FB8', '--form-soft': '#1B2550', '--on-form': '#0A0E1A',
  '--mark': '#7C9CFF', '--mark-ink': '#0A0E1A',
  '--ok': '#4ADE9A', '--ok-soft': '#10301F', '--part': '#F5C04A', '--part-soft': '#352A10',
  '--bad': '#FF7A70', '--bad-soft': '#3A1716',
  '--grid': 'rgba(124,156,255,.24)', '--glare': 'rgba(255,255,255,.14)', '--glow': 'rgba(124,156,255,.22)',
  '--shadow': 'inset 0 1px 0 rgba(255,255,255,.05), 0 24px 50px -20px rgba(0,0,0,.9)',
  colorScheme: 'dark'
};
const F_DISPLAY = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif';
const F_BODY = '"Atkinson Hyperlegible", system-ui, -apple-system, sans-serif';
const F_MONO = '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace';
const EASE = 'cubic-bezier(.2,.8,.2,1)';
const SPRING = 'cubic-bezier(.3,1.4,.5,1)';

const styles = {
  '@keyframes floor': { from: { backgroundPosition: '0 0' }, to: { backgroundPosition: '0 56px' } },
  '@global': {
    ':root': THEME,
    '*, *::before, *::after': { boxSizing: 'border-box' },
    body: {
      background: 'var(--paper)', color: 'var(--ink)', fontFamily: F_BODY, fontSize: '16px', lineHeight: '1.5',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -8%, var(--glow), transparent 70%), radial-gradient(var(--rule) 0.7px, transparent 0.7px)',
      backgroundSize: '100% 100%, 18px 18px', backgroundAttachment: 'fixed, scroll', overflowX: 'hidden'
    },
    /* 3D perspective grid floor behind everything */
    'body::after': {
      content: '""', position: 'fixed', left: '-50%', right: '-50%', bottom: 0, height: '55vh', zIndex: -1, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(var(--grid) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--grid) 1.5px, transparent 1.5px)',
      backgroundSize: '56px 56px', transform: 'perspective(420px) rotateX(64deg)', transformOrigin: 'bottom center',
      maskImage: 'linear-gradient(to top, #000 10%, transparent 85%)', WebkitMaskImage: 'linear-gradient(to top, #000 10%, transparent 85%)',
      animation: '$floor 6s linear infinite'
    },
    'button, input, textarea': { font: 'inherit', color: 'inherit' },
    /* app feel on phones: no grey tap flash, no double-tap zoom, no text selection on controls */
    'html, body': { WebkitTapHighlightColor: 'transparent', overscrollBehaviorY: 'contain' },
    button: { touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none' },
    '[hidden]': { display: 'none !important' },
    ':focus-visible': { outline: '2px solid var(--form)', outlineOffset: '3px', borderRadius: '6px' }
  },
  '@media (prefers-reduced-motion: reduce)': {
    '@global': { '*, *::before, *::after': { animationDuration: '1ms !important', animationDelay: '0ms !important', animationIterationCount: '1 !important', transitionDuration: '1ms !important' } }
  },

  '@keyframes rise': { from: { opacity: 0, transform: 'perspective(900px) translateY(24px) rotateX(-10deg)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes swing': { from: { opacity: 0, transform: 'perspective(900px) translateX(40px) rotateY(-32deg)' }, to: { opacity: 1, transform: 'none' } },
  '@keyframes deal': {
    '0%': { opacity: 0, transform: 'translateY(60px) translateZ(-160px) rotateX(-55deg)' },
    '65%': { opacity: 1, transform: 'translateY(-6px) rotateX(6deg)' },
    '100%': { opacity: 1, transform: 'none' }
  },
  '@keyframes coin': { from: { opacity: 0, transform: 'perspective(700px) rotateY(-540deg) scale(.5)' }, to: { opacity: 1, transform: 'perspective(700px) rotateY(0) scale(1)' } },
  '@keyframes stamp': {
    '0%': { opacity: 0, transform: 'scale(1.9) rotate(-14deg)' },
    '60%': { opacity: 1, transform: 'scale(.92) rotate(-6deg)' },
    '100%': { opacity: 1, transform: 'scale(1) rotate(-6deg)' }
  },
  '@keyframes fill': { from: { transform: 'scale(.2) rotate(-40deg)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
  '@keyframes dot': { from: { transform: 'scale(0) rotateY(180deg)' }, to: { transform: 'scale(1) rotateY(0)' } },
  '@keyframes hover3d': {
    '0%, 100%': { transform: 'translate(-18px, 0) rotateX(58deg) rotateZ(-42deg) translateZ(0)' },
    '50%': { transform: 'translate(-18px, 0) rotateX(56deg) rotateZ(-37deg) translateZ(12px)' }
  },
  '@keyframes toastIn': { from: { opacity: 0, transform: 'translate(-50%, 12px)' }, to: { opacity: 1, transform: 'translate(-50%, 0)' } },

  wrap: {
    maxWidth: '820px', margin: '0 auto',
    paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
    /* safe areas keep content clear of the iPhone notch / Android status bar when installed */
    paddingBlock: 'calc(28px + env(safe-area-inset-top, 0px)) calc(72px + env(safe-area-inset-bottom, 0px))',
    display: 'flex', flexDirection: 'column', gap: '20px'
  },
  headRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
  small: { padding: '8px 14px', fontSize: '13.5px', borderRadius: '10px' },

  /* install help sheet (iPhone, Mac Safari, Firefox) */
  '@keyframes sheetUp': { from: { transform: 'translateY(40px) rotateX(-12deg)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
  '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
  overlay: {
    position: 'fixed', inset: 0, zIndex: 30, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    background: 'rgba(5,8,16,.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))', paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', animation: '$fadeIn 200ms ease both',
    '@media (min-width: 640px)': { alignItems: 'center' }
  },
  sheetCard: {
    width: '100%', maxWidth: '460px', background: 'var(--sheet)', border: '1px solid var(--rule)', borderRadius: '18px',
    padding: '20px', boxShadow: '0 -10px 50px -10px rgba(124,156,255,.25), var(--shadow)', perspective: '800px',
    animation: `$sheetUp 360ms ${EASE} both`, display: 'flex', flexDirection: 'column', gap: '12px'
  },
  steps: {
    margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', counterReset: 'step',
    '& li': {
      display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', gap: '10px', alignItems: 'start', counterIncrement: 'step', fontSize: '15px',
      '&::before': {
        content: 'counter(step)', width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center',
        fontFamily: F_MONO, fontSize: '12.5px', fontWeight: 600, background: 'var(--form)', color: 'var(--on-form)', boxShadow: '0 3px 0 var(--form-edge)'
      }
    },
    '& kbd': { fontFamily: F_MONO, fontSize: '12.5px', padding: '1px 7px', borderRadius: '6px', border: '1px solid var(--rule)', background: 'var(--paper)', boxShadow: '0 2px 0 var(--rule)' }
  },
  masthead: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' },
  /* extruded 3D wordmark */
  brand: {
    fontFamily: F_DISPLAY, fontWeight: 800, fontSize: 'clamp(32px, 6.4vw, 48px)', letterSpacing: '-0.03em', lineHeight: '1', margin: 0,
    color: 'var(--ink)',
    textShadow: '1px 1px 0 var(--rule), 2px 2px 0 var(--rule), 3px 3px 0 var(--rule), 4px 4px 0 var(--rule), 6px 8px 14px rgba(0,0,0,.18)',
    '& span': { color: 'var(--form)', textShadow: '1px 1px 0 var(--form-edge), 2px 2px 0 var(--form-edge), 3px 3px 0 var(--form-edge), 4px 4px 0 var(--form-edge), 6px 8px 14px rgba(0,0,0,.18)' }
  },
  formNo: { fontFamily: F_MONO, fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--form)', textAlign: 'right' },

  sheet: {
    position: 'relative', background: 'var(--sheet)', border: '1px solid var(--rule)', borderRadius: '16px',
    boxShadow: 'var(--shadow)', padding: 'clamp(18px, 4vw, 32px)', paddingLeft: 'clamp(34px, 6vw, 52px)',
    animation: `$rise 560ms ${EASE} both`, transformOrigin: 'top center',
    '&::before': {
      content: '""', position: 'absolute', left: '12px', top: '22px', bottom: '22px', width: '9px',
      background: 'repeating-linear-gradient(to bottom, var(--mark) 0 6px, transparent 6px 22px)', opacity: 0.85, borderRadius: '1px'
    }
  },
  eyebrow: { fontFamily: F_MONO, fontSize: '11.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--form)', fontWeight: 600 },
  h1: { fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 'clamp(24px, 4.4vw, 34px)', letterSpacing: '-0.02em', lineHeight: '1.12', margin: '6px 0 0', textWrap: 'balance' },
  lede: { color: 'var(--ink-2)', margin: '10px 0 0', maxWidth: '60ch' },

  /* ---------- Setup hero: isometric 3D stack ---------- */
  hero: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px', gap: '16px', alignItems: 'center', '@media (max-width: 720px)': { gridTemplateColumns: 'minmax(0, 1fr)' } },
  scene: {
    position: 'relative', width: '290px', height: '310px', maxWidth: '100%', margin: '0 auto', perspective: '1200px'
  },
  stack: {
    position: 'absolute', left: '50%', top: '66%', width: '180px', height: '180px', marginLeft: '-90px', marginTop: '-90px',
    transformStyle: 'preserve-3d', transform: 'rotateX(58deg) rotateZ(-42deg)', animation: '$hover3d 7s ease-in-out infinite'
  },
  plate: {
    position: 'absolute', inset: 0, borderRadius: '18px', border: '1.5px solid var(--form)', background: 'var(--sheet)',
    transformStyle: 'preserve-3d', transform: 'translateZ(calc(var(--i) * 26px))', cursor: 'pointer', padding: '12px 14px',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '2px', textAlign: 'left',
    fontFamily: F_MONO, fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', letterSpacing: '0.04em',
    transition: `transform 560ms ${SPRING}, background 260ms, color 260ms, box-shadow 260ms`,
    boxShadow: 'inset 0 0 0 4px var(--sheet), inset 0 0 0 5px var(--rule)',
    '& b': { fontFamily: F_DISPLAY, fontSize: '15px', color: 'var(--ink)', letterSpacing: '-0.01em' },
    /* the plate's thickness: a darker slab just below it */
    '&::after': { content: '""', position: 'absolute', inset: '-1.5px', borderRadius: '18px', background: 'var(--form-edge)', transform: 'translateZ(-7px)', opacity: 0.55 },
    /* the stack opens a gap above the selected layer, which rises and glows */
    '&[aria-pressed="true"]': { transform: 'translateZ(calc(var(--i) * 26px + 16px)) translate(-10px, 10px)', background: 'var(--form)', color: 'var(--on-form)', boxShadow: '0 0 40px -6px var(--form)', '& b': { color: 'var(--on-form)' } },
    '&[aria-pressed="true"] ~ &': { transform: 'translateZ(calc(var(--i) * 26px + 36px))' },
    '$scene:hover &': { transform: 'translateZ(calc(var(--i) * 36px))' },
    '$scene:hover &[aria-pressed="true"]': { transform: 'translateZ(calc(var(--i) * 36px + 16px)) translate(-10px, 10px)' },
    '$scene:hover &[aria-pressed="true"] ~ &': { transform: 'translateZ(calc(var(--i) * 36px + 36px))' },
    '&:hover': { color: 'var(--form)' }
  },
  plateMix: { background: 'var(--form-soft)', '& b': { color: 'var(--form)' } },
  shadowDisc: { position: 'absolute', left: '50%', bottom: '8px', width: '210px', height: '46px', marginLeft: '-105px', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(0,0,0,.28), transparent)', filter: 'blur(4px)' },
  sceneHint: { position: 'absolute', left: 0, right: 0, bottom: '-4px', textAlign: 'center', fontFamily: F_MONO, fontSize: '11px', color: 'var(--ink-2)', letterSpacing: '0.06em' },

  form: { display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px', border: 0, padding: 0, margin: 0, minWidth: 0 },
  label: { fontFamily: F_MONO, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-2)', fontWeight: 600, padding: 0 },
  nameInput: {
    width: '100%', maxWidth: '420px', fontFamily: F_DISPLAY, fontSize: '22px', fontWeight: 500, padding: '6px 2px',
    background: 'transparent', border: 0, borderBottom: '2px solid var(--form)', borderRadius: 0,
    backgroundImage: 'repeating-linear-gradient(to right, var(--rule) 0 1px, transparent 1px 26px)', backgroundSize: '100% 8px', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom',
    '&::placeholder': { color: 'var(--ink-2)', opacity: 0.6 },
    '&:focus': { outline: 'none', borderBottomColor: 'var(--ink)' }
  },

  /* tilt-to-cursor topic tiles */
  /* 6 domains + a double-width Mix tile fill 4 columns (desktop) or 2 (phone) exactly */
  topicGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', '@media (max-width: 680px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
  topicWide: { gridColumn: 'span 2' },
  tilt: {
    transformStyle: 'preserve-3d', transition: 'transform 220ms ease-out, box-shadow 220ms', willChange: 'transform',
    '&::after': {
      content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: 0, transition: 'opacity 220ms',
      background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), var(--glare), transparent 55%)'
    },
    '&:hover::after': { opacity: 1 }
  },
  topic: {
    position: 'relative', textAlign: 'left', cursor: 'pointer', padding: '14px 14px 12px', borderRadius: '12px',
    border: '1.5px solid var(--rule)', background: 'var(--sheet)', display: 'flex', flexDirection: 'column', gap: '3px',
    boxShadow: '0 3px 0 var(--rule)',
    '&:hover': { borderColor: 'var(--form)', boxShadow: '0 3px 0 var(--form-edge), 0 18px 30px -18px var(--form)' },
    '&[aria-pressed="true"]': { borderColor: 'var(--form)', background: 'var(--form-soft)', boxShadow: '0 3px 0 var(--form-edge), 0 18px 30px -18px var(--form)' },
    '& b': { fontFamily: F_DISPLAY, fontWeight: 700, fontSize: '16px', transform: 'translateZ(24px)' },
    '& small': { fontFamily: F_MONO, fontSize: '11px', color: 'var(--ink-2)', letterSpacing: '0.04em', transform: 'translateZ(14px)' }
  },
  glyph: { fontFamily: F_MONO, fontWeight: 600, fontSize: '15px', color: 'var(--form)', lineHeight: '1.2', transform: 'translateZ(36px)' },
  best: { position: 'absolute', top: '10px', right: '10px', fontFamily: F_MONO, fontSize: '10.5px', padding: '1px 6px', borderRadius: '99px', background: 'var(--ok-soft)', color: 'var(--ok)', transform: 'translateZ(30px)' },

  segRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  seg: { display: 'inline-flex', border: '1.5px solid var(--rule)', borderRadius: '11px', padding: '3px', gap: '3px', background: 'var(--sheet)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,.08)' },
  segBtn: {
    border: 0, background: 'transparent', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
    transition: `transform 200ms ${SPRING}, background 160ms`,
    '&[aria-pressed="true"]': { background: 'var(--form)', color: 'var(--on-form)', boxShadow: '0 3px 0 var(--form-edge), 0 8px 18px -8px var(--form)', transform: 'translateY(-2px)' }
  },
  note: { fontSize: '13.5px', color: 'var(--ink-2)', margin: 0, maxWidth: '60ch' },

  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  /* 3D push buttons */
  btn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: '1.5px solid var(--form)',
    background: 'linear-gradient(to bottom, #9BB3FF, var(--form))', color: 'var(--on-form)', padding: '11px 20px', borderRadius: '11px', fontWeight: 700, fontSize: '15px',
    boxShadow: '0 4px 0 var(--form-edge)', transition: 'transform 110ms, box-shadow 110ms, opacity 140ms',
    '&:hover:not(:disabled)': { transform: 'translateY(-2px)', boxShadow: '0 6px 0 var(--form-edge), 0 14px 26px -10px var(--form)' },
    '&:active:not(:disabled)': { transform: 'translateY(3px)', boxShadow: '0 1px 0 var(--form-edge)' },
    '&:disabled': { opacity: 0.35, cursor: 'not-allowed' }
  },
  ghost: {
    background: 'var(--sheet)', color: 'var(--ink)', borderColor: 'var(--rule)', boxShadow: '0 4px 0 var(--rule)',
    '&:hover:not(:disabled)': { borderColor: 'var(--form)', boxShadow: '0 6px 0 var(--rule)' },
    '&:active:not(:disabled)': { boxShadow: '0 1px 0 var(--rule)' }
  },
  codeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' },
  codeInput: {
    fontFamily: F_MONO, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '9px 12px', width: '220px', maxWidth: '100%',
    border: '1.5px dashed var(--rule)', borderRadius: '9px', background: 'transparent',
    '&:focus': { outline: 'none', borderColor: 'var(--form)', borderStyle: 'solid' }
  },
  err: { color: 'var(--bad)', fontSize: '13.5px', margin: 0 },
  divider: { border: 0, borderTop: '1px dashed var(--rule)', margin: '4px 0' },

  /* ---------- Quiz ---------- */
  quizHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  track: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '14px' },
  trackDot: {
    width: '27px', height: '27px', borderRadius: '50%', border: '1.5px solid var(--form)', display: 'grid', placeItems: 'center',
    fontFamily: F_MONO, fontSize: '11px', color: 'var(--form)', background: 'var(--sheet)', cursor: 'pointer', padding: 0,
    boxShadow: '0 2px 0 var(--rule)', transition: `background 200ms, color 200ms, transform 300ms ${SPRING}`,
    '&[data-state="done"]': { background: 'var(--mark)', borderColor: 'var(--mark)', color: 'var(--mark-ink)' },
    '&[data-state="current"]': { boxShadow: '0 0 0 3px var(--form-soft), 0 4px 0 var(--form-edge)', borderWidth: '2px', fontWeight: 600, transform: 'translateY(-3px)' }
  },
  meta: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' },
  chip: { fontFamily: F_MONO, fontSize: '11.5px', padding: '3px 9px', borderRadius: '99px', border: '1px solid var(--rule)', color: 'var(--ink-2)', letterSpacing: '0.03em', background: 'var(--sheet)' },
  qText: { fontFamily: F_DISPLAY, fontWeight: 700, fontSize: 'clamp(21px, 3.6vw, 27px)', lineHeight: '1.22', letterSpacing: '-0.015em', margin: '12px 0 18px', textWrap: 'balance', overflowWrap: 'anywhere' },
  qAnim: { animation: `$swing 560ms ${EASE} both`, transformOrigin: 'left center' },
  opts: { display: 'flex', flexDirection: 'column', gap: '12px', margin: 0, padding: 0, listStyle: 'none' },
  /* answer options are 3D keys that press down when marked */
  opt: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left', cursor: 'pointer',
    padding: '12px 14px', borderRadius: '12px', border: '1.5px solid var(--rule)', background: 'var(--sheet)', fontSize: '16px',
    boxShadow: '0 5px 0 var(--rule)', transition: 'transform 120ms, box-shadow 120ms, border-color 150ms, background 150ms',
    '&:hover': { borderColor: 'var(--form)', transform: 'translateY(-2px)', boxShadow: '0 7px 0 var(--form-edge), 0 18px 24px -16px var(--form)' },
    '&:active': { transform: 'translateY(4px)', boxShadow: '0 1px 0 var(--form-edge)' },
    '&[aria-checked="true"]': { borderColor: 'var(--mark)', background: 'var(--form-soft)', transform: 'translateY(4px)', boxShadow: '0 1px 0 var(--mark), inset 0 2px 6px rgba(0,0,0,.12)' },
    '&[aria-checked="true"] $bubble::after': { content: '""', animation: `$fill 260ms ${SPRING} both` }
  },
  bubble: {
    position: 'relative', flex: '0 0 auto', width: '30px', height: '30px', borderRadius: '50%', border: '1.5px solid var(--form)',
    display: 'grid', placeItems: 'center', fontFamily: F_MONO, fontSize: '12.5px', fontWeight: 600, color: 'var(--form)',
    '&::after': {
      position: 'absolute', inset: '2px', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,.28), transparent 42%), var(--mark)'
    }
  },
  optText: { minWidth: 0, overflowWrap: 'anywhere' },

  /* ---------- Instant feedback after marking an answer ---------- */
  '@keyframes shake': {
    '0%, 100%': { transform: 'translateY(4px)' },
    '20%': { transform: 'translateY(4px) translateX(-8px) rotateY(-8deg)' },
    '40%': { transform: 'translateY(4px) translateX(7px) rotateY(6deg)' },
    '60%': { transform: 'translateY(4px) translateX(-5px)' },
    '80%': { transform: 'translateY(4px) translateX(3px)' }
  },
  '@keyframes popOk': { '0%': { transform: 'translateY(4px) scale(1)' }, '45%': { transform: 'translateY(0) scale(1.03)' }, '100%': { transform: 'translateY(4px) scale(1)' } },
  '@keyframes fbIn': { from: { opacity: 0, transform: 'perspective(800px) rotateX(-40deg) translateY(-12px)' }, to: { opacity: 1, transform: 'none' } },
  locked: { pointerEvents: 'none' },  /* once marked, the answer can't be changed */
  result: {
    '&::after': { marginLeft: 'auto', paddingLeft: '10px', fontFamily: F_MONO, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
    '& $bubble::after': { content: 'var(--icon)', display: 'grid', placeItems: 'center', background: 'var(--tone)', color: 'var(--on-form)', fontSize: '14px', fontWeight: 700, animation: `$fill 260ms ${SPRING} both` },
    '&[aria-checked="true"] $bubble::after': { content: 'var(--icon)' },
    '& $bubble': { borderColor: 'var(--tone)' }
  },
  rCorrect: { '--tone': 'var(--ok)', '--icon': '"✓"', borderColor: 'var(--ok) !important', background: 'var(--ok-soft) !important', boxShadow: '0 1px 0 var(--ok) !important', animation: '$popOk 440ms ease both', '&::after': { content: '"Correct"', color: 'var(--ok)' } },
  rPartial: { '--tone': 'var(--part)', '--icon': '"½"', borderColor: 'var(--part) !important', background: 'var(--part-soft) !important', boxShadow: '0 1px 0 var(--part) !important', animation: '$shake 480ms ease both', '&::after': { content: '"Your answer"', color: 'var(--part)' } },
  rWrong: { '--tone': 'var(--bad)', '--icon': '"✕"', borderColor: 'var(--bad) !important', background: 'var(--bad-soft) !important', boxShadow: '0 1px 0 var(--bad) !important', animation: '$shake 480ms ease both', '&::after': { content: '"Your answer"', color: 'var(--bad)' } },
  rKey: { '--tone': 'var(--ok)', '--icon': '"✓"', borderColor: 'var(--ok) !important', background: 'var(--ok-soft) !important', boxShadow: '0 5px 0 rgba(74,222,154,.35) !important', '&::after': { content: '"Correct answer"', color: 'var(--ok)' } },
  rDim: { opacity: 0.45 },
  feedback: {
    position: 'relative', marginTop: '16px', borderRadius: '12px', border: '1.5px solid var(--tone)', background: 'var(--tone-soft)',
    padding: '12px 14px 12px 19px', display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden',
    animation: `$fbIn 440ms ${EASE} both`, transformOrigin: 'top center',
    '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'var(--tone)' }
  },
  fbHead: { display: 'flex', alignItems: 'center', gap: '10px', '& b': { fontFamily: F_DISPLAY, fontSize: '19px', color: 'var(--tone)', letterSpacing: '-0.01em' } },
  fbIcon: { width: '28px', height: '28px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--tone)', color: 'var(--on-form)', fontWeight: 700, fontSize: '14px', boxShadow: '0 3px 0 rgba(0,0,0,.3)' },
  fbPts: { marginLeft: 'auto', fontFamily: F_MONO, fontSize: '13px', fontWeight: 600, color: 'var(--tone)', fontVariantNumeric: 'tabular-nums' },
  fbRow: {
    display: 'grid', gap: '2px', fontSize: '15px', padding: '8px 11px', borderRadius: '8px', background: 'rgba(0,0,0,.2)', overflowWrap: 'anywhere',
    '& span': { fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-2)' }
  },
  fbKey: { background: 'var(--ok-soft)', border: '1px solid var(--ok)', '& span': { color: 'var(--ok)' } },
  navRow: { display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '24px', alignItems: 'center' },
  kbd: { fontFamily: F_MONO, fontSize: '11.5px', color: 'var(--ink-2)' },
  kbdHint: { '@media (max-width: 600px)': { display: 'none' } },

  /* ---------- Results ---------- */
  resultHero: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: '26px', alignItems: 'center', '@media (max-width: 560px)': { gridTemplateColumns: 'minmax(0, 1fr)', justifyItems: 'start' } },
  coin: {
    position: 'relative', width: '156px', height: '156px', borderRadius: '50%', animation: `$coin 1300ms ${EASE} both`,
    background: 'radial-gradient(circle at 35% 30%, var(--sheet), var(--paper))',
    boxShadow: '0 6px 0 var(--rule), 0 24px 34px -18px rgba(0,0,0,.45), inset 0 0 0 1px var(--rule)'
  },
  ringNum: {
    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', fontFamily: F_DISPLAY, fontWeight: 800,
    fontSize: '42px', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
    '& small': { display: 'block', fontFamily: F_MONO, fontSize: '10.5px', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--ink-2)', marginTop: '-4px' }
  },
  ringArc: { transition: 'stroke-dashoffset 1500ms cubic-bezier(.2,.8,.2,1) 500ms' },
  tier: {
    fontFamily: F_DISPLAY, fontWeight: 800, fontSize: 'clamp(30px, 6vw, 44px)', letterSpacing: '-0.03em', lineHeight: '1.05', margin: '4px 0 8px', textWrap: 'balance',
    textShadow: '1px 1px 0 var(--rule), 2px 2px 0 var(--rule), 3px 3px 0 var(--rule)'
  },
  stampBox: { display: 'inline-block', marginTop: '12px', fontFamily: F_MONO, fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', border: '2px solid currentColor', borderRadius: '6px', animation: `$stamp 600ms 1300ms ${SPRING} both` },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px', marginTop: '24px', '@media (max-width: 560px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
  stat: { borderTop: '3px solid var(--rule)', paddingTop: '8px', '& b': { display: 'block', fontFamily: F_DISPLAY, fontSize: '26px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }, '& span': { fontFamily: F_MONO, fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)' } },
  statOk: { borderTopColor: 'var(--ok)', '& b': { color: 'var(--ok)' } },
  statPart: { borderTopColor: 'var(--part)', '& b': { color: 'var(--part)' } },
  statBad: { borderTopColor: 'var(--bad)', '& b': { color: 'var(--bad)' } },
  strip: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '18px', perspective: '400px' },
  stripDot: { width: '24px', height: '24px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 700, fontFamily: F_MONO, color: 'var(--sheet)', boxShadow: '0 2px 0 rgba(0,0,0,.25)', animation: `$dot 420ms ${SPRING} both` },
  breakdown: { marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' },
  barRow: { display: 'grid', gridTemplateColumns: '110px minmax(0, 1fr) 80px', gap: '10px', alignItems: 'center', fontSize: '13.5px', '& em': { fontStyle: 'normal', fontFamily: F_MONO, fontSize: '12px', color: 'var(--ink-2)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' } },
  bar: { height: '10px', borderRadius: '99px', background: 'var(--rule)', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.15)', '& i': { display: 'block', height: '100%', background: 'linear-gradient(to bottom, var(--form), var(--form-edge))', borderRadius: '99px', transformOrigin: 'left', transition: 'transform 1200ms cubic-bezier(.2,.8,.2,1) 600ms' } },
  advice: { marginTop: '16px', padding: '12px 14px', borderRadius: '10px', background: 'var(--form-soft)', fontSize: '15px' },

  cardsHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px' },
  secTitle: { fontFamily: F_DISPLAY, fontWeight: 700, fontSize: '22px', margin: 0, letterSpacing: '-0.01em' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '16px' },
  /* three layers: deal-in animation → cursor tilt → flip */
  cardWrap: { display: 'grid', perspective: '1100px', minWidth: 0, animation: `$deal 760ms ${EASE} both`, transformOrigin: 'top center' },
  cardTilt: { display: 'grid', position: 'relative', borderRadius: '14px', transformStyle: 'preserve-3d', transition: 'transform 240ms ease-out', '&:hover $face::after': { opacity: 1 } },
  flip: {
    display: 'grid', transformStyle: 'preserve-3d', transition: `transform 820ms ${SPRING}`,
    '&[data-flipped="true"]': { transform: 'rotateY(180deg)' }
  },
  face: {
    gridArea: '1 / 1', position: 'relative', background: 'var(--sheet)', border: '1px solid var(--rule)', borderRadius: '14px', padding: '16px 16px 14px 20px',
    boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, overflow: 'hidden',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: '5px', background: 'var(--tone)' },
    '&::after': { content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0, transition: 'opacity 240ms', background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), var(--glare), transparent 55%)' }
  },
  faceBack: { transform: 'rotateY(180deg)', background: 'linear-gradient(160deg, var(--sheet), var(--paper))' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' },
  cardNo: { fontFamily: F_MONO, fontSize: '11.5px', letterSpacing: '0.08em', color: 'var(--ink-2)', textTransform: 'uppercase' },
  stamp: { fontFamily: F_MONO, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '5px', border: '1.5px solid var(--tone)', color: 'var(--tone)', background: 'var(--tone-soft)', whiteSpace: 'nowrap', animation: `$stamp 520ms ${SPRING} both` },
  cardQ: { fontFamily: F_DISPLAY, fontWeight: 700, fontSize: '17px', lineHeight: '1.25', margin: 0, textWrap: 'balance', overflowWrap: 'anywhere' },
  ansList: { display: 'flex', flexDirection: 'column', gap: '6px', margin: 0, padding: 0, listStyle: 'none' },
  ans: { display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr) auto', gap: '8px', alignItems: 'start', fontSize: '14.5px', padding: '7px 9px', borderRadius: '8px', overflowWrap: 'anywhere', '& .k': { fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-2)', display: 'block' } },
  ansYou: { background: 'var(--tone-soft)' },
  ansKey: { background: 'var(--ok-soft)' },
  ansIcon: { width: '22px', height: '22px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 700, color: 'var(--sheet)' },
  pts: { fontFamily: F_MONO, fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', paddingTop: '2px' },
  flipBtn: {
    marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', border: 0, background: 'transparent', padding: '4px 0',
    fontFamily: F_MONO, fontSize: '12px', color: 'var(--form)', cursor: 'pointer', letterSpacing: '0.04em',
    '&:hover': { textDecoration: 'underline' }
  },
  expl: { fontSize: '13.5px', color: 'var(--ink-2)', margin: 0 },
  wTitle: { fontFamily: F_MONO, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-2)', margin: '4px 0 0' },
  weights: {
    listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px',
    '& li': { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 56px 36px', gap: '8px', alignItems: 'center', overflowWrap: 'anywhere' },
    '& li span:last-child': { fontFamily: F_MONO, fontSize: '11.5px', textAlign: 'right', color: 'var(--ink-2)' }
  },
  wbar: { height: '6px', borderRadius: '99px', background: 'var(--rule)', overflow: 'hidden', '& i': { display: 'block', height: '100%', background: 'var(--ok)' } },

  share: { display: 'flex', flexDirection: 'column', gap: '12px' },
  shareBox: {
    width: '100%', minHeight: '240px', resize: 'vertical', fontFamily: F_MONO, fontSize: '12.5px', lineHeight: '1.55', padding: '14px',
    borderRadius: '10px', border: '1.5px solid var(--rule)', background: 'var(--paper)', color: 'var(--ink)', whiteSpace: 'pre', overflowX: 'auto',
    boxShadow: 'inset 0 2px 6px rgba(0,0,0,.08)'
  },
  check: { display: 'inline-flex', gap: '8px', alignItems: 'center', fontSize: '14px', cursor: 'pointer', '& input': { width: '17px', height: '17px', accentColor: 'var(--form)' } },
  toast: {
    position: 'fixed', left: '50%', bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', transform: 'translateX(-50%)', maxWidth: 'calc(100vw - 32px)', textAlign: 'center',
    background: 'var(--form)', color: 'var(--on-form)', padding: '10px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '14px',
    animation: '$toastIn 220ms ease both', zIndex: 20, boxShadow: '0 4px 0 var(--form-edge), var(--shadow)'
  },
  footer: { fontFamily: F_MONO, fontSize: '11px', color: 'var(--ink-2)', textAlign: 'center', letterSpacing: '0.04em' },

  '@media (max-width: 480px)': {
    barRow: { gridTemplateColumns: '72px minmax(0, 1fr) 82px' },
    opt: { padding: '11px 12px', gap: '12px' }
  }
};
