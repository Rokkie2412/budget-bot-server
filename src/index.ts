import express from 'express';
import mongoose from 'mongoose';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';

import { UserConnected, Transaction } from './models';
import { TransactionOutMatchWithRegex, transactionRecordCurrentMonth, hashUserId } from './utils';
import { REKAP } from './constants'

dotenv.config();
const app = express();
app.use(express.json());

//connect to mongodb
mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('Connected to MongoDB 🛻'))
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
    const formattedNumber = `+${rawNumber}`

    try {
      const checkConnectedUser = await UserConnected.findOne({
        userId: formattedNumber
      });

      if (!checkConnectedUser) {
        console.log('User not is not on whitelist', checkConnectedUser);
        return;
      }

      const hashedUserId = hashUserId(formattedNumber);

      if (message.body.startsWith(REKAP)) {
        await transactionRecordCurrentMonth(hashedUserId, message, Transaction);
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
