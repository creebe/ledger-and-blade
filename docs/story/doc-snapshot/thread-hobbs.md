## Thread: Hobb & Daughters

Marta and Isbet Hobb. The rival debt collectors: a share offer, a split behind Marta's back, a cake and an audit.

### Hobb & Daughters

`hobbs_arrive` · Story beat 4 · data/events.ts:193

**When:** Weeks 4–6; after A Visitor from Ostrander's (`ostrander_agent`); needs alive: Marta Hobb, Isbet Hobb; 50% a week inside the window.

_Speaker: Marta Hobb_

> Marta Hobb lets herself in, leaning on a black umbrella she doesn't need, with two of her daughters behind her. Hobb & Daughters have been collecting debts in Varrow for thirty years, and Marta has done most of the talking for all of them.
>
> [IF ostranders standing >= 8] "Now, I hear you've been doing little jobs for the bank," she says, settling into your best chair. "Those used to be my little jobs. I thought we should have a chat before anybody gets upset."
>
>  [ELSE] "I like to call on the new guilds," she says, settling into your best chair. "Most of them don't last the year, and I like to have said hello."
>
>  [END]"So here's my offer. You pay me a quarter of what your contracts bring in, and my girls leave your work alone. Everybody stays friends."

- **What's in it for me, exactly?** · `hobbs_arrive/root/c1`
  → goes to node `details`
- **Refuse politely** · _Hobbs become more aggressive._ · `hobbs_arrive/root/c2`
  “"Suit yourself, dear." She takes her time getting up, and Isbet holds the door for her.”

**Node `details`**, Marta Hobb

> "Peace and quiet, dear. My girls stop bidding against you. And I play cards with two of the Weighhouse aldermen, who aren't very fond of you at the moment. I could fix that."
>
> Her eldest, Isbet, has wandered over to your weapon rack and is turning one of your swords over in her hands, checking the edge.

- **Sell her the share** · _+150 crowns now, Weighhouse +6. She takes 25% of all contract pay. Renown −3. The Hobbs compete far less._ · `hobbs_arrive/details/c1`
  “Marta counts out the coins herself, one at a time, and has Isbet write you a receipt. It's quiet at supper that night.”
  Sets `hobbs_share`.
- **Refuse politely** · _Hobbs become more aggressive._ · `hobbs_arrive/details/c2`
  “"Suit yourself, dear." She takes her time getting up, and Isbet holds the door for her.”
- **Humiliate her in front of her daughters** · _Guile check. Success: Renown +4. Failure: Renown −2. Either way, the Hobbs grow much more aggressive, and it becomes personal._ · (guile check, difficulty 13) · `hobbs_arrive/details/c3`
  On success: “You say something about the umbrella that makes her youngest daughter snort before she can stop herself. Marta doesn't laugh. By evening the line is being repeated in taverns all along the river.”
  On failure: “Marta laughs, leans over and pats your hand. That's the part people repeat for the rest of the week.”

**Leads to:**

- `hobbs_share` → **The Copper Kettle** (`isbet_kettle`), **Isbet Checks the Books** (`hobbs_audit`), rules in `src/engine/missions/missions.ts`, rules in `src/engine/rivals/war.ts`

### The Copper Kettle

`isbet_kettle` · Story beat 12 · data/cast.ts:396

**When:** Weeks 12–16; after Hobb & Daughters (`hobbs_arrive`); needs alive: Isbet Hobb; 45% a week inside the window.

**Reads:** `hobbs_share` (set by **Hobb & Daughters** (`hobbs_arrive`)).

_Speaker: Isbet Hobb_

> A note in very small handwriting asks you to the Copper Kettle at the fourth bell. It is signed I. H.
>
> Isbet Hobb is at the back with a pot of small beer and two cups. She pours for you before you sit down.
>
> "There are about thirty river jobs a season," she says. "Mostly escorts and collections. My mother wants all thirty. I would settle for eighteen, and you would have the other twelve."[IF hobbs_share] 
>
> "I know you already pay us a quarter. This is a separate arrangement, between you and me." [END]

- **Does your mother know you are here?** · `isbet_kettle/root/c1`
  → goes to node `mother`
- **Agreed** · _Hobb & Daughters contest far fewer of your contracts. Marta must not find out._ · `isbet_kettle/root/c2`
  “She writes the split on a beer mat, tears it in half and gives you one half. Then she pays for the beer.”
  Sets `isbet_pact`.
