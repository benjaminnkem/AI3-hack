# MESH — Incubation Product & Engineering Specification

**Version:** 1.0 — agent handoff draft  
**Date:** 11 October 2026  
**Status:** Proposed incubation scope; not a statement that new features have shipped  
**Audience:** Product, design, engineering, research, security, QA, builders and autonomous coding agents  
**Primary repository:** https://github.com/benjaminnkem/AI3-hack  
**Live MVP:** https://ai3-hack.oluwadunsin.dev  
**Existing API docs:** https://ai3-hack-be.oluwadunsin.dev/docs  
**Existing bot:** https://t.me/mesh_passport_bot

> **Instruction to every receiving agent:** Treat this specification as the target future product, not as an accurate statement of what has already been implemented. Before coding, inspect the current repository, identify existing functionality and schemas, and create a migration-safe plan. Preserve successful behavior. All external integrations must be genuine; mark unavailable capabilities as unsupported or pending rather than fabricate evidence, blockchain receipts or verification results. Ask product owners questions listed at the end before resolving material ambiguities.

## 1. Executive summary

Mesh is evolving from an AI-powered fact-checking application into an **open evidence and trust infrastructure for humans, developers, institutions and autonomous AI agents**. The unit of value is a **Living Evidence Passport**: a portable, inspectable, versioned record of a specific claim or decision-relevant assertion, its source evidence and provenance, independent assessments, uncertainty, history, challenges, cryptographic commitments and current validity.

The vision has four reinforcing loops:

1. **Investigation:** normalize content, break it into atomic claims, retrieve appropriate evidence, actively seek disconfirmation, assess evidence sufficiency, record a bounded and explainable conclusion.
2. **Memory:** map the proposition, its paraphrases, translations, media variants and evidence into a Claim/Evidence Graph; reuse compatible, sufficiently fresh investigations rather than starting over.
3. **Lifecycle and distribution:** monitor changes, issue new immutable Passport versions, notify subscribers, and expose context through web, extension, bots, APIs and MCP.
4. **Assurance and action:** enable cryptographic audit, independently signed attestations, privacy-preserving evidence, and policies that let people and agents decide whether evidence is sufficient for a particular action.

**Tagline / product compass:** *Check before you trust.*  
**Developer framing:** *Reusable, policy-aware evidence infrastructure for software and AI agents.*  
**Institutional framing:** *Claims, sources and decisions that can be audited, challenged and updated.*

**Important boundary:** Mesh does not determine metaphysical or legal truth. A positive score is not authorization for money movement, medical treatment, insurance claims, market settlement or sanctions. Those require explicit domain controls and, when appropriate, qualified human adjudication.

## 2. What is already built (baseline; verify against repository before implementation)

The original AI³ Mesh implementation is a real, functional application:

- **Frontend:** Next.js/React/TypeScript; public verification UI, Passport details, history/explore, badges and sharing.
- **API:** NestJS 10, PostgreSQL + TypeORM migrations, REST endpoints, Swagger, input validation, throttling and streaming stage events via NDJSON.
- **Inputs:** typed text, public HTTP(S) URLs, PNG/JPEG/WebP screenshots/images; existing backend text limit 10,000 characters and image limit 5 MiB.
- **Ingestion:** Tavily Extract for URLs with Tavily Search fallback; English Tesseract OCR for images. OCR text is normalized through Gonka; the existing models do **not** receive the original image pixels as native multimodal input.
- **Reasoning:** MiniMax extracts up to five atomic claims; Tavily retrieves supporting/opposing candidate evidence; Kimi and MiniMax independently assess the same claims/evidence via Gonka; Kimi challenges the result; backend computes scores in code; MiniMax narrates the immutable result.
- **Current scoring:** approximately `0.6 × evidence score + 0.4 × model mean − adversarial penalty`, with source/domain coverage shrinkage, agreement, source quality and confidence calculations. Model outputs do not set the numeric score. Current verdicts: `SUPPORTED`, `UNVERIFIED`, `MISLEADING`, `CONTRADICTED`.
- **Artifacts:** public Evidence Passports, canonical payloads, Keccak-256 hashes, Merkle roots, model request audits, integrity verification and optional Ethereum Sepolia registry attestations. Blockchain attestation proves publication/integrity, **not truth**.
- **Telegram:** grammY bot forwards text, URLs and supported image inputs to the same backend.
- **Reuse today:** exact normalized input hash reuse within a configurable window; there is no general semantic Claim Graph yet.

Do not describe the 17 features below as already operational. Preserve prior Passport URLs and hash-verification behavior, possibly through schema versioning; do not silently change old canonicalization rules.

## 3. Product principles and invariants

**Evidence before rhetoric.** Every substantial claim must be backed by attributable supporting/opposing evidence, or Mesh must abstain. Model agreement is not equivalent to external evidence.

**One claim is not one post.** Distinguish raw occurrence (social post, image, video) from normalized atomic proposition, event, entity and time scope. Identical words can refer to different events; opposing negation must never collapse into the same canonical claim.

**Historical versions are immutable.** “Current” is a separately derived pointer/state; never mutate earlier signed Passport payloads or reassign their hashes.

**Truth, provenance, and assurance are separate.** A genuine photo can have a false caption; a mathematically valid Merkle proof does not prove a source is truthful; an attested expert can still be mistaken. Present independent dimensions rather than a single magic trust score.

**Risk-adaptive effort.** Use inexpensive cached/contextual checks for low-stakes browsing and stronger methods, independent evidence and possibly humans for consequential decisions.

**Privacy first.** Default-private personal submissions; user consent for retention, public publishing, cross-user claim reuse, subscriptions and third-party disclosures. Do not store private source material permanently on public chains or content-addressed networks.

**Developer/agent policies are advisory gates, not automatic authority.** Consumers may require stronger evidence and must define fail-closed behavior for high-risk decisions. An agent must never treat a score threshold alone as permission to spend money.

**No invented integrations.** Never claim deepfake detection, reverse-image search, zkTLS verification, independent attestations, smart-contract settlement, or official-database access unless a real service proves the result.

**Reproducible and testable.** All deterministic transformations must have versioned algorithms, fixtures, hash specs, provenance metadata, error states and audit events.

## 4. Personas and jobs to be done

- **Everyday person:** “I got a suspicious image, voice note, scholarship link, seller message or viral claim. Help me understand what can be substantiated before I act or share.”
- **Journalist/researcher:** “Find primary sources, show disputes, evidence lineage and dates, preserve original evidence and explain revisions.”
- **Developer:** “Use a stable API/SDK and receive detailed machine-readable evidence without building search and adjudication infrastructure.”
- **AI agent owner:** “Require an explicit evidence policy before the agent takes a consequential action; reconstruct what it relied on afterward.”
- **DAO / grant program / insurer / prediction-market operator:** “Evaluate precisely defined real-world assertions and outcomes, with human escalation, audit trails and appeal paths.”
- **Reviewer/evidence contributor:** “Submit independently sourced evidence; challenge weak sources; earn attribution or bounties without manipulating conclusions.”

## 5. Canonical architecture and data objects

### 5.1 Core logical objects

