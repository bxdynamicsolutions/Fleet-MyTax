import { initializeApp } from "firebase/app";
import { get, getDatabase, ref, update } from "firebase/database"; // Adiciona "get" aqui

import { config } from "./config";
import { Transaction } from "./message-processor/message-processor";

const app = initializeApp(config.firebase);
const database = getDatabase(app);

export async function getMessageFromFirebase({ amount, contact, date, id }: Transaction): Promise<Result> {
  try {
    const firebaseRef = ref(database, id + "/" + id);
    const snapshot = await get(firebaseRef);
    const isValidTransaction =
      snapshot.exists() &&
      snapshot.val().dataRecarga == date &&
      snapshot.val().valorRecarga == Math.floor(amount) &&
      snapshot.val().idTransacao.replace(/\./g, "_") == id &&
      snapshot.val().estado.toString() === "false";

    if (!isValidTransaction) return { success: false, error: "Transacção inválida" };

    const updatedData = { estado: true, contacto: contact };
    await update(ref(database, id + "/" + id), updatedData);
    const message = snapshot.val().mensagem;
    return { success: true, message };
  } catch (error) {
    console.error("Erro ao buscar dados no Firebase:", error);
    const e = error as Error;
    return { success: false, error: e.message };
  }
}

type Result =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };
