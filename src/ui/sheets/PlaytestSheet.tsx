// The playtest notes list, opened from the menu: read, edit, delete, copy
// and share the notes written during play.
import { useState } from 'react';
import { useStore } from '../../store';
import { Btn, Empty, Sheet } from '../kit/common';
import { allMarkdown, noteHeading, useNotes, type PlaytestNote } from '../playtest/notes';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // older browsers, or no permission: the hidden-textarea route
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

const fileName = () => `playtest-notes-${new Date().toISOString().slice(0, 10)}.md`;

function download(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const canShareText = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
function canShareFile(): boolean {
  try {
    return canShareText() && !!navigator.canShare?.({ files: [new File(['x'], 'x.md', { type: 'text/markdown' })] });
  } catch {
    return false;
  }
}

/** A share sheet closed without choosing anything is not an error. */
const cancelled = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

export function PlaytestSheet() {
  const notes = useNotes((s) => s.notes);
  const on = useNotes((s) => s.on);
  const attachSave = useNotes((s) => s.attachSave);
  const storageFull = useNotes((s) => s.storageFull);
  const { setOn, setAttachSave, clearAll } = useNotes.getState();
  const { notify, confirm } = useStore.getState();
  const none = notes.length ? undefined : 'There are no notes yet. Turn on the Note button, then tap it during play.';
  const withSaves = notes.filter((n) => n.save).length;

  const copyAll = async () => notify((await copyText(allMarkdown(notes))) ? `Copied ${notes.length} note${notes.length === 1 ? '' : 's'} as Markdown.` : 'This browser would not copy the notes. Save them as a .md file instead.');
  const shareText = async () => {
    try {
      await navigator.share({ title: 'Playtest notes', text: allMarkdown(notes) });
    } catch (e) {
      if (!cancelled(e)) notify('The share menu could not send the notes. Try Copy all instead.');
    }
  };
  const shareFile = async () => {
    const text = allMarkdown(notes);
    if (!canShareFile()) {
      download(text);
      return notify('The notes were saved as a .md file.');
    }
    try {
      await navigator.share({ title: 'Playtest notes', files: [new File([text], fileName(), { type: 'text/markdown' })] });
    } catch (e) {
      if (!cancelled(e)) notify('The share menu could not send the file. Try Copy all.');
    }
  };

  return (
    <Sheet title="Playtest notes">
      <div className="row between slot-row">
        <span className="small">Show the Note button during play</span>
        <button className="btn ghost small" onClick={() => setOn(!on)}>
          {on ? 'Turn off' : 'Turn on'}
        </button>
      </div>
      <div className="row between slot-row">
        <span className="small">Attach the save code to new notes</span>
        <button className="btn ghost small" onClick={() => setAttachSave(!attachSave)}>
          {attachSave ? 'Turn off' : 'Turn on'}
        </button>
      </div>
      <p className="tiny muted">
        A save code lets main load the exact moment of a note. Each one adds about 30 to 100 KB to the notes{withSaves ? `, and ${withSaves} of yours ${withSaves === 1 ? 'carries' : 'carry'} one` : ''}.
      </p>
      {storageFull && <p className="small bad">Storage is full, so the latest changes are kept only until the page reloads. Copy or share your notes, then delete some.</p>}
      <div className="row wrap gap pt-actions">
        <Btn className="btn primary small" blocked={none} onClick={copyAll}>
          Copy all
        </Btn>
        <Btn className="btn ghost small" blocked={none ?? (canShareText() ? undefined : 'This browser has no share menu. Use Copy all, or save the file.')} onClick={shareText}>
          Share
        </Btn>
        <Btn className="btn ghost small" blocked={none} onClick={shareFile}>
          {canShareFile() ? 'Share as .md file' : 'Save as .md file'}
        </Btn>
        <Btn
          className="btn ghost small"
          blocked={none}
          onClick={() =>
            confirm({
              title: `Delete all ${notes.length} note${notes.length === 1 ? '' : 's'}?`,
              body: 'Deleted notes can’t be brought back. Copy or share them first if main hasn’t seen them yet.',
              confirmLabel: 'Delete all',
              danger: true,
              onConfirm: clearAll,
            })
          }
        >
          Delete all
        </Btn>
      </div>
      {notes.length === 0 ? (
        <Empty>There are no notes yet. Turn on the Note button, then tap it during play whenever something catches your eye. Each note records the moment it was written in.</Empty>
      ) : (
        [...notes].reverse().map((n) => <NoteCard key={n.id} n={n} i={notes.indexOf(n)} />)
      )}
    </Sheet>
  );
}

function NoteCard({ n, i }: { n: PlaytestNote; i: number }) {
  const [editing, setEditing] = useState<string | undefined>();
  const { editNote, deleteNote } = useNotes.getState();
  const { confirm } = useStore.getState();
  const where = n.ctx.lines.find((l) => l[0] === 'Screen')?.[1];
  const open = n.ctx.lines.find((l) => l[0] === 'Open')?.[1];
  return (
    <div className="card pt-note-card">
      <div className="row between pt-note-head">
        <b className="small">{noteHeading(n, i)}</b>
        <span className="tiny muted">{n.ctx.at}</span>
      </div>
      <p className="tiny muted pt-note-where">
        {[where, open, n.ctx.scene && `scene ${n.ctx.scene.id}`].filter(Boolean).join(' › ').replace(/`/g, '')}
        {n.save ? ' · save attached' : ''}
      </p>
      {editing === undefined ? (
        <p className="pt-note-text">{n.text}</p>
      ) : (
        <textarea className="textarea pt-text pt-text-edit" value={editing} onChange={(e) => setEditing(e.target.value)} autoFocus />
      )}
      <div className="row gap pt-note-actions">
        {editing === undefined ? (
          <>
            <button className="btn ghost small" onClick={() => setEditing(n.text)}>
              Edit
            </button>
            <button
              className="btn ghost small"
              onClick={() => confirm({ title: `Delete note ${i + 1}?`, body: n.text.length > 120 ? `${n.text.slice(0, 120)}…` : n.text, confirmLabel: 'Delete', danger: true, onConfirm: () => deleteNote(n.id) })}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button className="btn ghost small" onClick={() => setEditing(undefined)}>
              Cancel
            </button>
            <Btn
              className="btn primary small"
              blocked={!editing.trim() ? 'A note can’t be empty. Delete it instead.' : undefined}
              onClick={() => {
                editNote(n.id, editing);
                setEditing(undefined);
              }}
            >
              Save
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