- **InputOccurrence:** raw user submission or observed post with source platform, capture context, timestamp, consent/visibility, file hashes, retention classification and ingestion status.
- **AtomicClaim:** canonicalized proposition with normalized subject, predicate, object/value, unit, negation, modality, conditions, effective time, location, original wording and translation variants. Has a stable internal ID and claim-scoped semantic fingerprint (not solely an embedding).
- **ClaimLink:** relationship between claims (`EQUIVALENT`, `PARAPHRASE`, `TRANSLATION`, `CONTRADICTS`, `ENTAILS`, `RELATED`, `SUPERSEDES`) with confidence, method and review provenance.
- **EvidenceProof:** evidence reference with retrieval receipt, source snapshot/hash, exact quote and offsets, provenance, timestamp, supporting/contradictory relationship, source family and access/privacy status.
- **SourceFamily:** grouping of sources that depend on one origin/press release/wire story; graph edges with confidence and cited origin.
- **InvestigationRun:** reproducible execution context including input/claim IDs, method version, search stages, provider calls, prompt/model versions, costs, errors and stopping reason.
- **PassportVersion:** canonical immutable artifact for a claim/claim set containing evidence, assessment, limitations, signatures and hashes; version links to prior versions.
- **PassportStatus:** current derived lifecycle state and pointer (may change without rewriting immutable version; transitions auditable).
- **WatchSubscription:** user/agent/webhook watch configuration, privacy permissions, trigger filters and deduplication cursor.
- **MethodManifest:** published scoring/source-selection/normalization/prompt schema/model config and content digest (`methodHash`).
- **Attestation / Challenge / Review / Resolution:** signed statements referencing exact Passport, evidence and method identifiers.
- **TrustPolicy:** versioned set of predicate checks, scope, freshness/assurance requirements, risk category and fail behavior.
- **DecisionReceipt:** records which specific Passport versions and policies were consulted when an application took, deferred or blocked an action.
- **BountyCase / Submission / Award:** requested missing proof, escrow/funding state, adjudication criteria, reviewer record and payout result.
- **PrivateProof:** provider-verifiable TLS provenance proof metadata plus minimal selectively revealed statement; credentials and private raw content are not stored by default.
- **DisclosureProof:** Merkle membership or true ZK proof binding a committed Passport version and precise predicate to a cryptographic verifier result.

### 5.2 State boundaries

Keep separate enums and persistence for:

- **Claim adjudication:** `SUPPORTED`, `UNVERIFIED`, `MISLEADING`, `CONTRADICTED` plus structured issue labels like `OUT_OF_CONTEXT`, `STALE`, `FALSE_ATTRIBUTION`. Preserve historical semantics or version score schema.
- **Investigation process:** `QUEUED`, `RUNNING`, `NEEDS_EVIDENCE`, `COMPLETED`, `FAILED`, `CANCELLED`.
- **Passport lifecycle:** `CURRENT`, `STALE`, `REFRESHING`, `DISPUTED`, `SUPERSEDED`, `RETRACTED`; more than one flag may apply (`DISPUTED` and `STALE`), so a set of flags may be superior to one mutually exclusive status.
- **Attestation:** `NOT_REQUESTED`, `PENDING`, `CONFIRMED`, `FAILED`, `REVOKED`.
- **Proof verification:** `VALID`, `INVALID`, `EXPIRED`, `UNSUPPORTED`, `INDETERMINATE`.
- **Policy decision:** `PASS`, `FAIL`, `INDETERMINATE`, `ESCALATE`.

### 5.3 Infrastructure evolution

Keep Next.js, NestJS, TypeORM and PostgreSQL initially. Add `pgvector` for semantic retrieval and indexable metadata. Introduce a durable worker/queue for long media processing, scheduled refreshes and webhooks; Redis + BullMQ is one viable option, but validate deployment fit. Use private object storage for media/snapshots with lifecycle deletion and access control. A graph database is optional—not necessary initially because relational edges and materialized views can represent the graph. Maintain old REST/passport routes and NDJSON streaming, adding asynchronous job APIs and typed event streams where needed. Retain Gonka integration while checking current availability/limits for native multimodal models.

---

# 6. The seventeen selected capabilities

## F01. Mesh Memory + Claim Graph

**Outcome:** Repeated, paraphrased, translated or screenshot-contained claims resolve to the same *underlying proposition*, while avoiding dangerous false merges. A query can reuse an existing Passport when its claim/time/context truly match and it is fresh enough.

**User journey:** A user sends “They cancelled the 2027 scholarship” in English. Another sends the equivalent in Yoruba. Mesh extracts atomic propositions, retrieves candidate canonical claims through multilingual embeddings + lexical/entity matching, checks equivalence and temporal scope, and displays the existing Passport or prompts a refresh if evidence may have changed. The occurrence is attached to the Claim Graph without duplicating the canonical claim.

**Functional requirements:**
1. Store original input occurrences independently of canonical claims.
2. Normalize entities, dates, numerical values/units, conditionals, modality (“may” versus “will”), negation, geography and referents before any merge.
3. Use hybrid retrieval: semantic embedding + lexical/BM25 + structured filters + entity/time compatibility.
4. Generate relation candidates with calibrated similarity, but require an explicit equivalence check before merging; use human review or “related but not merged” for ambiguous/high-impact claims.
5. Record relationship provenance: extraction model, embedding version, threshold, decision explanation, reviewer and timestamp.
6. Store language variants and original-language claim text; avoid lossy translation obscuring named entities or negation.
7. Freshness-aware reuse: stable historical claims can live longer; fast-changing claims require a shorter validity window.
8. Support cluster splitting and migration if a previously merged claim proves contextually different; preserve all associated occurrence histories.
9. Index public/consented content separately from private user submissions; never use private content to answer an unrelated user unless explicitly authorized and safe.

**Implementation approach:** PostgreSQL tables `claim_nodes`, `claim_aliases`, `claim_relations`, `claim_occurrences`, `claim_embeddings`, `claim_review_decisions`, `claim_passport_links`; pgvector HNSW/IVFFlat as appropriate; normalized entity/time filters; versioned model embeddings.

**Edge cases:** quote of a false claim versus asserting it; “CEO in 2024” versus “current CEO”; hypothetical/satire; “not” inversion; local names shared by multiple persons; missing publication dates; conflicting translations; claim with multiple events; rapid breaking news.

**Acceptance:** Equivalent paraphrases and selected translations retrieve the same candidate; negated/temporally incompatible variants do not auto-merge; every link auditable; refreshing updates a Passport *version* not old content; demonstrate cache hits and cost reduction against the legacy pipeline.

**Dependencies:** claim extraction, baseline passports, multilingual embedding evaluation, retention permissions. **Priority:** foundation / P0.

## F02. Adaptive Evidence Research

**Outcome:** Mesh gathers the *right evidence*, not just a fixed number of generic search results. It knows when additional retrieval is required and when no defensible conclusion exists.

**User journey:** Mesh extracts a compound claim about a regulator, effective date and geographical scope. Its Evidence Planner creates a structured plan; queries official/regulatory data plus general web; verifies missing slots; adversarial retriever seeks contradictory primary material; if a critical component remains unproven, it abstains instead of manufacturing confidence.

**Functional requirements:**
1. Claim typing: scientific, numerical, temporal, current-event, quote, identity, company, policy, medical, finance, media context, etc.
2. Produce a typed `EvidencePlan` with propositions to prove/refute, target source types, query candidates, freshness requirements and maximum budget.
3. Route to relevant tools: Tavily/general web, known fact-check corpus, scholarly registries, official primary records and domain-specific APIs as actually available.
4. Evaluate evidence coverage by atomic claim slot: entity, relation, number, time, location, condition.
5. Run independent counter-search against leading interpretation; do not simply ask another model to reinterpret the same sources.
6. Deduplicate near-identical articles and prioritize independent source families.
7. Use bounded iterative search: `SEARCH_MORE`, `SUFFICIENT`, `ABSTAIN`, `ERROR`; enforce max queries, cost, duration and domain restrictions.
8. Never count retrieval failure as contradictory evidence. Track evidence absent, inaccessible, conflicting, stale and contaminated separately.
9. Log full planner trajectory and stop reason. Keep intermediate model summaries bounded; do not record proprietary hidden chain-of-thought.
10. For high-risk claims, require stronger primary evidence/human escalation rather than generic confidence thresholds.

