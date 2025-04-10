# Step Towards the Light - Quick Start Guide

## Development Environment

### 1. Start the Environment
```bash
# Start Docker containers
docker-compose up -d

# Start monitoring
npm run docker:monitor

# View application status
npm run docker:status step-towards-light-web-1
```

### 2. Development Commands
```bash
# Start development server
npm run dev

# Run tests
npm test

# Update progress tracking
npm run update-all
```

### 3. Monitoring Commands
```bash
# Container monitoring
npm run docker:monitor    # Start monitoring
npm run docker:stats     # View stats
npm run docker:logs      # View logs
npm run docker:status    # Check status
npm run docker:events    # Watch events
npm run docker:validate  # Validate config
npm run docker:all      # View all info
```

## Project Structure
```
step-towards-light/
├── src/               # Application source
├── scripts/           # Utility scripts
│   ├── monitoring/    # Docker monitoring
│   └── repo-analysis/ # Repository analysis
├── docker/            # Docker configurations
└── .warp_rules/      # Warp terminal rules
```

## Status Files
- DASHBOARD.md: Project overview
- PROGRESS.md: Development progress
- DEPLOYMENT_STATUS.md: Deployment status
- MONITORING_INFRASTRUCTURE.md: Monitoring setup

## Container Health Checks
- Automated health monitoring
- Resource usage tracking
- Performance metrics
- Event logging

## Monitoring Features
1. Real-time Metrics
   - CPU usage
   - Memory consumption
   - Network I/O
   - Container health

2. Automated Reports
   - Container status
   - Resource utilization
   - Health check results
   - Event logs

3. Development Tools
   - Progress tracking
   - Status updates
   - Repository analysis
   - Docker validation

## Next Steps
1. Start development:
   ```bash
   npm run dev
   ```

2. Monitor changes:
   ```bash
   npm run docker:monitor
   ```

3. Update status:
   ```bash
   npm run update-all
   ```

## Common Tasks

### View Container Status
```bash
npm run docker:status step-towards-light-web-1
```

### Check Application Logs
```bash
npm run docker:logs step-towards-light-web-1
```

### Update Documentation
```bash
npm run update-all
```

### Validate Configuration
```bash
npm run docker:validate
```

