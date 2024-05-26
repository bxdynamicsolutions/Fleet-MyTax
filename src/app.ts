import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-pt-message-processor";
import { EmolaEnMessageProcessor } from "./message-processor/emola-en-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { Client, LocalAuth } from "whatsapp-web.js";
  import { logger } from "./config/logger";
import { MessageProcessor } from "./message-processor/message-processor";
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

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  logger.info("MESSAGE RECEIVED: " + JSON.stringify(msg));
  try {
    const processor = getProcessor(message);
    if (!processor) {

  logger.info(`Received message: ${message} from ${senderID}`);

  const menuMessage = `Bem-vindo ao Suporte da MyTaxi! 🚖
Por favor, escolha uma opção:
1️⃣ Criar Conta
2️⃣ Saldo Não Atualizado Após Recarga
3️⃣ Código de Verificação Não Recebido
4️⃣ Cancelar Viagem
5️⃣ Número de Carta de Condução Associado a Outra Conta
6️⃣ Problema ao Terminar Viagem de Entrega
7️⃣ Dificuldades para Iniciar Sessão
8️⃣ Localização Incorreta no Mapa
9️⃣ Viagens com Ponto de Recolha Distante
🔟 App Não Mostra Ponto de Recolha ou Rota
1️⃣1️⃣ Como Recarregar a Conta
1️⃣2️⃣ O saldo reduziu sem ter feito corridas durante a noite.
0️⃣ Outras Dúvidas
`;

   
    msg.reply(menuMessage);
    let response = '';
    switch (message) {
      case '1':
        response = 'Para se registrar, acesse este link https://yango.com/forms/driver_partner_selfreg_multipage?ref_id=9b6dddd4bcb84b8084e4fc4bad86a359, baixe o aplicativo YangoPro na Play Store ou App Store e complete o seu cadastro. 📲';
        break;
      case '2':
        response = 'Clique na opção "Saldo" no aplicativo para atualizar. Se o problema persistir, verifique se está conectado na conta correta My Taxi. 💳';
        break;
      case '3':
        response = 'Confirme se o número de telefone está correto e em sua posse. Solicite o reenvio do código por SMS ou WhatsApp e aguarde alguns minutos. 📩';
        break;
      case '4':
        response = 'Você pode cancelar a viagem no app após aguardar o tempo mínimo requerido. Caso tenha dificuldades, contate o suporte. 🚕';
        break;
      case '5':
        response = `Verifique se não possui uma conta com sua carta de condução associada a outro parceiro. Se tiver, peça para que coloquem a conta em estado inativo para que possa acessar sua conta sem restrições, pois não é possível estar online em dois parceiros simultaneamente.`;
        break;
      case '6':
        response = 'Se está enfrentando problemas ao terminar a viagem de entrega, verifique a conexão ou reinicie o app.Tente seguir as instruções para ir até o local mais próximo da entrega. Se isso não funcionar, entre em contato com o suporte para encontrarmos uma solução juntos.🔄';
        break;
      case '7':
        response = `Leia atentamente as informações abaixo e siga-as cuidadosamente. Se necessário, reinicie o aplicativo ou desinstale e reinstale-o.

* Clicar em "Adicionar outras empresas de táxi;
* Inserir o número e inserir o código de verificação;
* Clicar na seta ⬅️ para voltar;
* Clicar no ❌;
* Clicar na opção "Voltar a página antiga de início;
* Inserir o número de celular;
* Receber e inserir o código de verificação;
* Escolher o parceiro My Taxi;
        `;
        break;
      case '8':
        response = 'Verifique as permissões de localização em seu dispositivo e reinicie o GPS. 🌍';
        break;
      case '9':
        response = 'Os parceiros não atribuem viagens diretamente aos motoristas. Você está recebendo viagens distantes porque é o motorista disponível mais próximo do cliente. Se a viagem não for vantajosa para você, pode cancelá-la e reportar ao suporte do aplicativo, caso os pontos sejam reduzidos por cancelamento. 📍';
        break;
      case '10':
        response = 'Se o app não está mostrando o ponto de recolha ou rota, verifique as configurações de navegação no app (GPS), reinicie o cellular ou acesse as definições do aplicativo, clique em "Navegação" e ative a opção "Navegação na App".🛣️';
        break;
      case '11':
        response = `*🔄 Recarregamento 24H*
      
*🔹 Primeiro Passo: Envio do Valor*
Envie o valor desejado para recarregar a sua conta utilizando uma das seguintes opções:
* *M-Pesa*: Envie para o número 📱 850368938
* *E-Mola*: Envie para o número 📱 873528154
* *Nome do destinatário*: ALBERTO ELIAS
        
*🔹 Segundo Passo: Confirmação do Número*
* Após realizar o pagamento, copie a mensagem de confirmação recebida.
* Envie essa mensagem juntamente com o número do seu celular associado à conta para garantir que o crédito seja adicionado à conta correta.
        
*🔹 Terceiro Passo: Envio de Comprovativo*
* Envie a mensagem de confirmação comprovativa para o WhatsApp 📲 +258850368938.
* Este passo é crucial para assegurar que o seu recarregamento seja processado sem demoras.
        
Esses passos garantem que o processo de recarregamento seja feito de forma segura e eficiente, mantendo você sempre pronto para novas corridas! 🚕💨
        `;
        break;
        case '12':
          response = `Remoção do Bônus de Compensação por Viagens

Este procedimento é ativado quando o sistema identifica viagens fraudulentas realizadas pelo motorista, isto é, viagens em que o condutor encerra a corrida antes ou depois dos destinos indicados pelo passageiro no aplicativo.

A verificação ocorre durante a madrugada, conduzida pelo sistema do aplicativo. Quando são identificadas mais de duas ou três viagens fraudulentas, o sistema retira todos os bônus de compensação atribuídos ao motorista por essas viagens.

Para evitar que o sistema classifique uma viagem como fraudulenta, recomenda-se:

* Reconhecendo que a maioria dos passageiros não especifica destinos precisos, utilizando pontos de referência ao solicitar a viagem, o aplicativo da Yango permite que o motorista classifique a corrida, justificando por que deixou o passageiro fora do ponto de destino marcado. Essa classificação deve ser de, no máximo, três estrelas, e selecionar a opção "Morada Inválida".

Somente assim o sistema não identificará a viagem como fraudulenta.`; 
          break;
      case '0':
        if (currentHour > 18 || (currentDay === 6 && currentHour > 13) || currentDay === 0) {
          if (currentDay === 6 && currentHour > 13) {
            response = 'Nosso suporte está encerrado, procure a solução na lista acima, caso não encontre iremos a atendê-lo na segunda-feira às 08:00. Para assistência, entre em contato com um dos nossos representantes. 🕒';
            msg.reply(menuMessage);
          } else if (currentDay === 0) {
            response = 'Nosso suporte está encerrado, procure a solução na lista acima, caso não encontre iremos a atendê-lo na segunda-feira às 08:00. Para assistência, entre em contato com um dos nossos representantes. 🕒';
            msg.reply(menuMessage);
          } else {
            response = 'Nosso suporte está encerrado, procure a solução na lista acima, caso não encontre iremos a atendê-lo amanhã às 08:00. Para assistência, entre em contato com um dos nossos representantes. 🕒';
            msg.reply(menuMessage);
          }
        } else {
          response = 'Para outras dúvidas, por favor entre em contato com nosso suporte. Estamos aqui para ajudar! 📞';
        }
        break;
      default:
        response = 'Opção inválida. Por favor, escolha uma opção do menu enviando o número correspondente. ❌';
    }

    msg.reply(response);
  
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
