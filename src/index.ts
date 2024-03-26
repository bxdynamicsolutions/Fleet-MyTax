import express from "express";
import { getMessageFromFirebase } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { WA } from "./whatsapp";
import { config } from "./config";

const app = express();
app.use(express.json());

app.post("/whatsapp", async (req, res) => {
  let message = req.body.Body as string;
  let senderID = req.body.From as string;
  const processor = getProcessor(message);
  if (!processor) {
    console.log("A mensagem não está em nenhum dos formatos esperados (MPESA ou EMOLA).");
    return; // TODO: Validate response and send whatsapp message
  }
  const transaction = processor.process(message);
  // Buscar dados adicionais no Firebase
  const result = await getMessageFromFirebase(transaction);
  if (!result.success) {
    console.log(result.error);
    return; // TODO: Validate response and send whatsapp message
  }
  const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
  if (!createResult.success) {
    WA.sendMessage("A recarga já foi usada, alterada ou inválida!", senderID);
    return res.status(200).send();
  }
  WA.sendMessage("Conta recarregada!", senderID);
  res.status(200).send();
});

function getProcessor(message: string) {
  // Lógica de extração EMOLA
  if (message.substring(0, 2) === "ID") {
    return new EmolaPtMessageProcessor();
  } else if (message.startsWith("Confirmado")) {
    return new MPesaEnMessageProcessor();
  } else if (message.startsWith("B")) {
    return new MPesaPtMessageProcessor();
  }
  return null;
}

app.listen(config.port, () => console.log("App running at port ", config.port));
