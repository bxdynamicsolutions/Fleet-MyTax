import { MessageProcessor, Transaction } from "./message-processor";

export class EmolaPtMessageProcessor implements MessageProcessor {
  process(mensagem: string): Transaction {
    const padraoIdTransacao = /ID da transacao ((PP|CI)\d{6}\.\d{4}\.[A-Za-z]\d+)/;
    const matcherIdTransacao = mensagem.match(padraoIdTransacao);

    const padraoValor = /\b(\d+(?:\.\d{1,2})?)\s*MT\b/;
    const matcherValor = mensagem.match(padraoValor);
    const padraoHoraData = /as (\d{1,2}:\d{2}:\d{2} \d{1,2}\/\d{1,2}\/\d{2,4})/;
    const matcherHoraData = mensagem.match(padraoHoraData);
    const contatoMatch = /Contacto: (\d+)/;
    const matcherContato = mensagem.match(contatoMatch);

    const id = matcherIdTransacao ? matcherIdTransacao[1].replace(/\./g, "_") : "DiversosEmola";
    const valorRecarga = matcherValor ? parseFloat(matcherValor[1]) : 0;
    const dataRecarga = matcherHoraData ? matcherHoraData[1] : "none";
    const contacto = matcherContato ? matcherContato[1] : "N/A";

    return {
      id,
      amount: Number(valorRecarga),
      date: dataRecarga,
      contact: contacto,
    };
  }
}
