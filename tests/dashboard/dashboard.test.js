const blessed = require('blessed');
const DashboardManager = require('../../scripts/dashboard');
const contextAggregator = require('../../scripts/context-pipeline/context-aggregator');

// Mock blessed
jest.mock('blessed', () => ({
  screen: jest.fn(() => ({
    append: jest.fn(),
    key: jest.fn(),
    render: jest.fn()
  })),
  box: jest.fn(() => ({
    setContent: jest.fn(),
    append: jest.fn()
  }))
}));

// Mock context aggregator
jest.mock('../../scripts/context-pipeline/context-aggregator', () => ({
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

describe('Platform Dashboard', () => {
  let dashboard;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboard = new DashboardManager();
  });

  describe('Layout Creation', () => {
    test('creates all dashboard sections', () => {
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({ label: ' Platform Mission ' })
      );
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({ label: ' Content Management ' })
      );
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({ label: ' Community Engagement ' })
      );
      expect(blessed.box).toHaveBeenCalledWith(
        expect.objectContaining({ label: ' Technical Status ' })
      );
    });

    test('sets up interactive elements', () => {
      expect(blessed.screen().key).toHaveBeenCalledWith(
        ['q', 'C-c'],
        expect.any(Function)
      );
      expect(blessed.screen().key).toHaveBeenCalledWith(
        'r',
        expect.any(Function)
      );
    });
  });

  describe('Dashboard Updates', () => {
    test('updates mission status', async () => {
      await dashboard.updateDashboard();
      
      expect(dashboard.missionBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Providing authentic Islamic guidance')
      );
    });

    test('updates content status', async () => {
      await dashboard.updateDashboard();
      
      expect(dashboard.contentBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Content Types')
      );
    });

    test('updates community status', async () => {
      await dashboard.updateDashboard();
      
      expect(dashboard.communityBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Community Features')
      );
    });

    test('updates technical status', async () => {
      await dashboard.updateDashboard();
      
      expect(dashboard.technicalBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('System Health')
      );
    });
  });

  describe('User Interaction', () => {
    test('shows help information', () => {
      dashboard.showHelp();
      
      expect(dashboard.actionsBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Help Information')
      );
    });

    test('shows documentation list', () => {
      dashboard.showDocumentation();
      
      expect(dashboard.actionsBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('Available Documentation')
      );
    });

    test('handles errors gracefully', () => {
      const error = new Error('Test error');
      dashboard.showError(error);
      
      expect(dashboard.actionsBox.setContent).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error')
      );
    });
  });

  describe('Status Indicators', () => {
    test('provides correct status emojis', () => {
      expect(dashboard.getStatusEmoji(true)).toBe('✅');
      expect(dashboard.getStatusEmoji(false)).toBe('🔄');
    });

    test('formats alerts properly', () => {
      const alerts = [
        { severity: 'critical', message: 'Test alert' }
      ];
      
      const formatted = dashboard.formatAlerts(alerts);
      expect(formatted).toContain('[CRITICAL]');
      expect(formatted).toContain('Test alert');
    });
  });
});
