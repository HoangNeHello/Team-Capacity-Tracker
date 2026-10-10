// api/ApiError.js: error carrying the HTTP status and the server's message.
export default class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
