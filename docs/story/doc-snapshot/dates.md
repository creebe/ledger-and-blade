## Dates

Dated checkpoints the player prepares for. _met_, _missed_ and _gone_ are the dispatch lines.

### The Weighhouse Collects

`date:first_payment` · data/dates.ts:60

- _who:_ “Alderman Coster's clerk”
- _text:_

  > Coster's clerk comes for the first payment on the guild's note. Coster does not expect it to be late, and he has said so in writing.

- _available:_ when week <= 2 and loans.length > 0 and loans[0].dueWeek - week >= 3
- _met:_

  > The clerk counted the payment twice and initialled the receipt in two places. Coster sends word that the sum was correct to the penny, and that he has noted the date.

- _missed:_

  > The clerk went back to the Weighhouse with less than he came for. Coster has written the guild into his book in red ink, which he keeps for this.

- _gone:_

  > Coster's clerk did not come. The Weighhouse masters are going through Coster's own books, and the guild's payment goes to them as usual.


### The Exchequer's List

`date:exchequer_list` · data/dates.ts:79

- _who:_ “The Lord Treasurer's office”
- _text:_

  > Fenn's clerks are drawing up a list of the chartered guilds fit for Crown work. They will judge the guild by what it has done, which so far is not much.

- _available:_ when week <= 9
- _met:_

  > Ledger & Blade is on the Exchequer's list, just below a firm of rat-catchers. Fenn's clerks have the guild's charter number on file now.

- _missed:_

  > The list went to the Lord Treasurer without the guild on it. Jory checked, and the rat-catchers made it.


### The Council Votes

`date:council_vote` · data/dates.ts:99

- _who:_ “The Council of Varrow”
- _text:_

  > The nine seats vote at the end of the season. The aldermen remember which guilds backed the winning side, and they keep a list of the charter numbers of the ones that didn't.

- _available:_ when council.agenda.length > 0 and council.voteWeek is not undefined and council.voteWeek - week >= 2
- _met:_

  > The guild backed a winner, and the aldermen noticed. Two of them now say the guild's name correctly.

- _missed:_

  > The votes went the other way, or the guild never said which way it wanted them. Either way, two aldermen have stopped answering the guild's letters.


### The Lord Treasurer Visits

`date:treasurer_visit` · data/dates.ts:115

- _who:_ “Lord Treasurer Fenn”
- _text:_

  > The silver reached the coast, and Fenn is coming to see the hall for himself. He would like to find a guild the Crown can go on being seen with, which means good standing with the Exchequer and not much Heat.

- _available:_ when silver_delivered
- _met:_

  > Fenn stayed an hour and drank the bad wine without comment. On his way out he left a letter of introduction, and apologized for it being so short.

- _missed:_

  > Fenn kept his visit short and his coat on. His secretary took notes, and you'd rather not know what they say.

