const { createLogger, transports, format } = require("winston");

class Logger {
  constructor() {}

  //singleton application.
  //static method where we don't need to instantiate the class to access the method.
  static getInstance() {
    //if the Logger class has not been instantiated yett.
    if (Logger.instance == null) {
      //then instantiate it.
      Logger.instance = new Logger();
    }
    //if already has been, return the reference of the instantiated class in memory.
    return Logger.instance;
  }

  // const logger = createLogger({
  //   //carry data from application to console file or database, whereare we define.
  //   level: "info",
  //   format: format.combine(format.timestamp(), format.json()),
  //   transports: [new transports.Console()],
  // });
}

module.exports = { Logger };
