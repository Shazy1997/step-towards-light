// GitHub metrics configuration
module.exports = {
  // GitHub API configuration
  githubToken: process.env.GITHUB_TOKEN,
  owner: 'shazy1997',
  repo: 'step-towards-light',
  
  // Repository metadata
  repository: {
    name: 'step-towards-light',
    owner: 'shazy1997',
    url: 'https://github.com/shazy1997/step-towards-light',
    ai_enabled: true,
    ai_components: [
      'llama_integration',
      'monitoring',
      'context_management',
      'validation'
    ]
  }
};
