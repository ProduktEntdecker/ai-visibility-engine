#!/bin/bash
# Demo script for the AI Visibility Engine
# Run: npm run demo

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo ""
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}  AI Visibility Engine — Demo${NC}"
echo -e "${RED}  chilli mind x AI Visibility Engine${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Run scan on chilli-mind.com
echo -e "${YELLOW}[1/3] Running scan on chilli-mind.com...${NC}"
node src/index.js scan \
  --domain chilli-mind.com \
  --brand "chilli mind" \
  --industry "digital consultancy" \
  --competitors "ustwo.com,frog.com,ideo.com" \
  --output output

echo ""

# 2. Open report
echo -e "${YELLOW}[2/3] Opening report...${NC}"
open output/report-chilli-mind-com.html

# 3. Open pitch deck
echo -e "${YELLOW}[3/3] Opening pitch deck...${NC}"
open src/pitch/deck.html

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Demo ready! Report and pitch deck are open.${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Files:"
echo "    Report:    output/report-chilli-mind-com.html"
echo "    Pitch:     src/pitch/deck.html"
echo "    Email:     src/pitch/email.html"
echo "    Data:      output/scan-chilli-mind-com.json"
echo ""
