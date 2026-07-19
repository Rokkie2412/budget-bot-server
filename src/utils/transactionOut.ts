import WAWebJS from 'whatsapp-web.js';

import { TRANSACTION_TYPE, CATEGORY_EMOJIS } from '../constants';
import { Transaction } from '../models';
import { encrypt, getCategoryFromDescription } from '../utils';

export const TransactionOutMatchWithRegex = async (userId: string, message: WAWebJS.Message): Promise<void> => {
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

    const date = new Date();

    const category = await getCategoryFromDescription(description);
    const emoji = CATEGORY_EMOJIS[category] || "📦";

    //save to database
    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date,
      type: TRANSACTION_TYPE.OUT,
      category
    });

    message.reply(`💰 *Pengeluaran Tercatat!*\nRp ${amount.toLocaleString('id-ID')} Keperluan: ${description}\nKategori: ${emoji} ${category}`);
  }
};