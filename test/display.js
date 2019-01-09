const chai = require('chai');
const sinon = require('sinon');
const { Display } = require('../src/display');
const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('Display', () => {
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
    display = new Display(gpio);
  });

  afterEach(() => {
    sinon.resetHistory();
    clock.restore();
  });

  describe('#codepointBitArray(codepoint)', () => {
    it('should convert a codepoint into a bit array', () => {
      expect(display.codepointBitArray('⠭')).to.deep.equal([ 1, 0, 1, 1, 0, 1, 0, 0 ]);
      expect(display.codepointBitArray('⡇')).to.deep.equal([ 1, 1, 1, 0, 0, 0, 1, 0 ]);
    });
  });

  describe('#writeBitArray(bitArray)', () => {
    it('should write a bit array to the display', async () => {
      await display.writeBitArray([ 1, 1, 0, 1, 1, 0, 0, 0 ]);

      expect(gpio[0].write).to.have.been.calledOnceWith(1);
      expect(gpio[1].write).to.have.been.calledOnceWith(1);
      expect(gpio[2].write).to.have.been.calledOnceWith(0);
      expect(gpio[3].write).to.have.been.calledOnceWith(1);
      expect(gpio[4].write).to.have.been.calledOnceWith(1);
      expect(gpio[5].write).to.have.been.calledOnceWith(0);
      expect(gpio[6].write).to.have.been.calledOnceWith(0);
      expect(gpio[7].write).to.have.been.calledOnceWith(0);
    });
  });

  describe('#write(text)', () => {
    it('should write a character', () => {
      display.writeBitArray = sinon.stub(display, 'writeBitArray');
      display.write('g');
      clock.next();
      expect(display.writeBitArray).to.have.been.calledWith([ 1, 1, 0, 1, 1, 0, 0, 0 ]);
    });

    it('should write a series of characters', () => {
      display.writeBitArray = sinon.stub(display, 'writeBitArray');
      display.write('go');

      clock.next();
      expect(display.writeBitArray).to.have.been.calledWith([ 1, 1, 0, 1, 1, 0, 0, 0 ]);

      clock.next();
      clock.next();
      expect(display.writeBitArray).to.have.been.calledWith([ 1, 0, 1, 0, 1, 0, 0, 0 ]);
    });

    it('should clear the display after displaying a character', () => {
      display.clear = sinon.stub(display, 'clear');
      display.write('go');
      expect(display.clear).to.not.have.been.called;
      clock.next();
      expect(display.clear).to.have.been.called;
    });
    
    it('should resolve', done => {
      display.write('a').then(() => done());
    });
  });

  describe('#clear()', () => {
    it('should clear the display', async () => {
      await display.clear();

      expect(gpio[0].write).to.have.been.calledOnceWith(0);
      expect(gpio[1].write).to.have.been.calledOnceWith(0);
      expect(gpio[2].write).to.have.been.calledOnceWith(0);
      expect(gpio[3].write).to.have.been.calledOnceWith(0);
      expect(gpio[4].write).to.have.been.calledOnceWith(0);
      expect(gpio[5].write).to.have.been.calledOnceWith(0);
      expect(gpio[6].write).to.have.been.calledOnceWith(0);
      expect(gpio[7].write).to.have.been.calledOnceWith(0);
    });

    it('should resolve', done => {
      gpio[0].write.resolves();
      gpio[1].write.resolves();
      gpio[2].write.resolves();
      gpio[3].write.resolves();
      gpio[4].write.resolves();
      gpio[5].write.resolves();
      gpio[6].write.resolves();
      gpio[7].write.resolves();

      display.clear().then(() => done());
    });
  });
});
