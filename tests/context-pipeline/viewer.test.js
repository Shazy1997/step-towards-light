const blessed = require('blessed');
const ContextViewer = require('../../scripts/context-pipeline/context-viewer');

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

describe('Context Viewer', () => {
  let viewer;

  beforeEach(() => {
    viewer = new ContextViewer();
  });

  test('creates layout with all sections', () => {
    expect(blessed.box).toHaveBeenCalledWith(
      expect.objectContaining({
        label: ' Mission & Goals '
      })
    );
    expect(blessed.box).toHaveBeenCalledWith(
      expect.objectContaining({
        label: ' Implementation Progress '
      })
    );
    expect(blessed.box).toHaveBeenCalledWith(
      expect.objectContaining({
        label: ' Technical Status '
      })
    );
    expect(blessed.box).toHaveBeenCalledWith(
      expect.objectContaining({
        label: ' Recent Updates '
      })
    );
  });

  test('binds keyboard commands', () => {
    expect(blessed.screen().key).toHaveBeenCalledWith(
      ['q', 'C-c'],
      expect.any(Function)
    );
    expect(blessed.screen().key).toHaveBeenCalledWith(
      'r',
      expect.any(Function)
    );
    expect(blessed.screen().key).toHaveBeenCalledWith(
      'u',
      expect.any(Function)
    );
    expect(blessed.screen().key).toHaveBeenCalledWith(
      'h',
      expect.any(Function)
    );
  });

  test('starts automatic updates', () => {
    jest.useFakeTimers();
    const viewer = new ContextViewer();
    
    expect(setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      5 * 60 * 1000
    );
  });

  test('shows help information', () => {
    viewer.showHelp();
    
    expect(viewer.commandBox.setContent).toHaveBeenCalledWith(
      expect.stringContaining('Help Information')
    );
  });

  test('handles errors gracefully', () => {
    const error = new Error('Test error');
    viewer.showError(error);
    
    expect(viewer.commandBox.setContent).toHaveBeenCalledWith(
      expect.stringContaining('ERROR: Test error')
    );
  });
});
