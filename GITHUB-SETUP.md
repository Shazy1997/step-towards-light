# GitHub Integration Setup

This project is configured to work with GitHub account: **shazy1997**

## Setup Steps

1. Create the repository on GitHub:
   - Go to: https://github.com/new
   - Repository name: step-towards-light
   - Choose public or private as needed
   - Click "Create repository"

2. Configure local repository:
```bash
# Add the remote repository
git remote add origin https://github.com/shazy1997/step-towards-light.git

# Verify the remote was added
git remote -v

# Push your code (replace main with your branch name if different)
git push -u origin main
```

3. Enable GitHub token for metrics:
   - Generate a personal access token at GitHub (Settings → Developer settings → Personal access tokens)
   - Add the token to your .env file:
   ```
   GITHUB_TOKEN=your-token-here
   ```

4. Integrate the AI monitoring system:
   - Update scripts/monitoring/github-metrics.js to import the configuration:
   ```javascript
   const config = require('./github-metrics-config');
   this.githubToken = config.githubToken;
   this.owner = config.owner;
   this.repo = config.repo;
   this.repository = config.repository;
   ```

5. Start monitoring:
```bash
npm run monitor:all
```
