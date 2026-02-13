const express = require('express');
const router = express.Router();
const {
    fetchGitHubData,
    aggregateLanguages,
    computeTotalStars,
    accountAgeYears,
    detectGhostCode,
    calculateHiringOdds,
} = require('../services/githubService');
const {
    analyzeProfile,
    scoreReadme,
    generateSWOTAnalysis,
    auditRepository,
    compareResumeToProfile,
    analyzeCandidateFit,
} = require('../services/aiService');

// ─── POST /api/analyze-all ───
// Unified orchestrator: fetches everything and returns a single payload.
router.post('/', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Username is required" });

        // 1. Fetch all GitHub data
        const ghData = await fetchGitHubData(username);
        const repos = ghData.repositories.nodes || [];
        const pinnedRepos = ghData.pinnedItems.nodes || [];

        // 2. Profile Vital Signs
        const totalStars = computeTotalStars(repos);
        const ageYears = accountAgeYears(ghData.createdAt);
        const vitals = {
            publicRepos: ghData.repositories.totalCount,
            totalStars,
            followers: ghData.followers.totalCount,
            following: ghData.following.totalCount,
            accountAge: ageYears,
        };

        // 3. Language DNA
        const languages = aggregateLanguages(repos);
        const primaryStack = languages.length >= 2
            ? `${languages[0].name} + ${languages[1].name} Developer`
            : languages.length === 1
                ? `${languages[0].name} Developer`
                : 'Polyglot';

        // 4. Velocity Heatmap data (contribution calendar)
        const calendar = ghData.contributionsCollection.contributionCalendar;
        const heatmapData = calendar.weeks.flatMap(week =>
            week.contributionDays.map(day => ({
                date: day.date,
                count: day.contributionCount,
                level: day.contributionCount === 0 ? 0
                    : day.contributionCount <= 3 ? 1
                        : day.contributionCount <= 7 ? 2
                            : day.contributionCount <= 12 ? 3 : 4,
            }))
        );

        // 5. Ghost Code detection
        const ghostCode = detectGhostCode(languages);

        // 6. Profile README Score
        // Look for profile-level README (repo with same name as username)
        const profileRepo = repos.find(r => r.name.toLowerCase() === username.toLowerCase());
        const readmeText = profileRepo?.readme?.text || '';
        const readmeScore = await scoreReadme(readmeText);

        // 7. Consistency score
        let activeWeeks = 0;
        calendar.weeks.forEach(week => {
            const total = week.contributionDays.reduce((acc, d) => acc + d.contributionCount, 0);
            if (total > 0) activeWeeks++;
        });
        const consistencyScore = Math.round((activeWeeks / Math.max(calendar.weeks.length, 1)) * 100);

        // 8. Complexity proxy (number of distinct languages > 3 + has tests/CI)
        const hasTests = repos.some(r => r.testsDir || r.testDir || r.specDir);
        const hasCI = repos.some(r => r.workflows);
        const complexLanguages = languages.filter(l => l.percentage > 5).length;
        const complexityScore = Math.min(100,
            (complexLanguages * 15) +
            (hasTests ? 25 : 0) +
            (hasCI ? 20 : 0) +
            Math.min(30, repos.length * 2)
        );

        // 9. Impact score
        const impactScore = Math.min(100,
            (totalStars * 3) +
            (ghData.followers.totalCount * 2) +
            (ghData.contributionsCollection.totalPullRequestContributions * 5)
        );

        // 10. Hiring Odds
        const hiringOdds = calculateHiringOdds({
            consistencyScore,
            complexityScore,
            impactScore,
        });

        // Respond (NO AI calls here — those are on-demand via separate endpoints)
        res.json({
            profile: {
                login: ghData.login,
                name: ghData.name,
                avatarUrl: ghData.avatarUrl,
                bio: ghData.bio,
                company: ghData.company,
                location: ghData.location,
                websiteUrl: ghData.websiteUrl,
                createdAt: ghData.createdAt,
            },
            vitals,
            languages: languages.slice(0, 10),
            primaryStack,
            heatmapData,
            ghostCode,
            readmeScore,
            consistencyScore,
            hiringOdds,
            repos: repos.map(r => ({
                name: r.name,
                description: r.description,
                url: r.url,
                stars: r.stargazerCount,
                forks: r.forkCount,
                language: r.primaryLanguage?.name || 'N/A',
                languageColor: r.primaryLanguage?.color || '#666',
                hasReadme: !!(r.readme?.text),
                hasTests: !!(r.testsDir || r.testDir || r.specDir),
                hasCI: !!r.workflows,
                hasLinter: !!(r.eslintrc || r.prettierrc),
                hasContributing: !!(r.contributing),
                hasSrc: !!r.srcDir,
            })),
        });

    } catch (error) {
        console.error("Analyze-All Error:", error);
        res.status(500).json({ error: "Failed to analyze profile: " + error.message });
    }
});

