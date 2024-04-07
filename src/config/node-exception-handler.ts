import { ExitStatus } from "./constants";
import { logger } from "./logger";

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`App exiting due to an unhandled promise: ${JSON.stringify(promise)} and reason: ${reason}`);
  throw reason; // will be handled by uncaughtException handler
});

process.on("uncaughtException", error => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);
  process.exit(ExitStatus.Failure);
});
