#!/usr/bin/env node

const readline = require('readline');
const { execSync } = require('child_process');
const contextAggregator = require('./context-pipeline/context-aggregator');
const promptEnhancer = require('./context-pipeline/prompt-enhancer');

async function startChat() {
  console.log('\n=== Step Towards the Light - AI Assistant ===\n');
  
  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Get initial context
  console.log('Loading context...');
  const context = await contextAggregator.aggregateContext();
  console.log('\nContext loaded! Current status:');
  console.log(`• Mission: ${context.project.mission.primary}`);
  console.log(`• Phase: ${context.project.timeline.current}`);
  console.log(`• Features: ${context.project.features.implemented.length} implemented, ${context.project.features.inProgress.length} in progress`);
  console.log('\nType your question or command (or "exit" to quit):\n');

  // Chat loop
  const askQuestion = () => {
    rl.question('> ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      try {
        // Enhance prompt with context
        const enhancedPrompt = await promptEnhancer.enhancePrompt(input);
        
        // Use Ollama to get response
        const response = execSync(`ollama run llama2:7b-chat "${enhancedPrompt}"`, { encoding: 'utf8' });
        
        console.log('\nAI Response:');
        console.log('------------');
        console.log(response.trim());
        console.log('\n');

        // Continue chat
        askQuestion();
      } catch (error) {
        console.error('Error:', error.message);
        askQuestion();
      }
    });
  };

  // Start chat
  askQuestion();
}

// Start chat if run directly
if (require.main === module) {
  startChat().catch(console.error);
}
