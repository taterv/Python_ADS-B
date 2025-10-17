from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Aircraft(Base):
    """
    Aircraft model
    """
    __tablename__ = 'aircraft'
    
    id = Column(Integer, primary_key=True)
    icao = Column(String(6), unique=True, nullable=False, index=True)
    callsign = Column(String(8), nullable=True)
    first_seen = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_seen = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    message_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<Aircraft(icao={self.icao}, callsign={self.callsign}, messages={self.message_count})>"