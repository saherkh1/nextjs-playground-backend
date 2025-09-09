#!/bin/bash

# PhotoFlow Frontend Docker Management Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[PhotoFlow]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    echo "PhotoFlow Frontend Docker Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build the Docker image"
    echo "  up        Start the container (build if needed)"
    echo "  down      Stop and remove the container"
    echo "  restart   Restart the container"
    echo "  logs      Show container logs"
    echo "  status    Show container status"
    echo "  clean     Remove image and containers"
    echo "  help      Show this help message"
    echo ""
}

# Check if Docker is running
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Build the Docker image
build_image() {
    print_status "Building PhotoFlow Frontend Docker image..."
    
    # Check if backend is running
    if ! curl -s -f http://localhost:8080/api/v1/health >/dev/null 2>&1; then
        print_warning "Backend API (port 8080) doesn't seem to be running."
        print_warning "Make sure the backend is started before running the frontend."
        echo ""
    fi
    
    docker build -t photoflow-frontend:latest .
    print_success "Docker image built successfully!"
}

# Start the container
start_container() {
    print_status "Starting PhotoFlow Frontend container..."
    docker-compose up -d
    
    # Wait for the container to be ready
    print_status "Waiting for container to be ready..."
    sleep 5
    
    # Check if container is running
    if docker-compose ps | grep -q "Up"; then
        print_success "Frontend container started successfully!"
        print_status "Frontend is now available at: http://localhost:3000"
        print_status "API endpoint configured for: http://host.docker.internal:8080/api/v1"
        echo ""
        print_status "To view logs: $0 logs"
        print_status "To stop: $0 down"
    else
        print_error "Container failed to start. Check logs with: $0 logs"
        exit 1
    fi
}

# Stop the container
stop_container() {
    print_status "Stopping PhotoFlow Frontend container..."
    docker-compose down
    print_success "Container stopped successfully!"
}

# Show container logs
show_logs() {
    print_status "Showing container logs (Press Ctrl+C to exit)..."
    docker-compose logs -f frontend
}

# Show container status
show_status() {
    print_status "Container Status:"
    docker-compose ps
    echo ""
    
    if docker-compose ps | grep -q "Up"; then
        print_status "Health check:"
        if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Frontend is responsive at http://localhost:3000"
        else
            print_warning "Frontend container is running but not responding"
        fi
        
        print_status "Backend connectivity:"
        if curl -s -f http://localhost:8080/api/v1/health >/dev/null 2>&1; then
            print_success "Backend API is accessible"
        else
            print_warning "Backend API is not accessible at http://localhost:8080"
        fi
    fi
}

# Clean up containers and images
cleanup() {
    print_status "Cleaning up PhotoFlow Frontend Docker resources..."
    
    # Stop and remove containers
    docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
    
    # Remove dangling images
    docker image prune -f >/dev/null 2>&1 || true
    
    print_success "Cleanup completed!"
}

# Main script logic
case "${1:-help}" in
    build)
        check_docker
        build_image
        ;;
    up)
        check_docker
        if ! docker images | grep -q "photoflow-frontend"; then
            build_image
        fi
        start_container
        ;;
    down)
        check_docker
        stop_container
        ;;
    restart)
        check_docker
        stop_container
        sleep 2
        start_container
        ;;
    logs)
        check_docker
        show_logs
        ;;
    status)
        check_docker
        show_status
        ;;
    clean)
        check_docker
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac