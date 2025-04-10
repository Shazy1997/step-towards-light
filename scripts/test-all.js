const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      suites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        coverage: 0
      }
    };
  }

  async runTests() {
    console.log('Starting comprehensive test suite...\n');

    try {
      // Run all test suites
      await this.runTestSuite('AI Core', 'test:ai');
      await this.runTestSuite('Alerts', 'test:alerts');
      await this.runTestSuite('Dashboard', 'test:dashboard');

      // Generate summary
      this.generateSummary();

      // Save results
      this.saveResults();

      return this.results;
    } catch (error) {
      console.error('Error running tests:', error);
      throw error;
    }
  }

  async runTestSuite(name, script) {
    console.log(`Running ${name} tests...`);
    
    try {
      const output = execSync(`npm run ${script}`, { encoding: 'utf8' });
      
      const suite = {
        name,
        status: 'passed',
        output: output,
        coverage: this.extractCoverage(output)
      };

      this.results.suites.push(suite);
      console.log(`${name} tests completed successfully\n`);
    } catch (error) {
      const suite = {
        name,
        status: 'failed',
        output: error.stdout || error.message,
        error: error.message
      };

      this.results.suites.push(suite);
      console.error(`${name} tests failed:`, error.message, '\n');
    }
  }

  extractCoverage(output) {
    try {
      const match = output.match(/All files\s*\|\s*([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    } catch {
      return 0;
    }
  }

  generateSummary() {
    this.results.summary = {
      total: this.results.suites.length,
      passed: this.results.suites.filter(s => s.status === 'passed').length,
      failed: this.results.suites.filter(s => s.status === 'failed').length,
      coverage: this.calculateAverageCoverage()
    };
  }

  calculateAverageCoverage() {
    const coverages = this.results.suites
      .map(s => s.coverage)
      .filter(c => c > 0);

    return coverages.length > 0
      ? coverages.reduce((a, b) => a + b, 0) / coverages.length
      : 0;
  }

  saveResults() {
    const resultsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filename = `test-run-${Date.now()}.json`;
    const filepath = path.join(resultsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    
    // Update latest results
    fs.writeFileSync(
      path.join(resultsDir, 'latest.json'),
      JSON.stringify(this.results, null, 2)
    );

    console.log('\nTest results saved to:', filepath);
  }
}

// Create runner instance
const runner = new TestRunner();

// Export runner
module.exports = runner;

// Run tests if called directly
if (require.main === module) {
  runner.runTests()
    .then(results => {
      console.log('\nTest Summary:');
      console.log('------------');
      console.log(`Total Suites: ${results.summary.total}`);
      console.log(`Passed: ${results.summary.passed}`);
      console.log(`Failed: ${results.summary.failed}`);
      console.log(`Average Coverage: ${results.summary.coverage.toFixed(2)}%`);
      
      if (results.summary.failed > 0) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Test run failed:', error);
      process.exit(1);
    });
}
