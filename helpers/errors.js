class OpenplError extends Error {}

class NoLifterFoundError extends OpenplError {
  constructor(name) {
    super();
    this.message = `No data found for user *${name}*`;
  }

  toString() {
    return this.message;
  }
}

class AmbiguousLifterError extends OpenplError {
  constructor(userArray) {
    super();
    this.users = userArray;
  }

  getLifters() {
    return this.users;
  }

  toString() {
    return "Ambiguous lifter name";
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

class CommandSubmissionError extends OpenplError {
  constructor({ block, message }) {
    super();
    [this.block, this.message] = [block, message];
  }

  toString() {
    return this.message;
  }

  toViewResponseObject() {
    return {
      response_action: "errors",
      errors: {
        [this.block]: `${this.message}`,
      },
    };
  }
}

module.exports = {
  OpenplError,
  NoLifterFoundError,
  AmbiguousLifterError,
  NoInputError,
  CommandSubmissionError,
};
