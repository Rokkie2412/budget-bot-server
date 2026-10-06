import { TRANSACTION_TYPE, CATEGORY_EMOJIS_EXPENSE } from "../constants/index.js";
import { Transaction } from "../models/index.js";
import { encrypt, getLocalFallbackCategory } from "../utils/index.js";
import { WASocket } from "@whiskeysockets/baileys";

export const TransactionOutMatchWithRegex = async (
  sock: WASocket,
  jid: string, 
  userId: string,
  message: string,
): Promise<void> => {
  const trimMessage = message.trim();
  const regex = /^(\d+)\s+(.+)$|^(.+)\s+(\d+)$/;
  const match = trimMessage.match(regex);

  if (!match) {
    await sock.sendMessage(jid, { text: 'Format salah, tidak dapat mendeteksi transaksi'});
    await sock.sendMessage(jid, { text: 'ketik ".help" untuk bantuan'});
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

    const category = await getLocalFallbackCategory(description, true);
    const emoji = category in CATEGORY_EMOJIS_EXPENSE
      ? CATEGORY_EMOJIS_EXPENSE[category as keyof typeof CATEGORY_EMOJIS_EXPENSE]
      : '📦';

    await Transaction.create({
      userId: userId,
      description: encrypt(description || ''),
      amount: amount || 0,
      date,
      type: TRANSACTION_TYPE.OUT,
      category,
    });

    await sock.sendMessage(jid, { text: 
      `💰 *Pengeluaran Tercatat!*\nRp ${amount.toLocaleString('id-ID')} Keperluan: ${description}\nKategori: ${emoji} ${category}`,
    });
  }
};
