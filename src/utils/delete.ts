import type WAWebJS from "whatsapp-web.js";

import { Transaction } from "../models";
import { decrypt } from "./encryption";

export const deleteLastTransaction = async (userId: string, message: WAWebJS.Message) => {
  const lastTransaction = await Transaction.findOne({userId}).sort({date: -1})
          
  if(!lastTransaction){
    return message.reply("Data transaksi tidak ditemukan");
  }

  await Transaction.deleteOne({ _id: lastTransaction._id });

  const amount = lastTransaction.amount.toLocaleString('id-ID');
  const desc = decrypt(lastTransaction.description);
  const date = lastTransaction.date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\./g, ':');

  const text = `
🗑️ *TRANSAKSI DIHAPUS*
━━━━━━━━━━━━━━━━━━━
💰 *Rp ${amount}*
📝 ${desc}
🕒 ${date}

_Catatan berhasil dihapus._`;

  return message.reply(text.trim());
}