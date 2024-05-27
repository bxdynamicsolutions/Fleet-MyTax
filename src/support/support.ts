import { Client } from 'whatsapp-web.js';

export async function handleSupportMessages(client: Client, from: string, body: string) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

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

    await client.sendMessage(from, menuMessage);
    let response = '';
    switch (body) {
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
          } else if (currentDay === 0) {
            response = 'Nosso suporte está encerrado, procure a solução na lista acima, caso não encontre iremos a atendê-lo na segunda-feira às 08:00. Para assistência, entre em contato com um dos nossos representantes. 🕒';
          } else {
            response = 'Nosso suporte está encerrado, procure a solução na lista acima, caso não encontre iremos a atendê-lo amanhã às 08:00. Para assistência, entre em contato com um dos nossos representantes. 🕒';
          }
        } else {
          response = 'Para outras dúvidas, por favor entre em contato com nosso suporte. Estamos aqui para ajudar! 📞';
        }
        break;
      default:
        response = 'Opção inválida. Por favor, escolha uma opção do menu enviando o número correspondente. ❌';
    }

    await client.sendMessage(from, response);
  
}
