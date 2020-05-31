const { createLogger, transports, format } = require("winston");

// built in NPM levels.
// {
//   error: 0,
//   warn: 1,
//   info: 2,
//   http: 3,
//   verbose: 4,
//   debug: 5,
//   silly: 6
// }

const Loglevels = {
  silly: 0,
  verbose: 1,
  info: 2,
  debug: 3,
  warn: 4,
  error: 5,
};
const getDateFormat = () => {
  let date = new Date().toDateString();
  let time = new Date().toLocaleTimeString();
  return `${date} || ${time}`;
};

class Logger {
  constructor(lvl) {
    //The data relevant about the log.
    this.logData = null;
    const logger = createLogger({
      //CUSTOMIZE LOG LEVELS.
      levels: Loglevels,
      //carry data from application to console file or database, whereare we define.
      level: lvl,
      format: format.combine(
        format.json(),
        format.colorize(),
        format.prettyPrint(),
        format.printf((info) => {
          let message = `${getDateFormat()} || *${info.level}* || Log Data: ${
            this.logData
          } || Message: `;
          message += `${info.message}`;
          return message;
        })
      ),
      transports: [new transports.Console()],
    });
    //-----------------PROPERTIES OF THE LOGGER CLASS.------------
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

  //----------------------METHODS-------------------------
  setLogLevel(lvl) {
    this.logger.log({ level: lvl });
  }
  //info and error will also be the levels.
  info(message) {
    this.logger.log("info", message);
    // this.logger.log({ level: "info", message: message });
  }
  error(message) {
    this.logger.log("error", message);
  }
  warn(message) {
    this.logger.log("warn", message);
  }
  //method for the data about the error.
  getLogData(data) {
    this.logData = data;
  }
}

module.exports = { Logger };
