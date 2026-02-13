const axios = require('axios');
const Groq = require('groq-sdk');

// Initialize Groq client if key is present
const groq = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

const GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiUrl() {
    const key = process.env.GEMINI_API_KEY;
    return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
}

/**
 * Primary AI handler: Tries Groq (Llama-3.3-70b) first, falls back to Gemini Flash.
 */
async function callAI(systemPrompt, userContent) {
    // 1. Try Groq
    if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt + "\nIMPORTANT: Respond ONLY with valid JSON." },
                    { role: "user", content: typeof userContent === 'string' ? userContent : JSON.stringify(userContent, null, 2) }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0]?.message?.content || "{}");
        } catch (e) {
            console.error(`⚠️ Groq Call Failed: ${e.message}. Falling back to Gemini...`);
        }
    } else {
        console.warn("⚠️ GROQ_API_KEY missing. Skipping Groq.");
    }

    // 2. Fallback to Gemini
    return callGemini(systemPrompt, userContent);
}

async function callGemini(systemPrompt, userContent) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ GEMINI_API_KEY missing. Returning mock data.");
        return null;
    }

    try {
        const response = await axios.post(
            getGeminiUrl(),
            {
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no extra text.\n\nData:\n${typeof userContent === 'string' ? userContent : JSON.stringify(userContent, null, 2)}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json"
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000,
            }
        );

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error("Gemini returned empty response");
            return null;
        }

        // Clean any markdown fences ( ```json ... ``` )
        const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        return JSON.parse(cleaned);

    } catch (error) {
        const status = error.response?.status || 'unknown';
        const detail = error.response?.data?.error?.message || error.message;
        console.error(`Gemini Call Failed (HTTP ${status}): ${detail}`);
        return null;
    }
}

/**
 * Helper: Truncate and summarize profile data to save tokens.
 * Reduces 40k+ tokens -> ~3k tokens.
 */
function summarizeForAI(profile) {
    if (!profile) return {};

    const topRepos = (profile.repositories?.nodes || [])
        .sort((a, b) => b.stargazerCount - a.stargazerCount)
        .slice(0, 6) // Only top 6 repos
        .map(r => ({
            name: r.name,
            description: r.description ? r.description.substring(0, 150) : "", // Truncate desc
            stars: r.stargazerCount,
            language: r.primaryLanguage?.name,
            updated: r.updatedAt.split("T")[0] // Just the date
        }));

    return {
        username: profile.login,
        bio: profile.bio,
        followers: profile.followers?.totalCount,
        totalRepos: profile.repositories?.totalCount,
        createdAt: profile.createdAt,
        contributions: {
            totalCommits: profile.contributionsCollection?.totalCommitContributions,
            totalPRs: profile.contributionsCollection?.totalPullRequestContributions,
            totalIssues: profile.contributionsCollection?.totalIssueContributions
        },
        topRepositories: topRepos,
        pinnedItems: (profile.pinnedItems?.nodes || []).map(r => ({
            name: r.name,
            stars: r.stargazerCount,
            language: r.primaryLanguage?.name
        }))
    };
}

/**
 * Full profile analysis — "Cynical Engineering Manager" persona.
 */
async function analyzeProfile(profileData) {
    // Optimization: Send summarized data to avoid 413 Payload Too Large
    const summary = summarizeForAI(profileData);

    const result = await callAI(
        `Act as a cynical Senior Engineering Manager at Google. Be critical but constructive. Analyze this GitHub profile data.

Output JSON with:
- overallScore (0-100): a single composite score reflecting overall profile quality
- engineeringScore (0-100)
- hiringSignals: { technicalDepth (0-100), collaboration (0-100), documentation (0-100), codeQuality (0-100), architectureSkills (0-100) }
- redFlags (array of strings — be specific about WHY each is a red flag)
- strengths (array of strings — cite specific repos or patterns as evidence)
- improvements (array of 5 objects, each: { action: string (what to do), reason: string (why it matters for hiring), priority: "critical"|"high"|"medium" })

Don't sugarcoat. Be specific — cite repo names when possible.`,
        summary
    );

    return result || getMockProfileAnalysis();
}

/**
 * Score a README.md (0-100).
 */
async function scoreReadme(readmeText) {
    if (!readmeText || readmeText.length < 20) {
        return { score: 0, feedback: "No README found or it's essentially empty." };
    }

    const result = await callAI(
        `You are a documentation expert. Score this GitHub profile README.md from 0-100. Evaluate: storytelling quality, technical stack showcase, call-to-action (links, contact), visual appeal (badges, images), and structure. Output JSON: { score (0-100), feedback (string, 1-2 sentences) }.`,
        readmeText.substring(0, 1500) // Reduced from 3000 to save tokens
    );

    return result || { score: 45, feedback: "Mock: Decent README but could use more structure and badges." };
}

