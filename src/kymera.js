const { Display } = require('./display');
const tinydate = require('tinydate');

class Kymera {
  constructor(options) {
    this.paused = options.paused || false;
    this.display = new Display(options.displayGPIO);

    this.timezone = options.timezone || 0;

    this.formatTime = tinydate('{HH}:{mm}', {
      HH: d => {
        let hours = d.getUTCHours().toString();
        return '0'.repeat(2 - hours.length) + hours;
      },
    });

    this.main();
    setInterval(() => this.main(), 60 * 1000);
  }

  main() {
    if (this.paused) {
      return;
    }

    this.display.write(
      this.formatTime(
        new Date(
          Date.now() + this.timezone * 60 * 60 * 1000
        )
      )
    );
  }
}

module.exports = { Kymera };
