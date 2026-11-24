import { useState } from 'react';
import {
  buildersSpeed,
  canBuild,
  canCraft,
  cancelCraft,
  craftCapacity,
  FACILITIES,
  FACILITY_IDS,
  ITEMS,
  itemPrice,
  level,
  living,
  MATERIAL_INFO,
  nextLevel,
  queueCraft,
  RECIPE_BY_ID,
  RECIPES,
  startBuild,
  upkeep,
  type FacilityId,
  type GameState,
  type MaterialId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Section } from '../kit/common';
import { Icon } from '../kit/icons';
import { ItemIcon, ItemStats } from '../kit/visual';
import { crowns as crownsText, wk } from '../kit/format';

const MATERIAL_ICON: Record<MaterialId, string> = { iron: 'anvil', leather: 'hide', timber: 'rough', reagents: 'flask' };

/** Cost chips that turn red when you don't have enough. */
function CostChips({ g, crowns, materials, check = true }: { g: GameState; crowns?: number; materials: Partial<Record<MaterialId, number>>; check?: boolean }) {
  return (
    <span className="stat-chips">
      {!!crowns && (
        <span className={`stat-chip ${check && g.crowns < crowns ? 'short' : ''}`}>
          <Icon name="coin" size={12} />
          {crowns}
        </span>
      )}
      {(Object.keys(materials) as MaterialId[]).map((m) => (
        <span key={m} className={`stat-chip ${check && g.materials[m] < (materials[m] ?? 0) ? 'short' : ''}`} title={`${MATERIAL_INFO[m].name}: need ${materials[m]}, have ${g.materials[m]}`}>
          <Icon name={MATERIAL_ICON[m]} size={12} />
          {materials[m]} {MATERIAL_INFO[m].name}
          <small>({g.materials[m]})</small>
        </span>
      ))}
    </span>
  );
}