**Implementation:** modular `ResearchPlanner`, `SourceAdapterRegistry`, `SearchIteration`, `EvidenceCoverage`, `CounterEvidenceAgent`, `SufficiencyEvaluator`; queued jobs with idempotency keys; strict JSON schemas; SSRF and prompt-injection protection.

**Acceptance:** tool failure produces a clear incomplete state; search stops within budget; challenging cases demonstrate targeted additional search; unverified/abstain behavior validated; evaluation against frozen retrieval benchmarks and baseline cost/accuracy metrics.

**Priority:** foundation / P0.

## F03. EvidenceProof — exact quotes, snapshots and source lineage

**Outcome:** Every cited assertion has an inspectable, reproducible chain back to captured source content. “Five URLs” is not automatically “five confirmations.”

**User journey:** User opens supporting Evidence #4. Mesh shows original URL, publication/retrieval dates, a confirmed verbatim excerpt with source offsets, archived snapshot (if permitted), cryptographic content hash, primary/secondary classification, and lineage: this page summarizes a single press release also used by other sources.

**Functional requirements:**
1. Capture canonical URL, final redirect, retrievedAt, publishedAt where available, source title, author and origin domain.
2. Store canonical source text and/or licensed excerpt/snapshot in a policy-controlled storage tier; record content hash and archive URI if legitimately available.
3. Use deterministic substring/normalized text alignment for exact quote verification with offsets, tolerance only for documented whitespace transformations; never fabricate an exact quote when source text unavailable.
4. Distinguish verbatim quote from model paraphrase or inferred conclusion.
5. Build source-family graph via content similarity, citations, canonical links, press-release origin, syndication and timestamps; show confidence and evidence of attribution.
6. Compute independence with source-family count and optionally primary-source weighting, not only distinct domains.
7. Bind source IDs and roots into immutable Passport versions; replay must reference frozen source snapshot/version.
8. Handle deletion, source correction, paywalls, licensing/robots, copyright, sensitive information and archives that cannot be lawfully republished.
9. Show evidence direction per specific atomic claim, avoid globally marking a source “credible/false.”
10. Inspect retrieved content for prompt injection and suspicious untrusted directives before sending to models.

**Acceptance:** each displayed *exact quote* can be mechanically located in retained source text or is explicitly marked unavailable; 3 syndicated stories can be grouped as one source family; edited source triggers change detection without mutating prior evidence capsule; hashes verify.

**Priority:** foundation / P0.

## F04. Living Passports — freshness, versioning and Evidence Delta

**Outcome:** A Passport is an immutable investigation version plus a clearly marked, current view and chronological updates. Users see how and why assessments change.

**User journey:** A fact checked in July is checked again in October. The July Passport remains publicly verifiable. An October assessment appears as v2, linked to v1. Delta view identifies new sources, retractions, changed factual slots, source-lineage corrections and resulting assessment movement.

**Functional requirements:**
1. Separate stable logical Passport identity from immutable `PassportVersion` IDs and hashes.
2. Track freshness policy by claim type (`VALID_UNTIL`, triggered refresh, manual refresh) and data as-of date.
3. Implement `CURRENT`, `STALE`, `REFRESHING`, `DISPUTED`, `SUPERSEDED`, `RETRACTED` as audited lifecycle states/flags; disputes do not automatically mean false.
4. Refresh produces a new canonical payload, MethodHash, evidence/model roots and attestation references; never rewrites v1.
5. `EvidenceDelta`: added/removed/changed evidence, corrected/retracted sources, changed independent families, changed claim parse, score and verdict difference, uncertainty difference. Explanations must be grounded in actual diff, not LLM invention.
6. A Passport can contain multiple atomic claims; define overall versioning and claim-specific refresh when only one part changes.
7. Public URL resolves current version but allows a stable deep link to historical versions; clear as-of banner and timestamp.
8. Use state-transition audit log, idempotent refresh, concurrency locks, cancellation/retry and immutable attestation records.
9. If a newer investigation fails, retain prior version and mark stale/error rather than fabricating an update.

**Acceptance:** history pages reproduce exact prior hash; refresh is linked and monotonic; version diff is accurate; stale result clearly marked; method changes do not retroactively rewrite old scoring.

**Priority:** foundation / P0. **Dependency:** Memory, EvidenceProof, MethodManifest.

## F05. Passport Watch

**Outcome:** Users/agents subscribe to specific claims and receive updates only when something materially affects trust or freshness.

**User journey:** User follows a Passport through web, Telegram or an authorized WhatsApp flow. Mesh checks for relevant source updates, sends “official source corrected the announced date” with a link to v2, and provides notification controls.

**Functional requirements:**
1. Follow claim, Passport, source, entity or watchlist subject; MVP follow one Passport/claim.
2. Trigger types: new primary evidence; retraction/correction; material verdict/score/uncertainty change; status becomes stale; reviewed challenge opens/resolves; new confirmed media context.
3. Poll/webhook/feed ingestion under per-source budgets; schedule based on claim volatility and user settings.
4. Deduplicate alerts by `(subscription, event, version)` and suppress noisy near-duplicate notifications.
5. Allow user to select channel (email/in-app/Telegram/WhatsApp if opted-in), mute/pause, unsubscribe and delete history.
6. Signed webhooks for developer subscribers with retry, backoff, replay protection and delivery history.
7. Bound provider costs and prevent unlimited free surveillance of broad topics in initial version.
8. Respect visibility: do not include private claim content in a shared notification or a third-party delivery without consent.

**Acceptance:** real evidence change creates a new version and one alert; no-material-change causes no alert; idempotent retries; unsubscribe works; no leaking private content.

**Priority:** P0/P1; deliver after Living Passports.

## F06. Real image verification

**Outcome:** Mesh moves from reading text inside screenshots to assessing visual media, its original context, transformations and provenance. Media authenticity, context accuracy and underlying factual claims are separate outputs.

**User journey:** Someone shares a real flood photo falsely described as “Lagos yesterday.” Mesh sees the image, extracts OCR, searches similar media and earlier sources, detects a previous occurrence in a different place/year, checks C2PA if present, and labels the context mismatch with evidence; it does *not* incorrectly assert the image is AI-generated.

**Functional requirements:**
1. VLM-native image understanding through a verified multimodal provider capability; OCR retained as separate text channel with language and confidence if available.
2. Generate content hashes, perceptual hashes, image embeddings, and thumbnails; link altered/cropped near-duplicates without assuming identity solely from pHash.
3. Build reverse-image evidence adapter(s) only where genuine APIs/licensing permit; report no-match as `UNKNOWN`, not proof of originality.
4. Validate C2PA credentials and manifest binding using a standards-compliant library; expose signer, manifest validity, edits and generative declarations if present; absence ≠ fake.
5. Extract metadata/EXIF when present; metadata is mutable and may be removed, so never claim conclusive authenticity from it alone.
6. Compare visual landmarks, dates, captions, location and temporal context with retrieved image sources. Show earliest **known** indexed occurrence, not absolute first appearance.
7. Separate output dimensions: `media_generation_signal`, `credential_provenance`, `visual_context_match`, `embedded_text_claims`, `factual_claim_assessment`, `forensic_limitations`.
8. If a commercial deepfake detector is integrated later, include provider/version/calibration and disagreements; never turn detector probability into legal certainty.
9. Manage upload privacy, harmful content handling, image storage retention, consent and deletion; no unauthorized face identification.
10. Preserve original hash and derived-frame/normalized-media relationships in evidence graph.

