const chai = require('chai');
const sinon = require('sinon');
const { Display } = require('../src/display');
const { Kymera } = require('../src/kymera');
const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('Kymera', () => {
  before(() => {
    gpio = [
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
      { write: sinon.stub() },
    ];
  });

  beforeEach(() => {
    clock = sinon.useFakeTimers();

    kymera = new Kymera({
      displayGPIO: gpio,
      paused: true,
    });
  });

  afterEach(() => {
    sinon.resetHistory();
    clock.restore();
  });

  it('should display a time value', () => {
    sinon.spy(kymera.display, 'write');
    kymera.paused = false;
    kymera.main();

    let spyCall = kymera.display.write.getCall(0);
    expect(spyCall.args[0]).to.equal('00:00');
  });

  it('should update once a minute', () => {
    sinon.spy(kymera.display, 'write');
    kymera.paused = false;

    clock.tick(1000 * 60);
    clock.tick(1000 * 60);

    let spyCall0 = kymera.display.write.getCall(0);
    let spyCall1 = kymera.display.write.getCall(1);

    expect(spyCall0.args[0]).to.equal('00:01');
    expect(spyCall1.args[0]).to.equal('00:02');
  });
});
