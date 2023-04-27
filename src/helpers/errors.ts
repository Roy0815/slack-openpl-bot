import { ViewErrorsResponseAction } from "@slack/bolt";
import { PersonShort } from "./types.js";

export class OpenplError extends Error {
  constructor() {
    super();
  }
}

export class NoLifterFoundError extends OpenplError {
  private _message: string;

  constructor(name: string) {
    super();
    this._message = `No data found for user *${name}*`;
  }

  toString() {
    return this._message;
  }
}

export class AmbiguousLifterError extends OpenplError {
  private _lifters: PersonShort[];

  constructor(lifters: PersonShort[]) {
    super();
    this._lifters = lifters;
  }

  getLifters() {
    return this._lifters;
  }

  toString() {
    return "Ambiguous lifter name";
  }
}

/* export class NoInputError extends OpenplError {
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
} */

export class CommandSubmissionError extends OpenplError {
  private _block: string;
  private _message: string;

  constructor(block: string, message: string) {
    super();
    [this._block, this._message] = [block, message];
  }

  toString() {
    return this._message;
  }

  toViewResponseObject(): ViewErrorsResponseAction {
    return {
      response_action: "errors",
      errors: {
        [this._block]: `${this._message}`,
      },
    };
  }
}
