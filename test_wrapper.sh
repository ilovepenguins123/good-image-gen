#!/bin/bash

# Hypixel API Wrapper Test Script
# This script demonstrates all wrapper endpoints and caching behavior

BASE_URL="http://198.46.132.208:3001"

echo "================================"
echo "Hypixel API Wrapper Test Suite"
echo "================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check cache is empty
echo -e "${BLUE}Test 1: Check initial cache state${NC}"
echo "GET /api/cache/stats"
curl -s "$BASE_URL/api/cache/stats" | jq '.'
echo ""
echo ""

# Test 2: Get player stats (example username - replace with actual player)
echo -e "${BLUE}Test 2: Fetch player stats by username${NC}"
echo "GET /api/player/{username}"
echo "Note: Replace 'Technoblade' with a real player username"
echo "Command: curl -s '$BASE_URL/api/player/Technoblade' | jq '.player | {uuid, name, level}'"
echo ""
echo "Example output structure:"
cat << 'EOF'
{
  "uuid": "99f00191e5fb47e8b8061afc906e7e77",
  "name": "Technoblade",
  "level": 175,
  ...
}
EOF
echo ""
echo ""

# Test 3: Check cache after request
echo -e "${BLUE}Test 3: Check cache stats after request${NC}"
echo "GET /api/cache/stats"
echo "Note: You should see cache entries if the previous request succeeded"
curl -s "$BASE_URL/api/cache/stats" | jq '.'
echo ""
echo ""

# Test 4: Get Bedwars stats
echo -e "${BLUE}Test 4: Fetch Bedwars stats by UUID${NC}"
echo "GET /api/bedwars/stats/{uuid}"
echo "Command: curl -s '$BASE_URL/api/bedwars/stats/{uuid}' | jq '.'"
echo ""
echo "Example output structure:"
cat << 'EOF'
{
  "level": 1234,
  "fkdr": 5.67,
  "wins": 8900,
  "winstreak": 45,
  "kills": 23456,
  "deaths": 4123
}
EOF
echo ""
echo ""

# Test 5: Get Skyblock profiles
echo -e "${BLUE}Test 5: Fetch Skyblock profiles by UUID${NC}"
echo "GET /api/skyblock/profiles/{uuid}"
echo "Command: curl -s '$BASE_URL/api/skyblock/profiles/{uuid}' | jq '.profiles[] | {cute_name, profile_id}'"
echo ""
echo "Example output structure:"
cat << 'EOF'
[
  {
    "cute_name": "Alchemy",
    "profile_id": "abc123...",
    "members": {...}
  },
  ...
]
EOF
echo ""
echo ""

# Test 6: Get guild by player
echo -e "${BLUE}Test 6: Fetch guild by player UUID${NC}"
echo "GET /api/guild/player/{uuid}"
echo "Command: curl -s '$BASE_URL/api/guild/player/{uuid}' | jq '.guild | {name, level, tag}'"
echo ""
echo "Example output structure:"
cat << 'EOF'
{
  "name": "My Guild",
  "level": 50,
  "tag": "TAG",
  ...
}
EOF
echo ""
echo ""

# Test 7: Demonstrate caching - make same request twice
echo -e "${BLUE}Test 7: Caching demonstration${NC}"
echo "Making the same request twice to show cache behavior"
echo ""
echo "First request (cache MISS):"
echo "GET /api/cache/stats"
curl -s "$BASE_URL/api/cache/stats" | jq '.'
echo ""
echo "Notice the timestamp - this is the first time we're checking cache"
echo ""
echo ""

# Test 8: Cache management
echo -e "${BLUE}Test 8: Cache management endpoints${NC}"
echo ""
echo "Check cache info:"
curl -s "$BASE_URL/api/cache/stats" | jq '.cacheSize, .cacheDuration'
echo ""
echo "To clear cache:"
echo "curl -X POST '$BASE_URL/api/cache/clear'"
echo ""
echo "To remove expired entries:"
echo "curl -X POST '$BASE_URL/api/cache/prune'"
echo ""
echo ""

# Test 9: Image generation with caching
echo -e "${BLUE}Test 9: Image generation (uses cache internally)${NC}"
echo "Generate player stats image:"
echo "curl '$BASE_URL/stats/{username}?watermark=MyWatermark' -o player_stats.png"
echo ""
echo "Generate from bearer token:"
echo "curl '$BASE_URL/bearer/{bearer_token}' -o player_stats.png"
echo ""
echo "Both endpoints automatically use the cache!"
echo ""
echo ""

# Test 10: Error handling
echo -e "${BLUE}Test 10: Error handling${NC}"
echo "Test with invalid username:"
echo "curl -s '$BASE_URL/api/player/InvalidPlayer12345XYZ' | jq '.'"
echo ""
echo ""

echo -e "${GREEN}================================"
echo "Tests complete!"
echo "================================${NC}"
echo ""
echo "To run actual requests with real data:"
echo "1. Get a player UUID first from /api/player/{username}"
echo "2. Use that UUID for other endpoints"
echo "3. Monitor cache with /api/cache/stats"
echo ""
echo "For detailed documentation, see HYPIXEL_WRAPPER_GUIDE.md"
