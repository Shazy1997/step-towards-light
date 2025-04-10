const fs = require('fs');
const path = require('path');
const contextAggregator = require('./context-aggregator');

class PromptEnhancer {
  constructor() {
    this.contextDir = path.join(process.cwd(), 'context');
  }

  async enhancePrompt(basePrompt) {
    try {
      // Get latest context
      const context = await this.getLatestContext();
      
      // Create enhanced prompt
      const enhancedPrompt = `
Project Context:
${this.formatContext(context)}

Original Prompt:
${basePrompt}

Please consider our Islamic guidance platform's current status, mission, and progress when providing your response.
Ensure recommendations align with our goals of providing authentic Islamic knowledge and building a supportive community.
`;

      return enhancedPrompt;
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      return basePrompt;
    }
  }

  async getLatestContext() {
    const latestPath = path.join(this.contextDir, 'latest.json');
    if (!fs.existsSync(latestPath)) {
      // Generate new context if none exists
      return await contextAggregator.aggregateContext();
    }
    return JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  }

  formatContext(context) {
    return `
Mission: ${context.project?.mission?.primary || 'Providing authentic Islamic guidance'}

Current Status:
- Phase: ${context.project?.timeline?.current || 'Development'}
- Next Milestone: ${context.project?.timeline?.nextMilestone || 'Production Deployment'}
- System Health: ${context.monitoring?.status || 'Unknown'}

Recent Progress:
${this.formatRecentChanges(context)}

Implementation:
- Completed: ${(context.project?.features?.implemented || []).length} features
- In Progress: ${(context.project?.features?.inProgress || []).length} features
- Test Coverage: ${context.technical?.implementation?.metrics?.testCoverage || 'Unknown'}

Technical Status:
- Environment: ${context.deployment?.environment || 'development'}
- Docker Status: ${context.deployment?.docker?.status || 'Unknown'}
- Tests Passing: ${context.technical?.implementation?.metrics?.passingTests || 0}

Focus Areas:
- Content Management
- Community Building
- Islamic Guidance
- Technical Excellence`;
  }

  formatRecentChanges(context) {
    const changes = context.progress?.gitStatus?.recentChanges || [];
    if (changes.length === 0) return '- No recent changes';
    
    return changes
      .slice(0, 3)
      .map(change => `- ${change}`)
      .join('\n');
  }
}

module.exports = new PromptEnhancer();
