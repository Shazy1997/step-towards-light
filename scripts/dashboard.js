#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const blessed = require('blessed');
const contextAggregator = require('./context-pipeline/context-aggregator');

class DashboardManager {
  constructor() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Step Towards the Light - Platform Dashboard'
    });

    this.createLayout();
    this.bindKeys();
    this.startMonitoring();
  }

  createLayout() {
    // Platform Mission Box
    this.missionBox = blessed.box({
      top: '0',
      left: '0',
      width: '100%',
      height: '15%',
      label: ' Platform Mission ',
      content: 'Loading mission status...',
      border: { type: 'line' },
      style: {
        border: { fg: 'green' },
        label: { fg: 'brightgreen' }
      }
    });

    // Content Status Box
    this.contentBox = blessed.box({
      top: '15%',
      left: '0',
      width: '33%',
      height: '45%',
      label: ' Content Management ',
      content: 'Loading content status...',
      border: { type: 'line' },
      style: {
        border: { fg: 'yellow' },
        label: { fg: 'brightyellow' }
      }
    });

    // Community Status Box
    this.communityBox = blessed.box({
      top: '15%',
      left: '33%',
      width: '34%',
      height: '45%',
      label: ' Community Engagement ',
      content: 'Loading community status...',
      border: { type: 'line' },
      style: {
        border: { fg: 'blue' },
        label: { fg: 'brightblue' }
      }
    });

    // Technical Status Box
    this.technicalBox = blessed.box({
      top: '15%',
      left: '67%',
      width: '33%',
      height: '45%',
      label: ' Technical Status ',
      content: 'Loading technical status...',
      border: { type: 'line' },
      style: {
        border: { fg: 'magenta' },
        label: { fg: 'brightmagenta' }
      }
    });

    // Alerts Box
    this.alertsBox = blessed.box({
      top: '60%',
      left: '0',
      width: '50%',
      height: '40%',
      label: ' Active Alerts ',
      content: 'Loading alerts...',
      border: { type: 'line' },
      style: {
        border: { fg: 'red' },
        label: { fg: 'brightred' }
      },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: { ch: '█' }
    });

    // Actions Box
    this.actionsBox = blessed.box({
      top: '60%',
      left: '50%',
      width: '50%',
      height: '40%',
      label: ' Available Actions ',
      content: `
Commands:
  r: Refresh dashboard
  c: View context
  m: View monitoring
  t: Run tests
  d: View documentation
  q: Quit dashboard
  h: Show help

Status:
  - Monitoring active
  - Context tracking enabled
  - Alerts being processed
  - Tests configured
      `,
      border: { type: 'line' },
      style: {
        border: { fg: 'white' },
        label: { fg: 'brightwhite' }
      }
    });

    // Add all boxes to screen
    this.screen.append(this.missionBox);
    this.screen.append(this.contentBox);
    this.screen.append(this.communityBox);
    this.screen.append(this.technicalBox);
    this.screen.append(this.alertsBox);
    this.screen.append(this.actionsBox);
  }

  bindKeys() {
    // Quit
    this.screen.key(['q', 'C-c'], () => process.exit(0));

    // Refresh
    this.screen.key('r', () => this.updateDashboard());

    // View context
    this.screen.key('c', () => {
      this.showMessage('Starting context viewer...');
      execSync('npm run context:view', { stdio: 'inherit' });
    });

    // View monitoring
    this.screen.key('m', () => {
      this.showMessage('Starting monitoring...');
      execSync('npm run monitor:ai', { stdio: 'inherit' });
    });

    // Run tests
    this.screen.key('t', () => {
      this.showMessage('Running tests...');
      execSync('npm run test:all', { stdio: 'inherit' });
    });

    // View documentation
    this.screen.key('d', () => {
      this.showMessage('Opening documentation...');
      this.showDocumentation();
    });

    // Show help
    this.screen.key('h', () => this.showHelp());
  }

  async updateDashboard() {
    try {
      const context = await contextAggregator.aggregateContext();
      
      // Update mission status
      this.missionBox.setContent(`
Mission: ${context.project.mission.primary}

Goals:
${context.project.mission.goals.map(goal => `• ${goal}`).join('\n')}

Current Focus: Islamic Guidance and Community Building
      `);

      // Update content status
      this.contentBox.setContent(`
Content Types:
• YouTube Videos: Curated scholarly content 
• Written Khutbahs: Verified sources
• Community Posts: Moderated content
• Educational Resources: Islamic teachings

Implementation:
• Content Management: ${this.getStatusEmoji(context.project.features.implemented.includes('content'))}
• Source Verification: ${this.getStatusEmoji(true)}
• Media Processing: ${this.getStatusEmoji(true)}
• Content Delivery: ${this.getStatusEmoji(true)}
      `);

      // Update community status
      this.communityBox.setContent(`
Community Features:
• Discord Integration: ${this.getStatusEmoji(context.project.features.implemented.includes('discord'))}
• User Engagement: Active
• Discussion Forums: Planned
• Knowledge Sharing: In Progress

Metrics:
• Active Users: Tracking
• Content Shares: Monitoring
• Discussions: Enabled
• Support: Available
      `);

      // Update technical status
      this.technicalBox.setContent(`
System Health: ${context.monitoring.status.toUpperCase()}
Environment: ${context.deployment.environment}
Docker Status: ${context.deployment.docker.status}

Metrics:
• Tests: ${context.technical.implementation.metrics.passingTests} passing
• Coverage: ${context.technical.implementation.metrics.testCoverage}
• Components: ${context.project.features.implemented.length}
• In Progress: ${context.project.features.inProgress.length}
      `);

      // Update alerts
      this.alertsBox.setContent(`
Active Alerts:
${this.formatAlerts(context.monitoring.alerts)}

Recent Updates:
${context.progress.gitStatus.recentChanges.slice(0, 3).map(change => `• ${change}`).join('\n')}

Last Update: ${new Date().toISOString()}
      `);

      this.screen.render();
    } catch (error) {
      this.showError(error);
    }
  }

  getStatusEmoji(status) {
    return status ? '✅' : '🔄';
  }

  formatAlerts(alerts = []) {
    if (alerts.length === 0) return 'No active alerts';
    
    return alerts
      .map(alert => `• [${alert.severity.toUpperCase()}] ${alert.message}`)
      .join('\n');
  }

  showMessage(message) {
    this.actionsBox.setContent(`
${message}

Press any key to continue...
    `);
    this.screen.render();
  }

  showError(error) {
    this.actionsBox.setContent(`
ERROR: ${error.message}

Press 'r' to retry
Press 'h' for help
    `);
    this.screen.render();
  }

  showHelp() {
    this.actionsBox.setContent(`
Help Information:

Dashboard Controls:
  r: Refresh all displays
  c: Open context viewer
  m: View monitoring
  t: Run test suite
  d: View documentation
  q: Quit dashboard
  h: Show this help

The dashboard shows:
• Platform mission
• Content status
• Community engagement
• Technical health
• Active alerts
• Available actions

Press any key to continue...
    `);
    this.screen.render();
  }

  showDocumentation() {
    const docs = [
      'PROGRESS.md',
      'CONTEXT_VIEWER_GUIDE.md',
      'MONITORING_INFRASTRUCTURE.md',
      'PRODUCTION_SETUP.md'
    ];

    this.actionsBox.setContent(`
Available Documentation:
${docs.map((doc, i) => `${i + 1}. ${doc}`).join('\n')}

Use 'less' to view: less docs/FILENAME
    `);
    this.screen.render();
  }

  startMonitoring() {
    // Initial update
    this.updateDashboard();
    
    // Update every 5 minutes
    setInterval(() => {
      this.updateDashboard();
    }, 5 * 60 * 1000);
  }
}

// Create and export dashboard
const dashboard = new DashboardManager();
module.exports = dashboard;

// If running directly, just keep running
if (require.main === module) {
  // Dashboard will keep running until user quits
}
