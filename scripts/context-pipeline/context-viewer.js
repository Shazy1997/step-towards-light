const blessed = require('blessed');
const contextAggregator = require('./context-aggregator');
const promptEnhancer = require('./prompt-enhancer');

class ContextViewer {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Step Towards the Light - Context Viewer'
    });

    this.createLayout();
    this.bindKeys();
    this.startUpdates();
  }

  createLayout() {
    // Mission Box
    this.missionBox = blessed.box({
      top: '0',
      left: '0',
      width: '50%',
      height: '30%',
      label: ' Mission & Goals ',
      content: 'Loading...',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'green'
        }
      }
    });

    // Progress Box
    this.progressBox = blessed.box({
      top: '0',
      left: '50%',
      width: '50%',
      height: '30%',
      label: ' Implementation Progress ',
      content: 'Loading...',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'yellow'
        }
      }
    });

    // Technical Status Box
    this.statusBox = blessed.box({
      top: '30%',
      left: '0',
      width: '50%',
      height: '40%',
      label: ' Technical Status ',
      content: 'Loading...',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'blue'
        }
      }
    });

    // Context Updates Box
    this.updatesBox = blessed.box({
      top: '30%',
      left: '50%',
      width: '50%',
      height: '40%',
      label: ' Recent Updates ',
      content: 'Loading...',
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'magenta'
        }
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '█'
      }
    });

    // Commands Box
    this.commandBox = blessed.box({
      top: '70%',
      left: '0',
      width: '100%',
      height: '30%',
      label: ' Commands & Information ',
      content: `
Commands:
  r: Refresh context
  u: Force update
  q: Quit
  h: Show help

Monitoring:
  - Context updates every 5 minutes
  - Tracks project progress
  - Monitors system health
  - Updates AI understanding
      `,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'white'
        }
      }
    });

    // Add boxes to screen
    this.screen.append(this.missionBox);
    this.screen.append(this.progressBox);
    this.screen.append(this.statusBox);
    this.screen.append(this.updatesBox);
    this.screen.append(this.commandBox);
  }

  bindKeys() {
    // Quit on q or Control-C
    this.screen.key(['q', 'C-c'], () => {
      process.exit(0);
    });

    // Refresh on r
    this.screen.key('r', () => {
      this.updateDisplay();
    });

    // Force update on u
    this.screen.key('u', () => {
      this.forceUpdate();
    });

    // Show help on h
    this.screen.key('h', () => {
      this.showHelp();
    });
  }

  async updateDisplay() {
    try {
      const context = await contextAggregator.aggregateContext();
      
      // Update mission box
      this.missionBox.setContent(`
Mission: ${context.project.mission.primary}

Goals:
${context.project.mission.goals.map(goal => `• ${goal}`).join('\n')}

Focus Areas:
• Content Management
• Community Building
• Islamic Guidance
• Technical Excellence
      `);

      // Update progress box
      this.progressBox.setContent(`
Implemented Features: ${context.project.features.implemented.length}
In Progress: ${context.project.features.inProgress.length}

Current Phase: ${context.project.timeline.current}
Next Milestone: ${context.project.timeline.nextMilestone}

Test Coverage: ${context.technical.implementation.metrics.testCoverage}
Passing Tests: ${context.technical.implementation.metrics.passingTests}
      `);

      // Update status box
      this.statusBox.setContent(`
System Health: ${context.monitoring.status}
Environment: ${context.deployment.environment}
Docker Status: ${context.deployment.docker.status}

Components:
• Next.js Application
• Docker Container
• AI Monitoring
• Testing Framework

Recent Alerts: ${(context.monitoring.alerts || []).length}
      `);

      // Update updates box
      this.updatesBox.setContent(`
Recent Changes:
${(context.progress.gitStatus.recentChanges || []).map(change => `• ${change}`).join('\n')}

Last Context Update: ${new Date().toISOString()}
      `);

      this.screen.render();
    } catch (error) {
      this.showError(error);
    }
  }

  async forceUpdate() {
    try {
      this.commandBox.setContent('Forcing context update...');
      this.screen.render();
      
      await contextAggregator.aggregateContext();
      await this.updateDisplay();
      
      this.commandBox.setContent('Context updated successfully!');
      this.screen.render();
      
      // Reset command box after 3 seconds
      setTimeout(() => {
        this.resetCommandBox();
      }, 3000);
    } catch (error) {
      this.showError(error);
    }
  }

  showHelp() {
    this.commandBox.setContent(`
Help Information:

Commands:
  r: Refresh the display with latest context
  u: Force a context update
  q: Quit the viewer
  h: Show this help message

Context Tracking:
- Monitors project progress
- Tracks implementation status
- Updates AI understanding
- Maintains mission focus

The viewer automatically updates every 5 minutes.
Press 'r' to manually refresh the display.
    `);
    this.screen.render();
  }

  showError(error) {
    this.commandBox.setContent(`
ERROR: ${error.message}

Press 'r' to retry
Press 'h' for help
    `);
    this.screen.render();
  }

  resetCommandBox() {
    this.commandBox.setContent(`
Commands:
  r: Refresh context
  u: Force update
  q: Quit
  h: Show help

Monitoring:
  - Context updates every 5 minutes
  - Tracks project progress
  - Monitors system health
  - Updates AI understanding
    `);
    this.screen.render();
  }

  startUpdates() {
    // Initial update
    this.updateDisplay();
    
    // Update every 5 minutes
    setInterval(() => {
      this.updateDisplay();
    }, 5 * 60 * 1000);
  }
}

// Export viewer class
module.exports = ContextViewer;

// If running directly, start viewer
if (require.main === module) {
  const viewer = new ContextViewer();
}
