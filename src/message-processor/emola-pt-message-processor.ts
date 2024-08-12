import { logger } from "@/config/logger";
import { MessageProcessor, Transaction } from "./message-processor";

export class EmolaPtMessageProcessor implements MessageProcessor {
  process(mensagem: string): Transaction {
    const padraoIdTransacao = /ID da transacao ((PP|CI)\d{6}\.\d{4}\.[A-Za-z]\d+)/;
    const matcherIdTransacao = mensagem.match(padraoIdTransacao);

    const padraoValor = /\b(\d+(?:\.\d{1,2})?)\s*MT\b/;
    const matcherValor = mensagem.match(padraoValor);
      const padraoHoraData = /as (\d{2}:\d{2}:\d{2})(?: de)? (\d{2}\/\d{2}\/\d{4})/;
      const matcherHoraData = mensagem.match(padraoHoraData);
      let dataRecarga = "none"; // Data padrão, caso não seja encontrado

    if (matcherHoraData) {
        const hora = matcherHoraData[1]; // Captura a hora
        const data = matcherHoraData[2]; // Captura a data
        dataRecarga = `${hora} ${data}`; // Formata a data e hora
    }

    logger.info("Leiaaa"+dataRecarga);

    const contatoMatch = /\s*(\d{9})\s*$/;
    const matcherContato = mensagem.match(contatoMatch);

    const id = matcherIdTransacao ? matcherIdTransacao[1].replace(/\./g, "_") : "DiversosEmola";
    const valorRecarga = matcherValor ? parseFloat(matcherValor[1]) : 0;
    const contacto = matcherContato ? matcherContato[1] : "N/A";

    return {
      id,
      amount: Number(valorRecarga),
      date: dataRecarga,
      contact: contacto,
    };
  }

  getExampleMessage(): string {
    return "ID da transação PP240323.0000.X69538. Transferiste 150 MT para 873528154 às 11:45:21 23/03/2024. Taxa: 0.0 MT. Saldo total 2.00 MT. Conteúdo: Recarga. Acesse o aplicativo e-Mola para facilitar e flexibilizar, nome: Alberto Elias nas transações. Baixe no Google Play e na App Store para acessar nossos serviços. Obrigado! Now Movitel! Contato: 8********";
  }
}
