// The floating Note button and the note sheet it opens. Both sit above
// everything else (panels, scenes, confirmations), so a note can be written
// at any moment and the player lands back exactly where they were.
import React, { useEffect, useRef, useState } from 'react';
import { exportSave, useStore } from '../../store';
import { Btn, Sheet, SheetDepth } from '../kit/common';
import { Icon } from '../kit/icons';
import { Toast } from '../kit/Toast';
import { captureContext, sceneOnScreen } from './context';
import { useNotes } from './notes';

/** What Save said, so its toast can show above a scene or confirmation. */
const SAVED = 'Note saved.';
const SAVED_NO_ROOM = 'Storage is full, so this note lasts only until the page reloads. Copy your notes from the menu before then.';

export function PlaytestLayer() {
  const on = useNotes((s) => s.on);
  const writing = useNotes((s) => s.writing);
  // the notes list has nothing to add a note about, and the tab would cover its text
  const onList = useStore((s) => s.sheets.at(-1)?.kind === 'playtest');
  // the game's toasts sit under scenes and confirmations, so "Note saved" shows here when one is up
  const raiseToast = useStore((s) => (s.toast?.text === SAVED || s.toast?.text === SAVED_NO_ROOM) && (s.sheets.some((x) => x.kind === 'confirm') || !!sceneOnScreen(s)));
  return (
    <>
      {writing ? <NoteSheet /> : on && !onList && <NoteButton />}
      {!writing && raiseToast && (
        <div className="pt-toast">
          <Toast />
        </div>
      )}
    </>
  );
}

/** The tab stays between the top bar and End Week, however far it is dragged. */
const clampY = (y: number) => Math.min(0.72, Math.max(0.24, y));

function NoteButton() {
  const btnY = useNotes((s) => s.btnY);
  const [dragY, setDragY] = useState<number | undefined>();
  const drag = useRef<{ startY: number; startFrac: number; moved: boolean } | undefined>();
  const y = clampY(dragY ?? btnY ?? 0.5);
  const write = () => {
    const st = useStore.getState();
    const n = useNotes.getState();
    n.startNote(captureContext(st), n.attachSave && st.game ? exportSave(st.game) : undefined);
  };
  return (
    <button
      className="pt-note-btn"
      style={{ '--pt-y': `${(y * 100).toFixed(2)}%` } as React.CSSProperties}
      aria-label="Write a playtest note"
      title="Tap to write a note. Drag up or down to move it."
      onPointerDown={(e) => {
        drag.current = { startY: e.clientY, startFrac: y, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dy = e.clientY - d.startY;
        if (!d.moved && Math.abs(dy) < 8) return;
        d.moved = true;
        setDragY(clampY(d.startFrac + dy / window.innerHeight));
      }}
      onPointerUp={() => {
        const d = drag.current;
        drag.current = undefined;
        if (d?.moved && dragY !== undefined) useNotes.getState().setBtnY(dragY);
        setDragY(undefined);
        if (!d?.moved) write();
      }}
      onPointerCancel={() => {
        drag.current = undefined;
        setDragY(undefined);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          write();
        }
      }}
    >
      <Icon name="notes" size={18} />
      <span className="pt-note-btn-l">Note</span>
    </button>
  );
}

function NoteSheet() {
  const draft = useNotes((s) => s.draft);
  const { setDraft, putAway, cancelNote, saveNote } = useNotes.getState();
  // the in-sheet toast shows on the topmost panel, which this is
  const depth = useStore((s) => s.sheets.filter((x) => x.kind !== 'confirm').length - 1);
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    area.current?.focus();
  }, []);
  if (!draft) return null;
  const ctx = draft.ctx;
  const where = ctx.lines.find((l) => l[0] === 'Screen')?.[1];
  const open = ctx.lines.find((l) => l[0] === 'Open')?.[1];
  const empty = !draft.text.trim();
  return (
    <SheetDepth.Provider value={depth}>
      <div className="pt-layer">
        <Sheet
          title="Playtest note"
          onBack={putAway}
          footer={
            <div className="row gap">
              <button className="btn ghost block" onClick={cancelNote}>
                Cancel
              </button>
              <Btn
                className="btn primary block"
                blocked={empty ? 'Write the note first. Cancel closes it without saving.' : undefined}
                onClick={() => {
                  saveNote();
                  useStore.getState().notify(useNotes.getState().storageFull ? SAVED_NO_ROOM : SAVED);
                }}
              >
                Save
              </Btn>
            </div>
          }
        >
          <p className="small muted pt-where">
            {ctx.week ? `Week ${ctx.week} · ` : ''}
            {where}
            {open ? ` › ${open}` : ''}
            {ctx.scene ? ` › scene ${ctx.scene.id}` : ''}
          </p>
          <textarea
            ref={area}
            className="textarea pt-text"
            placeholder="What did you see, and what did you expect?"
            value={draft.text}
            onChange={(e) => setDraft(e.target.value)}
          />
          <details className="pt-ctx">
            <summary className="small">What is saved with this note</summary>
            <ul className="pt-ctx-list tiny">
              <li>
                {ctx.version}, written {ctx.at}
                {ctx.date ? `, ${ctx.date}` : ''}
              </li>
              {ctx.lines.map(([k, v]) => (
                <li key={k}>
                  <b>{k}:</b> {v.replace(/`/g, '')}
                </li>
              ))}
              {ctx.scene && (
                <li>
                  <b>Scene:</b> {ctx.scene.id}, “{ctx.scene.title}”, with its text and {ctx.scene.ending ? 'ending' : 'choices'}
                </li>
              )}
              {draft.save && (
                <li>
                  <b>Save code:</b> attached
                </li>
              )}
            </ul>
          </details>
          <p className="tiny muted">The game waits behind this note. Back keeps what you've written for later; Cancel throws it away.</p>
        </Sheet>
      </div>
    </SheetDepth.Provider>
  );
}
