const fs = require('fs');
const path = require('path');
const alertManager = require('../../scripts/ai/alert-manager');
const reporter = require('../../scripts/ai/reporter');

// Mock filesystem operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => JSON.stringify({
    metrics: { cpu: '45%', memory: '60%' },
    status: 'active'
  })),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(() => ['analysis_1.json', 'analysis_2.json'])
}));

describe('AI Alert and Reporting System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Alert Manager', () => {
    test('creates alert with correct severity', () => {
      const analysis = {
        metrics: {
          cpu: '90%',
          memory: '85%'
        },
        assessment: 'High resource usage detected'
      };

      const alert = alertManager.createAlert(analysis);
      
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('severity', 'critical');
      expect(alert).toHaveProperty('timestamp');
      expect(alert).toHaveProperty('status', 'new');
    });

    test('determines correct alert type', () => {
      const cpuAlert = alertManager.determineAlertType({
        metrics: { cpu: '90%' }
      });
      expect(cpuAlert).toBe('cpu_usage');

      const memoryAlert = alertManager.determineAlertType({
        metrics: { memory: '85%' }
      });
      expect(memoryAlert).toBe('memory_usage');
    });

    test('processes alerts correctly', async () => {
      const analysis = {
        metrics: {
          cpu: '90%',
          memory: '85%'
        },
        assessment: 'High resource usage detected'
      };

      const alert = await alertManager.processAlert(analysis);
      
      expect(alert).toHaveProperty('severity', 'critical');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('AI Reporter', () => {
    test('generates daily report', async () => {
      const report = await reporter.generateDailyReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('period', 'daily');
      expect(report).toHaveProperty('alerts');
      expect(report).toHaveProperty('analysis');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('status');
    });

    test('determines correct system status', async () => {
      const monitoring = {
        status: 'active',
        metrics: { cpu: '45%', memory: '60%' }
      };
      
      const criticalAlerts = [{ severity: 'critical' }];
      expect(reporter.determineStatus(monitoring, criticalAlerts))
        .toBe('critical');

      const warningAlerts = [{ severity: 'warning' }];
      expect(reporter.determineStatus(monitoring, warningAlerts))
        .toBe('warning');

      const noAlerts = [];
      expect(reporter.determineStatus(monitoring, noAlerts))
        .toBe('healthy');
    });

    test('generates alerts summary', async () => {
      const summary = await reporter.getAlertsSummary();
      
      expect(summary).toHaveProperty('total');
      expect(summary).toHaveProperty('bySeverity');
      expect(summary.bySeverity).toHaveProperty('critical');
      expect(summary.bySeverity).toHaveProperty('warning');
      expect(summary.bySeverity).toHaveProperty('info');
    });
  });
});
