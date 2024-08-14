import { MessageProcessor, Transaction } from "./message-processor";

export class EmolaEnMessageProcessor implements MessageProcessor {
  process(message: string): Transaction {
    const transactionIdPattern = /Transaction ID ((PP|CI)\d{6}\.\d{4}\.[A-Za-z]\d+)/;
    const matcherIdTransaction = message.match(transactionIdPattern);

    const amountPattern = /\b(\d*([\d\,]*)\.?\d+)MT\b/;
    const matcherAmount = message.match(amountPattern);

    const dateTimePattern = /at (\d{1,2}:\d{2}:\d{2} \d{1,2}\/\d{1,2}\/\d{2,4})/;
    const matcherDateTime = message.match(dateTimePattern);

    const contactPattern = /\s*(\d{9})\s*$/;
    const matcherContact = message.match(contactPattern);

    const id = matcherIdTransaction ? matcherIdTransaction[1].replace(/\./g, "_") : "VariousEmola";
    const valorRecarga = matcherAmount ? matcherAmount[1] : "0";
    const date = matcherDateTime ? matcherDateTime[1] : "none";
    const contact = matcherContact ? matcherContact[1] : "N/A";

    return {
      id,
      amount: Number(valorRecarga.replace(",", "")),
      date: date,
      contact: contact,
    };
  }

  getExampleMessage(): string {
    return "Transaction ID PP240323.0000.X69538. You transferred 150 MT to 873528154 at 11:45:21 23/03/2024. Fee: 0.0 MT. Total balance 2.00 MT. Content: Recharge. Access e-Mola app to make transactions quicker and easier, name: Alberto Elias in transactions. Download on Google Play and the App Store to access our services. Thank you! Now Movitel! Contact: 8********";
  }
}
