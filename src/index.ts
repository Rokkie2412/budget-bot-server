import dotenv from "dotenv";
import express from "express";
import qrcode from "qrcode-terminal";
import makeWASocket, { DisconnectReason, useMultiFileAuthState, type WASocket } from '@whiskeysockets/baileys'
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
import connectDB from "./libs/connectDB.js";

dotenv.config();
const app = express();
app.use(express.json());

connectDB();

const socketConnectionUpadate = (sock: WASocket): void => {
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
        qrcode.generate(qr, { small: true })
        console.log("\n🔗 Buka link ini di browser untuk scan QR:");
        console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
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
}

const socketSaveCredentials = (sock: WASocket, saveCreds: () => Promise<void>): void => sock.ev.on('creds.update', saveCreds)

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

  const sock = makeWASocket({
    auth: state
  })

  socketConnectionUpadate(sock);

  sock.ev.on('messages.upsert', async (event) => {
    if (event.type !== 'notify') return
    const nomorTarget = "6285156141278";
    const keyEventId = event.messages[0]?.key.remoteJidAlt

    if (!keyEventId) return 

    const undoRegex = /^\.(batal|undo)$/i;
    const formattedNumber = `+${nomorTarget}`;
    const rekapRegex = /^\.(rekap)$/i;
    const regexMatch = new RegExp(nomorTarget);
    const getMyContact = regexMatch.test(keyEventId);
    const helpRegex = /^\.(help)$/i;
    const historyRegex = /^\.(last|history|cek)(?:\s+(\d+))?$/i;
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
        } else if ((match = getMessage.match(undoRegex))) {
          deleteLastTransaction(sock, getJID, hashedUserId);
        } else if ((match =  getMessage.match(historyRegex))) {
          transactionHistoryBy(hashedUserId ,match, sock, getJID);
        } else {
          await TransactionOutMatchWithRegex(sock, getJID, hashedUserId, getMessage);
        }

    } catch (error) {
      
    }
  })

  socketSaveCredentials(sock, saveCreds);
}

connectToWhatsApp()

