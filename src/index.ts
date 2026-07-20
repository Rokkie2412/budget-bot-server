import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import puppeteer from "puppeteer-core";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

import { Transaction, UserConnected } from "./models";
import {
  deleteLastTransaction,
  hashUserId,
  transactionHistoryBy,
  TransactionInMatchWithRegex,
  TransactionOutMatchWithRegex,
  transactionRecordCurrentMonth,
} from "./utils";
import { helpCommand } from "./utils/help";

dotenv.config();
const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV === "development";
const dbURI = isDev ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PROD;

//connect to mongodb
mongoose
  .connect(dbURI || "")
  .then(() =>
    console.log(
      `Connected to MongoDB ${isDev ? "development" : "production"} mode 🛻`,
    ),
  )
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB", err);
    return process.exit(1);
  });

//setup whatsapp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    // Memaksa whatsapp-web.js membaca puppeteer-core kosongan kita
    module: puppeteer,
    headless: true,

    // Trik jitu: Gunakan executablePath dari environment variable .env 
    // atau fallback ke path biner manual jika kamu menginstall 'links' atau 'chromium'
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (process.platform === 'android' ? "/data/data/com.termux/files/usr/bin/chromium" : undefined),

    handleSIGINT: false,
    timeout: 0, // Mencegah error timeout saat loading page
    protocolTimeout: 0, // Mencegah ProtocolError Network.getResponseBody timed out
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      ...(process.platform === 'android' ? ["--single-process"] : []),
      "--disable-gpu",
    ],
  },
  ...(process.env.PAIRING_NUMBER 
      ? { pairWithPhoneNumber: { phoneNumber: process.env.PAIRING_NUMBER } } 
      : {}),
});

client.on("qr", (qr) => {
  console.log("QR code received, scanning...");
  qrcode.generate(qr, { small: true });
  console.log("\n🔗 Buka link ini di browser untuk scan QR:");
  console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
  console.log("\n💡 Tips HP Kentang (Redmi 6A dll):");
  console.log("Jika gagal scan QR, gunakan Pairing Code. Tambahkan PAIRING_NUMBER=628... di file .env lalu restart.");
});

client.on("code", (code) => {
  console.log(`\n📲 PAIRING CODE ANDA: ${code}`);
  console.log("Masukkan kode di atas pada aplikasi WhatsApp Anda (Linked Devices -> Link with phone number)\n");
});

client
  .on("ready", (): void => {
    console.log("✅ WhatsApp client is ready!");
  })

  //core logic of client
  .on("message", async (message) => {
    const contact = await message.getContact();
    const rawNumber = contact.number;
    const formattedNumber = `+${rawNumber}`;
    const incomeRegex = /^(?:\+|masuk)\s+(\d+(?:[\.,]\d+)*)(?:\s+(.+))?$/i;
    const historyRegex = /^\.(last|history|cek)(?:\s+(\d+))?$/i;
    const rekapRegex = /^\.(rekap)$/i;
    const helpRegex = /^\.(help)$/i;
    const undoRegex = /^\.(batal|undo)$/i;

    try {
      const checkConnectedUser = await UserConnected.findOne({
        userId: formattedNumber,
      });

      if (!checkConnectedUser) {
        console.log("User tidak terdaftar", checkConnectedUser);
        return;
      }

      const hashedUserId = hashUserId(formattedNumber);
      let match;

      if ((match = message.body.match(rekapRegex))) {
        await transactionRecordCurrentMonth(hashedUserId, message, Transaction);
      } else if ((match = message.body.match(incomeRegex))) {
        await TransactionInMatchWithRegex(hashedUserId, message, match);
      } else if ((match = message.body.match(historyRegex))) {
        transactionHistoryBy(hashedUserId, message, match);
      } else if ((match = message.body.match(helpRegex))) {
        helpCommand(message, match);
      } else if ((match = message.body.match(undoRegex))) {
        deleteLastTransaction(hashedUserId, message);
      } else {
        await TransactionOutMatchWithRegex(hashedUserId, message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  });

client.initialize();

const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
  console.log(`🚀 Server run at http://localhost:${PORT}`);
});
