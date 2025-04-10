const ai = require('./llama_integration');

async function testAI() {
  try {
    await ai.initialize();
    
    const testIssue = {
      type: 'performance',
      description: 'Container memory usage above 80%',
      metrics: {
        memory: '85%',
        cpu: '60%',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Testing AI analysis...');
    const analysis = await ai.analyze(JSON.stringify(testIssue));
    console.log('AI Analysis:', JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAI();
