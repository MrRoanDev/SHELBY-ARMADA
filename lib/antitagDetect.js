// ==================== lib/antitagDetect.js ====================
import { getAntitag } from './antitag.js';
import { smsg } from '../handler.js';

export async function handleTagDetection(sock, m) {
  try {
    if (!m.isGroup) return; // uniquement pour groupes

    const chatId = m.chat;
    const antitagSetting = await getAntitag(chatId);
    if (!antitagSetting?.enabled) return; // antitag off pour ce groupe

    const mentions = m.mentionedJid || [];
    if (mentions.length === 0) return;

    const metadata = await sock.groupMetadata(chatId);
    const participants = metadata.participants.map(p => p.id);
    const admins = metadata.participants.filter(p => p.admin).map(p => p.id);

    // Ignorer si le sender est admin ou le bot
    if (admins.includes(m.sender) || m.sender === sock.user.id) return;

    // Détection tagall si mentions >= 50% des membres
    const mentionThreshold = Math.ceil(participants.length * 0.5);
    if (mentions.length >= mentionThreshold) {
      const action = antitagSetting.action || 'delete';

      // 🔹 Supprimer le message
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: m.id,
          participant: m.sender
        }
      });

      // 🔹 Si action kick
      if (action === 'kick') {
        await sock.groupParticipantsUpdate(chatId, [m.sender], 'remove');
        await sock.sendMessage(chatId, {
          text: `🚫 @${m.sender.split('@')[0]} was kicked for tagall!`,
          mentions: [m.sender]
        });
      } else {
        // 🔹 Sinon juste supprimer + avertir
        await sock.sendMessage(chatId, {
          text: `⚠️ Tagall detected! Message deleted.`,
          mentions: [m.sender] // juste pour notifier
        });
      }
    }

  } catch (err) {
    console.error('❌ Antitag detection error:', err);
  }
};