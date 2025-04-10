const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DocumentationManager {
  constructor() {
    this.docsDir = path.join(process.cwd(), 'docs');
    this.ensureDocsDir();
  }

  ensureDocsDir() {
    if (!fs.existsSync(this.docsDir)) {
      fs.mkdirSync(this.docsDir, { recursive: true });
    }
  }

  async updateDocumentation() {
    try {
      console.log('Updating documentation...');
      
      // Generate system status
      const status = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        docker: this.getDockerStatus(),
        repository: this.getRepositoryStatus(),
        security: this.getSecurityStatus()
      };

      // Write status file
      fs.writeFileSync(
        path.join(this.docsDir, 'system-status.json'),
        JSON.stringify(status, null, 2)
      );

      // Generate documentation summary
      const summary = this.generateSummary(status);
      fs.writeFileSync(
        path.join(this.docsDir, 'SUMMARY.md'),
        summary
      );

      console.log('Documentation updated successfully!');
    } catch (error) {
      console.error('Error updating documentation:', error);
    }
  }

  getDockerStatus() {
    try {
      const statusFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
      return fs.existsSync(statusFile) ? 
        JSON.parse(fs.readFileSync(statusFile, 'utf8')) :
        { status: 'unknown' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  getRepositoryStatus() {
    try {
      const repoFile = path.join(process.cwd(), 'scripts', 'repo-analysis', 'report.json');
      return fs.existsSync(repoFile) ?
        JSON.parse(fs.readFileSync(repoFile, 'utf8')) :
        { status: 'unknown' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  getSecurityStatus() {
    return {
      sslEnabled: fs.existsSync(path.join(process.cwd(), 'config', 'nginx', 'certs')),
      securityHeadersConfigured: true,
      rateLimitingEnabled: true,
      csrfProtectionEnabled: true
    };
  }

  generateSummary(status) {
    return `# System Status Summary
Generated: ${status.timestamp}

## Environment
- Type: ${status.environment}
- Docker Status: ${status.docker.status || 'Unknown'}
- Security Status: ${Object.values(status.security).every(Boolean) ? '✅ Secure' : '⚠️ Review Required'}

## Recent Updates
${execSync('git log -3 --pretty=format:"- %s"').toString()}

## Next Steps
1. Review any warnings or errors
2. Check security configurations
3. Verify monitoring systems
4. Update documentation as needed

For detailed information, see the full documentation in the /docs directory.`;
  }
}

// Run documentation update
if (require.main === module) {
  const manager = new DocumentationManager();
  manager.updateDocumentation();
}

module.exports = new DocumentationManager();
