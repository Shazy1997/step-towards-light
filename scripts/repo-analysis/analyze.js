const fs = require('fs');
const path = require('path');

function analyzeRepository(directory) {
  const stats = {
    files: 0,
    directories: 0,
    fileTypes: {},
    components: 0,
    pages: 0,
    tests: 0,
    totalSize: 0
  };

  function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      if (item === 'node_modules' || item === '.git' || item === '.next') {
        return;
      }

      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        stats.directories++;
        if (item === 'components') {
          stats.components = fs.readdirSync(fullPath).length;
        } else if (item === 'pages') {
          stats.pages = fs.readdirSync(fullPath).length;
        } else if (item === '__tests__') {
          stats.tests = fs.readdirSync(fullPath).length;
        }
        processDirectory(fullPath);
      } else {
        stats.files++;
        stats.totalSize += stat.size;
        const ext = path.extname(item);
        stats.fileTypes[ext] = (stats.fileTypes[ext] || 0) + 1;
      }
    });
  }

  try {
    processDirectory(directory);
    return stats;
  } catch (error) {
    console.error('Error analyzing repository:', error);
    return null;
  }
}

function generateReport() {
  console.log('Analyzing repository...\n');
  const stats = analyzeRepository(process.cwd());
  
  if (!stats) {
    console.log('Failed to analyze repository.');
    return;
  }

  const report = {
    timestamp: new Date().toISOString(),
    stats: {
      ...stats,
      totalSize: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`
    }
  };

  console.log('Repository Analysis Report');
  console.log('=========================');
  console.log(`Total Files: ${stats.files}`);
  console.log(`Total Directories: ${stats.directories}`);
  console.log(`Total Size: ${report.stats.totalSize}`);
  console.log('\nFile Types:');
  Object.entries(stats.fileTypes).forEach(([ext, count]) => {
    console.log(`  ${ext || 'no extension'}: ${count}`);
  });
  console.log('\nComponents:', stats.components);
  console.log('Pages:', stats.pages);
  console.log('Tests:', stats.tests);

  // Save report
  const reportPath = path.join(process.cwd(), 'scripts', 'repo-analysis', 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

generateReport();
