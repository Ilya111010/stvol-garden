#!/bin/bash

# Stvol Garden Deployment Script
echo "🚀 Starting Stvol Garden deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Build backend
print_status "Building backend..."
cd backend
if npm run build; then
    print_status "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

# Build frontend
print_status "Building frontend..."
cd ../frontend
if npm run build; then
    print_status "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

cd ..

print_status "Build completed successfully!"
print_warning "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect to Railway (backend) or Vercel (frontend)"
echo "3. Set up environment variables"
echo "4. Deploy!"

print_status "For detailed instructions, see DEPLOYMENT.md"
