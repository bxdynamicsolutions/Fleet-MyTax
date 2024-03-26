import { MessageProcessor, Transaction } from "./message-processor";

export class MPesaPtMessageProcessor implements MessageProcessor {
  process(mensagem: string): Transaction {
    const regexId = /Confirmado (\w+)/;
    const regexValor = /\b(\d+\.\d{2})MT\b/;
    const regexData = /(\d{1,2}\/\d{1,2}\/\d{2,4} as \d{1,2}:\d{2} [APMapm]{2})/;
    const regexContacto = /Contacto: (\d+)/;

    const idMatch = mensagem.match(regexId);
    const valorMatch = mensagem.match(regexValor);
    const dataMatch = mensagem.match(regexData);
    const contactoMatch = mensagem.match(regexContacto);

    // Substituir todos os pontos por underscores no id
    const id = idMatch ? idMatch[1].replace(/\./g, "_") : "DiversosMpesa";
    const valorRecarga = valorMatch ? valorMatch[1] : "0";
    const dataRecarga = dataMatch ? dataMatch[1].replace(/as/, "at") : "data";
    const contacto = contactoMatch ? contactoMatch[1] : "N/A";

    return {
      id,
      amount: Number(valorRecarga),
      date: dataRecarga,
      contact: contacto,
    };
  }
}
