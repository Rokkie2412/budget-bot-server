import WAWebJS from 'whatsapp-web.js';

import { TRANSACTION_TYPE } from '../constants';
import { Transaction } from '../models';
import { encrypt } from '../utils';

export const TransactionInMatchWithRegex = async (userId: string, message: WAWebJS.Message) => {
  const trimMessage = message.body.trim();
  const regex = /^(?:\+|masuk)\s+(\d+(?:[\.,]\d+)*)\s+(.+)$/i;
  const match = trimMessage.match(regex);

  if (!match) {
    message.reply('Wrong format, cannot detect transaction');
    return;
  }

  if (match) {
    const amount = Number(match[1]!.replace(/[\.,]/g, ''));
    const description = match[2]!.trim();
    const currentDate = new Date();
    const wibDate = new Date(currentDate.getTime() + (7 * 60 * 60 * 1000));

    //save to database
    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date: wibDate,
      type: TRANSACTION_TYPE.IN
    })

    message.reply(`💰 Transaction Incoming recorded!\nRp ${amount.toLocaleString()} for: ${description}`);
  }
}