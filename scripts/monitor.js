const ai = require('./ai/llama_integration');
const alertManager = require('./ai/alert-manager');
const reporter = require('./ai/reporter');
const dashboard = require('./ai/dashboard');

class SystemMonitor {
  constructor() {
    this.running = false;
    this.interval = 5 * 60 * 1000; // 5 minutes
  }

  async start() {
    if (this.running) {
      console.log('Monitoring already running');
      return;
    }

    console.log('Starting system monitoring...');
    this.running = true;

    while (this.running) {
      try {
        await this.runMonitoringCycle();
        await this.sleep(this.interval);
      } catch (error) {
        console.error('Error in monitoring cycle:', error);
        // Continue monitoring despite errors
      }
    }
  }

  stop() {
    console.log('Stopping system monitoring...');
    this.running = false;
  }

  async runMonitoringCycle() {
    console.log('\nStarting monitoring cycle at:', new Date().toISOString());

    try {
      // Generate system context
      const context = await ai.generateSystemContext();
      
      // Run AI analysis
      const analysis = await ai.analyze(JSON.stringify(context));
      
      // Process any alerts
      if (this.shouldGenerateAlert(analysis)) {
        await alertManager.processAlert(analysis);
      }

      // Generate reports
      await reporter.generateDailyReport();
      
      // Update dashboard
      await dashboard.generateDashboard();

      console.log('Monitoring cycle completed successfully');
    } catch (error) {
      console.error('Error in monitoring cycle:', error);
      // Create alert for monitoring failure
      await alertManager.processAlert({
        type: 'system_error',
        severity: 'critical',
        details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  shouldGenerateAlert(analysis) {
    try {
      const data = JSON.parse(analysis);
      return data.risks && data.risks.length > 0;
    } catch {
      return false;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create monitoring instance
const monitor = new SystemMonitor();

// Handle process signals
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Stopping monitoring...');
  monitor.stop();
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Stopping monitoring...');
  monitor.stop();
});

// Export monitor
module.exports = monitor;

// Start monitoring if run directly
if (require.main === module) {
  monitor.start().catch(console.error);
}
