import { useStore } from '../../store';
import { Sheet } from '../kit/common';

export function ConfirmSheet({ title, body, cost, confirmLabel, danger, onConfirm }: { title: string; body: string[]; cost?: string; confirmLabel: string; danger?: boolean; onConfirm: () => void }) {
  const close = useStore((s) => s.close);
  return (
    <div className="event-backdrop" onClick={close}>
      <div className="confirm-card" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {body.map((b, i) => (
          <p key={i} className="small">
            {b}
          </p>
        ))}
        {cost && <p className="cost">{cost}</p>}
        <div className="row gap">
          <button className="btn ghost block" onClick={close}>
            Cancel
          </button>
          <button
            className={`btn block ${danger ? 'danger' : 'primary'}`}
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WarningsSheet({ warnings }: { warnings: string[] }) {
  const close = useStore((s) => s.close);
  const endWeek = useStore((s) => s.endWeek);
  return (
    <Sheet
      title="Before you end the week…"
      footer={
        <div className="row gap">
          <button className="btn ghost block" onClick={close}>
            Go back
          </button>
          <button
            className="btn primary block"
            onClick={() => {
              close();
              endWeek();
            }}
          >
            End week anyway
          </button>
        </div>
      }
    >
      <ul className="alerts">
        {warnings.map((w, i) => (
          <li key={i} className="warn">
            {w}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
