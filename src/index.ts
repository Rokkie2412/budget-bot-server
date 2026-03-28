import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

import { Transaction, UserConnected } from './models';
import {
  deleteLastTransaction,
  hashUserId,
  transactionHistoryBy,
  TransactionInMatchWithRegex,
  TransactionOutMatchWithRegex,
  transactionRecordCurrentMonth
} from './utils';
import { helpCommand } from './utils/help';

dotenv.config();
const app = express();
app.use(express.json());

const isDev = process.env.NODE_ENV === 'development';
const dbURI = isDev ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PROD;

//connect to mongodb
mongoose.connect(dbURI || '')
  .then(() => console.log(`Connected to MongoDB ${isDev ? 'development' : 'production'} mode 🛻`))
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB', err)
    return process.exit(1);
  });

//setup whatsapp client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { handleSIGINT: false, args: ['--no-sandbox'] }
})

client.on('qr', (qr) => {
  console.log('QR code received, scanning...');
  qrcode.generate(qr, { small: true });
})

client.on('ready', (): void => {
  console.log('✅ WhatsApp client is ready!');
})

  //core logic of client
  .on('message', async (message) => {
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
        userId: formattedNumber
      });

      if (!checkConnectedUser) {
        console.log('User tidak terdaftar', checkConnectedUser);
        return;
      }

      const hashedUserId = hashUserId(formattedNumber);
      let match;

      if (match = message.body.match(rekapRegex)) {
        await transactionRecordCurrentMonth(hashedUserId, message, Transaction);
      } else if (match = message.body.match(incomeRegex)) {
        await TransactionInMatchWithRegex(hashedUserId, message, match);
      } else if (match = message.body.match(historyRegex)) {
        transactionHistoryBy(hashedUserId, message, match);
      } else if (match = message.body.match(helpRegex)) {
        helpCommand(message, match);
      } else if (match = message.body.match(undoRegex)) {
        deleteLastTransaction(hashedUserId, message);
      } else {
        await TransactionOutMatchWithRegex(hashedUserId, message);
      }

    } catch (error) {
      console.error('❌ Error:', error);
    }
  })

client.initialize();

const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
  console.log(`🚀 Server run at http://localhost:${PORT}`);
});
