const axios = require('axios');
require('dotenv').config();

class DiscordNotifier {
  constructor() {
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    this.environment = process.env.NODE_ENV || 'development';
  }

  async sendAlert(type, message, data = {}) {
    if (!this.webhookUrl) {
      console.warn('Discord webhook URL not configured');
      return;
    }

    const embed = {
      title: `[${this.environment.toUpperCase()}] ${type}`,
      description: message,
      color: this.getColorForType(type),
      fields: Object.entries(data).map(([key, value]) => ({
        name: key,
        value: JSON.stringify(value, null, 2),
        inline: false
      })),
      timestamp: new Date().toISOString()
    };

    try {
      await axios.post(this.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  async sendDailySummary(summary) {
    const embed = {
      title: `Daily Project Summary - ${new Date().toLocaleDateString()}`,
      description: summary.overview,
      color: 0x00ff00,
      fields: [
        {
          name: 'Content Status',
          value: `Completed: ${summary.content.completed}\nIn Progress: ${summary.content.inProgress}\nPending: ${summary.content.pending}`,
          inline: true
        },
        {
          name: 'System Health',
          value: `Docker: ${summary.health.docker}\nTests: ${summary.health.tests}\nMonitoring: ${summary.health.monitoring}`,
          inline: true
        },
        {
          name: 'GitHub Activity',
          value: `Commits: ${summary.github.commits}\nPRs: ${summary.github.prs}\nIssues: ${summary.github.issues}`,
          inline: true
        }
      ],
      timestamp: new Date().toISOString()
    };

    try {
      await axios.post(this.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('Failed to send daily summary:', error);
    }
  }

  getColorForType(type) {
    const colors = {
      error: 0xff0000,
      warning: 0xffff00,
      info: 0x00ff00,
      success: 0x00ff00
    };
    return colors[type.toLowerCase()] || 0x000000;
  }
}

module.exports = new DiscordNotifier();

