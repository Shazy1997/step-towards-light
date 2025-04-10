const ai = require('./llama_integration');
const promptManager = require('./prompt-manager');
const config = require('../../config/ai/config');

async function demonstrateAIUsage() {
  try {
    console.log('Initializing AI system...');
    await ai.initialize();

    // Example 1: Analyze system health
    console.log('\nExample 1: System Health Analysis');
    const healthContext = {
      type: 'health_check',
      metrics: {
        cpu: '45%',
        memory: '60%',
        disk: '70%',
        latency: '150ms'
      },
      timestamp: new Date().toISOString()
    };

    const healthPrompt = promptManager.generateHealthCheckPrompt(healthContext);
    const healthAnalysis = await ai.analyze(healthPrompt);
    console.log('Health Analysis:', healthAnalysis);

    // Example 2: Handle performance alert
    console.log('\nExample 2: Performance Alert Analysis');
    const alertContext = {
      type: 'performance_alert',
      severity: 'warning',
      metrics: {
        cpu: '82%',
        memory: '85%',
        latency: '750ms'
      }
    };

    const alertPrompt = promptManager.generateAlertPrompt(alertContext);
    const alertAnalysis = await ai.analyze(alertPrompt);
    console.log('Alert Analysis:', alertAnalysis);

    // Example 3: System analysis with full context
    console.log('\nExample 3: Full System Analysis');
    const systemContext = await ai.generateSystemContext();
    const analysisPrompt = promptManager.generateAnalysisPrompt(systemContext);
    const systemAnalysis = await ai.analyze(analysisPrompt);
    console.log('System Analysis:', systemAnalysis);

  } catch (error) {
    console.error('Error in AI demonstration:', error);
  }
}

// Run the demonstration
if (require.main === module) {
  demonstrateAIUsage()
    .then(() => console.log('AI demonstration completed'))
    .catch(console.error);
}