- **Tell Marta about this** · _Marta +20, Isbet −30. The Hobbs ease off a little._ · `isbet_kettle/root/c3`
  “You send Marta a short note. She replies with a cake and a card that says "Thank you, dear." Isbet stops drinking at the Copper Kettle.”
  Sets `isbet_betrayed`.
- **No arrangement** · _Isbet −5_ · `isbet_kettle/root/c4`
  “"All right." She finishes her cup. "It was a good offer. You'll work that out in about a year."”

**Node `mother`**, Isbet Hobb

> "She knows I drink here." Isbet turns her cup a quarter turn. "She's sixty-eight. In a few years I'll be running the firm, and I would rather start with an agreement than a feud. She would rather start with a feud. She always has."

- **Agreed** · _Hobb & Daughters contest far fewer of your contracts. Marta must not find out._ · `isbet_kettle/mother/c1`
  “She writes the split on a beer mat, tears it in half and gives you one half. Then she pays for the beer.”
  Sets `isbet_pact`.
- **Tell Marta about this** · _Marta +20, Isbet −30. The Hobbs ease off a little._ · `isbet_kettle/mother/c2`
  “You send Marta a short note. She replies with a cake and a card that says "Thank you, dear." Isbet stops drinking at the Copper Kettle.”
  Sets `isbet_betrayed`.
- **No arrangement** · _Isbet −5_ · `isbet_kettle/mother/c3`
  “"All right." She finishes her cup. "It was a good offer. You'll work that out in about a year."”

**Leads to:**

- `isbet_betrayed` → _nothing reads it_
- `isbet_pact` → **Half a Year** (`act1_slice_end`), rules in `src/engine/economy/board.ts`

### A Cake from Hobb & Daughters

`marta_cake` · Follow-up · data/cast.ts:539

**When:** when scene hobbs_arrive has happened; picks a member where m.level >= 3 and m.status is not 'mission'; needs alive: Marta Hobb; random draw, weight 2; fires once.

**Reads:** `met_oda` (set by **Fever Salts** (`brune_salts`)).

**Checks whether these happened:** **Hobb & Daughters** (`hobbs_arrive`).

> A cake arrives from Hobb & Daughters, iced, with {member full name}'s name written on top in blue. The card says: [IF (marta attitude) >= 10] 'Congratulations on the promotion, dear. Your mother must be proud. M. H.' [ELSE IF (marta attitude) <= -20] 'I hear {member} is doing very well. Do tell them to be careful on the roads. M. H.' [ELSE] 'With compliments on {member}'s progress. M. H.' [END]
>
> {member} wants to know how Marta Hobb knew, and so do you.

- **Eat it** · _Everyone: morale +4_ · `marta_cake/root/c1`
  “It is an excellent cake. Jory tastes it first on principle and says it's safe.”
- **Send it back with a note** · _Renown +1, Marta −5_ · `marta_cake/root/c2`
  “Marta replies by return. She thanks you for your note and asks after {member}'s mother, by name.”
- **Give it to the almshouse** · _Saint Oda's +3_ · `marta_cake/root/c3`
  Shown only if: met_oda.
  “Sister Brune cuts it into forty pieces and says a short prayer for Marta Hobb, which seems to satisfy everyone.”

### Isbet Checks the Books

`hobbs_audit` · Follow-up · data/cast.ts:574

**When:** when hobbs_share and week >= 14; needs alive: Isbet Hobb; random draw, weight 2; fires once.

**Reads:** `hobbs_share` (set by **Hobb & Daughters** (`hobbs_arrive`)).

_Speaker: Isbet Hobb_

> Isbet Hobb arrives with a ledger and spends the afternoon at your counting-room table, going through every contract you've taken since you sold her mother the share. She doesn't find anything wrong, and seems slightly disappointed.
>
> When she has finished, she closes the ledger. "My mother would sell the share back. Two hundred and fifty crowns. She thinks you'll say no."

- **Buy it back** · _−250 crowns. You keep all your contract pay again, and the Hobbs start competing in earnest._ · (needs crowns: 250) · `hobbs_audit/root/c1`
  “Isbet counts the money, writes a receipt and tears the old agreement in half in front of you. "She'll be annoyed," she says. "I'm not."”
  Clears `hobbs_share`.
- **Keep the arrangement** · `hobbs_audit/root/c2`
  “"I'll tell her," Isbet says. "She'll be pleased. She likes being right."”
