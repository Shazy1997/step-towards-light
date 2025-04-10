// Extend default timeout
jest.setTimeout(10000);

// Mock implementations
jest.mock('child_process', () => ({
  exec: jest.fn((cmd, callback) => callback(null, { stdout: 'mocked output' })),
  execSync: jest.fn(() => 'mocked output'),
  spawn: jest.fn()
}));

// Set test environment
process.env.NODE_ENV = 'test';
