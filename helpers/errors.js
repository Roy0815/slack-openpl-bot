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

module.exports = {
  OpenplError,
  NoUserFoundError,
};
