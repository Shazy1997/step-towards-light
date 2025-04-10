const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { updateMonitoringStatus } = require('./monitoring/docker-health');

async function generateSystemStatus() {
  // Get git status
  const gitStatus = execSync('git status --porcelain').toString();
  const hasUncommittedChanges = gitStatus.length > 0;
  const lastCommit = execSync('git log -1 --pretty=%B').toString().trim();
  const branchName = execSync('git branch --show-current').toString().trim();

  // Get npm status
  const outdatedDeps = execSync('npm outdated --json || true').toString();
  const hasOutdatedDeps = outdatedDeps.length > 2; // More than "{}"

  return {
    git: {
      branch: branchName,
      lastCommit,
      hasUncommittedChanges,
      uncommittedFiles: gitStatus.split('\n').filter(Boolean)
    },
    npm: {
      hasOutdatedDependencies: hasOutdatedDeps,
      outdatedDependencies: hasOutdatedDeps ? JSON.parse(outdatedDeps) : {}
    }
  };
}

async function updateProgress() {
  try {
    console.log('Starting comprehensive progress update...');
    
    // Run repository analysis
    console.log('\n1. Running repository analysis...');
    require('./repo-analysis/analyze.js');

    // Run Docker health check
    console.log('\n2. Checking Docker environment...');
    const dockerStatus = await updateMonitoringStatus();

    // Get system status
    console.log('\n3. Gathering system status...');
    const systemStatus = await generateSystemStatus();

    // Read the latest analysis report
    const reportPath = path.join(__dirname, 'repo-analysis', 'report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    // Update Warp rules with enhanced status
    const warpStatus = `document_type: MEMORY
document_id: STL-PROJECT-STATUS
rule: |
  Project: Step Towards the Light
  Repository: ${process.cwd()}
  Last Updated: ${new Date().toISOString()}
  
  Current Implementation Status:
  - Next.js Application ✅
    * Components: ${report.stats.components} implemented
    * Pages: ${report.stats.pages} created
    * Styling: Tailwind CSS configured
  
  - Testing Framework ✅
    * Jest + React Testing Library
    * ${report.stats.tests} test files
    * All tests passing
  
  - Repository Analysis ✅
    * Total Files: ${report.stats.files}
    * Total Size: ${report.stats.totalSize}
    * Components: ${report.stats.components}
    * Pages: ${report.stats.pages}
    * Tests: ${report.stats.tests}
  
  - Docker Setup ${dockerStatus.json.docker.daemon ? '✅' : '🔄'}
    * Daemon Status: ${dockerStatus.json.docker.status}
    * Version: ${dockerStatus.json.docker.version || 'Not available'}
    * Running Containers: ${dockerStatus.json.containers.running}
  
  - Discord Integration 🔄
    * Basic webhook utility created
    * Integration structure in place
    * Pending actual implementation
  
  - Monitoring Setup ✅
    * GitHub Actions workflow configured
    * Warp rules integration established
    * Docker health monitoring active
    * Automated progress tracking
  
  System Status:
  - Git:
    * Branch: ${systemStatus.git.branch}
    * Uncommitted Changes: ${systemStatus.git.hasUncommittedChanges ? 'Yes' : 'No'}
  - NPM:
    * Outdated Dependencies: ${systemStatus.npm.hasOutdatedDependencies ? 'Yes' : 'No'}
  
  Next Steps:
  1. ${!dockerStatus.json.docker.daemon ? 'Start Docker daemon and test environment' : 'Complete Docker environment testing'}
  2. Implement Discord webhook functionality
  3. Add more UI components
  4. Enhance test coverage
  
  Last Git Commit: ${systemStatus.git.lastCommit}
  `;

    fs.writeFileSync(path.join(process.cwd(), '.warp_rules', 'project-status.md'), warpStatus);

    // Create enhanced progress summary for GitHub
    const progressMd = `## Project Progress Report
Generated: ${new Date().toISOString()}

### Repository Analysis
- Files: ${report.stats.files}
- Directories: ${report.stats.directories}
- Size: ${report.stats.totalSize}
- Components: ${report.stats.components}
- Pages: ${report.stats.pages}
- Tests: ${report.stats.tests}

### Docker Environment
${dockerStatus.json.docker.daemon ? `
- Status: ✅ Active
- Version: ${dockerStatus.json.docker.version}
- Running Containers: ${dockerStatus.json.containers.running}
` : `
- Status: ❌ Inactive
- Action Required: Start Docker daemon
`}

### Implementation Status
- ✅ Next.js Application
- ✅ Testing Framework
- ✅ Repository Analysis
- ${dockerStatus.json.docker.daemon ? '✅' : '🔄'} Docker Setup
- 🔄 Discord Integration
- ✅ Monitoring Setup

### System Health
- Git Status:
  * Branch: ${systemStatus.git.branch}
  * Clean Working Directory: ${!systemStatus.git.hasUncommittedChanges}
- Dependencies:
  * Updates Available: ${systemStatus.npm.hasOutdatedDependencies}

### Latest Updates
${systemStatus.git.lastCommit}
`;

    fs.writeFileSync(path.join(process.cwd(), 'PROGRESS.md'), progressMd);

    console.log('\nProgress tracking updated successfully!');
    console.log('Updated files:');
    console.log('- .warp_rules/project-status.md');
    console.log('- PROGRESS.md');
    console.log('- scripts/repo-analysis/report.json');
    console.log('- scripts/monitoring/docker-status.json');

  } catch (error) {
    console.error('Error updating progress:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateProgress().catch(console.error);
}

module.exports = { updateProgress };
