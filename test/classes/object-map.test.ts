import { ObjectMap } from '../../src/classes/object-map';

describe('ObjectMap', () => {
  describe('constructor()', () => {
    it('should build a new object map', () => {
      const map = new ObjectMap({ foo: 'bar' });
      expect(map.getData()).to.deep.equal({ foo: 'bar' });
    });
  });

  describe('#get()', () => {
    it('should return value', () => {
      const map = new ObjectMap({ foo: 'bar' });
      expect(map.get('foo')).to.equal('bar');
    });

    it('should return undefined', () => {
      const map = new ObjectMap({ foo: 'bar' });
      expect(map.get('foos' as any)).to.equal(undefined);
    });
  });

  describe('#set()', () => {
    it('should return a new map', () => {
      const map = new ObjectMap({});
      const newMap = map.set({ foo: 'bar' });
      expect(map).to.not.equal(newMap);
      expect(map.getData()).to.deep.equal({});
      expect(newMap.getData()).to.deep.equal({ foo: 'bar' });
    });

    it('should merge data', () => {
      const map = new ObjectMap({ foo: 'bar' });
      const newMap = map.set({ bar: 123 });
      expect(map.getData()).to.deep.equal({ foo: 'bar' });
      expect(newMap.getData()).to.deep.equal({ foo: 'bar', bar: 123 });
    });
  });
});