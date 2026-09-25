import type { WASocket } from "@whiskeysockets/baileys";

import { HELP_COMMANDS } from "../constants/index.js";

export const helpCommand = async (
  sock: WASocket,
  jid: string, 
  match: RegExpMatchArray
) => {
  if(!match) return

  let text = `🤖 *BUDGET BOT MENU* 📊\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  HELP_COMMANDS.forEach((item, index) => {
    text += `${index + 1}. *${item.command}*\n`;
    text += `   └ _${item.desc}_\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Ketik perintah di atas untuk memulai._`;

  await sock.sendMessage(jid, { text: text.trim() });
}