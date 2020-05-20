const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://dbUser:YOFwbi6x3P5o3H4d@cluster0-seh3x.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&retryWrites=true&ssl=true";

let connectionHandler = null;

const handleConnection = async () => {
  console.log("connect to mongodb in connection.js");
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    console.log("Connected to mongoDB in handleConnection.");
    connectionHandler = await client.connect();
    return connectionHandler;
  } catch (error) {
    console.log("Error connected to mongoDB");
  }
};
const getConnection = () => {
  if (connectionHandler) {
    return connectionHandler;
  }
};
getConnection();
module.exports = { handleConnection, getConnection };
