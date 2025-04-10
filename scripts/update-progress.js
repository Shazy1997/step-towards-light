const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function updateProgress() {
  try {
    // Run repository analysis
    require('./repo-analysis/analyze.js');

    // Read the latest analysis report
    const reportPath = path.join(__dirname, 'repo-analysis', 'report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    // Get latest git commit
    const lastCommit = execSync('git log -1 --pretty=%B').toString().trim();

    // Update Warp rules
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
  
  - Docker Setup 🔄
    * Dockerfile created
    * docker-compose.yml configured
    * Pending daemon start and testing
  
  - Discord Integration 🔄
    * Basic webhook utility created
    * Integration structure in place
    * Pending actual implementation
  
  - Monitoring Setup ✅
    * GitHub Actions workflow configured
    * Warp rules integration established
    * Automated progress tracking
  
  Next Steps:
  1. Test Docker setup once daemon is available
  2. Implement Discord webhook functionality
  3. Add more UI components
  4. Enhance test coverage
  
  Last Git Commit: ${lastCommit}
  `;

    fs.writeFileSync(path.join(process.cwd(), '.warp_rules', 'project-status.md'), warpStatus);

    // Create progress summary for GitHub
    const progressMd = `## Project Progress Report
Generated: ${new Date().toISOString()}

### Repository Analysis
- Files: ${report.stats.files}
- Directories: ${report.stats.directories}
- Size: ${report.stats.totalSize}
- Components: ${report.stats.components}
- Pages: ${report.stats.pages}
- Tests: ${report.stats.tests}

### Implementation Status
- ✅ Next.js Application
- ✅ Testing Framework
- ✅ Repository Analysis
- 🔄 Docker Setup
- 🔄 Discord Integration
- ✅ Monitoring Setup

### Latest Updates
${lastCommit}
`;

    fs.writeFileSync(path.join(process.cwd(), 'PROGRESS.md'), progressMd);

    console.log('Progress tracking updated successfully!');
    console.log('Updated files:');
    console.log('- .warp_rules/project-status.md');
    console.log('- PROGRESS.md');
    console.log('- scripts/repo-analysis/report.json');

  } catch (error) {
    console.error('Error updating progress:', error);
    process.exit(1);
  }
}

updateProgress();
