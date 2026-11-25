// The expeditions trial: its own shell, title screen and guild tabs.
// The classic game is one tap away (?classic) and keeps its own save.
import { useEffect, useState } from 'react';
import { dateLabel, livingDelvers, type ExpGame } from '../../engine';
import { hasExpSave, useX } from '../../expStore';
import { useStore } from '../../store';
import { ConfirmSheet } from '../sheets/Dialogs';
import { Icon } from '../kit/icons';
import { Toast } from '../kit/Toast';
import { useScrollLock, useTheme } from '../kit/theme';
import { VERSION } from '../../version';
import { HallTab } from './HallTab';
import { SquadTab } from './SquadTab';
import { MarketTab } from './MarketTab';
import { MemberSheetX } from './MemberSheetX';
import { WeekSheet } from './WeekSheet';
import { Prep } from './Prep';
import { LiveLog } from './LiveLog';
import { ResultScreen } from './Result';
import { ProfSilhouette, MonsterSilhouette } from './Silhouette';

function XTitle() {
  const { start, resume } = useX.getState();
  const [theme, toggle] = useTheme();
  const saved = hasExpSave();
  const confirm = useStore((s) => s.confirm);
  return (
    <div className="title-screen x-title">
      <button className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        <Icon name="lamp" size={18} />
      </button>
      <div className="x-title-art" aria-hidden>
        <ProfSilhouette prof="vanguard" size={56} />
        <MonsterSilhouette monster="kiln" size={72} />
        <ProfSilhouette prof="arcanist" size={56} />
      </div>
      <h1>Ledger &amp; Blade</h1>
      <p className="tagline">Under the Lower Town lies Old Pellam, the first town on the river. Somebody has to go down there, and the guild pays.</p>
      <div className="title-actions">
        {saved && (
          <button className="btn primary block" onClick={resume}>
            Continue
          </button>
        )}
        <button
          className={`btn block ${saved ? 'ghost' : 'primary'}`}
          onClick={() =>
            saved
              ? confirm({ title: 'Start a new guild?', body: 'Your trial guild will be replaced. The classic game keeps its own save.', confirmLabel: 'Start again', danger: true, onConfirm: () => start() })
              : start()
          }
        >
          New guild
        </button>
        <a className="btn ghost block x-classic-link" href="?classic">
          Play the classic game
        </a>
      </div>
      <p className="tiny muted title-footnote">Expeditions trial {VERSION} · saved on this device, apart from the classic game</p>
    </div>
  );
}

function XTopBar({ g }: { g: ExpGame }) {
  const notify = useStore((s) => s.notify);
  const wages = livingDelvers(g).reduce((s, d) => s + d.wage, 0);
  const dueIn = g.debt.dueWeek - g.week;
  return (
    <header className="topbar x-topbar">
      <div className="row between topbar-row">
        <span className="date">{dateLabel(g.week)}</span>
        <button className="icon-btn" onClick={() => useX.getState().quit()} aria-label="Back to the title screen">
          <Icon name="menu" size={22} />
        </button>
      </div>
      <div className="x-res">
        <button className={`res ${g.crowns < wages ? 'bad' : ''}`} onClick={() => notify(`Crowns. Wages are ${wages} a week.`)} aria-label={`Crowns ${g.crowns}`}>
          <span className="res-v">
            <Icon name="coin" size={14} />
            <b>{g.crowns}</b>
          </span>
          <small className="res-l">Crowns</small>
        </button>
        <button className="res" onClick={() => notify('Renown, from deeds. It brings better recruits, better gear and better-paying sponsors.')} aria-label={`Renown ${g.renown}`}>
          <span className="res-v">
            <Icon name="star" size={14} />
            <b>{g.renown}</b>
          </span>
          <small className="res-l">Renown</small>
        </button>
        <button
          className={`res ${g.debt.principal > 0 && dueIn <= 1 && g.crowns < g.debt.installment ? 'bad' : g.debt.missed ? 'mid' : ''}`}
          onClick={() =>
            notify(g.debt.principal > 0 ? `The Weighhouse wants ${Math.min(g.debt.installment, g.debt.principal)} crowns ${dueIn <= 0 ? 'this week' : `in ${dueIn} week${dueIn === 1 ? '' : 's'}`}. ${g.debt.principal} owed in all.` : 'The Weighhouse note is paid off.')
          }
          aria-label="The Weighhouse loan"
        >
          <span className="res-v">
            <Icon name="calendar" size={14} />
            <b>{g.debt.principal > 0 ? `${Math.max(0, dueIn)} wk` : 'paid'}</b>
          </span>
          <small className="res-l">Loan due</small>
        </button>
      </div>
    </header>
  );
}

