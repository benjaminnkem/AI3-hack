# Mesh incubation deck - speaker notes

## Slide 1

Open with the promise: check before you trust. Mesh turns any digital claim into an Evidence Passport anyone can inspect. Tonight we are not here to explain what Mesh is. We are here to show you it already works, and to propose what we build next with SuperStar.

## Slide 2

Claims travel faster than evidence. A post becomes a screenshot becomes a forward. The source, the date and the uncertainty fall away, and someone acts on it. Mesh reconnects the claim to its evidence.

## Slide 3

SuperStar says no PPT scoring and no empty concepts, so we start with delivery. Mesh is a working product: a web app, a Telegram bot, a documented REST API, independent AI investigators through Gonka Router, live evidence retrieval through Tavily, and a Solidity attestation registry on Ethereum Sepolia. The next slide is a real run.

## Slide 4

A real run. The claim: the Great Wall of China is the only man-made structure visible from space with the naked eye. Mesh split it into four atomic claims. This one came back CONTRADICTED, 0 out of 100, with four opposing sources. Two independent investigators scored the same evidence 66 and 73, and Mesh recorded the 20 point gap instead of averaging it away. The passport was then attested on Ethereum Sepolia and the transaction is confirmed.

## Slide 5

Today Mesh investigates one claim at a time. The proposal is to turn that into an open evidence and trust infrastructure with four reinforcing loops: investigate better, remember claims across posts and translations, update when evidence changes, and let people and agents act on explicit policies. Every new surface reads the same claim, evidence, method and passport history.

## Slide 6

F01, Mesh Memory. The internet repeats claims: the same claim in English, in Yoruba, in a cropped screenshot. Mesh resolves equivalent claims to one canonical proposition, so an investigation is reused instead of repeated. The guardrail matters: we only merge when meaning, place and time truly match, never across negation or incompatible dates.

## Slide 7

F02, adaptive evidence research. Instead of one search, Mesh builds a typed evidence plan: official record, effective date, counter-search, source independence. If critical slots stay empty, Mesh searches more or honestly abstains rather than guessing.

## Slide 8

F03, EvidenceProof. Every citation should earn its place. A cited sentence links to an exact source excerpt, the retrieval record, a preserved snapshot where permitted, and the source family. Five URLs are not five confirmations: lineage shows when reports all repeat one origin.

## Slide 9

F04, living passports. A finding can change but the record cannot. Each refresh creates a new immutable passport version. Readers see what evidence moved, what stayed uncertain, and which version was relied on. The current view is just a pointer; prior hashes and conclusions stay verifiable.

## Slide 10

F05, Passport Watch. Follow a claim and receive one meaningful alert when a source corrects, a dispute opens or a passport becomes stale. It is a quiet subscription until trust changes, delivered by Telegram, web or signed webhook.

## Slide 11

F06, real image verification. A real image can carry a false story. Mesh gives separate findings for image provenance, context match, embedded text and the factual claim in the caption. Authenticity is not context, and the absence of a C2PA credential is not evidence of a fake. This is a concept visual.

## Slide 12

F07, Mesh Lens. An opt-in browser layer finds a current passport for selected text, images or URLs, so people can inspect context without leaving the page. Trust tags show freshness and limits, not a magic verdict. Select, look up, explore. No private automatic scraping.

## Slide 13

F08, Share to Mesh. Forward a claim from web, Telegram or an authorized WhatsApp pilot and get context back. All three use one verification backend. Replies carry a short grounded summary and the full passport. Mesh never silently reads private chats, and WhatsApp needs provider approval and opt-in.

## Slide 14

F09, Mesh Guard. One focused wedge: Before You Share. When a person is about to forward content, Mesh surfaces misleading context, missing proof and staleness. This is a product choice we still need to confirm; the alternative wedge is Opportunity or Scam Check.

## Slide 15

F10, MCP plus trust policy engine. This is our AI Agent track fit. Typed tools return exact passport versions, evidence and policy decisions to agents. High-risk actions fail closed or escalate when information is stale or incomplete, and a missing field is never read as a pass. A policy gate is advisory: a supported verdict alone never authorizes a transaction.

## Slide 16

