import type { WASocket } from "@whiskeysockets/baileys";

import { Transaction } from "../models/index.js";
import { decrypt } from "./encryption.js";

export const deleteLastTransaction = async (  
  sock: WASocket,
  jid: string, 
  userId: string,
) => {
  const lastTransaction = await Transaction.findOne({userId}).sort({date: -1});
          
  if(!lastTransaction){
    await sock.sendMessage(jid, { text: 'Data transaksi tidak ditemukan ❌' });
    
    return;
  }

  await Transaction.deleteOne({ _id: lastTransaction._id });

  const amount = lastTransaction.amount.toLocaleString('id-ID');
  const desc = decrypt(lastTransaction.description);
  const date = lastTransaction.date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(/\./g, ':');

  const text = `
  🗑️ *TRANSAKSI DIHAPUS*
  ━━━━━━━━━━━━━━━━━━━
  💰 *Rp ${amount}*
  📝 ${desc}
  🕒 ${date}

  _Catatan berhasil dihapus._`;

  await sock.sendMessage(jid, { text });
  
  return;
};
