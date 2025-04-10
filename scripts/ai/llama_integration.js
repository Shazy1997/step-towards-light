const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execAsync = util.promisify(exec);

class LlamaAIIntegration {
  constructor() {
    this.modelName = 'llama2:7b-chat';
    this.contextDir = path.join(process.cwd(), 'context');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.contextDir)) {
      fs.mkdirSync(this.contextDir, { recursive: true });
    }
  }

  async initialize() {
    try {
      // Check if Ollama is installed
      await execAsync('ollama --version');
    } catch (error) {
      console.log('Installing Ollama...');
      await execAsync('curl https://ollama.ai/install.sh | sh');
    }

    try {
      // Pull the model
      await execAsync(`ollama pull ${this.modelName}`);
      console.log('Llama 2 model ready');
    } catch (error) {
      console.error('Error initializing Llama:', error);
      throw error;
    }
  }

  async generateSystemContext() {
    const context = {
      timestamp: new Date().toISOString(),
      system: {
        docker: await this.getDockerStatus(),
        monitoring: await this.getMonitoringStatus(),
        security: await this.getSecurityStatus()
      },
      runbook: this.loadRunbook(),
      recentActions: await this.getRecentActions()
    };

    fs.writeFileSync(
      path.join(this.contextDir, 'system_context.json'),
      JSON.stringify(context, null, 2)
    );

    return context;
  }

  async getDockerStatus() {
    try {
      const { stdout } = await execAsync('npm run docker:status');
      return { status: 'active', output: stdout };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getMonitoringStatus() {
    try {
      const monitoringFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
      return JSON.parse(fs.readFileSync(monitoringFile, 'utf8'));
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async getSecurityStatus() {
    const securityConfig = path.join(process.cwd(), 'config', 'security');
    return {
      headersConfigured: fs.existsSync(path.join(securityConfig, 'security-headers.js')),
      rateLimitingEnabled: fs.existsSync(path.join(securityConfig, 'rate-limit.js')),
      sslConfigured: fs.existsSync(path.join(process.cwd(), 'config', 'nginx', 'certs'))
    };
  }

  loadRunbook() {
    try {
      const runbookPath = path.join(process.cwd(), 'docs', 'RUNBOOK.md');
      return fs.readFileSync(runbookPath, 'utf8');
    } catch (error) {
      return 'Runbook not found';
    }
  }

  async getRecentActions() {
    try {
      const { stdout } = await execAsync('git log -5 --pretty=format:"%h %s"');
      return stdout.split('\n');
    } catch (error) {
      return [];
    }
  }

  async generatePrompt(issue) {
    const context = await this.generateSystemContext();
    
    return `You are an AI assistant specialized in monitoring and maintaining the Step Towards the Light web platform. Your responses must strictly adhere to the approved runbook procedures.

CONTEXT:
${JSON.stringify(context, null, 2)}

ISSUE:
${issue}

Based on the provided context and runbook, please:
1. Analyze the issue
2. Identify relevant runbook procedures
3. Suggest specific, approved actions
4. Provide commands to execute (if applicable)

Format your response in JSON:
{
  "analysis": "Brief analysis of the issue",
  "relevantProcedures": ["List of relevant runbook sections"],
  "suggestedActions": ["Specific actions to take"],
  "commands": ["Specific commands to run"],
  "risks": ["Any potential risks to consider"],
  "additionalNotes": "Any important notes or warnings"
}`;
  }

  async analyze(issue) {
    try {
      const prompt = await this.generatePrompt(issue);
      
      // Use Ollama to get AI response
      const { stdout } = await execAsync(`ollama run ${this.modelName} "${prompt}"`);
      
      // Parse and validate response
      const response = JSON.parse(stdout);
      
      // Log the analysis
      this.logAnalysis(issue, response);
      
      return response;
    } catch (error) {
      console.error('Error during analysis:', error);
      throw error;
    }
  }

  logAnalysis(issue, response) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      issue,
      response,
      context: {
        docker: this.getDockerStatus(),
        monitoring: this.getMonitoringStatus()
      }
    };

    const logFile = path.join(this.contextDir, 'ai_analysis_log.json');
    const logs = fs.existsSync(logFile) ? 
      JSON.parse(fs.readFileSync(logFile, 'utf8')) : [];
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }
}

module.exports = new LlamaAIIntegration();

// If running directly, initialize the AI
if (require.main === module) {
  const ai = new LlamaAIIntegration();
  ai.initialize()
    .then(() => console.log('AI system initialized'))
    .catch(console.error);
}
