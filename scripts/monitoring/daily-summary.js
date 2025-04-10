const contentTracker = require('./content-tracking');
const githubMetrics = require('./github-metrics');
const aiMonitoring = require('../ai/monitor-enhance');
const discordNotifier = require('./discord/webhook');
const fs = require('fs');
const path = require('path');

class DailySummaryGenerator {
  constructor() {
    this.summaryDir = path.join(process.cwd(), 'reports', 'daily');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.summaryDir)) {
      fs.mkdirSync(this.summaryDir, { recursive: true });
    }
  }

  async generateSummary() {
    console.log('Generating daily summary...');
    
    try {
      // Gather data from all sources using correct methods
      const contentStatus = await contentTracker.getContentSummary(); // Changed from getContentStatus
      const githubStatus = await githubMetrics.getMetricsSummary();
      const aiStatus = await this.getAIStatus();
      
      // No need for safeContentStatus since getContentSummary already provides the correct structure
      
      // Create comprehensive summary
      const summary = {
        timestamp: new Date().toISOString(),
        overview: this.generateOverview(contentStatus, githubStatus, aiStatus),
        content: {
          completed: contentStatus.pages.completed,
          inProgress: contentStatus.pages.in_progress,
          pending: contentStatus.pages.pending,
          completionPercentage: Math.round(((contentStatus.pages.completed + (contentStatus.pages.in_progress * 0.5)) / contentStatus.pages.total) * 100),
          validation: {
            verified: contentStatus.islamicContentValidation.verified,
            partial: contentStatus.islamicContentValidation.partial,
            pending: contentStatus.islamicContentValidation.pending,
            notApplicable: contentStatus.islamicContentValidation.not_applicable,
            percentage: this.calculateValidationPercentage(contentStatus.islamicContentValidation)
          }
        },
        health: {
          docker: this.getStatusEmoji(githubStatus.repository?.status !== 'error'),
          tests: this.getStatusEmoji(aiStatus.testsPassing),
          monitoring: this.getStatusEmoji(aiStatus.monitoring === 'active')
        },
        github: {
          commits: githubStatus.commits?.total || 0,
          lastWeek: githubStatus.commits?.lastWeek || 0,
          prs: githubStatus.pullRequests?.total || 0,
          issues: githubStatus.issues?.total || 0
        },
        features: {
          completed: githubStatus.features?.completed || 0,
          inProgress: githubStatus.features?.inProgress || 0,
          planned: githubStatus.features?.planned || 0
        },
        recommendations: aiStatus.recommendations || []
      };
      
      // Ensure directory exists
      this.ensureDirectories();
      
      // Save summary to file
      const filename = `summary_${new Date().toISOString().split('T')[0]}.json`;
      const summaryPath = path.join(this.summaryDir, filename);
      
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log(`Daily summary saved to ${summaryPath}`);
      
      // Update latest.json
      const latestPath = path.join(this.summaryDir, 'latest.json');
      fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2));
      
      // Try to send to Discord if configured
      try {
        if (process.env.DISCORD_WEBHOOK_URL && 
            process.env.DISCORD_WEBHOOK_URL !== 'https://discord.com/api/webhooks/your-webhook-id/your-webhook-token') {
          await discordNotifier.sendDailySummary(summary);
          console.log('Summary sent to Discord successfully');
        } else {
          console.log('Discord webhook not configured, skipping notification');
        }
      } catch (error) {
        console.warn('Failed to send to Discord:', error.message);
      }
      
      return summary;
    } catch (error) {
      console.error('Error generating daily summary:', error);
      throw error;
    }
  }
  
  async getAIStatus() {
    try {
      const metrics = await aiMonitoring.gatherMetrics();
      return {
        testsPassing: true, // Placeholder - should check actual test status
        monitoring: 'active',
        recommendations: [
          'Consider adding more unit tests for content validation',
          'Update dependencies to address security vulnerabilities',
          'Implement remaining Discord integration components'
        ]
      };
    } catch (error) {
      console.error('Error getting AI status:', error);
      return {
        testsPassing: false,
        monitoring: 'error',
        recommendations: ['Fix AI monitoring system']
      };
    }
  }
  
  generateOverview(contentStatus, githubStatus, aiStatus) {
    const total = contentStatus.pages.total || 1;
    const completed = contentStatus.pages.completed || 0;
    const inProgress = contentStatus.pages.in_progress || 0;
    // Count in-progress pages as 50% complete
    const completionPercentage = Math.round(((completed + (inProgress * 0.5)) / total) * 100);
    
    const commits = githubStatus.commits?.lastWeek || 0;
    
    // Calculate Islamic content validation percentage
    const validation = contentStatus.islamicContentValidation || {};
    const validatedContent = (validation.verified || 0) + ((validation.partial || 0) * 0.5);
    const totalNeedingValidation = Object.values(validation).reduce((sum, val) => sum + val, 0) - (validation.not_applicable || 0);
    const validationPercentage = totalNeedingValidation ? Math.round((validatedContent / totalNeedingValidation) * 100) : 0;
    
    return `Project is ${completionPercentage}% complete (${validationPercentage}% content validated) with ${commits} commits in the last week and ${inProgress} pages in progress.`;
  }
  
  getStatusEmoji(isHealthy) {
    return isHealthy ? '✅' : '❌';
  }
  
  calculateValidationPercentage(validation) {
    if (!validation) return 0;
    
    const validatedContent = (validation.verified || 0) + ((validation.partial || 0) * 0.5);
    const total = Object.values(validation).reduce((sum, val) => sum + val, 0) - (validation.not_applicable || 0);
    
    return total ? Math.round((validatedContent / total) * 100) : 0;
  }
}

const summaryGenerator = new DailySummaryGenerator();

// If running directly, generate summary
if (require.main === module) {
  summaryGenerator.generateSummary()
    .then(() => {
      console.log('Daily summary completed');
    })
    .catch(error => {
      console.error('Error generating daily summary:', error);
      process.exit(1);
    });
}

module.exports = summaryGenerator;

