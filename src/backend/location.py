import requests
import geocoder

def get_public_ip():
    """
    Dynamically gets the public (external) IP address of the device 
    by querying the ipify API. """
    try:
        response = requests.get('https://api.ipify.org')
        response.raise_for_status()
        return response.text.strip()
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving public IP: {e}")
        return None

def get_lat_long_from_device_ip():
    """
    Gets the device's public IP and then uses geocoder to find 
    its latitude and longitude."""
    
    ip_address = get_public_ip()
    
    if not ip_address:
        return None
    
    try:
        g = geocoder.ip(ip_address)  
        if g.ok:
            return g.latlng
        else:
            print(f"Geolocation failed for IP: {ip_address}")
            return None
            
    except Exception as e:
        print(f"An error occurred during geolocation: {e}")
        return None
