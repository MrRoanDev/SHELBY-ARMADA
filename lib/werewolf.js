import jimp from "jimp";

// --- Configuration des Images ---
const thumb1 = "https://user-images.githubusercontent.com/72728486/235344562-4677d2ad-48ee-419d-883f-e0ca9ba1c7b8.jpg";
const thumb2 = "https://user-images.githubusercontent.com/72728486/235344861-acdba7d1-8fce-41b8-adf6-337c818cda2b.jpg";
const thumb3 = "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";

// --- Utilitaires ---
const resize = async (image, width, height) => {
    try {
        const read = await jimp.read(image);
        return await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
    } catch (e) {
        return Buffer.alloc(0);
    }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const emoji_role = (role) => {
    const emojis = { warga: "👱‍♂️", seer: "👳", guardian: "👼", sorcerer: "🔮", werewolf: "🐺" };
    return emojis[role] || "❓";
};

// --- Logique du Système (Correction recursiveSearch) ---
const findObject = (obj = {}, key, value) => {
    const result = [];
    const recursiveSearch = (o = {}) => {
        if (!o || typeof o !== "object") return;
        if (o[key] === value) result.push(o);
        Object.keys(o).forEach(k => recursiveSearch(o[k])); // Corrigé : o[k] au lieu de obj[k]
    };
    recursiveSearch(obj);
    return result;
};

const sesi = (from, data) => data[from] || false;

const playerOnGame = (sender, data) => {
    for (let key in data) {
        if (data[key].player && data[key].player.some(p => p.id === sender)) return true;
    }
    return false;
};

const playerOnRoom = (sender, from, data) => {
    const room = data[from];
    return room ? room.player.some(p => p.id === sender) : false;
};

const dataPlayer = (sender, data) => {
    for (let key in data) {
        let p = data[key].player.find(x => x.id === sender);
        if (p) return p;
    }
    return false;
};

const roleShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const roleAmount = (n) => {
    if (n >= 15) return { werewolf: 3, seer: 2, guardian: 3, warga: 6, sorcerer: 1 };
    if (n >= 13) return { werewolf: 2, seer: 1, guardian: 1, warga: 8, sorcerer: 1 };
    if (n >= 10) return { werewolf: 2, seer: 1, guardian: 2, warga: 4, sorcerer: 1 };
    if (n >= 7) return { werewolf: 2, seer: 1, guardian: 1, warga: n - 4, sorcerer: 0 };
    return { werewolf: 1, seer: 1, guardian: 1, warga: n - 3, sorcerer: 0 };
};

const roleGenerator = (from, data) => {
    const room = data[from];
    if (!room) return;
    const roles = roleAmount(room.player.length);
    let pool = [];
    for (let r in roles) {
        for (let i = 0; i < roles[r]; i++) pool.push(r);
    }
    pool = roleShuffle(pool);
    room.player.forEach((p, i) => { p.role = pool[i]; });
};

// --- Affichages Spéciaux ---

async function pagi(sock, x, data) {
    let room = data[x.room];
    if (!room) return;
    room.time = "pagi";
    room.day += 1;
    room.player.forEach(p => p.isvote = false);

    let deadMsg = "";
    if (room.dead && room.dead.length > 0) {
        room.dead.forEach(dId => {
            let p = room.player.find(px => px.number === dId);
            if (p) { p.isdead = true; deadMsg += `@${p.id.split('@')[0]} `; }
        });
    }

    let cap = deadMsg === "" ? 
        `⛩️ *AUBE DU JOUR ${room.day}*\n\nLa nuit a été calme. Les ombres se sont retirées sans faire de victimes.` :
        `⛩️ *AUBE DU JOUR ${room.day}*\n\nLe sang a coulé. ${deadMsg} a été retrouvé sans vie.\n\n> © MOMO-ZEN V3`;

    await sock.sendMessage(x.room, {
        text: cap,
        contextInfo: {
            externalAdReply: {
                title: "W E R E W O L F  V 3",
                body: "Le soleil se lève...",
                thumbnail: await resize(thumb1, 300, 175),
                mediaType: 1,
                renderLargerThumbnail: true
            },
            mentionedJid: room.player.map(p => p.id)
        }
    });
}

async function malam(sock, x, data) {
    let room = data[x.room];
    if (!room) return;
    room.time = "malem";
    room.dead = [];
    
    await sock.sendMessage(x.room, {
        text: `🌑 *LA NUIT TOMBE*\n\nLe donjon devient sombre. Villageois, fermez les yeux. Loups, choisissez votre proie.\n\n*Vos pouvoirs ont été envoyés en Privé.*`,
        contextInfo: {
            externalAdReply: {
                title: "PHASE NOCTURNE",
                body: "Les ombres dominent...",
                thumbnail: await resize(thumb3, 300, 175),
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    });

    for (let p of room.player.filter(p => !p.isdead)) {
        let msg = `Ton rôle : *${p.role.toUpperCase()}* ${emoji_role(p.role)}\n`;
        if (p.role === "werewolf") msg += "Commande : `.ww kill [numéro]`";
        if (p.role === "seer") msg += "Commande : `.ww scan [numéro]`";
        if (p.role === "guardian") msg += "Commande : `.ww protect [numéro]`";
        
        await sock.sendMessage(p.id, { text: msg });
    }
}

async function voting(sock, x, data) {
    let room = data[x.room];
    if (!room) return;
    room.time = "voting";
    let list = room.player.map(p => `${p.isdead ? '☠️' : '(' + p.number + ')'} @${p.id.split('@')[0]}`).join('\n');

    await sock.sendMessage(x.room, {
        text: `⚖️ *CONSEIL DU DONJON*\n\nDécidez de qui doit être sacrifié.\n\n*LISTE*:\n${list}\n\n👉 *.ww vote [numéro]*`,
        contextInfo: {
            externalAdReply: {
                title: "VOTATION",
                body: "Exécutez le suspect",
                thumbnail: await resize(thumb2, 300, 175),
                mediaType: 1,
                renderLargerThumbnail: true
            },
            mentionedJid: room.player.map(p => p.id)
        }
    });
}

// --- Exports ---
export {
    emoji_role, sesi, playerOnGame, playerOnRoom, dataPlayer, 
    roleShuffle, roleGenerator, pagi, malam, voting, resize, sleep
};
