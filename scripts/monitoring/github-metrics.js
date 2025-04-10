const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { execSync } = require('child_process');
require('dotenv').config();

/**
 * GitHubMetricsTracker - Collect and analyze GitHub repository metrics
 * Uses GitHub GraphQL API with fallback to REST API and local git commands
 */
class GitHubMetricsTracker {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'scripts', 'monitoring', 'data');
    this.metricsFile = path.join(this.dataDir, 'github-metrics.json');
    this.cacheFile = path.join(this.dataDir, 'github-api-cache.json');
    this.ensureDirectories();
    
    // GitHub API configuration
    this.githubToken = process.env.GITHUB_TOKEN || '';
    this.owner = 'shazyasif'; // Default owner, should be configurable
    this.repo = 'step-towards-light'; // Default repo name
    
    // Default metrics structure - will be overwritten by API data
    this.metricsData = {
      repository: {
        name: this.repo,
        owner: this.owner,
        url: `https://github.com/${this.owner}/${this.repo}`
      },
      milestones: {
        current: {
          title: 'Beta Release',
          progress: '75%',
          dueDate: null,
          issues: {
            total: 0,
            completed: 0
          }
        },
        completed: ['Alpha', 'Infrastructure'],
        upcoming: ['Production Release']
      },
      
      issues: {
        open: 0,
        closed: 0,
        priority: {
          high: 0,
          medium: 0,
          low: 0
        }
      },
      
      pullRequests: {
        open: 0,
        merged: 0,
        reviewed: 0
      },
      
      branches: {
        total: 0,
        active: 0,
        stale: 0
      },
      
      commits: {
        total: 0,
        lastWeek: 0,
        authors: {}
      },
      
      features: {
        completed: ['Core UI', 'Authentication', 'Monitoring'],
        inProgress: ['Content Management', 'E-commerce'],
        planned: ['Community Features', 'Analytics']
      },

      lastUpdated: null,
      _meta: {
        version: '1.0.0',
        updateCount: 0
      }
    };

    this.loadMetricsData();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  loadMetricsData() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
        this.metricsData = { ...this.metricsData, ...data };
      }
    } catch (error) {
      console.error('Error loading metrics data:', error);
    }
  }

  async updateMetrics() {
    try {
      await this.updateFromGitHub();
      await this.updateFromLocal();
      
      this.metricsData.lastUpdated = new Date().toISOString();
      this.metricsData._meta.updateCount += 1;
      
      this.saveMetrics();
      return this.metricsData;
    } catch (error) {
      console.error('Error updating metrics:', error);
      return this.metricsData;
    }
  }

  async updateFromGitHub() {
    if (!this.githubToken) {
      console.warn('GitHub token not found, skipping API updates');
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${this.githubToken}`,
        Accept: 'application/vnd.github.v3+json'
      };

      // Get repository information
      const repoResponse = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}`,
        { headers }
      );

      // Get issues
      const issuesResponse = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=all`,
        { headers }
      );

      // Get pull requests
      const prsResponse = await axios.get(
        `https://api.github.com/repos/${this.owner}/${this.repo}/pulls?state=all`,
        { headers }
      );

      // Update metrics data
      this.metricsData.issues = {
        open: issuesResponse.data.filter(issue => issue.state === 'open').length,
        closed: issuesResponse.data.filter(issue => issue.state === 'closed').length,
        priority: this.calculatePriorities(issuesResponse.data)
      };

      this.metricsData.pullRequests = {
        open: prsResponse.data.filter(pr => pr.state === 'open').length,
        merged: prsResponse.data.filter(pr => pr.merged).length,
        reviewed: prsResponse.data.filter(pr => pr.reviewed).length
      };

    } catch (error) {
      console.error('Error fetching from GitHub API:', error.message);
    }
  }

  calculatePriorities(issues) {
    return issues.reduce((acc, issue) => {
      const priority = this.getPriorityFromLabels(issue.labels);
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, { high: 0, medium: 0, low: 0 });
  }

  getPriorityFromLabels(labels) {
    const priorityLabels = labels.map(label => label.name.toLowerCase());
    if (priorityLabels.includes('high-priority')) return 'high';
    if (priorityLabels.includes('medium-priority')) return 'medium';
    return 'low';
  }

  async updateFromLocal() {
    try {
      // Get branch information
      const branches = execSync('git branch -a').toString().split('\n').filter(Boolean);
      
      // Get commit information
      const totalCommits = parseInt(execSync('git rev-list --count HEAD').toString());
      const lastWeekCommits = parseInt(
        execSync('git rev-list --count HEAD --since="1 week ago"').toString()
      );
      
      // Get commit authors
      const authors = execSync('git shortlog -sn HEAD').toString()
        .split('\n')
        .filter(Boolean)
        .reduce((acc, line) => {
          const [count, name] = line.trim().split('\t');
          acc[name] = parseInt(count);
          return acc;
        }, {});

      // Update metrics
      this.metricsData.branches = {
        total: branches.length,
        active: branches.length, // Could be refined with last commit date check
        stale: 0
      };

      this.metricsData.commits = {
        total: totalCommits,
        lastWeek: lastWeekCommits,
        authors
      };

    } catch (error) {
      console.error('Error updating from local git:', error);
    }
  }

  saveMetrics() {
    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metricsData, null, 2));
    console.log(`GitHub metrics saved to ${this.metricsFile}`);
  }

  getMetrics() {
    return this.metricsData;
  }

  getMetricsSummary() {
    return {
      repository: this.metricsData.repository,
      issues: {
        total: this.metricsData.issues.open + this.metricsData.issues.closed,
        open: this.metricsData.issues.open,
        priority: this.metricsData.issues.priority
      },
      pullRequests: {
        total: this.metricsData.pullRequests.open + this.metricsData.pullRequests.merged,
        open: this.metricsData.pullRequests.open,
        merged: this.metricsData.pullRequests.merged
      },
      commits: {
        total: this.metricsData.commits.total,
        lastWeek: this.metricsData.commits.lastWeek
      },
      features: {
        completed: this.metricsData.features.completed.length,
        inProgress: this.metricsData.features.inProgress.length,
        planned: this.metricsData.features.planned.length
      },
      lastUpdated: this.metricsData.lastUpdated
    };
  }
}

module.exports = new GitHubMetricsTracker();

// If running directly, update metrics
if (require.main === module) {
  console.log('Updating GitHub metrics...');
  const tracker = module.exports;
  tracker.updateMetrics()
    .then(() => {
      console.log('Metrics update complete');
      console.log('Summary:', JSON.stringify(tracker.getMetricsSummary(), null, 2));
    })
    .catch(error => {
      console.error('Metrics update failed:', error);
    });
}

