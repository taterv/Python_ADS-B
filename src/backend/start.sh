# Linux/Mac
set -e

cd "$(dirname "$0")"
export PYTHONPATH="$(pwd)/.."
chmod +x setup.sh
./setup.sh
source venv/bin/activate

python -m backend.main &
MAIN_PID=$!

cleanup() {
  echo "Stopping processes..."
  kill "$MAIN_PID" 2>/dev/null || true
  wait "$MAIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload