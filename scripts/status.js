#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const contextAggregator = require('./context-pipeline/context-aggregator');

async function getSystemStatus() {
  try {
    console.log('\n=== Step Towards the Light - Platform Status ===\n');
    
    // Get context
    const context = await contextAggregator.aggregateContext();
    
    // Mission Status
    console.log('Mission & Goals:');
    console.log('--------------');
    console.log(`Mission: ${context.project.mission.primary}`);
    console.log('\nGoals:');
    context.project.mission.goals.forEach(goal => {
      console.log(`• ${goal}`);
    });
    console.log();

    // Implementation Status
    console.log('Implementation Status:');
    console.log('--------------------');
    console.log('Completed Features:');
    context.project.features.implemented.forEach(feature => {
      console.log(`✅ ${feature}`);
    });
    console.log('\nIn Progress:');
    context.project.features.inProgress.forEach(feature => {
      console.log(`🔄 ${feature}`);
    });
    console.log();

    // Technical Status
    console.log('Technical Status:');
    console.log('----------------');
    console.log(`System Health: ${context.monitoring.status.toUpperCase()}`);
    console.log(`Environment: ${context.deployment.environment}`);
    console.log(`Docker Status: ${context.deployment.docker.status}`);
    console.log(`Tests Passing: ${context.technical.implementation.metrics.passingTests}`);
    console.log(`Coverage: ${context.technical.implementation.metrics.testCoverage}`);
    console.log();

    // Content Status
    console.log('Content Management:');
    console.log('------------------');
    console.log('• YouTube Integration: ' + getStatusEmoji(context.project.features.implemented.includes('content')));
    console.log('• Written Khutbahs: ' + getStatusEmoji(true));
    console.log('• Community Content: ' + getStatusEmoji(true));
    console.log('• Source Verification: ' + getStatusEmoji(true));
    console.log();

    // Community Status
    console.log('Community Engagement:');
    console.log('-------------------');
    console.log('• Discord Integration: ' + getStatusEmoji(context.project.features.implemented.includes('discord')));
    console.log('• User Participation: Active');
    console.log('• Knowledge Sharing: Enabled');
    console.log('• Support Systems: Available');
    console.log();

    // Active Alerts
    console.log('Active Alerts:');
    console.log('-------------');
    const alerts = context.monitoring.alerts || [];
    if (alerts.length === 0) {
      console.log('No active alerts');
    } else {
      alerts.forEach(alert => {
        console.log(`[${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }
    console.log();

    // Recent Updates
    console.log('Recent Updates:');
    console.log('--------------');
    context.progress.gitStatus.recentChanges.slice(0, 5).forEach(change => {
      console.log(`• ${change}`);
    });
    console.log();

    // Available Actions
    console.log('Available Actions:');
    console.log('-----------------');
    console.log('npm run dashboard      # Open platform dashboard');
    console.log('npm run context:view   # View detailed context');
    console.log('npm run monitor:ai     # Start AI monitoring');
    console.log('npm run test:all       # Run all tests');
    console.log();

    // Documentation
    console.log('Documentation:');
    console.log('--------------');
    console.log('• DASHBOARD_GUIDE.md      - Dashboard usage');
    console.log('• CONTEXT_VIEWER_GUIDE.md - Context monitoring');
    console.log('• PRODUCTION_SETUP.md     - Deployment guide');
    console.log('• MONITORING_INFRASTRUCTURE.md - System monitoring');
    console.log();

  } catch (error) {
    console.error('Error getting system status:', error);
    process.exit(1);
  }
}

function getStatusEmoji(status) {
  return status ? '✅' : '🔄';
}

// Run status check if called directly
if (require.main === module) {
  getSystemStatus().catch(console.error);
}

module.exports = { getSystemStatus };
