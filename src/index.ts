import express from 'express';
import mongoose from 'mongoose';
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import Transaction from './models/transactions';
import UserConnected from './models/connected-user';

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
client.on('message', async (message) => {
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

    const regex = /^(\d+)\s+(.+)$/;
    const match = message.body.match(regex);

    if (!match) {
      message.reply('Wrong formant, cannot detect transaction');
      return;
    }

    if (match) {
      const amount = Number(match[1]);
      const description = match[2];
      const currentDate = new Date();
      const formattedDateWIB = currentDate.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      //save to database
      await Transaction.create({
        userId: checkConnectedUser.userId,
        description: description || '',
        amount: amount || 0,
        date: formattedDateWIB
      })

      message.reply(`💰 Transaction recorded!\nRp ${amount.toLocaleString()} for: ${description}`);
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
