const { Logger } = require("../config/logger");
const logger = Logger.getInstance();
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";

let connectionHandler = null;

const handleConnection = async () => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    logger.info("Connected to mongoDb in handleConnection function.");
    connectionHandler = await client.connect();
    return connectionHandler;
  } catch (error) {
    logger.error("Error connecting to mongoDB in handleConnection function..");
  }
};
const getConnection = () => {
  if (connectionHandler) {
    return connectionHandler;
  }
};
getConnection();
module.exports = { handleConnection, getConnection };
