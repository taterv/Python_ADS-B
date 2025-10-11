import pyModeS as pms
import time
from collections import defaultdict

aircraft_state = defaultdict(lambda: {
    'even_msg': None,
    'odd_msg': None,
    'even_time': 0,
    'odd_time': 0,
    'last_seen': 0,
    'callsign': None,
    'altitude': None,
    'position': None,
    'velocity': None,
    'heading': None,
    'vertical_rate': None
})

def handle_identification(msg, icao):
    """Handle TC 1-4: Aircraft Identification and Category."""
    tc = pms.adsb.typecode(msg)
    callsign = pms.adsb.callsign(msg).strip()
    category = pms.adsb.category(msg)
    
    aircraft_state[icao]['callsign'] = callsign
    
    print(f"Callsign: {callsign}")
    print(f"Category: {category} (TC{tc})")
    
    # Category breakdown:
    # TC1: No category info, TC2: Surface vehicle, 
    # TC3: Ground obstruction, TC4: Aircraft


def handle_airborne_position(msg, icao):
    """Handle TC 9-18: Airborne Position with proper Compact Position Reporting (CPR) decoding.
       Postions are reported both with even and odd frames, and both are required for exact position. 
    """
    tc = pms.adsb.typecode(msg)
    
    try:
        altitude = pms.adsb.altitude(msg)
        aircraft_state[icao]['altitude'] = altitude
    except:
        altitude = None
    
    # Determine even/odd frame for CPR
    oe_flag = pms.adsb.oe_flag(msg)
    current_time = time.time()
    
    if oe_flag == 0:  # Even frame
        aircraft_state[icao]['even_msg'] = msg
        aircraft_state[icao]['even_time'] = current_time
    else:  # Odd frame
        aircraft_state[icao]['odd_msg'] = msg
        aircraft_state[icao]['odd_time'] = current_time
    
    # Try to decode position if we have both even and odd frames
    even_msg = aircraft_state[icao]['even_msg']
    odd_msg = aircraft_state[icao]['odd_msg']
    even_time = aircraft_state[icao]['even_time']
    odd_time = aircraft_state[icao]['odd_time']
    
    # CPR requires both odd and even frames within ~10 seconds
    if even_msg and odd_msg and abs(even_time - odd_time) < 30:
        try:
            lat, lon = pms.adsb.position(even_msg, odd_msg, even_time, odd_time)
            aircraft_state[icao]['position'] = (lat, lon)
            
            alt_str = f"{altitude} ft" if altitude else "Unknown"
            print(f"Position: {lat:.6f}°, {lon:.6f}° @ {alt_str}")
            
            if tc in [9, 10, 11, 12]:
                print(f"Barometric altitude (TC{tc})")
            elif tc in [13, 14, 15, 16]:
                print(f"GNSS altitude (TC{tc})")
            elif tc in [17, 18]:
                print(f"Special position (TC{tc})")
                
        except Exception as e:
            print(f"Position decode failed: {e}")
    else:
        frame_type = "EVEN" if oe_flag == 0 else "ODD"
        alt_str = f"Alt: {altitude} ft" if altitude else "Alt: Unknown"
        print(f"Airborne position (TC{tc}) - {frame_type} frame, {alt_str}")
        print(f"(Need {'ODD' if oe_flag == 0 else 'EVEN'} frame to decode lat/lon)")

def handle_airborne_velocity(msg, icao):
    """Handle TC 19: Airborne Velocity."""
    try:
        velocity_data = pms.adsb.velocity(msg)
        if velocity_data:
            speed, heading, vertical_rate, speed_type = velocity_data
            
            aircraft_state[icao]['velocity'] = speed
            aircraft_state[icao]['heading'] = heading
            aircraft_state[icao]['vertical_rate'] = vertical_rate
            
            print(f"Speed: {speed} kt")
            print(f"Heading: {heading}°")
            print(f"Vertical rate: {vertical_rate} ft/min")
            print(f"Speed type: {speed_type}")  # 'GS' (ground speed) or 'TAS' (true airspeed)
    except Exception as e:
        print(f"Velocity decode failed: {e}")

def handle_df17_message(msg, icao):
    """Route DF17 (ADS-B) messages to appropriate handler."""
    tc = pms.adsb.typecode(msg)
    
    print(f"Type Code: {tc}")
    
    if 1 <= tc <= 4:
        handle_identification(msg, icao)
    elif 9 <= tc <= 18:
        handle_airborne_position(msg, icao)
    elif tc == 19:
        handle_airborne_velocity(msg, icao)
    else:
        print(f"Unknown/WIP/Reserved TC: {tc}")