/**
 * AI Configuration for Step Towards the Light
 * This configuration defines the operational parameters and boundaries
 * for our local Llama 2 integration.
 */

module.exports = {
  // Model configuration
  model: {
    name: 'llama2:7b-chat',
    temperature: 0.2,  // Lower temperature for more focused responses
    maxTokens: 500,    // Limit response length
    topP: 0.9         // Maintain response quality while reducing randomness
  },

  // Operational boundaries
  boundaries: {
    allowedActions: [
      'analyze_logs',
      'check_resources',
      'monitor_performance',
      'suggest_scaling',
      'verify_security',
      'backup_data'
    ],
    restrictedActions: [
      'modify_production',
      'change_security',
      'alter_configuration',
      'restart_services'
    ]
  },

  // Prompt templates
  prompts: {
    systemContext: `You are an AI monitoring assistant for the Step Towards the Light platform. 
Your role is strictly analytical and advisory. You can:
- Analyze system metrics and logs
- Identify potential issues
- Suggest approved actions from the runbook
- Provide relevant documentation references

You cannot:
- Make direct system modifications
- Change security configurations
- Restart services without approval
- Modify production data

All suggestions must reference specific sections of the approved runbook.`,

    analysisTemplate: `Given the following metrics and context:
{{context}}

Please analyze for issues focusing on:
1. Performance metrics
2. Resource utilization
3. Security status
4. System health

Provide recommendations that:
- Reference specific runbook sections
- Include only approved actions
- Consider system constraints
- Prioritize stability`,

    alertTemplate: `ALERT: {{alertType}}
Severity: {{severity}}
Metrics: {{metrics}}

Please analyze this alert and provide:
1. Immediate impact assessment
2. Relevant runbook procedures
3. Recommended actions (from approved list)
4. Risk assessment
5. Documentation references`,

    healthCheckTemplate: `System Health Check
Time: {{timestamp}}
Components: {{components}}

Analyze current system health focusing on:
1. Critical metrics status
2. Resource utilization
3. Security posture
4. Performance indicators

Provide a health assessment and any necessary recommendations.`
  },

  // Response formatting
  responseFormat: {
    analysis: {
      type: 'object',
      required: ['assessment', 'recommendations', 'runbookReferences', 'risks'],
      properties: {
        assessment: {
          type: 'string',
          description: 'Brief analysis of the current situation'
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              action: 'string',
              runbookRef: 'string',
              priority: 'number',
              risk: 'string'
            }
          }
        },
        runbookReferences: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        risks: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  },

  // Monitoring thresholds
  thresholds: {
    cpu: {
      warning: 70,
      critical: 85
    },
    memory: {
      warning: 75,
      critical: 90
    },
    disk: {
      warning: 80,
      critical: 90
    },
    latency: {
      warning: 500,  // ms
      critical: 1000 // ms
    },
    errors: {
      warning: 5,    // per minute
      critical: 10   // per minute
    }
  },

  // Integration settings
  integration: {
    updateInterval: 300,  // 5 minutes
    retryAttempts: 3,
    retryDelay: 1000,    // 1 second
    logRetention: 7,     // days
    maxConcurrent: 3
  }
};
