const fs = require('fs');
const path = require('path');
const ai = require('./llama_integration');
const alertManager = require('./alert-manager');
const reporter = require('./reporter');

class AIDashboard {
  constructor() {
    this.dashboardDir = path.join(process.cwd(), 'dashboard');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }
  }

  async generateDashboard() {
    try {
      const dashboard = {
        timestamp: new Date().toISOString(),
        status: await this.getSystemStatus(),
        alerts: await this.getAlertsSummary(),
        analysis: await this.getLatestAnalysis(),
        recommendations: await this.getTopRecommendations(),
        metrics: await this.getPerformanceMetrics()
      };

      await this.saveDashboard(dashboard);
      await this.generateHTML(dashboard);
      return dashboard;
    } catch (error) {
      console.error('Error generating dashboard:', error);
      throw error;
    }
  }

  async getSystemStatus() {
    const alerts = await alertManager.getActiveAlerts();
    const report = await reporter.getSystemStatus();

    return {
      overall: report.status,
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        warning: alerts.filter(a => a.severity === 'warning').length
      },
      lastUpdate: new Date().toISOString()
    };
  }

  async getAlertsSummary() {
    const alerts = await alertManager.getActiveAlerts();
    return {
      recent: alerts.slice(0, 5),
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical'),
        warning: alerts.filter(a => a.severity === 'warning'),
        info: alerts.filter(a => a.severity === 'info')
      }
    };
  }

  async getLatestAnalysis() {
    const analysisDir = path.join(process.cwd(), 'analysis');
    if (!fs.existsSync(analysisDir)) return [];

    return fs.readdirSync(analysisDir)
      .filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(analysisDir, f), 'utf8')))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  }

  async getTopRecommendations() {
    const report = await reporter.generateDailyReport();
    return report.recommendations.slice(0, 5);
  }

  async getPerformanceMetrics() {
    const monitoringFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
    if (!fs.existsSync(monitoringFile)) {
      return { status: 'unknown' };
    }

    return JSON.parse(fs.readFileSync(monitoringFile, 'utf8'));
  }

  async saveDashboard(dashboard) {
    const filename = `dashboard_${Date.now()}.json`;
    const filepath = path.join(this.dashboardDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(dashboard, null, 2));
    
    // Update latest dashboard
    const latestPath = path.join(this.dashboardDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(dashboard, null, 2));
  }

  async generateHTML(dashboard) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI System Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        .status-card {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            flex: 1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alerts {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .recommendations {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .critical { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>AI System Dashboard</h1>
            <p>Last Updated: ${new Date(dashboard.timestamp).toLocaleString()}</p>
        </div>

        <div class="status">
            <div class="status-card">
                <h2>System Status</h2>
                <p class="${dashboard.status.overall === 'healthy' ? 'success' : 'warning'}">
                    ${dashboard.status.overall.toUpperCase()}
                </p>
            </div>
            <div class="status-card">
                <h2>Active Alerts</h2>
                <p>
                    <span class="critical">Critical: ${dashboard.status.alerts.critical}</span><br>
                    <span class="warning">Warning: ${dashboard.status.alerts.warning}</span>
                </p>
            </div>
        </div>

        <div class="alerts">
            <h2>Recent Alerts</h2>
            <ul>
                ${dashboard.alerts.recent.map(alert => `
                    <li class="${alert.severity}">
                        ${alert.type}: ${alert.details.assessment}
                    </li>
                `).join('')}
            </ul>
        </div>

        <div class="metrics">
            ${Object.entries(dashboard.metrics).map(([key, value]) => `
                <div class="metric-card">
                    <h3>${key}</h3>
                    <p>${typeof value === 'object' ? JSON.stringify(value) : value}</p>
                </div>
            `).join('')}
        </div>

        <div class="recommendations">
            <h2>Top Recommendations</h2>
            <ul>
                ${dashboard.recommendations.map(rec => `
                    <li>
                        <strong>${rec.action}</strong>: ${rec.risk}
                        (Priority: ${rec.priority})
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => location.reload(), 300000);
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(this.dashboardDir, 'index.html'), html);
  }
}

module.exports = new AIDashboard();

// If running directly, generate dashboard
if (require.main === module) {
  const dashboard = new AIDashboard();
  dashboard.generateDashboard()
    .then(() => console.log('Dashboard generated successfully'))
    .catch(console.error);
}
