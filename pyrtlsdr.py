from rtlsdr import RtlSdr
import numpy as np
import pyModeS as pms

# --- SDR Setup ---
sdr = RtlSdr()
sdr.sample_rate = 2.4e6
sdr.center_freq = 1090e6
sdr.gain = 40.2


def has_preamble(m, i, spb):
    """Check Mode-S 8 µs preamble at index i."""
    return (
        m[int(i+0*spb)]   > 4 and
        m[int(i+0.5*spb)] > 4 and
        m[int(i+1*spb)]   > 4 and
        m[int(i+3.5*spb)] > 4 and
        m[int(i+1.5*spb)] < 2 and
        m[int(i+2.5*spb)] < 2 and
        m[int(i+4*spb)]   < 2 and
        m[int(i+5*spb)]   < 2
    )

def bits_to_hex(bits):
    n = len(bits)
    print('n', n)
    if n >= 112:
        b112 = "".join(str(b) for b in bits[:112])
        return f"{int(b112, 2):028X}"
    elif n >= 56:
        b56 = "".join(str(b) for b in bits[:56])
        return f"{int(b56, 2):014X}"
    else:
        return None

def detect_messages(samples, sample_rate=2.4e6):
    magnitudes = np.abs(samples)
    magnitudes = (magnitudes - np.mean(magnitudes)) / np.std(magnitudes)

    messages = []
    spb = sample_rate / 1e6  # samples per microsecond (~2.4 at 2.4 Msps)
    i = 0

    while i < len(magnitudes) - int((8+112) * spb):
        if has_preamble(magnitudes, i, spb):
            bits = []
            # Extract up to 112 bits
            for bit in range(112):
                start = int(i + (8 + bit) * spb)
                mid   = int(start + 0.5 * spb)
                end   = int(start + 1.0 * spb)
                first_half  = np.sum(magnitudes[start:mid])
                second_half = np.sum(magnitudes[mid:end])
                bits.append(1 if first_half > second_half else 0)

            hex_msg = bits_to_hex(bits)
            if hex_msg:
                messages.append(hex_msg)

            # skip past this message
            i += int((8+112) * spb)
        else:
            i += 1

    return messages

# --- Main loop ---
print("Listening for ADS-B on 1090 MHz... (Ctrl+C to stop)")
try:
    chunk_size = 256 * 1024
    while True:
        samples = sdr.read_samples(chunk_size)
        msgs = detect_messages(samples, sdr.sample_rate)
        for msg in msgs:
            if pms.crc(msg) == 0:  # valid CRC
                print(f"DF{pms.df(msg)} | ICAO {pms.icao(msg)} | MSG {msg}")
except KeyboardInterrupt:
    pass
finally:
    sdr.close()
    print("SDR device closed.")
