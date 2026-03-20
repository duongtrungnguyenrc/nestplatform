#!/bin/bash
set -e

echo "Testing transactional-typeorm..."

echo "1. POST /orders"
curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productName":"Laptop","amount":1500}'
echo -e "\n"

echo "2. POST /orders/with-event"
curl -s -X POST http://localhost:3000/orders/with-event \
  -H "Content-Type: application/json" \
  -d '{"productName":"Mouse","amount":50}'
echo -e "\n"

echo "3. POST /orders/test-rollback (Expected to return 500 error but rollback should be visible in logs)"
curl -s -X POST http://localhost:3000/orders/test-rollback
echo -e "\n\n"

echo "4. Checking Database for Records (The rollback record should NOT be here)"
docker exec nestcloud-postgres-1 psql -U postgres -d postgres -c 'SELECT "id", "productName", "amount", "status" FROM "orders";'
echo -e "\n"
