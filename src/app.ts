import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-pt-message-processor";
import { EmolaEnMessageProcessor } from "./message-processor/emola-en-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { Client, LocalAuth } from "whatsapp-web.js";
import { logger } from "./config/logger";
import { MessageProcessor } from "./message-processor/message-processor";
import { handleSupportMessages, handleInitialMenu, userStates, processMenuSelection } from './support/support'
import { UserState } from './types/types';


import qrcode from 'qrcode-terminal';
const wwebVersion = "2.2412.54";
const client = new Client({
  authStrategy: new LocalAuth(),
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


const respostasRecarregamento = [
  "Conta recarregada com sucesso!",
  "Recarga realizada com êxito!",
  "Feito! Conta recarregada.",
  "Tudo certo! Recarregamento concluído.",
  "Pronto! Conta agora está recarregada.",
  "Concluído! Recarga efetuada.",
  "Sucesso! Conta foi recarregada.",
  "Feito! Recarga processada.",
  "Obrigado! Conta recarregada.",
  "Pronto para uso! Recarga completa.",
  "Operação realizada com sucesso!",
  "Feito com sucesso! Conta está recarregada.",
  "Excelente! Recarga concluída.",
  "Concluído! Recarregamento realizado.",
  "Muito bem, conta recarregada."
];

const errorFormat= [
  'Por favor, certifique-se de copiar a mensagem de confirmação exatamente como fornecido e adicionar o número de celular associado à conta Yango no fim do corpo da mensagem para o Recarregamento!',
  'Certifique-se de incluir corretamente a mensagem de confirmação e o número de celular associado à conta Yango para completar o Recarregamento.',
  'Para completar o Recarregamento, é necessário copiar a mensagem de confirmação exatamente como fornecido e adicionar o número de celular associado à conta Yango no fim do corpo da mensagem.',
  'Por favor, adicione o número de celular associado à conta Yango no fim do corpo da mensagem de confirmação para finalizar o Recarregamento.'
];

const errorGeral = [
  'Ocorreu um erro durante o recarregamento, provavelmente o número que colocou não está associado a nenhuma conta Yango neste parceiro. Por favor, tente novamente! Se o problema persistir, entre em contato com o suporte!',
  'Infelizmente, houve um problema com o recarregamento. Verifique se o número fornecido está associado à sua conta Yango. Se precisar de ajuda, entre em contato com o suporte.',
  'Desculpe, não conseguimos completar o recarregamento. Certifique-se de que o número inserido corresponde à sua conta Yango. Entre em contato com o suporte se precisar de assistência adicional.',
  'Houve um erro ao tentar recarregar sua conta. Verifique o número associado à sua conta Yango e tente novamente. Caso persista o problema, entre em contato com o suporte.',
  'Ops! Parece que ocorreu um problema durante o recarregamento. Verifique os detalhes fornecidos e tente novamente.',
  'Desculpe, não conseguimos processar seu pedido de recarregamento. Verifique o número de celular e tente novamente.',
  'Erro ao recarregar conta. Certifique-se de seguir as instruções corretamente e tente novamente.',
  'Não foi possível completar o recarregamento. Por favor, verifique as informações fornecidas e tente novamente mais tarde.',
  'Desculpe, ocorreu um problema técnico durante o recarregamento. Tente novamente mais tarde ou entre em contato com o suporte.'
];


client.on("message", async msg => {
  let message = msg.body;
  // let senderID = msg.from;

  logger.info("MESSAGE RECEIVED: " + JSON.stringify(msg));

   try {
    const processor = getProcessor(message);

    // Chamar suporte caso a mensagem enviada não seja um comprovativo para recarregamento
   if (!processor) {
  // Inicializar o estado do usuário, se não estiver definido
  // if (!userStates[senderID]) {
  //  // userStates[senderID] = { menu: 'initial', menuShown: false };
  // }

  // // Verificar se o menu inicial deve ser mostrado
  // if (userStates[senderID].menu === 'initial' && !userStates[senderID].menuShown) {
  //   // await handleInitialMenu(client, senderID);
  // } else {
  //   // Processar a opção selecionada pelo usuário
  //   //ola
  //   // await processMenuSelection(client, senderID, message);
  // }

  return;

  
  }

   //Se o comprovativo for SIMO Não recarregar
   if (/SIMO/i.test(message)) { // Regex para verificar se a mensagem contém "SIMO"
    const SimoError = "Transferências SIMO não são permitidas. Por favor, utilize um método de transferência compatível (M-Pesa para M-Pesa ou e-Mola para e-Mola).";
    enviarMensagemComAtraso(msg, SimoError);
    return;
  }


    const transaction = processor.process(message);

    // Buscar dados adicionais no Firebase
    const result = await validateTransaction(transaction);

    if (!result.success) logger.error(result.error);

    if (!result.success || transaction.contact === 'N/A') {
      // const errorMessage =`Por favor, certifique-se de copiar a mensagem de confirmação exatamente como fornecido e adicionar o contato para o recarregamento conforme o exemplo abaixo:\n\n${processor.getExampleMessage()}\n\nPor favor, reenvie a mensagem corretamente seguindo o formato acima para completar o processo de recarga. Caso o problema persista, a recarga pode ter sido usada ou adulterada! Em caso de dúvidas, entre em contacto com o suporte!`.trimStart();
      const errorMessage = result.error || selecionarMensagemDeErroAleatoria();
      logger.info(errorMessage);
      //Chamar o metodo para enviar a mensagem com algum Erro
      enviarMensagemComAtraso(msg, errorMessage);
      return;
    }

    const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
    if (!createResult.success) {
      const answerGeralError = selecionarMensagemGeralDeErroAleatoria();
      logger.info(answerGeralError);
        //Chamar o metodo para enviar a mensagem com algum atraso
      enviarMensagemComAtraso(msg, answerGeralError);
      
      return;
    }

    await markTransactionAsCompleted(transaction);
    const answerSucess = selecionarRespostaAleatoria();
    logger.info('Conta recarregada!');
    //Chamar o metodo para enviar a mensagem com algum atraso
    enviarMensagemComAtraso(msg, answerSucess);
  } catch (error) {
    logger.error(`Ocorreu um erro: ${error}`);
    //msg.reply("Desculpe, ocorreu um erro inesperado. Por favor, tente novamente mais tarde.");
  }
});

// Função para selecionar um resposta de erro aleatoria
function selecionarRespostaAleatoria() {
  const indiceAleatorio = Math.floor(Math.random() * respostasRecarregamento.length);
  return respostasRecarregamento[indiceAleatorio];
}

// Função para selecionar uma mensagem de erro aleatória
function selecionarMensagemDeErroAleatoria() {
  const indiceAleatorio = Math.floor(Math.random() * errorFormat.length);
  return errorFormat[indiceAleatorio];
}

function enviarMensagemComAtraso(msg: any, mensagem: string) {
  const tempoAtraso = Math.random() * 5000 + 2000; // Atraso aleatório entre 2000ms e 7000ms
  setTimeout(() => {
      msg.reply(mensagem);
  }, tempoAtraso);
}

function selecionarMensagemGeralDeErroAleatoria() {
  const indiceAleatorio: number = Math.floor(Math.random() * errorGeral.length);
  return errorGeral[indiceAleatorio];
}

function getProcessor(message: string): MessageProcessor | null {
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
