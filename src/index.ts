import { exitSignals, ExitStatus } from "./config/constants";
import { logger } from "./config/logger";
import { app } from "./app";
import { config } from "./config/config";

const exitWithError = (error: any) => {
  logger.error(`App exited with error: ${error}`);
  process.exit(ExitStatus.Failure);
};

const main = async () => {
  try {
    const currentApp = app.listen(config.port, () => logger.info(`server started on port: ${config.port}`));

    for (const exitSignal of exitSignals) {
      process.on(exitSignal, async () => {
        try {
          await new Promise((resolve, reject) => {
            currentApp.close(error => (error ? reject(error) : resolve(true)));
          });
          logger.info("App exited with success");
          process.exit(ExitStatus.Success);
        } catch (error) {
          exitWithError(error);
        }
      });
    }
  } catch (error) {
    exitWithError(error);
  }
};

main();
