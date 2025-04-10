const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BackupManager {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}`);
    
    try {
      // Create backup directory
      fs.mkdirSync(backupPath);

      // Backup configuration files
      execSync(`cp -r config ${backupPath}/`);
      
      // Backup source code
      execSync(`cp -r src ${backupPath}/`);
      
      // Backup package files
      execSync(`cp package*.json ${backupPath}/`);
      
      // Create backup report
      const backupReport = {
        timestamp,
        path: backupPath,
        files: fs.readdirSync(backupPath, { recursive: true }),
        size: this.getDirectorySize(backupPath)
      };

      fs.writeFileSync(
        path.join(backupPath, 'backup-report.json'),
        JSON.stringify(backupReport, null, 2)
      );

      return backupReport;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  getDirectorySize(dirPath) {
    let size = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        size += this.getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    });
    
    return size;
  }

  async restoreBackup(backupId) {
    const backupPath = path.join(this.backupDir, backupId);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup ${backupId} not found`);
    }

    try {
      // Restore configuration
      execSync(`cp -r ${backupPath}/config ./`);
      
      // Restore source code
      execSync(`cp -r ${backupPath}/src ./`);
      
      // Restore package files
      execSync(`cp ${backupPath}/package*.json ./`);
      
      return {
        status: 'success',
        timestamp: new Date().toISOString(),
        restoredFrom: backupId
      };
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }
}

module.exports = new BackupManager();
