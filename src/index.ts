import dotenv from "dotenv";
import express from "express";
import qrcode from "qrcode-terminal";
import makeWASocket, { DisconnectReason, useMultiFileAuthState, type WASocket } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import {
  deleteLastTransaction,
  transactionHistoryBy,
  TransactionInMatchWithRegex,
  TransactionOutMatchWithRegex,
  transactionRecordCurrentMonth,
  helpCommand,
  getConnectedAccount,
} from "./utils/index.js";

dotenv.config();
const app = express();
app.use(express.json());

const socketConnectionUpadate = (sock: WASocket): void => {
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      qrcode.generate(qr, { small: true });
      console.log('\n🔗 Buka link ini di browser untuk scan QR:');
      console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
    }
    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('opened connection');
    }
  });
};

const socketSaveCredentials = (sock: WASocket, saveCreds: () => Promise<void>): void => sock.ev.on('creds.update', saveCreds);

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
  });

  socketConnectionUpadate(sock);

  sock.ev.on('messages.upsert', async (event) => {
    if (event.type !== 'notify') return;

    if (event.messages[0]?.key.fromMe) return;

    const getJID = event.messages[0]?.key.remoteJid ?? '';
    const getAltId = event.messages[0]?.key.remoteJidAlt ?? '';
    const getNumber = getAltId.split('@')[0];

    if (!getJID || !getAltId) return;

    const undoRegex = /^\.(batal|undo)$/i;
    const formattedNumber = `+${getNumber}`;
    const rekapRegex = /^\.(rekap)$/i;
    const helpRegex = /^\.(help)$/i;
    const historyRegex = /^\.(last|history|cek)(?:\s+(\d+))?$/i;
    const incomeRegex = /^(?:\+|masuk)\s+(\d+(?:[.,]\d+)*)(?:\s+(.+))?$/i;

    const getMessage = event.messages[0]?.message?.conversation;

    try {
      const checkConnectedUser = await getConnectedAccount(formattedNumber);

      if (!checkConnectedUser.registered) {
        await sock.sendMessage(getJID, {
          text: `⚠️ *Nomor belum terdaftar*

Nomor WhatsApp Anda belum terdaftar. Silakan daftar lebih dulu di aplikasi *Dompet Tracker*, lalu hubungkan nomor Anda di menu Profil.

Butuh bantuan? 👉 https://wa.me/${process.env.ADMIN_NUMBER}`,
        });
        return;
      }

      if (!checkConnectedUser.premium || !checkConnectedUser.allowChat) {
        await sock.sendMessage(getJID, {
          text: `🔒 *Akses belum aktif*

Akun Anda belum bisa menggunakan bot ini. Pastikan status *Premium* sudah aktif dan opsi *Allow Chat* menyala di aplikasi *Dompet Tracker*.

Butuh bantuan? 👉 https://wa.me/${process.env.ADMIN_NUMBER}`,
        });
        return;
      }

      const userId = checkConnectedUser.userId;

      if (!getMessage) {
        return;
      }

      let match;

      if (!getJID) return;

      if ((match = getMessage.match(rekapRegex))) {
        await transactionRecordCurrentMonth(userId, sock, getJID);
      } else if ((match = getMessage.match(helpRegex))) {
        await helpCommand(sock, getJID, match);
      } else if ((match = getMessage.match(incomeRegex))) {
        await TransactionInMatchWithRegex(sock, getJID, userId, match);
      } else if ((match = getMessage.match(undoRegex))) {
        deleteLastTransaction(sock, getJID, userId);
      } else if ((match = getMessage.match(historyRegex))) {
        transactionHistoryBy(userId, match, sock, getJID);
      } else {
        await TransactionOutMatchWithRegex(sock, getJID, userId, getMessage);
      }
    } catch (error) {
      console.log('Error processing message:', error);
    }
  });

  socketSaveCredentials(sock, saveCreds);
}

connectToWhatsApp();
