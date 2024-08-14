import { MessageProcessor, Transaction } from "./message-processor";

export class EMOLAOPT implements MessageProcessor {
  
  process(message: string): Transaction {
    

    const id = "Emola";
    const amount = "";
    const date = "";
    const contact = "";

    return {
      id: id,
      amount: 0,
      date: date,
      contact: contact,
    };
  }
  getExampleMessage(): string {
    throw new Error("OPT Sender.");
  }
}
