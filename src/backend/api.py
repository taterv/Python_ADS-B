"""
FastAPI server to expose ADS-B database
Run: uvicorn api:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import DatabaseManager
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI(title="ADS-B API")

# Enable CORS for frontend on different machine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your PC's IP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
db = DatabaseManager()

# Response models
class AircraftResponse(BaseModel):
    id: int
    icao: str
    callsign: Optional[str]
    first_seen: str
    last_seen: str
    message_count: int

class StatsResponse(BaseModel):
    total_aircraft: int
    active_1h: int
    active_30m: int
    total_messages: int

@app.get("/")
def read_root():
    return {"message": "ADS-B API Server", "status": "running"}

@app.get("/api/aircraft", response_model=List[AircraftResponse])
def get_aircraft(
    active_only: bool = False,
    minutes: int = 30,
    limit: int = 1000
):
    """Get all aircraft or only active ones."""
    if active_only:
        aircraft_list = db.get_active_aircraft(minutes=minutes)
    else:
        aircraft_list = db.get_all_aircraft()
    
    # Limit results
    aircraft_list = aircraft_list[:limit]
    
    # Convert to response format
    return [
        AircraftResponse(
            id=ac.id,
            icao=ac.icao,
            callsign=ac.callsign,
            first_seen=ac.first_seen.isoformat(),
            last_seen=ac.last_seen.isoformat(),
            message_count=ac.message_count
        )
        for ac in aircraft_list
    ]

@app.get("/api/aircraft/{icao}", response_model=AircraftResponse)
def get_aircraft_by_icao(icao: str):
    """Get specific aircraft by ICAO."""
    aircraft = db.get_aircraft(icao)
    if not aircraft:
        return {"error": "Aircraft not found"}, 404
    
    return AircraftResponse(
        id=aircraft.id,
        icao=aircraft.icao,
        callsign=aircraft.callsign,
        first_seen=aircraft.first_seen.isoformat(),
        last_seen=aircraft.last_seen.isoformat(),
        message_count=aircraft.message_count
    )

@app.get("/api/stats", response_model=StatsResponse)
def get_stats():
    """Get database statistics."""
    stats = db.get_statistics()
    return StatsResponse(**stats)

@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)