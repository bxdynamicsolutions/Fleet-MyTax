import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-pt-message-processor";
import { EmolaEnMessageProcessor } from "./message-processor/emola-en-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { Client, LocalAuth } from "whatsapp-web.js";
import { logger } from "./config/logger";
import { MessageProcessor } from "./message-processor/message-processor";
import { handleSupportMessages, handleInitialMenu } from './support/support'

import qrcode from 'qrcode-terminal';
const wwebVersion = "2.2410.1";

const client = new Client({
  authStrategy: new LocalAuth(),
  // proxyAuthentication: { username: 'username', password: 'password' },
  puppeteer: {
    args: ["--no-sandbox"],
    headless: true,
  },
  webVersionCache: {
    type: "remote",
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  },
});

client.on("loading_screen", (percent, message) => {
  logger.info("LOADING SCREEN", percent, message);
});

client.on("qr", qr => {
  // NOTE: This event will not be fired if a session is specified.
  logger.info("QR RECEIVED", qr);
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  logger.info("AUTHENTICATED");
});

client.on("auth_failure", msg => {
  logger.error("AUTHENTICATION FAILURE: " + msg);
});

client.on("ready", () => {
  logger.info("READY");
});

client.on("message", async msg => {
  let message = msg.body;
  let senderID = msg.from;
  logger.info("MESSAGE RECEIVED: " + JSON.stringify(msg));
  try {
    const processor = getProcessor(message);
    if (!processor) {
      await handleInitialMenu(client, senderID, message);
      return;
    }

    const transaction = processor.process(message);

    // Buscar dados adicionais no Firebase
    const result = await validateTransaction(transaction);

    if (!result.success) logger.error(result.error);

    if (!result.success || transaction.contact === 'N/A') {
      const errorMessage =
        `Por favor, certifique-se de copiar a mensagem de confirmação exatamente como fornecido e adicionar o contato para o recarregamento conforme o exemplo abaixo:\n\n${processor.getExampleMessage()}\n\nPor favor, reenvie a mensagem corretamente seguindo o formato acima para completar o processo de recarga.\nCaso o problema persista, a recarga pode ter sido usada ou adulterada!\nEm caso de dúvidas, entre em contacto com o suporte!`.trimStart();
      logger.info(errorMessage);
      msg.reply(errorMessage);
      return;
    }

    const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
    if (!createResult.success) {
      logger.info(
        "Ocorreu um erro durante o recarregamento. Por favor, tente novamente!\nSe o problema persistir, entre em contacto com o suporte!",
      );
      msg.reply(
        "Ocorreu um erro durante o recarregamento. Por favor, tente novamente!\nSe o problema persistir, entre em contacto com o suporte!",
      );
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

function getProcessor(message: string): MessageProcessor | null {
  // Lógica de extração EMOLA
  if (message.substring(0, 2) === "ID") {
    return new EmolaPtMessageProcessor();
  } else if (message.startsWith("Transaction")) {
    return new EmolaEnMessageProcessor();
  } else if (message.startsWith("Confirmado")) {
    return new MPesaPtMessageProcessor();
  } else if (message.startsWith("B") && message.trim().split(" ")[0].length === 11) {
    return new MPesaEnMessageProcessor();
  }
  return null;
}

export { client };
