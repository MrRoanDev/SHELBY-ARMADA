import axios from 'axios';
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import { lookup } from 'mime-types';
import Jimp from 'jimp';

// --- Fonctions utilitaires ---
export const isUrl = (str) => {
    const pattern = /https?:\/\/[^\s]+/g;
    return pattern.test(str);
};

// --- Scraper TikTok ---
export async function tiktokDl(url) {
    let domain = 'https://www.tikwm.com/api/';
    let res = await axios.post(domain, {}, {
        params: { url: url, count: 12, cursor: 0, web: 1, hd: 1 }
    });
    // ... (la suite de ta logique reste la même)
    return res.data.data;
}

// --- Scraper Pinterest ---
export async function pinterest(query) {
    try {
        // Utilise ta logique de cookies et d'extraction
        // ...
        return container;
    } catch (e) { return []; }
}

// --- Scraper Spotify ---
export async function spotify(input) {
    try {
        const { data: s } = await axios.get(`https://spotdown.org/api/song-details?url=${encodeURIComponent(input)}`);
        const song = s.songs[0];
        const { data } = await axios.post('https://spotdown.org/api/download', { url: song.url }, { responseType: 'arraybuffer' });
        
        return {
            metadata: { title: song.title, artist: song.artist, cover: song.thumbnail },
            audio: data
        };
    } catch (e) { throw new Error(e.message); }
}

// --- IA Remini (Amélioration Image) ---
export async function remini(buffer, type = "enhance") {
    // Ta logique utilisant FormData et l'API vyro.ai
    // ...
}

// --- MediaFire ---
export async function mediafire(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return {
        fileName: $('.dl-btn-label').attr('title'),
        downloadUrl: $('.download_link a.input').attr('href')
    };
}
