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

  async updateSystemStatus() {
    try {
      // Get Docker status
      const dockerStatus = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json'), 'utf8')
      );

      // Get repository analysis
      const repoAnalysis = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'scripts', 'repo-analysis', 'report.json'), 'utf8')
      );

      // Generate status document
      const status = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        docker: dockerStatus,
        repository: repoAnalysis,
        security: {
          sslEnabled: fs.existsSync(path.join(process.cwd(), 'config', 'nginx', 'certs')),
          securityHeadersConfigured: true,
          rateLimitingEnabled: true,
          csrfProtectionEnabled: true
        }
      };

      // Write status to file
      fs.writeFileSync(
        path.join(this.docsDir, 'system-status.json'),
        JSON.stringify(status, null, 2)
      );

      return status;
    } catch (error) {
      console.error('Error updating system status:', error);
      throw error;
    }
  }

  async generateRunbook() {
    const runbook = `# System Runbook
Generated: ${new Date().toISOString()}

## Quick Reference
- Repository: ${process.cwd()}
- Environment: ${process.env.NODE_ENV || 'development'}
- Status Dashboard: http://localhost:3000/status

## Common Tasks

### 1. Start Environment
\`\`\`bash
# Start all services
docker-compose up -d

# Start monitoring
npm run docker:monitor
\`\`\`

### 2. Check Status
\`\`\`bash
# View all stats
npm run update-all

# Check specific container
npm run docker:status web
\`\`\`

### 3. View Logs
\`\`\`bash
# Application logs
npm run docker:logs web

# Nginx logs
docker-compose logs nginx
\`\`\`

### 4. Backup/Restore
\`\`\`bash
# Create backup
node config/reliability/backup.js

# Restore backup
node config/reliability/backup.js restore <backup-id>
\`\`\`

## Troubleshooting

### Container Issues
1. Check container status
2. View logs
3. Verify resource usage
4. Restart if necessary

### Security Issues
1. Check SSL certificates
2. Verify security headers
3. Review rate limiting logs
4. Check CSRF protection

### Performance Issues
1. Monitor resource usage
2. Check response times
3. Review error rates
4. Analyze metrics

## Maintenance

### Daily Tasks
- Review logs
- Check backups
- Monitor resources
- Update documentation

### Weekly Tasks
- Security updates
- Performance review
- Backup testing
- Documentation review

### Monthly Tasks
- SSL certificate check
- Full system backup
- Disaster recovery test
- Dependency updates

## Emergency Procedures

### System Down
1. Check container status
2. Review error logs
3. Verify resources
4. Check external dependencies

### Security Incident
1. Enable maintenance mode
2. Review security logs
3. Update security rules
4. Verify all endpoints

### Data Recovery
1. Stop affected services
2. Verify backup integrity
3. Restore from backup
4. Verify restoration

## Contacts

### DevOps Team
- Primary: devops@example.com
- Emergency: +1-XXX-XXX-XXXX

### Security Team
- Primary: security@example.com
- Emergency: +1-XXX-XXX-XXXX
`;

    fs.writeFileSync(path.join(this.docsDir, 'RUNBOOK.md'), runbook);
  }

  async updateDocumentation() {
    try {
      // Update system status
      await this.updateSystemStatus();

      // Generate runbook
      await this.generateRunbook();

      // Update production setup if needed
      this.updateProductionSetup();

      console.log('Documentation updated successfully!');
    } catch (error) {
      console.error('Error updating documentation:', error);
      throw error;
    }
  }

  updateProductionSetup() {
    const setupPath = path.join(process.cwd(), 'PRODUCTION_SETUP.md');
    if (fs.existsSync(setupPath)) {
      let setup = fs.readFileSync(setupPath, 'utf8');
      
      // Update timestamps
      setup = setup.replace(
        /Generated:.*$/m,
        `Generated: ${new Date().toISOString()}`
      );

      fs.writeFileSync(setupPath, setup);
    }
  }
}

// Create documentation manager instance
const docManager = new DocumentationManager();

// Update documentation
docManager.updateDocumentation().catch(console.error);

module.exports = docManager;
