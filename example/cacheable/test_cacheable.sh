#!/bin/bash

# Configuration
BASE_URL="http://localhost:3000/products"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Cacheable Manual Verification...${NC}\n"

# 1. Get All Products (First call - should take ~500ms if I added delay, wait I didn't add delay to getAll)
echo -e "${BLUE}1. Reading all products (Initial)${NC}"
time curl -s "$BASE_URL" | json_pp 2>/dev/null || curl -s "$BASE_URL"
echo -e "\n"

# 2. Get Single Product (First call - should take ~500ms)
echo -e "${BLUE}2. Reading product 1 (Cache Miss)${NC}"
time curl -s "$BASE_URL/1" | json_pp 2>/dev/null || curl -s "$BASE_URL/1"
echo -e "\n"

# 3. Get Single Product (Second call - should be nearly instantaneous)
echo -e "${BLUE}3. Reading product 1 again (Cache Hit)${NC}"
time curl -s "$BASE_URL/1" | json_pp 2>/dev/null || curl -s "$BASE_URL/1"
echo -e "\n"

# 4. Update Product (Triggers @CachePut)
echo -e "${BLUE}4. Updating product 1 (Cache Put)${NC}"
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"iPhone 15 Pro Max","price":1199}' \
  "$BASE_URL/1" | json_pp 2>/dev/null || curl -s -X POST -H 'Content-Type: application/json' -d '{"name":"iPhone 15 Pro Max","price":1199}' "$BASE_URL/1"
echo -e "\n"

# 5. Get Single Product (Should reflect updated value from cache)
echo -e "${BLUE}5. Reading product 1 after update (Cache Hit - Updated Value)${NC}"
time curl -s "$BASE_URL/1" | json_pp 2>/dev/null || curl -s "$BASE_URL/1"
echo -e "\n"

# 6. Delete Product (Triggers @CacheEvict)
echo -e "${BLUE}6. Deleting product 1 (Cache Evict)${NC}"
curl -s -X DELETE "$BASE_URL/1"
echo -e "\n"

# 7. Get Single Product (Should be cache miss and return empty/null or not found)
echo -e "${BLUE}7. Reading product 1 after delete (Cache Miss - Not Found)${NC}"
time curl -s "$BASE_URL/1" | json_pp 2>/dev/null || curl -s "$BASE_URL/1"
echo -e "\n"

# 8. Get All Products again
echo -e "${BLUE}8. Reading all products after changes${NC}"
curl -s "$BASE_URL" | json_pp 2>/dev/null || curl -s "$BASE_URL"
echo -e "\n"

# 9. Clear All Products Cache
echo -e "${BLUE}9. Clearing all products cache${NC}"
curl -s -X POST "$BASE_URL/clear-cache"
echo -e "\n"

echo -e "${GREEN}Verification Complete!${NC}"
