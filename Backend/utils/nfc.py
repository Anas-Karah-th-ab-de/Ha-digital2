import sys
from smartcard.System import readers
from smartcard.util import toHexString

# Liste der verfügbaren Leser erhalten
r = readers()
if len(r) == 0:
    print("Keine Leser gefunden.")
    sys.exit()

# Ersten Leser auswählen
reader = r[0]
connection = reader.createConnection()
connection.connect()

# Befehle senden und UID auslesen
GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
data, sw1, sw2 = connection.transmit(GET_UID)

if sw1 == 0x90 and sw2 == 0x00:
    print("Card UID: ", toHexString(data))
else:
    print(f"Fehler beim Lesen der Karte: SW1={sw1} SW2={sw2}")
