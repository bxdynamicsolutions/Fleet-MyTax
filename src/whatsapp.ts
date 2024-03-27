import twilio from "twilio";

import { config } from "./config/config";
import { logger } from "./config/logger";

const client = twilio(config.twilio.accountSid, config.twilio.authToken, { lazyLoading: true });

// Function to send message to WhatsApp
const sendMessage = async (message: string, to: string): Promise<void> => {
  try {
    logger.info(`WA_MESSAGE: ${JSON.stringify({ to, message })}`);
    await client.messages.create({
      to,
      body: message,
      from: "whatsapp:+14155238886",
    });
  } catch (error) {
    logger.error(`Error at sendMessage --> ${error}`);
  }
};

export const WA = {
  sendMessage,
};
