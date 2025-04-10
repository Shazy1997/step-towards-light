const ai = require('./llama_integration');
const reportGenerator = require('./generate-report');

async function validateAISystem() {
  try {
    console.log('Starting AI system validation...');

    // Initialize AI
    await ai.initialize();
    console.log('AI system initialized');

    // Run test scenarios
    const scenarios = [
      {
        type: 'health_check',
        metrics: {
          cpu: '45%',
          memory: '60%',
          disk: '70%'
        }
      },
      {
        type: 'performance_alert',
        severity: 'warning',
        metrics: {
          cpu: '85%',
          memory: '75%'
        }
      },
      {
        type: 'security_check',
        details: 'Routine security validation'
      }
    ];

    console.log('Running validation scenarios...');
    for (const scenario of scenarios) {
      const analysis = await ai.analyze(JSON.stringify(scenario));
      validateResponse(analysis, scenario);
    }

    // Generate validation report
    console.log('Generating validation report...');
    const report = await reportGenerator.generateReport();
    
    console.log('Validation completed successfully');
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      scenarios: scenarios.length,
      report
    };
  } catch (error) {
    console.error('Validation failed:', error);
    throw error;
  }
}

function validateResponse(analysis, scenario) {
  const response = JSON.parse(analysis);
  
  // Check required fields
  if (!response.assessment) throw new Error('Missing assessment');
  if (!response.recommendations) throw new Error('Missing recommendations');
  if (!response.risks) throw new Error('Missing risks');
  
  // Check response relevance
  if (scenario.type === 'performance_alert') {
    if (!response.assessment.toLowerCase().includes('performance')) {
      throw new Error('Response not relevant to performance alert');
    }
  }
  
  // Validate recommendations
  response.recommendations.forEach(rec => {
    if (!rec.action || !rec.priority || !rec.risk) {
      throw new Error('Invalid recommendation format');
    }
  });
  
  console.log(`Scenario ${scenario.type} validated successfully`);
}

// Export validation function
module.exports = validateAISystem;

// Run validation if called directly
if (require.main === module) {
  validateAISystem()
    .then(result => console.log('Validation Result:', result))
    .catch(error => {
      console.error('Validation Failed:', error);
      process.exit(1);
    });
}
