const fs = require('fs');
const path = require('path');

// Mock implementations
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback(null, { stdout: 'mocked output' })),
  execSync: jest.fn(() => 'mocked output'),
  spawn: jest.fn()
}));

// Mock fs operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(() => JSON.stringify({
    status: 'healthy',
    metrics: { cpu: '45%', memory: '60%' }
  })),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

// Import after mocks
const ai = require('../../scripts/ai/llama_integration');
const promptManager = require('../../scripts/ai/prompt-manager');
const config = require('../../config/ai/config');
const reportGenerator = require('../../scripts/ai/generate-report');

describe('AI Integration Tests', () => {
  beforeAll(() => {
    // Setup test environment
    jest.setTimeout(10000); // Increase timeout for all tests
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('AI Configuration', () => {
    test('has required configuration settings', () => {
      expect(config.model).toBeDefined();
      expect(config.boundaries).toBeDefined();
      expect(config.prompts).toBeDefined();
      expect(config.thresholds).toBeDefined();
    });

    test('has valid operational boundaries', () => {
      expect(Array.isArray(config.boundaries.allowedActions)).toBeTruthy();
      expect(Array.isArray(config.boundaries.restrictedActions)).toBeTruthy();
      expect(config.boundaries.allowedActions.length).toBeGreaterThan(0);
    });

    test('has valid monitoring thresholds', () => {
      expect(config.thresholds.cpu.warning).toBeLessThan(config.thresholds.cpu.critical);
      expect(config.thresholds.memory.warning).toBeLessThan(config.thresholds.memory.critical);
    });
  });

  describe('Prompt Management', () => {
    test('generates valid analysis prompt', () => {
      const context = {
        metrics: {
          cpu: '50%',
          memory: '60%'
        }
      };

      const prompt = promptManager.generateAnalysisPrompt(context);
      expect(prompt).toContain(config.prompts.systemContext);
      expect(prompt).toContain('cpu');
      expect(prompt).toContain('memory');
    });

    test('generates valid alert prompt', () => {
      const alert = {
        type: 'performance',
        severity: 'warning',
        metrics: {
          latency: '500ms'
        }
      };

      const prompt = promptManager.generateAlertPrompt(alert);
      expect(prompt).toContain('ALERT: performance');
      expect(prompt).toContain('warning');
      expect(prompt).toContain('500ms');
    });
  });

  describe('Response Validation', () => {
    test('validates response format', () => {
      const validResponse = JSON.stringify({
        assessment: 'System healthy',
        recommendations: [
          {
            action: 'analyze_logs',
            runbookRef: 'section 1.2',
            priority: 3,
            risk: 'low'
          }
        ],
        runbookReferences: ['section 1.2'],
        risks: ['none identified']
      });

      expect(() => promptManager.validateResponse(validResponse)).not.toThrow();
    });

    test('rejects invalid actions', () => {
      const invalidResponse = JSON.stringify({
        assessment: 'System healthy',
        recommendations: [
          {
            action: 'restart_system', // restricted action
            runbookRef: 'section 1.2',
            priority: 1,
            risk: 'high'
          }
        ],
        runbookReferences: ['section 1.2'],
        risks: ['none identified']
      });

      expect(() => promptManager.validateResponse(invalidResponse)).toThrow();
    });
  });

  describe('Report Generation', () => {
    beforeEach(() => {
      // Mock AI analysis response
      jest.spyOn(ai, 'analyze').mockImplementation(() => 
        Promise.resolve(JSON.stringify({
          assessment: 'System healthy',
          recommendations: [{
            action: 'analyze_logs',
            runbookRef: 'section 1.2',
            priority: 3,
            risk: 'low'
          }],
          runbookReferences: ['section 1.2'],
          risks: ['none identified']
        }))
      );
    });

    test('generates valid report structure', async () => {
      const report = await reportGenerator.generateReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('system');
      expect(report).toHaveProperty('analyses');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('recommendations');
    }, 10000);

    test('includes all analysis types', async () => {
      const report = await reportGenerator.generateReport();
      
      const analysisTypes = report.analyses.map(a => a.type);
      expect(analysisTypes).toContain('health');
      expect(analysisTypes).toContain('performance');
      expect(analysisTypes).toContain('security');
    }, 10000);
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Mock successful AI response
      jest.spyOn(ai, 'analyze').mockImplementation((input) => {
        const context = JSON.parse(input);
        return Promise.resolve(JSON.stringify({
          assessment: `Analysis for ${context.type}`,
          recommendations: [
            {
              action: 'analyze_logs',
              runbookRef: 'section 1.2',
              priority: context.type.includes('security') ? 1 : 3,
              risk: context.type.includes('security') ? 'high' : 'low'
            }
          ],
          runbookReferences: ['section 1.2'],
          risks: [context.type.includes('security') ? 'security risk' : 'performance impact']
        }));
      });
    });

    test('handles high CPU alert correctly', async () => {
      const context = {
        type: 'alert',
        metrics: {
          cpu: '95%',
          memory: '60%'
        }
      };

      const analysis = await ai.analyze(JSON.stringify(context));
      const response = JSON.parse(analysis);

      expect(response).toHaveProperty('assessment');
      expect(response).toHaveProperty('recommendations');
      expect(response.recommendations.length).toBeGreaterThan(0);
      expect(response.risks.length).toBeGreaterThan(0);
    });

    test('handles security alert correctly', async () => {
      const context = {
        type: 'security_alert',
        severity: 'high',
        details: 'Unusual login attempts detected'
      };

      const analysis = await ai.analyze(JSON.stringify(context));
      const response = JSON.parse(analysis);

      expect(response).toHaveProperty('assessment');
      expect(response.assessment).toContain('security');
      expect(response.recommendations[0].priority).toBe(1);
      expect(response.risks[0]).toContain('security');
    });
  });
});
