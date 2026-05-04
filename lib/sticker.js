import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Convertir un buffer d'image en sticker
 * @param {Buffer} buffer - Buffer de l'image
 * @param {Object} options - Options du sticker
 * @returns {Buffer} Buffer du sticker webp
 */
export const addExif = async (buffer, options = {}) => {
    try {
        const {
            packname = '𝗦𝗛𝗘𝗟𝗕𝗬-𝗔𝗥𝗠𝗔𝗗𝗔-𝗠𝗗',
            author = '𝗕𝗬 𝗠𝗥 𝗥𝗢𝗔𝗡',
            categories = ['🤩', '🎉'],
            quality = 50,
            type = StickerTypes.FULL
        } = options;

        const sticker = new Sticker(buffer, {
            pack: packname,
            author: author,
            type: type,
            categories: categories,
            quality: quality,
            background: 'transparent'
        });

        return await sticker.toBuffer();
    } catch (error) {
        console.error('❌ Erreur addExif:', error);
        throw new Error(`Échec de création du sticker: ${error.message}`);
    }
};

/**
 * Sauvegarder temporairement un sticker
 * @param {Buffer} buffer - Buffer du sticker
 * @param {string} filename - Nom du fichier
 * @returns {string} Chemin du fichier
 */
export const saveSticker = async (buffer, filename = 'sticker.webp') => {
    const tempDir = path.join(__dirname, '../temp');
    
    try {
        await fs.access(tempDir);
    } catch {
        await fs.mkdir(tempDir, { recursive: true });
    }
    
    const filepath = path.join(tempDir, filename);
    await fs.writeFile(filepath, buffer);
    
    return filepath;
};

/**
 * Supprimer un sticker temporaire
 * @param {string} filepath - Chemin du fichier
 */
export const deleteSticker = async (filepath) => {
    try {
        await fs.unlink(filepath);
    } catch (error) {
        console.error('❌ Erreur suppression sticker:', error);
    }
};