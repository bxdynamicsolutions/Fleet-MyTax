import { initializeApp } from "firebase/app";
import { get, getDatabase, ref, update } from "firebase/database"; // Adiciona "get" aqui

import { config } from "./config/config";
import { Transaction } from "./message-processor/message-processor";
import { logger } from "./config/logger";

const app = initializeApp(config.firebase);
const database = getDatabase(app);

export async function markTransactionAsCompleted({ id, contact }: Transaction): Promise<void> {
  const firebaseRef = ref(database, id + "/" + id);
  const updatedData = { estado: true, contacto: contact };
  await update(firebaseRef, updatedData);
}

export async function validateTransaction({ amount, contact, date, id }: Transaction): Promise<{ success: boolean; error?: string }> {
  try {
    const firebaseRef = ref(database, `${id}/${id}`);
    const snapshot = await get(firebaseRef);

    if (!snapshot.exists()) {
      logger.info(`Transaction not found: ${JSON.stringify({ amount, contact, date, id })}`);
      return { success: false, error: "A mensagem de confirmação da operadora não foi recebida. Por favor, verifique se a mensagem foi copiada corretamente. Se o problema persistir, entre em contato com o Suporte." };
    }

    const transactionData = snapshot.val();

    if (transactionData.idTransacao === "Emola") {
      logger.info(`OPT do EMOLA: ${JSON.stringify(transactionData.mensagem)}`);
      return { success: false, error: `${transactionData.mensagem}` };
    }

    // Verificação se a recarga já foi usada
    if (transactionData.estado.toString() === "true") {
      logger.info(`Transaction already used: ${JSON.stringify({ amount, contact, date, id })} Snapshot: ${JSON.stringify(transactionData)}`);
      return { success: false, error: `A recarga já foi usada pelo: ${transactionData.contacto}` };
    }

    // Verificação se o valor da recarga é menor que 100 MZN
    if (transactionData.valorRecarga < 100) {
      logger.info(`Amount less than 100: ${JSON.stringify({ amount, contact, date, id })} Snapshot: ${JSON.stringify(transactionData)}`);
      return { success: false, error: "O valor mínimo de recarregamento é de 100 MZN. A MyTaxi não se responsabiliza por valores abaixo deste." };
    }

    // Verificação se a transação é válida
    const isValidTransaction =
      //transactionData.dataRecarga == date &&
      transactionData.valorRecarga == Math.floor(amount) &&
      transactionData.idTransacao.replace(/\./g, "_") == id &&
      transactionData.valorRecarga >= 100;

      // logger.info("Leia bem: "+ transactionData.dataRecarga +" and "+date);

    if (!isValidTransaction) {
      logger.info(`Invalid Transaction: ${JSON.stringify({ amount, contact, date, id })} Snapshot: ${JSON.stringify(transactionData)}`);
      return { success: false, error: "A mensagem de confirmação da operadora não foi recebida. Por favor, verifique se a mensagem foi copiada corretamente e tente novamente mais tarde. Se o problema persistir, entre em contato com o Suporte." };
    }

    return { success: true };
  } catch (error) {
    logger.error(`Erro ao buscar dados no Firebase: ${error}`);
    const e = error as Error;
    return { success: false, error: e.message };
  }
}