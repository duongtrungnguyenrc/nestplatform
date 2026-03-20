#!/bin/bash
set -e

echo "Testing transactional-mongoose..."

echo "1. POST /orders"
curl -s -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productName":"Laptop","amount":1500}'
echo -e "\n"

echo "2. POST /orders/requires-new"
curl -s -X POST http://localhost:3000/orders/requires-new \
  -H "Content-Type: application/json" \
  -d '{"productName":"Mouse","amount":50}'
echo -e "\n"

echo "3. POST /orders/conditional-rollback (Expected to return 500 and rollback)"
curl -s -X POST http://localhost:3000/orders/conditional-rollback \
  -H "Content-Type: application/json" \
  -d '{"productName":"Keyboard","amount":100,"shouldTypeMatch":true}'
echo -e "\n\n"

echo "4. Checking Database for Records (The Keyboard record should NOT be here)"
docker exec nestcloud-mongo-1 mongosh mongo-local --eval 'db.orders.find({}, { productName: 1, amount: 1, status: 1 }).toArray()'
echo -e "\n"
