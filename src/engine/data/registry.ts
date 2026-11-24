// Every scene the game can show, in one place: story beats, world events, the
// wider cast's follow-ups, road encounters and scenes the engine queues for a
// particular member. Anything that looks scenes up by id uses this.
import { QUEUED_EVENTS } from './cast';
import { RANDOM_EVENTS, STORY_EVENTS, type EventDef } from './events';
import { ARRIVAL, FIELD_EVENTS } from './field';

const ALL_EVENTS: EventDef[] = [...STORY_EVENTS, ...RANDOM_EVENTS, ARRIVAL, ...FIELD_EVENTS, ...QUEUED_EVENTS];
export const EVENT_DEFS: Record<string, EventDef> = Object.fromEntries(ALL_EVENTS.map((d) => [d.id, d]));
export const STORY_IDS: Record<string, true> = Object.fromEntries(STORY_EVENTS.map((e) => [e.id, true]));
