import numpy as np


def detect_preamble(mag, i, spb, threshold):
    """
    Detect Mode S preamble pattern in magnitude array.
    
    Mode S uses an 8 µs preamble with a specific pulse pattern:
    1010000010101000 (16 chips x 0.5 µs each)
    High pulses occur at chips 0, 2, 7, and 9 (at 0, 1, 3.5, 4.5 µs)
    
    """
    try:
        # Sample at center of each 0.5 µs chip for accurate detection
        high_times = [0.25, 1.25, 3.75, 4.75]  # Centers of high pulse chips
        low_times = [2.25, 2.75, 5.25, 6.25, 7.25]  # Centers of low valley chips
        
        highs = [mag[int(i + t * spb)] for t in high_times]
        lows = [mag[int(i + t * spb)] for t in low_times]
        
        avg_high = np.mean(highs)
        avg_low = np.mean(lows)
        
        if avg_high < threshold:
            return False
            
        if avg_high < avg_low * 2.0:
            return False
            
        if min(highs) < threshold * 0.6:
            return False
        
        if max(lows) > avg_high * 0.6:
            return False
                
        return True
        
    except IndexError:
        return False


def decode_bits(mag, start_idx, spb, num_bits=112):
    """
    Decode Pulse Position Modulation (PPM) bits from magnitude array.
    
    Mode S uses PPM where each bit is 1 µs divided into two 0.5 µs chips:
        - Bit = 1: pulse in first chip, low in second chip
        - Bit = 0: low in first chip, pulse in second chip
    
    The data payload begins 8 µs after the preamble start. Each bit is decoded
    by comparing signal strength at the center of each chip (0.25 and 0.75 µs
    into the bit period).
    """
    bits = []
    
    for bit_num in range(num_bits):
        # Each bit is 1 µs, starting 8 µs after preamble
        bit_start = start_idx + (8 + bit_num) * spb
        
        try:
            # Sample at center of each 0.5 µs chip
            idx1 = int(bit_start + 0.25 * spb)  # Center of first chip
            idx2 = int(bit_start + 0.75 * spb)  # Center of second chip
            
            chip1 = mag[idx1]
            chip2 = mag[idx2]
            
            # PPM: first chip > second chip means bit = 1
            bits.append(1 if chip1 > chip2 else 0)
            
        except IndexError:
            break
    
    return bits


def bits_to_hex(bits):
    """
    Convert binary bit array to hexadecimal string representation.
    
    Mode S frames come in two lengths:
        - Short frames: 56 bits (14 hex characters)
        - Long frames: 112 bits (28 hex characters)
    """
    if len(bits) >= 112:
        b112 = "".join(str(b) for b in bits[:112])
        return f"{int(b112, 2):028X}"
    elif len(bits) >= 56:
        b56 = "".join(str(b) for b in bits[:56])
        return f"{int(b56, 2):014X}"
    else:
        return None


def detect_messages(samples, sample_rate=2.4e6):
    """
    Detect and decode Mode S ADS-B messages from IQ sample stream.
    
    Processes raw SDR samples to find and decode Mode S transponder messages
    transmitted at 1090 MHz. The function:
        1. Converts IQ samples to magnitude
        2. Applies smoothing filter to reduce noise
        3. Calculates dynamic detection threshold
        4. Scans for preambles and decodes message bits
    
    The function uses adaptive thresholding (mean + 2σ) and enforces a minimum
    120 µs gap between messages to prevent duplicate detections. It advances by
    1 µs increments when scanning for preambles.
    """
    magnitudes = np.abs(samples)
    
    # Apply smoothing filter (0.5 µs window) to reduce noise
    window = int(sample_rate / 1e6 * 0.5)
    if window > 1:
        magnitudes = np.convolve(magnitudes, np.ones(window)/window, mode='same')
    
    # Dynamic threshold: mean + 2 standard deviations
    threshold = np.mean(magnitudes) + 2.0 * np.std(magnitudes)
    
    messages = []
    spb = sample_rate / 1e6  # samples per microsecond
    i = 0
    min_gap = int(120 * spb)  # Minimum 120 µs between messages

    while i < len(magnitudes) - int(120 * spb):
        if detect_preamble(magnitudes, i, spb, threshold):
            bits = decode_bits(magnitudes, i, spb, 112)
            
            if len(bits) >= 56:
                hex_msg = bits_to_hex(bits)
                if hex_msg:
                    messages.append(hex_msg)
                    # Skip past this message to avoid re-detecting
                    i += min_gap
                    continue
        
        i += int(spb)  # Advance by 1 µs
    
    return messages