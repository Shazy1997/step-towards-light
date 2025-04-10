const autocannon = require('autocannon');
const { execSync } = require('child_process');

async function runLoadTest() {
  console.log('Starting load test...');
  
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 10,
    pipelining: 1,
    duration: 10
  });

  console.log('Load test results:', result);
  
  // Check container stats during load
  console.log('\nContainer stats during load:');
  execSync('npm run docker:stats', { stdio: 'inherit' });
}

async function monitorProduction() {
  try {
    // Run load test
    await runLoadTest();
    
    // Update monitoring data
    execSync('npm run update-all', { stdio: 'inherit' });
    
    // Generate load test report
    const report = {
      timestamp: new Date().toISOString(),
      loadTest: 'Completed',
      monitoring: 'Updated'
    };
    
    console.log('Monitor production run completed:', report);
  } catch (error) {
    console.error('Error in production monitoring:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  monitorProduction();
}

module.exports = { runLoadTest, monitorProduction };
