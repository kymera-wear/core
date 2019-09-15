#!/usr/bin/env node
//const { Gpio } = require('onoff');
const { Kymera, Display } = require('../');
const fs = require('fs');
const util = require('util');
const writeFile = util.promisify(fs.writeFile);

class Gpio {
  constructor(pin, direction = 'out') {
    if (typeof pin != 'number') {
      throw Error('Expected argument `pin` to be of type `number`');
    }

    this.pin = pin;
    this.write(0);
  }

  async write(level = 0) {
    await writeFile(`/sys/class/gpio/gpio${this.pin}/value`, level ? 1 : 0)
  }
}

Display.prototype._write = Display.prototype.write;

Display.prototype.write = function(string) {
  console.log(string);
  return this._write(string);
};

const ky = new Kymera({
  timezone: -4,
  displayGPIO: [
    new Gpio(0, 'out'),
    new Gpio(1, 'out'),
    new Gpio(6, 'out'),
    new Gpio(2, 'out'),
    new Gpio(3, 'out'),
    new Gpio(18, 'out'),
    new Gpio(19, 'out'),
    new Gpio(11, 'out'),
  ],
});
