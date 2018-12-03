const liblouis = require('liblouis');
const path = require('path');
const appRoot = require('app-root-path').toString();

liblouis.enableOnDemandTableLoading(path.join(appRoot, 'node_modules', 'liblouis-build', 'tables'));

/** @class */
class Display {
  /**
   * @constructs
   * @param {Gpio[]} pins  An array of GPIO pins
   */
  constructor(pins) {
    this.pins = pins;
    this.tables = 'tables/unicode.dis,tables/en-us-comp6.ctb';
  }

  /**
   * Convert a Braille codepoint to an array of bits.
   *
   * @private
   * @param {String} codepoint  A Braille codepoint
   * @returns {Number[]}  An array of bits
   */
  codepointBitArray(codepoint) {
    const code = codepoint.charCodeAt(0) - 0x2800;
    const data = new Array(8);

    for (let bit = 0; bit < 8; bit++) {
      data[bit] = (code & (1 << bit)) >> bit;
    }

    return data;
  }

  /**
   * Write a bit array to the display.
   * @private
   * @param {Number[]} bitArray  An array of bits
   * @returns {Promise}  Promise to be resolved when done
   */
  writeBitArray(bitArray) {
    return Promise.all(this.pins.map((point, index) =>
      point.write(bitArray[index]),
    ));
  }

  /**
   * Write a string to the display.
   * @param {String} string  String to display
   * @returns {Promise}  Promise to be resolved when done
   */
  write(string) {
    const translated = liblouis.translateString(this.tables, string);
    const writeBitArray = bitArray => this.writeBitArray(bitArray);
    const codepointBitArray = codepoint => this.codepointBitArray(codepoint);
    const clear = () => this.clear();

    return new Promise(function next(resolve, reject, index = 0) {
      writeBitArray(codepointBitArray(translated[index]));

      setTimeout(clear, 400);

      if (++index === translated.length) {
        resolve();
      } else {
        setTimeout(() => next(resolve, reject, index), 500);
      }
    });
  }

  /**
   * Clear the display.
   * @returns {Promise}  Promise to be resolved when done
   */
  clear() {
    return Promise.all(this.pins.map(point => point.write(0)));
  }
}

module.exports = { Display };
