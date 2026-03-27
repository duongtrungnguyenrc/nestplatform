#!/bin/bash

# Ensure no process is using port 3000 initially
kill -9 $(lsof -t -i:3000) 2>/dev/null
sleep 1

echo "========================================="
echo ">>> Testing redis example"
echo "========================================="
cd redis || exit 1

echo "Running npm install from workspace root (just in case)..."
(cd ../.. && npm i) || echo "Install failed"

echo "Starting server on port 3000..."
npx nest start > server.log 2>&1 &
SERVER_PID=$!

echo "Waiting for server to boot..."
for i in {1..15}; do
  if curl -s http://localhost:3000/redis/ping > /dev/null; then
    echo "Server is up!"
    break
  fi
  sleep 1
done

echo ""
echo "--- Testing Redis Operations ---"

# Test Ping
echo "1. PING Redis:"
curl -s http://localhost:3000/redis/ping
echo -e "\n"

# Test Set
echo "2. SET Key 'test_key' to 'Hello NestPlatform':"
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"key":"test_key","value":"Hello NestPlatform"}' \
  http://localhost:3000/redis/set
echo -e "\n"

# Test Get
echo "3. GET Key 'test_key':"
curl -s http://localhost:3000/redis/get/test_key
echo -e "\n"

echo "-----------------------------------"

echo "Killing server..."
kill -9 $(lsof -t -i:3000) 2>/dev/null

# Preserve log for debugging
mv server.log server-last-run.log
cd ..
echo ">>> Finished testing redis example"
echo "All tests complete!"
