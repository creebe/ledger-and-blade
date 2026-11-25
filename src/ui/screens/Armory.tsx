import {
  STORE_IDS,
  SUPPLIES,
  GOODS,
  buyStores,
  goodsValue,
  sellGoods,
  type GoodId,
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
import { Btn, Empty, Price, Section, Seg } from '../kit/common';
import { SLOT_LABEL, crowns } from '../kit/format';
import { Icon } from '../kit/icons';
import { ItemIcon, ItemStats } from '../kit/visual';
import { WorkshopPanel } from '../panels/Buildings';
import { short } from '../kit/shortfall';

export function ArmoryScreen() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  type ArmoryTab = 'market' | 'stores' | 'workshop' | 'materials';
  const tab = (useStore((s) => s.subTabs.armory) as ArmoryTab | undefined) ?? 'market';
  const setTab = (t: ArmoryTab) => useStore.getState().setSubTab('armory', t);
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
            guide="supplies"
            title={
              <>
                <Icon name="sack" size={18} /> Supplies
              </>
            }
          >
            <p className="small">
              Food, fodder and lamp-oil. Each member eats 1 a week, and squads carry their own. Bigger orders are cheaper. Price now: <b><Price n={supplyPrice(g)} /></b> each.
            </p>
            <div className="row wrap gap">
              {[5, 10, 20, 40].map((n) => (
                <Btn key={n} className="btn ghost small" blocked={short(g, 'crowns', supplyCost(g, n), `${n} supplies`)} onClick={() => buySuppliesFlow(n)}>
                  +{n} · <Price n={supplyCost(g, n)} />
                  {supplyDiscount(n) ? <small className="good"> −{Math.round(supplyDiscount(n) * 100)}%</small> : null}
                </Btn>
              ))}
            </div>
          </Section>
          <Section title="Expedition stores">
            <p className="small">What squads pack besides food. Anything short when a squad sets out is bought then, at these prices.</p>
            {STORE_IDS.map((k) => (
              <div key={k} className="x-pack-row">
                <span className="x-pack-what">
                  <span>
                    <b>{SUPPLIES[k].name}</b>
                    <small className="muted"> · {g.stores[k] ?? 0} in the stores · <Price n={SUPPLIES[k].price} /> each</small>
                  </span>
                </span>
                <Btn
                  className="btn ghost small"
                  blocked={short(g, 'crowns', SUPPLIES[k].price * SUPPLIES[k].perSlot, SUPPLIES[k].name.toLowerCase())}
                  onClick={() =>
                    confirm({
                      title: `Buy ${SUPPLIES[k].perSlot} ${SUPPLIES[k].name.toLowerCase()}?`,
                      body: [`The stores go from ${g.stores[k] ?? 0} to ${(g.stores[k] ?? 0) + SUPPLIES[k].perSlot}.`],
                      cost: `Costs ${crowns(SUPPLIES[k].price * SUPPLIES[k].perSlot)} · treasury ${g.crowns} → ${g.crowns - SUPPLIES[k].price * SUPPLIES[k].perSlot}`,
                      confirmLabel: 'Buy',
                      onConfirm: () =>
                        act((d) => buyStores(d, k, SUPPLIES[k].perSlot)) &&
                        notify(`Bought ${SUPPLIES[k].perSlot} ${SUPPLIES[k].name.toLowerCase()}. The stores now hold ${(g.stores[k] ?? 0) + SUPPLIES[k].perSlot}.`),
                    })
                  }
                >
                  +{SUPPLIES[k].perSlot} · <Price n={SUPPLIES[k].price * SUPPLIES[k].perSlot} />
                </Btn>
              </div>
            ))}
          </Section>
          {goodsValue(g) > 0 && (
            <Section title="Goods from expeditions">
              {(Object.keys(g.goods) as GoodId[])
                .filter((k) => (g.goods[k] ?? 0) > 0)
                .map((k) => (
                  <div key={k} className="row between small">
                    <span>
                      {g.goods[k]} × {GOODS[k].name}
                    </span>
                    <Price n={(g.goods[k] ?? 0) * GOODS[k].value} />
                  </div>
                ))}
              <button
                className="btn primary small"
                onClick={() => {
                  const v = goodsValue(g);
                  confirm({
                    title: 'Sell everything the squads brought back?',
                    body: ['All the goods above go to the market at once. Materials stay in the stores.'],
                    cost: `Earns ${crowns(v)} · treasury ${g.crowns} → ${g.crowns + v}`,
                    confirmLabel: 'Sell it all',
                    onConfirm: () => act((d) => void sellGoods(d)) && notify(`Sold the goods for ${crowns(v)}.`),
                  });
                }}
              >
                Sell it all · <Price n={goodsValue(g)} />
              </button>
            </Section>
          )}
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
                          blocked={short(g, 'crowns', price, def.name)}
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
                          <Price n={price} />
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
                        Sell <Price n={Math.round(def.price * SELL_RATE)} />
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
              <div key={m} className="shop-item mat-row" data-guide={`mat-${m}`}>
                <span className="item-icon" style={{ width: 34, height: 34 }}>
                  <Icon name={m} size={18} />
                </span>
                <div className="card-main">
                  <b>{MATERIAL_INFO[m].name}</b> <span className="muted">×{g.materials[m]}</span>
                  <div className="tiny muted">
                    Buy <Price n={materialPrice(g, m)} /> · sell about <Price n={price} /> each
                  </div>
                </div>
                <div className="row gap mat-actions">
                  <Btn
                    className="btn small ghost"
                    blocked={short(g, 'crowns', materialPrice(g, m) * 5, `5 ${MATERIAL_INFO[m].name}`)}
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
                    Buy 5 · <Price n={materialPrice(g, m) * 5} />
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
