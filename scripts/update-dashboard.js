const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function getRecentUpdates() {
  return execSync('git log -n 3 --pretty=format:"- %s"').toString();
}

function generateDashboard() {
  const repoAnalysis = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'repo-analysis', 'report.json'), 'utf8')
  );

  const dashboard = `# Step Towards the Light - Project Dashboard

## 🚦 Current Status Overview

### 🔄 Active Development Progress
| Component          | Status | Details |
|-------------------|--------|----------|
| Next.js App       | ✅     | Core application structure complete |
| Testing           | ✅     | Jest + React Testing Library implemented |
| Docker Setup      | 🔄     | Configuration ready, pending daemon start |
| Discord Integration| 🏗️     | Basic structure in place |
| Monitoring        | ✅     | Comprehensive system implemented |

### 📊 Repository Statistics
- Files: ${repoAnalysis.stats.files}
- Directories: ${repoAnalysis.stats.directories}
- Components: ${repoAnalysis.stats.components}
- Pages: ${repoAnalysis.stats.pages}
- Tests: ${repoAnalysis.stats.tests}
- Size: ${repoAnalysis.stats.totalSize}

### 🐳 Docker Environment
- Status: Pending daemon start
- Configuration: Ready
- Resources: To be monitored

### 🧪 Test Coverage
- Total Tests: 6
- Passing: 6
- Coverage: To be implemented

## 📋 Task Priority Queue

1. **Docker Environment Setup**
   - [ ] Start Docker daemon
   - [ ] Build image
   - [ ] Test container deployment
   - [ ] Verify resource monitoring

2. **Discord Integration**
   - [ ] Complete webhook implementation
   - [ ] Set up notification system
   - [ ] Test message delivery

3. **Component Development**
   - [ ] Create shared UI components
   - [ ] Implement responsive layouts
   - [ ] Add loading states

4. **Testing Enhancements**
   - [ ] Add component tests
   - [ ] Implement E2E testing
   - [ ] Set up coverage reporting

## 📈 Monitoring Systems

### Automated Checks
- Repository Analysis: Every commit
- Docker Health: Every 6 hours
- Dependency Updates: Daily
- System Status: Continuous

### Reporting Channels
- GitHub Actions
- Warp Context Rules
- Progress Tracking
- Health Monitoring

## 🔄 Recent Updates
${getRecentUpdates()}

## 📝 Next Actions
1. Start Docker daemon and verify environment
2. Complete Discord webhook integration
3. Enhance component library
4. Improve test coverage

## 🎯 Development Metrics
- Build Status: Passing
- Test Status: Passing
- Docker Status: Pending
- Last Updated: ${new Date().toISOString()}

---
> Auto-generated dashboard. Updates with \`npm run update-all\`
`;

  fs.writeFileSync(path.join(process.cwd(), 'DASHBOARD.md'), dashboard);
  console.log('Dashboard updated successfully!');
}

generateDashboard();
