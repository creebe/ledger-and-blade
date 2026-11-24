import { APPROACH_INFO, PROFESSIONS, canChoose, checkDetail, dateLabel, resolveEvent, type GameEvent } from '../../engine';
import { useStore } from '../../store';
import { pct } from '../kit/format';
import { Icon } from '../kit/icons';
import { PhaseStrip, Portrait, ap } from '../kit/visual';

export function EventCard({ ev }: { ev: GameEvent }) {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const member = ev.memberId ? g.members.find((m) => m.id === ev.memberId) : undefined;
  const transcript = ev.transcript ?? [];
  const mission = ev.missionId ? g.missions.find((m) => m.id === ev.missionId) : undefined;
  return (
    <div className="event-backdrop">
      <div className="event-card" role="dialog" aria-modal="true">
        <p className="tiny muted">
          {dateLabel(g.week)}
          {member ? ` · ${member.name}, ${PROFESSIONS[member.profession].name}` : ''}
        </p>
        <h2>{ev.title}</h2>
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
              {mission.contract.region} · arrives {mission.arriveWeek <= g.week ? 'this week' : `in ${mission.arriveWeek - g.week + 1} weeks`}
            </span>
            <PhaseStrip c={mission.contract} chosen={mission.approaches} />
          </div>
        )}
        {transcript.length > 0 && (
          <div className="transcript">
            {transcript.map((t, i) => (
              <div key={i} className="exchange">
                <p className="you">▸ {t.choice}</p>
                {t.reply && <p className="reply small">{t.reply}</p>}
              </div>
            ))}
          </div>
        )}
        <div className="event-node" key={ev.node ?? 'root'}>
          {ev.speaker && <p className="speaker">{ev.speaker}</p>}
          {ev.text.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="choices" key={`c-${ev.node ?? 'root'}-${transcript.length}`}>
          {ev.choices.map((c, i) => {
            const blocked = canChoose(g, c);
            const chk = checkDetail(g, c, ev);
            const leadsOn = !!c.next;
            return (
              <button key={i} className={`choice ${leadsOn ? 'talk' : ''}`} disabled={!!blocked} onClick={() => act((d) => resolveEvent(d, ev.uid, i))}>
                <b>
                  {leadsOn && !c.detail ? '💬 ' : ''}
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
      </div>
    </div>
  );
}
