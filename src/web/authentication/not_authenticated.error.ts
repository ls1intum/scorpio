export class NotAuthenticatedError extends Error {
  constructor() {
    super("Please sign in");

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, NotAuthenticatedError.prototype);
  }
}
