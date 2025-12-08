#!/bin/bash

# Timeline Goal Follower - Setup Script (Bash/WSL)
# This script automates the complete setup process

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Timeline Goal Follower - Automated Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check Node.js version
echo -e "${YELLOW}→ Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed!${NC}"
    echo -e "${YELLOW}  Please install Node.js 18 or higher from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version 18 or higher is required (found v$NODE_VERSION)${NC}"
    echo -e "${YELLOW}  Please upgrade Node.js from https://nodejs.org/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Install root dependencies
echo -e "${YELLOW}→ Installing root dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Root dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install root dependencies${NC}"
    exit 1
fi
echo ""

# Setup Backend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Setting up Backend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd backend

# Install backend dependencies
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install backend dependencies${NC}"
    exit 1
fi
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}→ Creating backend .env file...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Backend .env created from .env.example${NC}"
    else
        cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-min-32-chars"
PORT=3001
EMAIL_ADAPTER="console"
FRONTEND_URL="http://localhost:5173"
EOF
        echo -e "${GREEN}✓ Backend .env created with defaults${NC}"
    fi
else
    echo -e "${GREEN}✓ Backend .env already exists${NC}"
fi
echo ""

# Generate Prisma Client
echo -e "${YELLOW}→ Generating Prisma Client...${NC}"
npx prisma generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
fi
echo ""

# Run database migrations
echo -e "${YELLOW}→ Running database migrations...${NC}"
npx prisma migrate dev --name init
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${RED}✗ Failed to run migrations${NC}"
    exit 1
fi
echo ""

# Seed the database
echo -e "${YELLOW}→ Seeding database with sample data...${NC}"
npx prisma db seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded successfully${NC}"
else
    echo -e "${RED}✗ Failed to seed database${NC}"
    exit 1
fi
echo ""

cd ..

# Setup Frontend
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Setting up Frontend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd frontend

# Install frontend dependencies
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi
echo ""

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}→ Creating frontend .env file...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Frontend .env created from .env.example${NC}"
    else
        cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001
EOF
        echo -e "${GREEN}✓ Frontend .env created with defaults${NC}"
    fi
else
    echo -e "${GREEN}✓ Frontend .env already exists${NC}"
fi
echo ""

cd ..

# Success message
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "  ${YELLOW}1.${NC} Start the development servers:"
echo -e "     ${BLUE}npm run dev${NC}"
echo ""
echo -e "  ${YELLOW}2.${NC} Access the application:"
echo -e "     Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "     Backend:  ${BLUE}http://localhost:3001${NC}"
echo ""
echo -e "  ${YELLOW}3.${NC} Login with demo credentials:"
echo -e "     Email:    ${BLUE}prasham@example.com${NC}"
echo -e "     Password: ${BLUE}changeme${NC}"
echo ""
echo -e "${GREEN}Additional commands:${NC}"
echo -e "  ${BLUE}npm run backend${NC}   - Start backend only"
echo -e "  ${BLUE}npm run frontend${NC}  - Start frontend only"
echo -e "  ${BLUE}npm run test${NC}      - Run backend tests"
echo ""
echo -e "${YELLOW}📖 Documentation:${NC}"
echo -e "  README.md      - Complete guide"
echo -e "  QUICKSTART.md  - Quick reference"
echo -e "  API.md         - API documentation"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
