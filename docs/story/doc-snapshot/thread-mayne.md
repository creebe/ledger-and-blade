## Thread: The Ninth

Captain Rufus Mayne. The disbanded regiment, recruiting from your roster.

### An Offer for Your Best

`mayne_offer` · Story beat 9 · data/cast.ts:280

**When:** Weeks 10–14; picks a member where m.status is 'idle' and (FIGHTERS.includes(m.profession) or m.level >= 2); needs alive: Captain Rufus Mayne; 45% a week inside the window.

**Reads:** `mayne_q_ford` (set by this scene).

_Speaker: Captain Rufus Mayne_

> There is a new company in Varrow. The Ninth have taken the whole upstairs of the Copper Kettle, and their captain has been buying drinks for half the city.
>
> At the moment he is buying them for {member full name}. You find the two of them at a corner table, and Captain Rufus Mayne gets up to shake your hand before you've said anything.
>
> "You'll be the guildmaster. I've been telling {member} what we pay. I won't lie to you: it's more than you do."[IF m.traits.includes('veteran')] 
>
> {member} was at Cassel Ford, and so was Mayne. They have been talking about it for two hours. [END]

- **Ask what happened to the Ninth after the war** · `mayne_offer/root/c1`
  Shown only if: not mayne_q_ford.
  → goes to node `ford`
  Sets `mayne_q_ford`.
- **Match his offer** · _{member}: wage +2, loyalty +15. The Ninth will remember being outbid._ · `mayne_offer/root/c2`
  “Mayne laughs and raises his cup to you. "Fair. I'd have done the same." He is already looking round the room for someone else.”
  Sets `ninth_active`.
- **Let {member} decide** · _If {member}'s loyalty is under 50 (it is {Math.round(m.loyalty ?? 0)}), they go with Mayne._ · `mayne_offer/root/c3`
  “[IF ((m.loyalty ?? 0) >= 50)] {member} thinks about it for a while, then thanks Mayne for the drink and says no. Mayne takes it well. He has had a lot of practice. [ELSE] {member} glances at Mayne and says they'll go. They come back for their things the next morning and can't quite look anyone in the eye. [END]”
  Sets `ninth_active`.
- **Remind them they are under contract** · _{member}: loyalty −15. Mayne −10._ · `mayne_offer/root/c4`
  “{member} goes quiet and finishes the drink. Mayne doesn't argue, but he writes your guild's name on the inside of his cuff.”
  Sets `ninth_active`.

**Node `ford`**, Captain Mayne

> "Disbanded," Mayne says. "Article nine of the treaty, which I've always thought was a bit much. They paid us off in Crown Pennies, and a year later the Pennies were worth half."
>
> "So we kept the name and went freelance. People will always pay soldiers. They just won't pay them on time."[IF m.traits.includes('veteran')]  {member} nods. They were paid off the same way. [END]

_Same choices as the opening (one shared menu)._

**Leads to:**

- `mayne_q_ford` → _nothing reads it_
- `ninth_active` → codex "Captain Rufus Mayne" (`mayne`), Jory "j_mayne" (`j_mayne`), rules in `src/engine/story/scenes.ts`
