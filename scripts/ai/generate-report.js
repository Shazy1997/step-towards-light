const fs = require('fs');
const path = require('path');
const ai = require('./llama_integration');
const promptManager = require('./prompt-manager');

class AIReportGenerator {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports', 'ai');
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generateReport() {
    try {
      console.log('Generating AI analysis report...');

      // Gather system context
      const context = await ai.generateSystemContext();
      
      // Generate analysis
      const analysis = await this.analyzeSystem(context);
      
      // Create report
      const report = this.formatReport(context, analysis);
      
      // Save report
      this.saveReport(report);
      
      console.log('Report generated successfully');
      return report;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async analyzeSystem(context) {
    const analyses = [];

    // System health analysis
    const healthPrompt = promptManager.generateHealthCheckPrompt(context);
    const healthAnalysis = await ai.analyze(healthPrompt);
    analyses.push({ type: 'health', analysis: healthAnalysis });

    // Performance analysis
    const performanceContext = {
      type: 'performance',
      metrics: context.metrics
    };
    const perfPrompt = promptManager.generateAnalysisPrompt(performanceContext);
    const perfAnalysis = await ai.analyze(perfPrompt);
    analyses.push({ type: 'performance', analysis: perfAnalysis });

    // Security analysis
    const securityContext = {
      type: 'security',
      status: context.security
    };
    const secPrompt = promptManager.generateAnalysisPrompt(securityContext);
    const secAnalysis = await ai.analyze(secPrompt);
    analyses.push({ type: 'security', analysis: secAnalysis });

    return analyses;
  }

  formatReport(context, analyses) {
    return {
      timestamp: new Date().toISOString(),
      system: {
        context: context,
        status: this.getSystemStatus(analyses)
      },
      analyses: analyses,
      summary: this.generateSummary(analyses),
      recommendations: this.extractRecommendations(analyses)
    };
  }

  getSystemStatus(analyses) {
    // Determine overall system status from analyses
    const hasWarnings = analyses.some(a => 
      a.analysis.risks && a.analysis.risks.length > 0
    );
    
    const hasCritical = analyses.some(a =>
      a.analysis.assessment && a.analysis.assessment.toLowerCase().includes('critical')
    );

    if (hasCritical) return 'CRITICAL';
    if (hasWarnings) return 'WARNING';
    return 'HEALTHY';
  }

  generateSummary(analyses) {
    const summary = {
      status: this.getSystemStatus(analyses),
      issues: [],
      recommendations: []
    };

    analyses.forEach(analysis => {
      if (analysis.analysis.risks) {
        summary.issues.push(...analysis.analysis.risks);
      }
      if (analysis.analysis.recommendations) {
        summary.recommendations.push(
          ...analysis.analysis.recommendations
            .filter(r => r.priority <= 2) // High priority only
        );
      }
    });

    return summary;
  }

  extractRecommendations(analyses) {
    const recommendations = [];
    
    analyses.forEach(analysis => {
      if (analysis.analysis.recommendations) {
        recommendations.push(
          ...analysis.analysis.recommendations.map(rec => ({
            ...rec,
            source: analysis.type
          }))
        );
      }
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  saveReport(report) {
    const filename = `ai_report_${Date.now()}.json`;
    const filepath = path.join(this.reportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Update latest report link
    const latestPath = path.join(this.reportsDir, 'latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
    
    return filepath;
  }
}

// Create instance and export
const reportGenerator = new AIReportGenerator();
module.exports = reportGenerator;

// If running directly, generate report
if (require.main === module) {
  reportGenerator.generateReport()
    .then(() => console.log('Report generation complete'))
    .catch(console.error);
}