**Acceptance:** demo real image + misleading caption, genuine C2PA case if available, no-credential case and duplicate crop; output shows distinct dimensions and primary evidence, never falsely labels missing C2PA as fake.

**Priority:** P0 visual MVP (VLM/OCR/pHash/C2PA/context); expand reverse-image provider coverage as supported.

## F07. Mesh Lens — browser Trust Tags and Ask Mesh

**Outcome:** Users encounter context in situ instead of remembering to open a verification app. Lens must be respectful, opt-in and explain its signals.

**User journey:** User browses a post/news article, opens extension overlay; Lens extracts selected text/URL or opted-in visible content; matches a current Passport; displays “Existing Mesh context,” freshness, key caveat and supporting sources; user can submit content manually with “Ask Mesh.”

**Functional requirements:**
1. Browser extension using current Manifest V3-compatible permissions/content scripts; minimize host permissions and provide user-directed activation.
2. Right-click selected text/image/link, page toolbar, optional supported-site overlays; no invisible scraping of private messages or accounts.
3. Content parser detects atomic-claim candidates and media; send only minimum necessary text with opt-in/notice.
4. Prefer Memory hits and current Passport cards; launch new investigation on explicit request or opt-in setting, not automatically everywhere.
5. Trust Tag states are nuanced: `CONTEXT_AVAILABLE`, `SUPPORTED_WITH_EVIDENCE`, `EVIDENCE_INCOMPLETE`, `OUT_OF_CONTEXT`, `STALE`, `DISPUTED`, `CHECKING`.
6. Display timestamp, evidence sufficiency, source count/independence and link to full Passport; do not obstruct website UI.
7. Handle platform DOM changes through adapter isolation; fall back to manual-selection checks.
8. Throttle lookups, avoid storing browsing history unless explicit, clear extension privacy policy.
9. No automatic posting of comments, social account impersonation or claims of native platform endorsement.

**Acceptance:** selection → lookup → card; current Passport appears without full verification; user can investigate manually; site-breaking CSS changes degrade gracefully; permission/privacy test passes.

**Priority:** P0 consumer demo, after Memory and Passport APIs.

## F08. Share to Mesh + WhatsApp/Telegram

**Outcome:** Users forward or share suspicious material from everyday conversation to the same backend, and receive short, useful evidence cards with links to detail.

**User journey:** In a supported app, user deliberately shares/forwards a link, image, text or voice note to Mesh. Mesh detects supported media and purpose, acknowledges processing, retrieves or generates Passport, returns a concise summary and “Forward with context” content where the channel permits.

**Functional requirements:**
1. Preserve existing Telegram bot and migrate it to unified job/passport APIs; avoid duplicated reasoning logic in bot.
2. Support mobile native share target via suitable PWA/native wrapper or share intent where OS allows; clarify technical platform limitations.
3. WhatsApp via **official WhatsApp Business Platform/Cloud API** or authorized provider, respecting user-initiated messages, templates, messaging windows, media rules, consent and rate limits. Cannot silently read private chats or install a global WhatsApp interceptor.
4. Handle text, URLs, image documents; add audio/voice notes as an explicit additional pipeline with speech-to-text, language and media privacy controls.
5. Status messages for long verification: received, researching, completed, unavailable; retries idempotent.
6. Responses: headline, scoped assessment, 2–3 grounded points, uncertainty, as-of date, full Passport URL, optional shareable contextual card.
7. Support preferred language where actually evaluated; detect code-switching but label uncertain translations.
8. Abuse and spam controls, attachment limits, retention, consent, deletion and blocked-content handling.

**Acceptance:** same claim yields equivalent canonical Passport through web/bot; duplicate webhook delivery does not create duplicate jobs; messaging provider errors are transparent; long-running work doesn't cause invalid repeated provider acknowledgments.

**Priority:** P0 for Telegram refinement/share entry; WhatsApp pilot depends on provider approval and integration.

## F09. Mesh Guard — choose one narrow initial wedge

**Outcome:** Turn verification into actionable context at the moment people are about to share or perform a risky action. **Do not attempt twenty specialized vertical products during incubation.**

**Option A, recommended default: Before You Share.** Analyze selected social post, article, screenshot or image; reuse current Passport; detect misleading context, missing evidence and staleness; offer “Share with context” summary + Passport URL. The browser extension and bots serve as entry surfaces. This aligns closely with existing Mesh primitives.

**Option B, alternative for stronger immediate economic value: Opportunity/Scam Check.** Analyze job/scholarship/grant listing and its claimed issuer, official domain, listing authenticity, registration/fee claims, misleading urgency and impersonation. Surface observed signals, unknowns and safe next steps; never assert a person is a criminal or claim an opportunity is conclusively fraudulent without strong grounds.

**Common requirements:**
1. Store `DecisionContext`: `intendedAction`, `riskTier`, `subject`, `claims`, `relevantPassportVersions`, `signals`, `unknowns`, `recommendedSafeChecks`.
2. Separate hard cryptographically verified facts from heuristic risk warnings.
3. Evidence from domain/registry must be independently obtained, never inferred from a screenshot alone.
4. A high-risk action should produce safe escalation guidance, not automated payment/signing.
5. Integrate Lens, Memory, EvidenceProof and Living Passports; every Guard-specific finding still maps into the common graph.
6. Provide transparent supported/unknown/not-applicable states and user appeal for false positives.

**Decision required:** Product owners must choose A or B as the **single** incubation wedge. Design interfaces so more Guard verticals can be added later.

**Acceptance:** one coherent end-to-end demo on 3 representative cases (benign, problematic, uncertain); meaningful evidence, not just scam-language detection; clear next user action.

**Priority:** P0 one wedge only.

## F10. MCP + Trust Policy Engine

**Outcome:** Agents and developers consume Mesh as a decision-support service rather than treating free-form LLM answers as authoritative.

**User journey:** An AI research/procurement agent has an assertion about an organization. It calls `mesh.find_passport` or `mesh.verify_claim`, obtains structured evidence and evaluates a versioned organizational policy; if results are stale/uncertain, the tool responds `INDETERMINATE/ESCALATE`. The agent records a receipt of which Passport/method/policy it consulted.

**Functional requirements:**
1. MCP tools for `verify_claim`, `verify_url`, `verify_media`, `find_passport`, `get_passport`, `get_evidence`, `refresh_passport`, `verify_integrity`, `evaluate_policy`, optionally `create_decision_receipt`.
2. Expose machine-readable JSON schemas, explicit async job IDs, stable errors and resource quotas; no misleading prose-only responses.
3. Authentication and per-tenant API keys/OAuth where applicable, scopes (`read:public`, `verify`, `watch`, `policy:write`, `receipt:write`), rate limits, quotas and audit logs.
4. Define declarative `TrustPolicy` with `policyVersion`, `methodConstraints`, allowed/required evidence types, as-of freshness, source-family requirements, assurance requirements, required reviewer credentials, disallowed unresolved challenges, and fail mode.
5. Policy evaluation is deterministic, typed and explainable; missing or unsupported fields produce `INDETERMINATE` or `FAIL` according to explicit policy. No silent boolean coercion.
6. Policy decisions reference exact immutable Passport version and MethodHash; optionally sign a `DecisionReceipt` with action hash and a clear statement that application action remains under caller control.
7. Protect against prompt injection from retrieved pages and malicious tool results; treat evidence strings as untrusted data.
8. Never provide a generic money-transfer or autonomous-transaction tool solely on the basis of a supported verdict. Distinguish “evidence policy passed” from “transaction is authorized.”

