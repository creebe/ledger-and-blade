import { useEffect, useRef } from 'react';
import { current, isDraft } from 'immer';
import { APPROACH_INFO, PROFESSIONS, canChoose, checkDetail, dateLabel, resolveEvent, type GameEvent } from '../../engine';
import { useStore } from '../../store';
import { pct, weeks } from '../kit/format';
import { Icon } from '../kit/icons';
import { Portrait, ap } from '../kit/visual';

type Exchange = NonNullable<GameEvent['transcript']>[number];
type Choice = GameEvent['choices'][number];
type Effects = Choice['effects'];

/** What a choice takes from the guild's own stores, as plain parts ("60 crowns", "5 supplies"). */
function costParts(e: Effects | undefined): string[] {
  if (!e) return [];
  const out: string[] = [];
  const take = (n: number | undefined, what: string) => n && n < 0 && out.push(`${-n} ${what}`);
  take(e.crowns, 'crowns');
  take(e.supplies, 'supplies');
  take(e.mission?.supplies, 'supplies');
  take(e.intel, 'Intel');
  take(e.influence, 'Influence');
  take(e.renown, 'Renown');
  const goods = Object.values(e.goods ?? {}).some((n) => (n ?? 0) < 0);
  if (goods) out.push('goods from the stores');
  return out;
}

function ExchangeLines({ t, last }: { t: Exchange; last?: boolean }) {
  return (
    <div className={`exchange ${last ? 'exchange-last' : ''}`}>
      <p className="you">
        <Icon name="chevron" size={12} /> {t.choice}
      </p>
      {t.reply && <p className={`reply ${last ? '' : 'small'}`}>{t.reply}</p>}
    </div>
  );
}

/**
 * A scene waiting for the player's choice. With `done`, the scene has just
 * ended: its last exchange is shown under the text the player answered, and
 * it stays until they press Continue, so the ending is never lost.
 */
export function EventCard({ ev, done }: { ev: GameEvent; done?: boolean }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const setClosingEvent = useStore((s) => s.setClosingEvent);
  const endRef = useRef<HTMLDivElement>(null);
  const member = ev.memberId ? g.members.find((m) => m.id === ev.memberId) : undefined;
  const all = ev.transcript ?? [];
  // when the scene is over, the last exchange is its ending and goes below the text it answered
  const transcript = done ? all.slice(0, -1) : all;
  const ending = done ? all[all.length - 1] : undefined;
  const mission = ev.missionId ? g.missions.find((m) => m.id === ev.missionId) ?? g.history.find((m) => m.id === ev.missionId) : undefined;
  useEffect(() => {
    if (done) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [done, ev.uid]);

  // every spend asks first: a choice that costs anything opens the usual confirmation
  const pick = (i: number) => {
    const c = ev.choices[i];
    const cost = costParts(c.effects);
    const failCost = c.check ? costParts(c.failEffects) : [];
    if (!cost.length && !failCost.length) return choose(i);
    const lines = [c.detail, failCost.length && !cost.length ? `If the check fails, it costs ${failCost.join(' and ')}.` : ''].filter(Boolean) as string[];
    useStore.getState().confirm({
      title: `${c.label.replace(/[.!?…]+$/, '')}?`,
      body: lines.length ? lines : ['This choice spends from the guild.'],
      cost: cost.length ? `Costs ${cost.join(' and ')}${c.effects.crowns && c.effects.crowns < 0 ? ` · treasury ${g.crowns} → ${g.crowns + c.effects.crowns}` : ''}` : undefined,
      confirmLabel: c.label.length <= 22 ? c.label : 'Go ahead',
      onConfirm: () => choose(i),
    });
  };

  const choose = (i: number) => {
    let finished: GameEvent | undefined;
    act((d) => {
      const live = d.pendingEvents.find((e) => e.uid === ev.uid);
      const err = resolveEvent(d, ev.uid, i);
      if (!err && live && !d.pendingEvents.some((e) => e.uid === ev.uid)) finished = isDraft(live) ? current(live) : live;
      return err;
    });
    // keep the ending on screen when it has something to read
    if (finished?.transcript?.at(-1)?.reply) setClosingEvent(finished);
  };

  return (
    <div className="event-backdrop">
      <div className="event-card" role="dialog" aria-modal="true" aria-labelledby={`ev-title-${ev.uid}`}>
        <p className="tiny muted">
          {dateLabel(g.week)}
          {member ? ` · ${member.name}, ${PROFESSIONS[member.profession].name}` : ''}
        </p>
        <h2 id={`ev-title-${ev.uid}`}>{ev.title}</h2>
        {mission && (
          <div className="field-head">
            <span className="squad-faces">
              {mission.memberIds
                .map((id) => g.members.find((x) => x.id === id))
                .filter(Boolean)
                .map((x) => (
                  <Portrait key={x!.id} m={x!} size={30} showStatus={false} />
                ))}
            </span>
            <span className="meta">
              <Icon name="road" size={14} />
              Squad {mission.number} · setting out for {mission.contract.region} · {weeks(mission.plannedWeeks)} away
            </span>
          </div>
        )}
        {transcript.length > 0 && (
          <div className="transcript">
            {transcript.map((t, i) => (
              <ExchangeLines key={i} t={t} />
            ))}
          </div>
        )}
        <div className={`event-node ${done ? 'event-node-answered' : ''}`} key={ev.node ?? 'root'}>
          {ev.speaker && <p className="speaker">{ev.speaker}</p>}
          {ev.text.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {ending ? (
          <div className="event-ending" ref={endRef}>
            <ExchangeLines t={ending} last />
            <button className="btn primary block event-continue" onClick={() => setClosingEvent(undefined)}>
              Continue
            </button>
          </div>
        ) : (
          <div className="choices" key={`c-${ev.node ?? 'root'}-${transcript.length}`}>
            {ev.choices.map((c, i) => {
              const blocked = canChoose(g, c);
              const chk = checkDetail(g, c, ev);
              const leadsOn = !!c.next;
              return (
                <button key={i} className={`choice ${leadsOn ? 'talk' : ''}`} disabled={!!blocked} onClick={() => pick(i)}>
                  <b className={leadsOn && !c.detail ? 'choice-talk' : undefined}>
                    {leadsOn && !c.detail && <Icon name="talk" size={14} />}
                    {c.label}
                  </b>
                  {c.detail && <span className="small">{c.detail}</span>}
                  {chk && (
                    <span className="small check">
                      <Icon name={c.check!.approach} size={14} style={{ color: ap(c.check!.approach) }} /> {APPROACH_INFO[c.check!.approach].name} check: <b>{pct(chk.chance)}</b>
                      {chk.who ? ` (${chk.who.split(' ')[0]} tries)` : mission ? '' : ' (no one at home to try: your people are away)'}
                    </span>
                  )}
                  {blocked && <span className="small bad">{blocked}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
