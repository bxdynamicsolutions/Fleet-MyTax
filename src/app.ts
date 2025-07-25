import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-pt-message-processor";
import { EmolaEnMessageProcessor } from "./message-processor/emola-en-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { Client, LocalAuth } from "whatsapp-web.js";
import { logger } from "./config/logger";
import { MessageProcessor } from "./message-processor/message-processor";
import { handleSupportMessages, handleInitialMenu, userStates, processMenuSelection } from './support/support';
import { UserState } from './types/types';
import qrcode from 'qrcode-terminal';
import { EMOLAOPT } from "./message-processor/Emola-opt-";

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

client.on("qr", qr => {
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
  const message = msg.body;
  const processor = getProcessor(message);
  if (!processor) return; // Ignora mensagens que não são de recargas

  try {
    if (/SIMO/i.test(message)) {
      return enviarMensagemComAtraso(msg, "Transferências SIMO não são permitidas. Por favor, utilize um método de transferência compatível (e-Mola para e-Mola).");
    }

    if (/(Confirmado|Confirmed)/i.test(message)) {
      return enviarMensagemComAtraso(msg, "O sistema Mpesa não está mais disponível por esse método de recarregamento. Apenas o E-mola.");
    }

    const transaction = processor.process(message);
    const result = await validateTransaction(transaction);

    if (!result.success || transaction.contact === 'N/A') {
      return enviarMensagemComAtraso(msg, result.error || selecionarMensagemDeErroAleatoria());
    }

    const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
    if (!createResult.success) {
      return enviarMensagemComAtraso(msg, selecionarMensagemGeralDeErroAleatoria());
    }

    await markTransactionAsCompleted(transaction);
    return enviarMensagemComAtraso(msg, selecionarRespostaAleatoria());
  } catch (error) {
    logger.error(`Erro inesperado: ${error}`);
  }
});

function selecionarRespostaAleatoria() {
  const respostas = [
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
    "Recarga finalizada! Sua conta está pronta.",
    "Recarga concluída com sucesso. Aproveite!",
    "Tudo certo! A recarga foi realizada.",
    "Recarga efetuada com sucesso. Boa utilização!",
    "Sucesso! O saldo foi atualizado.",
    "Pronto! Recarga completada e conta ativa.",
    "Tudo pronto! A recarga foi concluída.",
    "Recarga feita com êxito, aproveite!",
    "Sua conta foi recarregada com sucesso, pode usar.",
    "Recarga finalizada! Agora sua conta está ativa.",
    "Recarga realizada com sucesso. Obrigado!",
    "A recarga foi processada corretamente, boa utilização!",
    "Tudo certo! Seu saldo foi recarregado com sucesso.",
    "Recarga efetuada, sua conta agora está pronta!",
    "Processo concluído com êxito! Sua conta está recarregada.",
    "Recarga realizada! Sua conta está pronta para uso.",
    "Recarga completada com sucesso! Agora você pode utilizar.",
    "Recarga processada, aproveite os benefícios!",
    "Tudo pronto para uso! Recarga finalizada com sucesso.",
    "Recarga concluída, sua conta está atualizada.",
    "Operação concluída! Recarga bem-sucedida."
  ];
  return respostas[Math.floor(Math.random() * respostas.length)];
}

function selecionarMensagemDeErroAleatoria() {
  const erros = [
    'Por favor, certifique-se de copiar a mensagem de confirmação exatamente como fornecido e adicionar o número de celular associado à conta Yango no fim do corpo da mensagem para o Recarregamento!',
    'Certifique-se de incluir corretamente a mensagem de confirmação e o número de celular associado à conta Yango para completar o Recarregamento.',
    'Para completar o Recarregamento, é necessário copiar a mensagem de confirmação exatamente como fornecido e adicionar o número de celular associado à conta Yango no fim do corpo da mensagem.',
    'Por favor, adicione o número de celular associado à conta Yango no fim do corpo da mensagem de confirmação para finalizar o Recarregamento.',
    'É imprescindível que a mensagem de confirmação seja copiada fielmente e que o número de celular da conta Yango seja adicionado ao final da mensagem.',
    'A mensagem de confirmação deve ser copiada exatamente como fornecida, com o número de celular Yango adicionado ao final para o Recarregamento.',
    'Não se esqueça de incluir o número de celular da conta Yango no final da mensagem de confirmação para concluir o Recarregamento.',
    'Para evitar erros, por favor, adicione o número de celular associado à conta Yango ao final da mensagem de confirmação.',
    'Assegure-se de que a mensagem de confirmação seja copiada corretamente e que o número de celular Yango esteja incluído no final para proceder com o Recarregamento.',
    'Para que o Recarregamento seja bem-sucedido, é necessário copiar a mensagem de confirmação exatamente e incluir o número de celular Yango no final.'
  ];
  return erros[Math.floor(Math.random() * erros.length)];
}

function selecionarMensagemGeralDeErroAleatoria() {
  const erros = [
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
  return erros[Math.floor(Math.random() * erros.length)];
}

function enviarMensagemComAtraso(msg: any, mensagem: string) {
  setTimeout(() => msg.reply(mensagem), Math.random() * 5000 + 2000);
}

function getProcessor(message: string): MessageProcessor | null {
  if (message.startsWith("ID")) return new EmolaPtMessageProcessor();
  if (message.startsWith("Transaction")) return new EmolaEnMessageProcessor();
  if (message.startsWith("Confirmado")) return new MPesaPtMessageProcessor();
  if (message.startsWith("B") && message.trim().split(" ")[0].length === 11) return new MPesaEnMessageProcessor();
  if (message.trim().toUpperCase() === "EMOLAOPT") return new EMOLAOPT();
  return null;
}

export { client };