F11, MethodHash plus attestations. This is where our existing Sepolia registry grows. Signed passports bind an exact assessment and method version, so third parties can verify the method, not just the artifact. A chain confirmation proves publication and integrity, never factual truth.

## Slide 17

F12, Mesh Bench plus the evidence firewall. Quality before scale. Frozen benchmarks expose retrieval and verdict failures. Citation exactness, appropriate abstention and calibration are first-class metrics. The evidence firewall treats pages, OCR and documents as untrusted input, which closes the prompt-injection limit we are honest about today. No benchmark numbers are shown because we have not published any yet.

## Slide 18

The next five capabilities are gated pilots. We only pursue them after the foundations are solid: evidence lineage, living versions, explicit policies, security and measurable quality. No automatic high-stakes actions, ever.

## Slide 19

F13, auditable cases. Grant, DAO and narrowly defined insurance cases gather structured evidence and human review. The domain owner keeps authority to approve or pay. Missing records produce NEEDS INFO and disputes stay visible. A case outcome is not an automatic payout.

## Slide 20

F14, an outcome dossier, not a betting oracle. Mesh assembles timestamped evidence against rules locked before a market closes. An authorized oracle or jury still resolves and settles. Ambiguous evidence escalates and indeterminate is a valid outcome. A score never moves collateral. Sandbox and advisory only.

## Slide 21

F15, evidence bounties. Reward the missing proof, not the loudest opinion. A bounded evidence need invites verifiable submissions, reviewers apply a published rubric, and accepted evidence creates a new passport version. Pilot with off-chain funding first. Links alone earn nothing.

## Slide 22

F16, zkTLS. For one supported portal and a narrow predicate, a vetted zkTLS provider can verify the source origin and a minimal disclosed value, so Mesh never needs the full private record. Source origin is not database truth. Unsupported sites fail clearly and credentials stay with the user. The provider trust model and field binding are explicit.

## Slide 23

F17, zero-knowledge passports. Selective disclosure proves included fields with a Merkle proof. A later true ZK pilot proves one bounded hidden predicate against a signed passport root and policy. These are two different cryptographic claims, and a valid proof verifies a commitment, not the source's factual honesty.

## Slide 24

SuperStar rewards demo-ready delivery, so here is the single end-to-end demo we commit to build. A known claim resurfaces in a misleading screenshot. Memory recognizes it. Image provenance and EvidenceProof pin down the contextual problem. Adaptive research produces an evidence-complete update, published as an immutable new passport version with an explainable delta. A Trust Tag shows the context, a watcher is alerted, and finally an autonomous agent fails a strict policy against the same passport. Optional extras are a supported private-proof demo and a sandbox outcome dossier. This is the target, not something shipped today.

## Slide 25

The roadmap in relative weeks, to be adjusted to the actual SuperStar calendar. Phase zero hardens the foundation: baseline tests, schema v2, security review, a Mesh Bench baseline. Phase one is evidence intelligence, the hardest quality work. Phase two makes passports living. Phase three is distribution: Lens, Telegram and WhatsApp pilot, plus MCP and policy. Phase four is the visual differentiator. Phase five is proofs and vertical pilots, only after quality and security gates pass. The critical path starts with security and canonical schemas, then memory and research. If capacity is tight we deprioritize full ZK, bounty escrow and market integrations before compromising evidence quality.

## Slide 26

How we will prove it, in the spirit of no PPT scoring. These are proposed delivery gates, not performance claims: we will not claim benchmark gains until they are measured, and we will mark unsupported capabilities as unsupported rather than fabricate evidence, receipts or verification results.

## Slide 27

Where this can become a business. These are hypotheses, not verified demand: a free consumer tier, premium watch and private vault, developer and API usage pricing, organization workspaces, specialized case work, and an open core protocol where Mesh monetizes the managed service rather than a token. A transferable token is not required. The validation plan is to interview journalists, fact-checkers, Web3 agent developers and a grant or DAO operator, and to recruit pilot users, reporting documented partnerships only once they are real.

## Slide 28

Close on the promise and the proof: a working product with real sources, real disagreement and a real on-chain receipt, plus a roadmap built on it and gates we can be held to. The ask: an incubation grant tier, BD and distribution introductions, and pilot partners. Invite them to try a claim live or in the Telegram bot.
