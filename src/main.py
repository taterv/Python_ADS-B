from rtlsdr import RtlSdr
import pyModeS as pms
import adsb_demodulator as adsb
import tc_functions as tc
import time
import numpy as np

# --- SDR Setup ---
sdr = RtlSdr()
sdr.sample_rate = 2.0e6
sdr.center_freq = 1090e6
sdr.gain = 40

# --- Main loop ---
print("Listening for ADS-B on 1090 MHz... (Ctrl+C to stop)")
print(f"Sample rate: {sdr.sample_rate/1e6:.1f} Msps, Gain: {sdr.gain} dB")

valid_count = 0
total_count = 0
stats_interval = 200

try:
    chunk_size = 128 * 1024
    
    while True:
        samples = sdr.read_samples(chunk_size)
        msgs = adsb.detect_messages(samples, sdr.sample_rate)
        
        for msg in msgs:
            total_count += 1
            
            crc_result = pms.crc(msg)
            if crc_result == 0:  # valid CRC
                valid_count += 1
                df = pms.df(msg)
                icao = pms.icao(msg)
                print(f"✓ DF{df:2d} | ICAO {icao} | {msg}")
                    
                if df == 17:  # ADS-B
                    tc.handle_df17_message(msg, icao)
                elif df == 18:  # TIS-B / ADS-R
                    print("Non-transponder ADS-B")
        
        time.sleep(0.1) 
            
except KeyboardInterrupt:
    print(f"\n\nFinal stats: {valid_count}/{total_count} valid messages")
finally:
    sdr.close()
    print("SDR device closed.")