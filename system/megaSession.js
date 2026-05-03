// ==================================
import fs from 'fs';
import { execSync } from 'child_process';

let File;

async function initMega() {
  try {
    const megajs = await import('megajs');
    File = megajs?.default?.File || megajs.File;
  } catch {
    console.log('📦 Installation de megajs...');
    execSync('npm install megajs', { stdio: 'inherit' });
    const megajs = await import('megajs');
    File = megajs?.default?.File || megajs.File;
  }
}

export async function loadSessionFromMega(credsPath) {
  if (fs.existsSync(credsPath)) return;
  if (!global.SESSION_ID?.startsWith('roan~')) return;

  await initMega();

  const [fileID, key] = global.SESSION_ID.replace('roan~', '').split('#');
  if (!fileID || !key) {
    console.error('❌ SESSION_ID SHELBY invalide');
    return;
  }

  console.log('⬇️ Téléchargement première session depuis SHELBY...');
  const file = File.fromURL(`https://mega.nz/file/${fileID}#${key}`);

  await file.loadAttributes();

  const data = await new Promise((resolve, reject) =>
    file.download((err, d) => (err ? reject(err) : resolve(d)))
  );

  fs.writeFileSync(credsPath, data);
  console.log('✅ Session SHELBY téléchargée (une seule fois)');
}