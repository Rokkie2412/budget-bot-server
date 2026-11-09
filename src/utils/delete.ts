import type { WASocket } from "@whiskeysockets/baileys";

import supabase from "../libs/supabase.js";
import { decrypt } from "./encryption.js";
import type { TransactionRow } from "../types/index.js";

export const deleteLastTransaction = async (
  sock: WASocket,
  jid: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_id, amount, description, created_at')
    .eq('userId', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const lastTransaction = data as Pick<TransactionRow, 'transaction_id' | 'amount' | 'description' | 'created_at'> | null;

  if (!lastTransaction) {
    await sock.sendMessage(jid, { text: 'Data transaksi tidak ditemukan ❌' });

    return;
  }

  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', lastTransaction.transaction_id)
    .eq('userId', userId);

  if (deleteError) throw new Error(deleteError.message);

  const amount = Number(lastTransaction.amount).toLocaleString('id-ID');
  const desc = decrypt(lastTransaction.description);
  const date = new Date(lastTransaction.created_at).toLocaleString('id-ID', {
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