function Pips({ value, max }: { value: number; max: number }) {
  return (
    <span className="pips" aria-label={`Level ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className={i < value ? 'on' : ''} />
      ))}
    </span>
  );
}

export function BuildingsSection() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const [open, setOpen] = useState<FacilityId | null>(null);
  const c = g.construction;
  const builders = living(g).filter((m) => m.status === 'idle' && m.assignment === 'build').length;

  return (
    <Section
      guide="buildings"
      title="Buildings"
      right={
        <span className="meta">
          upkeep {crownsText(upkeep(g))} a week
        </span>
      }
    >
      {c && (
        <div className="build-progress">
          <span className="type-icon">
            <Icon name={FACILITIES[c.id].icon} size={18} />
          </span>
          <div className="card-main">
            <div className="row between">
              <b>
                Building: {FACILITIES[c.id].name} {c.toLevel}
              </b>
              <span className="meta">about {wk(Math.max(1, Math.ceil((c.weeks - c.progress) / buildersSpeed(g))))} left</span>
            </div>
            <div className="ap-bar-track" style={{ height: 8 }}>
              <span className="ap-bar-fill progress-fill" style={{ width: `${Math.min(100, (c.progress / c.weeks) * 100)}%` }} />
            </div>
            <span className="tiny muted">
              {builders ? `${builders} member${builders > 1 ? 's' : ''} helping.` : 'Assign idle members to Build (Roster) to speed it up.'}
            </span>
          </div>
        </div>
      )}
      <div className="facility-grid">
        {FACILITY_IDS.map((id) => {
          const f = FACILITIES[id];
          const lv = level(g, id);
          const building = c?.id === id;
          return (
            <button key={id} className={`facility tappable-tile ${open === id ? 'open' : ''} ${lv === 0 ? 'unbuilt' : ''}`} onClick={() => setOpen(open === id ? null : id)}>
              <Icon name={f.icon} size={24} />
              <span className="fac-name">{f.name}</span>
              <Pips value={lv} max={f.levels.length} />
              {building && <span className="fac-badge">building</span>}
            </button>
          );
        })}
      </div>
      {open && <FacilityDetail id={open} g={g} onBuild={() => act((d) => startBuild(d, open))} />}
    </Section>
  );
}

function FacilityDetail({ id, g, onBuild }: { id: FacilityId; g: GameState; onBuild: () => void }) {
  const f = FACILITIES[id];
  const lv = level(g, id);
  const next = nextLevel(g, id);
  const blocked = canBuild(g, id);
  return (
    <div className="facility-detail">
      <div className="row between">
        <b>
          <Icon name={f.icon} size={18} /> {f.name}
        </b>
        <span className="meta">Level {lv}</span>
      </div>
      <p className="small muted">{f.blurb}</p>
      {lv > 0 && (
        <p className="small">
          <Icon name="check" size={14} style={{ color: 'var(--good)' }} /> {f.levels[lv - 1].effect}
        </p>
      )}
      {next ? (
        <>
          <p className="small">
            <b>Level {lv + 1}:</b> {next.effect}
          </p>
          <CostChips g={g} crowns={next.crowns} materials={next.materials} />
          <div className="row between" style={{ marginTop: 6 }}>
            <span className="meta">
              <Icon name="clock" size={14} /> {wk(next.weeks)} · upkeep +{crownsText(next.upkeep)} a week
            </span>
            <Btn
              className="btn small primary"
              blocked={blocked}
              onClick={() =>
                useStore.getState().confirm({
                  title: `Build ${f.name} level ${lv + 1}?`,
                  body: [next.effect, `Takes about ${next.weeks} weeks (faster with builders). Weekly upkeep rises from ${upkeep(g)} to ${upkeep(g) + next.upkeep} crowns.`],
                  cost: `${next.crowns} crowns${Object.entries(next.materials)
                    .map(([m, n]) => `, ${n} ${MATERIAL_INFO[m as MaterialId].name}`)
                    .join('')}`,
                  confirmLabel: 'Start building',
                  onConfirm: onBuild,
                })
              }
            >
              {lv === 0 ? 'Build' : 'Upgrade'}
            </Btn>
          </div>
          {blocked && <p className="tiny warn">{blocked}</p>}
        </>
      ) : (
        <p className="small good">Fully built.</p>
      )}
    </div>
  );
}

export function WorkshopPanel() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  return (
    <>
      {g.craftQueue.length > 0 && (
        <Section title="In the workshop">
          <p className="tiny muted">
            Finished at the end of the week. Forge: {craftCapacity(g, 'forge')} a week · Stillroom: {craftCapacity(g, 'stillroom')} a week.
          </p>
          {g.craftQueue.map((id, i) => {
            const r = RECIPE_BY_ID[id];
            return (
              <div key={i} className="shop-item">
                <ItemIcon def={ITEMS[r.id]} size={18} />
                <div className="card-main">
                  <b>
                    {r.count && r.count > 1 ? `${r.count}× ` : ''}
                    {ITEMS[r.id].name}
                  </b>
                </div>
                <button className="btn small ghost" onClick={() => act((d) => cancelCraft(d, i))}>
                  Cancel
                </button>
              </div>
            );
          })}
        </Section>
      )}
      {(['forge', 'stillroom'] as const).map((fid) => {
        const lv = level(g, fid);
        const f = FACILITIES[fid];
        return (
          <Section
            key={fid}
            title={
              <>
                <Icon name={f.icon} size={18} /> {f.name}
              </>
            }
            right={<span className="meta">Level {lv}</span>}
          >
            {lv === 0 && <p className="hint">Build a {f.name} in the Hall to start crafting here. {f.blurb}</p>}
            {RECIPES.filter((r) => r.facility === fid).map((r) => {
              const def = ITEMS[r.id];
              const blocked = canCraft(g, r);
              const locked = lv < r.level;
              const market = itemPrice(g, r.id) * (r.count ?? 1);
              return (
                <div key={r.id} className={`shop-item ${locked ? 'locked' : ''}`}>
                  <ItemIcon def={def} size={20} />
                  <div className="card-main">
                    <b>
                      {r.count && r.count > 1 ? `${r.count}× ` : ''}
                      {def.name}
                    </b>
                    {locked && <span className="tiny muted"> · needs level {r.level}</span>}
                    <div>
                      <ItemStats def={def} />
                    </div>
                    <div style={{ marginTop: 3 }}>
                      <CostChips g={g} crowns={r.crowns} materials={r.materials} check={!locked} />
                    </div>
                    <span className="tiny muted">Market price about {crownsText(market)}</span>
                  </div>
                  <Btn
                    className="btn small primary"
                    blocked={blocked}
                    title={blocked}
                    onClick={() =>
                      useStore.getState().confirm({
                        title: `Craft ${r.count && r.count > 1 ? `${r.count}× ` : ''}${def.name}?`,
                        body: ['It will be ready at the end of the week. You can cancel it until then and get everything back.'],
                        cost: [r.crowns ? crownsText(r.crowns) : '', ...Object.entries(r.materials).map(([m, n]) => `${n} ${MATERIAL_INFO[m as MaterialId].name}`)].filter(Boolean).join(', '),
                        confirmLabel: 'Craft',
                        onConfirm: () => act((d) => queueCraft(d, r.id)) && useStore.getState().notify(`${def.name} queued. It will be ready at the end of the week.`),
                      })
                    }
                  >
                    Craft
                  </Btn>
                </div>
              );
            })}
          </Section>
        );
      })}
    </>
  );
}