**Acceptance:** sample TypeScript/Python client or MCP test agent retrieves a Passport, fails a deliberately strict policy and records why; stale/unsupported data fails closed; permission tests prevent cross-user access.

**Priority:** P0 developer/agent capability.

## F11. MethodHash + Attestations

**Outcome:** Any third party can verify exactly what assessment was published and which **method version** produced it, without believing the blockchain itself establishes factual truth.

**User journey:** Passport v3 shows a signed artifact, the method manifest version and its digest, roots for evidence/model audits, optional Sepolia transaction, and independent review/challenge attestations. A validator recomputes hashes and verifies signatures.

**Functional requirements:**
1. Canonical `MethodManifest` lists schema versions, scoring formula/thresholds, evidence independence rules, source selection, parser/snapshot hashing, prompt digests, provider/model identifiers, calibration and config version. Compute deterministic `methodHash` on canonical serialization.
2. Preserve existing historical Passport hash and Sepolia contract semantics; version new payloads/contracts rather than retroactively changing v1 schema.
3. Add signed Passport envelope (EIP-712 or approved equivalent) with signer ID, chain/domain separation, nonce/expiry where needed, exact payload hash.
4. Define typed attestations (`PASSPORT_ISSUED`, `EVIDENCE_ADDED`, `REVIEW`, `CHALLENGE`, `RESOLUTION`, `SUPERSEDED`, `REVOKED`), linked to immutable version hashes.
5. Evaluate EAS adoption or compatible contracts; choose one primary network during incubation. Existing chain is Ethereum Sepolia testnet; no false mainnet claims.
6. Optional Merkle batching/transparency log for scale. Maintain off-chain payload/snapshot availability and independent audit code.
7. Revocation does not erase history; explain what was revoked and who had authority to do so.
8. Public verifier independently recomputes root/hash equality and checks expected contract chain/address, tx finality and signer permissions.
9. Only put minimum necessary data on-chain; never raw private claims, personal information or evidence text.

**Acceptance:** modifying evidence or method breaks verification; genuine v1 Passports remain verifiable; v2 displays signed method/version evidence; chain outage creates off-chain valid Passport with pending/failed chain status, not forged success.

**Priority:** P0 assurance layer.

## F12. Mesh Bench + Evidence Firewall

**Outcome:** Mesh can demonstrate measurable quality improvements, inspect failures and defend itself from malicious retrieved content.

**Mesh Bench requirements:**
1. Build reproducible datasets: atomic claim extraction, semantic/cross-language matching, retrieval sufficiency, source-family independence, image context, temporal claims, numeric facts, abstention, adversarial examples.
2. Use established data such as AVeriTeC, AVerImaTeC and SciFact **subject to licenses and task fit**; add consented/local regional cases. Split training/tuning/holdout and avoid evaluation leakage.
3. Metrics: retrieval Recall@K, citation exactness, support/contradiction accuracy, verdict macro-F1, calibration (ECE/Brier), appropriate abstention, independent-family clustering quality, latency, provider cost, freshness correctness, multilingual parity.
4. Publish benchmark methodology, dataset dates, known biases and uncertainty; never claim “99% accurate” from a tiny hand-picked demo.
5. Run deterministic fixtures on every release; periodic provider/model drift evaluation and regression dashboards.

**Evidence Firewall requirements:**
1. Treat URLs, HTML, PDFs, OCR text, source snippets, retrieved JSON and bot messages as untrusted.
2. Apply URL/IP/DNS/redirect SSRF safeguards; content size and file type enforcement; redact secrets/PII in logs.
3. Sanitize/segment extracted content; detect hidden text, forged headers, prompt instructions, impersonated system roles, tool-call directives and poisoned citations; attach taint metadata.
4. Prevent untrusted page content from changing retrieval policy, tools, secrets, score logic or user-facing safety instructions.
5. Test indirect prompt injection in code, adversarial docs, HTML comments, OCR images and malformed files.
6. Ensure models can cite only evidence IDs present in input and all quoted content is exact-validated before display.

**Acceptance:** public benchmark report compares old/new versions honestly; known injection fixtures fail to hijack investigator policy; provider failure is not presented as supported evidence; test suite runs in CI.

**Priority:** P0. Security work must start before broad retrieval/bot/extension deployment.

## F13. DAO / insurance / grant verification

**Outcome:** Reuse Mesh evidence infrastructure for **structured, decision-relevant verification cases** beyond general misinformation, while keeping adjudication and payouts under domain-specific rules.

**User journey — grant:** A foundation awards funds based on “100 verified beneficiaries received kits by date D.” Grantee submits records, consented photos, signed distribution logs and external attestation. Mesh builds claim/evidence case, flags insufficient samples or duplicated records, produces an auditable verification report. Program officer reviews and approves/denies according to grant policy.

**User journey — DAO:** Proposal asserts “Vendor completed milestone 3.” Mesh links deliverables, versioned GitHub releases, document hashes, signed client attestations and external evidence, then records what each party has verified. DAO retains decision power.

**User journey — insurance:** A narrow, objective predicate such as “official weather station recorded rainfall above X during period Y” is checked against authoritative data with chain of custody. Complex claims of individual loss, fault or coverage require authorized assessors and legal constraints.

**Functional requirements:**
1. `VerificationCase` with actors, exact predicates, observation period, thresholds, required documents, privacy classification, applicable terms/jurisdiction, reviewers and dispute window.
2. Structured evidence attachments, verified issuer signatures, versioned checklists, status (`SUBMITTED`, `NEEDS_INFO`, `REVIEW`, `APPROVED`, `DISPUTED`, `REJECTED`).
3. Link every outcome to concrete Passport versions, authoritative evidence, reason codes and human sign-off if required.
4. Support selective disclosure/confidential evidence; protect beneficiaries and private business records.
5. Export case report and attestation; integrations to DAO execution/payout are separate **explicitly authorized** actions with independent policy, safe fallback and appeals.
6. No general insurance adjudication, fraud finding, or release of money based on an uncalibrated AI Truth Score.

**Acceptance:** a simulated or consenting real pilot resolves one clear milestone with complete evidence; missing data produces `NEEDS_INFO`; reviewer can challenge and override with logged reasons; no irreversible action happens without authorization.

**Priority:** P1 vertical pilot, after core EvidenceProof and policies.

## F14. Prediction markets using Mesh

**Outcome:** Mesh provides independent, timestamped **outcome evidence dossiers** for prediction markets; it is not itself a betting/prediction marketplace.

**User journey:** Market asks “Will company X publicly announce Y by 23:59 UTC on date D?” Its resolution rules are locked before trading, defining authoritative sources, timezone, ambiguities and challenge period. After D, Mesh collects source evidence, outputs a resolution dossier and optionally an attestation. An authorized market oracle/jury applies governing rules and settles; ambiguous cases escalate.

