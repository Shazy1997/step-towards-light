const fs = require('fs');
const path = require('path');
const alertManager = require('./alert-manager');

class AIReporter {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports', 'ai');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateDailyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      period: 'daily',
      alerts: await this.getAlertsSummary(),
      analysis: await this.getAnalysisSummary(),
      recommendations: await this.getRecommendations(),
      status: await this.getSystemStatus()
    };

    await this.saveReport(report);
    return report;
  }

  async getAlertsSummary() {
    const alerts = await alertManager.getActiveAlerts();
    
    return {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      },
      byType: alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {})
    };
  }

  async getAnalysisSummary() {
    const analysisDir = path.join(process.cwd(), 'analysis');
    if (!fs.existsSync(analysisDir)) return [];

    const files = fs.readdirSync(analysisDir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(analysisDir, f), 'utf8')))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return files;
  }

  async getRecommendations() {
    const analysis = await this.getAnalysisSummary();
    const recommendations = [];

    analysis.forEach(a => {
      if (a.recommendations) {
        recommendations.push(...a.recommendations);
      }
    });

    return recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);
  }

  async getSystemStatus() {
    // Read latest monitoring data
    const monitoringFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
    if (!fs.existsSync(monitoringFile)) {
      return { status: 'unknown' };
    }

    const monitoring = JSON.parse(fs.readFileSync(monitoringFile, 'utf8'));
    const activeAlerts = await alertManager.getActiveAlerts();

    return {
      status: this.determineStatus(monitoring, activeAlerts),
      metrics: monitoring.metrics,
      activeAlerts: activeAlerts.length,
      lastUpdate: new Date().toISOString()
    };
  }

  determineStatus(monitoring, alerts) {
    if (alerts.some(a => a.severity === 'critical')) {
      return 'critical';
    }

    if (alerts.some(a => a.severity === 'warning')) {
      return 'warning';
    }

    if (monitoring.status === 'active' && alerts.length === 0) {
      return 'healthy';
    }

    return 'unknown';
  }

  async saveReport(report) {
    const filename = `report_${Date.now()}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Update latest report link
    const latestPath = path.join(this.reportsDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
    return filepath;
  }
}

module.exports = new AIReporter();
