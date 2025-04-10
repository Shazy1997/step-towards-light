const config = require('../../config/ai/config');
const fs = require('fs');
const path = require('path');

class PromptManager {
  constructor() {
    this.config = config;
    this.promptsDir = path.join(process.cwd(), 'logs', 'prompts');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.promptsDir)) {
      fs.mkdirSync(this.promptsDir, { recursive: true });
    }
  }

  generateAnalysisPrompt(context) {
    let prompt = this.config.prompts.systemContext + '\n\n';
    
    prompt += this.config.prompts.analysisTemplate.replace(
      '{{context}}',
      JSON.stringify(context, null, 2)
    );

    this.logPrompt('analysis', prompt);
    return prompt;
  }

  generateAlertPrompt(alert) {
    let prompt = this.config.prompts.systemContext + '\n\n';
    
    prompt += this.config.prompts.alertTemplate
      .replace('{{alertType}}', alert.type)
      .replace('{{severity}}', alert.severity)
      .replace('{{metrics}}', JSON.stringify(alert.metrics, null, 2));

    this.logPrompt('alert', prompt);
    return prompt;
  }

  generateHealthCheckPrompt(status) {
    let prompt = this.config.prompts.systemContext + '\n\n';
    
    prompt += this.config.prompts.healthCheckTemplate
      .replace('{{timestamp}}', new Date().toISOString())
      .replace('{{components}}', JSON.stringify(status, null, 2));

    this.logPrompt('health-check', prompt);
    return prompt;
  }

  validateResponse(response) {
    try {
      const parsed = JSON.parse(response);
      
      // Check required fields
      const required = this.config.responseFormat.analysis.required;
      const missing = required.filter(field => !parsed[field]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      // Validate actions
      const hasInvalidAction = parsed.recommendations.some(rec => 
        !this.config.boundaries.allowedActions.includes(rec.action)
      );

      if (hasInvalidAction) {
        throw new Error('Response contains unauthorized actions');
      }

      return parsed;
    } catch (error) {
      throw new Error(`Response validation failed: ${error.message}`);
    }
  }

  logPrompt(type, prompt) {
    const logFile = path.join(
      this.promptsDir,
      `prompt_${type}_${Date.now()}.txt`
    );

    fs.writeFileSync(logFile, prompt);
  }

  cleanupOldLogs() {
    const retention = this.config.integration.logRetention * 24 * 60 * 60 * 1000;
    const now = Date.now();

    fs.readdirSync(this.promptsDir).forEach(file => {
      const filePath = path.join(this.promptsDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > retention) {
        fs.unlinkSync(filePath);
      }
    });
  }
}

module.exports = new PromptManager();
