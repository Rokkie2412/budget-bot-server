import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import qrcode from "qrcode-terminal";
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'

import { Transaction, UserConnected } from "./models/index.js";
import {
  deleteLastTransaction,
  hashUserId,
  transactionHistoryBy,
  TransactionInMatchWithRegex,
  TransactionOutMatchWithRegex,
  transactionRecordCurrentMonth,
  helpCommand
} from "./utils/index.js";

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

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
        qrcode.generate(qr, { small: true })
    }
    if (connection === 'close') {
        const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
        console.log('connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect)
        if (shouldReconnect) {
            connectToWhatsApp()
        }
    } else if (connection === 'open') {
        console.log('opened connection')
    }
  })

  sock.ev.on('messages.upsert', async (event) => {
    if (event.type !== 'notify') return
    const nomorTarget = "6285156141278";
    const keyEventId = event.messages[0]?.key.remoteJidAlt

    if (!keyEventId) return 

    const formattedNumber = `+${nomorTarget}`;
    const rekapRegex = /^\.(rekap)$/i;
    const regexMatch = new RegExp(nomorTarget);
    const getMyContact = regexMatch.test(keyEventId);
    const helpRegex = /^\.(help)$/i;
    const incomeRegex = /^(?:\+|masuk)\s+(\d+(?:[\.,]\d+)*)(?:\s+(.+))?$/i;

    console.log('getMyContact', getMyContact);
    console.log('get message', event.messages[0]?.message?.conversation);

    const getMessage =  event.messages[0]?.message?.conversation

    try {
        const checkConnectedUser = await UserConnected.findOne({
          userId: formattedNumber,
        });

        if (!checkConnectedUser) {
          console.log("User tidak terdaftar", checkConnectedUser);
          return;
        }

        const hashedUserId = hashUserId(formattedNumber);

        if (!getMessage) {
          return
        }
        

        let match;

        const getJID = event.messages[0]?.key.remoteJid ?? ''

        if (!getJID) return

        if ((match = getMessage.match(rekapRegex))) {
          await transactionRecordCurrentMonth(hashedUserId, sock, getJID, Transaction);
        } else if ((match = getMessage.match(helpRegex))) {
          await helpCommand(sock, getJID, match);
        } else if ((match = getMessage.match(incomeRegex))) {
          await TransactionInMatchWithRegex(sock, getJID, hashedUserId, match);
        } else {
          await TransactionOutMatchWithRegex(sock, getJID, hashedUserId, getMessage);
        }
    } catch (error) {
      
    }
  })

  // Save credentials whenever they are updated
  sock.ev.on('creds.update', saveCreds)
}

connectToWhatsApp()

