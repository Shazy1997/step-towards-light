const fs = require('fs');
const path = require('path');
const contextAggregator = require('../../scripts/context-pipeline/context-aggregator');
const promptEnhancer = require('../../scripts/context-pipeline/prompt-enhancer');

// Mock filesystem operations
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn((path) => {
    if (path.endsWith('package.json')) {
      return JSON.stringify({
        dependencies: {
          'next': '^12.0.0',
          'react': '^17.0.0'
        }
      });
    }
    if (path.endsWith('latest.json')) {
      return JSON.stringify({
        project: {
          mission: {
            primary: "Providing authentic Islamic guidance",
            goals: ["Share knowledge", "Build community"]
          },
          timeline: { 
            current: "Development",
            nextMilestone: "Production"
          },
          features: {
            implemented: ["Feature 1", "Feature 2"],
            inProgress: ["Feature 3"]
          }
        },
        monitoring: { 
          status: 'healthy' 
        },
        technical: {
          implementation: {
            metrics: {
              testCoverage: "70%",
              passingTests: 10
            }
          }
        },
        deployment: {
          environment: "development",
          docker: {
            status: "Running"
          }
        }
      });
    }
    return '{"test": "data"}';
  }),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn((command) => {
    if (command.includes('git log')) return 'test commit message';
    if (command.includes('git branch')) return 'main';
    if (command.includes('docker info')) return 'Docker is running';
    return '';
  })
}));

describe('Context Pipeline', () => {
  describe('Context Aggregator', () => {
    test('aggregates complete context', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context).toHaveProperty('timestamp');
      expect(context).toHaveProperty('project');
      expect(context).toHaveProperty('progress');
      expect(context).toHaveProperty('technical');
      expect(context).toHaveProperty('deployment');
      expect(context).toHaveProperty('monitoring');
    });

    test('includes mission and goals', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context.project.mission.primary).toContain('Islamic guidance');
      expect(Array.isArray(context.project.mission.goals)).toBeTruthy();
    });

    test('tracks implementation progress', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(Array.isArray(context.project.features.implemented)).toBeTruthy();
      expect(Array.isArray(context.project.features.inProgress)).toBeTruthy();
    });

    test('monitors system health', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context.monitoring).toHaveProperty('status');
      expect(context.deployment.docker).toHaveProperty('status');
    });
  });

  describe('Prompt Enhancement', () => {
    test('enhances prompts with context', async () => {
      const basePrompt = "What's our current status?";
      const enhanced = await promptEnhancer.enhancePrompt(basePrompt);
      
      expect(enhanced).toContain('Project Context');
      expect(enhanced).toContain('Islamic guidance');
      expect(enhanced).toContain(basePrompt);
    });

    test('includes mission in enhanced prompts', async () => {
      const basePrompt = "Suggest next steps.";
      const enhanced = await promptEnhancer.enhancePrompt(basePrompt);
      
      expect(enhanced).toContain('Mission:');
      expect(enhanced).toContain('Islamic guidance');
    });

    test('maintains Islamic context in prompts', async () => {
      const basePrompt = "Review our progress.";
      const enhanced = await promptEnhancer.enhancePrompt(basePrompt);
      
      expect(enhanced).toContain('Islamic guidance');
      expect(enhanced).toContain('authentic Islamic knowledge');
    });

    test('includes technical status', async () => {
      const basePrompt = "Check system status.";
      const enhanced = await promptEnhancer.enhancePrompt(basePrompt);
      
      expect(enhanced).toContain('Technical Status');
      expect(enhanced).toContain('Docker Status');
    });
  });

  describe('Context Integration', () => {
    test('integrates technical and mission context', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context.project.mission).toBeDefined();
      expect(context.technical.stack).toBeDefined();
    });

    test('preserves Islamic guidance focus', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context.project.mission.primary).toContain('Islamic guidance');
      expect(context.project.features.implemented).toBeDefined();
    });

    test('maintains development progress', async () => {
      const context = await contextAggregator.aggregateContext();
      
      expect(context.progress.gitStatus).toBeDefined();
      expect(context.technical.implementation).toBeDefined();
    });
  });

  describe('Context Summary Generation', () => {
    test('generates readable summary', async () => {
      await contextAggregator.aggregateContext();
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('SUMMARY.md'),
        expect.stringContaining('Project Context Summary')
      );
    });

    test('includes mission in summary', async () => {
      await contextAggregator.aggregateContext();
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('SUMMARY.md'),
        expect.stringContaining('Mission & Goals')
      );
    });

    test('tracks implementation progress', async () => {
      await contextAggregator.aggregateContext();
      
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('SUMMARY.md'),
        expect.stringContaining('Implementation Progress')
      );
    });
  });
});
