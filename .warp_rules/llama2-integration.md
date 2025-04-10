document_type: MEMORY
document_id: llama2-integration-rule
rule: |
  # Llama 2 AI Integration for Project Monitoring and Analysis

  The project incorporates Llama 2 AI (via Ollama) for intelligent monitoring, diagnostics, and system maintenance. This integration offers the following capabilities:

  ## Core Capabilities
  
  - **System Monitoring**: Automatically collects and analyzes system status information including Docker containers, monitoring services, and security configurations
  - **Runbook Compliance**: Ensures all suggestions strictly follow approved runbook procedures
  - **Issue Analysis**: Processes issue descriptions and provides structured, actionable responses
  - **Command Suggestion**: Recommends specific commands to execute for troubleshooting and maintenance
  - **Risk Assessment**: Identifies potential risks associated with suggested actions

  ## How to Utilize Llama 2 in the Project

  ### Analyze System Issues
  ```javascript
  const llamaAI = require('./scripts/ai/llama_integration');
  
  // Initialize the AI (only needed once)
  await llamaAI.initialize();
  
  // Analyze an issue
  const analysis = await llamaAI.analyze('Docker container crashed unexpectedly');
  
  // Access structured recommendations
  console.log(analysis.suggestedActions);
  console.log(analysis.commands);
  ```

  ### Automatically Generate System Context
  ```javascript
  const llamaAI = require('./scripts/ai/llama_integration');
  
  // Generate comprehensive system context
  const context = await llamaAI.generateSystemContext();
  
  // Access specific subsystem information
  console.log(context.system.docker);
  console.log(context.system.security);
  ```

  ### Monitoring Integration
  - The AI integration is designed to work with the project's monitoring setup (npm run docker:monitor)
  - The monitoring data is automatically incorporated into the AI's context for more accurate analysis
  - All AI analyses are logged to 'context/ai_analysis_log.json' for auditing and review

  ## Technical Specifications
  
  - **Model**: llama2:7b-chat (7B parameter version of Llama 2)
  - **Integration Method**: Ollama local inference (no data sent to external services)
  - **Context Generation**: Collects Docker status, monitoring data, security configurations, runbook, and recent Git actions
  - **Response Format**: Structured JSON with analysis, relevant procedures, suggested actions, commands, risks, and notes
  - **Self-Installation**: Can auto-install Ollama if not already present

  ## Usage in Project Status Reports
  When generating progress reports:
  1. Incorporate AI-driven analysis alongside standard metrics
  2. Use the AI to identify potential issues before they become problems
  3. Include AI-generated maintenance recommendations when appropriate
  4. Reference the AI analysis logs for a history of system issues and resolutions

  This integration should be used as a first-line assistant for system maintenance and troubleshooting, but critical decisions should still be reviewed by human operators before execution.

