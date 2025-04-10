const fs = require('fs');
const path = require('path');

function updateDashboardWithDocker() {
  const dashboardPath = path.join(process.cwd(), 'DASHBOARD.md');
  let dashboard = fs.readFileSync(dashboardPath, 'utf8');

  // Add Docker monitoring section
  const dockerSection = `
### 🔍 Docker Monitoring
- Real-time metrics tracking
- Container health checks
- Event monitoring
- Resource usage history
- Custom command shortcuts
- Automated alerts

### 📊 Available Commands
- \`npm run docker:monitor\`: Start monitoring
- \`npm run docker:stats\`: View container stats
- \`npm run docker:logs\`: View container logs
- \`npm run docker:status\`: Check container status
- \`npm run docker:events\`: Watch Docker events
- \`npm run docker:validate\`: Validate compose config
- \`npm run docker:all\`: View all container info`;

  // Insert after Monitoring Systems section
  dashboard = dashboard.replace(
    '## 📈 Monitoring Systems',
    '## 📈 Monitoring Systems' + dockerSection
  );

  fs.writeFileSync(dashboardPath, dashboard);
  console.log('Dashboard updated with Docker monitoring information');
}

updateDashboardWithDocker();