- _Reads:_ `silver_delivered` (from contract **The Crown's Last Silver** (`silver_convoy`))

### Ostrander's Reads the Books

`date:vorn_books` · data/dates.ts:136

- _who:_ “Factor Vorn”
- _text:_

  > Vorn wants to see the guild's books before the bank sends more work. She has asked for them clean, with a balance she can take seriously: at least {setAt(s, 'vorn_books', 'crowns', round10(Math.max(450, weeklyCosts(…} crowns.

- _available:_ when ostranders_open and week >= 8
- _met:_

  > Vorn read every page and corrected two sums in your favor. A retainer came the next morning, with a note from her that said "Adequate."

- _missed:_

  > Vorn closed the ledger after the third page and said the bank would be in touch. She didn't take a copy.

- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Saint Oda's Fair

`date:oda_fair` · data/dates.ts:157

- _who:_ “Sister Brune”
- _text:_

  > The almshouse holds its fair on the green, and every guild in Varrow is expected to send food and be seen sending it. Sister Brune keeps a list of who gave what, and the Lower Town reads it.

- _available:_ when met_oda
- _met:_

  > The guild's carts reached the green before the Weighhouse's did. Sister Brune wrote the guild's name at the top of her list, then crossed it out and wrote it bigger.

- _missed:_

  > The fair went on without much from the guild. Sister Brune wrote its name near the bottom of her list, just under a baker who sent one loaf.

- _Reads:_ `met_oda` (from **Fever Salts** (`brune_salts`))

### The Exchequer's Auditors

`date:auditors` · data/dates.ts:177

- _who:_ “The Exchequer”
- _text:_

  > The Exchequer is sending auditors round the chartered guilds, starting with the ones people complain about. The guild came up.

- _available:_ when heat >= 20
- _met:_

  > The auditors found the guild dull, which was the idea. They left early to audit someone more interesting.

- _missed:_

  > The auditors found enough to write down and more to ask about. They took two of the ledgers away and gave a receipt for one.


### The Porters' Feast

`date:porters_feast` · data/dates.ts:193

- _who:_ “The Porters' Fraternity”
- _text:_

  > The porters eat together a few times a year, and they only invite people they trust to carry something heavy. [IF alive(s, 'dagny') and (dagny_friend or dagny_contact)] Dagny says the guild might be asked. [ELSE] The guild has not been asked yet. [END]

- _available:_ when week >= 8 and unrest clock < 80
- _met:_

  > The guild was asked, and went. Nobody made a speech. Two porters told your people things about the docks you'd have paid for.

- _missed:_

  > The feast went ahead without the guild. Word from the docks is that the porters roasted two pigs, and nobody mentioned the guild once.

- _cancel.when:_ when unrest clock >= 85
- _cancel.text:_

  > The feast was called off. The Lower Town is too angry this season to sit down together, even to eat.

- _Reads:_ `dagny_friend` (from **Bread and Stones** (`bread_riot`)); `dagny_contact` (from **Bread and Stones** (`bread_riot`))

### The Weighhouse Reviews the Note

`date:loan_review` · data/dates.ts:213

- _who:_ “Alderman Coster”
- _text:_

  > Coster reviews every note on his books twice a year, with his brass balance on the desk. If the guild has paid the Weighhouse well since the last review, he lowers the rate, and if it hasn't, he raises it and explains why at length.

- _available:_ when week >= 14 and loans.length > 0 and loans[0].principal >= 200
- _met:_

  > Coster weighed the payments on his balance and, after a long sigh, lowered the rate on the note.

- _missed:_

  > Coster raised the rate on the note. He was very sorry about it, and he wrote the new figure down before he said so.

- _gone:_

  > The review was called off. The Weighhouse masters are going through Coster's own books this month, and nobody has time for the guild's.


### The Muster on the Green

`date:muster` · data/dates.ts:231

- _who:_ “The Crown's muster officers”
- _text:_

  > Every so often the Crown counts the swords for hire in Varrow, on the green, in public. The free companies send their best and stand up straight.

- _available:_ when week >= 10
- _met:_

  > The officers counted the guild and wrote it down near the top. Two children followed your people home, which Jory says is how fame starts.

- _missed:_

  > The guild looked thin on the green next to the free companies. The officers counted it anyway, without much interest.


### Before the Snow

`date:winter_stores` · data/dates.ts:247

- _who:_ “Jory Abbot”
- _text:_

  > Jory has pinned a note to the larder door. Winter closes the roads and drives up the price of bread, and he would like {setAt(s, 'winter_stores', 'supplies', Math.max(20, living(s).length…} supplies in store before it does.

- _available:_ when seasonOf(week) is 'Autumn' and seasonWeek(week) <= 8
- _met:_

  > The stores are full, and the hall smells of smoked fish. Jory has hung the onions from the rafters, where he says the rats can't reach them.

- _missed:_

  > Winter came before the stores were full. Jory has started counting the bread out loud at supper.


### Marta Hobb's Wager

`date:hobbs_wager` · data/dates.ts:263

- _who:_ “Marta Hobb”
- _text:_

  > Marta Hobb has told half the Copper Kettle that her daughters will be better known than your guild by the end of the month. She has put twenty crowns on it with the landlord.

- _available:_ when week >= 12 and hobbs active and not hobbsAtWar(s)
- _met:_

  > Marta paid her bets in full and sent the guild a cake. The cake was very good, and the note with it said she'd win the next one.

- _missed:_

  > Marta collected on her wager in the Copper Kettle, loudly, while two of your people were drinking there.

- _cancel.when:_ when not alive(s, 'marta') or hobbsAtWar(s)
- _cancel.text:_

  > [IF alive(s, 'marta')] Marta has called off her wager. Nobody bets on a guild her firm is at war with. [ELSE IF alive(s, 'isbet')] With Marta dead, the wager is off. Isbet paid back all thirty-one bets herself and kept a receipt for each. [ELSE] With Marta dead, the wager is off. Her younger daughters paid back the bets on their way to the coast. [END]

