import { useEffect, useRef, useState } from 'react';
import { dateLabel, endWeekWarnings, HALL_UPKEEP, living, weeklyWages } from './engine';
import { hasAutosave, slotInfo, useStore, type Tab } from './store';
import { MemberSheet } from './ui/MemberSheet';
import { ConfirmSheet, EventCard, HelpSheet, MenuSheet, MissionReplay, WarningsSheet, WeekReport } from './ui/Overlays';
import { Planner } from './ui/Planner';
import { ArmoryScreen } from './ui/screens/Armory';
import { ContractsScreen } from './ui/screens/Contracts';
import { HallScreen } from './ui/screens/Hall';
import { RealmScreen } from './ui/screens/Realm';
import { RosterScreen } from './ui/screens/Roster';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hall', label: 'Hall', icon: '⌂' },
  { id: 'contracts', label: 'Contracts', icon: '✉' },
  { id: 'roster', label: 'Roster', icon: '☰' },
  { id: 'armory', label: 'Armory', icon: '⚔' },
  { id: 'realm', label: 'Realm', icon: '♛' },
];

function TopBar() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const notify = useStore((s) => s.notify);
  const burn = weeklyWages(g) + HALL_UPKEEP;
  const res: { icon: string; value: string | number; label: string; tone?: string }[] = [
    { icon: '◉', value: g.crowns, label: `Crowns. Weekly costs: ${burn} (wages ${weeklyWages(g)} + hall ${HALL_UPKEEP}).`, tone: g.crowns < burn ? 'bad' : '' },
    { icon: '❦', value: g.supplies, label: `Supplies. ${living(g).filter((m) => m.status !== 'mission').length} eaten per week at home; squads carry their own.` },
    { icon: '👁', value: g.intel, label: 'Intel. Reveal hidden tags and rival plans.' },
    { icon: '✦', value: g.influence, label: 'Influence. Court factions and cool Heat.' },
    { icon: '★', value: g.renown, label: 'Renown. Better contracts and goods; rivals take note.' },
    { icon: '♨', value: g.heat, label: 'Heat. Legal exposure from shady work.', tone: g.heat >= 60 ? 'bad' : g.heat >= 30 ? 'mid' : '' },
  ];
  // floating +/- numbers whenever a resource changes
  const prev = useRef<Record<string, number> | null>(null);
  const [floats, setFloats] = useState<{ id: number; key: string; delta: number; good: boolean }[]>([]);
  const fid = useRef(0);
  const values: Record<string, number> = { crowns: g.crowns, supplies: g.supplies, intel: g.intel, influence: g.influence, renown: g.renown, heat: g.heat };
  useEffect(() => {
    const p = prev.current;
    prev.current = values;
    if (!p) return;
    const fresh = Object.keys(values)
      .filter((k) => Math.round((values[k] - p[k]) * 10) !== 0)
      .map((k) => ({ id: ++fid.current, key: k, delta: Math.round((values[k] - p[k]) * 10) / 10, good: k === 'heat' ? values[k] < p[k] : values[k] > p[k] }));
    if (!fresh.length) return;
    setFloats((f) => [...f, ...fresh]);
    const ids = fresh.map((f) => f.id);
    window.setTimeout(() => setFloats((f) => f.filter((x) => !ids.includes(x.id))), 1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.crowns, g.supplies, g.intel, g.influence, g.renown, g.heat]);
  const keys = ['crowns', 'supplies', 'intel', 'influence', 'renown', 'heat'];

  return (
    <header className="topbar">
      <div className="row between">
        <span className="date">{dateLabel(g.week)}</span>
        <button className="icon-btn" onClick={() => open({ kind: 'menu' })} aria-label="Menu">
          ☰
        </button>
      </div>
      <div className="resources">
        {res.map((r, i) => {
          const fl = floats.filter((f) => f.key === keys[i]);
          return (
            <button key={r.label} className={`res ${r.tone ?? ''} ${fl.length ? 'pulse' : ''}`} onClick={() => notify(r.label)}>
              <span>{r.icon}</span>
              <b>{r.value}</b>
              {fl.map((f) => (
                <i key={f.id} className={`float ${f.good ? 'up' : 'down'}`}>
                  {f.delta > 0 ? '+' : ''}
                  {f.delta}
                </i>
              ))}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function BottomNav() {
  const tab = useStore((s) => s.tab);
  const setTab = useStore((s) => s.setTab);
  const g = useStore((s) => s.game)!;
  const badge: Partial<Record<Tab, number>> = {
    contracts: g.board.filter((c) => c.story).length,
  };
  return (
    <nav className="bottomnav">
      {TABS.map((t) => (
        <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
          <span className="nav-i">{t.icon}</span>
          <span className="nav-l">{t.label}</span>
          {!!badge[t.id] && <span className="nav-badge">{badge[t.id]}</span>}
        </button>
      ))}
    </nav>
  );
}

function EndWeekButton() {
  const g = useStore((s) => s.game)!;
  const endWeek = useStore((s) => s.endWeek);
  const open = useStore((s) => s.open);
  return (
    <button
      className="endweek"
      onClick={() => {
        const w = endWeekWarnings(g);
        if (w.length) open({ kind: 'warnings', warnings: w });
        else endWeek();
      }}
    >
      End Week ▸
    </button>
  );
}

function Title() {
  const { startNew, continueGame, open, loadSlot } = useStore.getState();
  const sheets = useStore((s) => s.sheets);
  const auto = hasAutosave();
  const slots = [1, 2, 3].map((n) => ({ n, info: slotInfo(n) })).filter((x) => x.info);
  return (
    <div className="title-screen">
      <div className="title-art">⚖⚔</div>
      <h1>Ledger &amp; Blade</h1>
      <p className="tagline">The realm owes a fortune. Everyone needs a blade. Keep your books balanced.</p>
      <div className="title-actions">
        {auto && (
          <button className="btn primary block" onClick={continueGame}>
            Continue
          </button>
        )}
        <button className={`btn block ${auto ? 'ghost' : 'primary'}`} onClick={() => (!auto || confirm('Start a new guild? Your autosave will be replaced.')) && startNew()}>
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
      </div>
      <p className="tiny muted">Prototype build · progress is saved on this device</p>
      {sheets.map((s, i) => (s.kind === 'menu' ? <MenuSheet key={i} /> : s.kind === 'help' ? <HelpSheet key={i} /> : null))}
    </div>
  );
}

function GameOver() {
  const g = useStore((s) => s.game)!;
  const { startNew, quit } = useStore.getState();
  const dead = g.members.filter((m) => m.status === 'dead').length;
  return (
    <div className="title-screen">
      <div className="title-art">✝</div>
      <h1>The Ledger Closes</h1>
      <p>{g.gameOver!.text}</p>
      <p className="muted small">
        Your guild lasted until {dateLabel(g.gameOver!.week)}. Renown {g.renown}. {dead} member(s) fell in your service. {g.history.length} missions completed.
      </p>
      <div className="title-actions">
        <button className="btn primary block" onClick={startNew}>
          Found a new guild
        </button>
        <button className="btn ghost block" onClick={quit}>
          Title screen
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const game = useStore((s) => s.game);
  const tab = useStore((s) => s.tab);
  const sheets = useStore((s) => s.sheets);
  const toast = useStore((s) => s.toast);

  if (!game)
    return (
      <>
        <Title />
        {toast && <div className="toast">{toast.text}</div>}
      </>
    );
  if (game.gameOver) return <GameOver />;

  const reportOpen = sheets.some((s) => s.kind === 'report' || s.kind === 'mission');
  const event = !reportOpen ? game.pendingEvents[0] : undefined;

  return (
    <div className="app">
      <TopBar />
      <main className="main">
        {tab === 'hall' && <HallScreen />}
        {tab === 'contracts' && <ContractsScreen />}
        {tab === 'roster' && <RosterScreen />}
        {tab === 'armory' && <ArmoryScreen />}
        {tab === 'realm' && <RealmScreen />}
      </main>
      {sheets.length === 0 && <EndWeekButton />}
      <BottomNav />
      {sheets.map((s, i) => {
        switch (s.kind) {
          case 'planner':
            return <Planner key={i} contractId={s.contractId} />;
          case 'member':
            return <MemberSheet key={i} id={s.id} />;
          case 'mission':
            return <MissionReplay key={i} id={s.id} />;
          case 'report':
            return <WeekReport key={i} dispatchIds={s.dispatchIds} week={s.week} before={s.before} />;
          case 'warnings':
            return <WarningsSheet key={i} warnings={s.warnings} />;
          case 'menu':
            return <MenuSheet key={i} />;
          case 'help':
            return <HelpSheet key={i} />;
          case 'confirm':
            return <ConfirmSheet key={i} {...s} />;
        }
      })}
      {event && <EventCard ev={event} />}
      {toast && <div className="toast">{toast.text}</div>}
    </div>
  );
}
