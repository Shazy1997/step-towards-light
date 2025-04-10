const contextAggregator = require('./context-aggregator');
const fs = require('fs');
const path = require('path');

async function periodicUpdate() {
  try {
    console.log('Starting periodic context update...');
    
    // Generate new context
    const context = await contextAggregator.aggregateContext();
    
    // Generate update report
    const report = {
      timestamp: new Date().toISOString(),
      changes: {
        features: {
          implemented: context.project.features.implemented.length,
          inProgress: context.project.features.inProgress.length
        },
        status: {
          system: context.monitoring.status,
          docker: context.deployment.docker.status,
          tests: context.technical.implementation.metrics
        }
      },
      mission: {
        focus: context.project.mission.primary,
        progress: context.project.timeline.current
      }
    };

    // Save report
    const reportPath = path.join(process.cwd(), 'logs', 'context-updates', `update_${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('Context updated successfully');
    console.log('Report saved to:', reportPath);
    
    return report;
  } catch (error) {
    console.error('Error updating context:', error);
    throw error;
  }
}

// Export update function
module.exports = periodicUpdate;

// If running directly, perform update
if (require.main === module) {
  periodicUpdate()
    .then(report => {
      console.log('Update Report:', report);
    })
    .catch(error => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}
