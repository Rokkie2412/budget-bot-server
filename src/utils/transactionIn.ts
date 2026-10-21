import { TRANSACTION_TYPE, CATEGORY_EMOJIS_INCOME } from "../constants/index.js";
import { Transaction } from "../models/index.js";
import { encrypt } from "../utils/index.js";
import { getCategoryFromDescription } from "./autoCategory.js";
import { WASocket } from "@whiskeysockets/baileys";

export const TransactionInMatchWithRegex = async (
  sock: WASocket,
  jid: string,
  userId: string,
  match: RegExpMatchArray,
): Promise<void> => {
  if (!match) {
    await sock.sendMessage(jid, { text: 'Format salah, tidak dapat mendeteksi transaksi' });
    return;
  }

  if (match) {
    const amount = Number(match[1]!.replace(/[.,]/g, ''));
    const description = match[2] ? match[2].trim() : '-';
    const date = new Date();

    const category = await getCategoryFromDescription(description, TRANSACTION_TYPE.IN);
    const emoji = category in CATEGORY_EMOJIS_INCOME
      ? CATEGORY_EMOJIS_INCOME[category as keyof typeof CATEGORY_EMOJIS_INCOME]
      : '📦';

    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date,
      type: TRANSACTION_TYPE.IN,
      category,
    });

    await sock.sendMessage(jid, {
      text:
        `💰 *Pemasukan Berhasil Dicatat!*\nRp ${amount.toLocaleString('id-ID')} Sumber: ${description}\nKategori: ${emoji} ${category}`,
    });
  }
};
