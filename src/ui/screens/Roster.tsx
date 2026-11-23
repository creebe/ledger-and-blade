import { hireRecruit, ITEMS, living, PROFESSIONS, rosterCap, TRAITS } from '../../engine';
import { useStore } from '../../store';
import { useState } from 'react';
import { Btn, Empty, Section, Seg } from '../common';
import { Icon } from '../icons';
import { ApproachBars, Portrait, readiness, TopStrengths } from '../visual';
import type { Member } from '../../engine';

const ASSIGN_ICON: Record<string, string> = { rest: 'rest', train: 'train', rumors: 'ear', labor: 'hammer', scout: 'compass', build: 'anvil' };
function statusIcon(m: Member) {
  if (m.status === 'mission') return 'road';
  if (m.status === 'recovering') return 'bandage';
  return ASSIGN_ICON[m.assignment] ?? 'rest';
}

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
import { ASSIGNMENTS } from '../MemberSheet';

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
        {crew.length} members · wages {crew.reduce((s, m) => s + m.wage, 0)}◉/week. Idle members follow their weekly assignment. Tap a member to change gear and orders.
      </p>
      <Section guide="roster">
        {crew.map((m) => {
          const r = readiness(m, g);
          return (
            <button key={m.id} className="member-row" onClick={() => open({ kind: 'member', id: m.id })}>
              <div className="card-row" style={{ alignItems: 'center' }}>
                <Portrait m={m} size={40} />
                <div className="card-main">
                  <div className="row between">
                    <b>{m.name}</b>
                    <span className={`readiness ${r.tone}`}>{r.text}</span>
                  </div>
                  <div className="row between">
                    <span className="meta">
                      {PROFESSIONS[m.profession].name} · Lv {m.level}
                    </span>
                    {m.status === 'idle' && (
                      <span className="meta">
                        <Icon name={statusIcon(m)} size={13} />
                        {ASSIGNMENTS.find((a) => a.id === m.assignment)?.label}
                      </span>
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
            </button>
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
                  Wage {m.wage}◉/wk · leaves in {r.expiresWeek - g.week + 1} wk
                </span>
                <Btn
                  className="btn small primary"
                  blocked={crew.length >= rosterCap(g) ? `The hall is full (${rosterCap(g)} members). Expand the Great Hall to hire more.` : g.crowns < r.signOn ? `Need ${r.signOn} crowns to sign them (you have ${g.crowns})` : undefined}
                  onClick={() =>
                    useStore.getState().confirm({
                      title: `Hire ${m.name}?`,
                      body: [
                        `${PROFESSIONS[m.profession].name}. ${PROFESSIONS[m.profession].blurb}`,
                        `Weekly costs rise from ${crew.reduce((s, x) => s + x.wage, 0) + 15}◉ to ${crew.reduce((s, x) => s + x.wage, 0) + 15 + m.wage}◉ (wage ${m.wage}).`,
                      ],
                      cost: `Sign-on fee ${r.signOn}◉ · treasury ${g.crowns} → ${g.crowns - r.signOn}`,
                      confirmLabel: 'Hire',
                      onConfirm: () => act((d) => hireRecruit(d, i)) && useStore.getState().notify(`${m.name} joins the guild, with their gear.`),
                    })
                  }
                >
                  Hire {r.signOn}◉
                </Btn>
              </div>
            </div>
          );
        })}
      </Section>

      {fallen.length > 0 && (
        <Section title="Gone but not forgotten">
          {fallen.map((m) => (
            <p key={m.id} className="small muted">
              {m.status === 'dead' ? '✝' : '↦'} {m.name}, {PROFESSIONS[m.profession].name}: {m.causeOfDeath}
            </p>
          ))}
        </Section>
      )}
    </div>
  );
}
