const fs = require('fs');
const path = require('path');

class WebsiteContextManager {
  constructor() {
    this.contextDir = path.join(process.cwd(), 'context');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.contextDir)) {
      fs.mkdirSync(this.contextDir, { recursive: true });
    }
  }

  async generateContext() {
    const context = {
      timestamp: new Date().toISOString(),
      websiteCore: {
        mission: "Providing authentic Islamic guidance and motivation",
        audience: "Young community members seeking knowledge",
        values: [
          "Authentic knowledge sharing",
          "Community engagement",
          "Positive motivation",
          "Spiritual growth"
        ]
      },
      contentTypes: {
        scholarlyVideos: {
          source: "Curated YouTube content",
          verification: "Scholar approved",
          topics: [
            "Islamic teachings",
            "Spiritual guidance",
            "Contemporary issues",
            "Community development"
          ]
        },
        writtenKhutbahs: {
          format: "Text content",
          verification: "Source authenticated",
          categories: [
            "Friday sermons",
            "Special occasions",
            "Topical guidance",
            "Community matters"
          ]
        },
        communityContent: {
          platform: "Discord integration",
          focus: [
            "Real-time discussions",
            "Knowledge sharing",
            "Community support",
            "Event coordination"
          ]
        }
      },
      userEngagement: {
        interactions: [
          "Content viewing",
          "Discussion participation",
          "Resource sharing",
          "Community support"
        ],
        feedback: {
          metrics: [
            "Content relevance",
            "Spiritual impact",
            "Community benefit",
            "Knowledge gain"
          ]
        }
      }
    };

    // Add dynamic content context
    await this.addContentContext(context);
    
    // Add community context
    await this.addCommunityContext(context);
    
    // Add system metrics
    await this.addSystemContext(context);

    return context;
  }

  async addContentContext(context) {
    // Read content metrics and stats
    try {
      const contentStats = {
        videos: {
          total: "calculating...",
          categories: ["Educational", "Motivational", "Guidance"],
          popularTopics: [
            "Youth guidance",
            "Modern challenges",
            "Community development"
          ]
        },
        khutbahs: {
          total: "calculating...",
          categories: ["Weekly", "Special occasions", "Topics"],
          focusAreas: [
            "Contemporary issues",
            "Spiritual growth",
            "Community building"
          ]
        }
      };

      context.contentMetrics = contentStats;
    } catch (error) {
      console.error('Error adding content context:', error);
    }
  }

  async addCommunityContext(context) {
    try {
      const communityMetrics = {
        members: "calculating...",
        activeDiscussions: [
          "Islamic guidance",
          "Community support",
          "Knowledge sharing"
        ],
        engagementTypes: [
          "Questions and answers",
          "Resource sharing",
          "Support networks"
        ]
      };

      context.communityMetrics = communityMetrics;
    } catch (error) {
      console.error('Error adding community context:', error);
    }
  }

  async addSystemContext(context) {
    try {
      // Get monitoring data
      const monitoringFile = path.join(process.cwd(), 'scripts', 'monitoring', 'docker-status.json');
      if (fs.existsSync(monitoringFile)) {
        context.systemMetrics = JSON.parse(fs.readFileSync(monitoringFile, 'utf8'));
      }

      // Add AI analysis context
      const analysisFile = path.join(process.cwd(), 'analysis', 'latest.json');
      if (fs.existsSync(analysisFile)) {
        context.aiAnalysis = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error adding system context:', error);
    }
  }

  async updatePromptWithContext(basePrompt) {
    const context = await this.generateContext();
    
    return `
Website Context:
${JSON.stringify(context.websiteCore, null, 2)}

Content Focus:
${JSON.stringify(context.contentTypes, null, 2)}

User Engagement:
${JSON.stringify(context.userEngagement, null, 2)}

Original Prompt:
${basePrompt}

Please consider the website's mission, content focus, and user engagement patterns when providing analysis or recommendations.
`;
  }

  async saveContext(context) {
    const filename = `context_${Date.now()}.json`;
    const filepath = path.join(this.contextDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(context, null, 2));
    
    // Update latest context
    const latestPath = path.join(this.contextDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(context, null, 2));
  }
}

module.exports = new WebsiteContextManager();

// If running directly, generate and save context
if (require.main === module) {
  const contextManager = new WebsiteContextManager();
  contextManager.generateContext()
    .then(context => {
      contextManager.saveContext(context);
      console.log('Context generated and saved successfully');
    })
    .catch(console.error);
}
