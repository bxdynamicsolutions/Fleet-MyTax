import { MessageProcessor, Transaction } from "./message-processor";

export class MPesaEnMessageProcessor implements MessageProcessor {
  process(mensagem: string): Transaction {
    const regexId = /(\w+) Confirmed/;
    const regexValor = /\b(\d+\.\d{2})MT\b/;
    const regexData = /(\d{1,2}\/\d{1,2}\/\d{2,4} at \d{1,2}:\d{2} [APMapm]{2})/;
    const regexContacto = /Contacto: (\d+)/;

    const idMatch = mensagem.match(regexId);
    const valorMatch = mensagem.match(regexValor);
    const dataMatch = mensagem.match(regexData);
    const contactoMatch = mensagem.match(regexContacto);

    const id = idMatch ? idMatch[1] : "DiversosMpesa";
    const valorRecarga = valorMatch ? valorMatch[1] : "0";
    const dataRecarga = dataMatch ? dataMatch[1] : "data";
    const contacto = contactoMatch ? contactoMatch[1] : "N/A";

    return {
      id,
      amount: Number(valorRecarga),
      date: dataRecarga,
      contact: contacto,
    };
  }
}
