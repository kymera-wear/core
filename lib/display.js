const liblouis = require('liblouis');
const path = require('path');
const appRoot = require('app-root-path').toString();

liblouis.enableOnDemandTableLoading(path.join(appRoot, 'node_modules', 'liblouis-build', 'tables'));

class Display {
  constructor(points) {
    this.points = points;
    this.tables = 'tables/unicode.dis,tables/en-us-comp6.ctb';
  }

  /**
   * @private
   * Codepoint dot positions are as follows:
   * 1 4
   * 2 5
   * 3 6
   * 7 8
   */
  codepointBitArray(codepoint) {
    const code = codepoint.charCodeAt(0) - 0x2800;
    const data = new Array(8);

    for (let bit = 0; bit < 8; bit++) {
      data[bit] = (code & (1 << bit)) >> bit;
    }

    return data;
  }

  /** @private */
  writeBitArray(bitArray) {
    return Promise.all(this.points.map((point, index) =>
      point.write(bitArray[index]),
    ));
  }

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

  clear() {
    return Promise.all(this.points.map(point => point.write(0)));
  }
}

module.exports = { Display };
