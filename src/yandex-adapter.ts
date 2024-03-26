import axios from "axios";
import https from "https";

import { config } from "./config/config";
import { randomUUID } from "crypto";

const api = axios.create({
  timeout: 1200000,
  httpsAgent: new https.Agent({ keepAlive: true }),

  headers: {
    "X-API-Key": config.fleet.apiKey,
    "X-Client-ID": config.fleet.clientId,
    "accept-language": "en-US",
  },
  baseURL: "https://fleet-api.taxi.yandex.net/",
});

export async function createFleetTransaction(contact: string, amount: number, code: string) {
  try {
    const response = await api.post("/v1/parks/driver-profiles/list", {
      query: {
        park: {
          id: config.fleet.parkId,
        },
        text: String(contact),
      },
    });

    const driver = response.data.driver_profiles[0];
    if (!driver) {
      throw new Error("motorista não encontrado");
    }
    const profileId = driver.driver_profile.id;
    const depositResponse = await api.post(
      "/v2/parks/driver-profiles/transactions",
      {
        amount: String(amount),
        category_id: config.fleet.paymentCategory,
        description: String(code),
        driver_profile_id: profileId,
        park_id: config.fleet.parkId,
      },
      { headers: { "X-Idempotency-token": code + randomUUID() } },
    );
    return { success: depositResponse.status === 200 };
  } catch (error) {
    const e = error as Error;
    console.log(e.message);
    return { success: false, error: e.message };
  }
}
