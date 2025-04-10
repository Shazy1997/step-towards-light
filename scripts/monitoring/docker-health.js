const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DockerHealthCheck {
  constructor() {
    this.healthData = {
      timestamp: new Date().toISOString(),
      docker: {
        status: 'unknown',
        version: null,
        daemon: false
      },
      containers: {
        running: 0,
        status: {},
        resources: {}
      },
      build: {
        lastBuild: null,
        buildTime: null,
        status: 'unknown'
      }
    };
  }

  async checkDockerStatus() {
    try {
      const dockerVersion = execSync('docker --version').toString().trim();
      this.healthData.docker.version = dockerVersion;
      this.healthData.docker.status = 'active';
      this.healthData.docker.daemon = true;
    } catch (error) {
      this.healthData.docker.status = 'inactive';
      this.healthData.docker.daemon = false;
      console.error('Docker daemon is not running:', error.message);
    }
  }

  async checkContainers() {
    if (!this.healthData.docker.daemon) return;

    try {
      const containers = execSync('docker ps -a --format "{{.Names}},{{.Status}}"').toString().trim();
      if (containers) {
        containers.split('\n').forEach(container => {
          const [name, status] = container.split(',');
          this.healthData.containers.status[name] = status;
          if (status.includes('Up')) {
            this.healthData.containers.running++;
          }
        });
      }

      // Get resource usage for running containers
      Object.keys(this.healthData.containers.status).forEach(name => {
        try {
          const stats = execSync(`docker stats ${name} --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.NetIO}}"`).toString().trim();
          const [cpu, memory, network] = stats.split(',');
          this.healthData.containers.resources[name] = { cpu, memory, network };
        } catch (error) {
          console.warn(`Could not get stats for container ${name}`);
        }
      });
    } catch (error) {
      console.error('Error checking containers:', error.message);
    }
  }

  async generateReport() {
    await this.checkDockerStatus();
    await this.checkContainers();

    const report = {
      markdown: `## Docker Environment Status
Last Updated: ${this.healthData.timestamp}

### Docker Status
- Daemon: ${this.healthData.docker.daemon ? '✅ Running' : '❌ Not Running'}
- Version: ${this.healthData.docker.version || 'N/A'}

### Containers
- Running: ${this.healthData.containers.running}
${Object.entries(this.healthData.containers.status)
  .map(([name, status]) => `- ${name}: ${status}`)
  .join('\n')}

### Resource Usage
${Object.entries(this.healthData.containers.resources)
  .map(([name, stats]) => `
#### ${name}
- CPU: ${stats.cpu}
- Memory: ${stats.memory}
- Network I/O: ${stats.network}`)
  .join('\n')}
`,
      json: this.healthData
    };

    return report;
  }
}

async function updateMonitoringStatus() {
  const healthCheck = new DockerHealthCheck();
  const report = await healthCheck.generateReport();

  // Save JSON report
  fs.writeFileSync(
    path.join(__dirname, 'docker-status.json'),
    JSON.stringify(report.json, null, 2)
  );

  // Update main progress tracking
  const currentProgress = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'repo-analysis', 'report.json'), 'utf8')
  );

  currentProgress.docker = report.json;

  fs.writeFileSync(
    path.join(__dirname, '..', 'repo-analysis', 'report.json'),
    JSON.stringify(currentProgress, null, 2)
  );

  // Add Docker status to PROGRESS.md
  const progressPath = path.join(process.cwd(), 'PROGRESS.md');
  let progressContent = fs.readFileSync(progressPath, 'utf8');
  
  // Add Docker section if it doesn't exist
  if (!progressContent.includes('### Docker Status')) {
    progressContent += '\n' + report.markdown;
    fs.writeFileSync(progressPath, progressContent);
  }

  console.log('Docker health check completed and reports updated.');
  return report;
}

if (require.main === module) {
  updateMonitoringStatus().catch(console.error);
}

module.exports = { DockerHealthCheck, updateMonitoringStatus };
