#!/bin/bash

# Function to show container logs with optional tail
show_logs() {
    container=$1
    lines=${2:-50}
    docker logs --tail $lines -f $container
}

# Function to show container stats
show_stats() {
    container=$1
    docker stats $container --no-stream
}

# Function to show container status
show_status() {
    container=$1
    echo "=== Container Status ==="
    docker inspect --format='{{.State.Status}}' $container
    echo "=== Health Check ==="
    docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "No health check configured"
    echo "=== Resource Usage ==="
    docker stats $container --no-stream
}

# Function to monitor container events
monitor_events() {
    docker events --format '{{json .}}'
}

# Function to validate compose file
validate_compose() {
    docker-compose config
}

# Function to show all container info
show_all() {
    container=$1
    echo "=== Container Info ==="
    show_status $container
    echo -e "\n=== Latest Logs ==="
    show_logs $container 10
}

# Main command handler
case "$1" in
    "logs")
        show_logs $2 $3
        ;;
    "stats")
        show_stats $2
        ;;
    "status")
        show_status $2
        ;;
    "events")
        monitor_events
        ;;
    "validate")
        validate_compose
        ;;
    "all")
        show_all $2
        ;;
    *)
        echo "Usage: $0 {logs|stats|status|events|validate|all} [container_name] [log_lines]"
        exit 1
        ;;
esac
