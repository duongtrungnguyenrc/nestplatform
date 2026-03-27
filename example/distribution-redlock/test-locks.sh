#!/bin/bash

# Ensure no process is using port 3000 initially
kill -9 $(lsof -t -i:3000) 2>/dev/null
sleep 1

function test_project() {
  local project=$1
  echo "========================================="
  echo ">>> Testing $project"
  echo "========================================="
  cd $project
  
  echo "Running pnpm install from workspace root..."
  (cd ../.. && pnpm install) || echo "Install failed"

  
  echo "Starting server on port 3000..."
  npx nest start > server.log 2>&1 &
  SERVER_PID=$!
  
  # Wait until server is ready (max 15 seconds)
  echo "Waiting for server to boot..."
  for i in {1..15}; do
    if curl -s http://localhost:3000/lock/static > /dev/null; then
      echo "Server is up!"
      break
    fi
    sleep 1
  done
  
  echo "Firing 3 concurrent requests to /lock/static"
  curl -s http://localhost:3000/lock/static &
  curl -s http://localhost:3000/lock/static &
  curl -s http://localhost:3000/lock/static &
  
  # wait for requests to finish
  sleep 4
  
  echo ""
  echo "--- Server Log Output for Locks ---"
  cat server.log | grep -i "lock acquired"
  echo "-----------------------------------"
  
  echo "Killing server..."
  # Kill anything running on port 3000 to ensure we don't leave zombie processes
  kill -9 $(lsof -t -i:3000) 2>/dev/null
  # Preserve log for debugging
  mv server.log server-last-run.log
  cd ..
  echo ">>> Finished $project"
  echo ""
}

cd "$(dirname "$0")"

test_project "distribution-redlock"

echo "All tests complete!"
