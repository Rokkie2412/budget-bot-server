import WAWebJS from 'whatsapp-web.js';

import { IUserConnected } from '../../types';
import { TRANSACTION_TYPE } from '../constants';
import { Transaction } from '../models';

export const TransactionOutMatchWithRegex = async (checkConnectedUser: IUserConnected, message: WAWebJS.Message) => {
  const trimMessage = message.body.trim();
  const regex = /^(\d+)\s+(.+)$|^(.+)\s+(\d+)$/;
  const match = trimMessage.match(regex);

  if (!match) {
    message.reply('Wrong format, cannot detect transaction');
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
      userId: checkConnectedUser.userId,
      description: description || '',
      amount: amount || 0,
      date: wibDate,
      type: TRANSACTION_TYPE.OUT
    })

    message.reply(`💰 Transaction outgoing recorded!\nRp ${amount.toLocaleString()} for: ${description}`);
  }
}