/**
 * Generate SWOT analysis of a GitHub profile.
 */
async function generateSWOTAnalysis(profileData) {
    // Optimization: Use summary or extract just bio/repos if raw profileData passed
    const dataToAnalyze = profileData.login ? summarizeForAI(profileData) : profileData;

    const result = await callAI(
        `Perform a deep-dive SWOT analysis on this GitHub profile for a Senior Software Engineer role.

Output JSON:
- profileScore (0-100)
- profileTier ("Elite" | "Strong" | "Promising" | "Developing" | "Needs Work")
- firstImpression (string, 1 sentence summary)
- strengths (array of 3-5 strings)
- weaknesses (array of 3-5 strings)
- opportunities (array of 3-5 strings)
- threats (array of 3-5 strings)
- codeQuality (string, 1-2 sentences)
- documentationHabits (string, 1-2 sentences)
- careerTrajectory (string, 1-2 sentences)
- interviewReadiness (string, 1-2 sentences)

Focus on commit velocity, language diversity, and project complexity.`,
        dataToAnalyze
    );

    return result || getMockSWOT();
}


/**
 * Audit a specific repository.
 */
async function auditRepository(repoData) {
    const result = await callAI(
        `Audit this GitHub repository data as a strict code reviewer.

Output JSON:
- grade ("A" | "B" | "C" | "D" | "F")
- summary (1 sentence overview)
- gradeExplanation (why this grade?)
- technicalDebt (string, assess potential debt based on languages and size)
- productionReadiness (string, assess if it looks ready for prod)
- checklist (array of objects: { item: string, found: boolean, priority: "critical"|"high"|"medium"|"low", detail: string })
- recommendations (array of 3 strings, each being a specific actionable improvement)

Evaluate: unit tests, CI/CD, documentation, code structure suggestions based on file types.`,
        repoData
    );

    return result || getMockRepoAudit(repoData.name);
}

/**
 * Compare Resume against GitHub Profile.
 */
async function compareResumeToProfile(resumeText, profileData) {
    if (!resumeText) return null;

    const result = await callAI(
        `Compare this candidate's Resume claims against their actual GitHub activity. Detect discrepancies (lying) or confirmations (truth).

Output JSON:
- trustScore (0-100): How much does the code back up the resume?
- verdict ("Verified" | "Suspicious" | "Mismatch" | "Strong Match")
- claims (array of objects: { claim: string, status: "Verified"|" exaggerated"|"Missing", evidence: string })
- summary (2 sentences on whether they are technically honest)
- missingSkills (skills on resume but not in GitHub)

Resume:
${resumeText.substring(0, 2000)}

GitHub Profile:
${JSON.stringify(profileData).substring(0, 2000)}`,
        "" // sent in prompt
    );

    return result || {
        trustScore: 78,
        verdict: "Strong Match",
        summary: "Candidate's GitHub generally supports resume claims, though some listed frameworks like Docker show little public activity.",
        claims: [
            { claim: "Senior React Developer", status: "Verified", evidence: "high volume of complex React commits" },
            { claim: "DevOps / AWS", status: "Missing", evidence: "No Terraform or AWS config files found in public repos" }
        ]
    };
}


// ─── MOCK DATA FALLBACKS (When API Fails) ───

function getMockProfileAnalysis() {
    return {
        overallScore: 65,
        engineeringScore: 65,
        hiringSignals: {
            technicalDepth: 72,
            collaboration: 40,
            documentation: 55,
            codeQuality: 68,
            architectureSkills: 60
        },
        redFlags: [
            "Low commit consistency in last 3 months",
            "Lack of unit tests in major repositories",
            "Most projects are single-contributor (low collaboration)"
        ],
        strengths: [
            "Strong grasp of JavaScript/TypeScript ecosystem",
            "Good usage of modern frameworks (Next.js, React)",
            "Clear project naming conventions"
        ],
        improvements: [
            { action: "Add CI/CD pipelines", reason: "Shows production-readiness", priority: "high" },
            { action: "Contribute to open source", reason: "Validates collaboration skills", priority: "medium" },
            { action: "Write comprehensive READMEs", reason: "Critical for documentation skills", priority: "critical" },
            { action: "Add unit tests (Jest/Vitest)", reason: "Demonstrates code reliability", priority: "high" },
            { action: "Refactor monolithic components", reason: "Shows architectural maturity", priority: "medium" }
        ]
    };
}

