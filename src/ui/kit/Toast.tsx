import { useStore } from '../../store';
import { Icon } from './icons';

/** The toast: a short notice, sometimes with one step to fix what it reports. */
export function Toast({ where = 'in-game' }: { where?: 'in-game' | 'in-sheet' }) {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className={`toast ${where} ${toast.action ? 'has-action' : ''}`} key={toast.id} role="status">
      <span>{toast.text}</span>
      {toast.action && (
        <button
          className="toast-action"
          onClick={() => {
            const run = toast.action!.run;
            useStore.setState({ toast: undefined });
            run();
          }}
        >
          {toast.action.label} <Icon name="chevron" size={12} />
        </button>
      )}
    </div>
  );
}
