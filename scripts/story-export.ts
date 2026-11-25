// Story export: pulls every piece of player-facing writing out of the game and
// writes it as one document organized for a writer: story threads first, in act
// order, then everything else. Text is read from the source files, so a line
// that is built from a template shows its placeholders ({member}) and a line
// that changes with the story shows every version ([IF riot_fed] … [ELSE] … [END]).
//
//   npm run story-export                → docs/story/all-writing.md
//   npm run story-export -- --snapshot  → also docs/story/doc-snapshot/: the exact
//       sections pasted into the owner's Claude Doc, plus the thread-map drawing.
//       Run it only when you sync the doc, so the snapshot stays the baseline
//       that the doc is compared with to find the owner's edits.
//
// Read-only: it never changes game data. See docs/story/README.md for how the
// owner's comments and edits come back into the code.
import ts from 'typescript';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { STORY_EVENTS, RANDOM_EVENTS, type EventDef } from '../src/engine/data/events';
import { FIELD_EVENTS } from '../src/engine/data/field';
import { QUEUED_EVENTS } from '../src/engine/data/cast';
import { EXCLUSIVE_FACTS, FACTS, NPCS } from '../src/engine/data/facts';
import { CONTRACT_TEMPLATES } from '../src/engine/data/contracts';

const ROOT = new URL('..', import.meta.url).pathname;
const rel = (p: string) => relative(ROOT, p);

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

interface Src {
  path: string;
  sf: ts.SourceFile;
  decls: Map<string, ts.Node>; // top-level const / function by name
}
const SOURCES = new Map<string, Src>();
function load(path: string): Src {
  const abs = path.startsWith('/') ? path : join(ROOT, path);
  let s = SOURCES.get(abs);
  if (s) return s;
  const sf = ts.createSourceFile(abs, readFileSync(abs, 'utf8'), ts.ScriptTarget.ES2022, true, abs.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const decls = new Map<string, ts.Node>();
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.initializer) decls.set(d.name.text, d.initializer);
    if (ts.isFunctionDeclaration(st) && st.name) decls.set(st.name.text, st);
  }
  s = { path: abs, sf, decls };
  SOURCES.set(abs, s);
  return s;
}
const lineOf = (src: Src, n: ts.Node) => src.sf.getLineAndCharacterOfPosition(n.getStart(src.sf)).line + 1;
const srcText = (src: Src, n: ts.Node) => n.getText(src.sf);

function unwrap(n: ts.Node): ts.Node {
  while (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isNonNullExpression(n) || ts.isSatisfiesExpression(n) || ts.isTypeAssertionExpression(n)) n = n.expression;
  return n;
}
function propOf(obj: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && propName(p.name) === name) return p.initializer;
    if (ts.isShorthandPropertyAssignment(p) && p.name.text === name) return p.name;
    if (ts.isMethodDeclaration(p) && propName(p.name) === name) return p as unknown as ts.Expression;
  }
  return undefined;
}
function propName(n: ts.PropertyName): string {
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNumericLiteral(n)) return n.text;
  return n.getText();
}
const strVal = (n?: ts.Node) => {
  if (!n) return undefined;
  const u = unwrap(n);
  return ts.isStringLiteral(u) || ts.isNoSubstitutionTemplateLiteral(u) ? u.text : undefined;
};

/** Locals visible while rendering (const x = … inside a function). */
type Ctx = { src: Src; locals: Map<string, ts.Expression> };
const ctxOf = (src: Src): Ctx => ({ src, locals: new Map() });
function withLocals(ctx: Ctx, body: ts.Node): Ctx {
  const locals = new Map(ctx.locals);
  if (ts.isBlock(body))
    for (const st of body.statements)
      if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.initializer) locals.set(d.name.text, d.initializer);
  return { src: ctx.src, locals };
}

// ---------------------------------------------------------------------------
// Conditions and placeholders, in words a writer can read
// ---------------------------------------------------------------------------

