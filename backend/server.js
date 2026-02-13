const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors()); // Removing problematic cors package
// Manual CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins (or restrictive in prod)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '50mb' })); // Increase limit for resume uploads

// Health Check
app.get('/', (req, res) => {
  res.send({ message: 'GitHub Portfolio Analyzer Backend is running!', status: 'ok' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const analysisRoutes = require('./routes/analysis');
// const analyzeAllRoutes = require('./routes/analyzeAll'); // Removed as functionality is now inline

// Import Services (assuming these are needed for the new inline routes)
const githubService = require('./services/githubService');
const aiService = require('./services/aiService');

// ─── ENDPOINT: Unified Analysis (Dashboard & Deep Dives) ───
app.post('/api/analyze-all', async (req, res) => {
  try {
    const { username, difficulty, strictness } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    console.log(`Analyzing ${username}... (Difficulty: ${difficulty}, Strictness: ${strictness})`);

    // 1. Fetch GitHub Data
    const profile = await githubService.fetchGitHubData(username);

    // 2. Parallel Processing for all insights
    // 2. Fetch Data (Parallelize independent tasks)
    // Critical: GitHub Data
    // Optional: AI Analysis (SWOT, Profile) - Handle failures gracefully so stats still load
    const [languages, readmeScore, ghostCode] = await Promise.all([
      githubService.aggregateLanguages(profile.repositories.nodes),
      githubService.scoreReadme(profile.repositories.nodes[0]?.readme?.text),
      githubService.detectGhostCode(githubService.aggregateLanguages(profile.repositories.nodes))
    ]);

    // 3. AI Analysis (Soft Fail with Timeout)
    // Race against a 5s timeout so we don't hold up the response if AI is slow/rate-limited
    let swotAnalysis = null;
    let profileAnalysis = null;

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 25000)
      );

      const aiResults = await Promise.race([
        Promise.allSettled([
          aiService.generateSWOTAnalysis(profile),
          aiService.analyzeProfile(profile)
        ]),
        timeoutPromise
      ]);

      // Log AI errors but don't crash
      if (aiResults[0].status === 'fulfilled') swotAnalysis = aiResults[0].value;
      else console.warn("SWOT Analysis Failed/Skipped:", aiResults[0].reason?.message);

      if (aiResults[1].status === 'fulfilled') profileAnalysis = aiResults[1].value;
      else console.warn("Profile Analysis Failed/Skipped:", aiResults[1].reason?.message);

    } catch (aiErr) {
      console.error("AI Service Skipped:", aiErr.message);
      // Fallback to Mock Data on Timeout/Error
      console.log("Using Mock AI Data due to failure/timeout.");
      swotAnalysis = aiService.getMockSWOT();
      profileAnalysis = aiService.getMockProfileAnalysis();
    }

    // Fallback if AI completely fails
    if (!profileAnalysis) {
      profileAnalysis = { hiringSignals: { technicalDepth: 0, collaboration: 0, consistency: 0 } };
    }

    // 3. Compute Hiring Odds (Now accepts difficulty)
    const hiringOdds = githubService.calculateHiringOdds({
      consistencyScore: swotAnalysis?.profileScore || 0,
      complexityScore: profileAnalysis?.hiringSignals?.technicalDepth || 0,
      impactScore: Math.min(100, (profile.followers.totalCount * 2) + (profileAnalysis?.hiringSignals?.collaboration || 0))
    }, { difficulty });

    // 4. Construct Final Response
    const responseData = {
      profile: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        createdAt: profile.createdAt,
        location: profile.location,
        company: profile.company
      },
      vitals: {
        commits: profile.contributionsCollection.totalCommitContributions,
        prs: profile.contributionsCollection.totalPullRequestContributions,
        issues: profile.contributionsCollection.totalIssueContributions,
        followers: profile.followers.totalCount,
        publicRepos: profile.repositories.totalCount, // Renamed for frontend
        accountAge: githubService.accountAgeYears(profile.createdAt),
        totalStars: githubService.computeTotalStars(profile.repositories.nodes)
      },
      heatmapData: profile.contributionsCollection.contributionCalendar.weeks
        .flatMap(week => week.contributionDays)
        .map(day => {
          // Calculate level for heatmap coloring (0-4)
          let level = 0;
          if (day.contributionCount > 0) level = 1;
          if (day.contributionCount >= 3) level = 2;
          if (day.contributionCount >= 6) level = 3;
          if (day.contributionCount >= 10) level = 4;

          return {
            date: day.date,
            count: day.contributionCount,
            level
          };
        }),
      languages,
      primaryStack: languages[0]?.name || "N/A", // Added primary stack
      readmeScore,
      ghostCode,
      hiringOdds,
      swot: swotAnalysis || { strengths: [], weaknesses: [], opportunities: [], threats: [], profileScore: 0 }, // Fallback for frontend
      aiAnalysis: profileAnalysis,
      repositories: profile.repositories // Pass raw repo data for frontend list
    };

    // Debug: Log final stats to ensure they exist
    console.log("✅ Analysis Complete. Sending Response:", {
      username: responseData.profile?.login,
      vitals: responseData.vitals,
      heatmapDataPoints: responseData.heatmapData?.length,
      aiStatus: {
        swot: !!responseData.swot,
        profile: !!responseData.aiAnalysis,
        hiringOdds: !!responseData.hiringOdds
      }
    });

    res.json(responseData);

  } catch (error) {
    console.error("Analysis Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: Single AI Profile Score (for manual regenerate) ───
app.post('/api/analyze-all/ai-profile', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    // 1. Fetch minimal profile data for AI
    const profile = await githubService.fetchGitHubData(username);

    // 2. Run Analysis (or Fallback)
    let profileAnalysis = null;
    try {
      profileAnalysis = await aiService.analyzeProfile(profile);
    } catch (e) {
      console.warn("AI Profile Analysis Failed, using mock:", e.message);
      profileAnalysis = aiService.getMockProfileAnalysis();
    }

    res.json(profileAnalysis);

  } catch (error) {
    console.error("AI Profile Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: Recruiter Role Match ───
app.post('/api/analyze-all/match-role', async (req, res) => {
  try {
    const { username, company, jobRole, experience, stack, strictness } = req.body;

    // We need a summary of the profile to send to AI
    const profile = await githubService.fetchGitHubData(username);
    const langData = githubService.aggregateLanguages(profile.repositories.nodes);

    const profileSummary = {
      bio: profile.bio,
      languages: langData.slice(0, 5),
      topRepos: profile.repositories.nodes.slice(0, 5).map(r => ({
        name: r.name,
        description: r.description,
        lang: r.primaryLanguage?.name
      }))
    };

    const fitAnalysis = await aiService.analyzeCandidateFit(
      profileSummary,
      { company, jobRole, experience, stack },
      strictness // Pass strictness to AI
    );

    res.json(fitAnalysis);

  } catch (error) {
    console.error("Role Match Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});



// ─── ENDPOINT: Single Repo Deep Audit ───
app.post('/api/analyze-all/repo', async (req, res) => {
  try {
    const { username, repoName } = req.body;
    if (!username || !repoName) return res.status(400).json({ error: "Username and Repo Name required" });

    // 1. Fetch Deep Repo Details
    const repoDetails = await githubService.fetchRepoDetails(username, repoName);

    // 2. Run AI Audit
    let auditResult = null;
    try {
      auditResult = await aiService.auditRepository(repoDetails);
    } catch (e) {
      console.warn("Repo Audit Failed, using mock:", e.message);
      auditResult = aiService.getMockRepoAudit(repoName);
    }

    res.json(auditResult);

  } catch (error) {
    console.error("Repo Audit Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
// app.use('/api/analyze-all', analyzeAllRoutes); // Removed as functionality is now inline

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
