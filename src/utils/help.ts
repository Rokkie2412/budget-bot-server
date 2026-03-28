import WAWebJS from "whatsapp-web.js";
import { HELP_COMMANDS } from "../constants";

export const helpCommand = (message: WAWebJS.Message, match: RegExpMatchArray) => {
  if(!match) return

  let text = `🤖 *BUDGET BOT MENU* 📊\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  HELP_COMMANDS.forEach((item, index) => {
    // Gunakan penomoran dan bullet point agar scannable
    text += `${index + 1}. *${item.command}*\n`;
    text += `   └ _${item.desc}_\n\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `_Ketik perintah di atas untuk memulai._`;

  return message.reply(text.trim());
}