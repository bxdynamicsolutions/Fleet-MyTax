import express from "express";
import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-pt-message-processor";
import { EmolaEnMessageProcessor } from "./message-processor/emola-en-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { WA } from "./whatsapp";
import { Client, LocalAuth } from "../whatsapp-web.js/index";
import { logger } from "./config/logger";
import { pinoHttp } from "pino-http";
import { MessageProcessor } from "./message-processor/message-processor";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

const wwebVersion = '2.2407.3';

const client = new Client({
  authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: { 
      // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
      headless: false
  },
  webVersionCache: {
      type: 'remote',
      remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  },
});

client.initialize();

client.on('loading_screen', (percent, message) => {
  console.log('LOADING SCREEN', percent, message);
});

client.on('qr', (qr) => {
  // NOTE: This event will not be fired if a session is specified.
  console.log('QR RECEIVED', qr);
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
  // Fired if session restore was unsuccessful
  console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
  console.log('READY');
});



client.on('message', async msg => {
  console.log('MESSAGE RECEIVED', msg);
  let message: string = msg.body;
  let senderID: string = msg.from;

  try {
    const processor = getProcessor(message);
    if (!processor) {
      logger.info("A mensagem não está em nenhum dos formatos esperados (MPESA ou EMOLA).");
      msg.reply("A mensagem não está em nenhum dos formatos esperados (MPESA ou EMOLA).");
      return;
    }
    
    const transaction = processor.process(message);
    
    // Buscar dados adicionais no Firebase
    const result = await validateTransaction(transaction);
    if (!result.success) {
      logger.info(result.error);
      const errorMessage = `Por favor, certifique-se de copiar a mensagem de confirmação exatamente como fornecido e adicionar o contato para o recarregamento conforme o exemplo abaixo:\n\n${processor.getExampleMessage()}\n\nPor favor, reenvie a mensagem corretamente seguindo o formato acima para completar o processo de recarga.\nCaso o problema persista, a recarga pode ter sido usada ou adulterada!\nEm caso de dúvidas, entre em contacto com o suporte!`.trimStart();
      logger.info(errorMessage);
      msg.reply(errorMessage);
      return;
    }

    const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
    if (!createResult.success) {
      logger.info("Ocorreu um erro durante o recarregamento. Por favor, tente novamente!\nSe o problema persistir, entre em contacto com o suporte!");
      msg.reply("Ocorreu um erro durante o recarregamento. Por favor, tente novamente!\nSe o problema persistir, entre em contacto com o suporte!");
      return;
    }

    await markTransactionAsCompleted(transaction);
    logger.info(`Conta Recarregada: ${JSON.stringify(message)}`);
    msg.reply("Conta recarregada!");
  } catch (error) {
    logger.error(`Ocorreu um erro: ${error}`);
    msg.reply("Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.");
  }
});

client.initialize();


function getProcessor(message: string): MessageProcessor | null {
  // Lógica de extração EMOLA
  if (message.substring(0, 2) === "ID") {
    return new EmolaPtMessageProcessor();
  } else if (message.startsWith("Transaction")) {
    return new EmolaEnMessageProcessor();
  }else if (message.startsWith("Confirmado")) {
    return new MPesaPtMessageProcessor();
  } else if (message.startsWith("B") && message.trim().split(" ")[0].length === 11) {
    return new MPesaEnMessageProcessor();
  }
  return null;
}

export { app };
