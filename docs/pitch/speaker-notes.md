# Mesh incubation deck - speaker notes

## Slide 1

Open with the one-line promise: check before you trust. Mesh turns any digital claim: text, a link, a screenshot, into an Evidence Passport anyone can inspect. Everything you'll see tonight is a working product, not a mockup. We're here as SIMAN LABS incubation candidates.

## Slide 2

The problem isn't a lack of fact-checks, it's that fact-checks don't travel. A claim gets copied, cropped, translated and forwarded; the source and date fall away. Three failures: the investigation restarts every time, a single AI answer hides its own blind spots, and any published result can be quietly edited or removed.

## Slide 3

The core idea: an Evidence Passport. It's a portable, public record of one investigation: the atomic claims, the evidence on each side with source quality, what the independent assessments said and where they disagreed, the challenges raised against the leading conclusion, a transparent 0–100 score, and cryptographic hashes anchored on Ethereum Sepolia. The numbers on the right are from a real passport we generated today.

## Slide 4

Seven stages, and the app streams real progress as it goes. Walk left to right: input is normalized and hashed, URLs go through SSRF checks and Tavily Extract, images through OCR. A model pulls out atomic claims. Tavily retrieves live evidence per claim, including a contradiction-oriented query. Two investigators assess in parallel, a third pass attacks the leading conclusion, and then plain deterministic code computes the score, the models never get to choose the number.

## Slide 5

This is the product running locally on my machine tonight. The verify screen takes text, a URL or an image. The right-hand panel states exactly what you get back. It's a Next.js app on top of a NestJS API with Postgres; the same pipeline also powers the Telegram bot.

## Slide 6

A real run from tonight. The claim was: 'The Great Wall of China is the only man-made structure visible from space with the naked eye.' Mesh split it into four atomic claims. This one, the 'only' claim, came back CONTRADICTED, 0 out of 100, with four independent opposing sources, each shown with its relevance and quality score. Note the whole passport still reads UNVERIFIED overall, because a different atomic claim about the wall's width was only partly supported. That nuance is the point, a single true/false stamp would have hidden it.

## Slide 7

Disagreement is information, so Mesh keeps it. Here two independent investigators scored the same evidence 66 and 73, one said Unverified, the other Supported, and Mesh records a 20-point gap on a specific claim instead of averaging it away. Evidence is only labelled supporting or opposing when both investigators agree. Then an adversarial reviewer attacks the leading answer; here it flagged an ambiguity about what counts as 'space', and the resolution is shown openly.

## Slide 8

This is why the number is trustworthy: it's computed by fixed, published application code. Per claim: sixty percent evidence balance, forty percent mean model probability, minus a capped penalty for unresolved adversarial challenges. Evidence is weighted by source quality times relevance and by how many distinct domains back it. Confidence blends model confidence, agreement, domain coverage and source quality. The final narrative model can write the explanation but is not allowed to change the result. Bands map to four verdicts.

## Slide 9

Integrity, not truth. Mesh hashes the input, claims, evidence, model outputs and Gonka request IDs into Merkle roots and a passport hash, then writes only those compact values to a registry contract on Ethereum Sepolia. No content, URLs, evidence or images go on-chain. Anyone can recompute the hashes and compare them to the receipt. The receipt on the right is real: transaction confirmed in block 11,891,382. Be clear in the room: a chain receipt proves the passport hasn't changed, it doesn't prove the claim is true.

## Slide 10

One backend, several ways in. The web app and public passport pages; a Telegram bot, because that's where forwarded claims actually live; a documented REST API with Swagger so developers and agents can fetch a passport instead of redoing the investigation; and an embeddable badge. Same pipeline behind all of them, so a passport created in Telegram opens on the web with the same receipt.

## Slide 11

Why you can build on this. Every inference call goes through Gonka Router, so no single provider defines the answer and models can be swapped, in fact one of our two model slots was retired on the Gonka network this week and we handled it with a configured fallback. Evidence is live, not remembered. Guardrails are shipped: URL safety checks, upload limits, schema validation with a repair pass, rate limits, server-only secrets. And we're upfront about limits, prompt injection from retrieved pages isn't fully defended yet, OCR is English-only, and a score is an assessment, not an oracle.

## Slide 12

This is where it goes, and I want to be clear it's proposed, not built. Today Mesh answers 'is this true right now?'. The next step is making a verification living: remember claims across posts and languages, version passports and alert people when evidence moves, put context where claims appear, give agents typed tools with policy gates, attest the method not just the artifact, and measure quality publicly. Further out are gated pilots, cases, market dossiers, bounties, private-source proofs, only once the foundations are measurable. The rule we keep repeating: assessment is not integrity is not truth.

## Slide 13

What we'd use the programme for. Quality first: a frozen benchmark, citation exactness, appropriate abstention and a real prompt-injection defense, because trust is the product. Then distribution: WhatsApp pilot, browser extension, SDK and MCP server, where the claims already are. Then partners: newsrooms, fact-checkers and communities to pilot with, so passports get reused rather than recreated. EDIT THIS SLIDE to match the exact ask you want to make.

## Slide 14

Close on the promise and the proof: a working product with real sources, real disagreement, and a real on-chain receipt. Invite them to try a claim live or in the Telegram bot.
