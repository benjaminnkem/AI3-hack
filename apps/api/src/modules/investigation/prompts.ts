const constraints = `Return JSON only. No markdown fences. No prose outside JSON.
Give concise reasoning summaries, never hidden chain-of-thought.
Use only supplied material. Distinguish absent evidence from contradictory evidence.
All enum values MUST be uppercase exactly as specified.
Numeric scores MUST be integers from 0 to 100 unless otherwise specified.`;

export const prompts = {
  visual: `${constraints}
You receive OCR text extracted from a user screenshot/image (Gonka gateway currently accepts text-only multimodal payloads).
Neutrally normalize that transcript: clean the visible text and list entities, dates, numbers, logos, and a factual scene description.
Do not decide truth or invent content that is not present in the OCR text.
If OCR is empty or garbled, say so in sceneDescription and keep arrays empty.
Schema:
{
  "visibleText": string,
  "entities": string[],
  "dates": string[],
  "numbers": string[],
  "logos": string[],
  "sceneDescription": string
}`,

  claims: `${constraints}
Extract 1-5 independent atomic, externally verifiable factual claims.
Exclude opinions, commands, feelings, and fact-free satire.
Return an empty claims array when none exist.
importance MUST be an integer from 1 to 5 inclusive (never higher than 5).
Provide 1-3 searchQueries that seek both confirmation and contradiction.
Schema:
{
  "claims": [
    {
      "text": string,
      "normalizedText": string,
      "importance": 1|2|3|4|5,
      "context": string,
      "dateSensitive": boolean,
      "searchQueries": string[1-3]
    }
  ]
}`,

  investigator: `${constraints}
Independently assess every supplied claim against the supplied evidence.
You MUST copy claimId values EXACTLY from the input claims[].id fields (they are UUIDs).
You MUST copy evidenceId values EXACTLY from the input evidence[].id fields (they are UUIDs).
direction MUST be one of: SUPPORTS, OPPOSES, NEUTRAL (uppercase only).
verdictSuggestion MUST be one of: SUPPORTED, UNVERIFIED, MISLEADING, CONTRADICTED.
supportProbability and confidence are 0-100 numbers.
Include one object in claims for every input claim.
Schema:
{
  "claims": [
    {
      "claimId": "uuid-from-input",
      "supportProbability": 0-100,
      "confidence": 0-100,
      "verdictSuggestion": "SUPPORTED|UNVERIFIED|MISLEADING|CONTRADICTED",
      "reasoningSummary": string,
      "evidenceAssessments": [
        {
          "evidenceId": "uuid-from-input",
          "direction": "SUPPORTS|OPPOSES|NEUTRAL",
          "qualityScore": 0-100
        }
      ],
      "missingContext": string[],
      "uncertainty": string
    }
  ]
}`,

  adversarial: `${constraints}
Challenge the leading conclusions: contradictions, weak sources, staleness, entity/date mismatch, unsupported causality, omitted context, image-context manipulation, and model conflicts.
Do not alter investigator scores.
claimId MUST match an input claim UUID when possible.
severity is 0-100.
Schema:
{
  "challenges": [
    {
      "claimId": "uuid",
      "challenge": string,
      "severity": 0-100,
      "resolved": boolean,
      "resolution": string
    }
  ]
}`,

  narrative: `${constraints}
Explain the already-computed deterministic scores and verdicts.
You may not change, reinterpret, or propose numeric scores or verdicts.
claimId MUST match supplied claim ids when possible.
Schema:
{
  "summary": string,
  "claimReasoning": [
    {
      "claimId": "uuid",
      "reasoningSummary": string
    }
  ]
}`,
};
