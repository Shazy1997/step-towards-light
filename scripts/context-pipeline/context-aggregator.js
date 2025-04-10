const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ContextAggregator {
  constructor() {
    this.contextDir = path.join(process.cwd(), 'context');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.contextDir)) {
      fs.mkdirSync(this.contextDir, { recursive: true });
    }
  }

  async aggregateContext() {
    const context = {
      timestamp: new Date().toISOString(),
      project: await this.getProjectContext(),
      progress: await this.getProgressContext(),
      technical: await this.getTechnicalContext(),
      deployment: await this.getDeploymentContext(),
      monitoring: await this.getMonitoringContext()
    };

    await this.saveContext(context);
    return context;
  }

  async getProjectContext() {
    try {
      return {
        mission: {
          primary: "Providing authentic Islamic guidance and motivation",
          goals: [
            "Share authentic Islamic knowledge",
            "Build supportive community",
            "Facilitate spiritual growth",
            "Address contemporary challenges"
          ]
        },
        features: {
          implemented: [
            "Next.js application structure",
            "Docker configuration",
            "AI monitoring system",
            "Automated testing",
            "Documentation system"
          ],
          inProgress: [
            "Content management",
            "Discord integration",
            "E-commerce features",
            "Production deployment"
          ]
        },
        timeline: {
          current: "Development Phase",
          nextMilestone: "Production Deployment",
          completed: [
            "Core implementation",
            "Testing setup",
            "Monitoring system",
            "Documentation"
          ]
        }
      };
    } catch (error) {
      console.error('Error getting project context:', error);
      return {};
    }
  }

  async getProgressContext() {
    try {
      // Read PROGRESS.md
      const progressPath = path.join(process.cwd(), 'PROGRESS.md');
      const progress = fs.existsSync(progressPath) 
        ? fs.readFileSync(progressPath, 'utf8')
        : '';

      // Read project status
      const statusPath = path.join(process.cwd(), '.warp_rules/project-status.md');
      const status = fs.existsSync(statusPath)
        ? fs.readFileSync(statusPath, 'utf8')
        : '';

      return {
        currentProgress: progress,
        projectStatus: status,
        gitStatus: {
          branch: execSync('git branch --show-current').toString().trim(),
          lastCommit: execSync('git log -1 --pretty=%B').toString().trim(),
          recentChanges: execSync('git log -5 --pretty=%s').toString().split('\n')
        }
      };
    } catch (error) {
      console.error('Error getting progress context:', error);
      return {};
    }
  }

  async getTechnicalContext() {
    try {
      // Get package.json for dependencies
      const packageJson = require(path.join(process.cwd(), 'package.json'));

      return {
        stack: {
          frontend: "Next.js",
          containerization: "Docker",
          monitoring: "Custom AI system",
          testing: "Jest, Playwright",
          documentation: "Automated markdown"
        },
        implementation: {
          components: [
            "AI monitoring",
            "Alert system",
            "Documentation",
            "Testing framework"
          ],
          metrics: await this.getImplementationMetrics(),
          dependencies: packageJson.dependencies || {}
        }
      };
    } catch (error) {
      console.error('Error getting technical context:', error);
      return {};
    }
  }

  async getImplementationMetrics() {
    try {
      // Get test results
      const testResultsPath = path.join(process.cwd(), 'test-results', 'latest.json');
      const testResults = fs.existsSync(testResultsPath)
        ? JSON.parse(fs.readFileSync(testResultsPath, 'utf8'))
        : {};

      return {
        testCoverage: testResults.summary?.coverage || "unknown",
        passingTests: testResults.summary?.passed || 0,
        totalTests: testResults.summary?.total || 0,
        components: "1",
        pages: "7"
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {};
    }
  }

  async getDeploymentContext() {
    try {
      return {
        environment: process.env.NODE_ENV || 'development',
        docker: {
          status: await this.getDockerStatus(),
          containers: [
            "Next.js application",
            "Monitoring system",
            "AI integration"
          ],
          pending: [
            "Production configuration",
            "SSL setup",
            "Load balancing"
          ]
        },
        status: {
          development: "Active",
          staging: "Pending",
          production: "Planned"
        }
      };
    } catch (error) {
      console.error('Error getting deployment context:', error);
      return {};
    }
  }

  async getDockerStatus() {
    try {
      execSync('docker info');
      return 'Running';
    } catch {
      return 'Not Running';
    }
  }

  async getMonitoringContext() {
    try {
      // Get monitoring data
      const monitoringPath = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
      const monitoring = fs.existsSync(monitoringPath)
        ? JSON.parse(fs.readFileSync(monitoringPath, 'utf8'))
        : {};

      // Get test results
      const testResultsPath = path.join(process.cwd(), 'test-results', 'latest.json');
      const testResults = fs.existsSync(testResultsPath)
        ? JSON.parse(fs.readFileSync(testResultsPath, 'utf8'))
        : {};

      return {
        monitoring,
        testing: testResults,
        alerts: await this.getActiveAlerts(),
        status: this.getSystemStatus(monitoring)
      };
    } catch (error) {
      console.error('Error getting monitoring context:', error);
      return {};
    }
  }

  async getActiveAlerts() {
    try {
      const alertsPath = path.join(process.cwd(), 'logs', 'alerts', 'index.json');
      return fs.existsSync(alertsPath)
        ? JSON.parse(fs.readFileSync(alertsPath, 'utf8'))
        : [];
    } catch {
      return [];
    }
  }

  getSystemStatus(monitoring) {
    if (!monitoring || !monitoring.status) return 'unknown';

    const criticalIssues = monitoring.alerts?.critical || 0;
    const warningIssues = monitoring.alerts?.warning || 0;

    if (criticalIssues > 0) return 'critical';
    if (warningIssues > 0) return 'warning';
    return 'healthy';
  }

  async saveContext(context) {
    const filename = `context_${Date.now()}.json`;
    const filepath = path.join(this.contextDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(context, null, 2));
    
    // Update latest context
    const latestPath = path.join(this.contextDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(context, null, 2));
    
    // Generate summary
    await this.generateContextSummary(context);
  }

  async generateContextSummary(context) {
    const summary = `# Project Context Summary
Generated: ${context.timestamp}

## Project Status
- Phase: ${context.project.timeline.current}
- Next Milestone: ${context.project.timeline.nextMilestone}
- Environment: ${context.deployment.environment}

## Mission & Goals
${context.project.mission.goals.map(goal => `- ${goal}`).join('\n')}

## Implementation Progress
### Completed Features
${context.project.features.implemented.map(f => `- ${f}`).join('\n')}

### In Progress
${context.project.features.inProgress.map(f => `- ${f}`).join('\n')}

## Technical Status
- Test Coverage: ${context.technical.implementation.metrics.testCoverage}
- Passing Tests: ${context.technical.implementation.metrics.passingTests}
- Total Tests: ${context.technical.implementation.metrics.totalTests}

## System Health
- Status: ${context.monitoring.status}
- Docker: ${context.deployment.docker.status}
- Environment: ${context.deployment.status.development}

## Recent Updates
${context.progress.gitStatus.recentChanges.map(c => `- ${c}`).join('\n')}

## Next Steps
1. Complete in-progress features
2. Prepare for production deployment
3. Implement security measures
4. Enhance monitoring system

Generated by Context Aggregator`;

    fs.writeFileSync(
      path.join(this.contextDir, 'SUMMARY.md'),
      summary
    );
  }
}

module.exports = new ContextAggregator();

// If running directly, aggregate context
if (require.main === module) {
  const aggregator = new ContextAggregator();
  aggregator.aggregateContext()
    .then(() => console.log('Context aggregated successfully'))
    .catch(console.error);
}
