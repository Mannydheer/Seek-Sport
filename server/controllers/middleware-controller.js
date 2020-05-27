const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../utils/errors");

//this token will pretty much be the middleware for any user
//to do anything that a user is allowed to do
//say he wants to add a park, he needs to be authenticated first every time before he can.
const auth = async (req, res, next) => {
  let token = req.headers["authorization"];
  //check for token.
  if (!token) {
    throw new UnauthorizedError("No token, authorization denied");
  }
  try {
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
    next(err);
  }
};

module.exports = { auth };
