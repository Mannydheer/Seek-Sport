const jwt = require("jsonwebtoken");

//this token will pretty much be the middleware for any user
//to do anything that a user is allowed to do
//say he wants to add a park, he needs to be authenticated first every time before he can.
const auth = async (req, res, next) => {
  let token = req.headers["authorization"];
  console.log(token, "INSIDE MIDDLEWARE");
  //wrap in try catch, because if token is invalid, you dont want to send anything.
  //check for token.
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }
  try {
    //if there is a token. verify it.
    const tokenVerification = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    //take the user Id from the token. Put that into req.user,
    //add user from the pauload.
    req.user = tokenVerification;
    //call next middleware.
    next();
  } catch (err) {
    res.status(400).json({ message: "Token is not valid." });
  }
};

module.exports = { auth };
