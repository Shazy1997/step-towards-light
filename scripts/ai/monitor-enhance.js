const ai = require('./llama_integration');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AIMonitoringEnhancement {
  constructor() {
    this.thresholds = {
      memory: 80,  // percentage
      cpu: 70,     // percentage
      errors: 5,   // per minute
      latency: 1000 // milliseconds
    };
    this.analysisDir = path.join(process.cwd(), 'analysis');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.analysisDir)) {
      fs.mkdirSync(this.analysisDir, { recursive: true });
    }
  }

  async monitorAndAnalyze() {
    try {
      // Get current metrics
      const metrics = await this.gatherMetrics();
      
      // Check for issues
      const issues = this.detectIssues(metrics);
      
      if (issues.length > 0) {
        console.log('Issues detected:', issues.length);
        
        // Analyze each issue with AI
        for (const issue of issues) {
          const analysis = await ai.analyze(JSON.stringify(issue));
          await this.handleAnalysis(issue, analysis);
        }
      }

      // Log monitoring run
      this.logMonitoringRun(metrics, issues);

    } catch (error) {
      console.error('Error in monitoring:', error);
      throw error;
    }
  }

  async gatherMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      docker: this.getDockerMetrics(),
      system: this.getSystemMetrics(),
      application: this.getApplicationMetrics()
    };

    return metrics;
  }

  getDockerMetrics() {
    try {
      const statsOutput = execSync('docker stats --no-stream --format "{{json .}}"').toString();
      const containers = statsOutput.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
      return {
        containers,
        status: 'active'
      };
    } catch (error) {
      return { status: 'error', message: error.message, containers: [] };
    }
  }

  getSystemMetrics() {
    const metrics = {};
    
    try {
      // Memory usage
      const memInfo = execSync('vm_stat').toString();
      metrics.memory = this.parseMemoryStats(memInfo);

      // CPU usage
      const cpuInfo = execSync('top -l 1 -n 0').toString();
      metrics.cpu = this.parseCpuStats(cpuInfo);

      // Disk usage
      const diskInfo = execSync('df -h /').toString();
      metrics.disk = this.parseDiskStats(diskInfo);

    } catch (error) {
      console.error('Error getting system metrics:', error);
    }

    return metrics;
  }

  getApplicationMetrics() {
    try {
      // Read application metrics from our monitoring system
      const metricsFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
      return JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  parseMemoryStats(memInfo) {
    // Parse vm_stat output for memory information
    const lines = memInfo.split('\n');
    const stats = {};
    
    lines.forEach(line => {
      const match = line.match(/^(.+):\s+(\d+)/);
      if (match) {
        stats[match[1].trim()] = parseInt(match[2]);
      }
    });

    return stats;
  }

  parseCpuStats(cpuInfo) {
    // Parse top output for CPU information
    const lines = cpuInfo.split('\n');
    const cpuLine = lines.find(line => line.includes('CPU usage'));
    
    if (cpuLine) {
      const usage = cpuLine.match(/(\d+\.\d+)% user, (\d+\.\d+)% sys/);
      return {
        user: parseFloat(usage[1]),
        system: parseFloat(usage[2]),
        total: parseFloat(usage[1]) + parseFloat(usage[2])
      };
    }

    return null;
  }

  parseDiskStats(diskInfo) {
    // Parse df output for disk information
    const lines = diskInfo.split('\n');
    const diskLine = lines[1];
    
    if (diskLine) {
      const [filesystem, size, used, available, capacity, mounted] = diskLine.split(/\s+/);
      return { size, used, available, capacity, mounted };
    }

    return null;
  }

  detectIssues(metrics) {
    const issues = [];

    // Check Docker container issues
    if (metrics.docker.status === 'active' && Array.isArray(metrics.docker.containers)) {
      metrics.docker.containers.forEach(container => {
        if (!container.MemPerc || !container.CPUPerc) return;
        
        const memoryUsage = this.parsePercentage(container.MemPerc);
        const cpuUsage = this.parsePercentage(container.CPUPerc);

        if (memoryUsage > this.thresholds.memory) {
          issues.push({
            type: 'memory',
            component: container.Name,
            value: memoryUsage,
            threshold: this.thresholds.memory,
            timestamp: metrics.timestamp
          });
        }

        if (cpuUsage > this.thresholds.cpu) {
          issues.push({
            type: 'cpu',
            component: container.Name,
            value: cpuUsage,
            threshold: this.thresholds.cpu,
            timestamp: metrics.timestamp
          });
        }
      });
    }

    // Check application metrics
    if (metrics.application.status !== 'error') {
      if (metrics.application.errors > this.thresholds.errors) {
        issues.push({
          type: 'errors',
          value: metrics.application.errors,
          threshold: this.thresholds.errors,
          timestamp: metrics.timestamp
        });
      }

      if (metrics.application.latency > this.thresholds.latency) {
        issues.push({
          type: 'latency',
          value: metrics.application.latency,
          threshold: this.thresholds.latency,
          timestamp: metrics.timestamp
        });
      }
    }

    return issues;
  }

  parsePercentage(percentStr) {
    return parseFloat(percentStr.replace('%', ''));
  }

  async handleAnalysis(issue, analysis) {
    // Log the analysis
    const analysisLog = {
      timestamp: new Date().toISOString(),
      issue,
      analysis,
      status: 'pending'
    };

    // Save to analysis log
    const logFile = path.join(this.analysisDir, `analysis_${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(analysisLog, null, 2));

    // If analysis suggests automatic actions, execute them
    if (analysis.commands && analysis.commands.length > 0) {
      console.log('Suggested commands:', analysis.commands);
      // Note: Actual execution would require human approval
    }

    // Update monitoring dashboard
    this.updateDashboard(issue, analysis);
  }

  updateDashboard(issue, analysis) {
    const dashboard = {
      timestamp: new Date().toISOString(),
      issues: [issue],
      analysis: analysis,
      suggestions: analysis.suggestedActions
    };

    fs.writeFileSync(
      path.join(this.analysisDir, 'dashboard.json'),
      JSON.stringify(dashboard, null, 2)
    );
  }

  logMonitoringRun(metrics, issues) {
    const log = {
      timestamp: new Date().toISOString(),
      metrics,
      issues,
      thresholds: this.thresholds
    };

    fs.writeFileSync(
      path.join(this.analysisDir, `monitoring_${Date.now()}.json`),
      JSON.stringify(log, null, 2)
    );
  }
}

// Create instance and export
const aiMonitoring = new AIMonitoringEnhancement();
module.exports = aiMonitoring;

// If running directly, start monitoring
if (require.main === module) {
  aiMonitoring.monitorAndAnalyze()
    .then(() => console.log('Monitoring run complete'))
    .catch(console.error);
}
