import { useState } from 'react';
import {
  buyItem,
  buySupplies,
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
import { Empty, Section, Seg } from '../common';
import { itemSummary, SLOT_LABEL } from '../format';

export function ArmoryScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const [tab, setTab] = useState<'market' | 'stores' | 'materials'>('market');
  const slots: ItemSlot[] = ['weapon', 'armor', 'trinket', 'consumable'];

  return (
    <div className="screen">
      <h1 className="screen-title">Armory</h1>
      <Seg
        value={tab}
        onChange={setTab}
        options={[
          { value: 'market', label: 'Market' },
          { value: 'stores', label: `Stores (${g.items.length})` },
          { value: 'materials', label: 'Materials' },
        ]}
      />

      {tab === 'market' && (
        <>
          <Section title="Supplies">
            <p className="small">
              Food, fodder and lamp-oil. Each member eats 1 a week, and squads carry their own. Price now: <b>{supplyPrice(g)}◉</b> each.
            </p>
            <div className="row wrap gap">
              {[5, 10, 20].map((n) => (
                <button key={n} className="btn ghost small" onClick={() => act((d) => buySupplies(d, n)) && useStore.getState().notify(`Bought ${n} supplies. You now have ${g.supplies + n}.`)}>
                  +{n} for {Math.ceil(supplyPrice(g) * n)}◉
                </button>
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
                        <div>
                          <b>{def.name}</b> {owned > 0 && <span className="tiny muted">(own {owned})</span>}
                          <div className="small">{itemSummary(def)}</div>
                          <div className="tiny muted">{def.description}</div>
                        </div>
                        <button className="btn small primary" disabled={g.crowns < price} onClick={() => act((d) => buyItem(d, id)) && useStore.getState().notify(`Bought ${def.name} for ${price}◉. It's in Stores: equip it from a member's Gear.`)}>
                          {price}◉
                        </button>
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
                      <div>
                        <b>{def.name}</b>
                        <div className="small">{itemSummary(def)}</div>
                        <div className="tiny muted">{holder ? `Held by ${holder.name}` : 'In stores'}</div>
                      </div>
                      <button
                        className="btn small ghost"
                        disabled={holder?.status === 'mission'}
                        onClick={() =>
                          useStore.getState().confirm({
                            title: `Sell ${def.name}?`,
                            body: [holder ? `${holder.name} is using it, and will be left without it.` : 'It goes back to the market for half its price.'],
                            cost: `+${Math.round(def.price * SELL_RATE)}◉`,
                            confirmLabel: 'Sell',
                            danger: !!holder,
                            onConfirm: () => act((d) => sellItem(d, i.uid)),
                          })
                        }
                      >
                        Sell {Math.round(def.price * SELL_RATE)}◉
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Section>
      )}

      {tab === 'materials' && (
        <Section>
          <p className="small muted">Recovered from missions. Crafting arrives in a later update; for now they can be sold. Selling a lot at once drops the price.</p>
          {(Object.keys(MATERIAL_INFO) as MaterialId[]).map((m) => {
            const price = Math.round(materialPrice(g, m) * MATERIAL_SELL_RATE);
            return (
              <div key={m} className="shop-item">
                <div>
                  <b>{MATERIAL_INFO[m].name}</b> <span className="muted">×{g.materials[m]}</span>
                  <div className="tiny muted">Sells for about {price}◉ each</div>
                </div>
                <div className="row gap">
                  <button className="btn small ghost" disabled={g.materials[m] < 1} onClick={() => act((d) => sellMaterial(d, m, 1))}>
                    Sell 1
                  </button>
                  <button className="btn small ghost" disabled={g.materials[m] < 1} onClick={() => act((d) => sellMaterial(d, m, d.materials[m]))}>
                    All
                  </button>
                </div>
              </div>
            );
          })}
        </Section>
      )}
    </div>
  );
}
