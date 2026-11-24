import { useState } from 'react';
import { exportSave, importSave, slotInfo, useStore } from '../../store';
import { dateLabel } from '../../engine';
import { Btn, Sheet } from '../kit/common';
import { crowns } from '../kit/format';
import { useTheme } from '../kit/theme';

export function MenuSheet() {
  const g = useStore((s) => s.game);
  const { saveSlot, loadSlot, quit, open, loadGame, notify } = useStore.getState();
  const [exported, setExported] = useState('');
  const [importText, setImportText] = useState('');
  return (
    <Sheet title="Guild Ledger">
      <h3 className="subhead">Save</h3>
      {[1, 2, 3].map((n) => {
        const info = slotInfo(n);
        return (
          <div key={n} className="row between slot-row">
            <span className="small">
              Slot {n}: {info ? `${dateLabel(info.week)}, ${crowns(info.crowns)}` : 'empty'}
            </span>
            <span className="row gap">
              {g && (
                <button
                  className="btn ghost small"
                  onClick={() =>
                    info
                      ? useStore.getState().confirm({ title: `Overwrite slot ${n}?`, body: `Slot ${n} holds a save from week ${info.week}. It will be replaced with your current game.`, confirmLabel: 'Overwrite', danger: true, onConfirm: () => saveSlot(n) })
                      : saveSlot(n)
                  }
                >
                  Save
                </button>
              )}
              <Btn
                className="btn ghost small"
                blocked={!info ? `Slot ${n} is empty. Save a game there first.` : undefined}
                onClick={() =>
                  useStore.getState().confirm({
                    title: `Load slot ${n}?`,
                    body: g ? 'Your current game will be replaced by this save. Anything not saved to a slot will be lost.' : 'Load this save?',
                    confirmLabel: 'Load',
                    onConfirm: () => loadSlot(n),
                  })
                }
              >
                Load
              </Btn>
            </span>
          </div>
        );
      })}
      <p className="tiny muted">The game also autosaves after every action.</p>
      <h3 className="subhead">Transfer</h3>
      {g && (
        <button className="btn ghost small" onClick={() => setExported(exportSave(g))}>
          Export save as text
        </button>
      )}
      {exported && <textarea className="textarea" readOnly value={exported} onFocus={(e) => e.currentTarget.select()} />}
      <textarea className="textarea" placeholder="Paste a save here to import" value={importText} onChange={(e) => setImportText(e.target.value)} />
      <Btn
        className="btn ghost small"
        blocked={!importText ? 'Paste a save into the box above first.' : undefined}
        onClick={() => {
          const imp = importSave(importText);
          if (!imp) return notify('That save could not be read');
          loadGame(imp);
        }}
      >
        Import
      </Btn>
      <h3 className="subhead">Display</h3>
      <ThemeRow />
      {g && (
        <div className="row between slot-row">
          <span className="small">Guildmaster’s Notes (guided objectives)</span>
          <button className="btn ghost small" onClick={() => useStore.getState().act((d) => void (d.tutorial.enabled = !d.tutorial.enabled))}>
            {g.tutorial?.enabled ? 'Hide' : 'Show'}
          </button>
        </div>
      )}
      <h3 className="subhead">Game</h3>
      <div className="row wrap gap">
        <button className="btn ghost small" onClick={() => open({ kind: 'help' })}>
          How to play
        </button>
        {g && (
          <button className="btn ghost small" onClick={quit}>
            Back to title
          </button>
        )}
      </div>
    </Sheet>
  );
}

function ThemeRow() {
  const [theme, toggle] = useTheme();
  return (
    <div className="row between slot-row">
      <span className="small">Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
      <button className="btn ghost small" onClick={toggle}>
        Switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  );
}
