from rtlsdr import RtlSdr
import pyModeS as pms
import adsb_demodulator as adsb

# --- SDR Setup ---
sdr = RtlSdr()
sdr.sample_rate = 2.4e6
sdr.center_freq = 1090e6
sdr.gain = 40.2

# --- Main loop ---
print("Listening for ADS-B on 1090 MHz... (Ctrl+C to stop)")
print(f"Sample rate: {sdr.sample_rate/1e6:.1f} Msps, Gain: {sdr.gain} dB")

valid_count = 0
total_count = 0

try:
    chunk_size = 256 * 1024
    while True:
        samples = sdr.read_samples(chunk_size)
        msgs = adsb.detect_messages(samples, sdr.sample_rate)
        
        for msg in msgs:
            total_count += 1
            
            try:
                if pms.crc(msg) == 0:  # valid CRC
                    valid_count += 1
                    df = pms.df(msg) # Downlink Format
                    icao = pms.icao(msg)
                    print(f"✓ DF{df:2d} | ICAO {icao} | {msg}")
                    print("Downlink Format:", df)
                    if df == 17:  # ADS-B
                        tc = pms.adsb.typecode(msg)
                        if 1 <= tc <= 4:  # Identification
                            callsign = pms.adsb.callsign(msg)
                            print(f"   Callsign: {callsign}")
                        elif 9 <= tc <= 18:  # Airborne position
                            position = pms.adsb.position(msg, None, None)
                            altitude = pms.adsb.altitude(msg)
                            print(f"   Position message (POS={position, altitude})")
                        elif tc == 19:  # Airborne velocity
                            velocity = pms.adsb.velocity(msg)
                            heading = pms.adsb.heading(msg)
                            print(f"   Velocity message (VEL={velocity, heading})" )

                        elif tc == 28: # Aircraft status
                            pass
            except Exception as e:
                pass
        
        if total_count > 0 and total_count % 100 == 0:
            print(f"Stats: {valid_count}/{total_count} valid ({100*valid_count/total_count:.1f}%)")
            
except KeyboardInterrupt:
    print(f"\n\nFinal stats: {valid_count}/{total_count} valid messages")
finally:
    sdr.close()
    print("SDR device closed.")