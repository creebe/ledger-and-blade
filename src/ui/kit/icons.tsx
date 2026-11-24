// A small, consistent icon set: 24×24 line icons drawn with currentColor so
// they follow the theme and whatever semantic color their container sets.
import type { CSSProperties } from 'react';

const P: Record<string, string> = {
  // resources
  coin: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7a5 5 0 1 0 0 10a5 5 0 1 0 0-10',
  sack: 'M9 4h6l-1.5 3c3.5 1.5 6.5 5 6.5 9a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4c0-4 3-7.5 6.5-9z M10 7h4',
  eye: 'M2 12s3.5-6 10-6s10 6 10 6s-3.5 6-10 6S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
  seal: 'M12 3a6 6 0 1 0 0 12a6 6 0 1 0 0-12 M8.5 14l-2 7l5.5-3l5.5 3l-2-7 M12 6.5v5 M9.5 9h5',
  star: 'M12 3l2.7 5.6l6.1.8l-4.5 4.2l1.1 6.1L12 16.8l-5.4 2.9l1.1-6.1l-4.5-4.2l6.1-.8z',
  flame: 'M10 4a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0z M12 9v7',
  // approaches
  assault: 'M4 4l9 9 M4 4h4 M4 4v4 M20 4l-9 9 M20 4h-4 M20 4v4 M10.5 14.5l-3 3 M13.5 14.5l3 3 M6 19l1.5-1.5 M18 19l-1.5-1.5',
  stealth: 'M3 10c2.5 3 5.5 4.5 9 4.5s6.5-1.5 9-4.5 M7 13.5l-1.5 2.5 M12 14.5v3 M17 13.5l1.5 2.5',
  guile: 'M19 4c-6 1-10 5-12 12l-2 4 M19 4c0 5-3 9-8 10 M9 14l-2-2 M14 8l-2-2',
  endurance: 'M2 20l7-12l4 6l3-4l6 10z M9 8l2 3',
  arcana: 'M12 2v6 M12 16v6 M2 12h6 M16 12h6 M5 5l3.5 3.5 M15.5 15.5L19 19 M19 5l-3.5 3.5 M8.5 15.5L5 19',
  // slots
  weapon: 'M20 4L9 15 M20 4v4 M20 4h-4 M6.5 12.5l5 5 M9 15l-5 5',
  armor: 'M12 3l8 3v6c0 5-3.5 8-8 9c-4.5-1-8-4-8-9V6z',
  trinket: 'M8 3c0 3 1.5 5 4 6c2.5-1 4-3 4-6 M12 9a5.5 5.5 0 1 0 0 11a5.5 5.5 0 1 0 0-11 M12 12.5v4 M10 14.5h4',
  flask: 'M9 3h6 M10 3v5L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-10V3 M7 14h10',
  // professions
  vanguard: 'M12 3l7 3v5c0 5-3 8-7 10c-4-2-7-5-7-10V6z M12 3v18 M5 11h14',
  skirmisher: 'M4 20L18 6 M15 3l6 0l0 6 M15 3l3 3 M18 9l-3-3 M6 14l4 4',
  marksman: 'M5 3c6 2 9 7 9 9s-3 7-9 9 M5 3v18 M5 12h15 M17 9l3 3l-3 3',
  arcanist: 'M6 21L16 7 M16 7l1.5-4l2 2l-3.5 2 M14 3.5l.5 1 M20 9l-1 .5 M18 11.5l.5 1',
  chaplain: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7v10 M8 11h8',
  scout: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M15.5 8.5l-2 5l-5 2l2-5z',
  envoy: 'M4 5h16v10H10l-6 5z M8 9h8 M8 12h5',
  infiltrator: 'M7.5 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7 M11 12h10 M18 12v3 M21 12v2',
  // statuses / assignments
  road: 'M8 21L11 3 M16 21L13 3 M12 7v2 M12 12v2 M12 17v2',
  bandage: 'M4.5 13.5l9-9a3.5 3.5 0 0 1 5 5l-9 9a3.5 3.5 0 0 1-5-5z M9 9l6 6 M11.5 11.5h.01 M13 10h.01 M10 13h.01',
  rest: 'M3 18h18 M3 18V8 M21 18v-5a3 3 0 0 0-3-3H10v8 M6 12.5a1.5 1.5 0 1 0 0 .01 M14 3h4l-4 4h4',
  train: 'M3 12h18 M5 8v8 M8 6v12 M16 6v12 M19 8v8',
  ear: 'M8 9a4 4 0 0 1 8 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.5 M11 9a1 1 0 0 1 2 0c0 1-1.5 1.5-1.5 3',
  hammer: 'M14 4l6 6 M17 7l-11 11a1.5 1.5 0 0 1-2-2L15 5 M11 4l3 0l0 3',
  compass: 'M3 15l11-6l2 4l-11 6z M14 9l4-2l2 4l-4 2 M7 18l-1 3 M10 16.5l1 4.5',
  skull: 'M12 3a7 7 0 0 0-7 7c0 2.5 1 4 2.5 5v3h9v-3c1.5-1 2.5-2.5 2.5-5a7 7 0 0 0-7-7z M9.5 10.5h.01 M14.5 10.5h.01 M10 18v3 M14 18v3',
  heart: 'M12 20s-8-4.5-8-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 10-8 10z',
  bolt: 'M7 3h10 M7 21h10 M8 3c0 5 8 5 8 9s-8 4-8 9 M16 3c0 5-8 5-8 9s8 4 8 9',
  smile: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M8.5 14c1 1.5 2.2 2 3.5 2s2.5-.5 3.5-2 M9 9.5h.01 M15 9.5h.01',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  // tags: enemies
  beasts: 'M8 7a1.8 1.8 0 1 0 0 .01 M16 7a1.8 1.8 0 1 0 0 .01 M5 12a1.6 1.6 0 1 0 0 .01 M19 12a1.6 1.6 0 1 0 0 .01 M12 11c-3 0-5 3.5-5 6s2 3 5 3s5-.5 5-3s-2-6-5-6z',
  armored: 'M5 11a7 7 0 0 1 14 0v7H5z M5 14h14 M10 14v4 M14 14v4 M12 4v7',
  swarm: 'M12 8a3 4 0 1 0 0 8a3 4 0 1 0 0-8 M12 8V6 M9 6l1.5 2.5 M15 6l-1.5 2.5 M9 12H5 M15 12h4 M9.5 15l-3 2.5 M14.5 15l3 2.5',
  thugs: 'M16 3c3 0 5 2 5 5s-2.5 4-4.5 4L8 20.5L3.5 16L12 7.5C12 5 13.5 3 16 3z',
  soldiers: 'M6 21V3 M6 4h12l-3 4l3 4H6',
  guards: 'M6 21V7l2-2V3h8v2l2 2v14 M6 11h12 M10 21v-4h4v4',
  warded: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 6l5.2 9H6.8z',
  trolls: 'M4 20l2-9l4-4h4l4 4l2 9z M9 12h.01 M15 12h.01 M9.5 16h5',
  fireborn: 'M7 4l2 4 M17 4l-2 4 M12 8a6 6 0 1 0 0 12a6 6 0 1 0 0-12 M10 13h.01 M14 13h.01 M10 17h4',
  crowd: 'M8 8a2.5 2.5 0 1 0 0 .01 M16 8a2.5 2.5 0 1 0 0 .01 M3 20c0-4 2-6 5-6s5 2 5 6 M11 20c0-4 2-6 5-6s5 2 5 6',
  // tags: environment
  cold: 'M3 4h18 M6 4l1.5 7l1.5-7 M11 4l1 10l1-10 M16 4l1.5 6l1.5-6',
  swamp: 'M3 10c2-2 4-2 6 0s4 2 6 0s4-2 6 0 M3 15c2-2 4-2 6 0s4 2 6 0s4-2 6 0 M3 20c2-2 4-2 6 0s4 2 6 0s4-2 6 0',
  dark: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 3v18',
  night: 'M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5z M18 14l.8 1.7l1.7.8l-1.7.8L18 19l-.8-1.7l-1.7-.8l1.7-.8z M6 15l.6 1.4l1.4.6l-1.4.6L6 19l-.6-1.4L4 17l1.4-.6z',
  urban: 'M3 21V10l5-4l5 4v11 M13 21V6l4-3l4 3v15 M7 21v-4h2v4 M17 10h.01 M17 14h.01',
  rough: 'M2 20l5-9l3 4l4-8l8 13z',
  open_road: 'M4 21l6-18 M20 21l-6-18 M12 5v2 M12 10v3 M12 16v4',
  plague: 'M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z M10 14h4 M12 12v4',
  // factions
  exchequer: 'M3 18h18 M4 18L3 8l5 4l4-7l4 7l5-4l-1 10',
  weighhouse: 'M12 3v18 M8 21h8 M4 7h16 M4 7l-2 6a2.5 2.5 0 0 0 5 0z M20 7l-2 6a2.5 2.5 0 0 0 5 0z',
  ostranders: 'M3 21h18 M4 10h16 M12 3l9 5H3z M6 10v8 M10 10v8 M14 10v8 M18 10v8',
  lowertown: 'M12 3v10a4 4 0 1 1-4 4 M9 3h6',
  hobbs: 'M3 12a9 9 0 0 1 18 0z M12 12v7a2 2 0 0 1-4 0 M12 3v-1',
  oda: 'M12 3v18 M6 9h12 M8 21h8',
  fourteen: 'M5 21V8h2V5h2v3h2V5h2v3h2V5h2v3h2v13z M10 21v-5h4v5',
  mudlarks: 'M12 3a2 2 0 1 0 0 4a2 2 0 1 0 0-4 M12 7v14 M8 11h8 M4 14a8 8 0 0 0 16 0',
  ninth: 'M6 21V3 M6 4h12v8H6 M9 6.5l2 1.5l-2 1.5 M13 6.5l2 1.5l-2 1.5',
  assay: 'M9 3h6 M10 3v6l-5 10a1.5 1.5 0 0 0 1.3 2h11.4a1.5 1.5 0 0 0 1.3-2l-5-10V3 M7.5 15h9',
  // navigation & misc
  hall: 'M3 11l9-7l9 7 M5 10v10h14V10 M10 20v-6h4v6',
  scroll: 'M6 3h8l4 4v14H6z M14 3v4h4 M9 11h6 M9 14.5h6 M9 18h4',
  people: 'M9 4.5a3 3 0 1 0 0 6a3 3 0 1 0 0-6 M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20 M16.5 6a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5 M16.5 13.5a4.5 4.5 0 0 1 4.5 4.5V20',
  anvil: 'M3 7h13a5 5 0 0 1-5 5v3h4v3H5v-3h4v-3 M16 7h5l-2 3',
  realm: 'M4 21V9l4-3l4 3l4-3l4 3v12 M4 13h16 M10 21v-4h4v4',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 7v5l3 3',
  warn: 'M12 3l10 18H2z M12 10v5 M12 18h.01',
  check: 'M4 12l5 5L20 6',
  book: 'M4 5a2 2 0 0 1 2-2h5v16H6a2 2 0 0 0-2 2z M20 5a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 1 2 2z M4 5v16 M20 5v16',
  x: 'M6 6l12 12 M18 6L6 18',
  info: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M12 11v6 M12 7.5h.01',
  gear: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  chest: 'M3 9h18v11H3z M3 9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4 M3 13h18 M11 12h2v3h-2z',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  chevron: 'M9 6l6 6l-6 6',
  quest: 'M7 3h10v18l-5-4l-5 4z',
  // added in v0.11: one meaning per drawing
  fame: 'M8 20c-3-3-4-7-2-12 M16 20c3-3 4-7 2-12 M6 12l-2-1 M6.5 15.5l-2 0 M18 12l2-1 M17.5 15.5l2 0 M7 8.5l-1.5-1.5 M17 8.5l1.5-1.5',
  guard: 'M12 3l7 3v5c0 5-3 8-7 10c-4-2-7-5-7-10V6z M9 12l2 2l4-4',
  bricks: 'M3 8h18v12H3z M3 14h18 M9 8v6 M15 14v6',
  hide: 'M6 3l3 2h6l3-2l2 4l-2 3v8l-3 3H9l-3-3v-8L4 7z',
  notes: 'M9 6h11 M9 12h11 M9 18h11 M4 6l1 1l2-2 M4 12l1 1l2-2 M4 18l1 1l2-2',
  calendar: 'M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5',
  magnifier: 'M10 4a6 6 0 1 0 0 12a6 6 0 1 0 0-12 M14.5 14.5L20 20',
  crate: 'M4 7l8-4l8 4v10l-8 4l-8-4z M4 7l8 4l8-4 M12 11v10',
  map: 'M3 6l6-2l6 2l6-2v14l-6 2l-6-2l-6 2z M9 4v14 M15 6v14',
  mask: 'M3 8c3-2 15-2 18 0c0 6-4 9-9 9s-9-3-9-9z M7.5 11h3 M13.5 11h3',
  talk: 'M12 4c5 0 9 3 9 7s-4 7-9 7c-1.5 0-3-.3-4.2-.8L4 19l1.2-3.5C4.4 14.3 3 12.8 3 11c0-4 4-7 9-7z M8 11h.01 M12 11h.01 M16 11h.01',
  exit: 'M10 4H5v16h5 M14 8l4 4l-4 4 M18 12H9',
  arrears: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18 M11 3.2l2.5 6.3l-3 3l2.5 8.3',
  date: 'M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5 M12 12.5l1.2 2.4l2.6.4l-1.9 1.8l.5 2.6l-2.4-1.3l-2.4 1.3l.5-2.6l-1.9-1.8l2.6-.4z',
  lamp: 'M9 21h6 M10 18h4 M12 3a6 6 0 0 0-3.5 10.9c.9.7 1.5 1.6 1.5 2.6V18h4v-1.5c0-1 .6-1.9 1.5-2.6A6 6 0 0 0 12 3z',
  // elements
  fire: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5c0 2 1 3 2 3c0-3-1-5.5.5-8z',
  frost: 'M12 2v20 M3.3 7l17.4 10 M3.3 17L20.7 7 M9 4l3 2l3-2 M9 20l3-2l3 2',
  storm: 'M13 2L4 14h7l-1 8l9-12h-7z',
  radiant: 'M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  shadow: 'M15 3.5A8.5 8.5 0 1 0 20.5 15A7 7 0 0 1 15 3.5z',
};

export type IconName = keyof typeof P;

export function Icon({ name, size = 18, className, style, title }: { name: string; size?: number; className?: string; style?: CSSProperties; title?: string }) {
  const d = P[name] ?? P.info;
  return (
    <svg
      className={`icon ic-${name} ${className ?? ''}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}

