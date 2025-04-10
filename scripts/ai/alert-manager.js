const fs = require('fs');
const path = require('path');

class AlertManager {
  constructor() {
    this.alertsDir = path.join(process.cwd(), 'logs', 'alerts');
    this.thresholds = require('../../config/ai/config').thresholds;
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.alertsDir)) {
      fs.mkdirSync(this.alertsDir, { recursive: true });
    }
  }

  async processAlert(analysis) {
    try {
      const alert = this.createAlert(analysis);
      await this.saveAlert(alert);
      await this.notifyAlert(alert);
      return alert;
    } catch (error) {
      console.error('Error processing alert:', error);
      throw error;
    }
  }

  createAlert(analysis) {
    const alert = {
      id: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(analysis),
      type: this.determineAlertType(analysis),
      details: analysis,
      status: 'new'
    };

    return alert;
  }

  determineSeverity(analysis) {
    if (!analysis.metrics) return 'info';

    const { cpu, memory, errors } = analysis.metrics;

    if (
      (cpu && parseInt(cpu) > this.thresholds.cpu.critical) ||
      (memory && parseInt(memory) > this.thresholds.memory.critical) ||
      (errors && errors > this.thresholds.errors.critical)
    ) {
      return 'critical';
    }

    if (
      (cpu && parseInt(cpu) > this.thresholds.cpu.warning) ||
      (memory && parseInt(memory) > this.thresholds.memory.warning) ||
      (errors && errors > this.thresholds.errors.warning)
    ) {
      return 'warning';
    }

    return 'info';
  }

  determineAlertType(analysis) {
    if (analysis.type) return analysis.type;
    
    if (analysis.metrics) {
      if (analysis.metrics.cpu > this.thresholds.cpu.warning) return 'cpu_usage';
      if (analysis.metrics.memory > this.thresholds.memory.warning) return 'memory_usage';
      if (analysis.metrics.errors > this.thresholds.errors.warning) return 'error_rate';
    }

    return 'system_alert';
  }

  async saveAlert(alert) {
    const filename = `${alert.id}.json`;
    const filepath = path.join(this.alertsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(alert, null, 2));
    
    // Update alert index
    this.updateAlertIndex(alert);
  }

  updateAlertIndex(alert) {
    const indexPath = path.join(this.alertsDir, 'index.json');
    let index = [];

    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }

    index.unshift({
      id: alert.id,
      timestamp: alert.timestamp,
      severity: alert.severity,
      type: alert.type,
      status: alert.status
    });

    // Keep last 100 alerts in index
    if (index.length > 100) {
      index = index.slice(0, 100);
    }

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  async notifyAlert(alert) {
    // Log alert
    console.log(`[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.details.assessment}`);

    // Handle different notification methods based on severity
    switch (alert.severity) {
      case 'critical':
        await this.notifyCritical(alert);
        break;
      case 'warning':
        await this.notifyWarning(alert);
        break;
      default:
        await this.notifyInfo(alert);
    }
  }

  async notifyCritical(alert) {
    // You can implement different notification methods here
    // For example, sending to Discord webhook, email, etc.
    console.error('CRITICAL ALERT:', alert.details.assessment);
  }

  async notifyWarning(alert) {
    console.warn('WARNING:', alert.details.assessment);
  }

  async notifyInfo(alert) {
    console.info('INFO:', alert.details.assessment);
  }

  async getActiveAlerts() {
    const indexPath = path.join(this.alertsDir, 'index.json');
    if (!fs.existsSync(indexPath)) return [];

    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    return index.filter(alert => alert.status === 'new');
  }

  async acknowledgeAlert(alertId) {
    const alertPath = path.join(this.alertsDir, `${alertId}.json`);
    if (!fs.existsSync(alertPath)) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const alert = JSON.parse(fs.readFileSync(alertPath, 'utf8'));
    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();

    fs.writeFileSync(alertPath, JSON.stringify(alert, null, 2));
    this.updateAlertIndex(alert);

    return alert;
  }
}

module.exports = new AlertManager();
