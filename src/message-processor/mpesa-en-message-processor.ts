import { MessageProcessor, Transaction } from "./message-processor";

export class MPesaEnMessageProcessor implements MessageProcessor {
  process(mensagem: string): Transaction {
    const regexId = /(\w+) Confirmed/;
    const regexValor = /\b(\d+\.\d{2})MT\b/;
    const regexData = /(\d{1,2}\/\d{1,2}\/\d{2,4} at \d{1,2}:\d{2} [APMapm]{2})/;
    const regexContacto = /\s*(\d{9})\s*$/;

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

  getExampleMessage(): string {
    return "Confirmado BCR4CMUJ7R2. Transferiste 111.00MT e a taxa foi de 0.00MT para 850368938 ALBERTO aos 27/3/24 as 9:23 PM. O teu novo saldo M-Pesa e de 6.08MT. Em caso de duvida, liga 100. • M-Pesa e facil! Contacto: 8********";
  }
}
