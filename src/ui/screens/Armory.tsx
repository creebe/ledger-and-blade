import { useState } from 'react';
import {
  awayReason,
  buyItem,
  buyMaterial,
  buySupplies,
  supplyCost,
  supplyDiscount,
  equippedBy,
  ITEMS,
  itemPrice,
  MATERIAL_INFO,
  MATERIAL_SELL_RATE,
  materialPrice,
  SELL_RATE,
  sellItem,
  sellMaterial,
  supplyPrice,
  type ItemSlot,
  type MaterialId,
} from '../../engine';
import { useStore } from '../../store';
import { Btn, Empty, Section, Seg } from '../kit/common';
import { SLOT_LABEL, crowns } from '../kit/format';
import { Icon } from '../kit/icons';
import { ItemIcon, ItemStats } from '../kit/visual';
import { WorkshopPanel } from '../panels/Buildings';

export function ArmoryScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const [tab, setTab] = useState<'market' | 'stores' | 'workshop' | 'materials'>('market');
  const slots: ItemSlot[] = ['weapon', 'armor', 'trinket', 'consumable'];
  const { confirm, notify } = useStore.getState();
  const buySuppliesFlow = (n: number) => {
    const cost = supplyCost(g, n);
    confirm({
      title: `Buy ${n} supplies?`,
      body: [`The stores go from ${g.supplies} to ${g.supplies + n}.`],
      cost: `Costs ${crowns(cost)} · treasury ${g.crowns} → ${g.crowns - cost}`,
      confirmLabel: `Buy ${n}`,
      onConfirm: () => act((d) => buySupplies(d, n)) && notify(`Bought ${n} supplies for ${crowns(cost)}. You now have ${g.supplies + n}.`),
    });
  };

  return (
    <div className="screen">
      <h1 className="screen-title">Armory</h1>
      <div data-guide="market">
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          { value: 'market', label: 'Shop' },
          { value: 'stores', label: `Inventory (${g.items.length})` },
          { value: 'workshop', label: 'Workshop' },
          { value: 'materials', label: 'Materials' },
        ]}
      />
      </div>

      {tab === 'market' && (
        <>
          <Section
            title={
              <>
                <Icon name="sack" size={18} /> Supplies
              </>
            }
          >
            <p className="small">
              Food, fodder and lamp-oil. Each member eats 1 a week, and squads carry their own. Bigger orders are cheaper. Price now: <b>{crowns(supplyPrice(g))}</b> each.
            </p>
            <div className="row wrap gap">
              {[5, 10, 20, 40].map((n) => (
                <Btn key={n} className="btn ghost small" blocked={g.crowns < supplyCost(g, n) ? `${n} supplies cost ${crowns(supplyCost(g, n))}, and the treasury holds ${crowns(g.crowns)}.` : undefined} onClick={() => buySuppliesFlow(n)}>
                  +{n} · {crowns(supplyCost(g, n))}
                  {supplyDiscount(n) ? <small className="good"> −{Math.round(supplyDiscount(n) * 100)}%</small> : null}
                </Btn>
              ))}
            </div>
          </Section>
          <Section title="For sale this week">
            <p className="tiny muted">Stock changes weekly, and better goods appear as your renown grows. Weak coin raises prices, and Weighhouse friendship lowers them.</p>
            {slots.map((slot) => {
              const items = g.stock.filter((id) => ITEMS[id].slot === slot);
              if (!items.length) return null;
              return (
                <div key={slot}>
                  <h4 className="week-head">{SLOT_LABEL[slot]}s</h4>
                  {items.map((id) => {
                    const def = ITEMS[id];
                    const price = itemPrice(g, id);
                    const owned = g.items.filter((i) => i.defId === id).length;
                    return (
                      <div key={id} className="shop-item">
                        <ItemIcon def={def} />
                        <div className="card-main">
                          <b>{def.name}</b> {owned > 0 && <span className="tiny muted">(own {owned})</span>}
                          <div>
                            <ItemStats def={def} />
                          </div>
                          <div className="tiny muted">{def.description}</div>
                        </div>
                        <Btn
                          className="btn small primary"
                          blocked={g.crowns < price ? `Costs ${crowns(price)}, and the treasury holds ${crowns(g.crowns)}.` : undefined}
                          onClick={() =>
                            confirm({
                              title: `Buy ${def.name}?`,
                              body: [owned ? `You already own ${owned}. It goes into Inventory. Equip it from a member's Gear.` : "It goes into Inventory. Equip it from a member's Gear."],
                              cost: `Costs ${crowns(price)} · treasury ${g.crowns} → ${g.crowns - price}`,
                              confirmLabel: 'Buy',
                              onConfirm: () => act((d) => buyItem(d, id)) && notify(`Bought ${def.name} for ${crowns(price)}. Equip it from a member's Gear.`),
                            })
                          }
                        >
                          {crowns(price)}
                        </Btn>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Section>
        </>
      )}

      {tab === 'stores' && (
        <Section>
          {g.items.length === 0 && <Empty>The armory is empty.</Empty>}
          {slots.map((slot) => {
            const items = g.items.filter((i) => ITEMS[i.defId].slot === slot);
            if (!items.length) return null;
            return (
              <div key={slot}>
                <h4 className="week-head">{SLOT_LABEL[slot]}s</h4>
                {items.map((i) => {
                  const def = ITEMS[i.defId];
                  const holder = equippedBy(g, i.uid);
                  return (
                    <div key={i.uid} className="shop-item">
                      <ItemIcon def={def} />
                      <div className="card-main">
                        <b>{def.name}</b>
                        <div>
                          <ItemStats def={def} />
                        </div>
                        <div className="tiny muted">{holder ? `Held by ${holder.name}` : 'In stores'}</div>
                      </div>
                      <Btn
                        className="btn small ghost"
                        blocked={holder ? awayReason(g, holder) : undefined}
                        onClick={() =>
                          useStore.getState().confirm({
                            title: `Sell ${def.name}?`,
                            body: [holder ? `${holder.name} is using it, and will be left without it.` : 'It goes back to the market for half its price.'],
                            cost: `+${crowns(Math.round(def.price * SELL_RATE))}`,
                            confirmLabel: 'Sell',
                            danger: !!holder,
                            onConfirm: () => act((d) => sellItem(d, i.uid)),
                          })
                        }
                      >
                        Sell {crowns(Math.round(def.price * SELL_RATE))}
                      </Btn>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Section>
      )}

      {tab === 'workshop' && <WorkshopPanel />}

      {tab === 'materials' && (
        <Section>
          <p className="small muted">Recovered from missions, or bought here. Used to craft in the Workshop and to build in the Hall. Buying or selling a lot at once moves the price.</p>
          {(Object.keys(MATERIAL_INFO) as MaterialId[]).map((m) => {
            const price = Math.round(materialPrice(g, m) * MATERIAL_SELL_RATE);
            return (
              <div key={m} className="shop-item">
                <span className="item-icon" style={{ width: 34, height: 34 }}>
                  <Icon name={({ iron: 'anvil', leather: 'hide', timber: 'rough', reagents: 'flask' } as Record<string, string>)[m]} size={18} />
                </span>
                <div className="card-main">
                  <b>{MATERIAL_INFO[m].name}</b> <span className="muted">×{g.materials[m]}</span>
                  <div className="tiny muted">
                    Buy {crowns(materialPrice(g, m))} · sell about {crowns(price)} each
                  </div>
                </div>
                <div className="row gap">
                  <Btn
                    className="btn small ghost"
                    blocked={g.crowns < materialPrice(g, m) * 5 ? `Costs ${crowns(materialPrice(g, m) * 5)}, and the treasury holds ${crowns(g.crowns)}.` : undefined}
                    onClick={() =>
                      confirm({
                        title: `Buy 5 ${MATERIAL_INFO[m].name}?`,
                        body: [`You have ${g.materials[m]} ${MATERIAL_INFO[m].name}. Buying a lot at once pushes the price up.`],
                        cost: `About ${crowns(materialPrice(g, m) * 5)} · treasury ${g.crowns}`,
                        confirmLabel: 'Buy 5',
                        onConfirm: () => act((d) => buyMaterial(d, m, 5)) && notify(`Bought 5 ${MATERIAL_INFO[m].name}. You now have ${g.materials[m] + 5}.`),
                      })
                    }
                  >
                    Buy 5 · {crowns(materialPrice(g, m) * 5)}
                  </Btn>
                  <Btn className="btn small ghost" blocked={g.materials[m] < 1 ? `No ${MATERIAL_INFO[m].name} to sell` : undefined} onClick={() => act((d) => sellMaterial(d, m, 1))}>
                    Sell 1
                  </Btn>
                  <Btn className="btn small ghost" blocked={g.materials[m] < 1 ? `No ${MATERIAL_INFO[m].name} to sell` : undefined} onClick={() => act((d) => sellMaterial(d, m, d.materials[m]))}>
                    All
                  </Btn>
                </div>
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}
