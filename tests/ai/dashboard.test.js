const fs = require('fs');
const path = require('path');
const dashboard = require('../../scripts/ai/dashboard');

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

describe('AI Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Dashboard Generation', () => {
    test('generates complete dashboard structure', async () => {
      const result = await dashboard.generateDashboard();
      
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('metrics');
    });

    test('includes system status', async () => {
      const result = await dashboard.generateDashboard();
      
      expect(result.status).toHaveProperty('overall');
      expect(result.status).toHaveProperty('alerts');
      expect(result.status).toHaveProperty('lastUpdate');
    });

    test('saves dashboard files', async () => {
      await dashboard.generateDashboard();
      
      expect(fs.writeFileSync).toHaveBeenCalledTimes(3); // JSON, latest, and HTML
    });
  });

  describe('Data Collection', () => {
    test('retrieves alert summary', async () => {
      const summary = await dashboard.getAlertsSummary();
      
      expect(summary).toHaveProperty('recent');
      expect(summary).toHaveProperty('bySeverity');
      expect(summary.bySeverity).toHaveProperty('critical');
      expect(summary.bySeverity).toHaveProperty('warning');
    });

    test('gets latest analysis', async () => {
      const analysis = await dashboard.getLatestAnalysis();
      
      expect(Array.isArray(analysis)).toBeTruthy();
      expect(analysis.length).toBeLessThanOrEqual(5);
    });

    test('retrieves performance metrics', async () => {
      const metrics = await dashboard.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('metrics');
      expect(metrics).toHaveProperty('status');
    });
  });

  describe('HTML Generation', () => {
    test('generates valid HTML', async () => {
      const dashboardData = {
        timestamp: new Date().toISOString(),
        status: {
          overall: 'healthy',
          alerts: { critical: 0, warning: 1 }
        },
        alerts: {
          recent: [],
          bySeverity: { critical: [], warning: [], info: [] }
        },
        metrics: { cpu: '45%', memory: '60%' },
        recommendations: []
      };

      await dashboard.generateHTML(dashboardData);
      
      const calls = fs.writeFileSync.mock.calls;
      const htmlCall = calls.find(call => call[0].endsWith('index.html'));
      
      expect(htmlCall).toBeTruthy();
      expect(htmlCall[1]).toContain('<!DOCTYPE html>');
      expect(htmlCall[1]).toContain('AI System Dashboard');
    });
  });
});
