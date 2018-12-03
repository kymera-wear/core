const chai = require('chai');
const { Display } = require('../lib/display');
const sinon = require('sinon');

const { expect } = chai;

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

describe('Display', () => {
  before(() => {
    points = [
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
    display = new Display(points);
  });

  afterEach(() => {
    sinon.resetHistory();
    clock.restore();
  });

  describe('#codepointBitArray(point)', () => {
    it('should convert a codepoint into a bit array', () => {
      expect(display.codepointBitArray('⠭')).to.deep.equal([ 1, 0, 1, 1, 0, 1, 0, 0 ]);
      expect(display.codepointBitArray('⡇')).to.deep.equal([ 1, 1, 1, 0, 0, 0, 1, 0 ]);
    });
  });

  describe('#writeBitArray(bitArray)', () => {
    it('should write a bit array to the display', async () => {
      await display.writeBitArray([ 1, 1, 0, 1, 1, 0, 0, 0 ]);

      expect(points[0].write).to.have.been.calledOnceWith(1);
      expect(points[1].write).to.have.been.calledOnceWith(1);
      expect(points[2].write).to.have.been.calledOnceWith(0);
      expect(points[3].write).to.have.been.calledOnceWith(1);
      expect(points[4].write).to.have.been.calledOnceWith(1);
      expect(points[5].write).to.have.been.calledOnceWith(0);
      expect(points[6].write).to.have.been.calledOnceWith(0);
      expect(points[7].write).to.have.been.calledOnceWith(0);
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

      expect(points[0].write).to.have.been.calledOnceWith(0);
      expect(points[1].write).to.have.been.calledOnceWith(0);
      expect(points[2].write).to.have.been.calledOnceWith(0);
      expect(points[3].write).to.have.been.calledOnceWith(0);
      expect(points[4].write).to.have.been.calledOnceWith(0);
      expect(points[5].write).to.have.been.calledOnceWith(0);
      expect(points[6].write).to.have.been.calledOnceWith(0);
      expect(points[7].write).to.have.been.calledOnceWith(0);
    });

    it('should resolve', done => {
      points[0].write.resolves();
      points[1].write.resolves();
      points[2].write.resolves();
      points[3].write.resolves();
      points[4].write.resolves();
      points[5].write.resolves();
      points[6].write.resolves();
      points[7].write.resolves();

      display.clear().then(() => done());
    });
  });
});
