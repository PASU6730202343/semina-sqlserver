#!/bin/sh
# Convenience script: run this once each time you open PuTTY, before using/demoing the site.
# This server tears down all background processes when the SSH session ends (bubblewrap
# sandbox per session), so the backend must be restarted at the beginning of every session.
set -eu

cd "$(dirname "$0")"

old_pid="$(pgrep -f 'uvicorn main:app' || true)"
if [ -n "$old_pid" ]; then
  echo "Stopping existing backend (PID $old_pid)..."
  kill "$old_pid"
  sleep 1
fi

echo "Starting backend..."
nohup ./run.sh > backend.log 2>&1 &
sleep 2

if curl -s http://localhost:3009/ > /dev/null; then
  echo "Backend is up: http://119.59.102.161:3009/"
else
  echo "Backend did not respond — check backend.log:"
  tail -n 30 backend.log
fi
