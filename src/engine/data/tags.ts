import type { Approach, DamageType, Element, ProfessionId } from '../core/types';

export interface TagDef {
  id: string;
  name: string;
  kind: 'enemy' | 'env';
  icon: string;
  description: string;
  // multipliers on weapon power when attacking these enemies
  damage?: Partial<Record<DamageType | Element, number>>;
  // fractional change to phase difficulty for an approach (+0.3 = 30% harder)
  approach?: Partial<Record<Approach, number>>;
  // which approach penalties are negated by a counter item / profession
  counteredBy?: string[]; // item ids
  counterProfession?: ProfessionId;
  counteredApproaches?: Approach[];
  heavyArmorPenalty?: number; // extra stealth/endurance penalty per heavy/medium armor
  danger?: number; // multiplier on wounds
}

const list: TagDef[] = [
  // Enemies
  { id: 'armored', name: 'Armored', kind: 'enemy', icon: '⛨', description: 'Mail and plate. Slashing weapons struggle; blunt weapons crack them open.', damage: { slash: 0.6, blunt: 1.35, pierce: 0.9, storm: 1.2 }, danger: 1.1 },
  { id: 'beasts', name: 'Beasts', kind: 'enemy', icon: '🐺', description: "Wolves, boar or worse. Arrows and fire work well, and they can't be talked to.", damage: { pierce: 1.25, fire: 1.25 }, approach: { guile: 0.6 } },
  { id: 'swarm', name: 'Swarm', kind: 'enemy', icon: '🪲', description: 'Rats, carrion-beetles, many small things. Fire and blunt force; points are wasted.', damage: { blunt: 1.2, fire: 1.5, pierce: 0.65, slash: 0.9 }, approach: { guile: 0.6 }, danger: 1.1 },
  { id: 'thugs', name: 'Thugs', kind: 'enemy', icon: '🗡', description: 'Hired muscle. Cowardly, and easily bribed.', approach: { guile: -0.2 } },
  { id: 'soldiers', name: 'Soldiers', kind: 'enemy', icon: '⚑', description: 'Drilled sell-swords. Harder in a straight fight.', approach: { assault: 0.2 }, damage: { pierce: 1.1 }, danger: 1.2 },
  { id: 'guards', name: 'Watchful Guards', kind: 'enemy', icon: '👁', description: 'Alert sentries. Hard to sneak past, but they take bribes.', approach: { stealth: 0.25, guile: -0.1 } },
  { id: 'warded', name: 'Warded', kind: 'enemy', icon: '✧', description: 'Hedge-wizards with protective wards. Physical attacks are blunted; storm cracks wards.', damage: { slash: 0.75, pierce: 0.75, blunt: 0.75, storm: 1.5 }, approach: { arcana: 0.2 }, counteredBy: ['wardstone'], counteredApproaches: ['arcana'] },
  { id: 'trolls', name: 'Trolls', kind: 'enemy', icon: '🗿', description: 'Huge and regenerating. Only fire stops the healing; frost barely slows them.', damage: { fire: 1.6, frost: 0.7, slash: 0.85 }, approach: { guile: 0.4 }, danger: 1.5 },
  { id: 'fireborn', name: 'Fireborn', kind: 'enemy', icon: '🔥', description: 'Salamanders and drakelings. Immune to fire; frost is deadly to them.', damage: { fire: 0.25, frost: 1.6 }, approach: { guile: 0.5 }, danger: 1.3 },
  { id: 'crowd', name: 'Crowds', kind: 'enemy', icon: '👥', description: 'Angry citizens. Violence here costs reputation, and they are hard to sneak through.', approach: { assault: 0.15, stealth: -0.1 }, danger: 0.7 },
  // Environment
  { id: 'cold', name: 'Cold', kind: 'env', icon: '❄', description: 'Bitter cold. Endurance suffers without furs.', approach: { endurance: 0.35 }, damage: { frost: 0.7 }, counteredBy: ['fur_cloak'], counteredApproaches: ['endurance'] },
  { id: 'swamp', name: 'Swamp', kind: 'env', icon: '≋', description: 'Mud and marsh-fever. Armor drags; remedies help.', approach: { endurance: 0.25 }, heavyArmorPenalty: 2, counteredBy: ['remedies'], counteredApproaches: ['endurance'] },
  { id: 'dark', name: 'Dark', kind: 'env', icon: '●', description: 'Underground or lightless. Fighting blind is hard, though hiding is easy.', approach: { assault: 0.25, stealth: -0.15 }, counteredBy: ['lantern'], counteredApproaches: ['assault'] },
  { id: 'night', name: 'Night', kind: 'env', icon: '☾', description: 'Night work. Stealth is easier, and fighting is harder without light.', approach: { assault: 0.15, stealth: -0.2 }, counteredBy: ['lantern'], counteredApproaches: ['assault'] },
  { id: 'urban', name: 'Urban', kind: 'env', icon: '⌂', description: "Varrow's streets. Plenty of people to talk to, and plenty of witnesses.", approach: { guile: -0.1 } },
  { id: 'rough', name: 'Rough Country', kind: 'env', icon: '⛰', description: 'Cliffs, scree and broken ground.', approach: { endurance: 0.25 }, counteredBy: ['climbing_kit'], counteredApproaches: ['endurance'] },
  { id: 'open_road', name: 'Open Road', kind: 'env', icon: '═', description: 'Open country. Nowhere to hide.', approach: { stealth: 0.2 } },
  { id: 'plague', name: 'Sickness', kind: 'env', icon: '☣', description: 'Fever in the air. A Chaplain or remedies keep the squad on its feet.', approach: { endurance: 0.3 }, counteredBy: ['remedies'], counterProfession: 'chaplain', counteredApproaches: ['endurance'], danger: 1.2 },
];

export const TAGS: Record<string, TagDef> = Object.fromEntries(list.map((t) => [t.id, t]));