function cond(ctx: Ctx, n: ts.Node): string {
  let t = srcText(ctx.src, unwrap(n));
  // substitute simple locals (const loyal = m.loyalty >= 50)
  for (const [k, v] of ctx.locals) if (new RegExp(`(^|[^.\\w])${k}(?![\\w(])`).test(t) && v.getText(ctx.src.sf).length < 60 && !ts.isArrayLiteralExpression(v)) t = t.replace(new RegExp(`(^|[^.\\w])${k}(?![\\w(])`, 'g'), `$1(${v.getText(ctx.src.sf)})`);
  return humanize(t);
}
function humanize(t: string): string {
  return t
    .replace(/\s+/g, ' ')
    .replace(/!!/g, '')
    .replace(/\?\./g, '.')
    .replace(/\bfired\(s, '(\w+)'\)/g, 'scene $1 has happened')
    .replace(/\bs\.eventWeeks\.(\w+) !== undefined/g, 'scene $1 has happened')
    .replace(/\bs\.eventWeeks\.(\w+) === undefined/g, 'scene $1 has not happened')
    .replace(/\bhasStart\(s, '(\w+)'\)/g, 'start includes $1')
    .replace(/\bs\.start\.backer === '(\w+)'/g, 'backer is $1')
    .replace(/\bdecree\(s, '(\w+)'\)/g, 'decree $1 in force')
    .replace(/!s\.flags\.(\w+)/g, 'not $1')
    .replace(/\bs\.flags\.(\w+)/g, '$1')
    .replace(/\bs\.npcs\.(\w+)\.attitude/g, '$1 attitude')
    .replace(/\bs\.npcs\.(\w+)\.status/g, '$1 status')
    .replace(/\bs\.clocks\.(\w+)/g, '$1 clock')
    .replace(/\bs\.factions\.(\w+)\.standing/g, '$1 standing')
    .replace(/\bs\.rivals\.(\w+)\.(\w+)/g, '$1 $2')
    .replace(/\(s\) => /g, '')
    .replace(/\(_s, m\) => /g, '')
    .replace(/\bs\./g, '')
    .replace(/ && /g, ' and ')
    .replace(/ \|\| /g, ' or ')
    .replace(/ === /g, ' is ')
    .replace(/ !== /g, ' is not ')
    .replace(/(^|[\s(])!(?=[\w(])/g, '$1not ')
    .trim();
}
const ALIASES: [RegExp, string][] = [
  [/^first\(m\)$/, 'member'],
  [/^m\.name$/, 'member full name'],
  [/^first\(lead\)$/, 'squad leader'],
  [/^name$/, 'name'],
];
function placeholder(ctx: Ctx, n: ts.Node): string {
  const t = humanize(srcText(ctx.src, unwrap(n)));
  for (const [re, name] of ALIASES) if (re.test(t)) return `{${name}}`;
  return `{${t.length > 70 ? t.slice(0, 67) + '…' : t}}`;
}

// ---------------------------------------------------------------------------
// Rendering text: templates keep their placeholders, branches show every version
// ---------------------------------------------------------------------------

function isStringy(n: ts.Node): boolean {
  const u = unwrap(n);
  if (ts.isStringLiteral(u) || ts.isNoSubstitutionTemplateLiteral(u) || ts.isTemplateExpression(u)) return true;
  if (ts.isBinaryExpression(u) && u.operatorToken.kind === ts.SyntaxKind.PlusToken) return isStringy(u.left) || isStringy(u.right);
  if (ts.isConditionalExpression(u)) return isStringy(u.whenTrue) || isStringy(u.whenFalse);
  return false;
}

function render(ctx: Ctx, n: ts.Node | undefined): string {
  if (!n) return '';
  const u = unwrap(n);
  if (ts.isStringLiteral(u) || ts.isNoSubstitutionTemplateLiteral(u)) return u.text;
  if (ts.isTemplateExpression(u)) return u.head.text + u.templateSpans.map((sp) => render(ctx, sp.expression) + sp.literal.text).join('');
  if (ts.isBinaryExpression(u) && u.operatorToken.kind === ts.SyntaxKind.PlusToken) return render(ctx, u.left) + render(ctx, u.right);
  if (ts.isBinaryExpression(u) && u.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken && isStringy(u.right)) return `[IF ${cond(ctx, u.left)}] ${render(ctx, u.right)} [END]`;
  if (ts.isBinaryExpression(u) && (u.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken || u.operatorToken.kind === ts.SyntaxKind.BarBarToken) && isStringy(u.right) && !isStringy(u.left)) return placeholder(ctx, u);
  if (ts.isConditionalExpression(u)) {
    if (!isStringy(u.whenTrue) && !isStringy(u.whenFalse) && !isFnLike(u.whenTrue)) return placeholder(ctx, u);
    const parts: string[] = [`[IF ${cond(ctx, u.condition)}] ${render(ctx, u.whenTrue)}`];
    let rest: ts.Node = unwrap(u.whenFalse);
    while (ts.isConditionalExpression(rest)) {
      parts.push(`[ELSE IF ${cond(ctx, rest.condition)}] ${render(ctx, rest.whenTrue)}`);
      rest = unwrap(rest.whenFalse);
    }
    const last = render(ctx, rest);
    if (last.trim()) parts.push(`[ELSE] ${last}`);
    return parts.join(' ') + ' [END]';
  }
  if (ts.isArrowFunction(u) || ts.isFunctionExpression(u) || ts.isFunctionDeclaration(u) || ts.isMethodDeclaration(u)) return renderFn(ctx, u as ts.FunctionLikeDeclaration);
  if (ts.isIdentifier(u) && (u.text === 'undefined' || u.text === 'null')) return '';
  if (ts.isIdentifier(u) && (u.text === 'undefined' || u.text === 'null')) return '';
  if (ts.isIdentifier(u)) {
    const local = ctx.locals.get(u.text);
    if (local && (isStringy(local) || isFnLike(local))) return render(ctx, local);
    const top = ctx.src.decls.get(u.text);
    if (top && isStringy(top)) return render(ctx, top);
    return placeholder(ctx, u);
  }
  if (ts.isElementAccessExpression(u)) {
    // BACKER_LINE[s.start.backer]: show every entry of the lookup table
    const base = unwrap(u.expression);
    const table = ts.isIdentifier(base) ? ctx.src.decls.get(base.text) : undefined;
    if (table && ts.isObjectLiteralExpression(unwrap(table))) {
      const obj = unwrap(table) as ts.ObjectLiteralExpression;
      const entries = obj.properties.filter(ts.isPropertyAssignment).filter((p) => isStringy(p.initializer));
      if (entries.length) return `[DEPENDS ON ${humanize(srcText(ctx.src, u.argumentExpression))}] ` + entries.map((p) => `${propName(p.name)}: ${render(ctx, p.initializer)}`).join(' [OR] ') + ' [END]';
    }
    return placeholder(ctx, u);
  }
  if (ts.isCallExpression(u)) {
    const callee = unwrap(u.expression);
    // [a, cond && b].filter(Boolean).join(' ')
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'join') {
      const arr = arrayBehind(callee.expression);
      if (arr) {
        const sep = strVal(u.arguments[0]) ?? ',';
        return arr.elements.map((e) => render(ctx, e)).filter((x) => x).join(sep);
      }
    }
    if (ts.isIdentifier(callee) && (callee.text === 'pick' || callee.text === 'pickOne')) {
      const arr = u.arguments.map((a) => unwrap(a)).find(ts.isArrayLiteralExpression);
      if (arr) return '[ONE OF] ' + arr.elements.map((e) => render(ctx, e)).join(' [OR] ') + ' [END]';
    }
    return placeholder(ctx, u);
  }
  return placeholder(ctx, u);
}
function arrayBehind(n: ts.Node): ts.ArrayLiteralExpression | undefined {
  let u = unwrap(n);
  while (ts.isCallExpression(u) && ts.isPropertyAccessExpression(u.expression) && u.expression.name.text === 'filter') u = unwrap(u.expression.expression);
  return ts.isArrayLiteralExpression(u) ? u : undefined;
}
const isFnLike = (n: ts.Node) => {
  const u = unwrap(n);
  return ts.isArrowFunction(u) || ts.isFunctionExpression(u) || ts.isFunctionDeclaration(u);
};
function renderFn(ctx: Ctx, fn: ts.FunctionLikeDeclaration): string {
  if (!fn.body) return '';
  if (!ts.isBlock(fn.body)) return render(ctx, fn.body);
  const c = withLocals(ctx, fn.body);
  return renderBlock(c, fn.body.statements);
}
function renderBlock(ctx: Ctx, sts: readonly ts.Statement[]): string {
  const parts: string[] = [];
  for (let i = 0; i < sts.length; i++) {
    const st = sts[i];
    if (ts.isReturnStatement(st)) return [...parts, render(ctx, st.expression)].join(' ');
    if (ts.isIfStatement(st)) {
      const then = ts.isBlock(st.thenStatement) ? st.thenStatement.statements : [st.thenStatement];
      const els = st.elseStatement ? (ts.isBlock(st.elseStatement) ? st.elseStatement.statements : [st.elseStatement]) : sts.slice(i + 1);
      const a = renderBlock(ctx, then);
      const b = renderBlock(ctx, els);
      if (!a && !b) continue;
      return [...parts, `[IF ${cond(ctx, st.expression)}] ${a} ${b ? `[ELSE] ${b} ` : ''}[END]`].join(' ');
    }
  }
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Facts: which ones a piece of content sets, clears and reads
// ---------------------------------------------------------------------------

const FACT_IDS = new Set(Object.keys(FACTS));
interface FactUse {
  sets: Set<string>;
  clears: Set<string>;
  reads: Set<string>;
  scenes: Set<string>; // scenes it checks have happened
}
const SET_KEYS = new Set(['flag', 'flags', 'successFlag', 'failFlag', 'expireFlags']);
function factUse(src: Src, root: ts.Node, into: FactUse = { sets: new Set(), clears: new Set(), reads: new Set(), scenes: new Set() }, seen = new Set<ts.Node>()): FactUse {
  if (seen.has(root)) return into;
  seen.add(root);
  const visit = (n: ts.Node) => {
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && FACT_IDS.has(n.text)) {
      let p: ts.Node = n.parent;
      if (ts.isArrayLiteralExpression(p)) p = p.parent;
      const key = ts.isPropertyAssignment(p) ? propName(p.name) : '';
      if (SET_KEYS.has(key)) into.sets.add(n.text);
      else if (key === 'unflag') into.clears.add(n.text);
      else into.reads.add(n.text);
    }
    if (ts.isPropertyAccessExpression(n) && FACT_IDS.has(n.name.text) && /flags$/.test(n.expression.getText(src.sf))) {
      const par = n.parent;
      if (ts.isBinaryExpression(par) && par.left === n && par.operatorToken.kind === ts.SyntaxKind.EqualsToken) into.sets.add(n.name.text);
      else into.reads.add(n.name.text);
    }
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'fired') {
      const id = strVal(n.arguments[1]);
      if (id) into.scenes.add(id);
    }
    if (ts.isPropertyAccessExpression(n) && /eventWeeks$/.test(n.expression.getText(src.sf))) into.scenes.add(n.name.text);
    // follow helpers defined in the same file (vornQuestions, paskChoices …)
    if (ts.isIdentifier(n) && src.decls.has(n.text) && !(ts.isPropertyAssignment(n.parent) && n.parent.name === n)) {
      const d = src.decls.get(n.text)!;
      if (isFnLike(d) || ts.isArrayLiteralExpression(unwrap(d))) factUse(src, d, into, seen);
    }
    ts.forEachChild(n, visit);
  };
  visit(root);
  return into;
}

// ---------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------

interface Choice {
  id: string;
  shownIf?: string;
  label: string;
  detail?: string;
  check?: string;
  requires?: string;
  result?: string;
  fail?: string;
  next?: string;
  failNext?: string;
  sets: string[];
  failSets: string[];
  clears: string[];
  contracts: string[];
  generated?: string; // one choice per item of a list
  line: number;
}
interface SceneNode {
  key: string;
  sameAs?: string; // shares its menu of choices with an earlier node
  speaker?: string;
  text: string;
  choices: Choice[];
  line: number;
}
interface Scene {
  id: string;
  title: string;
  kind: 'story' | 'follow-up' | 'world' | 'road' | 'queued';
  def: EventDef;
  file: string;
  line: number;
  trigger: string[];
  nodes: SceneNode[];
  use: FactUse;
  thread: string;
}

function findDef(src: Src, id: string): ts.ObjectLiteralExpression | undefined {
  let found: ts.ObjectLiteralExpression | undefined;
  const visit = (n: ts.Node) => {
    if (found) return;
    if (ts.isObjectLiteralExpression(n) && strVal(propOf(n, 'id')) === id && propOf(n, 'title')) found = n;
    else ts.forEachChild(n, visit);
  };
  visit(src.sf);
  return found;
}

interface RawChoice {
  obj: ts.ObjectLiteralExpression;
  shownIf: string[];
  generated?: string;
  ctx: Ctx;
}
function rawChoices(ctx: Ctx, n: ts.Node | undefined, shownIf: string[] = [], depth = 0): RawChoice[] {
  if (!n || depth > 8) return [];
  const u = unwrap(n);
  if (ts.isObjectLiteralExpression(u)) return [{ obj: u, shownIf, ctx }];
  if (ts.isArrayLiteralExpression(u)) {
    const out: RawChoice[] = [];
    for (const e of u.elements) {
      const x = unwrap(e);
      if (ts.isSpreadElement(x)) out.push(...rawChoices(ctx, x.expression, shownIf, depth + 1));
      else if (ts.isObjectLiteralExpression(x)) out.push({ obj: x, shownIf, ctx });
      else if (ts.isBinaryExpression(x) && x.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) out.push(...rawChoices(ctx, x.right, [...shownIf, cond(ctx, x.left)], depth + 1));
      else if (ts.isConditionalExpression(x)) {
        out.push(...rawChoices(ctx, x.whenTrue, [...shownIf, cond(ctx, x.condition)], depth + 1));
        out.push(...rawChoices(ctx, x.whenFalse, [...shownIf, `not (${cond(ctx, x.condition)})`], depth + 1));
      } else out.push(...rawChoices(ctx, x, shownIf, depth + 1));
    }
    return out;
  }
  if (ts.isIdentifier(u)) {
    const local = ctx.locals.get(u.text);
    if (local) return rawChoices(ctx, local, shownIf, depth + 1);
    const top = ctx.src.decls.get(u.text);
    return top ? rawChoices(ctxOf(ctx.src), top, shownIf, depth + 1) : [];
  }
  if (ts.isArrowFunction(u) || ts.isFunctionExpression(u) || ts.isFunctionDeclaration(u)) {
    const fn = u as ts.FunctionLikeDeclaration;
    if (!fn.body) return [];
    if (!ts.isBlock(fn.body)) return rawChoices(ctx, fn.body, shownIf, depth + 1);
    const c = withLocals(ctx, fn.body);
    const ret = fn.body.statements.filter(ts.isReturnStatement);
    return ret.flatMap((r) => rawChoices(c, r.expression, shownIf, depth + 1));
  }
  if (ts.isConditionalExpression(u)) {
    const t = rawChoices(ctx, u.whenTrue, [...shownIf, cond(ctx, u.condition)], depth + 1);
    const f = rawChoices(ctx, u.whenFalse, [...shownIf, `not (${cond(ctx, u.condition)})`], depth + 1);
    return [...t, ...f];
  }
  if (ts.isCallExpression(u)) {
    const callee = unwrap(u.expression);
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'filter') return rawChoices(ctx, callee.expression, shownIf, depth + 1);
    if (ts.isPropertyAccessExpression(callee) && callee.name.text === 'map') {
      const fn = unwrap(u.arguments[0]);
      const inner = (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) && fn.body ? (ts.isBlock(fn.body) ? fn.body.statements.find(ts.isReturnStatement)?.expression : fn.body) : undefined;
      const obj = inner && unwrap(inner);
      if (obj && ts.isObjectLiteralExpression(obj)) return [{ obj, shownIf, ctx, generated: humanize(callee.expression.getText(ctx.src.sf)) }];
      return [];
    }
    if (ts.isIdentifier(callee)) {
      const top = ctx.src.decls.get(callee.text);
      if (top) return rawChoices(ctxOf(ctx.src), top, shownIf, depth + 1);
    }
  }
  return [];
}

