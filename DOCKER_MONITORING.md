# Docker Monitoring System for Warp

## Overview
This system provides comprehensive Docker monitoring capabilities integrated with Warp terminal, including real-time metrics, health checks, and event monitoring.

## Features

### 1. Real-Time Monitoring
```bash
# Start the monitoring system
npm run docker:monitor

# View container stats
npm run docker:stats [container_name]

# Watch container events
npm run docker:events
```

### 2. Container Health Checks
- Automated health status monitoring
- Resource usage tracking
- Historical data collection
- Configurable alert thresholds

### 3. Docker Events Integration
- Real-time event notifications
- Event history tracking
- Configurable event filtering
- Automatic logging

### 4. Resource Tracking
- CPU usage monitoring
- Memory consumption tracking
- Network I/O statistics
- Storage metrics

### 5. Custom Commands
```bash
# View container logs
npm run docker:logs [container_name] [number_of_lines]

# Check container status
npm run docker:status [container_name]

# View all container info
npm run docker:all [container_name]

# Validate docker-compose configuration
npm run docker:validate
```

### 6. Metrics History
- Historical performance data
- Trend analysis
- Resource usage patterns
- Anomaly detection

## Integration with Project Monitoring

The Docker monitoring system is integrated with our existing project monitoring:
- Automatic updates to PROGRESS.md
- Integration with Warp rules
- GitHub Actions workflow updates
- Dashboard metrics integration

## Data Storage

Monitoring data is stored in `scripts/docker-monitoring/data/`:
- metrics-history.json: Historical performance data
- latest-events.json: Recent Docker events
- health-status.json: Container health checks

## Usage Examples

1. Start full monitoring:
```bash
npm run docker:monitor
```

2. Check specific container:
```bash
npm run docker:all my-container
```

3. Watch events:
```bash
npm run docker:events
```

4. Validate configuration:
```bash
npm run docker:validate
```

## Alert System

The monitoring system will alert through Warp when:
- Container health status changes
- Resource usage exceeds thresholds
- Critical events occur
- Configuration validation fails

## Integration with Development Workflow

1. Start monitoring during development:
```bash
npm run docker:monitor & npm run dev
```

2. Check container status in CI/CD:
```bash
npm run docker:status my-container
```

3. Validate before deployment:
```bash
npm run docker:validate && npm run build
```

## Next Steps

1. Start Docker daemon and verify monitoring:
```bash
# Start Docker
open -a Docker

# Wait for daemon to start, then:
npm run docker:monitor
```

2. Set up containers:
```bash
docker-compose up -d
npm run docker:all web
```

3. Monitor development:
```bash
npm run docker:events  # Terminal 1
npm run dev           # Terminal 2
```
