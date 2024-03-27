import express from "express";
import { markTransactionAsCompleted, validateTransaction } from "./firebase";
import { EmolaPtMessageProcessor } from "./message-processor/emola-message-processor";
import { MPesaEnMessageProcessor } from "./message-processor/mpesa-en-message-processor";
import { MPesaPtMessageProcessor } from "./message-processor/mpesa-pt-message-processor";
import { createFleetTransaction } from "./yandex-adapter";
import { WA } from "./whatsapp";
import { logger } from "./config/logger";
import { pinoHttp } from "pino-http";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(pinoHttp({ logger }));

app.post("/whatsapp", async (req, res) => {
  let message = req.body.Body as string;
  let senderID = req.body.From as string;
  logger.info(req.body);
  const processor = getProcessor(message);
  if (!processor) {
    logger.info("A mensagem não está em nenhum dos formatos esperados (MPESA ou EMOLA).");
    WA.sendMessage("A mensagem não está em nenhum dos formatos esperados (MPESA ou EMOLA).", senderID);
    return res.status(200).send();
  }
  const transaction = processor.process(message);
  // Buscar dados adicionais no Firebase
  const result = await validateTransaction(transaction);
  if (!result.success) {
    logger.info(result.error);
    logger.info("A recarga já foi usada, alterada ou inválida!");
    WA.sendMessage("A recarga já foi usada, alterada ou inválida!", senderID);
    return res.status(200).send();
  }

  const createResult = await createFleetTransaction(transaction.contact, transaction.amount, transaction.id);
  if (!createResult.success) {
    logger.info("A recarga já foi usada, alterada ou inválida!");
    WA.sendMessage("A recarga já foi usada, alterada ou inválida!", senderID);
    return res.status(200).send();
  }
  await markTransactionAsCompleted(transaction);
  logger.info(`Conta Recarregada: ${JSON.stringify(req.body)}`);
  WA.sendMessage("Conta recarregada!", senderID);
  res.status(200).send();
});

function getProcessor(message: string) {
  // Lógica de extração EMOLA
  if (message.substring(0, 2) === "ID") {
    return new EmolaPtMessageProcessor();
  } else if (message.startsWith("Confirmado")) {
    return new MPesaPtMessageProcessor();
  } else if (message.startsWith("B") && message.trim().split(" ")[0].length === 11) {
    return new MPesaEnMessageProcessor();
  }
  return null;
}

export { app };