function effectFacts(src: Src, n?: ts.Node) {
  const u = n ? factUse(src, n) : undefined;
  const contracts: string[] = [];
  if (n)
    (function visit(x: ts.Node) {
      if (ts.isPropertyAssignment(x) && propName(x.name) === 'unlockContract') {
        const v = strVal(x.initializer);
        if (v) contracts.push(v);
      }
      ts.forEachChild(x, visit);
    })(n);
  return { sets: [...(u?.sets ?? [])], clears: [...(u?.clears ?? [])], contracts };
}

function sceneChoices(ctx: Ctx, n: ts.Node | undefined, prefix: string): Choice[] {
  return rawChoices(ctx, n).map((rc, i) => {
    const o = rc.obj;
    const c = rc.ctx;
    const eff = effectFacts(c.src, propOf(o, 'effects'));
    const fail = effectFacts(c.src, propOf(o, 'failEffects'));
    const check = propOf(o, 'check');
    const req = propOf(o, 'requires');
    const ifFlag = strVal(propOf(o, 'ifFlag'));
    const ifNot = strVal(propOf(o, 'ifNotFlag'));
    const shownIf = [...rc.shownIf, ...(ifFlag ? [ifFlag] : []), ...(ifNot ? [`not ${ifNot}`] : [])];
    let checkTxt: string | undefined;
    if (check && ts.isObjectLiteralExpression(unwrap(check))) {
      const co = unwrap(check) as ts.ObjectLiteralExpression;
      checkTxt = `${strVal(propOf(co, 'approach')) ?? '?'} check, difficulty ${propOf(co, 'difficulty')?.getText(c.src.sf) ?? '?'}`;
    }
    return {
      id: `${prefix}/c${i + 1}`,
      shownIf: shownIf.length ? shownIf.join(' and ') : undefined,
      label: render(c, propOf(o, 'label')),
      detail: propOf(o, 'detail') ? render(c, propOf(o, 'detail')) : undefined,
      check: checkTxt,
      requires: req ? humanize(req.getText(c.src.sf)).replace(/[{}]/g, '').trim() : undefined,
      result: render(c, propOf(o, 'resultText')) || undefined,
      fail: propOf(o, 'failText') ? render(c, propOf(o, 'failText')) : undefined,
      next: strVal(propOf(o, 'next')),
      failNext: strVal(propOf(o, 'failNext')),
      sets: eff.sets,
      failSets: fail.sets,
      clears: [...eff.clears, ...fail.clears],
      contracts: [...new Set([...eff.contracts, ...fail.contracts])],
      generated: rc.generated,
      line: lineOf(c.src, o),
    };
  });
}

const SCENE_FILES = ['src/engine/data/events.ts', 'src/engine/data/cast.ts', 'src/engine/data/field.ts'];

function buildScene(def: EventDef, kind: Scene['kind']): Scene {
  for (const f of SCENE_FILES) {
    const src = load(f);
    const obj = findDef(src, def.id);
    if (!obj) continue;
    const ctx = ctxOf(src);
    const nodes: SceneNode[] = [
      {
        key: 'root',
        speaker: strVal(propOf(obj, 'speaker')),
        text: render(ctx, propOf(obj, 'text')),
        choices: sceneChoices(ctx, propOf(obj, 'choices'), `${def.id}/root`),
        line: lineOf(src, obj),
      },
    ];
    const menuOf = (o: ts.ObjectLiteralExpression) => {
      const c = propOf(o, 'choices');
      const u = c && unwrap(c);
      return u && ts.isIdentifier(u) ? src.decls.get(u.text) ?? u : u;
    };
    const menus = new Map<ts.Node | undefined, string>([[menuOf(obj), 'root']]);
    const nodesObj = propOf(obj, 'nodes');
    if (nodesObj && ts.isObjectLiteralExpression(unwrap(nodesObj)))
      for (const p of (unwrap(nodesObj) as ts.ObjectLiteralExpression).properties) {
        if (!ts.isPropertyAssignment(p) || !ts.isObjectLiteralExpression(unwrap(p.initializer))) continue;
        const no = unwrap(p.initializer) as ts.ObjectLiteralExpression;
        const key = propName(p.name);
        const menu = menuOf(no);
        const sameAs = menu && menus.get(menu);
        if (menu && !sameAs) menus.set(menu, key);
        nodes.push({ key, sameAs, speaker: strVal(propOf(no, 'speaker')), text: render(ctx, propOf(no, 'text')), choices: sameAs ? [] : sceneChoices(ctx, propOf(no, 'choices'), `${def.id}/${key}`), line: lineOf(src, no) });
      }
    const trigger: string[] = [];
    if (def.window) trigger.push(def.window[0] === def.window[1] ? `Week ${def.window[0]}` : `Weeks ${def.window[0]}–${def.window[1]}`);
    if (def.after?.length) trigger.push(`after ${def.after.map((a) => sceneRef(a)).join(', ')}`);
    const condN = propOf(obj, 'condition');
    if (condN) trigger.push(`when ${cond(ctx, fnBody(condN))}`);
    const memberN = propOf(obj, 'member');
    if (memberN) trigger.push(`picks a member where ${cond(ctx, fnBody(memberN))}`);
    if (def.npcs?.length) trigger.push(`needs alive: ${def.npcs.map((n) => NPCS[n]?.name ?? n).join(', ')}`);
    if (def.chance !== undefined) trigger.push(`${Math.round(def.chance * 100)}% a week inside the window`);
    if (def.weight !== undefined) trigger.push(`random draw, weight ${def.weight}`);
    if (def.cooldown !== undefined) trigger.push(def.cooldown >= 999 ? 'fires once' : `not again for ${def.cooldown} weeks`);
    return { id: def.id, title: def.title, kind, def, file: rel(src.path), line: lineOf(src, obj), trigger, nodes, use: factUse(src, obj), thread: '' };
  }
  throw new Error(`Scene ${def.id} not found in source`);
}
function fnBody(n: ts.Node): ts.Node {
  const u = unwrap(n);
  if ((ts.isArrowFunction(u) || ts.isFunctionExpression(u)) && u.body && !ts.isBlock(u.body)) return u.body;
  return u;
}

// ---------------------------------------------------------------------------
// Generic items: codex, street talk, Dates, contracts, starts and the rest
// ---------------------------------------------------------------------------

interface Field {
  key: string;
  text: string;
  isCond?: boolean;
}
interface Item {
  id: string;
  title?: string;
  file: string;
  line: number;
  fields: Field[];
  use: FactUse;
  group: string;
}
const COND_KEYS = new Set(['unlock', 'when', 'condition', 'available', 'done', 'member', 'apply']);
const ONE_WORD_OK = new Set(['name', 'title', 'label', 'short', 'chapter', 'category', 'type', 'who', 'titles']);
const SKIP_KEYS = new Set(['id', 'color', 'sigil', 'icon', 'tab', 'guide', 'group', 'faction', 'rival', 'kind', 'region', 'regions', 'patrons', 'tags', 'approach', 'approaches', 'profession', 'trait', 'slot', 'element', 'npcs', 'requiresFlag', 'successFlag', 'failFlag', 'expireFlags', 'tag', 'bad', 'id2']);

