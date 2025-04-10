const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WarpDockerMonitor {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.ensureDirectoryExists(this.dataDir);
    this.metricsHistory = this.loadMetricsHistory();
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  loadMetricsHistory() {
    const historyFile = path.join(this.dataDir, 'metrics-history.json');
    try {
      return fs.existsSync(historyFile) 
        ? JSON.parse(fs.readFileSync(historyFile, 'utf8')) 
        : [];
    } catch (error) {
      console.error('Error loading metrics history:', error);
      return [];
    }
  }

  saveMetricsHistory() {
    const historyFile = path.join(this.dataDir, 'metrics-history.json');
    fs.writeFileSync(historyFile, JSON.stringify(this.metricsHistory, null, 2));
  }

  async monitorStats() {
    try {
      const stats = execSync('docker stats --no-stream --format "{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"').toString();
      const timestamp = new Date().toISOString();
      
      const parsedStats = stats.split('\n')
        .filter(Boolean)
        .map(line => {
          const [name, cpu, memory, network] = line.split('\t');
          return { name, cpu, memory, network };
        });

      this.metricsHistory.push({
        timestamp,
        containers: parsedStats
      });

      // Keep last 100 entries only
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-100);
      }

      this.saveMetricsHistory();
      return parsedStats;
    } catch (error) {
      console.error('Error monitoring stats:', error.message);
      return [];
    }
  }

  async watchEvents() {
    const events = spawn('docker', ['events', '--format', '{{json .}}']);
    
    events.stdout.on('data', (data) => {
      const events = data.toString().split('\n').filter(Boolean);
      events.forEach(event => {
        try {
          const eventData = JSON.parse(event);
          this.handleDockerEvent(eventData);
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      });
    });

    events.stderr.on('data', (data) => {
      console.error('Docker events error:', data.toString());
    });

    return events;
  }

  handleDockerEvent(event) {
    const eventFile = path.join(this.dataDir, 'latest-events.json');
    const events = fs.existsSync(eventFile) 
      ? JSON.parse(fs.readFileSync(eventFile, 'utf8')) 
      : [];

    events.unshift({
      timestamp: new Date().toISOString(),
      event
    });

    // Keep last 50 events
    const latestEvents = events.slice(0, 50);
    fs.writeFileSync(eventFile, JSON.stringify(latestEvents, null, 2));
  }

  async checkContainerHealth() {
    try {
      const containers = execSync('docker ps --format "{{.Names}}"').toString().split('\n').filter(Boolean);
      const healthChecks = containers.map(container => {
        try {
          const health = execSync(`docker inspect --format='{{.State.Health.Status}}' ${container}`).toString().trim();
          return { container, health };
        } catch {
          return { container, health: 'unknown' };
        }
      });

      fs.writeFileSync(
        path.join(this.dataDir, 'health-status.json'),
        JSON.stringify(healthChecks, null, 2)
      );

      return healthChecks;
    } catch (error) {
      console.error('Error checking container health:', error.message);
      return [];
    }
  }

  validateComposeConfig() {
    try {
      execSync('docker-compose config');
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      containers: {
        running: 0,
        total: 0,
        health: []
      },
      resources: {
        metrics: this.metricsHistory.slice(-1)[0] || { containers: [] },
        history: this.metricsHistory.length
      },
      compose: this.validateComposeConfig(),
      events: fs.existsSync(path.join(this.dataDir, 'latest-events.json'))
        ? JSON.parse(fs.readFileSync(path.join(this.dataDir, 'latest-events.json'), 'utf8')).slice(0, 5)
        : []
    };

    try {
      const containers = execSync('docker ps -a --format "{{.Names}}\t{{.Status}}"').toString()
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const [name, status] = line.split('\t');
          return { name, status };
        });

      report.containers.total = containers.length;
      report.containers.running = containers.filter(c => c.status.includes('Up')).length;
      report.containers.list = containers;
    } catch (error) {
      console.error('Error getting container list:', error.message);
    }

    return report;
  }
}

// Export the class for use in other scripts
module.exports = WarpDockerMonitor;

// If running directly, start monitoring
if (require.main === module) {
  const monitor = new WarpDockerMonitor();
  
  // Run initial checks
  Promise.all([
    monitor.monitorStats(),
    monitor.checkContainerHealth()
  ]).then(() => {
    const report = monitor.generateReport();
    console.log(JSON.stringify(report, null, 2));
  });

  // Start watching events
  monitor.watchEvents();
}
