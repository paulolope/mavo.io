require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE || 'Olá {user}! Seja muito bem-vindo(a) ao grupo!';

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', async (qr) => {
  console.log('Escaneie o código QR abaixo com o WhatsApp:');
  try {
    const qrImage = await qrcode.toString(qr, { type: 'terminal', small: true });
    console.log(qrImage);
  } catch (err) {
    console.error('Erro ao gerar QR code:', err);
    console.log('QR Code:', qr);
  }
});

client.on('authenticated', () => {
  console.log('Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
  console.error('Falha na autenticação:', msg);
});

client.on('ready', () => {
  console.log('Bot pronto e conectado!');
  console.log('Aguardando novos membros nos grupos...');
});

client.on('groupJoin', async (notification) => {
  try {
    const participantId = notification.author;

    if (!participantId) {
      return;
    }

    const chat = await notification.getChat();
    const participant = await chat.client.getContactById(participantId);

    const displayName = participant.name || participant.pushName || 'novo membro';
    const welcomeMsg = WELCOME_MESSAGE.replace('{user}', displayName);

    await chat.sendMessage(welcomeMsg, {
      mentions: [participant]
    });

    console.log(`Mensagem de boas-vindas enviada em "${chat.name}" para ${displayName}`);
  } catch (error) {
    console.error('Erro ao enviar mensagem de boas-vindas:', error);
  }
});

client.on('message', async (message) => {
  if (message.body === '!ping') {
    message.reply('Pong! 🏓');
  }
});

client.initialize();