const TABS = [
  { id: 'hall' as const, label: 'Hall', icon: 'hall' },
  { id: 'squad' as const, label: 'Squad', icon: 'people' },
  { id: 'market' as const, label: 'Market', icon: 'coin' },
];

export function ExpApp() {
  const game = useX((s) => s.game);
  const view = useX((s) => s.view);
  const tab = useX((s) => s.tab);
  const sheets = useX((s) => s.sheets);
  const classicSheets = useStore((s) => s.sheets);
  const toast = useStore((s) => s.toast);
  useScrollLock(sheets.length > 0);
  useEffect(() => {
    document.title = 'Ledger & Blade: Expeditions';
  }, []);
  const confirms = classicSheets.map((s, i) => (s.kind === 'confirm' ? <ConfirmSheet key={`c${i}`} {...s} /> : null));
  if (!game)
    return (
      <>
        <XTitle />
        {confirms}
        {toast && <Toast />}
      </>
    );
  if (view === 'log') return <LiveLog />;
  if (view === 'result') return <ResultScreen />;
  if (view === 'prep')
    return (
      <>
        <Prep />
        {sheets.map((s, i) => (s.kind === 'member' ? <MemberSheetX key={i} id={s.id} /> : null))}
        {confirms}
        {toast && <Toast />}
      </>
    );
  if (game.gameOver) return <XGameOver g={game} />;
  return (
    <div className="app x-app">
      <XTopBar g={game} />
      <main className="main">
        {tab === 'hall' && <HallTab />}
        {tab === 'squad' && <SquadTab />}
        {tab === 'market' && <MarketTab />}
      </main>
      {sheets.length === 0 && <PlanButton />}
      <nav className="bottomnav x-nav">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => useX.getState().setTab(t.id)}>
            <span className="nav-i">
              <Icon name={t.icon} size={24} />
            </span>
            <span className="nav-l">{t.label}</span>
          </button>
        ))}
      </nav>
      {sheets.map((s, i) => (s.kind === 'member' ? <MemberSheetX key={i} id={s.id} /> : <WeekSheet key={i} {...s} />))}
      {confirms}
      {toast && <Toast />}
    </div>
  );
}

function PlanButton() {
  return (
    <button className="endweek x-plan" onClick={() => useX.getState().setView('prep')}>
      Plan an expedition <Icon name="chevron" size={18} />
    </button>
  );
}

function XGameOver({ g }: { g: ExpGame }) {
  const [, setX] = useState(0);
  const dead = g.members.filter((m) => m.status === 'dead').length;
  return (
    <div className="title-screen">
      <div className="title-art">✝</div>
      <h1>The Ledger Closes</h1>
      <p>{g.gameOver!.text}</p>
      <p className="muted small">
        The guild lasted until {dateLabel(g.gameOver!.week)}. Renown {g.renown}. {g.expeditions === 1 ? 'One expedition' : `${g.expeditions} expeditions`} went down into Old Pellam, and {dead === 1 ? 'one member' : `${dead} members`} did not come back.
      </p>
      <div className="title-actions">
        <button
          className="btn primary block"
          onClick={() => {
            useX.getState().quit();
            setX(1);
          }}
        >
          Back to the title screen
        </button>
      </div>
    </div>
  );
}
