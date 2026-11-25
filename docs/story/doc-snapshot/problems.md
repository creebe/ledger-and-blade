## Possibly broken or orphaned

Found while extracting. Each is worth a look, but some may be by design.

- 7 outcomes are set but nothing in the game reacts to them yet: no scene, contract, Date, Codex entry, street talk or rule reads them (only the story checker's contradiction test does). `silver_abandoned` (Accepted the commission but never sent the convoy; set by silver_convoy); `fenn_ally` (Took a seat at the Exchequer table after the payment; set by Quarter Day); `weights_failed` (Failed to prove the short weights at Hesketh's; set by false_weights); `isbet_betrayed` (Told Marta about Isbet's offer; set by The Copper Kettle); `tapestry_sold` (Sold the Exchequer's last tapestry quietly in Harrowmere; set by last_tapestry); `tapestry_lost` (Lost the Exchequer's last tapestry on the road; set by last_tapestry); `aske_plate_lost` (Lost the Aske family silver on the way out; set by aske_plate). Half a Year, the act summary, mentions none of them.

Every choice in every scene leads to a node that exists, and every node has a choice leading to it.

### Facts that can never be true together

- `silver_delivered` ⟂ `silver_lost`
- `silver_delivered` ⟂ `silver_declined`
- `silver_accepted` ⟂ `silver_declined`
- `silver_bonus` ⟂ `fenn_haggled`
- `vorn_slip` ⟂ `vorn_q_want`
- `dagny_contact` ⟂ `dagny_friend`
- `riot_fed` ⟂ `riot_held`
- `riot_fed` ⟂ `riot_broken`
- `riot_held` ⟂ `riot_broken`
- `weights_exposed` ⟂ `weights_failed`
- `pask_deal` ⟂ `pask_reported`
- `salts_delivered` ⟂ `salts_failed`
- `isbet_pact` ⟂ `isbet_betrayed`
- `ansel_freed` ⟂ `ansel_lost`
- `tapestry_sold` ⟂ `tapestry_lost`
- `tapestry_sold` ⟂ `tapestry_bought`
- `tapestry_lost` ⟂ `tapestry_bought`
- `aske_plate_saved` ⟂ `aske_plate_lost`
- `aske_plate_saved` ⟂ `aske_betrayed`
- `aske_plate_lost` ⟂ `aske_betrayed`