function hasWords(s: string) {
  return /[A-Za-z]/.test(s) && /\s/.test(s.trim());
}
function itemFields(ctx: Ctx, obj: ts.ObjectLiteralExpression, prefix = ''): Field[] {
  const out: Field[] = [];
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p) && !ts.isMethodDeclaration(p)) continue;
    const key = propName(p.name);
    if (SKIP_KEYS.has(key)) continue;
    const v = ts.isPropertyAssignment(p) ? unwrap(p.initializer) : (p as ts.Node);
    const path = prefix + key;
    if (COND_KEYS.has(key) && isFnLike(v)) {
      // available() may return a reason string: show it; otherwise show the condition
      const txt = render(ctx, v);
      if (/[A-Za-z]{3,} [A-Za-z]{3,}/.test(txt.replace(/\{[^}]*\}|\[(IF|ELSE|END)[^\]]*\]/g, ''))) out.push({ key: path, text: txt });
      else out.push({ key: path, text: cond(ctx, fnBody(v)), isCond: true });
      continue;
    }
    if (isStringy(v) || (isFnLike(v) && isStringy(fnBody(v))) || (isFnLike(v) && ts.isBlock((v as ts.FunctionLikeDeclaration).body!) && /[A-Za-z]{3,} [a-z]{3,}/.test(render(ctx, v)))) {
      const t = render(ctx, v);
      if (hasWords(t) || (ONE_WORD_OK.has(key) && /[A-Za-z]/.test(t))) out.push({ key: path, text: t });
      continue;
    }
    if (ts.isArrayLiteralExpression(v)) {
      v.elements.forEach((e, i) => {
        const x = unwrap(e);
        if (isStringy(x)) {
          const t = render(ctx, x);
          if (hasWords(t) || ONE_WORD_OK.has(key)) out.push({ key: `${path}[${i + 1}]`, text: t });
        } else if (ts.isObjectLiteralExpression(x)) out.push(...itemFields(ctx, x, `${path}[${i + 1}].`));
        else if (ts.isCallExpression(x)) {
          const words = x.arguments.filter((a) => isStringy(a)).map((a) => render(ctx, a)).filter((t) => /[A-Za-z]/.test(t));
          if (words.length) out.push({ key: `${path}[${i + 1}]`, text: words.join(': ') });
        }
      });
      continue;
    }
    if (ts.isObjectLiteralExpression(v)) out.push(...itemFields(ctx, v, `${path}.`));
  }
  return out;
}

/** Object literals with an `id` (or entries of a record keyed by id) anywhere in a file. */
function collectItems(path: string, group: (id: string, obj: ts.ObjectLiteralExpression, top: string) => string | undefined): Item[] {
  const src = load(path);
  const ctx = ctxOf(src);
  const items: Item[] = [];
  const claimed = new Set<ts.Node>();
  const visit = (n: ts.Node, top: string) => {
    if (ts.isObjectLiteralExpression(n) && !claimed.has(n)) {
      let id = strVal(propOf(n, 'id'));
      if (!id && ts.isPropertyAssignment(n.parent) && ts.isObjectLiteralExpression(n.parent.parent) && ts.isVariableDeclaration(n.parent.parent.parent)) id = propName(n.parent.name);
      if (id) {
        const g = group(id, n, top);
        if (g) {
          const fields = itemFields(ctx, n);
          if (fields.some((f) => !f.isCond)) {
            const titleF = fields.find((f) => f.key === 'title' || f.key === 'name');
            items.push({ id, title: titleF?.text, file: rel(src.path), line: lineOf(src, n), fields, use: factUse(src, n), group: g });
          }
          claimed.add(n);
          return;
        }
      }
    }
    ts.forEachChild(n, (c) => visit(c, top));
  };
  for (const st of src.sf.statements) {
    const name = ts.isVariableStatement(st) ? (st.declarationList.declarations[0].name as ts.Identifier).text : ts.isFunctionDeclaration(st) ? st.name?.text ?? '' : '';
    visit(st, name);
  }
  return items;
}

