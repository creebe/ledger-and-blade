import { FAME_TIERS, fameTier, hireRecruit, ITEMS, living, PROFESSIONS, rosterCap, TRAITS, upkeep, weeklyWages } from '../../engine';
import { useStore } from '../../store';
import { useState } from 'react';
import { Btn, Empty, Section, Seg } from '../kit/common';
import { Icon } from '../kit/icons';
import { ApproachBars, Portrait, readiness, TopStrengths } from '../kit/visual';


function Vital({ icon, v, label }: { icon: string; v: number; label: string }) {
  // neutral when fine; color only when it needs attention
  const c = v < 30 ? 'var(--bad)' : v < 50 ? 'var(--mid)' : 'var(--ink-2)';
  return (
    <span className="vm" title={`${label}: ${Math.round(v)}`} style={{ ['--vc' as string]: c }}>
      <Icon name={icon} size={12} />
      <span className="ap-bar-track">
        <span className="ap-bar-fill" style={{ width: `${v}%`, background: c }} />
      </span>
    </span>
  );
}
import { ASSIGNMENTS, ORDER_ICON, restingInfo } from '../kit/members';
import { crowns, plural } from '../kit/format';
import { short } from '../kit/shortfall';
import { goTo } from '../kit/navigate';

export function RosterScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const open = useStore((s) => s.open);
  const crew = living(g);
  const [detail, setDetailState] = useState(() => {
    try {
      return localStorage.getItem('lab.roster.detail') === '1';
    } catch {
      return false;
    }
  });
  const setDetail = (v: boolean) => {
    setDetailState(v);
    try {
      localStorage.setItem('lab.roster.detail', v ? '1' : '0');
    } catch {
      /* ignore */
    }
  };
  const fallen = g.members.filter((m) => m.status === 'dead' || m.status === 'left');

  return (
    <div className="screen">
      <h1 className="screen-title">Roster</h1>
      <Seg
        value={detail ? 'detail' : 'compact'}
        onChange={(v) => setDetail(v === 'detail')}
        options={[
          { value: 'compact', label: 'Compact' },
          { value: 'detail', label: 'Detailed' },
        ]}
      />
      <p className="muted small">
        {plural(crew.length, 'member')} · wages {crowns(crew.reduce((s, m) => s + m.wage, 0))} a week. Tap an order to change it, or a member to see their gear and record.
      </p>
      <Section guide="roster">
        {crew.map((m) => {
          const r = readiness(m, g);
          const resting = restingInfo(g, m);
          return (
            <div
              key={m.id}
              className="member-row tappable"
              role="button"
              tabIndex={0}
              onClick={() => open({ kind: 'member', id: m.id })}
              onKeyDown={(e) => {
                // only the row itself: Enter on the order chip inside must not open the member sheet too
                if (e.target !== e.currentTarget || (e.key !== 'Enter' && e.key !== ' ')) return;
                e.preventDefault();
                open({ kind: 'member', id: m.id });
              }}
            >
              <div className="card-row" style={{ alignItems: 'center' }}>
                <Portrait m={m} size={40} />
                <div className="card-main">
                  <div className="row between">
                    <b>
                      {m.name}
                      {fameTier(m) > 0 && (
                        <span className="fame-tag" title={FAME_TIERS[fameTier(m)].name}>
                          <Icon name="fame" size={12} /> {m.epithet ? `"${m.epithet}"` : FAME_TIERS[fameTier(m)].name}
                        </span>
                      )}
                    </b>
                    <span className={`readiness ${r.tone}`}>{r.text}</span>
                  </div>
                  <div className="row between member-row-orders">
                    <span className="meta">
                      {PROFESSIONS[m.profession].name} · Lv {m.level}
                    </span>
                    {resting ? (
                      <span className="order-chip-wrap" onClick={(e) => e.stopPropagation()}>
                        <Btn className="order-chip order-chip-resting" blocked={resting.why} onClick={() => undefined}>
                          <Icon name="rest" size={14} />
                          {resting.chip}
                        </Btn>
                      </span>
                    ) : m.status === 'idle' && (
                      <button
                        className="order-chip"
                        aria-label={`Orders for ${m.name}: ${ASSIGNMENTS.find((a) => a.id === m.assignment)?.label}. Tap to change.`}
                        onClick={(e) => {
                          e.stopPropagation();
                          open({ kind: 'orders', id: m.id });
                        }}
                      >
                        <Icon name={ORDER_ICON[m.assignment]} size={14} />
                        {ASSIGNMENTS.find((a) => a.id === m.assignment)?.label}
                      </button>
                    )}
                  </div>
                  {detail ? (
                    <>
                      <ApproachBars g={g} m={m} />
                      <div className="vitals-mini" style={{ marginTop: 5 }}>
                        <Vital icon="heart" v={m.health} label="Health" />
                        <Vital icon="bolt" v={100 - m.fatigue} label="Freshness" />
                        <Vital icon="smile" v={m.morale} label="Morale" />
                        <Vital icon="link" v={m.loyalty} label="Loyalty" />
                      </div>
                      <div className="tiny muted" style={{ marginTop: 3 }}>
                        {m.traits.map((t) => TRAITS[t].name).join(', ')}
                      </div>
                    </>
                  ) : (
                    <TopStrengths g={g} m={m} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      <Section title="Hiring Hall" guide="hiring">
        <p className="muted small">New faces arrive each week. Lower Town standing affects their quality and sign-on fee.</p>
        {g.recruits.length === 0 && <Empty>No one is looking for work.</Empty>}
        {g.recruits.map((r, i) => {
          const m = r.member;
          return (
            <div key={m.id} className="recruit">
              <div className="card-row">
                <Portrait m={m} size={40} showStatus={false} />
                <div className="card-main">
                  <div className="row between">
                    <b>{m.name}</b>
                    <span className="meta">{PROFESSIONS[m.profession].name}</span>
                  </div>
                  <ApproachBars g={g} m={m} />
                </div>
              </div>
              <div className="small" style={{ marginTop: 4 }}>
                Might {m.attrs.might} · Finesse {m.attrs.finesse} · Wits {m.attrs.wits} · Resolve {m.attrs.resolve}
              </div>
              <div className="small muted">
                {m.traits.map((t) => TRAITS[t].name).join(', ')} · brings {r.gear.map((x) => ITEMS[x].name).join(', ')}
              </div>
              <div className="row between">
                <span className="small">
                  Wage {crowns(m.wage)} a week · leaves in {plural(r.expiresWeek - g.week + 1, 'week')}
                </span>
                <Btn
                  className="btn small primary"
                  blocked={crew.length >= rosterCap(g) ? { text: `The hall is full (${rosterCap(g)} members). Expand the Great Hall to hire more.`, action: { label: 'See the Great Hall', run: () => goTo({ tab: 'hall', guide: 'buildings' }) } } : short(g, 'crowns', r.signOn, 'The sign-on fee')}
                  onClick={() =>
                    useStore.getState().confirm({
                      title: `Hire ${m.name}?`,
                      body: [
                        `${PROFESSIONS[m.profession].name}. ${PROFESSIONS[m.profession].blurb}`,
                        `Weekly costs rise from ${crowns(weeklyWages(g) + upkeep(g))} to ${crowns(weeklyWages(g) + upkeep(g) + m.wage)} (wage ${m.wage}).`,
                      ],
                      cost: `Sign-on fee ${crowns(r.signOn)} · treasury ${g.crowns} → ${g.crowns - r.signOn}`,
                      confirmLabel: 'Hire',
                      onConfirm: () => act((d) => hireRecruit(d, i)) && useStore.getState().notify(`${m.name} joins the guild, with their gear.`),
                    })
                  }
                >
                  Hire {crowns(r.signOn)}
                </Btn>
              </div>
            </div>
          );
        })}
      </Section>

      {fallen.length > 0 && (
        <Section title="Gone but not forgotten">
          {fallen.map((m) => (
            <p key={m.id} className="small muted alert-row">
              <Icon name={m.status === 'dead' ? 'skull' : 'exit'} size={14} />
              <span>
                {m.name}, {PROFESSIONS[m.profession].name}: {m.causeOfDeath}
              </span>
            </p>
          ))}
        </Section>
      )}
    </div>
  );
}
