"""
Database manager
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from db.models.aircraft import Aircraft, Base
import re

class DatabaseManager:
    def __init__(self, db_path='adsb_data.db', echo=False):
        self.db_path = db_path
        self.engine = create_engine(f'sqlite:///{db_path}', echo=echo)
        self.Session = sessionmaker(bind=self.engine)
        
        Base.metadata.create_all(self.engine)
    
    def get_session(self):
        return self.Session()
    
    def add_aircraft(self, icao, callsign=None):
        session = self.get_session()
        try:
            aircraft = session.query(Aircraft).filter_by(icao=icao).first()
            
            if aircraft:
                aircraft.last_seen = datetime.utcnow()
                aircraft.message_count += 1
                if callsign and callsign.strip():
                    aircraft.callsign = callsign.strip()
            else:
                aircraft = Aircraft(
                    icao=icao,
                    callsign=callsign.strip() if callsign else None
                )
                session.add(aircraft)
            
            session.commit()
            return aircraft
            
        except Exception as e:
            session.rollback()
            print(f"Error adding aircraft: {e}")
            return None
        finally:
            session.close()
            
    def update_callsign(self, icao, callsign):
        session = self.get_session()
        try:
            aircraft = session.query(Aircraft).filter_by(icao=icao).first()
            
            if aircraft:
                aircraft.callsign = callsign.strip()
                callsign = callsign.re.sub(r'[^a-zA-Z0-9]', '', callsign)
                aircraft.last_seen = datetime.utcnow()
            else:
                aircraft = Aircraft(icao=icao, callsign=callsign.strip())
                callsign = callsign.re.sub(r'[^a-zA-Z0-9]', '', callsign)
                session.add(aircraft)
            
            session.commit()
            
        except Exception as e:
            session.rollback()
            print(f"Error updating callsign: {e}")
        finally:
            session.close()

    def update_location(self, icao, location):
        """Update or create aircraft row with latest location.
           location is expected as a string 'lat,lon' or similar.
        """
        session = self.get_session()
        try:
            aircraft = session.query(Aircraft).filter_by(icao=icao).first()
            
            if aircraft:
                aircraft.location = location
                aircraft.last_seen = datetime.utcnow()
                session.commit()
            else:
                aircraft = Aircraft(icao=icao, location=location)
                session.add(aircraft)
                session.commit()
        except Exception as e:
            session.rollback()
            print(f"Error updating location: {e}")
        finally:
            session.close()

    def get_all_aircraft(self):
        session = self.get_session()
        try:
            aircraft_list = session.query(Aircraft).all()
            return aircraft_list
        finally:
            session.close()