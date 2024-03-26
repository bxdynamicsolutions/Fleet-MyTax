import twilio from "twilio";

import { config } from "./config";

const client = twilio(config.twilio.accountSid, config.twilio.authToken, { lazyLoading: true });

// Function to send message to WhatsApp
const sendMessage = async (message: string, to: string): Promise<void> => {
  try {
    await client.messages.create({
      to,
      body: message,
      from: "whatsapp:+14155238886",
    });
  } catch (error) {
    console.log(`Error at sendMessage --> ${error}`);
  }
};

export const WA = {
  sendMessage,
};
