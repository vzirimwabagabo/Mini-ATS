/**
 * CV Structure Extractor — LLM-powered structured information extraction
 *
 * Pipeline:
 *   raw CV text  →  Gemini API (or heuristic fallback)  →  ParsedCV JSON
 *
 * The ParsedCV schema is what gets auto-filled into the candidate form fields.
 */

export interface ParsedWorkExperience {
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ParsedEducation {
  institution: string;
  degree?: string;
  field?: string;
  graduationYear?: string;
}

export interface ParsedCV {
  /** Candidate's full name */
  fullName?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** LinkedIn profile URL */
  linkedinUrl?: string;
  /** Portfolio or GitHub URL */
  portfolioUrl?: string;
  /** List of extracted skills / technologies */
  skills: string[];
  /** Work experience entries (most recent first) */
  workExperience: ParsedWorkExperience[];
  /** Education history */
  education: ParsedEducation[];
  /** One-paragraph professional summary extracted or inferred */
  summary?: string;
  /** Approximate years of total experience */
  totalYearsExperience?: number;
  /** Seniority level inferred from the CV */
  seniorityLevel?: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  /** Any languages mentioned */
  languages?: string[];
}

// ---------------------------------------------------------------------------
// Gemini API extraction
// ---------------------------------------------------------------------------

const CV_PARSE_PROMPT = (cvText: string) => `
You are an expert HR data extraction AI. Extract all structured information from the following CV/resume text.

CV TEXT:
---
${cvText.slice(0, 12000)}
---

Return ONLY a valid JSON object matching this schema. If a field is not found, omit it or return null. 
Do NOT wrap the JSON in markdown code fences.

{
  "fullName": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "linkedinUrl": "string or null — full URL if found",
  "portfolioUrl": "string or null — GitHub, personal site, etc.",
  "skills": ["array of skill strings"],
  "workExperience": [
    {
      "company": "company name",
      "title": "job title",
      "startDate": "e.g. Jan 2020 or null",
      "endDate": "e.g. Mar 2023 or Present or null",
      "description": "brief 1-2 sentence description of role or null"
    }
  ],
  "education": [
    {
      "institution": "university or school name",
      "degree": "e.g. Bachelor's or null",
      "field": "e.g. Computer Science or null",
      "graduationYear": "e.g. 2018 or null"
    }
  ],
  "summary": "1-2 sentence professional summary of the candidate or null",
  "totalYearsExperience": number or null,
  "seniorityLevel": "junior | mid | senior | lead | executive or null",
  "languages": ["array of spoken languages, not programming languages"]
}
`;

async function extractWithGemini(cvText: string, apiKey: string): Promise<ParsedCV> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: CV_PARSE_PROMPT(cvText) }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1, // Low temperature for accurate extraction
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  return normalizeGeminiOutput(parsed);
}

