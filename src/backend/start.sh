# Linux/Mac
chmod +x setup.sh
./setup.sh
source venv/bin/activate
python src/main.py
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
