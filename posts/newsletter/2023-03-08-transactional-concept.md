---
title: "Foundational Paper: The Transaction Concept"
author: "Elias Nema"
date: "2023-03-08"
description: "Jim Gray, June 1981"
image: ../df2-small.png
lightbox: true
---

[“The Transaction Concept: Virtues and Limitations”](https://jimgray.azurewebsites.net/papers/theTransactionConcept.pdf) paper lays down the foundation for the transactions in computer systems. It describes the concepts of ACID (not yet acronymized in the paper), undo and redo logs, and design for highly available systems. I enjoyed the paper a lot. Simple language, analogies, and a look at history make it a stark contrast to many of the modern papers, where looking sophisticated is often more important than the substance.

As always, I start with the visual representation of the paper in which I distilled and connected the most important points:

![Diagram: the concept of a transaction as described by Jim Gray in 1981.](https://www.eliasnema.com/data-feed/paper-transactional-model/transactional-model-sm.png)

But the paper itself is far more poetic. For example, from now on that’s the only acceptable history horizon to look back at a problem:

- *“The legendary Greeks, Ariadne and Theseus, **invented logging.** Ariadne gave Theseus a magic ball of string which he unraveled as he searched the Labyrinth for the Minotaur. Having slain the Minotaur, Theseus followed the string back to the entrance rather then remaining lost in the Labyrinth. This string was his log allowing him to undo the process of entering the Labyrinth. But the Minotaur was not a protected object so its death was not undone by Theseus’ exit.”*
- *“Hansel and Gretel copied Theseus’ trick as they wandered into the woods in search of berries. They left behind a trail of crumbs that would allow them to retrace their steps by following the trail backwards, and would allow their parents to find them by following the trail forwards. This was the first undo and redo log. Unfortunately, a bird ate the crumbs and caused **the first log failure.**”*

Gray talks about transactions in human terms, as derived from the contract law:

- *“The Christian wedding ceremony gives a good example of such a contract. The bride and groom “negotiate” for days or years and then appoint a minister to conduct the marriage ceremony. The minister first asks if anyone has any objections to the marriage; he then asks the bride and groom if they agree to the marriage. If they both say, “I do”, he pronounces them man and wife.”*

He also comes up with **Consistency, Atomicity, and Durability** as properties of a transaction (*Isolation* is not yet explicitly mentioned, but the concept is described in the logging implementation):

- *“If transactions run concurrently, one transaction might read the outputs (updates or messages) of another transaction. If the first transaction aborts, then undoing it requires undoing the updates or messages read by the second transaction. This in turn requires undoing the second transaction. But the second transaction may have already committed and so cannot be undone. To prevent this dilemma, real and protected updates (undoable updates) of a transaction **must be hidden from other transactions until the transaction commits.** To assure that reading two related records, or rereading the same record, will give consistent results, one must also stabilize records which a transaction reads and keep them constant until the transaction commits. Otherwise a transaction could reread a record and get two different answers.”*

Going back to Von Neumann for the concept of building reliable systems by adding redundancy to the systems:

- *“John Von Neumann is credited with the observation that a very reliable (and available) system can be built from unreliable components. Von Neumann’ s idea was to use redundancy and majority logic on a grand scale (20,000 wires for one wire) in order to get mean- times-to-failure measured in decades. Von Neumann was thinking in terms of neurons and vacuum tubes which have mean-times-to-failures measured in days and which are used in huge quantities (millions or billions) in a system. In addition, Von Neumann’s model was flat so that any failure in a chain broke the whole chain.”*

I also haven’t realised how many of the transaction problems in computer come from the possibility of in-place updates:

- *The advent of direct access storage (discs and drums) changed this. It was now possible to update only a part of a file. Rather than copying the whole disc whenever one part was updated, it became attractive to update just the parts that changed in order to construct the new master. Some of these techniques, notably side files and differential files did not update the old master and hence followed good accounting techniques. But **for performance reasons, most disc-based systems have been seduced into updating the data in place.***

And the importance of what now is popular to call **idempotency:**

*\- “Another detail is that the **undo and redo operations must be restartable,** that is if the operation is already undone or redone, the operation should not damage or change the object state. The need for restartability comes from the need to deal with failures during undo and redo processing. Restartability is usually accomplished with version numbers (for disc pages) and with sequence numbers (for virtual circuits or sessions). Essentially, the undo or redo operation reads the version or sequence number and does nothing if it is the desired number. Otherwise it transforms the object and the sequence number.”*
