import { useEffect, useState } from 'react';
import { APPROACH_INFO, track } from '../../engine';
import { useStore } from '../../store';
import { ChanceBar, Sheet } from '../kit/common';
import { Icon } from '../kit/icons';
import { ap } from '../kit/visual';

const STAMP: Record<string, string> = { strong: 'Decisive', success: 'Success', fail: 'Failed', severe: 'Disaster' };

export function MissionReplay({ id }: { id: string }) {
  const g = useStore((s) => s.game)!;
  useEffect(() => {
    useStore.getState().act((d) => track(d, 'journal'));
  }, [id]);
  const m = [...g.missions, ...g.history].find((x) => x.id === id);
  const [skip, setSkip] = useState(false);
  if (!m?.report) return null;
  const r = m.report;
  // reveal one line at a time, like a journal being read aloud
  let t = 0;
  const LINE = skip ? 0 : 0.55;
  const next = (extra = 0) => {
    const at = t;
    t += LINE + extra;
    return { animationDelay: `${at}s` };
  };
  const name = (mid?: string) => g.members.find((x) => x.id === mid)?.name.split(' ')[0];
  const squad = m.memberIds.map((x) => g.members.find((y) => y.id === x)).filter(Boolean);
  return (
    <Sheet title={m.contract.title}>
      <div className="row between small">
        <span className="muted">
          {m.contract.region} · {squad.map((x) => (x!.status === 'dead' ? `✝ ${x!.name.split(' ')[0]}` : x!.name.split(' ')[0])).join(', ')}
        </span>
        {!skip && (
          <button className="btn ghost small" onClick={() => setSkip(true)}>
            Skip ⏭
          </button>
        )}
      </div>
      <div className="journal">
        {r.outbound && (
          <section className="j-section">
            <h4 className="j-head" style={next()}>
              {r.outbound.title}
            </h4>
            {r.outbound.lines.map((l, i) => (
              <p key={i} className="j-line" style={next()}>
                {l}
              </p>
            ))}
          </section>
        )}
        {r.phases.map((p, i) => (
          <section key={i} className={`phase-card r-${p.result}`} style={next()}>
            <div className="row between">
              <b>
                {i + 1}. {p.phase}
              </b>
              <span className="meta">
                <Icon name={p.approach} size={14} style={{ color: ap(p.approach) }} />
                {APPROACH_INFO[p.approach].name}
                {p.lead ? ` · ${name(p.lead)}` : ''}
              </span>
            </div>
            {(p.story ?? []).map((l, k) => (
              <p key={k} className="j-line" style={next()}>
                {l}
              </p>
            ))}
            <div className="j-line" style={next()}>
              <ChanceBar min={p.chance} max={p.chance} animate={!skip} />
            </div>
            <span className="stamp" style={next(0.2)}>
              {STAMP[p.result]}
            </span>
            {p.lines.slice(1).map((l, k) => (
              <p key={k} className="j-line wound small" style={next()}>
                {l}
              </p>
            ))}
          </section>
        ))}
        {r.phases.length < m.contract.phases.length && (
          <section className="phase-card r-skipped" style={next()}>
            <b>Withdrawn</b>
            <p className="small muted">The remaining phases were abandoned.</p>
          </section>
        )}
        {r.homeward && (
          <section className="j-section">
            <h4 className="j-head" style={next()}>
              {r.homeward.title}
            </h4>
            {r.homeward.lines.map((l, i) => (
              <p key={i} className="j-line" style={next()}>
                {l}
              </p>
            ))}
          </section>
        )}
      </div>
      <div className={`outcome t-${r.tier.replace(' ', '-').toLowerCase()}`} style={next()}>
        <h3>{r.tier}</h3>
        {r.summary.map((s, i) => (
          <p key={i} className="small">
            {s}
          </p>
        ))}
      </div>
    </Sheet>
  );
}
