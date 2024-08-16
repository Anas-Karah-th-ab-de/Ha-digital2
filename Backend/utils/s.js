const { NFC } = require('nfc-pcsc');

const nfc = new NFC();

nfc.on('reader', reader => {
    console.log(`${reader.reader.name} device attached`);

    reader.on('card', async card => {
        console.log(`Card detected: `, card);

        const dataToWrite = "Anas Karah 017641194140";
        const startBlock = 4; // Startblock, in den geschrieben werden soll
        const dataBuffer = Buffer.alloc(504); // Puffer für den gesamten Speicher
        dataBuffer.write(dataToWrite, 0, 'utf8'); // Daten in den Puffer schreiben

        try {
            for (let i = startBlock; i < startBlock + (dataBuffer.length / 4); i++) {
                const blockData = dataBuffer.slice((i - startBlock) * 4, (i - startBlock + 1) * 4);
                await reader.write(i, blockData, 4); // Schreibe jeweils 4 Bytes pro Block
                console.log(`Data written to block ${i}:`, blockData);
            }

            console.log('Data written successfully to the NFC 215 tag.');
        } catch (err) {
            console.error('Error during writing:', err);
        }
    });

    reader.on('error', err => {
        console.error('Reader error:', err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} device removed`);
    });
}); 
nfc.on('reader', reader => {
    console.log(`${reader.reader.name} device attached`);

    reader.on('card', async card => {
        console.log(`Card detected: `, card);

        try {
            const startBlock = 4; // Startblock, von dem gelesen werden soll
            const numberOfBlocks = 10; // Anzahl der Blöcke, die gelesen werden sollen

            for (let i = startBlock; i < startBlock + numberOfBlocks; i++) {
                const data = await reader.read(i, 16, 16); // Lies 16 Bytes aus jedem Block
                console.log(`Data read from block ${i}:`, data.toString('utf8'));
            }
        } catch (err) {
            console.error('Error during reading:', err);
        }
    });

    reader.on('error', err => {
        console.error('Reader error:', err);
    });

    reader.on('end', () => {
        console.log(`${reader.reader.name} device removed`);
    });
});
nfc.on('error', err => {
    console.error('NFC error:', err);
});
