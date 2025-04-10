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

Please consider the project's current status, mission, and progress when providing your response.
Ensure recommendations align with our Islamic guidance platform's goals and values.
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
Mission: ${context.project.mission.primary}

Current Status:
- Phase: ${context.project.timeline.current}
- Next Milestone: ${context.project.timeline.nextMilestone}
- System Health: ${context.monitoring.status}

Recent Progress:
${context.progress.gitStatus.recentChanges.slice(0, 3).map(c => `- ${c}`).join('\n')}

Implementation:
- Completed: ${context.project.features.implemented.length} features
- In Progress: ${context.project.features.inProgress.length} features
- Test Coverage: ${context.technical.implementation.metrics.testCoverage}
`;
  }
}

module.exports = new PromptEnhancer();
