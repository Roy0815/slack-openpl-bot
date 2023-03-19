class OpenplError extends Error {}

class NoUserFoundError extends OpenplError {
  constructor(name) {
    super();
    this.message = `No data found for user *${name}*`;
  }

  toString() {
    return this.message;
  }
}

class NoInputError extends OpenplError {
  constructor(missingInputs) {
    super();
    this.message = `The following inputs are missing:`;

    missingInputs.forEach(
      (element, index) =>
        (this.message += `${index == 0 ? "" : ","} ${element}`)
    );
  }

  toString() {
    return this.message;
  }
}

module.exports = {
  OpenplError,
  NoUserFoundError,
  NoInputError,
};
