const axios = require('axios');

const GITHUB_API_URL = 'https://api.github.com/graphql';

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) console.warn("⚠️ GITHUB_TOKEN missing. Rate limits will be strict.");
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

/**
 * Fetch comprehensive GitHub profile data for analysis.
 * Includes: profile info, repos with languages, contributions calendar, pinned items.
 */
async function fetchGitHubData(username) {
  const query = `
  query($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      company
      location
      websiteUrl
      twitterUsername
      createdAt
      followers { totalCount }
      following { totalCount }
      repositories(first: 30, orderBy: { field: UPDATED_AT, direction: DESC }, isFork: false) {
        totalCount
        nodes {
          name
          description
          url
          stargazerCount
          forkCount
          isArchived
          primaryLanguage { name color }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node { name color }
            }
          }
          updatedAt
          pushedAt
          diskUsage
          readme: object(expression: "HEAD:README.md") {
            ... on Blob { text }
          }
          srcDir: object(expression: "HEAD:src") { id }
          workflows: object(expression: "HEAD:.github/workflows") { id }
          packageJson: object(expression: "HEAD:package.json") {
            ... on Blob { text }
          }
          testsDir: object(expression: "HEAD:tests") { id }
          testDir: object(expression: "HEAD:test") { id }
          specDir: object(expression: "HEAD:spec") { id }
          eslintrc: object(expression: "HEAD:.eslintrc.json") { id }
          prettierrc: object(expression: "HEAD:.prettierrc") { id }
          contributing: object(expression: "HEAD:CONTRIBUTING.md") {
            ... on Blob { text }
          }
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            stargazerCount
            forkCount
            primaryLanguage { name color }
            languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
              edges {
                size
                node { name color }
              }
            }
            updatedAt
            pushedAt
            diskUsage
            readme: object(expression: "HEAD:README.md") {
              ... on Blob { text }
            }
            srcDir: object(expression: "HEAD:src") { id }
            workflows: object(expression: "HEAD:.github/workflows") { id }
          }
        }
      }
      contributionsCollection {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalRepositoryContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await axios.post(
      GITHUB_API_URL,
      { query, variables: { login: username } },
      { headers: getHeaders() }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.user;
  } catch (error) {
    console.error("Error fetching GitHub data:", error.message);
    throw error;
  }
}

/**
 * Aggregate language byte counts across all repositories.
 * Returns sorted array: [{ name, color, bytes, percentage }]
 */
function aggregateLanguages(repos) {
  const langMap = {};
  let totalBytes = 0;

  repos.forEach(repo => {
    if (repo.languages && repo.languages.edges) {
      repo.languages.edges.forEach(edge => {
        const name = edge.node.name;
        const color = edge.node.color;
        if (!langMap[name]) langMap[name] = { name, color, bytes: 0 };
        langMap[name].bytes += edge.size;
        totalBytes += edge.size;
      });
    }
  });

  return Object.values(langMap)
    .sort((a, b) => b.bytes - a.bytes)
    .map(lang => ({
      ...lang,
      percentage: totalBytes > 0 ? Math.round((lang.bytes / totalBytes) * 100) : 0,
    }));
}

/**
 * Compute total stars across all repos.
 */
function computeTotalStars(repos) {
  return repos.reduce((acc, r) => acc + (r.stargazerCount || 0), 0);
}

/**
 * Calculate account age in years.
 */
function accountAgeYears(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.round((now - created) / (1000 * 60 * 60 * 24 * 365) * 10) / 10;
}

/**
 * Detect "Ghost Code" — ratio of non-code (config/text) files.
 * Uses language byte data: config langs = JSON, YAML, Markdown, Text, etc.
 */
function detectGhostCode(languages) {
  const configLangs = new Set([
    'JSON', 'YAML', 'TOML', 'XML', 'Markdown', 'Text', 'INI',
    'Dockerfile', 'Shell', 'Batchfile', 'Makefile', 'CMake',
  ]);

  let configBytes = 0;
  let totalBytes = 0;

  languages.forEach(lang => {
    totalBytes += lang.bytes;
    if (configLangs.has(lang.name)) configBytes += lang.bytes;
  });

  const ratio = totalBytes > 0 ? Math.round((configBytes / totalBytes) * 100) : 0;
  return {
    configBytes,
    codeBytes: totalBytes - configBytes,
    totalBytes,
    ghostRatio: ratio,
    isWarning: ratio > 40,
  };
}

/**
 * calculateHiringOdds(stats, options)
 * Weighs: Consistency (30%), Code Complexity (40%), Community Impact (30%).
 * Options: { difficulty: 'easy' | 'medium' | 'hard' }
 */
function calculateHiringOdds(stats, options = {}) {
  // Difficulty multipliers: Easy = 1.2x boost, Hard = 0.9x penalty
  const difficultyModifiers = {
    easy: 1.2,
    medium: 1.0,
    hard: 0.9
  };
  const modifier = difficultyModifiers[options.difficulty || 'medium'] || 1.0;

  const consistency = Math.min(100, Math.round((stats.consistencyScore || 0) * modifier));
  const complexity = Math.min(100, Math.round((stats.complexityScore || 0) * modifier));
  const impact = Math.min(100, Math.round((stats.impactScore || 0) * modifier));

  // Senior: Consistency 30%, Complexity 40%, Impact 30%
  const seniorScore = Math.min(100, Math.round(
    (consistency * 0.3) + (complexity * 0.4) + (impact * 0.3)
  ));

  // Junior: Consistency 40%, Complexity 30%, Impact 30% (consistency matters more for juniors)
  const juniorScore = Math.min(100, Math.round(
    (consistency * 0.4) + (complexity * 0.3) + (impact * 0.3) + (options.difficulty === 'easy' ? 15 : 10) // Boost based on difficulty
  ));

  const seniorBottleneck = getSeniorBottleneck(consistency, complexity, impact);
  const juniorBottleneck = getJuniorBottleneck(consistency, complexity, impact);

  return {
    senior: {
      score: seniorScore,
      bottleneck: seniorBottleneck,
      consistencyComponent: consistency,
      complexityComponent: complexity,
      impactComponent: impact,
    },
    junior: {
      score: juniorScore,
      bottleneck: juniorBottleneck,
      consistencyComponent: consistency,
      complexityComponent: Math.min(100, Math.round(complexity * 0.7 + 20)),
      impactComponent: Math.min(100, Math.round(impact * 0.6 + 15)),
    },
    // Keep legacy flat fields for backward compat
    score: seniorScore,
    bottleneck: seniorBottleneck,
  };
}

function getSeniorBottleneck(consistency, complexity, impact) {
  if (complexity < 40) return 'Code complexity is low — add projects with design patterns, testing, and CI/CD to demonstrate architecture skills.';
  if (consistency < 40) return 'Commit consistency is weak — large gaps signal unreliability. Aim for steady weekly contributions.';
  if (impact < 40) return 'Community impact is minimal — grow stars, contribute to popular repos, and publish packages.';
  if (complexity < 60) return 'Projects lack depth — add larger systems with multiple layers (API, DB, auth, deployment).';
  if (consistency < 60) return 'Activity is sporadic — maintain a consistent 3-4 day/week cadence to stand out.';
  return 'Profile is competitive. Focus on polishing top repos with documentation and demos.';
}

function getJuniorBottleneck(consistency, complexity, impact) {
  if (consistency < 30) return 'Very inconsistent activity — hiring managers check for learning momentum. Commit at least 3 times a week.';
  if (complexity < 30) return 'Projects are too simple — build at least one full-stack app with auth, DB, and deployment.';
  if (impact < 20) return 'No community presence — star other repos, open issues, and contribute small PRs to grow visibility.';
  if (consistency < 50) return 'Build consistency — junior roles value learning trajectory over expertise.';
  return 'Solid junior profile. Add a deployed project with a live demo link to stand out.';
}

/**
 * Score a README based on length and key sections.
 */
function scoreReadme(readmeText) {
  if (!readmeText) return { score: 0, feedback: "No README found. Add one to explain your project." };

  let score = 0;
  const lower = readmeText.toLowerCase();

  // 1. Length Check (up to 40 points)
  if (readmeText.length > 1000) score += 40;
  else if (readmeText.length > 500) score += 20;
  else score += 10;

  // 2. Key Sections (up to 60 points)
  const sections = [
    { key: ['install', 'setup', 'getting started'], points: 15, name: 'Installation' },
    { key: ['usage', 'how to', 'example'], points: 15, name: 'Usage' },
    { key: ['contribut', 'development'], points: 15, name: 'Contributing' },
    { key: ['license', 'copyright'], points: 15, name: 'License' }
  ];

  const missing = [];

  sections.forEach(sec => {
    if (sec.key.some(k => lower.includes(k))) {
      score += sec.points;
    } else {
      missing.push(sec.name);
    }
  });

  let feedback = "Great README!";
  if (score < 50) feedback = "README is too short or missing key sections.";
  if (missing.length > 0) feedback = `Consider adding sections: ${missing.join(', ')}.`;

  return { score, feedback };
}

module.exports = {
  fetchGitHubData,
  aggregateLanguages,
  computeTotalStars,
  accountAgeYears,
  detectGhostCode,
  calculateHiringOdds,
  scoreReadme,
};
