const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // NFC-Instanz erstellen

nfc.on('reader', reader => {
    console.log(`Leser gefunden: ${reader.reader.name}`);

    reader.on('card', async card => {
        console.log(`Karte erkannt: ${card.uid}`);

        // UID-Befehl senden
        const GET_UID = Buffer.from([0xFF, 0xCA, 0x00, 0x00, 0x00]);

        try {
            const response = await reader.transmit(GET_UID, 40); // UID auslesen
            const [sw1, sw2] = response.slice(-2); // Statuswörter auslesen

            if (sw1 === 0x90 && sw2 === 0x00) {
                const uid = response.slice(0, -2); // UID extrahieren
                console.log('Card UID:', uid.toString('hex'));
            } else {
                console.log(`Fehler beim Lesen der Karte: SW1=${sw1.toString(16)} SW2=${sw2.toString(16)}`);
            }
        } catch (err) {
            console.error('Fehler bei der Übertragung:', err);
        }
    });

    reader.on('error', err => {
        console.error(`Fehler am Leser ${reader.reader.name}:`, err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} entfernt.`);
    });
});

nfc.on('error', err => {
    console.error('Fehler:', err);
});
