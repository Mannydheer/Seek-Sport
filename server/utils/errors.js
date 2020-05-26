//Error class is built in.
//we are making classes that are children to the Error class.
//this way, the children have access to the methods of the Error class.

class HttpException extends Error {
  constructor(message) {
    super(message);
  }
}

class ConflictError extends HttpException {
  constructor(message) {
    super(message);
    this.code = 409;
    this.name = "ConflictError";
  }
}
class BadRequestError extends HttpException {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = "BadRequestError";
  }
}
class NotFoundError extends HttpException {
  constructor(message) {
    super(message);
    this.code = 404;
    this.name = "NotFoundError";
  }
}

module.exports = {
  HttpException,
  ConflictError,
  BadRequestError,
  NotFoundError,
};
