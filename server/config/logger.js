const { createLogger, transports, format } = require("winston");

const getDateFormat = () => {
  let date = new Date().toDateString();
  let time = new Date().toLocaleTimeString();
  return `${date} || ${time}`;
};

class Logger {
  constructor() {
    const logger = createLogger({
      //carry data from application to console file or database, whereare we define.
      level: "info",
      format: format.combine(
        format.json(),
        format.colorize(),
        format.prettyPrint(),
        format.printf((info) => {
          console.log(info);
          let message = `${getDateFormat()} || [${info.level}]: `;
          message += `${info.message}`;
          return message;
        })
      ),
      transports: [new transports.Console()],
    });
    this.logger = logger;
  }
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

  //info and error will also be the levels.
  info(message) {
    this.logger.log("info", message);
  }
  error(message) {
    this.logger.log("error", message);
  }
}

module.exports = { Logger };
