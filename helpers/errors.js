class OpenplError extends Error {}

class NoUserFoundError extends OpenplError {
  constructor(name) {
    super();
    this.name = name;
  }

  toString() {
    return `No data found for user *${this.name}*`;
  }
}

class NoInputError extends OpenplError {
  constructor(missingInputs) {
    super();
    this.missingInputs = missingInputs;
  }

  toString() {
    let string = `The following inputs are missing:`;
    this.missingInputs.forEach(
      (element, index) =>
        (string = `${string}${index == 0 ? "" : ","} ${element}`)
    );
    return string;
  }
}

module.exports = {
  OpenplError,
  NoUserFoundError,
  NoInputError,
};
