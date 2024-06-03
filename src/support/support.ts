import { Client } from 'whatsapp-web.js';
import { UserState } from '../types/types';

const menuMessage = `*Bem-vindo (a) ao Suporte da My Taxi!* 🚖

*Como podemos ajudá-lo?*

*1.* Criar Conta. 💼
*2.* O saldo não é exibido no aplicativo após recarregar a conta.💸
*3.* Não estou recebendo o código de verificação.📥
*4.* Preciso cancelar uma viagem.🚦
*5.* Meu número de carta de condução está associado a outra conta.📴
*6.* Problema ao terminar uma viagem de entrega (Delivery).📦
*7.* Dificuldades para Iniciar Sessão.📲
*8.* O mapa não mostra minha localização atual nem as avenidas próximas.🧭
*9.* A App não mostra o ponto de recolha, o destino ou a rota selecionada.🗾Verifique as permissões de localização em seu dispositivo e reinicie o GPS
*10.* Como Recarregar a Conta.💳
*11.* Os bónus por compensação de desconto foram retirados do saldo.⚠️
*0.* Outro.

Responda # para retornar ↩️ ao Menu Principal.

*#MyTaxi #Yango #bxd*
`;

const recarregamentoMessage = `Envie o comprovativo de recarregamento no seguinte formato:

*🔄 Recarregamento 24H*
    
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

*#MyTaxi #Yango #bxd*`;

interface UserStates {
    [key: string]: UserState;
  }
  
  const userStates: UserStates = {};
  
  export async function handleSupportMessages(client: Client, from: string, body: string) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

  let response = '';
  switch (body) {
    case '1':
      response = `Para se registrar, acesse este link httpPara se registrar, acesse este link https://yango.com/forms/driver_partner_selfreg_multipage?ref_id=9b6dddd4bcb84b8084e4fc4bad86a359, baixe o aplicativo YangoPro na Play Store ou App Store e complete o seu cadastro. 📲s://yango.com/forms/driver_partner_selfreg_multipage?ref_id=9b6dddd4bcb84b8084e4fc4bad86a359, baixe o aplicativo YangoPro na Play Store ou App Store e complete o seu cadastro. 📲
* Para se registrar, acesse ao link https://yango.com/forms/driverPara se registrar, acesse este link https://yango.com/forms/driver_partner_selfreg_multipage?ref_id=9b6dddd4bcb84b8084e4fc4bad86a359, baixe o aplicativo YangoPro na Play Store ou App Store e complete o seu cadastro. 📲_partner_selfreg_multipage?ref_id=9b6dddd4bcb84b8084e4fc4bad86a359

* Baixe o aplicativo YangoPro na Play Store ou App Store.

* Para completar a configuração, siga as instruções📲: https://youtu.be/Wr7lX8JpES8?si=TUFb7r_e1p-Y8RC1`;
      break;
    case '2':
      response = 'Clique na opção "Saldo" no aplicativo para atualizar. Se o problema persistir, certifique-se de que está na conta do parceiro MyTaxi. 💳';
      break;
    case '3':
      response = `
Verifique se o número de telefone para o qual está sendo enviado o código de verificação está em sua posse. Se não estiver, peça à pessoa que lhe envie o código. 
Caso o número esteja em sua posse, solicite o reenvio do código de verificação por SMS ou WhatsApp e aguarde.
      📩`;
      break;
    case '4':
      response = 'Você pode cancelar a viagem após atingir o tempo de espera de 10 minutos, caso esteja no ponto de recolha. 🚕';
      break;
    case '5':
      response = `Verifique se não possui uma conta com sua carta de condução associada a outro parceiro. Se tiver, peça para que coloquem a conta em estado inativo para que possa acessar sua conta sem restrições, pois não é possível estar online em dois parceiros simultaneamente.`;
      break;
    case '6':
      response = ' Tente seguir as instruções para ir até o local mais próximo da entrega. Se isso não funcionar, entre em contato com o suporte para encontrarmos uma solução juntos.🔄';
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
        
*#MyTaxi #Yango #bxd*`;
      break;
    case '8':
      response = 'Desligue e ligue novamente os dados de localização no seu celular. Em seguida, ative o GPS. Você também pode ir às configurações do celular e atualizar os serviços de localização.. 🌍';
      break;
    case '9':
        response = 'Se o app não está mostrando o ponto de recolha ou rota, verifique as configurações de navegação no app (GPS), reinicie o celular ou acesse as definições do aplicativo, clique em "Navegação" e ative a opção "Navegação na App".🛣️';
         break;
    case '10':
        response = recarregamentoMessage;
      break;
    case '11':
        response = `Remoção do Bônus de Compensação por Viagens

Este procedimento é ativado quando o sistema identifica viagens fraudulentas realizadas pelo motorista, isto é, viagens em que o condutor encerra a corrida antes ou depois dos destinos indicados pelo passageiro no aplicativo.

A verificação ocorre durante a madrugada, conduzida pelo sistema do aplicativo. Quando são identificadas mais de duas ou três viagens fraudulentas, o sistema retira todos os bônus de compensação atribuídos ao motorista por essas viagens.

Para evitar que o sistema classifique uma viagem como fraudulenta, recomenda-se:

* Reconhecendo que a maioria dos passageiros não especifica destinos precisos, utilizando pontos de referência ao solicitar a viagem, o aplicativo da Yango permite que o motorista classifique a corrida, justificando por que deixou o passageiro fora do ponto de destino marcado. Essa classificação deve ser de, no máximo, três estrelas, e selecionar a opção "Morada Inválida".

Somente assim o sistema não identificará a viagem como fraudulenta.

*#MyTaxi #Yango #bxd*`; 
      break;
    case '0':
      if (currentHour > 18 || (currentDay === 6 && currentHour > 13) || currentDay === 0) {
        if (currentDay === 6 && currentHour > 13) {
          response = 'Nosso suporte está encerrado.⛔ Por favor, consulte a lista de perguntas acima para possíveis soluções. Caso não encontre a resposta, estaremos disponíveis para atendê-lo amanhã a partir das 08:00. 🕒';
        }else {
          response = 'Nosso suporte está encerrado.⛔ Por favor, consulte a lista de perguntas acima para possíveis soluções. Caso não encontre a resposta que procura, estaremos disponíveis para atendê-lo na segunda-feira a partir das 08:00. Agradecemos pela compreensão.🫱🏼‍🫲🏼 🕒';
        }
      } else {
        response = `
*Para outras dúvidas, por favor, entre em contato com nosso suporte pelos seguintes números:*

* +258 86 104 7949 (Chamada ou WhatsApp)
* +258 87 352 8154 (WhatsApp)
* +258 86 576 9843 (Chamada)
* +258 85 329 3875 (Envio de Comprovativo no WhatsApp)
        
Estamos aqui para ajudar!🫱🏼‍🫲🏼😃📞

*#MyTaxi #Yango #bxd*`;
      }
      break;
      case '#':
        userStates[from].menuShown = false; 
        handleInitialMenu(client, from);
        break;
    default:
      response = 'Opção inválida. Por favor, escolha uma opção do menu enviando, o número correspondente. ❌';
  }

  await client.sendMessage(from, response);
}