**Functional requirements:**
1. `MarketResolutionSpec` with market ID, exact predicate, temporal scope, outcome values, reliable source definitions, counterexamples, edge cases and precommitted rules.
2. Ingest official documents/data, archived as-of evidence, chain events where relevant, and signed provider attestations.
3. Evidence Passport/dossier is immutable and portable, with `INDETERMINATE` available and clear evidence timing.
4. Attestation adapter exposes evidence and suggested outcome but distinguishes “Mesh finding” from legally/protocol authorized market resolution.
5. Support operator-defined dispute period, counterevidence and escalation to humans/recognized oracle mechanisms.
6. Do not let an LLM's 70/100 score directly resolve markets or move collateral. Use high-assurance deterministic criteria for machine settlement.
7. Respect regional financial/gambling restrictions and market protocol rules; not every market category is appropriate.

**Acceptance:** two objective market test cases and one ambiguous case; contracts cannot auto-settle on a mere Passport status; evidence version and as-of deadline verifiable; dispute flips to escalation rather than silent rewrite.

**Priority:** P1/P2 integration partnership.

## F15. Evidence bounties

**Outcome:** Difficult investigations can request *specific missing evidence* from humans and reward verifiable contributions, strengthening Mesh Memory for everyone.

**User journey:** Passport lacks an original government circular. User/organization funds bounty “Find an official signed notice issued by agency X on or before date Y, with verifiable origin.” Researchers submit candidates. Mesh checks duplication, document provenance, relevance and policy. Qualified reviewer accepts a valid submission; payout releases after dispute window.

**Functional requirements:**
1. Define bounded `EvidenceNeed`: claim/version, missing evidence slot, acceptance rubric, deadline, jurisdiction/content restrictions and confidentiality policy.
2. Escrow/funding (off-chain pilot first or audited stablecoin contract later), transparent fees, refunds and cancellation rules.
3. Submission includes exact artifact/source, provenance metadata, license/permissions, contributor statement and content hash.
4. Automated pre-screen for duplicates, malicious files, irrelevant material, source authenticity and privacy issues; **human adjudication** for contested payouts.
5. Review and appeal flows with timestamps, contributor attribution/pseudonym options, conflict-of-interest and anti-collusion checks.
6. Never reward raw quantity of URLs, voting for a verdict, doxxing, hacking private portals or illegally acquired material.
7. Optional reviewer reputation is domain-specific, based on outcome and quality, not votes, token balances or wallet age alone.
8. Accepted evidence triggers a new investigation/Passport version, not an automatic truth flip.

**Acceptance:** funds committed, valid evidence submitted, accepted/rejected transparently and appropriate payout/refund completed on testnet/pilot; fraudulent duplicate submission cannot drain reward; critical content remains private.

**Priority:** P1 after Memory/EvidenceProof/Case lifecycle.

## F16. zkTLS private evidence

**Outcome:** Users can cryptographically demonstrate that selected information originated from a particular authenticated HTTPS source without uploading entire private records or surrendering credentials to Mesh.

**User journey:** A user wants to prove a school-status value from a private portal. They run a supported prover flow on their device/within a vetted provider, authorize a minimal disclosure, and give Mesh a verification artifact. Mesh verifies source origin, signed transcript/field binding, freshness, provider verifier output and subject/linkage where required. A private `EvidenceProof` enters a Passport without publishing unrelated fields.

**Functional requirements:**
1. Integrate a real provider (e.g. Reclaim-compatible provider or vetted TLSNotary stack) behind `PrivateProofProvider`; don't build a TLS protocol from scratch for incubation.
2. Limit pilot to **one explicitly supported data source and one or two predicates**; arbitrary website extraction is not assumed possible.
3. Validate cryptographic proof under provider-specific trust model and version; verify TLS/server identity, allowed domain/path, signed response, extraction selector/field semantics, timestamp/freshness, replay/nonce and optional user's subject authorization.
4. Confirm claimed value is actually bound to authenticated source bytes; a signed “origin proven” statement does not establish independent truth of the site's database.
5. Never collect passwords, MFA secrets, session cookies or full private HTML into Mesh logs/storage; no authentication bypass. User controls consent and disclosure.
6. Keep source statement, private proof URI, verifier/version, proof hash and minimal revealed claim; encrypt any necessary rest material and establish retention/deletion policies.
7. Return `UNSUPPORTED`, `INVALID`, `EXPIRED`, `INDETERMINATE` distinctly when provider cannot prove the selected site/field; do not silently fall back to screenshot trust.
8. Respect portal terms, consent requirements, personal-data rules, source-user matching and threats of forged/wrong-person records.

**Acceptance:** supported end-to-end proof independently verified by Mesh, deliberate tampered/replayed proof rejected, minimal disclosure demonstrably excludes sensitive fields, unsupported site fails clearly.

**Priority:** experimental incubation proof of concept; do not block core product release on provider compatibility.

## F17. Zero-knowledge Passports

**Outcome:** A verifier can check limited assertions about a committed private Passport without seeing the Passport's sensitive contents. Distinguish **Merkle selective disclosure** from a **true zero-knowledge predicate proof**.

**Phase A — selective disclosure (build first):** Each eligible Passport has commitments to normalized evidence attributes/leaves. Holder reveals a subset of attributes with Merkle inclusion proofs. Verifier confirms those disclosed fields were committed in the signed Passport. Note that this reveals selected values and does **not** prove arbitrary hidden predicates by itself.

**Phase B — genuine ZK predicate proof (R&D/pilot):** Prove a bounded policy such as `source_family_count >= 3` and `no_unresolved_challenges = true` while withholding exact counts/evidence, binding public inputs to the signed Passport root, policy hash and version; use audited circuits/proving libraries (Noir/Circom/zkVM if suitable) and publicly verifiable verifier key.

**Functional requirements:**
1. Precisely define which values are committed, who computed them, and what the proof establishes. ZK proving “Mesh's stored source count ≥ 3” does not establish sources truly independent unless that attribute was honestly validated.
2. Bind proof to immutable Passport hash/root, schema/method version, claim ID, policy hash, verifier challenge/nonce and age/freshness/status as externally checked.
3. Support selective fields and proofs without exposing private evidence or uniquely identifying users unnecessarily; avoid public on-chain metadata that defeats privacy.
4. Protect against replay, double use when forbidden, wrong Passport versions, stale Passport status, revoked issuer and malicious proof formatting.
5. Make performance/cost of proving (browser vs server) measurable; never block basic Passport use on ZK compute.
6. Independent verification must work without trusting the Mesh API to say “valid.”
7. Clearly label `SELECTIVE_DISCLOSURE` vs `ZERO_KNOWLEDGE_POLICY_PROOF` in API and UI.

**Acceptance:** altering a Merkle leaf fails selective-disclosure verification; ZK pilot demonstrates a real inequality/predicate hidden value, valid public root/policy binding, replay resistance and rejection of false witness; all unsupported policies fail explicitly.

**Priority:** selective disclosure P1; true ZK predicate proofs R&D/late incubation if feasible.

---

## 7. Cross-feature workflows

### 7.1 Viral image → ambient context → refreshed Passport

1. Browser extension recognizes an opt-in image/post and computes safe local identifiers.
2. Lookup returns a semantically and temporally compatible canonical claim.
3. Existing Passport is stale; UI displays a stale notice, not a confident current badge.
4. Image engine retrieves earlier known visual occurrence, checks captions/context and C2PA if available.
5. Adaptive Research seeks primary sources and independent counterevidence.
6. EvidenceProof verifies exact quoted excerpts and clusters dependent sources.
7. New Passport version is created and cryptographically bound to method/evidence roots.
8. Evidence Delta shows changes; Watch sends one non-duplicative notice.
9. User optionally shares a context card with the original claim; no automatic posting.

