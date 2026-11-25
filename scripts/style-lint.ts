// Style check for player-facing writing. Flags habits that make text read as
// machine-written. Advisory: run `npm run style` and read the report.
import { readFileSync } from 'node:fs';

const FILES = [
  'src/engine/data/events.ts',
  'src/engine/data/cast.ts',
  'src/engine/data/facts.ts',
  'src/engine/data/factions.ts',
  'src/engine/data/field.ts',
  'src/engine/data/codex.ts',
  'src/engine/data/contracts.ts',
  'src/engine/data/tutorial.ts',
  'src/engine/data/dates.ts',
  'src/engine/missions/narrative.ts',
  'src/engine/expeditions/data/lines.ts',
  'src/engine/expeditions/data/lines-sites.ts',
  'src/engine/expeditions/data/content.ts',
  'src/engine/people/legends.ts',
  'src/engine/rivals/war.ts',
  'src/engine/data/starts.ts',
];

const RULES: { id: string; why: string; re: RegExp }[] = [
  { id: 'triad', why: 'Lists of exactly three for rhythm. Vary: one, two, or four, or no list.', re: /\b[\w'-]+(?: [\w'-]+){0,2}, [\w'-]+(?: [\w'-]+){0,2},? and [\w'-]+(?: [\w'-]+){0,2}[.!?]/ },
  { id: 'subtext-tag', why: 'Narration explaining the subtext of a line. Let the line do it.', re: /means something else|which is worse|doesn't blink|without blinking|and means it|she means|he means/i },
  { id: 'manner-adverb', why: 'Stock manner adverbs on dialogue tags.', re: /\b(pleasantly|thinly|kindly|dryly|wryly|softly|quietly)\b/i },
  { id: 'simile', why: 'Similes. Keep one in a scene at most, and make it specific to the speaker.', re: /\blike a\b|\bas if\b|\bas though\b/i },
  { id: 'aphorism', why: 'Closing on a neat moral or maxim.', re: /\b(always|never|only|every|nothing|everyone|no one)\b[^.]{0,40}\.\s*$|is the only [a-z]+ that/i },
  { id: 'not-but', why: '"Not X, but Y" / "X, not Y" reversals.', re: /\bnot [^.,]{1,30}, but\b|, not [a-z]+\b[.]/i },
  { id: 'pause-beat', why: 'Stage-direction pauses used for drama.', re: /\bA pause\b|\ba beat\b|for a long moment|for a moment/i },
  { id: 'quotable', why: 'Dialogue that sounds like a line written to be quoted.', re: /"[^"]{0,60}\b(the ledger|the realm|the bank)\b[^"]{0,40}(always|never|wins|remembers)/i },
  {
    id: 'fragments',
    why: 'Clipped fragments in a row for punch. Use complete sentences of varied length.',
    // two or more consecutive sentences of three words or fewer
    re: {
      test: (s: string) => {
        // cost and effect summaries are meant to be terse
        if (/[+−-]\d|\d+%|\bcheck\b|Unlocks|standing/i.test(s)) return false;
        const sentences = s.replace(/^['"`]|['"`]$/g, '').split(/(?<=[.!?])\s+/);
        let run = 0;
        for (const x of sentences) {
          run = x.trim().split(/\s+/).length <= 3 ? run + 1 : 0;
          if (run >= 2) return true;
        }
        return false;
      },
    } as unknown as RegExp,
  },
];

let total = 0;
const byRule: Record<string, number> = {};
const samples: Record<string, string[]> = {};
for (const f of FILES) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // only look at string literals
    const strings = line.match(/(['"`])(?:\\.|(?!\1).){12,}\1/g) ?? [];
    for (const s of strings) {
      for (const r of RULES) {
        if (r.re.test(s)) {
          total++;
          byRule[r.id] = (byRule[r.id] ?? 0) + 1;
          (samples[r.id] ??= []).length < (process.env.ALL ? 999 : 4) && samples[r.id].push(`${f}:${i + 1}  ${s.slice(1, 110)}`);
        }
      }
    }
  });
}
console.log(`Style flags: ${total}\n`);
for (const r of RULES) {
  if (!byRule[r.id]) continue;
  console.log(`${r.id} ×${byRule[r.id]}: ${r.why}`);
  for (const s of samples[r.id]) console.log(`   ${s}`);
}
