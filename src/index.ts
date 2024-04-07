import "./config/node-exception-handler";
import { exitSignals, ExitStatus } from "./config/constants";
import { logger } from "./config/logger";
import { client } from "./app";

const exitWithError = (error: any) => {
  logger.error(`App exited with error: ${error}`);
  process.exit(ExitStatus.Failure);
};

const main = async () => {
  try {
    await client.initialize();
    logger.info("Client Initialized.");
    for (const exitSignal of exitSignals) {
      process.on(exitSignal, async () => {
        try {
          await client.destroy();
          logger.info("App exited with success");
          process.exit(ExitStatus.Success);
        } catch (error) {
          exitWithError(error);
        }
      });
    }
  } catch (error) {
    console.error(error)
    exitWithError(error);
  }
};

main();
