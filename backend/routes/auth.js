const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/auth/github
router.post('/github', async (req, res) => {
    const { code } = req.body;
    // TODO: Exchange code for access token via GitHub API
    // const { data } = await axios.post('https://github.com/login/oauth/access_token', ...);

    // enhance: For now, mock successful login
    res.json({ token: 'mock_github_token_123', user: { login: 'mockuser', name: 'Mock User' } });
});

module.exports = router;
