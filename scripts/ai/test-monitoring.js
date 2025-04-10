const aiMonitoring = require('./monitor-enhance');

async function testMonitoring() {
  try {
    console.log('Starting AI-enhanced monitoring test...');
    
    // Run monitoring cycle
    await aiMonitoring.monitorAndAnalyze();
    
    // Check results
    console.log('Checking analysis results...');
    const fs = require('fs');
    const path = require('path');
    
    const analysisDir = path.join(process.cwd(), 'analysis');
    const files = fs.readdirSync(analysisDir);
    
    console.log(`Found ${files.length} analysis files`);
    
    // Display latest dashboard
    const dashboard = JSON.parse(
      fs.readFileSync(path.join(analysisDir, 'dashboard.json'), 'utf8')
    );
    
    console.log('\nLatest Dashboard:', JSON.stringify(dashboard, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMonitoring();
