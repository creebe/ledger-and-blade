import { PROFESSIONS } from '../../engine';
import { useStore } from '../../store';
import { Sheet } from '../kit/common';
import { OrderPicker, restingInfo } from '../kit/members';
import { Portrait, readiness } from '../kit/visual';

/**
 * Weekly orders for one member, opened from the order chip on a Roster row so
 * the player can set orders without leaving the Roster. A simple order closes
 * the sheet; Train and Scout stay open for the second choice.
 */
export function OrdersSheet({ id }: { id: string }) {
  const g = useStore((s) => s.game)!;
  const close = useStore((s) => s.close);
  const open = useStore((s) => s.open);
  const m = g.members.find((x) => x.id === id);
  if (!m) return null;
  const r = readiness(m, g);
  return (
    <Sheet title={`Orders: ${m.name.split(' ')[0]}`}>
      <button className="member-row tappable orders-who" onClick={() => open({ kind: 'member', id: m.id })}>
        <span className="card-row" style={{ alignItems: 'center' }}>
          <Portrait m={m} size={36} />
          <span className="card-main">
            <b>{m.name}</b>
            <span className="meta" style={{ display: 'block' }}>
              {PROFESSIONS[m.profession].name} · Lv {m.level} · <span className={`readiness ${r.tone}`}>{r.text}</span>
            </span>
          </span>
        </span>
      </button>
      {restingInfo(g, m) ? (
        <p className="hint">{restingInfo(g, m)!.why}</p>
      ) : m.status === 'idle' ? (
        <OrderPicker m={m} onChosen={(a) => a !== 'train' && close()} />
      ) : (
        <p className="hint">{m.name.split(' ')[0]} is not at the hall this week, so there are no orders to give.</p>
      )}
    </Sheet>
  );
}
