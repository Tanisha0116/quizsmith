/* =========================================================
   QUIZSMITH · APP
   Needs (loaded before this file): jss, jss-preset-default,
   questions.js (TOPICS, MIX, STACK_ORDER), styles.js (styles).
   ========================================================= */
(function () {
'use strict';

const app = document.getElementById('app');
if (!window.jss || !window.jssPresetDefault) {
  app.innerHTML = '<p style="padding:24px;max-width:60ch;margin:auto">The style library didn’t load, so Quizsmith can’t start. Check your connection and reload the page.</p>';
  return;
}
const J = window.jss.create(window.jssPresetDefault.default());
const c = J.createStyleSheet(styles).attach().classes;

const TOPIC_KEYS = Object.keys(TOPICS);
const DIFFS = { E: 'Easy', B: 'Balanced', H: 'Hard' };
const DIFF_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
const LETTERS = ['A', 'B', 'C', 'D'];

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const fmt = n => String(Math.round(n * 100) / 100);
function rng(seed) { let a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const store = {
  get(k, d) { try { const v = localStorage.getItem('quizsmith.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('quizsmith.' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
const topicOf = k => k === 'MIX' ? MIX : TOPICS[k];
const tone = s => s === 'correct' ? ['var(--ok)', 'var(--ok-soft)'] : s === 'partial' ? ['var(--part)', 'var(--part-soft)'] : ['var(--bad)', 'var(--bad-soft)'];
const ICON = { correct: '✓', partial: '½', wrong: '✕' };
const EMOJI = { correct: '✅', partial: '🟡', wrong: '❌' };
const STATUS_LABEL = { correct: 'Correct', partial: 'Partial credit', wrong: 'Incorrect' };

/* 3D tilt toward the pointer (mouse/trackpad only; off for reduced motion) */
const mq = q => window.matchMedia ? window.matchMedia(q).matches : false;
const REDUCE = mq('(prefers-reduced-motion: reduce)');
const CAN_TILT = mq('(hover: hover) and (pointer: fine)') && !REDUCE;
function tilt(el, max, lift) {
  if (!CAN_TILT || !el) return;
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateZ(${lift || 0}px)`;
    el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
    el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
}

/* ---------------- quiz codes + generator ---------------- */
function makeCode(topic, diff, count, seed) { return topic + '-' + diff + '-' + count + '-' + seed.toString(36).toUpperCase().padStart(4, '0'); }
function parseCode(str) {
  const m = String(str).trim().toUpperCase().match(/^([A-Z]+)-([EBH])-(\d{1,2})-([0-9A-Z]{1,5})$/);
  if (!m) return null;
  const topic = m[1], count = +m[3];
  if (!(topic === 'MIX' || TOPICS[topic]) || ![5, 8, 10].includes(count)) return null;
  return { topic, diff: m[2], count, seed: parseInt(m[4], 36) };
}
/* Deterministic from (topic, difficulty, count, seed), so a code replays the exact same quiz. */
function buildQuiz(topic, diff, count, seed) {
  const r = rng(seed * 7919 + 17);
  let pool = topic === 'MIX'
    ? TOPIC_KEYS.flatMap(k => TOPICS[k].qs.map(q => Object.assign({ topic: k }, q)))
    : TOPICS[topic].qs.map(q => Object.assign({ topic }, q));
  const rank = { E: { 1: 0, 2: 1, 3: 2 }, B: { 1: 0, 2: 0, 3: 0 }, H: { 3: 0, 2: 0, 1: 1 } }[diff];
  pool = shuffle(pool, r).map((q, i) => ({ q, i })).sort((a, b) => (rank[a.q.d] - rank[b.q.d]) || (a.i - b.i)).map(x => x.q);
  let picked = pool.slice(0, count);
  if (diff === 'B') { // make sure every difficulty appears at least once
    [1, 2, 3].forEach(d => {
      if (picked.some(q => q.d === d)) return;
      const cand = pool.find(q => q.d === d && !picked.includes(q));
      const idx = picked.findIndex(q => picked.filter(p => p.d === q.d).length > 1);
      if (cand && idx > -1) picked[idx] = cand;
    });
  }
  picked = shuffle(picked, r);
  return picked.map(q => ({ topic: q.topic, q: q.q, d: q.d, x: q.x, opts: shuffle(q.o.map(([t, w]) => ({ t, w })), r) }));
}

/* ---------------- state ---------------- */
const S = {
  screen: 'setup',
  name: store.get('name', ''),
  topic: (k => (TOPICS[k] || k === 'MIX') ? k : 'WEB')(store.get('topic', 'WEB')),
  diff: store.get('diff', 'B'),
  count: store.get('count', 8),
  codeErr: '',
  quiz: [], answers: [], i: 0, code: '', startedAt: 0, endedAt: 0,
  includeAnswers: true, prevBest: null, flipped: {}
};

function startQuiz(topic, diff, count, seed) {
  S.topic = topic; S.diff = diff; S.count = count;
  S.code = makeCode(topic, diff, count, seed);
  S.quiz = buildQuiz(topic, diff, count, seed);
  S.answers = new Array(S.quiz.length).fill(null);
  S.i = 0; S.startedAt = Date.now(); S.screen = 'quiz'; S.flipped = {};
  store.set('name', S.name); store.set('topic', topic); store.set('diff', diff); store.set('count', count);
  render();
  window.scrollTo(0, 0);
}
const newSeed = () => Math.floor(Math.random() * Math.pow(36, 4));

function score() {
  const rows = S.quiz.map((q, i) => {
    const chosen = q.opts[S.answers[i]];
    const w = chosen ? chosen.w : 0;
    return { q, chosen, best: q.opts.find(o => o.w === 1), w, pts: q.d, earned: w * q.d, status: w === 1 ? 'correct' : w > 0 ? 'partial' : 'wrong' };
  });
  const total = rows.reduce((s, r) => s + r.pts, 0);
  const earned = rows.reduce((s, r) => s + r.earned, 0);
  const pct = total ? Math.round(earned / total * 100) : 0;
  const tierIdx = pct >= 90 ? 3 : pct >= 70 ? 2 : pct >= 40 ? 1 : 0;
  const n = st => rows.filter(r => r.status === st).length;
  return { rows, total, earned, pct, tier: topicOf(S.topic).tiers[tierIdx], ok: n('correct'), part: n('partial'), bad: n('wrong') };
}

/* ---------------- render ---------------- */
function render() {
  if (S.screen === 'setup') renderSetup();
  else if (S.screen === 'quiz') renderQuiz();
  else renderResult();
  App.afterRender();
}
const masthead = right => `<header class="${c.masthead}"><h1 class="${c.brand}">Quiz<span>smith</span></h1>
  <div class="${c.headRight}"><div class="${c.formNo}">${right}</div>
  <button type="button" class="${c.btn} ${c.ghost} ${c.small}" data-install hidden>⤓ Install app</button></div></header>`;

function renderSetup() {
  const bests = store.get('best', {});
  const totalQs = TOPIC_KEYS.reduce((s, k) => s + TOPICS[k].qs.length, 0);
  const tile = (k, t, n) => `<button type="button" class="${c.topic} ${c.tilt}${k === 'MIX' ? ' ' + c.topicWide : ''}" data-topic="${k}" aria-pressed="${S.topic === k}">
      ${bests[k] != null ? `<span class="${c.best}">best ${bests[k]}%</span>` : ''}
      <span class="${c.glyph}" aria-hidden="true">${esc(t.glyph)}</span><b>${esc(t.name)}</b><small>${n} questions in bank</small></button>`;
  const plates = STACK_ORDER.map((k, i) => `<button type="button" tabindex="-1" aria-hidden="true" class="${c.plate}" data-plate="${k}" style="--i:${i}"
      aria-pressed="${S.topic === k}"><span>${esc(TOPICS[k].glyph)}</span><b>${esc(TOPICS[k].short)}</b></button>`).join('');

  app.innerHTML = `<main class="${c.wrap}">
    ${masthead('Form QZ-26 &middot; Weighted answer sheet')}
    <section class="${c.sheet}">
      <div class="${c.hero}">
        <div>
          <div class="${c.eyebrow}">Section 1 &middot; Candidate details</div>
          <h2 class="${c.h1}">Build a tech quiz around you</h2>
          <p class="${c.lede}">Pick a layer of the stack. Questions are worth 1–3 points by difficulty, and near-miss answers earn partial credit, so your score shows how close you were.</p>
        </div>
        <div class="${c.scene}" id="scene">
          <div class="${c.shadowDisc}" aria-hidden="true"></div>
          <div class="${c.stack}" id="stack">${plates}</div>
          <div class="${c.sceneHint}" aria-hidden="true">tap a layer</div>
        </div>
      </div>
      <form class="${c.form}" id="setup" novalidate>
        <div class="${c.field}">
          <label class="${c.label}" for="name">Your name</label>
          <input class="${c.nameInput}" id="name" autocomplete="given-name" maxlength="28" placeholder="e.g. Priya" value="${esc(S.name)}">
        </div>
        <fieldset class="${c.field}">
          <legend class="${c.label}">Domain</legend>
          <div class="${c.topicGrid}">
            ${TOPIC_KEYS.map(k => tile(k, TOPICS[k], TOPICS[k].qs.length)).join('')}
            ${tile('MIX', MIX, totalQs)}
          </div>
        </fieldset>
        <div class="${c.segRow}">
          <fieldset class="${c.field}">
            <legend class="${c.label}">Difficulty</legend>
            <div class="${c.seg}" role="group">${Object.entries(DIFFS).map(([k, v]) => `<button type="button" class="${c.segBtn}" data-diff="${k}" aria-pressed="${S.diff === k}">${v}</button>`).join('')}</div>
          </fieldset>
          <fieldset class="${c.field}">
            <legend class="${c.label}">Questions</legend>
            <div class="${c.seg}" role="group">${[5, 8, 10].map(n => `<button type="button" class="${c.segBtn}" data-count="${n}" aria-pressed="${S.count === n}">${n}</button>`).join('')}</div>
          </fieldset>
        </div>
        <p class="${c.note}" id="summary"></p>
        <div class="${c.actions}">
          <button class="${c.btn}" type="submit" id="go">Generate my quiz <span aria-hidden="true">→</span></button>
        </div>
        <hr class="${c.divider}">
        <div class="${c.field}">
          <label class="${c.label}" for="code">Got a challenge code from a friend?</label>
          <div class="${c.codeRow}">
            <input class="${c.codeInput}" id="code" placeholder="NET-B-8-K3QZ" spellcheck="false" autocomplete="off">
            <button type="button" class="${c.btn} ${c.ghost}" id="replay">Load that quiz</button>
          </div>
          ${S.codeErr ? `<p class="${c.err}" role="alert">${esc(S.codeErr)}</p>` : ''}
        </div>
      </form>
    </section>
    <p class="${c.footer}">${TOPIC_KEYS.length} domains &middot; ${totalQs} questions &middot; partial credit on near-misses${window.QUIZSMITH_APP ? ` &middot; app v${esc(window.QUIZSMITH_APP.version)} &middot; works offline` : ''}</p>
  </main>`;

  const sum = app.querySelector('#summary');
  const updateSummary = () => {
    const t = topicOf(S.topic), nm = S.name.trim();
    sum.textContent = `${nm ? nm + ', you' : 'You'}’ll get ${S.count} ${DIFFS[S.diff].toLowerCase()} ${S.topic === 'MIX' ? 'questions from every domain' : t.name + ' questions'}, drawn in a fresh random order. Top rank: “${t.tiers[3]}”.`;
  };
  const selectTopic = k => {
    S.topic = k;
    app.querySelectorAll('[data-topic]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.topic === k)));
    app.querySelectorAll('[data-plate]').forEach(x => { x.setAttribute('aria-pressed', String(x.dataset.plate === k)); x.classList.toggle(c.plateMix, k === 'MIX'); });
    updateSummary();
  };
  selectTopic(S.topic);
  app.querySelector('#name').addEventListener('input', e => { S.name = e.target.value; updateSummary(); });
  app.querySelectorAll('[data-topic]').forEach(b => { b.addEventListener('click', () => selectTopic(b.dataset.topic)); tilt(b, 16, 0); });
  app.querySelectorAll('[data-plate]').forEach(b => b.addEventListener('click', () => selectTopic(b.dataset.plate)));
  app.querySelectorAll('[data-diff]').forEach(b => b.addEventListener('click', () => { S.diff = b.dataset.diff; app.querySelectorAll('[data-diff]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); updateSummary(); }));
  app.querySelectorAll('[data-count]').forEach(b => b.addEventListener('click', () => { S.count = +b.dataset.count; app.querySelectorAll('[data-count]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); updateSummary(); }));
  app.querySelector('#setup').addEventListener('submit', e => { e.preventDefault(); S.codeErr = ''; startQuiz(S.topic, S.diff, S.count, newSeed()); });
  const replay = () => {
    const p = parseCode(app.querySelector('#code').value);
    if (!p) {
      S.codeErr = 'That code doesn’t look right. Codes look like NET-B-8-K3QZ: domain, difficulty (E, B or H), 5/8/10 questions, then four characters.';
      renderSetup(); app.querySelector('#code').focus(); return;
    }
    S.codeErr = ''; S.name = app.querySelector('#name').value; startQuiz(p.topic, p.diff, p.count, p.seed);
  };
  app.querySelector('#replay').addEventListener('click', replay);
  app.querySelector('#code').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); replay(); } });
}

function renderQuiz() {
  const q = S.quiz[S.i];
  const t = topicOf(S.topic);
  const last = S.i === S.quiz.length - 1;
  const answered = S.answers.filter(a => a != null).length;
  app.innerHTML = `<main class="${c.wrap}">
    ${masthead(`${esc(t.name)} &middot; ${DIFFS[S.diff]}<br>Code ${S.code}`)}
    <section class="${c.sheet}" style="animation:none">
      <div class="${c.quizHead}">
        <div class="${c.eyebrow}">Question ${S.i + 1} of ${S.quiz.length}${S.name.trim() ? ' &middot; ' + esc(S.name.trim()) : ''}</div>
        <div class="${c.kbd}" id="marked">${answered}/${S.quiz.length} marked</div>
      </div>
      <nav class="${c.track}" aria-label="Questions">
        ${S.quiz.map((_, i) => `<button type="button" class="${c.trackDot}" data-jump="${i}" data-state="${i === S.i ? 'current' : S.answers[i] != null ? 'done' : ''}" aria-label="Question ${i + 1}${S.answers[i] != null ? ', answered' : ''}">${i + 1}</button>`).join('')}
      </nav>
      <div class="${c.qAnim}">
        <div class="${c.meta}">
          <span class="${c.chip}">${DIFF_LABEL[q.d]} &middot; worth ${q.d} pt${q.d > 1 ? 's' : ''}</span>
          ${S.topic === 'MIX' ? `<span class="${c.chip}">${esc(TOPICS[q.topic].short)}</span>` : ''}
          <span class="${c.chip}">Partial credit possible</span>
        </div>
        <h2 class="${c.qText}" id="qtext">${esc(q.q)}</h2>
        <ul class="${c.opts}${S.answers[S.i] != null ? ' ' + c.locked : ''}" role="radiogroup" aria-labelledby="qtext">
          ${q.opts.map((o, j) => `<li><button type="button" class="${c.opt} ${resultClass(q, j, S.answers[S.i])}" role="radio" data-opt="${j}" aria-checked="${S.answers[S.i] === j}"><span class="${c.bubble}" aria-hidden="true">${LETTERS[j]}</span><span class="${c.optText}">${esc(o.t)}</span></button></li>`).join('')}
        </ul>
        <div id="feedback" aria-live="polite">${S.answers[S.i] != null ? feedbackHTML(q, S.answers[S.i]) : ''}</div>
      </div>
      <div class="${c.navRow}">
        <button type="button" class="${c.btn} ${c.ghost}" id="back" ${S.i === 0 ? 'disabled' : ''}>← Back</button>
        <span class="${c.kbd} ${c.kbdHint}">Keys: A–D to mark, Enter to continue</span>
        <button type="button" class="${c.btn}" id="next" ${S.answers[S.i] == null ? 'disabled' : ''}>${nextLabel()}</button>
      </div>
    </section>
    <div class="${c.actions}" style="justify-content:center"><button type="button" class="${c.btn} ${c.ghost}" id="quit">Quit to setup</button></div>
  </main>`;
  app.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => choose(+b.dataset.opt)));
  app.querySelectorAll('[data-jump]').forEach(b => b.addEventListener('click', () => { S.i = +b.dataset.jump; renderQuiz(); }));
  app.querySelector('#back').addEventListener('click', () => { if (S.i > 0) { S.i--; renderQuiz(); } });
  app.querySelector('#next').addEventListener('click', next);
  app.querySelector('#quit').addEventListener('click', () => { S.screen = 'setup'; render(); });
}
function nextLabel() {
  if (S.i < S.quiz.length - 1) return 'Next →';
  return S.answers.every(a => a != null) ? 'Grade my sheet' : 'Finish (blanks score 0)';
}
/* ---------- instant feedback: shown the moment an answer is marked ---------- */
const statusOf = o => o.w === 1 ? 'correct' : o.w > 0 ? 'partial' : 'wrong';
function resultClass(q, j, pick) {
  if (pick == null) return '';
  const o = q.opts[j];
  if (j === pick) return `${c.result} ${{ correct: c.rCorrect, partial: c.rPartial, wrong: c.rWrong }[statusOf(o)]}`;
  if (o.w === 1) return `${c.result} ${c.rKey}`;   // highlight the right answer when you missed it
  return c.rDim;
}
function feedbackHTML(q, pick) {
  const o = q.opts[pick], st = statusOf(o), best = q.opts.find(x => x.w === 1);
  const [tc, ts] = tone(st);
  const title = { correct: 'Correct!', partial: 'Partly right', wrong: 'Incorrect' }[st];
  return `<div class="${c.feedback}" style="--tone:${tc};--tone-soft:${ts}">
    <div class="${c.fbHead}"><span class="${c.fbIcon}" aria-hidden="true">${ICON[st]}</span><b>${title}</b><span class="${c.fbPts}">+${fmt(o.w * q.d)}/${q.d} pts</span></div>
    ${st !== 'correct' ? `<div class="${c.fbRow}"><span>Your answer</span>${esc(o.t)}</div>
    <div class="${c.fbRow} ${c.fbKey}"><span>Correct answer</span>${esc(best.t)}</div>` : ''}
    <p class="${c.expl}">${esc(q.x)}</p>
  </div>`;
}

function choose(j) {
  if (S.answers[S.i] != null) return;   // an answer is locked once marked
  S.answers[S.i] = j;
  const q = S.quiz[S.i];
  App.haptic(statusOf(q.opts[j]));
  app.querySelector('[role="radiogroup"]').classList.add(c.locked);
  app.querySelectorAll('[data-opt]').forEach(b => {
    const k = +b.dataset.opt;
    b.setAttribute('aria-checked', String(k === j));
    const extra = resultClass(q, k, j);
    if (extra) b.className += ' ' + extra;
  });
  app.querySelector('#feedback').innerHTML = feedbackHTML(q, j);
  setTimeout(() => { const nb = app.querySelector('#next'); if (nb) nb.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'nearest' }); }, 120);
  const nextBtn = app.querySelector('#next');
  nextBtn.disabled = false; delete nextBtn.dataset.confirm; nextBtn.textContent = nextLabel();
  app.querySelector('#marked').textContent = `${S.answers.filter(a => a != null).length}/${S.quiz.length} marked`;
  const dot = app.querySelector(`[data-jump="${S.i}"]`);
  if (dot) dot.setAttribute('aria-label', `Question ${S.i + 1}, answered`);
}
function next() {
  if (S.answers[S.i] == null) return;
  if (S.i < S.quiz.length - 1) { S.i++; renderQuiz(); return; }
  const firstEmpty = S.answers.findIndex(a => a == null);
  const btn = app.querySelector('#next');
  if (firstEmpty > -1 && btn.dataset.confirm !== '1') { // in-page confirmation (dialogs are blocked in artifacts)
    btn.dataset.confirm = '1'; btn.textContent = `Grade anyway (Q${firstEmpty + 1} blank)`; return;
  }
  S.endedAt = Date.now();
  const res = score();
  const bests = store.get('best', {});
  S.prevBest = bests[S.topic] != null ? bests[S.topic] : null;
  if (S.prevBest == null || res.pct > S.prevBest) { bests[S.topic] = res.pct; store.set('best', bests); }
  S.screen = 'result'; render();
  window.scrollTo(0, 0);
}

function shareText(res) {
  const t = topicOf(S.topic);
  const nm = S.name.trim() || 'I';
  const lines = [
    `Quizsmith · ${t.name} · ${DIFFS[S.diff]} · ${S.quiz.length} Qs`,
    `${nm} scored ${res.pct}% → ${res.tier}`,
    `${fmt(res.earned)} / ${res.total} weighted pts · ${res.ok} ${EMOJI.correct}  ${res.part} ${EMOJI.partial}  ${res.bad} ${EMOJI.wrong}`,
    res.rows.map(r => EMOJI[r.status]).join('')
  ];
  if (S.includeAnswers) {
    lines.push('');
    res.rows.forEach((r, i) => {
      lines.push(`${i + 1}. ${EMOJI[r.status]} ${r.q.q}`);
      let line = `   You: ${r.chosen ? r.chosen.t : '(no answer)'} (${fmt(r.earned)}/${r.pts} pts)`;
      if (r.status !== 'correct') line += ` · Correct: ${r.best.t}`;
      lines.push(line);
    });
  }
  lines.push('', `Can you beat ${nm === 'I' ? 'me' : nm}? Load code ${S.code} in Quizsmith for the same questions.`);
  return lines.join('\n');
}

function renderResult() {
  const res = score();
  const t = topicOf(S.topic);
  const nm = S.name.trim();
  const secs = Math.max(1, Math.round((S.endedAt - S.startedAt) / 1000));
  const time = secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
  const R = 64, CIRC = 2 * Math.PI * R;
  const ringColor = res.pct >= 70 ? 'var(--ok)' : res.pct >= 40 ? 'var(--part)' : 'var(--bad)';

  // breakdown by difficulty, or by domain in the mix
  const groups = {};
  res.rows.forEach(r => {
    const key = S.topic === 'MIX' ? TOPICS[r.q.topic].short : DIFF_LABEL[r.q.d];
    groups[key] = groups[key] || { e: 0, t: 0 }; groups[key].e += r.earned; groups[key].t += r.pts;
  });
  const order = S.topic === 'MIX' ? Object.keys(groups) : ['Easy', 'Medium', 'Hard'].filter(k => groups[k]);
  const ranked = order.slice().sort((a, b) => (groups[a].e / groups[a].t) - (groups[b].e / groups[b].t));
  const weakest = ranked[0], strongest = ranked[ranked.length - 1];
  const lost = res.total - res.earned;
  let advice;
  if (res.pct === 100) advice = `${nm ? nm + ', a' : 'A'} perfect sheet. Try ${S.diff === 'H' ? 'another domain' : 'Hard difficulty'} next.`;
  else if (order.length > 1 && weakest !== strongest) advice = `${nm ? nm + ', your' : 'Your'} strongest area was <b>${esc(strongest)}</b>. The biggest gap was <b>${esc(weakest)}</b>${S.topic === 'MIX' ? ', so that domain is worth a dedicated quiz.' : ' questions.'} You missed ${fmt(lost)} point${lost === 1 ? '' : 's'} in total.`;
  else advice = `You missed ${fmt(lost)} point${lost === 1 ? '' : 's'} in total. Near-misses still earned partial credit, shown in amber below.`;
  const pb = S.prevBest == null ? 'First attempt on record' : res.pct > S.prevBest ? `New personal best · was ${S.prevBest}%` : `Your best here: ${S.prevBest}%`;

  const card = (r, i) => {
    const [tc, ts] = tone(r.status);
    const delay = 500 + i * 120;
    return `<div class="${c.cardWrap}" style="animation-delay:${delay}ms">
      <div class="${c.cardTilt}" data-tilt>
        <div class="${c.flip}" data-flip="${i}" data-flipped="${!!S.flipped[i]}" style="--tone:${tc};--tone-soft:${ts}">
          <article class="${c.face}" aria-hidden="${!!S.flipped[i]}">
            <div class="${c.cardTop}">
              <span class="${c.cardNo}">Q${i + 1} &middot; ${DIFF_LABEL[r.q.d]}${S.topic === 'MIX' ? ' &middot; ' + esc(TOPICS[r.q.topic].short) : ''}</span>
              <span class="${c.stamp}" style="animation-delay:${delay + 380}ms">${STATUS_LABEL[r.status]}</span>
            </div>
            <h3 class="${c.cardQ}">${esc(r.q.q)}</h3>
            <ul class="${c.ansList}">
              <li class="${c.ans} ${c.ansYou}"><span class="${c.ansIcon}" style="background:${tc}">${ICON[r.status]}</span><span><span class="k">Your answer</span>${esc(r.chosen ? r.chosen.t : 'No answer')}</span><span class="${c.pts}" style="color:${tc}">+${fmt(r.earned)}/${r.pts}</span></li>
              ${r.status !== 'correct' ? `<li class="${c.ans} ${c.ansKey}"><span class="${c.ansIcon}" style="background:var(--ok)">✓</span><span><span class="k">Correct answer</span>${esc(r.best.t)}</span><span class="${c.pts}" style="color:var(--ok)">${r.pts}/${r.pts}</span></li>` : ''}
            </ul>
            <p class="${c.expl}">${esc(r.q.x)}</p>
            <button type="button" class="${c.flipBtn}" data-flipbtn="${i}">↻ Flip for answer weights</button>
          </article>
          <article class="${c.face} ${c.faceBack}" aria-hidden="${!S.flipped[i]}">
            <div class="${c.cardTop}"><span class="${c.cardNo}">Q${i + 1} &middot; Answer weights</span></div>
            <h3 class="${c.cardQ}">${esc(r.q.q)}</h3>
            <p class="${c.wTitle}">${r.chosen ? `Your pick: ${Math.round(r.w * 100)}% × ${r.pts} pt${r.pts > 1 ? 's' : ''} = ${fmt(r.earned)}` : 'No answer: 0 points'}</p>
            <ul class="${c.weights}">
              ${r.q.opts.slice().sort((a, b) => b.w - a.w).map(o => `<li><span>${esc(o.t)}${r.chosen === o ? ' <b>(you)</b>' : ''}</span><span class="${c.wbar}"><i style="width:${o.w * 100}%"></i></span><span>${Math.round(o.w * 100)}%</span></li>`).join('')}
            </ul>
            <button type="button" class="${c.flipBtn}" data-flipbtn="${i}">↺ Flip back</button>
          </article>
        </div>
      </div>
    </div>`;
  };

  app.innerHTML = `<main class="${c.wrap}">
    ${masthead(`${esc(t.name)} &middot; ${DIFFS[S.diff]}<br>Code ${S.code}`)}
    <section class="${c.sheet}">
      <div class="${c.resultHero}">
        <div class="${c.coin}">
          <svg width="156" height="156" viewBox="0 0 156 156" aria-hidden="true">
            <circle cx="78" cy="78" r="${R}" fill="none" stroke="var(--rule)" stroke-width="10"></circle>
            <circle id="arc" class="${c.ringArc}" cx="78" cy="78" r="${R}" fill="none" stroke="${ringColor}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" transform="rotate(-90 78 78)"></circle>
          </svg>
          <div class="${c.ringNum}"><div><span id="pct">${res.pct}</span>%<small>weighted</small></div></div>
        </div>
        <div style="min-width:0">
          <div class="${c.eyebrow}">${nm ? esc(nm) + '’s' : 'Your'} graded sheet</div>
          <h2 class="${c.tier}">${esc(res.tier)}</h2>
          <p class="${c.lede}" style="margin:0">${fmt(res.earned)} of ${res.total} weighted points in ${time}.</p>
          <span class="${c.stampBox}" style="color:${ringColor}">${pb}</span>
        </div>
      </div>
      <div class="${c.stats}">
        <div class="${c.stat} ${c.statOk}"><b>${res.ok}</b><span>Correct</span></div>
        <div class="${c.stat} ${c.statPart}"><b>${res.part}</b><span>Partial</span></div>
        <div class="${c.stat} ${c.statBad}"><b>${res.bad}</b><span>Incorrect</span></div>
        <div class="${c.stat}"><b>${fmt(res.earned)}<small style="font-size:14px;color:var(--ink-2)">/${res.total}</small></b><span>Points</span></div>
      </div>
      <div class="${c.strip}" aria-label="Answer strip">
        ${res.rows.map((r, i) => `<span class="${c.stripDot}" title="Q${i + 1}: ${STATUS_LABEL[r.status]}" style="background:${tone(r.status)[0]};animation-delay:${400 + i * 70}ms">${ICON[r.status]}</span>`).join('')}
      </div>
      <div class="${c.breakdown}">
        ${order.map(k => `<div class="${c.barRow}"><span>${esc(k)}</span><span class="${c.bar}"><i data-scale="${groups[k].e / groups[k].t}" style="transform:scaleX(0)"></i></span><em>${fmt(groups[k].e)}/${groups[k].t} pts</em></div>`).join('')}
      </div>
      <div class="${c.advice}">${advice}</div>
    </section>

    <div class="${c.cardsHead}">
      <h2 class="${c.secTitle}">Answer cards</h2>
      <button type="button" class="${c.btn} ${c.ghost}" id="flipAll">↻ Flip all</button>
    </div>
    <div class="${c.cards}">${res.rows.map(card).join('')}</div>

    <section class="${c.sheet}" style="animation-delay:300ms">
      <div class="${c.share}">
        <div><div class="${c.eyebrow}">Share your result</div><h2 class="${c.h1}" style="font-size:26px">Challenge a friend</h2></div>
        <label class="${c.check}" for="incl"><input type="checkbox" id="incl" ${S.includeAnswers ? 'checked' : ''}> Include each question with your answer and the correct one</label>
        <textarea class="${c.shareBox}" id="shareBox" readonly aria-label="Shareable result text"></textarea>
        <div class="${c.actions}">
          <button type="button" class="${c.btn}" id="nativeShare" ${App.canShare() ? '' : 'hidden'}>Share result…</button>
          <button type="button" class="${c.btn} ${App.canShare() ? c.ghost : ''}" id="copy">Copy result text</button>
          <button type="button" class="${c.btn} ${c.ghost}" id="retake">Retake same quiz</button>
          <button type="button" class="${c.btn} ${c.ghost}" id="again">New quiz</button>
        </div>
      </div>
    </section>
  </main>`;

  // flip cards
  const setFlip = (i, on) => {
    S.flipped[i] = on;
    const f = app.querySelector(`[data-flip="${i}"]`);
    f.dataset.flipped = String(on);
    const faces = f.children; faces[0].setAttribute('aria-hidden', String(on)); faces[1].setAttribute('aria-hidden', String(!on));
  };
  app.querySelectorAll('[data-flipbtn]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.flipbtn; setFlip(i, !S.flipped[i]); }));
  app.querySelector('#flipAll').addEventListener('click', () => {
    const anyFront = res.rows.some((_, i) => !S.flipped[i]);
    res.rows.forEach((_, i) => setTimeout(() => setFlip(i, anyFront), REDUCE ? 0 : i * 70));
  });
  app.querySelectorAll('[data-tilt]').forEach(el => tilt(el, 10, 6));

  // share text
  const box = app.querySelector('#shareBox');
  const fill = () => { box.value = shareText(res); };
  fill();
  app.querySelector('#incl').addEventListener('change', e => { S.includeAnswers = e.target.checked; fill(); });
  app.querySelector('#copy').addEventListener('click', () => {
    const fallback = () => { box.focus(); box.select(); toast('Text selected. Press Ctrl/⌘ + C to copy.'); };
    try { navigator.clipboard.writeText(box.value).then(() => toast('Copied. Paste it anywhere.'), fallback); } catch (e) { fallback(); }
  });
  app.querySelector('#nativeShare').addEventListener('click', () => App.share(box.value));
  app.querySelector('#retake').addEventListener('click', () => { const p = parseCode(S.code); startQuiz(p.topic, p.diff, p.count, p.seed); });
  app.querySelector('#again').addEventListener('click', () => { S.screen = 'setup'; render(); window.scrollTo(0, 0); });

  // animate ring, count-up and bars
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const arc = app.querySelector('#arc');
    if (arc) arc.style.strokeDashoffset = String(CIRC * (1 - res.pct / 100));
    app.querySelectorAll('[data-scale]').forEach(i => { i.style.transform = `scaleX(${i.dataset.scale})`; });
  }));
  const pctEl = app.querySelector('#pct');
  if (!REDUCE && res.pct > 0) {
    const t0 = performance.now() + 500, dur = 1500;
    const tick = now => { const k = Math.max(0, Math.min(1, (now - t0) / dur)); pctEl.textContent = Math.round(res.pct * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
    pctEl.textContent = '0'; requestAnimationFrame(tick);
  }
}

let toastTimer;
function toast(msg) {
  document.querySelectorAll('[data-toast]').forEach(n => n.remove());
  const n = document.createElement('div'); n.className = c.toast; n.dataset.toast = ''; n.setAttribute('role', 'status'); n.textContent = msg;
  document.body.appendChild(n); clearTimeout(toastTimer); toastTimer = setTimeout(() => n.remove(), 2400);
}

/* keyboard: A–D or 1–4 to mark, Enter for next, ← to go back */
document.addEventListener('keydown', e => {
  if (S.screen !== 'quiz' || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key.toLowerCase();
  let idx = ['a', 'b', 'c', 'd'].indexOf(k); if (idx < 0) idx = ['1', '2', '3', '4'].indexOf(k);
  if (idx > -1 && idx < S.quiz[S.i].opts.length) { e.preventDefault(); choose(idx); }
  else if (e.key === 'Enter' && S.answers[S.i] != null && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); next(); }
  else if (e.key === 'ArrowLeft' && S.i > 0) { S.i--; renderQuiz(); }
});

/* =========================================================
   INSTALLABLE APP LAYER
   Install button, install help for iPhone/Mac Safari/Firefox,
   native share sheet, haptics, Android back button, offline
   service worker. Everything no-ops gracefully in a plain browser.
   ========================================================= */
const App = (function () {
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isMacSafari = !isIOS && /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua);
  const isFirefox = /Firefox\//.test(ua) && !isIOS;
  const isStandalone = () => mq('(display-mode: standalone)') || window.navigator.standalone === true;
  let deferred = null;   // Chrome/Edge/Android install prompt
  let pushed = false;    // extra history entry so Android "back" steps back inside the app

  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; refresh(); });
  window.addEventListener('appinstalled', () => { deferred = null; refresh(); toast('Quizsmith is installed. Open it from your apps or home screen.'); });

  const canOffer = () => !isStandalone() && (!!deferred || isIOS || isMacSafari || isFirefox);
  function refresh() {
    document.querySelectorAll('[data-install]').forEach(b => {
      b.hidden = !(S.screen === 'setup' && canOffer());
      if (!b.dataset.bound) { b.dataset.bound = '1'; b.addEventListener('click', install); }
    });
  }
  async function install() {
    if (deferred) {
      deferred.prompt();
      try { const choice = await deferred.userChoice; if (choice.outcome === 'accepted') toast('Installing Quizsmith…'); } catch (e) { /* ignore */ }
      deferred = null; refresh(); return;
    }
    showHelp();
  }
  function showHelp() {
    let title, steps;
    if (isIOS) {
      title = 'Install on iPhone or iPad';
      steps = ['Open this page in <b>Safari</b>.', 'Tap the <b>Share</b> button <kbd>↑</kbd> in the toolbar.', 'Scroll down and tap <b>Add to Home Screen</b>.', 'Tap <b>Add</b>. Quizsmith appears on your home screen and opens full screen.'];
    } else if (isMacSafari) {
      title = 'Install on your Mac';
      steps = ['In the Safari menu bar, click <b>File</b>.', 'Choose <b>Add to Dock…</b>', 'Click <b>Add</b>. Quizsmith opens from the Dock and Launchpad like any app.'];
    } else if (isFirefox && isAndroid) {
      title = 'Install on Android';
      steps = ['Tap the <b>⋮</b> menu in Firefox.', 'Tap <b>Install</b> (or <b>Add to Home screen</b>).', 'Confirm. Quizsmith appears with your other apps.'];
    } else {
      title = 'Install the app';
      steps = ['Firefox on computers can’t install web apps.', 'Open this page in <b>Chrome</b> or <b>Edge</b>.', 'Click <b>Install app</b> again, or the install icon in the address bar.'];
    }
    const wrapEl = document.createElement('div');
    wrapEl.className = c.overlay; wrapEl.dataset.overlay = '';
    wrapEl.innerHTML = `<div class="${c.sheetCard}" role="dialog" aria-modal="true" aria-labelledby="helpTitle">
      <div class="${c.eyebrow}">Quizsmith app</div>
      <h2 class="${c.h1}" style="font-size:24px;margin:0" id="helpTitle">${title}</h2>
      <ol class="${c.steps}">${steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol>
      <div class="${c.actions}" style="justify-content:flex-end"><button type="button" class="${c.btn}" data-close>Got it</button></div></div>`;
    document.body.appendChild(wrapEl);
    const close = () => wrapEl.remove();
    wrapEl.addEventListener('click', e => { if (e.target === wrapEl || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
    wrapEl.querySelector('[data-close]').focus();
  }

  const canShare = () => typeof navigator.share === 'function';
  function share(text) {
    navigator.share({ title: 'My Quizsmith result', text }).catch(err => {
      if (err && err.name !== 'AbortError') toast('Sharing didn’t work here. Use Copy result text instead.');
    });
  }
  function haptic(status) {   // short buzz for correct, double buzz for wrong (Android)
    try { if (navigator.vibrate) navigator.vibrate(status === 'correct' ? 15 : status === 'partial' ? [20, 50, 20] : [35, 60, 35]); } catch (e) { /* ignore */ }
  }

  /* Android / browser back button: step back a question, or return to setup */
  function syncHistory() {
    if (S.screen !== 'setup' && !pushed) { try { history.pushState({ quizsmith: 1 }, ''); pushed = true; } catch (e) { /* ignore */ } }
  }
  window.addEventListener('popstate', () => {
    pushed = false;
    const overlay = document.querySelector('[data-overlay]');
    if (overlay) { overlay.remove(); return; }
    if (S.screen === 'quiz' && S.i > 0) { S.i--; renderQuiz(); }
    else if (S.screen !== 'setup') { S.screen = 'setup'; renderSetup(); window.scrollTo(0, 0); }
    afterRender();
  });

  function afterRender() { refresh(); syncHistory(); }

  /* offline support: register the service worker when served over https (or localhost) */
  if (window.QUIZSMITH_APP && 'serviceWorker' in navigator && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable */ }); });
    // when a new version is published, reload once so the installed app updates itself
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded && S.screen === 'setup') { reloaded = true; location.reload(); }
    });
  }
  return { afterRender, refresh, share, canShare, haptic };
})();

render();
})();
