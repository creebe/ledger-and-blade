import { APPROACH_INFO } from '../../engine';
import { Sheet } from '../kit/common';
import { Icon } from '../kit/icons';
import { APPROACHES, ApproachChip, OddsPill } from '../kit/visual';

export function HelpSheet() {
  return (
    <Sheet title="How to play">
      <div className="help">
        <p>
          You run <b>Ledger & Blade</b>, a guild in Varrow, a city drowning in the realm's debt to Ostrander's bank. Each turn is one week. Plan freely, then press <b>End Week</b>, and everything you set in motion
          resolves at once.
        </p>
        <h4>Reading the colors</h4>
        <div className="legend">
          {APPROACHES.map((a) => (
            <div key={a} className="legend-row">
              <ApproachChip a={a} small />
              <span className="small muted">{APPROACH_INFO[a].blurb}</span>
            </div>
          ))}
          <div className="legend-row">
            <span className="tag enemy">
              <Icon name="soldiers" size={13} /> Enemy
            </span>
            <span className="tag env">
              <Icon name="cold" size={13} /> Terrain
            </span>
            <span className="small muted">Tags: what you'll face. Dashed “?” tags are unknown.</span>
          </div>
          <div className="legend-row">
            <OddsPill min={0.8} max={0.8} />
            <OddsPill min={0.45} max={0.65} />
            <OddsPill min={0.2} max={0.3} />
            <span className="small muted">Good, uncertain, poor odds.</span>
          </div>
        </div>
        <h4>The ledger</h4>
        <p>
          Wages, hall upkeep and supplies are due every week, and your Weighhouse loan wants a payment every four. Four weeks in the red, or three missed loan payments, and the guild is finished. The Hall shows a
          four-week projection.
        </p>
        <h4>Contracts</h4>
        <p>
          Pick a contract and choose a squad. Each mission is a series of <b>phases</b>, and each phase can be tackled with an <b>approach</b>: Assault, Stealth, Guile, Endurance or Arcana. Every approach uses
          different attributes and adds up the squad differently. Stealth is only as good as your clumsiest member, while Assault counts everyone's blades.
        </p>
        <p>
          Phase odds come from your squad's score against the phase's difficulty. Tap <b>Why?</b> to see every number. The final phase is the objective. Strong results make the next phase easier, and failures make
          it harder and hurt people.
        </p>
        <h4>Tags and preparation</h4>
        <p>
          Enemies and environments have <b>tags</b>. Armored enemies laugh at swords but fear hammers, Fireborn shrug off fire but dread frost, and Cold saps endurance unless someone packs furs. Weapons, oils, salts
          and kit counter tags. Unknown tags (“?”) turn your odds into a <b>range</b>. Spend Intel or send a Scout ahead to know what you face.
        </p>
        <h4>People</h4>
        <p>
          Members tire, bleed, level up and can die for good. Wounded and exhausted members perform badly, so rest them. Idle members can train, gather rumors (Intel), work the docks, or scout a contract. Unpaid or
          unhappy members lose loyalty, and Hobb & Daughters will poach the disloyal.
        </p>
        <h4>The realm</h4>
        <p>
          Every contract pleases someone and annoys someone else. Watch your standing with the Exchequer (who holds your charter), the Weighhouse, Ostrander's and the Lower Town, and keep your Heat low. The Debt
          clocks show where the realm is heading.
        </p>
      </div>
    </Sheet>
  );
}
