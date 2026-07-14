const constraints =
  'Return JSON only. Give concise reasoning summaries, never hidden chain-of-thought. Use only supplied material. Distinguish absent evidence from contradictory evidence.';
export const prompts = {
  visual: `${constraints} Neutrally normalize the image: transcribe visible text and list entities, dates, numbers, logos, and a factual scene description. Do not decide truth or infer intent.`,
  claims: `${constraints} Extract 1-5 independent atomic, externally verifiable factual claims. Exclude opinions, commands, feelings, and fact-free satire. Return an empty claims array when none exist. Provide 1-3 search queries that seek both confirmation and contradiction.`,
  investigator: `${constraints} Independently assess every supplied claim against every supplied evidence item. Return probabilities/confidence 0-100 and an assessment for each relevant evidence UUID with direction and source-quality score.`,
  adversarial: `${constraints} Challenge the leading conclusions: find contradictions, circular/weak sources, staleness, entity/date mismatch, unsupported causality, omitted context, image-context manipulation, and model conflicts. Do not alter investigator outputs.`,
  narrative: `${constraints} Explain the already-computed deterministic scores and verdicts. You may not change, reinterpret, or propose numeric scores or verdicts.`,
};