// ─── POST /api/analyze-all/ai-profile ───
// On-demand AI profile analysis.
router.post('/ai-profile', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Username is required" });

        const ghData = await fetchGitHubData(username);
        const repos = ghData.repositories.nodes || [];
        const pinnedRepos = ghData.pinnedItems.nodes || [];

        const reposForAI = (pinnedRepos.length > 0 ? pinnedRepos : repos.slice(0, 6)).map(r => ({
            name: r.name,
            description: r.description,
            readmeLength: r.readme?.text?.length || 0,
            stars: r.stargazerCount,
            hasWorkflows: !!r.workflows,
        }));

        const aiAnalysis = await analyzeProfile({
            bio: ghData.bio,
            totalRepos: repos.length,
            totalStars: computeTotalStars(repos),
            followers: ghData.followers.totalCount,
            pinnedRepos: reposForAI,
        });

        res.json(aiAnalysis);
    } catch (error) {
        console.error("AI Profile Error:", error);
        res.status(500).json({ error: "Failed to generate AI analysis" });
    }
});

// ─── POST /api/analyze-all/swot ───
// On-demand SWOT analysis.
router.post('/swot', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: "Username is required" });

        const ghData = await fetchGitHubData(username);
        const repos = ghData.repositories.nodes || [];
        const languages = aggregateLanguages(repos);

        const swot = await generateSWOTAnalysis({
            name: ghData.name,
            bio: ghData.bio,
            topLanguages: languages.slice(0, 5).map(l => l.name),
            totalRepos: repos.length,
            totalStars: computeTotalStars(repos),
            followers: ghData.followers.totalCount,
            consistencyScore: Math.round(
                (ghData.contributionsCollection.contributionCalendar.weeks.filter(w =>
                    w.contributionDays.reduce((a, d) => a + d.contributionCount, 0) > 0
                ).length / Math.max(ghData.contributionsCollection.contributionCalendar.weeks.length, 1)) * 100
            ),
            accountAge: accountAgeYears(ghData.createdAt),
        });

        res.json(swot);
    } catch (error) {
        console.error("SWOT Error:", error);
        res.status(500).json({ error: "Failed to generate SWOT analysis" });
    }
});

// ─── POST /api/analyze-all/repo ───
// Deep-dive audit for a single repository.
router.post('/repo', async (req, res) => {
    try {
        const { username, repoName } = req.body;
        if (!username || !repoName) return res.status(400).json({ error: "username and repoName required" });

        const ghData = await fetchGitHubData(username);
        const repo = ghData.repositories.nodes.find(r => r.name === repoName);
        if (!repo) return res.status(404).json({ error: "Repository not found" });

        const audit = await auditRepository({
            name: repo.name,
            description: repo.description,
            readme: repo.readme?.text ? repo.readme.text.substring(0, 2000) : null,
            hasTests: !!(repo.testsDir || repo.testDir || repo.specDir),
            hasCI: !!repo.workflows,
            hasLinter: !!(repo.eslintrc || repo.prettierrc),
            hasContributing: !!repo.contributing,
            hasSrc: !!repo.srcDir,
            packageJson: repo.packageJson?.text ? JSON.parse(repo.packageJson.text) : null,
            stars: repo.stargazerCount,
            forks: repo.forkCount,
            testsDir: repo.testsDir,
            testDir: repo.testDir,
            specDir: repo.specDir,
            workflows: repo.workflows,
            eslintrc: repo.eslintrc,
            prettierrc: repo.prettierrc,
            contributing: repo.contributing,
            srcDir: repo.srcDir,
        });

        res.json({ repo: repo.name, ...audit });

    } catch (error) {
        console.error("Repo Audit Error:", error);
        res.status(500).json({ error: "Failed to audit repo" });
    }
});

// ─── POST /api/analyze-all/resume ───
// Compare resume text with GitHub profile.
router.post('/resume', async (req, res) => {
    try {
        const { username, resumeText } = req.body;
        if (!username || !resumeText) return res.status(400).json({ error: "username and resumeText required" });

        const ghData = await fetchGitHubData(username);
        const repos = ghData.repositories.nodes || [];
        const languages = aggregateLanguages(repos);

        const profileSummary = {
            name: ghData.name,
            bio: ghData.bio,
            topLanguages: languages.slice(0, 5).map(l => l.name),
            repos: repos.slice(0, 10).map(r => ({
                name: r.name,
                description: r.description,
                language: r.primaryLanguage?.name,
                stars: r.stargazerCount,
            })),
            totalRepos: repos.length,
            followers: ghData.followers.totalCount,
        };

        const comparison = await compareResumeToProfile(resumeText, profileSummary);
        res.json(comparison);

    } catch (error) {
        console.error("Resume Compare Error:", error);
        res.status(500).json({ error: "Failed to compare resume" });
    }
});

// ─── POST /api/analyze-all/match-role ───
// Recruiter Mode: Match candidate to a specific job.
router.post('/match-role', async (req, res) => {
    try {
        const { username, company, jobRole, stack, experience } = req.body;
        if (!username || !jobRole) return res.status(400).json({ error: "Missing required fields" });

        // 1. Fetch Profile Data (reused logic)
        const ghData = await fetchGitHubData(username);
        const repos = ghData.repositories.nodes || [];
        const languages = aggregateLanguages(repos);

        const profileSummary = {
            name: ghData.name,
            bio: ghData.bio,
            location: ghData.location,
            topLanguages: languages.slice(0, 5).map(l => l.name),
            totalRepos: repos.length,
            totalStars: computeTotalStars(repos),
            lastActive: ghData.updatedAt,
            company: ghData.company
        };

        const analysis = await analyzeCandidateFit(profileSummary, { company, jobRole, stack, experience });
        res.json(analysis);

    } catch (error) {
        console.error("Match Role Error:", error);
        res.status(500).json({ error: "Failed to analyze fit" });
    }
});

module.exports = router;
