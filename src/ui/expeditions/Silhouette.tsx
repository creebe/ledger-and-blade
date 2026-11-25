// Simple illustrated silhouettes for the six Professions and the monsters of
// Old Pellam. One shape language: flat fills in the ink color on a paper tile,
// with details cut out in the tile color, so they read in both themes.
import type { MonsterId, ProfessionId } from '../../engine';

const CUT = 'var(--paper-2)';

// a standing figure: head, torso and legs, shared by most Professions
const Figure = ({ hood }: { hood?: boolean }) => (
  <>
    {hood ? <path d="M16.5 13 a5.5 6.5 0 0 1 11 0 v2.5 h-11z" /> : <circle cx="22" cy="9.5" r="4.6" />}
    <path d="M16 16 h12 l2.2 14.5 h-16.4z" />
    <path d="M17 30 h4.2 v14 h-4.2z M22.8 30 h4.2 v14 h-4.2z" />
  </>
);

const PROF: Partial<Record<ProfessionId, JSX.Element>> = {
  vanguard: (
    <>
      <Figure />
      <path d="M16.6 8.5 a5.4 5.4 0 0 1 10.8 0 v1.6 h-10.8z" />
      <path d="M13.5 30 L6 5.5 l2.2-.7 l7.8 24.4z" />
      <path d="M27 15 h13 v9.5 c0 8.5-3.6 12.6-6.5 14.5 c-2.9-1.9-6.5-6-6.5-14.5z" />
      <path d="M33.5 18 v18 M29 24 h9" stroke={CUT} strokeWidth="1.6" fill="none" />
    </>
  ),
  skirmisher: (
    <>
      <Figure />
      <path d="M7 45 L39 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M41.5 3 l-7.5 3.2 l4.4 4.3z" />
      <path d="M28 20 l7 5 l-1.4 1.8 l-6.6-3.8z" />
    </>
  ),
  marksman: (
    <>
      <Figure hood />
      <path d="M33 5 q11 17 0 34" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M33 5 L30 22 L33 39" stroke="currentColor" strokeWidth="0.9" fill="none" />
      <path d="M25 21.2 h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M44 21.2 l-4 -2.4 v4.8z" />
      <path d="M27 19 l4 1.2 v2 l-4 0.5z" />
    </>
  ),
  arcanist: (
    <>
      <path d="M22 2 l5.6 10.5 h-11.2z" />
      <circle cx="22" cy="12.5" r="3.6" />
      <path d="M15.5 16 h13 l5.5 28 h-24z" />
      <path d="M22 16 v28" stroke={CUT} strokeWidth="1.1" />
      <path d="M30 24 L39.5 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M40.5 3.5 l1.3 3.4 l3.4 1.3 l-3.4 1.3 l-1.3 3.4 l-1.3-3.4 l-3.4-1.3 l3.4-1.3z" />
    </>
  ),
  chaplain: (
    <>
      <path d="M15.8 14 a6.2 7.5 0 0 1 12.4 0 v3 h-12.4z" />
      <path d="M15.5 17 h13 l4.5 27 h-22z" />
      <path d="M18.5 24 h7 M22 20.5 v8" stroke={CUT} strokeWidth="1.6" />
      <path d="M29.5 22 L35 33" stroke="currentColor" strokeWidth="1" />
      <path d="M31 34 h8 l-1 5 a3 3 0 0 1-6 0z" />
      <path d="M36 31 q2-3 0-6 q-2-3 1-6" stroke="currentColor" strokeWidth="1" fill="none" />
    </>
  ),
  scout: (
    <>
      <path d="M14.5 15 a5.2 6 0 0 1 10.4 0 v2 h-10.4z" />
      <path d="M13 18 h11.5 l6 12.5 h-15z" />
      <path d="M15.5 30.5 l-4 13.5 h4.4 l3.6-11.5z M24 30.5 l7 7.5 l-2.2 6 h4.4 l2.4-6.6 l-6.6-8.4z" />
      <path d="M26 24 l6.5 1 l7.5-4.5 l.8 1.4 l-7 5.2 l-7.8.2z" />
    </>
  ),
};

