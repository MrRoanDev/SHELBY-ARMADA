// =======================================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ================== E==================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== CONFIGURATION PAR DÉFAUT ==================
const defaultConfig = {
  // 🔑 Identifiants
  SESSION_ID: "roan~",
  OWNERS: ["237656274406"], // ← Don't REMPLACE DEV NUMBER 
  PREFIX: ".",
  TIMEZONE: "Africa/Cameroun",
  VERSION: "1.0.0",

  // 🤖 Paramètres du bot
  public: true,
  autoRead: true,
  restrict: false,
  botImage: "",
  blockInbox: false,

  // 🌐 Liens utiles
  LINKS: {
    group: "https://chat.whatsapp.com/IKeA3fI27Is9wkfMNrH8Vq",
    channel: "https://whatsapp.com/channel/0029VbCZROU0VycK6YkOGH0A",
    telegram: "https://t.me/MrBuddhaOmb"
  }
};
// =================================
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const configPath = path.join(dataDir, "config.json");

// =================================
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log("✅ config.json créé avec les paramètres par défaut");
}

// ===============================
let userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// =========================
global.blockInbox = userConfig.blockInbox ?? false;

// 🔹 Initialisation des owners
global.owner = Array.isArray(userConfig.OWNERS)
  ? userConfig.OWNERS
  : [userConfig.OWNER_NUMBER].filter(Boolean);

// ================== FONCTION DE SAUVEGARDE ==================
export function saveConfig(updatedConfig) {
  userConfig = { ...userConfig, ...updatedConfig };
  fs.writeFileSync(configPath, JSON.stringify(userConfig, null, 2));

  // Mise à jour des variables globales
  if (typeof updatedConfig.blockInbox !== "undefined") {
    global.blockInbox = updatedConfig.blockInbox;
  }
  if (Array.isArray(updatedConfig.OWNERS)) {
    global.owner = updatedConfig.OWNERS;
  }

  console.log("✅ Configuration sauvegardée");
}

// ================== EXPORT ==================
export default userConfig;