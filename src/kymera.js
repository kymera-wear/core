const { Display } = require('./display');

class Kymera {
  constructor(options) {
    this.paused = options.paused || false;
    this.display = new Display(options.displayGPIO);

    this.main();
    setInterval(() => this.main(), 60 * 1000);
  }

  main() {
    if (this.paused) {
      return;
    }

    this.display.write(
      new Date().toLocaleTimeString(undefined, {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }
}

module.exports = { Kymera };
