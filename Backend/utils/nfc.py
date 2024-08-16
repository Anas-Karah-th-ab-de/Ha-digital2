import sys
import json
from smartcard.System import readers
from smartcard.util import toHexString
import tkinter as tk
from tkinter import messagebox

class NFCApp:
    def __init__(self, root):
        self.root = root
        self.root.title("NFC Reader and User Assignment")

        # UI Setup
        self.uid_label = tk.Label(root, text="Card UID: Not Read")
        self.uid_label.pack(pady=10)

        self.user_entry = tk.Entry(root)
        self.user_entry.pack(pady=10)
        self.user_entry.insert(0, "Enter Username")

        self.assign_button = tk.Button(root, text="Assign UID to User", command=self.assign_uid_to_user, state=tk.DISABLED)
        self.assign_button.pack(pady=10)

        self.read_button = tk.Button(root, text="Read UID", command=self.read_uid)
        self.read_button.pack(pady=10)

        self.write_button = tk.Button(root, text="Write Data to Card", command=self.write_data_to_card, state=tk.DISABLED)
        self.write_button.pack(pady=10)

        self.exit_button = tk.Button(root, text="Exit", command=root.quit)
        self.exit_button.pack(pady=10)

        self.uid = None

    def read_uid(self):
        r = readers()
        if len(r) == 0:
            messagebox.showerror("Error", "No readers found.")
            return

        reader = r[0]
        connection = reader.createConnection()
        try:
            connection.connect()
            GET_UID = [0xFF, 0xCA, 0x00, 0x00, 0x00]
            data, sw1, sw2 = connection.transmit(GET_UID)

            if sw1 == 0x90 and sw2 == 0x00:
                self.uid = ''.join(f'{byte:02X}' for byte in data)
                self.uid_label.config(text=f"Card UID: {self.uid}")
                self.assign_button.config(state=tk.NORMAL)
                self.write_button.config(state=tk.NORMAL)
            else:
                messagebox.showerror("Error", f"Failed to read card: SW1={sw1} SW2={sw2}")

        except Exception as e:
            messagebox.showerror("Error", f"Exception occurred: {str(e)}")

    def assign_uid_to_user(self):
        if self.uid:
            username = self.user_entry.get()
            if username:
                self.save_assignment(username, self.uid)
                messagebox.showinfo("Success", f"UID {self.uid} assigned to user {username}.")
            else:
                messagebox.showerror("Error", "Please enter a username.")
        else:
            messagebox.showerror("Error", "No UID to assign.")

    def write_data_to_card(self):
        if not self.uid:
            messagebox.showerror("Error", "No UID to write.")
            return

        r = readers()
        if len(r) == 0:
            messagebox.showerror("Error", "No readers found.")
            return

        reader = r[0]
        connection = reader.createConnection()
        try:
            connection.connect()

            dataToWrite = "Anas Karah 017641194140"
            startBlock = 4
            dataBuffer = dataToWrite.encode('utf-8')

            for i in range(0, len(dataBuffer), 4):
                blockData = dataBuffer[i:i + 4]
                paddedData = blockData.ljust(4, b'\x00')
                apdu = [0xFF, 0xD6, 0x00, startBlock + (i // 4), 0x04] + list(paddedData)
                _, sw1, sw2 = connection.transmit(apdu)

                if sw1 == 0x90 and sw2 == 0x00:
                    print(f"Data written to block {startBlock + (i // 4)}: {paddedData}")
                else:
                    print(f"Error writing to block {startBlock + (i // 4)}: SW1={sw1} SW2={sw2}")

            messagebox.showinfo("Success", "Data written successfully to the NFC tag.")
        except Exception as e:
            messagebox.showerror("Error", f"Exception occurred while writing to the card: {str(e)}")

    def save_assignment(self, username, uid):
        try:
            with open('nfc_user_mapping.json', 'r+') as file:
                data = json.load(file)
                data[uid] = username
                file.seek(0)
                json.dump(data, file, indent=4)
        except FileNotFoundError:
            with open('nfc_user_mapping.json', 'w') as file:
                data = {uid: username}
                json.dump(data, file, indent=4)

if __name__ == "__main__":
    root = tk.Tk()
    app = NFCApp(root)
    root.mainloop()