### 7.2 AI agent decision gate

1. Agent requests verification for a specific actionable assertion.
2. MCP returns existing current Passport or asynchronous verification job.
3. Agent supplies policy with explicit scope, freshness and insufficiency behavior.
4. Policy engine returns `PASS`, `FAIL`, `INDETERMINATE` or `ESCALATE` with exact reasons, source counts and Passport version.
5. If agent chooses an action under its own separate authorization, it records DecisionReceipt referencing evidence and policy versions. Mesh does not execute the action or imply permission.

### 7.3 Private portal evidence → selective disclosure

1. User selects one supported portal and minimal predicate.
2. Private proof provider produces authenticated-source proof with user consent.
3. Mesh verifies source binding/freshness and stores a minimized private EvidenceProof.
4. Mesh issues a signed private Passport (visibility restricted).
5. User discloses selected committed attributes through Merkle proofs to an authorized verifier.
6. Later full ZK pilot can prove a predetermined policy predicate without revealing committed values; status/freshness must still be verified.

### 7.4 Grant milestone → evidence bounty → review

1. Grant officer defines exact milestone and evidence rubric.
2. Mesh finds missing evidence and issues `NEEDS_INFO`.
3. Funder creates bounded bounty for a missing primary record.
4. Contributor submits evidence; automated checks and human adjudication validate it.
5. Reward pays under explicit escrow rules; new Passport version reflects evidence.
6. Grant approver applies program rules and signs final decision; no automatic release based merely on Mesh score.

### 7.5 Prediction-market outcome dossier

1. Market rules are established *before outcome time*, including deadlines and source hierarchy.
2. After closing, Mesh retrieves primary time-stamped outcome evidence.
3. Dossier records proposition, source dates, uncertainty and exact evidence.
4. If objectively resolvable and approved by authorized oracle, market can reference result. Ambiguity/contest triggers formal dispute; no LLM auto-settlement.

## 8. Suggested public API (illustrative, not existing routes)

Maintain existing `/api/v1/verifications`, `/api/v1/verifications/stream`, `/api/v1/passports/...` contracts. Add versioned endpoints after schema review:

```text
POST   /api/v2/investigations
GET    /api/v2/investigations/{jobId}
GET    /api/v2/investigations/{jobId}/events
POST   /api/v2/claims/match
GET    /api/v2/claims/{claimId}
GET    /api/v2/claims/{claimId}/relations
GET    /api/v2/passports/{id}
GET    /api/v2/passports/{id}/versions
GET    /api/v2/passports/{id}/versions/{version}
GET    /api/v2/passports/{id}/delta?from=&to=
POST   /api/v2/passports/{id}/refresh
GET    /api/v2/evidence/{evidenceId}/proof
POST   /api/v2/watches
PATCH  /api/v2/watches/{id}
DELETE /api/v2/watches/{id}
POST   /api/v2/policies/evaluate
POST   /api/v2/decision-receipts
GET    /api/v2/methods/{hash}
POST   /api/v2/attestations
POST   /api/v2/challenges
POST   /api/v2/private-proofs/verify
POST   /api/v2/disclosures/verify
POST   /api/v2/cases
POST   /api/v2/bounties
POST   /api/v2/bounties/{id}/submissions
POST   /api/v2/market-resolutions
```

MCP tools are a thin permissioned layer over these domain services, not a separate fact-check pipeline. All endpoints return stable result/error codes, ownership boundaries, rate-limit information where appropriate, pagination, idempotency support for mutations and audit IDs. Use strict authenticated scopes for private resources.

## 9. Suggested package/module boundaries

```text
apps/web/               # existing Next.js app + new Passport UI, Trust Vault, Guard
apps/api/               # existing NestJS service
apps/telegram-bot/      # existing client adapted to new job/passport APIs
apps/browser-extension/ # proposed Mesh Lens
apps/mcp-server/        # proposed MCP transport / auth; calls shared API services
apps/workers/           # proposed queued media/research/watch jobs, if separated
apps/contracts/         # existing registry + versioned attestation experiments
packages/shared/        # DTOs, schemas, passport semantics, typed events
packages/sdk-ts/        # future SDK
packages/verify-core/   # canonical hashes, Merkle, deterministic policies
packages/evals/         # benchmark fixtures/harness
```

Avoid splitting into microservices prematurely. Group NestJS modules by domains: `claims`, `occurrences`, `research`, `sources`, `evidence`, `media`, `passports`, `watch`, `policies`, `attestations`, `cases`, `bounties`, `private-proofs`, `evaluation`, `auth`.

## 10. Recommended phase ordering (relative; adjust to actual incubation calendar)

**Phase 0 — foundation hardening (weeks 1–2):** audit repo, lock baseline tests, define schema v2 and canonical hashing, instrument provider costs/latency, add async job infrastructure if needed, SSRF/retention/auth/rate-limit review, establish Mesh Bench baseline and security fixtures. Publish scope decisions and method-manifest plan.

**Phase 1 — evidence intelligence (weeks 3–5):** implement canonical claims/aliases + multilingual hybrid matching; official Fact Check lookup; Evidence Planner, adaptive search, sufficiency/abstention, EvidenceProof quote/snapshot/lineage, first source-family classifier, regression benchmarks. This is the hardest product-quality foundation.

**Phase 2 — living network (weeks 6–7):** immutable Passport versions + status/freshness policy + Evidence Delta; Watch + notification queue; MethodHash and signed artifact; extend on-chain attestation only after deterministic replay tests.

**Phase 3 — user/developer distribution (weeks 8–9):** Mesh Lens browser selection/lookup/Trust Tag, improved share cards, unified Telegram flow, WhatsApp onboarding/pilot subject to approval; MCP server + Trust Policy Engine + signed DecisionReceipt prototype.

**Phase 4 — visual differentiator (weeks 10–11):** native image understanding (verified provider), OCR, pHash, C2PA validation and one real reverse-image/context source adapter; demonstrate genuine image/false caption; run cross-language and image evaluation. Choose *one* Guard wedge and complete 3 real demonstrations.

**Phase 5 — proofs and vertical pilots (week 12 and beyond):** limited zkTLS private-source PoC, selective disclosure proof, evidence bounty pilot; one grant/DAO evidence case and one prediction-market outcome dossier (sandbox/advisory only). Full ZK circuit and commercial/chain settlement integrations only after core quality and security gates pass.

**Critical path:** F12 security + canonical schemas → F01/F02/F03 → F04/F05 → F07/F08/F10 → F06/F09; F11 parallel after schema freeze; F16/F17 depend on commitment schema/private evidence design; F13/F14/F15 depend on policy/dispute/evidence mechanisms. If team capacity is small, deprioritize full ZK, bounty escrow, market contract integration and expansive media provider matrices before compromising evidence quality.

## 11. Delivery gates and acceptance metrics

The following are **proposed targets**, not performance claims. Set baselines from the repository and adjust using pilot evidence.