/** Loose strings in rules code (dispatches, warnings, reports), grouped by function. */
interface Loose {
  id: string;
  file: string;
  fn: string;
  line: number;
  text: string;
}
function looseStrings(path: string, skipInside: Set<ts.Node> = new Set()): Loose[] {
  const src = load(path);
  const ctx = ctxOf(src);
  const out: Loose[] = [];
  const counts: Record<string, number> = {};
  const fnName = (n: ts.Node): string => {
    for (let p: ts.Node | undefined = n.parent; p; p = p.parent) {
      if ((ts.isFunctionDeclaration(p) || ts.isMethodDeclaration(p)) && p.name) return p.name.getText(src.sf);
      if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && ts.isVariableDeclaration(p.parent)) return p.parent.name.getText(src.sf);
      if (ts.isVariableDeclaration(p) && ts.isSourceFile(p.parent.parent.parent)) return p.name.getText(src.sf);
      if (ts.isPropertyAssignment(p) && ts.isObjectLiteralExpression(p.parent) && ts.isVariableDeclaration(p.parent.parent)) return `${p.parent.parent.name.getText(src.sf)}.${propName(p.name)}`;
    }
    return 'top';
  };
  const visit = (n: ts.Node) => {
    if (skipInside.has(n) || ts.isImportDeclaration(n) || ts.isExportDeclaration(n) || ts.isTypeNode(n)) return;
    // styling and drawing, not words: class names, SVG paths, inline styles
    if (ts.isJsxAttribute(n) && /^(className|d|style|key|viewBox|fill|stroke|id|href|src|role|type|points|transform|data-[\w-]+)$/.test(n.name.getText(src.sf))) return;
    if (ts.isPropertyAssignment(n) && /^(className|cls|style|d|path|color|background)$/.test(propName(n.name))) return;
    if (ts.isCallExpression(n) && /^(console\.|Error|new Error)/.test(n.expression.getText(src.sf))) return;
    if (ts.isNewExpression(n)) return;
    if (ts.isJsxText(n)) {
      const t = n.text.replace(/\s+/g, ' ').trim();
      if (t.split(' ').length >= 3) push(n, t);
      return;
    }
    if (isStringy(n) && !(n.parent && isStringy(n.parent) && !ts.isConditionalExpression(n.parent))) {
      const t = render(ctx, n);
      const words = t.replace(/\{[^}]*\}|\[(IF|ELSE|END|ELSE IF)[^\]]*\]/g, ' ').trim().split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
      // keys and class names are single tokens; CSS and selectors look like code
      if (words.length >= 3 && !/^[\w-]+(\s[\w-]+)*$/.test(t) || (words.length >= 3 && /[A-Z]/.test(t) && /[.,!?'’"]/.test(t))) {
        if (!/^(\.|#|var\(|calc\(|rgba?\(|color-mix\(|\d)/.test(t) && !/[;{}]\s*$/.test(t) && !/^[MmLlHhVvCcSsQqAaZz0-9 .,\-]+$/.test(t) && !/^[a-z][\w-]*( [a-z][\w-]*)*( \[IF|$)/.test(t)) {
          push(n, t);
          return;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  const push = (n: ts.Node, t: string) => {
    const fn = fnName(n);
    counts[fn] = (counts[fn] ?? 0) + 1;
    out.push({ id: `${rel(src.path).replace(/^src\//, '')}#${fn}.${counts[fn]}`, file: rel(src.path), fn, line: lineOf(src, n), text: t });
  };
  visit(src.sf);
  return out;
}

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

interface Thread {
  id: string;
  name: string;
  who: string;
  blurb: string;
}
const THREADS: Thread[] = [
  { id: 'silver', name: "The Crown's silver", who: 'Lord Treasurer Fenn, the Exchequer', blurb: "The act's spine: the charter, the commission to carry the Crown's payment, Quarter Day and its aftermath." },
  { id: 'vorn', name: "Ostrander's", who: 'Factor Maelis Vorn', blurb: "The bank's office on Quay Street: work offers, the notice board and the loan." },
  { id: 'coster', name: 'The Weighhouse', who: 'Alderman Piet Coster', blurb: "The guild's lender, the short weights at Hesketh's and Coster's own page." },
  { id: 'hobbs', name: 'Hobb & Daughters', who: 'Marta and Isbet Hobb', blurb: 'The rival debt collectors: a share offer, a split behind Marta\'s back, a cake and an audit.' },
  { id: 'dagny', name: 'The Lower Town', who: 'Dagny Fell, Porters\' Fraternity', blurb: 'The bread riot, the dock tips and Dagny\'s brother at the chain.' },
  { id: 'pask', name: 'The Mudlarks', who: 'Wenna Pask', blurb: 'The low-tide market round the toll chain and the river strongbox.' },
  { id: 'brune', name: "Saint Oda's", who: 'Sister Agathe Brune', blurb: 'Fever salts from the Saltfens and the bank\'s donation.' },
  { id: 'mayne', name: 'The Ninth', who: 'Captain Rufus Mayne', blurb: 'The disbanded regiment, recruiting from your roster.' },
  { id: 'plaice', name: 'The Assay Office', who: 'Master Assayer Corwin Plaice', blurb: 'Licensing the guild\'s magic.' },
  { id: 'aske', name: 'The Fourteen', who: 'Lady Honora Aske', blurb: 'The family silver, before the bank\'s assessors arrive.' },
  { id: 'hall', name: 'The hall', who: 'Jory Abbot and the members', blurb: 'The guild\'s own people: Jory, the dead, wages, Legends.' },
  { id: 'world', name: 'Varrow at large', who: 'No fixed character', blurb: 'Random world events that can fire any week.' },
  { id: 'road', name: 'On the road', who: 'The squad in the field', blurb: 'Decisions that come up while a squad is travelling.' },
];
const THREAD_OF: Record<string, string> = {
  charter: 'silver', silver_summons: 'silver', quarter_day: 'silver', fenn_tapestry: 'silver', fenn_letter: 'silver', act1_slice_end: 'silver', audit: 'silver',
  ostrander_agent: 'vorn', vorn_board: 'vorn', bank_offer: 'vorn',
  coster_interest: 'coster', coster_bank: 'coster', coster_page: 'coster',
  hobbs_arrive: 'hobbs', isbet_kettle: 'hobbs', marta_cake: 'hobbs', hobbs_audit: 'hobbs',
  bread_riot: 'dagny', dagny_brother: 'dagny', dagny_tip: 'dagny',
  pask_chain: 'pask', pask_strongbox: 'pask', informant: 'pask',
  brune_salts: 'brune', brune_donation: 'brune', festival: 'brune',
  mayne_offer: 'mayne',
  plaice_inspection: 'plaice', peddler: 'plaice',
  aske_plate: 'aske',
  jory_page: 'hall', legend_named: 'hall', brawl: 'hall', raise: 'hall', homesick: 'hall', nightmares: 'hall', volunteer: 'hall',
};

// ---------------------------------------------------------------------------
// Build everything
// ---------------------------------------------------------------------------

const SCENES: Scene[] = [
  ...STORY_EVENTS.map((d) => buildScene(d, 'story')),
  ...RANDOM_EVENTS.map((d) => buildScene(d, d.npcs?.length || THREAD_OF[d.id] ? 'follow-up' : 'world')),
  ...[...FIELD_EVENTS].map((d) => buildScene(d, 'road')),
  ...QUEUED_EVENTS.map((d) => buildScene(d, 'queued')),
];
for (const s of SCENES) s.thread = THREAD_OF[s.id] ?? (s.kind === 'road' ? 'road' : 'world');
const SCENE_BY_ID = Object.fromEntries(SCENES.map((s) => [s.id, s]));
// beat numbers as in the story bible's Act I table (docs/STORY.md §5); any beat
// not listed there is numbered after them, by window
const BIBLE_ORDER = ['charter', 'ostrander_agent', 'coster_interest', 'hobbs_arrive', 'bread_riot', 'silver_summons', 'pask_chain', 'brune_salts', 'mayne_offer', 'vorn_board', 'dagny_brother', 'isbet_kettle', 'quarter_day', 'plaice_inspection', 'fenn_tapestry', 'aske_plate', 'act1_slice_end'];
const BEAT_NO: Record<string, number> = Object.fromEntries(
  [...STORY_EVENTS]
    .sort((a, b) => (BIBLE_ORDER.indexOf(a.id) + 1 || 99) - (BIBLE_ORDER.indexOf(b.id) + 1 || 99) || (a.window?.[0] ?? 0) - (b.window?.[0] ?? 0))
    .map((d, i) => [d.id, i + 1]),
);
function sceneRef(id: string) {
  const d = [...STORY_EVENTS, ...RANDOM_EVENTS, ...FIELD_EVENTS, ...QUEUED_EVENTS].find((x) => x.id === id);
  return d ? `${d.title} (\`${id}\`)` : `\`${id}\``;
}

// generic content
const CONTRACTS = collectItems('src/engine/data/contracts.ts', () => 'contracts');
const CODEX = collectItems('src/engine/data/codex.ts', (_id, _o, top) => (top === 'CODEX' ? 'codex' : top === 'CRIER' ? 'crier' : top === 'JORY' ? 'jory' : undefined));
const DATES = collectItems('src/engine/data/dates.ts', (_id, _o, top) => (top === 'DATES' ? 'dates' : undefined));
const TUTORIAL = collectItems('src/engine/data/tutorial.ts', () => 'tutorial');
const STARTS = collectItems('src/engine/data/starts.ts', (_id, _o, top) => (top === 'BACKERS' ? 'backers' : top === 'CIRCUMSTANCES' ? 'circumstances' : undefined));
const LEGENDS = collectItems('src/engine/people/legends.ts', () => 'legends');
const REFERENCE: Item[] = [
  ...collectItems('src/engine/data/factions.ts', () => 'factions'),
  ...collectItems('src/engine/data/decrees.ts', () => 'decrees'),
  ...collectItems('src/engine/data/professions.ts', () => 'professions'),
  ...collectItems('src/engine/data/traits.ts', () => 'traits'),
  ...collectItems('src/engine/data/tags.ts', () => 'tags'),
  ...collectItems('src/engine/data/items.ts', () => 'items'),
  ...collectItems('src/engine/data/facilities.ts', () => 'facilities'),
];
const ALL_ITEMS: Item[] = [...CONTRACTS, ...CODEX, ...DATES, ...TUTORIAL, ...STARTS, ...LEGENDS, ...REFERENCE];
const CONTRACT_BY_ID = Object.fromEntries(CONTRACTS.map((c) => [c.id, c]));

// leftover lines in content files (not inside an item) and all rules/UI strings
function walk(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((f) => {
    const p = join(dir, f);
    return statSync(join(ROOT, p)).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}
const ITEM_FILES = new Set(ALL_ITEMS.map((i) => i.file));
const SCENE_FILE_SET = new Set(SCENE_FILES);
const ENGINE_FILES = walk('src/engine').filter((f) => !SCENE_FILE_SET.has(f) && !/core\/types\.ts$|data\/facts\.ts$/.test(f));
function itemNodes(path: string): Set<ts.Node> {
  const src = load(path);
  const set = new Set<ts.Node>();
  const ids = new Set(ALL_ITEMS.filter((i) => i.file === path).map((i) => i.line));
  const visit = (n: ts.Node) => {
    if (ts.isObjectLiteralExpression(n) && ids.has(lineOf(src, n))) set.add(n);
    ts.forEachChild(n, visit);
  };
  visit(src.sf);
  return set;
}
// scenes' own files: skip scene objects and their helper functions
function sceneNodes(path: string): Set<ts.Node> {
  const src = load(path);
  const set = new Set<ts.Node>();
  for (const s of SCENES) if (s.file === path) {
    const o = findDef(src, s.id);
    if (o) set.add(o);
  }
  for (const [, d] of src.decls) if (isFnLike(d) || ts.isArrayLiteralExpression(unwrap(d)) || ts.isObjectLiteralExpression(unwrap(d))) set.add(d);
  return set;
}
const LOOSE_ENGINE = ENGINE_FILES.flatMap((f) => looseStrings(f, ITEM_FILES.has(f) ? itemNodes(f) : new Set()));
const LOOSE_SCENE_FILES = SCENE_FILES.flatMap((f) => looseStrings(f, sceneNodes(f)));
const UI_FILES = [...walk('src/ui').filter((f) => !/icons\.tsx$|theme\.ts$/.test(f)), 'src/App.tsx'];
const LOOSE_UI = UI_FILES.flatMap((f) => looseStrings(f));

// fact index: who sets and who reads each fact
interface Ref {
  kind: string;
  id: string;
  title: string;
  thread?: string;
}
const SETTERS: Record<string, Ref[]> = {};
const READERS: Record<string, Ref[]> = {};
const add = (m: Record<string, Ref[]>, f: string, r: Ref) => {
  const l = (m[f] ??= []);
  if (!l.some((x) => x.id === r.id && x.kind === r.kind)) l.push(r);
};
for (const s of SCENES) {
  const r = { kind: 'scene', id: s.id, title: s.title, thread: s.thread };
  for (const f of s.use.sets) add(SETTERS, f, r);
  for (const f of s.use.reads) add(READERS, f, r);
}
const KIND_OF_GROUP: Record<string, string> = { contracts: 'contract', codex: 'codex', crier: 'street talk', jory: 'Jory', dates: 'Date', tutorial: 'objective', backers: 'start', circumstances: 'start' };
for (const i of ALL_ITEMS) {
  const r = { kind: KIND_OF_GROUP[i.group] ?? i.group, id: i.id, title: i.title ?? i.id };
  for (const f of i.use.sets) add(SETTERS, f, r);
  for (const f of i.use.reads) add(READERS, f, r);
}
// story contracts belong to the thread of the scene that adds them
const CONTRACT_THREAD: Record<string, { thread: string; scene: string }> = {};
for (const s of SCENES) for (const n of s.nodes) for (const c of n.choices) for (const k of c.contracts) CONTRACT_THREAD[k] ??= { thread: s.thread, scene: s.id };
for (const [k, v] of Object.entries(CONTRACT_THREAD)) for (const list of [SETTERS, READERS]) for (const refs of Object.values(list)) for (const r of refs) if (r.kind === 'contract' && r.id === k) r.thread = v.thread;
// rules code that reads facts (e.g. war.ts) also counts as a reader
for (const f of ENGINE_FILES) {
  if (ITEM_FILES.has(f)) continue;
  const src = load(f);
  const u = factUse(src, src.sf);
  for (const fact of u.reads) add(READERS, fact, { kind: 'rules', id: rel(src.path), title: rel(src.path) });
  for (const fact of u.sets) add(SETTERS, fact, { kind: 'rules', id: rel(src.path), title: rel(src.path) });
}

// ---------------------------------------------------------------------------
// Problems worth a look
// ---------------------------------------------------------------------------

const PROBLEMS: string[] = [];
for (const s of SCENES) {
  const keys = new Set(s.nodes.map((n) => n.key));
  const targets = new Set<string>();
  for (const n of s.nodes)
    for (const c of n.sameAs ? s.nodes.find((x) => x.key === n.sameAs)!.choices : n.choices)
      for (const t of [c.next, c.failNext])
        if (t) {
          targets.add(t);
          if (!keys.has(t)) PROBLEMS.push(`Scene \`${s.id}\`, node \`${n.key}\`: choice "${c.label}" goes to \`${t}\`, which doesn't exist.`);
        }
  for (const n of s.nodes) if (n.key !== 'root' && !targets.has(n.key)) PROBLEMS.push(`Scene \`${s.id}\`: node \`${n.key}\` has no choice leading to it.`);
  for (const n of s.nodes) if (!n.choices.length && !n.sameAs) PROBLEMS.push(`Scene \`${s.id}\`, node \`${n.key}\`: no choices could be read from the source (they may be built in a way the export can't follow).`);
  for (const n of s.nodes) if (!n.text.trim()) PROBLEMS.push(`Scene \`${s.id}\`, node \`${n.key}\`: no text could be read from the source.`);
}
for (const f of Object.keys(FACTS)) if (!SETTERS[f]) PROBLEMS.push(`Fact \`${f}\` is never set by any scene, contract or rule the export can see.`);
const unread = Object.keys(FACTS).filter((f) => SETTERS[f] && !READERS[f]);
if (unread.length)
  PROBLEMS.push(
    `${unread.length} outcomes are set but nothing in the game reacts to them yet: no scene, contract, Date, Codex entry, street talk or rule reads them (only the story checker's contradiction test does). ` +
      unread.map((f) => `\`${f}\` (${FACTS[f as keyof typeof FACTS].replace(/\.$/, '')}; set by ${(SETTERS[f] ?? []).map((r) => r.title).join(', ')})`).join('; ') +
      '. Half a Year, the act summary, mentions none of them.',
  );
for (const t of CONTRACT_TEMPLATES.filter((c) => c.story)) if (!CONTRACT_THREAD[t.id]) PROBLEMS.push(`Story contract \`${t.id}\` is not added by any scene choice.`);

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

type Flavor = 'repo' | 'doc';
const slug = (s: string) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
function link(flavor: Flavor, title: string, _id: string) {
  // GitHub anchors in the repo copy; the doc uses the scene title in bold plus its id
  return flavor === 'repo' ? `[${title}](#${slug(title)})` : `**${title}**`;
}
function contractLink(flavor: Flavor, id: string) {
  const t = `Contract: ${contractTitle(id)}`;
  return flavor === 'repo' ? `[${contractTitle(id)}](#${slug(t)})` : `**${contractTitle(id)}**`;
}
const quote = (t: string) =>
  t
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n')
    .replace(/\n> $/gm, '\n>');
const sceneLink = (fl: Flavor, id: string) => {
  const s = SCENE_BY_ID[id];
  return s ? `${link(fl, s.title, s.id)} (\`${id}\`)` : `\`${id}\``;
};
const refLink = (fl: Flavor, r: Ref) => {
  if (r.kind === 'scene') return sceneLink(fl, r.id);
  if (r.kind === 'contract' && CONTRACT_BY_ID[r.id]) return `contract ${contractLink(fl, r.id)} (\`${r.id}\`)`;
  if (r.kind === 'rules') return `rules in \`${r.id}\``;
  return `${r.kind} "${r.title}" (\`${r.id}\`)`;
};
const contractTitle = (id: string) => {
  const c = CONTRACT_BY_ID[id];
  return c?.fields.find((f) => f.key === 'titles[1]')?.text ?? id;
};
const factLine = (f: string) => `\`${f}\``;
const FILE_SHORT = (f: string) => f.replace(/^src\/engine\//, '');

function choiceMd(fl: Flavor, c: Choice, depth: string): string[] {
  const L: string[] = [];
  const meta = [c.check, c.requires && `needs ${c.requires}`].filter(Boolean).join('; ');
  L.push(`${depth}- **${c.label}**${c.detail ? ` · _${c.detail}_` : ''}${meta ? ` · (${meta})` : ''} · \`${c.id}\``);
  const sub = depth + '  ';
  if (c.generated) L.push(`${sub}One choice per item of \`${c.generated}\`.`);
  if (c.shownIf) L.push(`${sub}Shown only if: ${c.shownIf}.`);
  if (c.result) L.push(`${sub}${c.fail ? 'On success: ' : ''}“${c.result}”`);
  if (c.fail) L.push(`${sub}On failure: “${c.fail}”`);
  if (c.next) L.push(`${sub}→ goes to node \`${c.next}\`${c.failNext ? `; on failure \`${c.failNext}\`` : ''}`);
  const sets = [...new Set(c.sets)];
  if (sets.length) L.push(`${sub}Sets ${sets.map(factLine).join(', ')}${c.failSets.length ? `; on failure sets ${c.failSets.map(factLine).join(', ')}` : ''}.`);
  else if (c.failSets.length) L.push(`${sub}On failure sets ${c.failSets.map(factLine).join(', ')}.`);
  if (c.clears.length) L.push(`${sub}Clears ${c.clears.map(factLine).join(', ')}.`);
  for (const k of c.contracts) L.push(`${sub}Adds story contract ${contractLink(fl, k)} (\`${k}\`).`);
  return L;
}

function sceneMd(fl: Flavor, s: Scene, h: string): string[] {
  const L: string[] = [];
  const tag = s.kind === 'story' ? `Story beat ${BEAT_NO[s.id]}` : s.kind === 'follow-up' ? 'Follow-up' : s.kind === 'world' ? 'World event' : s.kind === 'road' ? 'Road decision' : 'Queued scene';
  L.push(`${h} ${s.title}`, '');
  L.push(`\`${s.id}\` · ${tag} · ${FILE_SHORT(s.file)}:${s.line}`, '');
  if (s.trigger.length) L.push(`**When:** ${s.trigger.join('; ')}.`, '');
  const reads = [...s.use.reads].sort();
  if (reads.length) {
    L.push('**Reads:** ' + reads.map((f) => `${factLine(f)}${SETTERS[f]?.length ? ` (set by ${SETTERS[f].filter((r) => r.id !== s.id).map((r) => refLink(fl, r)).join(', ') || 'this scene'})` : ''}`).join('; ') + '.', '');
  }
  const scenesChecked = [...s.use.scenes].filter((x) => x !== s.id);
  if (scenesChecked.length) L.push(`**Checks whether these happened:** ${scenesChecked.map((x) => sceneLink(fl, x)).join(', ')}.`, '');
  for (const n of s.nodes) {
    if (n.key !== 'root') L.push(`**Node \`${n.key}\`**${n.speaker ? `, ${n.speaker}` : ''}`, '');
    else if (n.speaker) L.push(`_Speaker: ${n.speaker}_`, '');
    L.push(quote(n.text || '(no text found)'), '');
    if (n.sameAs) L.push(`_Same choices as ${n.sameAs === 'root' ? 'the opening' : `node \`${n.sameAs}\``} (one shared menu)._`);
    for (const c of n.choices) L.push(...choiceMd(fl, c, ''));
    L.push('');
  }
  const sets = [...s.use.sets].sort();
  const leads = sets
    .map((f) => {
      const rs = (READERS[f] ?? []).filter((r) => !(r.kind === 'scene' && r.id === s.id));
      return `${factLine(f)} → ${rs.length ? rs.map((r) => refLink(fl, r)).join(', ') : '_nothing reads it_'}`;
    });
  if (leads.length) L.push('**Leads to:**', '', ...leads.map((l) => `- ${l}`), '');
  return L;
}

function itemMd(fl: Flavor, i: Item, h: string, kind: string): string[] {
  const L: string[] = [];
  L.push(`${h} ${i.title ?? i.id}`, '', `\`${kind}:${i.id}\` · ${FILE_SHORT(i.file)}:${i.line}`, '');
  for (const f of i.fields) {
    if (f.key === 'title' || (f.key === 'name' && f.text === i.title)) continue;
    if (f.isCond) L.push(`- _${f.key}:_ when ${f.text}`);
    else if (f.text.length > 90 || f.text.includes('\n')) L.push(`- _${f.key}:_`, '', quote(f.text).replace(/^/gm, '  '), '');
    else L.push(`- _${f.key}:_ “${f.text}”`);
  }
  const sets = [...i.use.sets];
  if (sets.length) L.push(`- _Sets:_ ${sets.map((f) => `${factLine(f)} → ${(READERS[f] ?? []).filter((r) => r.id !== i.id).map((r) => refLink(fl, r)).join(', ') || '_nothing reads it_'}`).join('; ')}`);
  const reads = [...i.use.reads];
  if (reads.length) L.push(`- _Reads:_ ${reads.map((f) => `${factLine(f)}${SETTERS[f] ? ` (from ${SETTERS[f].filter((r) => r.id !== i.id).map((r) => refLink(fl, r)).join(', ')})` : ''}`).join('; ')}`);
  L.push('');
  return L;
}

function tableEsc(s: string) {
  return s.replace(/\|/g, '\\|').replace(/\n+/g, ' ');
}
function compactTable(items: Item[], kind: string, cols: string[]): string[] {
  const L = [`| ID | ${cols.join(' | ')} |`, `|---|${cols.map(() => '---').join('|')}|`];
  for (const i of items) L.push(`| \`${kind}:${i.id}\` | ${cols.map((c) => tableEsc(i.fields.filter((f) => f.key === c || f.key.startsWith(c + '[')).map((f) => (f.isCond ? `when ${f.text}` : f.text)).join(' / ') || '')).join(' | ')} |`);
  return [...L, ''];
}

// thread order: story beats by window, then follow-ups
function threadScenes(t: string) {
  const beats = SCENES.filter((s) => s.thread === t && s.kind === 'story').sort((a, b) => BEAT_NO[a.id] - BEAT_NO[b.id]);
  const rest = SCENES.filter((s) => s.thread === t && s.kind !== 'story');
  return [...beats, ...rest];
}

// where threads cross: a fact set in one thread and read in another
interface Cross {
  from: string;
  to: string;
  fact: string;
  setter: string;
  reader: string;
}
function crossings(): Cross[] {
  const out: Cross[] = [];
  for (const [f, setters] of Object.entries(SETTERS))
    for (const s of setters)
      for (const r of READERS[f] ?? [])
        if (s.thread && r.thread && s.thread !== r.thread) out.push({ from: s.thread, to: r.thread, fact: f, setter: s.kind === 'scene' ? s.id : `contract:${s.id}`, reader: r.kind === 'scene' ? r.id : `${r.kind}:${r.id}` });
  return out;
}
const threadName = (id: string) => THREADS.find((t) => t.id === id)?.name ?? id;

function mermaid(): string[] {
  const L = ['```mermaid', 'flowchart LR'];
  for (const t of THREADS.filter((t) => !['world', 'road'].includes(t.id))) {
    const sc = threadScenes(t.id);
    if (!sc.length) continue;
    L.push(`  subgraph ${t.id}["${t.name}"]`);
    sc.forEach((s, i) => {
      L.push(`    ${s.id}["${s.title.replace(/"/g, "'")}${s.def.window ? `<br/>wk ${s.def.window[0]}–${s.def.window[1]}` : ''}"]`);
      if (i) L.push(`    ${sc[i - 1].id} --> ${s.id}`);
    });
    L.push('  end');
  }
  const seen = new Set<string>();
  for (const c of crossings()) {
    if (!SCENE_BY_ID[c.setter] || !SCENE_BY_ID[c.reader]) continue;
    const k = `${c.setter}>${c.reader}`;
    if (seen.has(k)) continue;
    seen.add(k);
    L.push(`  ${c.setter} -. ${c.fact} .-> ${c.reader}`);
  }
  L.push('```');
  return L;
}

function crossTable(fl: Flavor): string[] {
  const rows = new Map<string, Cross[]>();
  for (const c of crossings()) {
    const k = `${c.from}>${c.to}`;
    (rows.get(k) ?? rows.set(k, []).get(k)!).push(c);
  }
  const L = ['| From thread | To thread | Through | Shared fact |', '|---|---|---|---|'];
  for (const [, cs] of [...rows].sort()) {
    const seen = new Set<string>();
    for (const c of cs) {
      const k = `${c.setter}|${c.reader}|${c.fact}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const nm = (x: string) => (SCENE_BY_ID[x] ? `${SCENE_BY_ID[x].title}` : x);
      L.push(`| ${threadName(c.from)} | ${threadName(c.to)} | ${nm(c.setter)} → ${nm(c.reader)} | \`${c.fact}\` |`);
    }
  }
  void fl;
  return [...L, ''];
}

function counts() {
  const choices = SCENES.reduce((n, s) => n + s.nodes.reduce((m, x) => m + x.choices.length, 0), 0);
  const nodes = SCENES.reduce((n, s) => n + s.nodes.length, 0);
  return { scenes: SCENES.length, nodes, choices, items: ALL_ITEMS.length, engine: LOOSE_ENGINE.length + LOOSE_SCENE_FILES.length, ui: LOOSE_UI.length };
}

interface Section {
  key: string;
  md: string;
}
function sections(fl: Flavor): Section[] {
  const S: Section[] = [];
  const c = counts();
  // thread map
  {
    const L = ['## Thread map', ''];
    L.push(`The game has ${SCENES.filter((s) => s.kind === 'story').length} Act I story beats across ${THREADS.length - 2} character threads, plus ${SCENES.filter((s) => s.kind !== 'story').length} follow-ups, world events and road decisions. Acts II to IV are planned in the story bible but have no text yet.`, '');
    if (fl === 'repo') L.push(...mermaid(), '');
    L.push('| Thread | Who | Scenes in order |', '|---|---|---|');
    for (const t of THREADS) {
      const sc = threadScenes(t.id);
      L.push(`| ${t.name} | ${t.who} | ${sc.map((s) => (s.kind === 'story' ? `${BEAT_NO[s.id]}. ${s.title}${s.def.window ? ` (wk ${s.def.window[0]}–${s.def.window[1]})` : ''}` : `${s.title} (${s.kind})`)).join(' → ')} |`);
    }
    L.push('', '### Where threads cross', '', 'A choice in one thread sets a fact that a scene or contract in another thread reads.', '', ...crossTable(fl));
    S.push({ key: 'map', md: L.join('\n') });
  }
  // threads
  for (const t of THREADS) {
    const L = [`## Thread: ${t.name}`, '', `${t.who}. ${t.blurb}`, ''];
    for (const s of threadScenes(t.id)) {
      L.push(...sceneMd(fl, s, '###'));
      // story contracts this scene adds, right after it
      const added = new Set(s.nodes.flatMap((n) => n.choices.flatMap((x) => x.contracts)));
      for (const k of added) if (CONTRACT_BY_ID[k] && CONTRACT_THREAD[k]?.scene === s.id) L.push(...itemMd(fl, { ...CONTRACT_BY_ID[k], title: `Story contract: ${contractTitle(k)}` }, '####', 'contract'));
    }
    if (t.id === 'hall') {
      L.push('### In the hall: Jory\'s remarks', '', 'One line about one week in four, in the week report.', '');
      L.push(...compactTable(CODEX.filter((i) => i.group === 'jory'), 'jory', ['text', 'when']));
    }
    S.push({ key: `thread-${t.id}`, md: L.join('\n') });
  }
  // planned acts
  S.push({
    key: 'planned',
    md: ['## Planned, not yet written', '', 'These are in the story bible (docs/STORY.md §6) as a draft outline. The game has no text for them yet.', '', '- **Act II: Default (Year 2).** The Crown chooses how to meet the Debt; the Council becomes the battlefield; the Fourteen split. Braid point: the Council vote.', '- **Act III: The War of Collection (Year 3).** Ostrander\'s blockades the river. Braid point: the river chain.', '- **Act IV: Settlement (Year 4).** The bank\'s debt notes are traded; endings: Free Realm, The Bought Crown, The Settlement, The House of Ledger & Blade, Ruin.', '- **Isbet Hobb** as a rival in her own right (Act II).', '- Whether Saint Oda\'s, the Fourteen and the Mudlarks gain Council seats (Act II).', ''].join('\n'),
  });
  // contracts
  {
    const L = ['## Contracts', '', 'Job templates on the board. A contract takes one of its titles at random. Story contracts also appear under the scene that adds them.', ''];
    for (const i of CONTRACTS) L.push(...itemMd(fl, { ...i, title: `Contract: ${contractTitle(i.id)}` }, '###', 'contract'));
    S.push({ key: 'contracts', md: L.join('\n') });
  }
  // codex
  {
    const L = ['## The Codex', '', 'Reference entries the guild unlocks through play. _source_ is the line saying how the guild learned it; _unlock_ is when.', ''];
    const cats = [...new Set(CODEX.filter((i) => i.group === 'codex').map((i) => i.fields.find((f) => f.key === 'category')?.text ?? ''))];
    for (const cat of cats) {
      L.push(`### ${cat}`, '');
      for (const i of CODEX.filter((x) => x.group === 'codex' && (x.fields.find((f) => f.key === 'category')?.text ?? '') === cat)) L.push(...itemMd(fl, { ...i, fields: i.fields.filter((f) => f.key !== 'category') }, '####', 'codex'));
    }
    S.push({ key: 'codex', md: L.join('\n') });
  }
  // street talk
  S.push({ key: 'crier', md: ['## Heard in Varrow (street talk)', '', 'One line a week in the week report.', '', ...compactTable(CODEX.filter((i) => i.group === 'crier'), 'crier', ['text', 'when'])].join('\n') });
  // dates
  {
    const L = ['## Dates', '', 'Dated checkpoints the player prepares for. _met_, _missed_ and _gone_ are the dispatch lines.', ''];
    for (const i of DATES) L.push(...itemMd(fl, i, '###', 'date'));
    S.push({ key: 'dates', md: L.join('\n') });
  }
  // tutorial
  {
    const L = ["## Guildmaster's Notes (tutorial objectives)", '', '_how_ is the instruction; _why_ is the reason given; _available_ is the message shown while it is locked.', ''];
    const chapters = [...new Set(TUTORIAL.map((i) => i.fields.find((f) => f.key === 'chapter')?.text ?? ''))];
    for (const ch of chapters) {
      L.push(`### ${ch}`, '');
      L.push(...compactTable(TUTORIAL.filter((i) => (i.fields.find((f) => f.key === 'chapter')?.text ?? '') === ch), 'tutorial', ['title', 'how', 'why', 'available']));
    }
    S.push({ key: 'tutorial', md: L.join('\n') });
  }
  // starts
  {
    const L = ['## Starts', '', 'Who paid for the charter (backers) and the state of Varrow on the day it was sealed (circumstances).', '', '### Backers', ''];
    L.push(...compactTable(STARTS.filter((i) => i.group === 'backers'), 'start', ['name', 'text']));
    L.push('### Circumstances', '');
    L.push(...compactTable(STARTS.filter((i) => i.group === 'circumstances'), 'start', ['title', 'text']));
    S.push({ key: 'starts', md: L.join('\n') });
  }
  // legends
  {
    const L = ['## Legends', '', 'Signature abilities and the lines the game writes about famous members. Epithets and feats are built in `people/legends.ts`; its loose lines are listed under Reports and warnings.', ''];
    L.push(...compactTable(LEGENDS, 'legend', ['name', 'text']));
    S.push({ key: 'legends', md: L.join('\n') });
  }
  // reference names
  {
    const L = ['## Names and descriptions', '', 'Factions, decrees, professions, traits, dangers, items and buildings: the short text on cards and sheets.', ''];
    for (const g of ['factions', 'decrees', 'professions', 'traits', 'tags', 'items', 'facilities']) {
      const its = REFERENCE.filter((i) => i.group === g);
      if (!its.length) continue;
      L.push(`### ${g[0].toUpperCase() + g.slice(1)}`, '');
      L.push('| ID | Text |', '|---|---|');
      for (const i of its) L.push(`| \`${g}:${i.id}\` | ${tableEsc(i.fields.filter((f) => !f.isCond).map((f) => `_${f.key}:_ ${f.text}`).join(' · '))} |`);
      L.push('');
    }
    S.push({ key: 'reference', md: L.join('\n') });
  }
  // loose engine lines
  {
    const L = ['## Reports, warnings and other lines from the rules', '', 'Text the rules write into the week report, dispatches, mission journals and warnings. IDs are `file#function.n`.', ''];
    const byFile = new Map<string, Loose[]>();
    for (const x of [...LOOSE_SCENE_FILES, ...LOOSE_ENGINE]) (byFile.get(x.file) ?? byFile.set(x.file, []).get(x.file)!).push(x);
    for (const [f, xs] of byFile) {
      L.push(`### ${FILE_SHORT(f)}`, '', '| ID | Line |', '|---|---|');
      for (const x of xs) L.push(`| \`${x.id}\` | ${tableEsc(x.text)} |`);
      L.push('');
    }
    S.push({ key: 'engine', md: L.join('\n') });
  }
  // UI
  {
    const L = ['## Interface text', '', 'Labels, help, confirmations and empty states in the screens and sheets (lines of three words or more). Where a sentence is split by bold text or a button inside it, it appears in pieces.', ''];
    const byFile = new Map<string, Loose[]>();
    for (const x of LOOSE_UI) (byFile.get(x.file) ?? byFile.set(x.file, []).get(x.file)!).push(x);
    for (const [f, xs] of byFile) {
      L.push(`### ${f.replace(/^src\//, '')}`, '', '| ID | Line |', '|---|---|');
      for (const x of xs) L.push(`| \`${x.id}\` | ${tableEsc(x.text)} |`);
      L.push('');
    }
    S.push({ key: 'ui', md: L.join('\n') });
  }
  // problems
  {
    const branchProblems = PROBLEMS.filter((p) => p.startsWith('Scene'));
    const L = ['## Possibly broken or orphaned', '', PROBLEMS.length ? 'Found while extracting. Each is worth a look, but some may be by design.' : 'Nothing found.', '', ...PROBLEMS.map((p) => `- ${p}`), ''];
    if (!branchProblems.length) L.push('Every choice in every scene leads to a node that exists, and every node has a choice leading to it.', '');
    L.push('### Facts that can never be true together', '', ...EXCLUSIVE_FACTS.map((g) => `- ${g.map(factLine).join(' ⟂ ')}`), '');
    S.push({ key: 'problems', md: L.join('\n') });
  }
  void c;
  return S;
}

function header(): string {
  const c = counts();
  return [
    '# Ledger & Blade: all game writing',
    '',
    '_Generated by `npm run story-export` from the game source. Do not edit this file by hand: edit the Claude Doc, or the game data, and re-run the export._',
    '',
    `${c.scenes} scenes (${c.nodes} conversation nodes, ${c.choices} choices), ${c.items} content items (contracts, Codex, street talk, Dates, tutorial, starts, Legends, names), ${c.engine} lines from the rules and ${c.ui} interface lines.`,
    '',
    '**How to read it.** Text in quotes or block quotes is what the player sees. `{member}` and other words in curly braces are filled in by the game. `[IF riot_fed] … [ELSE] … [END]` marks text that changes with the story; every version is shown. Each item carries its ID and source file, so an edit can be traced back to the code.',
    '',
    '**Facts** are the story\'s flags (`docs/STORY.md` §1, `data/facts.ts`). Under each scene, _Reads_ lists the facts it checks and who sets them, and _Leads to_ lists who reads the facts its choices set.',
    '',
    'For how the owner\'s comments in the Claude Doc come back into the code, see `docs/story/README.md`.',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Thread-map drawing for the Claude Doc (a widget module, generated)
// ---------------------------------------------------------------------------

function widget(): string {
  const lanes = THREADS.filter((t) => !['world', 'road'].includes(t.id));
  type Row = { key: string; thread: string; start: number; end: number; title: string; header?: boolean; follow?: boolean };
  const rows: Row[] = [];
  for (const t of lanes) {
    const sc = threadScenes(t.id);
    if (!sc.length) continue;
    rows.push({ key: `h-${t.id}`, thread: t.id, start: 0, end: 0, title: t.name, header: true });
    for (const s of sc) if (s.def.window) rows.push({ key: s.id, thread: t.id, start: s.def.window[0], end: s.def.window[1], title: s.title });
    const follows = sc.filter((s) => !s.def.window);
    if (follows.length) {
      const lines: string[] = [];
      let line = 'Follow-ups:';
      for (const f of follows.map((s) => s.title)) {
        const add = `${line === 'Follow-ups:' ? ' ' : ', '}${f}`;
        if ((line + add).length > 84) {
          lines.push(line + ',');
          line = f;
        } else line += add;
      }
      lines.push(line);
      lines.forEach((l, i) => rows.push({ key: `f-${t.id}${i ? `-${i + 1}` : ''}`, thread: t.id, start: 0, end: 0, title: l, follow: true }));
    }
  }
  const data = rows.filter((r) => !r.header && !r.follow).map((r) => `{key:'${r.key}', start:${r.start}, end:${r.end}}`).join(',');
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '’');
  let y = 96;
  const pos: Record<string, number> = {};
  for (const r of rows) {
    y += r.header ? 30 : r.follow && /-\d+$/.test(r.key) ? 16 : 22;
    pos[r.key] = y;
  }
  const H = y + 36;
  const labels = rows
    .map((r) => {
      const id = r.key.replace(/[^\w-]/g, '-').slice(0, 60);
      if (r.header) return `<text data-claude-text-id='${id}' x='24' y='${pos[r.key] + 4}' fontSize='13' fontWeight='600' fill={ink}>${esc(r.title)}</text>`;
      if (r.follow) {
        const t = r.title;
        return `<text data-claude-text-id='${id}' x='36' y='${pos[r.key] + 4}' fontSize='11' fill={quiet}>${esc(t)}</text>`;
      }
      return `<text data-claude-text-id='${id}' x='36' y='${pos[r.key] + 4}' fontSize='11.5' fill={ink}>${BEAT_NO[r.key]}. ${esc(r.title)}</text>`;
    })
    .join('');
  const ypos = Object.entries(pos)
    .filter(([k]) => SCENE_BY_ID[k])
    .map(([k, v]) => `['${k}', ${v}]`)
    .join(',');
  return (
    `export default () => <claude.Visualize data-claude-component='act1-thread-map' sources={{rows:{kind:'data', data:[${data}]}}}>{({rows, datum}) => { ` +
    `const x0 = 268, x1 = 728, lo = 1, hi = 26; const X = w => x0 + (w - lo) / (hi - lo) * (x1 - x0); const ys = [${ypos}]; const Y = k => (ys.find(p => p.at(0) === k) ?? [k, 0]).at(1); ` +
    `const ticks = [1, 5, 10, 15, 20, 26]; const edge = 'var(--cds-chart-axis)', grid = 'var(--cds-chart-grid)', accent = 'var(--cds-chart-categorical-1)', ink = 'var(--cds-text-primary)', quiet = 'var(--cds-text-secondary)'; ` +
    `return <svg viewBox='0 0 760 ${H}' role='img' aria-label='Act I runs as ten threads that braid at Quarter Day' fontSize='12'>` +
    `<text data-claude-text-id='title' x='24' y='30' fontSize='15' fontWeight='600' fill={ink}>Act I runs as ten threads that braid at Quarter Day</text>` +
    `<text data-claude-text-id='subtitle' x='24' y='50' fontSize='11.5' fill={quiet}>Each bar is the window of weeks a story beat can fire in. Follow-ups fire any week once their facts are set.</text>` +
    `<g data-claude-anchor='week-axis'>{ticks.map(w => <g key={w}><line x1={X(w)} x2={X(w)} y1='88' y2='${H - 20}' stroke={grid}/><text x={X(w)} y='80' textAnchor='middle' fontSize='11' fill={quiet}>wk {w}</text></g>)}<line x1={x0} x2={x1} y1='88' y2='88' stroke={edge} strokeWidth='1.25'/></g>` +
    `{rows.map(r => { const y = Y(r.key), braid = r.key === 'quarter_day'; return <g key={r.key} data-claude-anchor={\`beat-\${r.key}\`}><rect x={X(r.start) - 4} y={y - 6} width={Math.max(8, X(r.end) - X(r.start) + 8)} height='12' rx='6' fill={braid ? accent : edge} fillOpacity={braid ? 0.3 : 0.14} stroke={braid ? accent : edge} strokeWidth={braid ? 2 : 1} {...datum(r)}/></g>; })}` +
    labels +
    `</svg>; }}</claude.Visualize>;`
  );
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const repoMd = [header(), ...sections('repo').map((s) => s.md)].join('\n');
mkdirSync(join(ROOT, 'docs/story'), { recursive: true });
writeFileSync(join(ROOT, 'docs/story/all-writing.md'), repoMd);
if (process.argv.includes('--snapshot')) {
  const dir = join(ROOT, 'docs/story/doc-snapshot');
  mkdirSync(dir, { recursive: true });
  for (const s of sections('doc')) writeFileSync(join(dir, `${s.key}.md`), s.md);
  writeFileSync(join(dir, 'thread-map.widget.js'), widget());
}
const c = counts();
console.log(`docs/story/all-writing.md: ${c.scenes} scenes, ${c.nodes} nodes, ${c.choices} choices, ${c.items} items, ${c.engine} rules lines, ${c.ui} UI lines; ${PROBLEMS.length} things to look at; ${Math.round(repoMd.length / 1024)} KB`);
