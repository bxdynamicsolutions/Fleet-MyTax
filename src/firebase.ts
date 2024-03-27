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

export async function validateTransaction({ amount, contact, date, id }: Transaction): Promise<Result> {
  try {
    const firebaseRef = ref(database, id + "/" + id);
    const snapshot = await get(firebaseRef);
    const isValidTransaction =
      snapshot.exists() &&
      snapshot.val().dataRecarga == date &&
      snapshot.val().valorRecarga == Math.floor(amount) &&
      snapshot.val().idTransacao.replace(/\./g, "_") == id &&
      snapshot.val().estado.toString() === "false";

    if (!isValidTransaction) {
      logger.info(
        `Invalid Transaction: ${JSON.stringify({ amount, contact, date, id })} Snapshot: ${JSON.stringify(snapshot.val())}`,
      );
      return { success: false, error: "Transacção inválida" };
    }
    return { success: true };
  } catch (error) {
    logger.error(`Erro ao buscar dados no Firebase: ${error}`);
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

type Result =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };
