const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  //carry data from application to console file or database, whereare we define.
  transports: [
    new transports.Console({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

module.exports = { logger };
