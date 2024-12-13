const fs = require('fs');
const path = require('path');

// Lê as variáveis de ambiente do arquivo .env
require('dotenv').config();

const configPath = path.join(__dirname, '../public/firebase-config.js');

// Lê o arquivo de configuração
let configContent = fs.readFileSync(configPath, 'utf8');

// Substitui os placeholders pelas variáveis de ambiente
configContent = configContent
  .replace('__FIREBASE_API_KEY__', process.env.VITE_FIREBASE_API_KEY)
  .replace('__FIREBASE_AUTH_DOMAIN__', process.env.VITE_FIREBASE_AUTH_DOMAIN)
  .replace('__FIREBASE_PROJECT_ID__', process.env.VITE_FIREBASE_PROJECT_ID)
  .replace('__FIREBASE_STORAGE_BUCKET__', process.env.VITE_FIREBASE_STORAGE_BUCKET)
  .replace('__FIREBASE_MESSAGING_SENDER_ID__', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replace('__FIREBASE_APP_ID__', process.env.VITE_FIREBASE_APP_ID)
  .replace('__FIREBASE_MEASUREMENT_ID__', process.env.VITE_FIREBASE_MEASUREMENT_ID);

// Escreve o arquivo atualizado
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('Firebase config atualizado com sucesso!');
