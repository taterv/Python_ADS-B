# ADS-B Decoder with ADS-B SDR

This project collects and decodes ADS-B (Mode S) messages from aircraft using an ADS-B SDR USB dongle. It demodulates raw IQ samples, detects Mode S preambles, decodes messages, and parses aircraft information.

## Features

- Collects IQ samples from ADS-B SDR at 1090 MHz (ADS-B frequency)
- Detects and decodes Mode S (ADS-B) messages in real time
- Uses [pyModeS](https://github.com/junzis/pyModeS) for message parsing and CRC checking
- Prints aircraft ICAO, callsign, and message type

## Requirements

- Python 3.x
- [pyrtlsdr](https://github.com/roger-/pyrtlsdr)
- [pyModeS](https://github.com/junzis/pyModeS)
- [NumPy](https://numpy.org/)

- ADS-B SDR USB dongle and antenna (I used AirNav Radar ADS-B with 1090MHz antenna)

Install dependencies if running outside venv:
```sh
pip install -r requirements.txt
```

## Usage

1. Plug in the ADS-B SDR dongle to your device and connect the antenna to the SDR.
2. Run the main script:
    ```sh
    bash start.sh
    ```
3. The script will print detected ADS-B messages, including aircraft ICAO addresses and callsigns. Example return (https://www.flightdb.net/aircraft.php?modes=461FA2): 

```sh
    DF17 | ICAO 461FA2 | 8D461FA2990C479ED86802B6BE37
```


## Notes

- Default sample rate: **2.4 Msps**
- Default frequency: **1090 MHz**
- Default gain: **40.2 dB**
- Stop the script with `Ctrl+C`.

## References

- [pyModeS documentation](https://mode-s.org/pymodes/api/)
- [mode-s org](https://mode-s.org/1090mhz/content/ads-b/1-basics.html)