export async function handleInitialMenu(client: Client, from: string) {
  const initialMenu = `*Bem-vindo a MyTaxi🚖! Por favor, escolha uma opção:*
*1.* Recarregamentos
*2.* Suporte

*#MyTaxi #Yango #bxd*`;

  // Inicializar o estado do usuário, se não estiver definido
  if (!userStates[from]) {
    userStates[from] = { menu: 'initial', menuShown: false };
  }

  // Mostrar o menu inicial se ainda não foi mostrado
  if (!userStates[from].menuShown) {
    await client.sendMessage(from, initialMenu);
    userStates[from].menuShown = true; // Definir o flag como verdadeiro após mostrar o menu
  }
}

export async function processMenuSelection(client: Client, from: string, body: string) {
  // Verificar se o usuário está no menu inicial
  if (userStates[from].menu === 'initial') {
    if (body === '1' || body.toLowerCase() === 'recarregamentos') {
      await client.sendMessage(from, recarregamentoMessage);
    } else if (body === '2' || body.toLowerCase() === 'suporte') {
      await client.sendMessage(from, menuMessage);
      userStates[from].menu = 'support'; // Mudar o estado do menu para suporte
      userStates[from].menuShown = false; // Resetar o flag para o menu de suporte
    } else {
      // Se a entrada não for válida, mostrar novamente o menu inicial
      await client.sendMessage(from, 'Opção inválida. Por favor, escolha uma opção do menu enviando, o número correspondente. ❌❌');
    }
  } else if (userStates[from].menu === 'support') {
    await handleSupportMessages(client, from, body);
    userStates[from].menuShown = false; // Resetar o flag para o menu inicial
  }
}

export { userStates };