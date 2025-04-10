const { getSystemStatus } = require('../scripts/status');
const contextAggregator = require('../scripts/context-pipeline/context-aggregator');

// Mock context aggregator
jest.mock('../scripts/context-pipeline/context-aggregator', () => ({
  aggregateContext: jest.fn().mockResolvedValue({
    project: {
      mission: {
        primary: "Providing authentic Islamic guidance",
        goals: ["Share knowledge", "Build community"]
      },
      features: {
        implemented: ["content", "monitoring"],
        inProgress: ["discord", "e-commerce"]
      }
    },
    monitoring: {
      status: "healthy",
      alerts: []
    },
    deployment: {
      environment: "development",
      docker: { status: "running" }
    },
    technical: {
      implementation: {
        metrics: {
          passingTests: 24,
          testCoverage: "70%"
        }
      }
    },
    progress: {
      gitStatus: {
        recentChanges: ["feat: Add new feature", "fix: Fix bug"]
      }
    }
  })
}));

// Mock console.log to capture output
const mockLog = jest.fn();
console.log = mockLog;

describe('Status Command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays mission and goals', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Providing authentic Islamic guidance')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Share knowledge')
    );
  });

  test('shows implementation status', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('content')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('monitoring')
    );
  });

  test('displays technical status', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('HEALTHY')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('70%')
    );
  });

  test('shows content management status', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('YouTube Integration')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Written Khutbahs')
    );
  });

  test('displays community status', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Discord Integration')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('User Participation')
    );
  });

  test('shows available actions', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('npm run dashboard')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('npm run context:view')
    );
  });

  test('lists documentation', async () => {
    await getSystemStatus();
    
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('DASHBOARD_GUIDE.md')
    );
    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('CONTEXT_VIEWER_GUIDE.md')
    );
  });
});
