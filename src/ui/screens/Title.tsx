import { useMemo, useState } from 'react';
import { BACKERS, CIRCUMSTANCE_BY_ID, PROFESSIONS, dateLabel, newGame } from '../../engine';
import { hasAutosave, slotInfo, useStore } from '../../store';
import { HelpSheet } from '../sheets/HelpSheet';
import { MenuSheet } from '../sheets/MenuSheet';
import { ConfirmSheet } from '../sheets/Dialogs';
import { useTheme } from '../kit/theme';
import { Icon } from '../kit/icons';
import { VERSION } from '../../version';
import { Prologue, prologueSeen } from './Prologue';

const randomSeed = () => 1 + Math.floor(Math.random() * 2147483000);

/** The start of a new campaign: rolled from a seed, which can be re-rolled or typed in. */
function NewGuild({ onBack, onPrologue }: { onBack: () => void; onPrologue: () => void }) {
  const { startNew } = useStore.getState();
  const [seed, setSeed] = useState(randomSeed);
  const [typed, setTyped] = useState('');
  const g = useMemo(() => newGame(seed), [seed]);
  const backer = BACKERS[g.start.backer];
  const roster = g.members.map((m) => PROFESSIONS[m.profession].name).join(', ');
  return (
    <div className="title-screen new-guild">
      <h1>A New Guild</h1>
      <p className="tagline">Every charter starts somewhere different.</p>
      <div className="start-card">
        <p className="start-label">Backed by</p>
        <h3>{backer.name}</h3>
        <p className="small">{backer.text}</p>
        <p className="tiny muted">
          {g.crowns} crowns in hand · {g.loans[0]?.principal ?? 0} owed to the Weighhouse · {g.supplies} supplies · {roster}
        </p>
      </div>
      <div className="start-card">
        <p className="start-label">The state of Varrow</p>
        {g.start.circumstances.map((id) => (
          <div key={id} className="start-line">
            <b>{CIRCUMSTANCE_BY_ID[id].title}.</b> <span className="small">{CIRCUMSTANCE_BY_ID[id].text}</span>
          </div>
        ))}
      </div>
      <div className="title-actions">
        <button className="btn primary block" onClick={() => startNew(seed)}>
          Found the guild
        </button>
        <button className="btn ghost block" onClick={() => setSeed(randomSeed())}>
          Roll a different start
        </button>
        <div className="seed-row">
          <span className="tiny muted">Seed {seed}</span>
          <input
            className="seed-input"
            inputMode="numeric"
            placeholder="Enter a seed"
            value={typed}
            onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 10))}
          />
          <button className="btn ghost small" disabled={!typed} onClick={() => setSeed(Number(typed) % 2147483647 || 1)}>
            Use
          </button>
        </div>
        <button className="btn ghost block" onClick={onPrologue}>
          Read the prologue again
        </button>
        <button className="btn ghost block" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

export function Title() {
  const { continueGame, open, loadSlot } = useStore.getState();
  const sheets = useStore((s) => s.sheets);
  const auto = hasAutosave();
  const slots = [1, 2, 3].map((n) => ({ n, info: slotInfo(n) })).filter((x) => x.info);
  const [theme, toggleTheme] = useTheme();
  // title → (the prologue, the first time) → choosing a start; the prologue can be read again from either screen
  const [screen, setScreen] = useState<'title' | 'new' | 'prologue-new' | 'prologue-title'>('title');
  const setChoosing = (v: boolean) => setScreen(v ? (prologueSeen() ? 'new' : 'prologue-new') : 'title');
  if (screen === 'prologue-new') return <Prologue onDone={() => setScreen('new')} doneLabel="Choose your start" />;
  if (screen === 'prologue-title') return <Prologue onDone={() => setScreen('title')} doneLabel="Back to the title" />;
  if (screen === 'new') return <NewGuild onBack={() => setScreen('title')} onPrologue={() => setScreen('prologue-new')} />;
  return (
    <div className="title-screen">
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        <Icon name="lamp" size={18} />
      </button>
      <div className="title-art">⚖⚔</div>
      <h1>Ledger &amp; Blade</h1>
      <p className="tagline">The realm owes a fortune. Everyone needs a blade. Keep your books balanced.</p>
      <div className="title-actions">
        {auto && (
          <button className="btn primary block" onClick={continueGame}>
            Continue
          </button>
        )}
        <button className={`btn block ${auto ? 'ghost' : 'primary'}`} onClick={() =>
            auto
              ? useStore.getState().confirm({
                  title: 'Start a new guild?',
                  body: ['The guild you are playing now is lost when you found the new one, unless you have saved it to a slot from the menu. Saves already in slots are kept.'],
                  confirmLabel: 'Start a new guild',
                  danger: true,
                  onConfirm: () => setChoosing(true),
                })
              : setChoosing(true)
          }
        >
          New Guild
        </button>
        {slots.map(({ n, info }) => (
          <button key={n} className="btn ghost block" onClick={() => loadSlot(n)}>
            Load slot {n} · week {info!.week}
          </button>
        ))}
        <button className="btn ghost block" onClick={() => open({ kind: 'menu' })}>
          Import a save
        </button>
        <button className="btn ghost block" onClick={() => open({ kind: 'help' })}>
          How to play
        </button>
        {prologueSeen() && (
          <button className="btn ghost block" onClick={() => setScreen('prologue-title')}>
            Read the prologue
          </button>
        )}
      </div>
      <p className="tiny muted title-footnote">Prototype build {VERSION} · progress is saved on this device</p>
      {sheets.map((s, i) => (s.kind === 'menu' ? <MenuSheet key={i} /> : s.kind === 'help' ? <HelpSheet key={i} /> : s.kind === 'confirm' ? <ConfirmSheet key={i} {...s} /> : null))}
    </div>
  );
}

export function GameOver() {
  const g = useStore((s) => s.game)!;
  const { quit } = useStore.getState();
  const dead = g.members.filter((m) => m.status === 'dead').length;
  return (
    <div className="title-screen">
      <div className="title-art">✝</div>
      <h1>The Ledger Closes</h1>
      <p>{g.gameOver!.text}</p>
      <p className="muted small">
        Your guild lasted until {dateLabel(g.gameOver!.week)}. Renown {g.renown}. {dead === 1 ? '1 member' : `${dead} members`} fell in your service. {g.history.length === 1 ? '1 mission' : `${g.history.length} missions`} completed.
      </p>
      <div className="title-actions">
        <button className="btn primary block" onClick={quit}>
          Back to the title screen
        </button>
      </div>
    </div>
  );
}
