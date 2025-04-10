const contextManager = require('./context-manager');
const ai = require('./llama_integration');

async function analyzeWithContext(analysis) {
  // Get base analysis
  const baseAnalysis = await ai.analyze(analysis);
  
  // Get website context
  const context = await contextManager.generateContext();
  
  // Enhance analysis with context
  const enhancedAnalysis = {
    ...JSON.parse(baseAnalysis),
    websiteContext: {
      mission: context.websiteCore.mission,
      relevance: await assessRelevance(analysis, context),
      impact: await assessImpact(analysis, context)
    }
  };

  return JSON.stringify(enhancedAnalysis, null, 2);
}

async function assessRelevance(analysis, context) {
  // Assess how analysis relates to website mission
  const relevanceFactors = [
    "Content authenticity",
    "Islamic guidance",
    "Community benefit",
    "User engagement"
  ];

  return {
    factors: relevanceFactors,
    score: "Calculating...",
    notes: "Assessment based on website mission and values"
  };
}

async function assessImpact(analysis, context) {
  // Assess potential impact on website goals
  const impactAreas = [
    "Knowledge sharing",
    "Community growth",
    "Spiritual development",
    "Platform health"
  ];

  return {
    areas: impactAreas,
    assessment: "Evaluating...",
    recommendations: "Based on website context and goals"
  };
}

module.exports = {
  analyzeWithContext
};
