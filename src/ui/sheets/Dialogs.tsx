import { useStore } from '../../store';

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
