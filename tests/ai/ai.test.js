const fs = require('fs');
const path = require('path');

// Mock Ollama API calls
jest.mock('child_process', () => ({
  exec: jest.fn(),
  execSync: jest.fn(),
  spawn: jest.fn()
}));

// Import after mocks
const ai = require('../../scripts/ai/llama_integration');
const promptManager = require('../../scripts/ai/prompt-manager');
const config = require('../../config/ai/config');
const reportGenerator = require('../../scripts/ai/generate-report');

describe('AI Integration Tests', () => {
  beforeAll(() => {
    // Create necessary directories for testing
    const dirs = [
      path.join(process.cwd(), 'logs'),
      path.join(process.cwd(), 'analysis'),
      path.join(process.cwd(), 'reports', 'ai')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
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
    test('generates valid report structure', async () => {
      // Mock AI response
      const mockAnalysis = {
        assessment: 'System healthy',
        recommendations: [],
        runbookReferences: [],
        risks: []
      };
      
      jest.spyOn(ai, 'analyze').mockResolvedValue(JSON.stringify(mockAnalysis));
      
      const report = await reportGenerator.generateReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('system');
      expect(report).toHaveProperty('analyses');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('recommendations');
    });

    test('includes all analysis types', async () => {
      // Mock AI response
      const mockAnalysis = {
        assessment: 'System healthy',
        recommendations: [],
        runbookReferences: [],
        risks: []
      };
      
      jest.spyOn(ai, 'analyze').mockResolvedValue(JSON.stringify(mockAnalysis));
      
      const report = await reportGenerator.generateReport();
      
      const analysisTypes = report.analyses.map(a => a.type);
      expect(analysisTypes).toContain('health');
      expect(analysisTypes).toContain('performance');
      expect(analysisTypes).toContain('security');
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Mock successful AI response
      const mockResponse = {
        assessment: 'Analysis complete',
        recommendations: [
          {
            action: 'analyze_logs',
            runbookRef: 'section 1.2',
            priority: 1,
            risk: 'medium'
          }
        ],
        runbookReferences: ['section 1.2'],
        risks: ['potential resource constraint']
      };
      
      jest.spyOn(ai, 'analyze').mockResolvedValue(JSON.stringify(mockResponse));
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
      expect(response).toHaveProperty('recommendations');
      expect(response.recommendations.length).toBeGreaterThan(0);
    });
  });
});
