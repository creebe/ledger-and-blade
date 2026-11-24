import { useEffect, useRef, useState } from 'react';
import { dateLabel, endWeekWarnings, living, upkeep, weeklyWages } from './engine';
import { type Tab, useStore } from './store';
import { MemberSheet } from './ui/sheets/MemberSheet';
import { ConfirmSheet, WarningsSheet } from './ui/sheets/Dialogs';
import { EventCard } from './ui/sheets/EventCard';
import { HelpSheet } from './ui/sheets/HelpSheet';
import { MenuSheet } from './ui/sheets/MenuSheet';
import { MissionReplay } from './ui/sheets/MissionReplay';
import { WeekReport } from './ui/sheets/WeekReport';
import { Planner } from './ui/sheets/Planner';
import { useScrollLock } from './ui/kit/theme';
import { Icon } from './ui/kit/icons';
import { GuideNudge } from './ui/panels/Guide';
import { JournalSheet } from './ui/sheets/Journal';
import { SheetDepth } from './ui/kit/common';
import { ArmoryScreen } from './ui/screens/Armory';
import { ContractsScreen } from './ui/screens/Contracts';
import { HallScreen } from './ui/screens/Hall';
import { RealmScreen } from './ui/screens/Realm';
import { RosterScreen } from './ui/screens/Roster';
import { GameOver, Title } from './ui/screens/Title';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'hall', label: 'Hall', icon: 'hall' },
  { id: 'contracts', label: 'Contracts', icon: 'scroll' },
  { id: 'roster', label: 'Roster', icon: 'people' },
  { id: 'armory', label: 'Armory', icon: 'armor' },
  { id: 'realm', label: 'Realm', icon: 'realm' },
];

function TopBar() {
  const g = useStore((s) => s.game)!;
  const open = useStore((s) => s.open);
  const notify = useStore((s) => s.notify);
  const burn = weeklyWages(g) + upkeep(g);
  const res: { icon: string; c: string; value: string | number; label: string; tone?: string }[] = [
    { icon: 'coin', c: 'crowns', value: g.crowns, label: `Crowns. Weekly costs: ${burn} (wages ${weeklyWages(g)} + upkeep ${upkeep(g)}).`, tone: g.crowns < burn ? 'bad' : '' },
    { icon: 'sack', c: 'supplies', value: g.supplies, label: `Supplies. ${living(g).filter((m) => m.status !== 'mission').length} eaten per week at home; squads carry their own.` },
    { icon: 'eye', c: 'intel', value: g.intel, label: 'Intel. Reveal hidden tags and rival plans.' },
    { icon: 'seal', c: 'influence', value: g.influence, label: 'Influence. Court factions and cool Heat.' },
    { icon: 'star', c: 'renown', value: g.renown, label: 'Renown. Better contracts and goods; rivals take note.' },
    { icon: 'flame', c: 'heat', value: g.heat, label: 'Heat. Legal exposure from shady work.', tone: g.heat >= 60 ? 'bad' : g.heat >= 30 ? 'mid' : '' },
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
        <span className="row">
        <button className="icon-btn journal-btn" onClick={() => open({ kind: 'journal', tab: g.codex.fresh.length ? 'codex' : 'notes' })} aria-label="Journal">
          <Icon name="book" size={21} />
          {g.codex.fresh.length > 0 && <span className="dot" />}
        </button>
        <button className="icon-btn" onClick={() => open({ kind: 'menu' })} aria-label="Menu">
          <Icon name="menu" size={22} />
        </button>
        </span>
      </div>
      <div className="resources">
        {res.map((r, i) => {
          const fl = floats.filter((f) => f.key === keys[i]);
          return (
            <button key={r.label} className={`res ${r.tone ?? ''} ${fl.length ? 'pulse' : ''}`} style={{ ['--rc' as string]: `var(--r-${r.c})` }} onClick={() => notify(r.label)}>
              <Icon name={r.icon} size={16} />
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
    realm: g.council.agenda.filter((a) => a.player === 0).length,
  };
  return (
    <nav className="bottomnav">
      {TABS.map((t) => (
        <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
          <span className="nav-i">
            <Icon name={t.icon} size={24} />
          </span>
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
  const warnings = endWeekWarnings(g);
  const away = g.missions.length;
  return (
    <div className="endweek-bar">
      <span className="endweek-info">
        <GuideNudge />
        {g.tutorial?.enabled && !g.tutorial.finished ? null : warnings.length > 0 ? (
          <span className="meta" style={{ color: 'var(--mid)' }}>
            <Icon name="warn" size={14} />
            {warnings.length} to check
          </span>
        ) : (
          <span className="meta" style={{ color: 'var(--good)' }}>
            <Icon name="check" size={14} />
            Ready
          </span>
        )}
        {away > 0 && !(g.tutorial?.enabled && !g.tutorial.finished) && (
          <span className="meta">
            <Icon name="road" size={14} />
            {away} in the field
          </span>
        )}
      </span>
      <button
        className="endweek"
        data-guide="endweek"
        onClick={() => {
          if (warnings.length) open({ kind: 'warnings', warnings });
          else endWeek();
        }}
      >
        End Week <Icon name="chevron" size={16} />
      </button>
    </div>
  );
}

export default function App() {
  const game = useStore((s) => s.game);
  const tab = useStore((s) => s.tab);
  const sheets = useStore((s) => s.sheets);
  const toast = useStore((s) => s.toast);
  const guideTarget = useStore((s) => s.guideTarget);
  useEffect(() => {
    if (!guideTarget) return;
    const t = window.setTimeout(() => document.querySelector(`[data-guide="${guideTarget}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => window.clearTimeout(t);
  }, [guideTarget]);
  useScrollLock(sheets.length > 0 || (!!game && !game.gameOver && game.pendingEvents.length > 0));

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
        // panels under the top one stay mounted (keeping their state) but hidden
        let topFull = -1;
        sheets.forEach((x, k) => {
          if (x.kind !== 'confirm') topFull = k;
        });
        const hidden = s.kind !== 'confirm' && i < topFull;
        const depth = sheets.slice(0, i).filter((x) => x.kind !== 'confirm').length;
        const el = (() => {
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
          case 'guide':
            return <JournalSheet key={i} tab="notes" />;
          case 'journal':
            return <JournalSheet key={i} tab={s.tab} />;
        }
        })();
        return (
          <SheetDepth.Provider key={i} value={depth}>
            <div style={hidden ? { display: 'none' } : undefined}>{el}</div>
          </SheetDepth.Provider>
        );
      })}
      {event && <EventCard ev={event} />}
      {toast && <div className="toast">{toast.text}</div>}
      {guideTarget && <style>{`[data-guide="${guideTarget}"] { animation: guidepulse 1.1s ease-in-out 4; border-radius: 12px; }`}</style>}
    </div>
  );
}
