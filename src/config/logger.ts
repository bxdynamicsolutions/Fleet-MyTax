import Pino from "pino";

export const logger = Pino({
  enabled: true,
  level: "debug",
  name: "FleetApi",
});
