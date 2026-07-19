import WAWebJS from 'whatsapp-web.js';

import { TRANSACTION_TYPE, CATEGORY_EMOJIS } from '../constants';
import { Transaction } from '../models';
import { encrypt, getCategoryFromDescription } from '../utils';

export const TransactionInMatchWithRegex = async (userId: string, message: WAWebJS.Message, match: RegExpMatchArray): Promise<void> => {
  if (!match) {
    message.reply('Wrong format, cannot detect transaction');
    return;
  }

  if (match) {
    const amount = Number(match[1]!.replace(/[\.,]/g, ''));
    const description = match[2] ? match[2].trim() : '-';
    const date = new Date();

    const category = await getCategoryFromDescription(description);
    const emoji = CATEGORY_EMOJIS[category] || "📦";

    //save to database
    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date,
      type: TRANSACTION_TYPE.IN,
      category
    });

    message.reply(`💰 *Pemasukan Berhasil Dicatat!*\nRp ${amount.toLocaleString('id-ID')} Sumber: ${description}\nKategori: ${emoji} ${category}`);
  }
};