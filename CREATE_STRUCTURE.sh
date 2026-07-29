#!/bin/bash

# CareerAI - Monorepo Structure Creator
# Usage: bash CREATE_STRUCTURE.sh

set -e

echo "Creating CareerAI monorepo structure..."

# Root-level files (created outside this script)
# .gitignore
# README.md
# ARCHITECTURE.md  (will be added in a later day)

# Backend structure
mkdir -p backend/config
mkdir -p backend/controllers
mkdir -p backend/middleware
mkdir -p backend/models
mkdir -p backend/routes
mkdir -p backend/services
mkdir -p backend/uploads
mkdir -p backend/utils

# Frontend structure
mkdir -p frontend/public
mkdir -p frontend/src/components/auth
mkdir -p frontend/src/components/chat
mkdir -p frontend/src/components/common
mkdir -p frontend/src/components/cv
mkdir -p frontend/src/components/interview
mkdir -p frontend/src/components/jobs
mkdir -p frontend/src/components/layout
mkdir -p frontend/src/components/skills
mkdir -p frontend/src/contexts
mkdir -p frontend/src/pages/auth
mkdir -p frontend/src/pages/chat
mkdir -p frontend/src/pages/cv
mkdir -p frontend/src/pages/interview
mkdir -p frontend/src/pages/jobs
mkdir -p frontend/src/pages/skills
mkdir -p frontend/src/services
mkdir -p frontend/src/utils
mkdir -p frontend/src/assets

# AI Service structure
mkdir -p ai-service/app/api
mkdir -p ai-service/app/core
mkdir -p ai-service/app/models
mkdir -p ai-service/app/routes
mkdir -p ai-service/app/services
mkdir -p ai-service/app/utils
mkdir -p ai-service/data
mkdir -p ai-service/uploads

echo "✓ Monorepo structure created successfully"
echo ""
echo "Directories created:"
echo "  backend/         - Node.js + Express"
echo "  frontend/        - React + Vite"
echo "  ai-service/      - Python FastAPI"
echo ""
echo "Next: Start implementing service-specific code."