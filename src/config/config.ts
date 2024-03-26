import * as dotenv from "dotenv";
import { z } from "zod";
import { logger } from "./logger";

dotenv.config();

const configSchema = z.object({
  firebase: z.object({
    apiKey: z.string(),
    authDomain: z.string(),
    databaseURL: z.string(),
    projectId: z.string(),
    storageBucket: z.string(),
    messagingSenderId: z.string(),
    appId: z.string(),
    measurementId: z.string(),
  }),
  twilio: z.object({
    accountSid: z.string(),
    authToken: z.string(),
  }),
  fleet: z.object({
    parkId: z.string(),
    apiKey: z.string(),
    clientId: z.string(),
    paymentCategory: z.string(),
  }),
  port: z.number(),
});

type Config = z.infer<typeof configSchema>;

const validateConfig = (config: any): Config => {
  const parsedConfig = configSchema.safeParse(config);
  if (!parsedConfig.success) {
    logger.error("Invalid Configuration:" + parsedConfig.error);
    throw new Error("Invalid configuration: " + parsedConfig.error);
  }
  return parsedConfig.data;
};

export const config: Config = validateConfig({
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_ACCOUNT_TOKEN,
  },
  fleet: {
    parkId: process.env.FLEET_PARK_ID,
    apiKey: process.env.FLEET_API_KEY,
    clientId: process.env.FLEET_CLIENT_ID,
    paymentCategory: process.env.FLEET_PAYMENT_CATEGORY,
  },
  port: 5000,
});
