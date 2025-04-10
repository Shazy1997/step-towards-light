const WebSocket = require('ws');
const { execSync } = require('child_process');
const contentTracker = require('../content-tracking');
const githubMetrics = require('../github-metrics');
const aiMonitoring = require('../../ai/monitor-enhance');

class RealtimeMonitor {
  constructor() {
    this.interval = 15 * 60 * 1000; // 15 minutes
    this.ws = null;
    this.metrics = {};
  }

  async initialize() {
    this.ws = new WebSocket('wss://your-monitoring-endpoint');
    this.setupWebSocket();
    this.startMonitoring();
  }

  setupWebSocket() {
    this.ws.on('open', () => {
      console.log('Realtime monitoring connected');
      this.sendMetrics();
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      setTimeout(() => this.initialize(), 5000);
    });
  }

  async gatherMetrics() {
    return {
      timestamp: new Date().toISOString(),
      docker: await this.getDockerHealth(),
      content: await contentTracker.getContentStatus(),
      github: await githubMetrics.getMetrics(),
      ai: await aiMonitoring.gatherMetrics()
    };
  }

  async getDockerHealth() {
    try {
      const containers = execSync('docker ps -a --format "{{json .}}"')
        .toString()
        .split('\n')
        .filter(Boolean)
        .map(line => JSON.parse(line));

      return {
        status: 'healthy',
        containers: containers.length,
        active: containers.filter(c => c.State === 'running').length
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async sendMetrics() {
    if (this.ws.readyState === WebSocket.OPEN) {
      const metrics = await this.gatherMetrics();
      this.ws.send(JSON.stringify(metrics));
    }
  }

  startMonitoring() {
    setInterval(() => this.sendMetrics(), this.interval);
  }
}

module.exports = new RealtimeMonitor();