| Gate | Proposed evidence of completion |
|---|---|
| Functional integrity | Old passport routes and on-chain checks still work; v2 hashes reproduce deterministically |
| Claim memory | Human-reviewed matching set shows high precision across English/paraphrases/selected languages; temporal and negation negatives do not merge |
| Research quality | Benchmark macro-F1, evidence Recall@K, correct abstention and source-family metrics are reported against MVP baseline |
| EvidenceProof | All quotes labelled exact actually align with captured source; non-exact paraphrases never presented as exact |
| Freshness | One verifiable source correction creates new immutable version, accurate Delta and one watch notification |
| Image context | Genuine visual/false caption, C2PA-present/absent and cropped near-duplicate cases differentiated correctly or marked uncertain |
| Lens/Guard | Browser manual selection works with no private automatic scraping; one Guard wedge handles benign, adverse and uncertain cases |
| Agent | MCP policy call returns deterministic policy verdict; no missing field interpreted as PASS; DecisionReceipt bound to exact Passport/method |
| Security | Indirect prompt-injection and SSRF fixtures fail to change tool/score logic; private submissions inaccessible without permission |
| Attestation | Altering signed payload or method breaks verifier, prior signatures remain historically verifiable |
| zkTLS/ZK | Provider-supported private proof verified, tampering rejected; selective disclosure proved separately from actual ZK capabilities |
| Operations | Instrumented p50/p95 latency, costs per investigation, queue retries, watch delivery rates and incident alerts |

Never claim benchmark gains until measured. Use domain-specific performance because fact-checking quality is uneven across topics/languages/media.

## 12. Risk register and controls

- **False confidence / harm:** show uncertainty, limitations, human escalation and disallow score-based irreversible action.
- **Semantic mis-merges:** structured temporal/negation/entity checks, candidate thresholds, review/split audit trail.
- **Source laundering:** source-family graph, primary-source preference, snapshot/citation verification and cross-retriever validation.
- **Prompt injection / SSRF:** hostile-input isolation, URL/network safety, tool permissions, test harness, logs with safe redaction.
- **Multimodal detector errors:** independent dimensions; no C2PA ≠ synthetic; no reverse-image match ≠ original.
- **Privacy / data deletion:** private-by-default, consented publishing, encrypted storage, configurable retention, no permanent public archive of sensitive submissions.
- **Blockchain overclaiming:** clear language that hashes attest integrity not real-world correctness; deployed network verification.
- **Unvalidated proof cryptography:** vetted libraries/providers, documented trust assumptions, independent verifier, no self-attested “ZK valid” booleans.
- **Bounty manipulation:** capped rewards, objective rubrics, independent adjudicators, staged escrow, dispute/refund controls.
- **Market/insurance/regulatory:** narrow test environments, predetermined resolution rules, legal review, human control and no automatic payout from uncertain AI conclusions.
- **Cost / quota:** adaptive budgets, semantic cache, stop conditions, per-tenant quotas, async processing and notification dedupe.
- **Too much scope:** gate expansion; ship one real connected vertical instead of many incomplete promises.

## 13. Business and ecosystem model (hypotheses, not verified demand)

- **Free consumer:** limited public verification, Lookup/Lens, shareable current Passport and transparent limitations.
- **Consumer premium:** increased quotas, Passport Watch, private Trust Vault, optional advanced visual research (ensure critical safety access is not exclusively paywalled).
- **Developer/API:** per investigation, storage/watch, image-heavy compute, SLA, webhooks and policy evaluation, potentially machine-payment integration later.
- **Organizations:** newsroom/research workspace, audit/reporting, bulk investigation, private evidence, policy packs, signed institutional attestations and compliance-friendly retention.
- **Specialized cases:** paid grant/DAO milestone evidence review, research/evidence bounties, custom prediction-market outcome dossiers (subject to restrictions).
- **Protocol:** open core Passport and hashing specs; monetize proprietary managed service, evaluation/retrieval quality, scale and support. A transferable Mesh token is not required.

**Validation tasks:** Interview journalists/fact-checkers, student/opportunity communities, Web3 agent developers and one grant/DAO operator; recruit pilot users; measure repeat usage, verified source access and actual time saved; obtain documented partnerships rather than present unconfirmed pilots as signed.

## 14. Product decisions the owner must resolve

1. Is the first Guard wedge **Before You Share** (recommended implementation efficiency) or **Opportunity/Scam Check** (strong direct financial utility)? Choose exactly one for incubation.
2. What is the actual incubation duration, team size and hard demo date? Relative phases must be adjusted.
3. Do we require continued use of Gonka Router for all LLM inference in incubation, or can domain-specific vetted models/providers be integrated directly? This changes VLM feasibility.
4. Which languages must be benchmarked and shipped first? Suggest English and 1–2 locally important languages before promising universal multilingual support.
5. What external providers, API keys, approvals and budgets exist (image search, archive, C2PA, WhatsApp Business, zkTLS)?
6. Which sources may be publicly archived under copyright/terms and privacy rules?
7. Does “Passport private by default” apply to every upload or only authenticated/sensitive investigations? How do users authorize public publication?
8. Should attestation build on the current custom Sepolia registry, add EAS on same network, or migrate by version while preserving v1 validity?
9. Which vertical pilot partner can supply legally shareable real test cases for DAO/grant/insurance and prediction markets?
10. Are evidence bounties initially reputation-only, off-chain payouts, or audited stablecoin escrow? Who adjudicates disputes?
11. Which supported portal/predicate is feasible for zkTLS private-evidence proof? Who owns source authorization and rights?
12. What level of ZK functionality is contractually required: selective disclosure (near-term) or actual circuit-verified predicate proof (advanced)?
13. What percentage of engineering time is reserved for evaluation, security, bug fixing and deployment stability?
14. What external independent reviewers/institutions could sign attestations without implying endorsement they have not granted?

## 15. Instructions to the next builder/coding agent

1. Read this entire document and then inspect the actual GitHub repository, migrations, controllers, UI, bot and contract before proposing changes.
2. Produce a *gap analysis* marking `EXISTING`, `PARTIAL`, `NOT BUILT`, `REQUIRES THIRD-PARTY`, `R&D` for each functional requirement. Cite filenames for existing code.
3. Ask the owner the material questions above; do not resolve Guard choice, chain/schema migration, provider costs/consent or zkTLS source by assumption.
4. Create architecture diagrams and migration plan covering backward compatibility, ownership/visibility boundaries, idempotency and data retention.
5. Split work into vertical slices with one real tested end-to-end experience at a time, especially for Lens, Guard, image context and agent policy.
6. Keep deterministic algorithms isolated and independently testable; do not let generative models fabricate exact quotes, signed receipts, benchmark results or independently verified source facts.
7. Use strict DTO/Zod validation; real authenticated provider integrations, retries and observable errors; no production mocks hidden behind success responses.
8. Add unit, integration, contract, security and E2E tests (including fixture provenance and negative cases) before calling functionality done.
9. Document exact env keys, provider setup, callback/webhook registration, local migrations, test workflows, deployment and rollback procedures. Never commit secrets.
10. At every milestone report what shipped, what failed, measured latency/cost/quality, known limitations, compliance/privacy concerns and next blockers.

---

## 16. Final product definition

**Mesh is an open, living evidence network that helps people and autonomous systems determine what they can responsibly rely on before acting.** Its cumulative differentiator is not the number of AI models or blockchains. It is **shared claim memory + adaptive evidence research + independently inspectable source lineage + living Passport updates + ambient distribution + policy-aware decision support + cryptographic provenance + privacy-preserving proofs**.

A coherent incubation demo starts with an existing claim resurfacing in a misleading screenshot, uses Memory to identify it, image provenance and EvidenceProof to identify the contextual problem, adaptive research to produce an evidence-complete update, publishes an immutable new Passport with explainable Delta, shows the Trust Tag and voluntary contextual sharing, alerts a watcher, then demonstrates an autonomous agent failing a strict policy against the same Passport. An optional supported private-proof demonstration and a sandbox outcome-evidence dossier reveal the broader architecture without pretending unresolved research is already production-ready.