const MON: Partial<Record<MonsterId, JSX.Element>> = {
  rats: (
    <>
      <ellipse cx="18" cy="33" rx="10" ry="6" />
      <path d="M26 29.5 l10 3.5 l-10 3.5z" />
      <circle cx="24.5" cy="27.8" r="2.4" />
      <path d="M8.5 34 q-6 2-3.5 8" stroke="currentColor" strokeWidth="1.6" fill="none" />
      <ellipse cx="33" cy="17" rx="7" ry="4.2" />
      <path d="M38.5 14.5 l7 2.5 l-7 2.5z" />
      <circle cx="37.6" cy="12.8" r="1.8" />
      <path d="M26.3 17.5 q-4 1-2.5 6" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="31" cy="32.5" r="0.9" fill={CUT} />
    </>
  ),
  moths: (
    <>
      <path d="M24 22 C15 6 4 9 5 19 C6 27 16 28 24 24 C32 28 42 27 43 19 C44 9 33 6 24 22z" />
      <path d="M24 25 C18 30 10 34 13 40 C16 44 22 36 24 30 C26 36 32 44 35 40 C38 34 30 30 24 25z" />
      <ellipse cx="24" cy="25" rx="2.2" ry="8" fill={CUT} />
      <ellipse cx="24" cy="25" rx="1.4" ry="7" />
      <path d="M23 17 q-3-7-7-9 M25 17 q3-7 7-9" stroke="currentColor" strokeWidth="1.1" fill="none" />
    </>
  ),
  grubber: (
    <>
      <circle cx="15" cy="15" r="4.4" />
      <path d="M11 20 q8-6 16 1.5 l2.5 13 h-17z" />
      <path d="M13 34.5 l-2 9.5 h4.2 l1.8-9.5z M21.5 34.5 l2.5 9.5 h4.2 l-2.5-9.5z" />
      <path d="M27 28 L36 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M29 7 q7-4 14 1.5 l-1 1.4 q-6-3.4-12 0z" />
    </>
  ),
  eel: (
    <>
      <path d="M5 41 C14 41 13 28 22 28 S31 15 38 14" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" fill="none" />
      <path d="M36 10 q8-2 10 4 q-3 4-9 3z" />
      <circle cx="40.5" cy="12.6" r="0.9" fill={CUT} />
      <path d="M4 46 q4-2 8 0 t8 0 t8 0 t8 0 t8 0" stroke="currentColor" strokeWidth="1.2" fill="none" />
    </>
  ),
  spider: (
    <>
      <ellipse cx="24" cy="29" rx="8" ry="7" />
      <circle cx="24" cy="19" r="4.4" />
      <path
        d="M18 25 L8 15 L3 22 M18 28 L6 26 L2 33 M18 31 L8 36 L5 44 M19 34 L13 41 L13 47 M30 25 L40 15 L45 22 M30 28 L42 26 L46 33 M30 31 L40 36 L43 44 M29 34 L35 41 L35 47"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="22.4" cy="18.4" r="0.9" fill={CUT} />
      <circle cx="25.6" cy="18.4" r="0.9" fill={CUT} />
    </>
  ),
  hog: (
    <>
      <ellipse cx="21" cy="27" rx="15" ry="9.5" />
      <path d="M32 20 l11 4 l1.5 7 l-11 2z" />
      <path d="M33 19 l2-6 l3 6.5z" />
      <path d="M41 29 q4 0 4-5" stroke={CUT} strokeWidth="1.3" fill="none" />
      <path d="M10 34 h4.5 v10 h-4.5z M17 35 h4.5 v9 h-4.5z M25 35 h4.5 v9 h-4.5z M31 33 h4.5 v11 h-4.5z" />
      <path d="M6.5 24 q-4-1-3 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  crab: (
    <>
      <ellipse cx="24" cy="31" rx="12.5" ry="7.5" />
      <path d="M14 27 L9 19 M34 27 L39 19" stroke="currentColor" strokeWidth="2.4" />
      <path d="M3 16 q4-9 11-4 l-3 3 q-3-2-5 2.5z M45 16 q-4-9-11-4 l3 3 q3-2 5 2.5z" />
      <path d="M13 35 L6 42 M15 37 L11 45 M35 35 L42 42 M33 37 L37 45" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="20" cy="24" r="1.8" />
      <circle cx="28" cy="24" r="1.8" />
    </>
  ),
  seep: (
    <>
      <path d="M6 40 C4 31 12 25 18 27 C21 17 33 17 33 26 C41 25 45 35 41 40 C35 43 13 43 6 40z" />
      <circle cx="14" cy="21" r="2" />
      <circle cx="38" cy="20" r="1.6" />
      <circle cx="26" cy="13" r="1.4" />
      <path d="M11 34 q3-3 6 0 M27 31 q3-3 6 0" stroke={CUT} strokeWidth="1.3" fill="none" />
    </>
  ),
  engine: (
    <>
      <rect x="17" y="4" width="14" height="9" rx="1.5" />
      <rect x="20" y="7" width="8" height="2.4" fill={CUT} />
      <rect x="13" y="14" width="22" height="17" rx="2" />
      <circle cx="24" cy="22.5" r="3.6" fill={CUT} />
      <path d="M15 31 h6 v13 h-6z M27 31 h6 v13 h-6z" />
      <path d="M35 17 L43 26 L40 33" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinejoin="round" />
      <path d="M36.5 34 l3.5-1 l3.5 1 l-1 3.5 l-1.5-2 l-2 0 l-1.5 2z" />
      <path d="M13 17 L6 26" stroke="currentColor" strokeWidth="2.6" />
    </>
  ),
  kiln: (
    <>
      <path d="M30 2 h6 v10 h-6z" />
      <path d="M8 18 q0-8 8-8 h16 q8 0 8 8 v20 h-32z" />
      <path d="M17 38 a7 7 0 0 1 14 0z" style={{ fill: 'var(--el-fire)' }} />
      <path d="M17 38 v-7 a7 7 0 0 1 14 0 v7z" fill={CUT} opacity="0.35" />
      <circle cx="17" cy="20" r="2" fill={CUT} />
      <circle cx="31" cy="20" r="2" fill={CUT} />
      <path d="M10 38 h7 v8 h-7z M31 38 h7 v8 h-7z" />
      <path d="M8 24 L2 32 M40 24 L46 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

// Professions and monsters without a drawing of their own yet borrow one.
const PROF_FALLBACK: Partial<Record<ProfessionId, JSX.Element>> = {
  envoy: <Figure />,
  infiltrator: <Figure hood />,
};
const MON_FALLBACK: Partial<Record<MonsterId, MonsterId>> = {
  cave_crab: 'crab',
  marsh_hog: 'hog',
  wolf: 'hog',
  troll: 'engine',
  salamander: 'eel',
  pike: 'eel',
};

export function ProfSilhouette({ prof, size = 44, state }: { prof: ProfessionId; size?: number; state?: 'ok' | 'spent' | 'down' | 'dead' | 'out' }) {
  return (
    <span className={`x-sil x-sil-${state ?? 'ok'}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size - 6} height={size - 6} fill="currentColor">
        {PROF[prof] ?? PROF_FALLBACK[prof] ?? <Figure />}
      </svg>
    </span>
  );
}

export function MonsterSilhouette({ monster, size = 40, dead }: { monster: MonsterId; size?: number; dead?: boolean }) {
  return (
    <span className={`x-sil x-sil-foe ${dead ? 'x-sil-dead' : ''}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size - 6} height={size - 6} fill="currentColor">
        {MON[monster] ?? MON[MON_FALLBACK[monster] ?? 'grubber']}
      </svg>
    </span>
  );
}