function getMockSWOT() {
    return {
        profileScore: 65,
        profileTier: "Promising",
        firstImpression: "A solid frontend developer with potential, but lacks depth in backend/DevOps.",
        strengths: ["Clean code style", "Modern stack usage", "Good project variety"],
        weaknesses: ["Inconsistent contribution graph", "Lack of testing suites", "Minimal documentation"],
        opportunities: ["Could easily transition to Full Stack with more backend projects", "Open source contributions would boost visibility"],
        threats: ["AI tools might automate simple frontend tasks shown here", "Lack of complex architectural patterns"],
        codeQuality: "Code is readable and modern but lacks complexity.",
        documentationHabits: "READMEs are often present but sparse on details.",
        careerTrajectory: "Steady growth in frontend, ready for junior-mid level roles.",
        interviewReadiness: "Good for coding interviews, might struggle with system design."
    };
}

function getMockRepoAudit(repoName) {
    return {
        repo: repoName || "Unknown Repo",
        grade: "B-",
        summary: "A decent project with good structure but lacking in testing and documentation.",
        gradeExplanation: "Points deducted for missing tests and minimal README.",
        technicalDebt: "Low technical debt, code is relatively fresh and clean.",
        productionReadiness: "Not production ready. Missing CI/CD and tests.",
        checklist: [
            { item: "README.md exists", found: true, priority: "critical", detail: "Found, but could be more detailed." },
            { item: "Unit Tests", found: false, priority: "critical", detail: "No test runner configured (Jest/Vitest)." },
            { item: "CI/CD Pipeline", found: false, priority: "high", detail: "No .github/workflows detected." },
            { item: "License File", found: true, priority: "medium", detail: "MIT License found." },
            { item: "Code Comments", found: true, priority: "medium", detail: "Code is reasonably commented." },
            { item: "Dependency Lockfile", found: true, priority: "high", detail: "package-lock.json present." },
            { item: "Linter Config", found: false, priority: "medium", detail: "No .eslintrc found." },
            { item: "Docker/Container", found: false, priority: "low", detail: "No Dockerfile found." }
        ],
        recommendations: [
            "Add a test suite (Jest or Vitest) to verify core logic.",
            "Set up a basic GitHub Action for linting and testing.",
            "Expand the README to include setup instructions and architectural overview."
        ]
    };
}

/**
 * Analyze candidate fit for a specific role (Recruiter Mode).
 * Strictness: 'lenient' | 'normal' | 'strict'
 */
async function analyzeCandidateFit(profileSummary, jobDetails, strictness = 'normal') {
    let systemPrompt = `Act as a Technical Recruiter at ${jobDetails.company || "a Tech Company"}.`;

    if (strictness === 'lenient') {
        systemPrompt += " Be optimistic and look for potential. Highlight transferable skills even if not exact matches.";
    } else if (strictness === 'strict') {
        systemPrompt += " Be extremely critical. Only accept exact matches. Highlight every gap ruthlessly.";
    } else {
        systemPrompt += " Be balanced. Acknowledge strengths but point out realistic gaps.";
    }

    const result = await callAI(
        `${systemPrompt} 
Evaluate this candidate for the role of ${jobDetails.jobRole} (${jobDetails.experience}).

Required Stack: ${jobDetails.stack}

Candidate Profile Summary:
${JSON.stringify(profileSummary).substring(0, 3000)}

Output JSON:
- fitScore (0-100)
- fitTier ("Perfect Match" | "High Potential" | "Moderate" | "Low Fit")
- analysis (2-3 sentences on why they fit or don't fit)
- strengths (array of strings: specific skills they have for this role)
- gaps (array of strings: required skills missing or weak)
- interviewQuestion (string: A critical technical question to ask them based on their gaps)

Be ${strictness} about the experience level and tech stack requirements.`,
        ""
    );

    return result || {
        fitScore: 75,
        fitTier: "High Potential",
        analysis: "Candidate has strong general skills but lacks specific experience in the required stack.",
        strengths: ["JavaScript", "General Engineering"],
        gaps: ["Specific Stack Tools", "Years of Experience"],
        interviewQuestion: "How would you handle scaling a service to 1M users?"
    };
}

module.exports = {
    analyzeProfile,
    scoreReadme,
    generateSWOTAnalysis,
    auditRepository,
    compareResumeToProfile,
    analyzeCandidateFit,
    getMockProfileAnalysis, // Exported for fallback
    getMockSWOT // Exported for fallback
};
