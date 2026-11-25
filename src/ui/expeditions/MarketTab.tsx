import { GEAR, GOODS, SUPPLIES, SUPPLY_IDS, buyExpSupplies, buyGear, sellGear, sellGoods, storedGear, type GearDef, type GoodId } from '../../engine';
import { useX } from '../../expStore';
import { useStore } from '../../store';
import { Btn, Price, Section } from '../kit/common';
import { xShort } from './xkit';

export function gearLine(d: GearDef) {
  if (d.slot === 'weapon') return `${d.focus ? 'Focus' : d.ranged ? 'Ranged' : 'Melee'}, power ${d.power}${d.element ? `, ${d.element}` : d.focus ? '' : `, ${d.damage}`}`;
  if (d.slot === 'armor') return `Protection ${d.protection}${d.bulk ? `, dodge −${d.bulk}` : ''}`;
  return d.description;
}

export function MarketTab() {
  const g = useX((s) => s.game)!;
  const act = useX((s) => s.act);
  const confirm = useStore((s) => s.confirm);
  const notify = useStore((s) => s.notify);
  const goods = (Object.keys(g.goods) as GoodId[]).filter((k) => (g.goods[k] ?? 0) > 0);
  const total = goods.reduce((s, k) => s + (g.goods[k] ?? 0) * GOODS[k].value, 0);
  const stored = storedGear(g);
  return (
    <div className="screen">
      <h1 className="screen-title">The Market</h1>
      <Section title="What came up from Pellam">
        {goods.length ? (
          <>
            {goods.map((k) => (
              <div key={k} className="x-good row between">
                <span>
                  <b>{g.goods[k]}</b> {GOODS[k].name}
                  <small className="muted"> · {GOODS[k].text}</small>
                </span>
                <Price n={(g.goods[k] ?? 0) * GOODS[k].value} />
              </div>
            ))}
            <Btn className="btn primary block" onClick={() => notify(`Sold for ${act((x) => void sellGoods(x)) ?? total} crowns.`)}>
              Sell it all for <Price n={total} />
            </Btn>
          </>
        ) : (
          <p className="empty">Nothing to sell. Old Pellam is full of things worth selling.</p>
        )}
      </Section>
      <Section title="Supplies">
        <p className="muted small">Supplies go in the pack. Anything you don't have in the stores is bought when you pack it, so this is only for stocking up.</p>
        {SUPPLY_IDS.map((k) => (
          <div key={k} className="x-supply-row row between">
            <span>
              <b>{SUPPLIES[k].name}</b> <small className="muted">· {g.stores[k]} in the stores</small>
            </span>
            <Btn
              className="btn small"
              blocked={xShort(g, SUPPLIES[k].price, `A ${SUPPLIES[k].one}`)}
              onClick={() => confirm({ title: `Buy a ${SUPPLIES[k].one}?`, body: SUPPLIES[k].text, cost: `${SUPPLIES[k].price} crowns`, confirmLabel: 'Buy', onConfirm: () => notify(act((x) => buyExpSupplies(x, k, 1)) ?? `Bought a ${SUPPLIES[k].one}.`) })}
            >
              Buy 1 <Price n={SUPPLIES[k].price} />
            </Btn>
          </div>
        ))}
      </Section>
      <Section title="Gear for sale this week">
        {g.stock.map((id) => {
          const d = GEAR[id];
          return (
            <div key={id} className="card x-gear-row">
              <span className="row between">
                <b>{d.name}</b>
                <Price n={d.price} />
              </span>
              <small className="muted">{gearLine(d)}</small>
              {d.slot !== 'trinket' && <small>{d.description}</small>}
              <Btn
                className="btn small"
                blocked={xShort(g, d.price, d.name)}
                onClick={() => confirm({ title: `Buy the ${d.name.toLowerCase()}?`, body: `${d.description} It goes into the store, and you can give it to anyone from their sheet.`, cost: `${d.price} crowns`, confirmLabel: 'Buy', onConfirm: () => notify(act((x) => buyGear(x, id)) ?? `The ${d.name.toLowerCase()} is in the store.`) })}
              >
                Buy
              </Btn>
            </div>
          );
        })}
      </Section>
      <Section title="In the store">
        {stored.length ? (
          stored.map((it) => (
            <div key={it.uid} className="x-good row between">
              <span>
                <b>{GEAR[it.defId].name}</b> <small className="muted">· {gearLine(GEAR[it.defId])}</small>
              </span>
              <Btn className="btn small ghost" onClick={() => notify(act((x) => sellGear(x, it.uid)) ?? `Sold for ${Math.floor(GEAR[it.defId].price / 2)} crowns.`)}>
                Sell <Price n={Math.floor(GEAR[it.defId].price / 2)} />
              </Btn>
            </div>
          ))
        ) : (
          <p className="empty">Everything the guild owns is being worn.</p>
        )}
      </Section>
    </div>
  );
}
