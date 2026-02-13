const express = require('express');
const router = express.Router();
const { fetchGitHubData } = require('../services/githubService');
const { analyzeProfile } = require('../services/aiService');

// POST /api/analysis/profile
router.post('/profile', async (req, res) => {
    try {
        const { username } = req.body;

        // 1. Fetch Data
        const githubData = await fetchGitHubData(username);

        // 2. Repo Hygiene Check
        // Prioritize pinned items, fallback to top repositories
        const reposToAnalyze = githubData.pinnedItems.nodes.length > 0
            ? githubData.pinnedItems.nodes
            : githubData.repositories.nodes.slice(0, 6);

        const hygieneResults = analyzeHygiene(reposToAnalyze);

        // 3. Consistency Analysis
        const consistencyScore = calculateConsistency(githubData.contributionsCollection.contributionCalendar);

        // 4. AI Audit (Readme & Storytelling)
        // We pass a summary to AI to save tokens, focusing on the specific checks
        const aiAnalysis = await analyzeProfile({
            bio: githubData.bio,
            pinnedRepos: reposToAnalyze.map(r => ({
                name: r.name,
                description: r.description,
                readmeLength: r.readme?.text?.length || 0,
                hasWorkflows: !!r.workflows
            }))
        });

        // 5. Calculate "Git Intel Score"
        // Formula: (Impact * 0.4) + (Code Quality * 0.3) + (Consistency * 0.2) + (Documentation * 0.1)
        // Impact proxies: Stars/Forks/Followers (Normalized)
        // Quality proxies: AI Score + Structure Check
        // Documentation proxies: Readme existence + AI Score

        const impactScore = Math.min(100, (githubData.followers.totalCount * 2) + (reposToAnalyze.reduce((acc, r) => acc + r.stargazerCount, 0) * 5));
        const qualityScore = (hygieneResults.structureScore * 0.6) + (aiAnalysis.engineeringScore * 0.4);
        const docScore = (hygieneResults.readmeScore * 0.5) + (aiAnalysis.hiringSignals.documentation * 0.5);

        const gitIntelScore = Math.round(
            (impactScore * 0.4) +
            (qualityScore * 0.3) +
            (consistencyScore * 0.2) +
            (docScore * 0.1)
        );

        const response = {
            username: githubData.login,
            avatarUrl: githubData.avatarUrl,
            gitIntelScore: Math.min(100, Math.max(0, gitIntelScore)), // Clamp 0-100
            stats: {
                impact: Math.round(impactScore),
                quality: Math.round(qualityScore),
                consistency: Math.round(consistencyScore),
                documentation: Math.round(docScore)
            },
            redFlags: [...hygieneResults.redFlags, ...aiAnalysis.redFlags],
            improvements: aiAnalysis.improvements,
            aiFeedback: {
                technicalDepth: aiAnalysis.hiringSignals.technicalDepth,
                collaboration: aiAnalysis.hiringSignals.collaboration,
            }
        };

        res.json(response);

    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze profile" });
    }
});

function analyzeHygiene(repos) {
    let readmeCount = 0;
    let structureCount = 0; // src or workflows
    const redFlags = [];

    repos.forEach(repo => {
        if (repo.readme?.text?.length > 100) readmeCount++;
        else redFlags.push(`Repo '${repo.name}' has no/empty README`);

        if (repo.srcDir || repo.workflows) structureCount++;

        if (["test", "temp", "hello-world", "my-project"].includes(repo.name.toLowerCase())) {
            redFlags.push(`Generic repo name detected: '${repo.name}'`);
        }
    });

    return {
        readmeScore: (readmeCount / repos.length) * 100,
        structureScore: (structureCount / repos.length) * 100,
        redFlags
    };
}

function calculateConsistency(calendar) {
    // Simple consistency: Ratio of active weeks vs total weeks
    // Can be improved to standard deviation of commit counts
    let activeWeeks = 0;
    calendar.weeks.forEach(week => {
        const weekTotal = week.contributionDays.reduce((acc, day) => acc + day.contributionCount, 0);
        if (weekTotal > 0) activeWeeks++;
    });

    return Math.round((activeWeeks / calendar.weeks.length) * 100);
}

module.exports = router;
