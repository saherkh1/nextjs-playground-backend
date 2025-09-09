# PhotoFlow Frontend Makefile
# Provides simple commands for Docker container management

.PHONY: help build up down restart logs status clean dev health backend-check

# Default target
help: ## Show this help message
	@echo "PhotoFlow Frontend - Docker Management"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Quick Start:"
	@echo "  make run        # Build and start the container"
	@echo "  make dev        # Start development mode (local npm)"
	@echo "  make stop       # Stop the container"
	@echo ""

# Docker commands
build: ## Build the Docker image
	@echo "🔨 Building PhotoFlow Frontend Docker image..."
	@docker-compose build --no-cache
	@echo "✅ Build completed successfully!"

up: build ## Build and start the container
	@echo "🚀 Starting PhotoFlow Frontend container..."
	@docker-compose up -d
	@sleep 3
	@make health
	@echo ""
	@echo "📱 Frontend available at: http://localhost:3000"
	@echo "🔧 To view logs: make logs"
	@echo "🛑 To stop: make down"

run: ## Run with environment (usage: make run dev OR make run prod)
	@if echo "$(MAKECMDGOALS)" | grep -q "dev"; then \
		echo "🔧 Starting PhotoFlow Frontend - Development Mode with Docker"; \
		echo "📍 URL: http://localhost:3000"; \
		echo "🔄 Hot reload enabled"; \
		docker-compose --profile dev up --build frontend-dev; \
	elif echo "$(MAKECMDGOALS)" | grep -q "prod"; then \
		echo "🚀 Starting PhotoFlow Frontend - Production Mode"; \
		echo "📍 URL: http://localhost:3000"; \
		docker-compose up --build frontend; \
	else \
		echo "Usage: make run dev (for development) or make run prod (for production)"; \
		echo "Available commands:"; \
		echo "  make run dev  - Development mode with hot reload"; \
		echo "  make run prod - Production mode"; \
		echo "  make dev      - Direct development command"; \
		echo "  make up       - Direct production command"; \
	fi

# Keep original commands for direct access
run-dev: dev ## Alias for dev command

run-prod: up ## Alias for up command

down: ## Stop and remove the container
	@echo "🛑 Stopping PhotoFlow Frontend container..."
	@docker-compose down
	@echo "✅ Container stopped successfully!"

stop: down ## Alias for 'down' - stop the container

restart: ## Restart the container
	@echo "🔄 Restarting PhotoFlow Frontend container..."
	@make down
	@sleep 2
	@make up

logs: ## Show container logs (follow mode)
	@echo "📋 Showing container logs (Press Ctrl+C to exit)..."
	@docker-compose logs -f frontend

status: ## Show container status and health
	@echo "📊 Container Status:"
	@docker-compose ps
	@echo ""
	@make health

clean: ## Remove containers and images
	@echo "🧹 Cleaning up PhotoFlow Frontend Docker resources..."
	@docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true
	@docker image prune -f >/dev/null 2>&1 || true
	@echo "✅ Cleanup completed!"

# Development commands
dev: ## Start development mode with Docker (hot reload)
	@echo "🔧 Starting PhotoFlow Frontend - Development Mode with Docker"
	@echo "📍 URL: http://localhost:3000"
	@echo "🔄 Hot reload enabled"
	@docker-compose --profile dev up --build frontend-dev

dev-local: ## Start development mode (local npm run dev)
	@echo "🔧 Starting development mode locally..."
	@npm run dev

# Health checks
health: ## Check application health
	@echo "🏥 Checking application health..."
	@if curl -s -f http://localhost:3000/health >/dev/null 2>&1; then \
		echo "✅ Frontend is healthy and responding"; \
		curl -s http://localhost:3000/health | jq '.' 2>/dev/null || curl -s http://localhost:3000/health; \
	else \
		echo "❌ Frontend is not responding"; \
	fi
	@echo ""
	@make backend-check

backend-check: ## Check backend connectivity
	@echo "🔍 Checking backend connectivity..."
	@if curl -s -f http://localhost:8080/api/v1/health >/dev/null 2>&1; then \
		echo "✅ Backend API is accessible"; \
	else \
		echo "⚠️  Backend API is not accessible at http://localhost:8080"; \
		echo "   Make sure the backend is running first"; \
	fi

# Environment setup
install: ## Install npm dependencies
	@echo "📦 Installing dependencies..."
	@npm install
	@echo "✅ Dependencies installed!"

lint: ## Run linting
	@echo "🔍 Running ESLint..."
	@npm run lint

type-check: ## Run TypeScript type checking
	@echo "🔍 Running TypeScript type checking..."
	@npm run type-check

test-build: ## Test the build process
	@echo "🔨 Testing build process..."
	@npm run build
	@echo "✅ Build test completed!"

# Combined commands
setup: install test-build ## Install dependencies and test build
	@echo "✅ Setup completed! Ready to run 'make run'"

full-check: backend-check health lint type-check ## Run all checks

# Quick development workflow
quick-start: setup run ## Complete setup and start container

# Docker system maintenance
docker-clean: ## Clean up Docker system (removes unused images, containers)
	@echo "🧹 Cleaning Docker system..."
	@docker system prune -f
	@echo "✅ Docker system cleaned!"

# Information
info: ## Show project information
	@echo "📋 PhotoFlow Frontend Information"
	@echo "================================"
	@echo "Project: PhotoFlow Photography Platform"
	@echo "Frontend: Next.js 14 + TypeScript"
	@echo "Port: 3000"
	@echo "Backend API: http://localhost:8080/api/v1"
	@echo ""
	@echo "Container Status:"
	@docker-compose ps 2>/dev/null || echo "No containers running"

# Handle run arguments - make run dev or make run prod  
%:
	@:

# Default target when just running 'make'
default: help