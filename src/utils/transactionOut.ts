import WAWebJS from 'whatsapp-web.js';

import { TRANSACTION_TYPE } from '../constants';
import { Transaction } from '../models';
import { encrypt } from '../utils';

export const TransactionOutMatchWithRegex = async (userId: string, message: WAWebJS.Message) => {
  const trimMessage = message.body.trim();
  const regex = /^(\d+)\s+(.+)$|^(.+)\s+(\d+)$/;
  const match = trimMessage.match(regex);

  if (!match) {
    message.reply('Format salah, tidak dapat mendeteksi transaksi');
    message.reply('ketik ".help" untuk bantuan');
    return;
  }

  if (match) {
    let amount: number;
    let description: string;

    if (match[1]) {
      amount = Number(match[1]);
      description = String(match[2]);
    } else {
      amount = Number(match[4]);
      description = String(match[3]);
    }

    const currentDate = new Date();
    const wibDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));

    //save to database
    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date: wibDate,
      type: TRANSACTION_TYPE.OUT
    })

    message.reply(`💰 Transaction outgoing recorded!\nRp ${amount.toLocaleString()} for: ${description}`);
  }
}