import { Candidate, Job, AICVEvaluation, CandidateStage } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Extended evaluation schema (superset of AICVEvaluation)
// ─────────────────────────────────────────────────────────────────────────────

export interface DetailedEvaluation extends AICVEvaluation {
  // Verdict tier
  tier: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  // Individual dimension scores (all 0-100)
  technicalDepthScore: number;
  experienceRelevanceScore: number;
  seniorityAlignmentScore: number;
  achievementQualityScore: number;
  communicationClarityScore: number;
  // Red flags (blockers / serious concerns)
  redFlags: string[];
  // Green flags (genuine differentiators)
  greenFlags: string[];
  // Honest, non-inflated reasoning
  scoringRationale: string;
  // What the candidate is MISSING vs the job spec
  criticalGaps: string[];
  // Specific, actionable interview questions (targeted at this candidate's gaps)
  probeQuestions: string[];
  // Whether the LLM was used
  usedLLM: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini prompt — engineered for genuine differentiation
// ─────────────────────────────────────────────────────────────────────────────

const buildGeminiPrompt = (candidate: Candidate, job: Job): string => `
You are a senior technical recruiter and hiring manager with 15 years of experience. 
Your job is to give an HONEST, CALIBRATED, and RIGOROUS assessment of a candidate's CV 
against a specific job description. You must be able to tell the difference between a 
strong candidate and a weak one.

CRITICAL INSTRUCTIONS — READ CAREFULLY:
1. Scores must be CALIBRATED. A score of 90+ means "hire immediately, exceptional match." 
   A score of 50 means "significant gaps, borderline." A score of 30 means "wrong profile entirely."
   Most candidates should score between 35-75. Only truly exceptional matches score above 85.
2. Do NOT inflate scores. Honest negative feedback is more valuable than false positives.
3. Look for RED FLAGS: vague bullet points with no metrics, excessive job hopping (3+ jobs in 3 years),
   skills listed without evidence, unexplained gaps, buzzword soup without real substance.
4. Look for GREEN FLAGS: quantified achievements ("increased X by Y%"), relevant industry experience,
   progression from junior to senior roles, open source contributions, specific technical depth.
5. Seniority mismatch is a HARD penalty: if the job asks for 5+ years and the CV shows 2 years, 
   the experienceRelevanceScore must be ≤ 40, and overall score cannot exceed 55.
6. If the CV text is minimal (under 100 words) or vague, score cannot exceed 50.
7. The 'tier' field must be your genuine recommendation:
   - 'strong_yes': Top 5% candidate, fast-track
   - 'yes': Good match, proceed normally
   - 'maybe': Conditional, needs validation
   - 'no': Missing key requirements
   - 'strong_no': Wrong profile entirely

══════════════════════
JOB SPECIFICATION
══════════════════════
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Type: ${job.type}
Description: ${job.description}
Required Skills / Qualifications:
${(job.requirements || []).map((r, i) => `  ${i + 1}. ${r}`).join('\n')}
Salary Range: ${job.salaryRange || 'Not specified'}

══════════════════════
CANDIDATE CV / PROFILE
══════════════════════
Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone || 'Not provided'}
LinkedIn: ${candidate.linkedinUrl || 'Not provided'}
Portfolio/GitHub: ${candidate.portfolioUrl || 'Not provided'}
Tags/Skills declared: ${(candidate.tags || []).join(', ') || 'None'}
Recruiter Notes: ${candidate.notes || 'None'}

CV / Resume Text:
---
${candidate.resumeText?.trim() || '[No CV text provided — severely penalize this: max score 35]'}
---

══════════════════════
REQUIRED JSON OUTPUT
══════════════════════
Return ONLY valid JSON. No markdown, no explanation outside the JSON.

{
  "score": <integer 0-100, calibrated overall fit score>,
  "tier": <"strong_yes" | "yes" | "maybe" | "no" | "strong_no">,
  "summary": "<2-3 sentence executive summary. Be direct and honest. If weak, say so.>",
  "scoringRationale": "<3-5 sentences explaining WHY this score was given, referencing specific CV evidence or lack thereof>",
  "technicalDepthScore": <0-100>,
  "experienceRelevanceScore": <0-100>,
  "seniorityAlignmentScore": <0-100>,
  "achievementQualityScore": <0-100, based on quantified results vs vague claims>,
  "communicationClarityScore": <0-100, based on how clearly the CV is written>,
  "skillsMatch": <0-100, hard skills overlap>,
  "experienceMatch": <0-100, years and domain relevance>,
  "seniorityMatch": <0-100, level alignment>,
  "cultureMatch": <0-100, work style and values signals>,
  "strengths": ["<specific strength with CV evidence>", "<second strength>", "<optional third>"],
  "greenFlags": ["<genuine differentiator 1>", "<genuine differentiator 2>"],
  "gaps": ["<gap 1 — what is missing vs job spec>", "<gap 2>"],
  "criticalGaps": ["<blocker 1 — a must-have requirement not met>"],
  "redFlags": ["<red flag 1 — e.g. job hopping, vague claims, no metrics>"],
  "recommendedStage": <"sourced" | "screening" | "interview" | "offer" | "hired" | "rejected">,
  "tailoredInterviewQuestions": [
    "<Q1 — probes a specific gap or verifies a claimed skill>",
    "<Q2 — tests depth on a required competency>",
    "<Q3 — clarifies a red flag or ambiguity>"
  ],
  "probeQuestions": [
    "<Deep technical probe 1>",
    "<Behavioral/situational probe 2>",
    "<Red flag clarification probe 3>"
  ],
  "draftOutreachEmail": "<personalized recruiter email if tier is yes/strong_yes, or a polite decline template if no/strong_no>"
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Gemini API call
// ─────────────────────────────────────────────────────────────────────────────

async function evaluateWithGemini(
  candidate: Candidate,
  job: Job,
  apiKey: string
): Promise<DetailedEvaluation> {
  const prompt = buildGeminiPrompt(candidate, job);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature → consistent, calibrated output
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const raw = JSON.parse(cleaned);

  return normalizeGeminiOutput(raw);
}

function normalizeGeminiOutput(raw: any): DetailedEvaluation {
  const score = Math.max(0, Math.min(100, Number(raw.score) || 50));

  return {
    score,
    tier: raw.tier || scoreTier(score),
    summary: raw.summary || '',
    scoringRationale: raw.scoringRationale || '',
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    greenFlags: Array.isArray(raw.greenFlags) ? raw.greenFlags : [],
    gaps: Array.isArray(raw.gaps) ? raw.gaps : [],
    criticalGaps: Array.isArray(raw.criticalGaps) ? raw.criticalGaps : [],
    redFlags: Array.isArray(raw.redFlags) ? raw.redFlags : [],
    recommendedStage: (raw.recommendedStage as CandidateStage) || stageFromScore(score),
    evaluatedAt: new Date().toISOString(),
    // Dimensional scores
    skillsMatch: clamp(raw.skillsMatch ?? raw.technicalDepthScore ?? 50),
    experienceMatch: clamp(raw.experienceMatch ?? raw.experienceRelevanceScore ?? 50),
    seniorityMatch: clamp(raw.seniorityMatch ?? raw.seniorityAlignmentScore ?? 50),
    cultureMatch: clamp(raw.cultureMatch ?? raw.communicationClarityScore ?? 50),
    technicalDepthScore: clamp(raw.technicalDepthScore ?? 50),
    experienceRelevanceScore: clamp(raw.experienceRelevanceScore ?? 50),
    seniorityAlignmentScore: clamp(raw.seniorityAlignmentScore ?? 50),
    achievementQualityScore: clamp(raw.achievementQualityScore ?? 50),
    communicationClarityScore: clamp(raw.communicationClarityScore ?? 50),
    tailoredInterviewQuestions: Array.isArray(raw.tailoredInterviewQuestions)
      ? raw.tailoredInterviewQuestions
      : [],
    probeQuestions: Array.isArray(raw.probeQuestions) ? raw.probeQuestions : [],
    draftOutreachEmail: raw.draftOutreachEmail || '',
    usedLLM: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Heuristic Engine — calibrated, penalizes weak CVs
// ─────────────────────────────────────────────────────────────────────────────

function evaluateWithHeuristics(candidate: Candidate, job: Job): DetailedEvaluation {
  const cvText = [
    candidate.resumeText || '',
    (candidate.tags || []).join(' '),
    candidate.notes || '',
    candidate.linkedinUrl || '',
    candidate.portfolioUrl || '',
  ]
    .join('\n')
    .toLowerCase();

  const jobText = `${job.title} ${job.description} ${(job.requirements || []).join(' ')}`.toLowerCase();
  const jobReqs = job.requirements || [];

  // ── 1. CV completeness check (hard cap if CV is empty / thin) ──
  const cvWordCount = (candidate.resumeText || '').trim().split(/\s+/).filter(Boolean).length;
  const noCV = cvWordCount < 30;
  const thinCV = cvWordCount < 100;

  // ── 2. Skill matching ──
  const matchedReqs: string[] = [];
  const missingReqs: string[] = [];

  for (const req of jobReqs) {
    const reqWords = req.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matched = reqWords.filter((w) => cvText.includes(w)).length;
    const ratio = reqWords.length > 0 ? matched / reqWords.length : 0;
    if (ratio >= 0.5) {
      matchedReqs.push(req);
    } else {
      missingReqs.push(req);
    }
  }

  const skillMatchRatio = jobReqs.length > 0 ? matchedReqs.length / jobReqs.length : 0;

  // ── 3. Seniority detection ──
  const SENIOR_SIGNALS = /senior|sr\.|lead|staff|principal|architect|director|vp|head of|cto|founder|8\+|9\+|10\+|7\+|6\+/i;
  const MID_SIGNALS = /5\+ years|4\+ years|3\+ years|mid.level|mid level/i;
  const JUNIOR_SIGNALS = /junior|jr\.|intern|graduate|entry.level|entry level|bootcamp|1\+ year|2\+ year/i;
  const hasSenior = SENIOR_SIGNALS.test(cvText);
  const hasMid = MID_SIGNALS.test(cvText);
  const hasJunior = JUNIOR_SIGNALS.test(cvText);

  // Detect what the job requires
  const jobNeedsSenior = SENIOR_SIGNALS.test(jobText);
  const jobNeedsJunior = JUNIOR_SIGNALS.test(jobText);

  // ── 4. Achievement quality signals ──
  const QUANTIFIED_ACHIEVEMENT = /\d+%|\$\d+[kmb]?|\d+x|\d+k users|\d+ users|arr|revenue|retention|latency|reduced|improved|led|architected|built|scaled|launched|delivered/i;
  const achievementMatches = (candidate.resumeText || '').match(QUANTIFIED_ACHIEVEMENT) || [];
  const hasQuantifiedAchievements = achievementMatches.length >= 2;
  const hasVagueClaims = /responsible for|worked on|assisted|helped with|various|multiple tasks/i.test(cvText);

  // ── 5. Red flags ──
  const redFlags: string[] = [];
  if (noCV) redFlags.push('No CV text provided — cannot assess technical depth');
  if (thinCV && !noCV) redFlags.push('CV is very brief — insufficient detail to fully evaluate');
  if (hasVagueClaims && !hasQuantifiedAchievements) redFlags.push('CV uses vague language without measurable achievements');
  if (!candidate.linkedinUrl && !candidate.portfolioUrl) redFlags.push('No LinkedIn or portfolio link — professional presence unverified');

  // Seniority mismatch penalty
  let seniorityMismatch = false;
  if (jobNeedsSenior && hasJunior) {
    redFlags.push('Seniority mismatch: Job requires senior level but CV signals junior/entry-level experience');
    seniorityMismatch = true;
  }
  if (!jobNeedsSenior && !jobNeedsJunior && hasSenior) {
    // Overqualified — less severe
    redFlags.push('Candidate may be overqualified for this role — risk of disengagement or quick departure');
  }

  // ── 6. Green flags ──
  const greenFlags: string[] = [];
  if (hasQuantifiedAchievements) greenFlags.push('CV demonstrates measurable, quantified achievements');
  if (candidate.linkedinUrl && candidate.portfolioUrl) greenFlags.push('Verified professional presence: LinkedIn + public portfolio');
  if (hasSenior && jobNeedsSenior) greenFlags.push('Seniority level aligns with job requirement');
  if (skillMatchRatio >= 0.7) greenFlags.push(`Strong technical overlap — ${matchedReqs.length}/${jobReqs.length} requirements matched`);
  if (candidate.resumeText && cvWordCount > 300) greenFlags.push('Detailed CV provides strong basis for evaluation');

  // ── 7. Compute dimensional scores ──
  let technicalDepthScore = noCV ? 10 : thinCV ? 30 : Math.round(45 + skillMatchRatio * 45);
  if (hasQuantifiedAchievements) technicalDepthScore = Math.min(92, technicalDepthScore + 12);

  let experienceRelevanceScore = noCV ? 10 : Math.round(50 + skillMatchRatio * 30);
  if (seniorityMismatch) experienceRelevanceScore = Math.min(experienceRelevanceScore, 38);
  if (hasMid || hasSenior) experienceRelevanceScore = Math.min(95, experienceRelevanceScore + 10);

  let seniorityAlignmentScore = 60; // default neutral
  if (seniorityMismatch) seniorityAlignmentScore = 20;
  else if (hasSenior && jobNeedsSenior) seniorityAlignmentScore = 88;
  else if (hasJunior && jobNeedsJunior) seniorityAlignmentScore = 85;
  else if (hasMid) seniorityAlignmentScore = 70;

  const achievementQualityScore = noCV ? 10
    : hasQuantifiedAchievements ? Math.round(72 + Math.min(28, achievementMatches.length * 4))
    : hasVagueClaims ? 30
    : 50;

  const communicationClarityScore = noCV ? 10 : thinCV ? 35
    : cvWordCount > 400 ? 78 : cvWordCount > 200 ? 65 : 50;

  // ── 8. Weighted overall score ──
  // Weights: technical 30%, experience 30%, seniority 20%, achievement 15%, communication 5%
  let score = Math.round(
    technicalDepthScore * 0.30 +
    experienceRelevanceScore * 0.30 +
    seniorityAlignmentScore * 0.20 +
    achievementQualityScore * 0.15 +
    communicationClarityScore * 0.05
  );

  // Hard caps
  if (noCV) score = Math.min(score, 25);
  if (thinCV) score = Math.min(score, 48);
  if (seniorityMismatch) score = Math.min(score, 52);
  if (redFlags.length >= 3) score = Math.min(score, 55);

  // Bonuses
  if (hasQuantifiedAchievements && skillMatchRatio >= 0.6 && !seniorityMismatch) score += 5;
  if (candidate.linkedinUrl && candidate.portfolioUrl) score += 3;

  score = Math.max(5, Math.min(95, score));

  // ── 9. Tier ──
  const tier = scoreTier(score);

  // ── 10. Summary ──
  const matchSummary = `${matchedReqs.length} of ${jobReqs.length} required skills matched.`;
  let summary = '';
  if (score >= 82) {
    summary = `Strong candidate for ${job.title}. ${matchSummary} Profile demonstrates relevant depth with ${hasQuantifiedAchievements ? 'measurable achievements and ' : ''}solid alignment on core requirements.`;
  } else if (score >= 62) {
    summary = `Promising but incomplete match for ${job.title}. ${matchSummary} ${missingReqs.length > 0 ? `Key gaps remain in: ${missingReqs.slice(0, 2).join(', ')}.` : ''} Recommend a screening call to validate depth.`;
  } else if (score >= 42) {
    summary = `Weak match for ${job.title}. ${matchSummary} ${seniorityMismatch ? 'Significant seniority gap detected. ' : ''}Profile does not clearly demonstrate required qualifications. Requires substantial validation.`;
  } else {
    summary = `Poor fit for ${job.title}. ${noCV ? 'No CV content to evaluate. ' : ''}${matchSummary} ${missingReqs.length > 0 ? `Critical requirements absent: ${missingReqs.slice(0, 3).join(', ')}.` : ''} Not recommended for progression without significant additional information.`;
  }

  // ── 11. Strengths ──
  const strengths: string[] = [];
  if (matchedReqs.length > 0) {
    strengths.push(`Matches ${matchedReqs.length} core requirement${matchedReqs.length > 1 ? 's' : ''}: ${matchedReqs.slice(0, 3).join(', ')}`);
  }
  if (hasQuantifiedAchievements) {
    strengths.push('CV contains quantified achievements — evidence of real impact, not just responsibilities');
  }
  if (candidate.linkedinUrl) {
    strengths.push('LinkedIn profile provided — baseline professional credibility verified');
  }
  if (hasSenior && jobNeedsSenior) {
    strengths.push('Seniority signals match the level required by the role');
  }
  if (strengths.length === 0) {
    strengths.push('Background may offer some transferable skills pending further validation');
  }

  // ── 12. Gaps ──
  const gaps: string[] = [];
  if (missingReqs.length > 0) {
    gaps.push(`Missing or undemonstrated: ${missingReqs.slice(0, 3).join(', ')}`);
  }
  if (!hasQuantifiedAchievements && !noCV) {
    gaps.push('No quantified achievements found — impact and scale of past work unclear');
  }
  if (thinCV) {
    gaps.push('CV lacks depth — request full CV or detailed work history before progressing');
  }
  if (gaps.length === 0) {
    gaps.push('Clarify compensation expectations and availability');
  }

  const criticalGaps = missingReqs.length > 0
    ? missingReqs.slice(0, 2).map((r) => `Required qualification not evidenced in CV: "${r}"`)
    : [];

  // ── 13. Interview questions ──
  const tailoredInterviewQuestions: string[] = [
    missingReqs.length > 0
      ? `"Our role requires strong ${missingReqs[0]}. Can you walk me through a specific project where you used this — what was your exact contribution and what was the outcome?"`
      : `"Describe the most technically complex system you have built. What were the key architectural decisions and tradeoffs you made?"`,
    hasVagueClaims || !hasQuantifiedAchievements
      ? `"You mentioned working on X — what were the measurable results? What metrics did you own?"`
      : `"What is the largest scale system you have worked on in terms of users, data volume, or team size?"`,
    seniorityMismatch
      ? `"This role expects ${hasSenior ? 'a different' : 'senior'} level ownership. Where specifically have you demonstrated that level of independent ownership and cross-functional leadership?"`
      : `"Tell me about a time you had to push back on a product or business decision. How did you handle it and what was the result?"`,
  ];

  const probeQuestions: string[] = [
    `"Rate your hands-on proficiency in ${jobReqs[0] || 'the primary technology'} on a scale of 1-10 and describe a recent project where you used it in production."`,
    `"What is something you built that you are genuinely proud of and why — specifically what was hard about it?"`,
    redFlags.length > 0
      ? `"I noticed ${redFlags[0].toLowerCase().split('—')[0].trim()} in your profile — can you give more context on that?"`
      : `"Where do you see the most significant gap between your current skills and what this role needs?"`,
  ];

  // ── 14. Outreach / decline ──
  const draftOutreachEmail = score >= 60
    ? `Hi ${candidate.name.split(' ')[0]},

I came across your profile and wanted to reach out regarding our ${job.title} opening at the ${job.department} team.

Your background${matchedReqs.length > 0 ? ` in ${matchedReqs.slice(0, 2).join(' and ')}` : ''} caught my attention and I think there could be a strong alignment here.

The role is based ${job.location} and offers ${job.salaryRange || 'competitive compensation'}.

Would you be open to a 20-minute call this week to explore the fit? Happy to share more details about the role and team.

Best regards,
Talent Team`
    : `Hi ${candidate.name.split(' ')[0]},

Thank you for your interest in the ${job.title} role. We've reviewed your profile carefully.

At this time, we feel the role requires a closer match to ${missingReqs.slice(0, 2).join(' and ') || 'certain key technical areas'}, and we would not want to waste your time on a process where the fit isn't strong.

We will keep your profile on file and reach out if a more suitable opportunity arises.

Thank you again, and best of luck in your search.

Best regards,
Talent Team`;

  return {
    score,
    tier,
    summary,
    scoringRationale: `Score of ${score}/100 based on: skill overlap ${Math.round(skillMatchRatio * 100)}% (${matchedReqs.length}/${jobReqs.length} reqs matched), CV depth (${cvWordCount} words), achievement quality (${hasQuantifiedAchievements ? 'quantified' : 'vague'}), seniority alignment (${seniorityMismatch ? 'MISMATCH' : 'ok'}). Red flags: ${redFlags.length}. Green flags: ${greenFlags.length}.`,
    strengths,
    greenFlags,
    gaps,
    criticalGaps,
    redFlags,
    recommendedStage: stageFromScore(score),
    evaluatedAt: new Date().toISOString(),
    skillsMatch: clamp(technicalDepthScore),
    experienceMatch: clamp(experienceRelevanceScore),
    seniorityMatch: clamp(seniorityAlignmentScore),
    cultureMatch: clamp(communicationClarityScore),
    technicalDepthScore: clamp(technicalDepthScore),
    experienceRelevanceScore: clamp(experienceRelevanceScore),
    seniorityAlignmentScore: clamp(seniorityAlignmentScore),
    achievementQualityScore: clamp(achievementQualityScore),
    communicationClarityScore: clamp(communicationClarityScore),
    tailoredInterviewQuestions,
    probeQuestions,
    draftOutreachEmail,
    usedLLM: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(Number(n) || 0)));
}

function scoreTier(score: number): DetailedEvaluation['tier'] {
  if (score >= 83) return 'strong_yes';
  if (score >= 66) return 'yes';
  if (score >= 48) return 'maybe';
  if (score >= 30) return 'no';
  return 'strong_no';
}

function stageFromScore(score: number): CandidateStage {
  if (score >= 83) return 'interview';
  if (score >= 65) return 'screening';
  if (score >= 45) return 'sourced';
  return 'rejected';
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main evaluation function.
 * - If a Gemini API key is available → calls the LLM with a calibrated expert prompt
 * - Fallback → runs the local heuristic engine (still calibrated & differentiating)
 */
export async function evaluateCandidateCV(
  candidate: Candidate,
  job: Job,
  apiKey?: string
): Promise<DetailedEvaluation> {
  const key = apiKey || localStorage.getItem('ats_gemini_key') || '';

  if (key.trim().startsWith('AIzaSy')) {
    try {
      return await evaluateWithGemini(candidate, job, key.trim());
    } catch (err) {
      console.warn('[aiAssessment] Gemini call failed, using heuristics:', err);
    }
  }

  // Simulate a realistic processing delay for the local engine
  await new Promise((r) => setTimeout(r, 600));
  return evaluateWithHeuristics(candidate, job);
}

/**
 * Batch-rank a list of candidates against a job.
 * Returns candidates sorted from strongest to weakest fit,
 * with scores computed if not already present.
 */
export async function rankCandidatesForJob(
  candidates: Candidate[],
  job: Job,
  apiKey?: string
): Promise<Array<Candidate & { evaluation: DetailedEvaluation }>> {
  const results = await Promise.all(
    candidates.map(async (c) => {
      const evaluation = c.aiEvaluation
        ? (c.aiEvaluation as DetailedEvaluation)
        : await evaluateCandidateCV(c, job, apiKey);
      return { ...c, evaluation };
    })
  );

  return results.sort((a, b) => b.evaluation.score - a.evaluation.score);
}