function normalizeGeminiOutput(raw: any): ParsedCV {
  return {
    fullName: raw.fullName || undefined,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    linkedinUrl: raw.linkedinUrl || undefined,
    portfolioUrl: raw.portfolioUrl || undefined,
    skills: Array.isArray(raw.skills) ? raw.skills.filter(Boolean) : [],
    workExperience: Array.isArray(raw.workExperience)
      ? raw.workExperience.map((w: any) => ({
          company: w.company || 'Unknown Company',
          title: w.title || 'Unknown Title',
          startDate: w.startDate || undefined,
          endDate: w.endDate || undefined,
          description: w.description || undefined,
        }))
      : [],
    education: Array.isArray(raw.education)
      ? raw.education.map((e: any) => ({
          institution: e.institution || 'Unknown Institution',
          degree: e.degree || undefined,
          field: e.field || undefined,
          graduationYear: e.graduationYear || undefined,
        }))
      : [],
    summary: raw.summary || undefined,
    totalYearsExperience: typeof raw.totalYearsExperience === 'number' ? raw.totalYearsExperience : undefined,
    seniorityLevel: raw.seniorityLevel || undefined,
    languages: Array.isArray(raw.languages) ? raw.languages.filter(Boolean) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Local heuristic fallback (no API key required)
// ---------------------------------------------------------------------------

function extractWithHeuristics(cvText: string): ParsedCV {
  const text = cvText;
  const lc = text.toLowerCase();

  // Email
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  const email = emailMatch?.[0];

  // Phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const phone = phoneMatch?.[0]?.trim();

  // LinkedIn
  const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?/i);
  const linkedinUrl = linkedinMatch?.[0];

  // GitHub / Portfolio
  const githubMatch = text.match(/https?:\/\/(www\.)?(github\.com|gitlab\.com)\/[\w-]+\/?/i);
  const portfolioMatch = text.match(/https?:\/\/(?!linkedin|github|gitlab)[\w.-]+\.[a-z]{2,}\/[\w/?#=&%-]*/i);
  const portfolioUrl = githubMatch?.[0] || portfolioMatch?.[0];

  // Name — usually the first non-empty line
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullName = lines[0] && lines[0].length < 60 && !/http|@|tel/i.test(lines[0])
    ? lines[0]
    : undefined;

  // Skills — common tech keywords
  const SKILL_KEYWORDS = [
    'JavaScript','TypeScript','Python','Java','Go','Rust','C++','C#','PHP','Ruby','Swift','Kotlin',
    'React','Vue','Angular','Next.js','Svelte','Node.js','Express','Django','FastAPI','Spring',
    'PostgreSQL','MySQL','MongoDB','Redis','Supabase','Firebase','SQLite',
    'AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD','GitHub Actions',
    'REST API','GraphQL','gRPC','WebSocket','Tailwind','CSS','SCSS',
    'Machine Learning','LLM','GPT','Gemini','TensorFlow','PyTorch','Hugging Face',
    'Figma','Agile','Scrum','JIRA','Product Management','UX','A/B Testing',
    'Salesforce','HubSpot','MEDDPICC','B2B SaaS','Enterprise Sales',
    'Leadership','Communication','Problem Solving','Team Management',
  ];
  const skills = SKILL_KEYWORDS.filter((kw) => lc.includes(kw.toLowerCase()));

  // Seniority
  let seniorityLevel: ParsedCV['seniorityLevel'] = 'mid';
  if (/cto|vp|chief|director|founder/i.test(text)) seniorityLevel = 'executive';
  else if (/staff|principal|lead|head of/i.test(text)) seniorityLevel = 'lead';
  else if (/senior|sr\./i.test(text)) seniorityLevel = 'senior';
  else if (/junior|jr\.|intern|graduate|entry/i.test(text)) seniorityLevel = 'junior';

  // Years of experience (rough)
  const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  const totalYearsExperience = yearsMatch ? parseInt(yearsMatch[1]) : undefined;

  // Professional summary — look for common section headers
  const summaryMatch = text.match(
    /(?:summary|profile|about me|objective)[:\n\s]+([^\n]{50,300})/i
  );
  const summary = summaryMatch?.[1]?.trim();

  return {
    fullName,
    email,
    phone,
    linkedinUrl,
    portfolioUrl,
    skills,
    workExperience: [], // Too complex without LLM — left empty for heuristic path
    education: [],
    summary,
    totalYearsExperience,
    seniorityLevel,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CVParseResult {
  parsed: ParsedCV;
  usedLLM: boolean;
  error?: string;
}

/**
 * Main function: extract structured data from raw CV text.
 * Tries Gemini API first (if key available), then falls back to local heuristics.
 */
export async function parseStructuredCV(
  cvText: string,
  geminiApiKey?: string
): Promise<CVParseResult> {
  // Try Gemini first if an API key is configured
  if (geminiApiKey?.trim().startsWith('AIzaSy')) {
    try {
      const parsed = await extractWithGemini(cvText, geminiApiKey.trim());
      return { parsed, usedLLM: true };
    } catch (err: any) {
      console.warn('[cvStructure] Gemini extraction failed, falling back to heuristics:', err.message);
      return {
        parsed: extractWithHeuristics(cvText),
        usedLLM: false,
        error: `LLM unavailable — used local parser. (${err.message})`,
      };
    }
  }

  // No API key — use heuristics
  await new Promise((r) => setTimeout(r, 300)); // Small delay to feel responsive
  return { parsed: extractWithHeuristics(cvText), usedLLM: false };
}

/** Convert ParsedCV to a readable resume text summary for storage */
export function parsedCVToResumeText(cv: ParsedCV): string {
  const parts: string[] = [];

  if (cv.summary) parts.push(cv.summary);
  if (cv.totalYearsExperience) parts.push(`${cv.totalYearsExperience}+ years of experience.`);

  if (cv.skills.length > 0) {
    parts.push(`\nSkills: ${cv.skills.join(', ')}`);
  }

  if (cv.workExperience.length > 0) {
    parts.push('\nWork Experience:');
    cv.workExperience.forEach((w) => {
      const dates = [w.startDate, w.endDate].filter(Boolean).join(' – ');
      parts.push(`• ${w.title} at ${w.company}${dates ? ` (${dates})` : ''}${w.description ? `. ${w.description}` : ''}`);
    });
  }

  if (cv.education.length > 0) {
    parts.push('\nEducation:');
    cv.education.forEach((e) => {
      const degreeInfo = [e.degree, e.field].filter(Boolean).join(' in ');
      parts.push(`• ${degreeInfo ? `${degreeInfo} — ` : ''}${e.institution}${e.graduationYear ? ` (${e.graduationYear})` : ''}`);
    });
  }

  if (cv.languages && cv.languages.length > 0) {
    parts.push(`\nLanguages: ${cv.languages.join(', ')}`);
  }

  return parts.join('\n').trim();
}
