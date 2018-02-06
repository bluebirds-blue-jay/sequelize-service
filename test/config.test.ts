import { RestError } from '@bluejay/rest-errors';
import { Config } from '../src/config';

describe('Config', () => {
  describe('#set()', () => {
    it('should override value', () => {
      const override = () => new Error();
      const current = Config.get('errorFactory');
      Config.set('errorFactory', override);
      expect(Config.get('errorFactory')).to.equal(override);
      Config.set('errorFactory', current);
    });
  });
  describe('#get()', () => {
    it('should use default', () => {
      const override = () => new Error();
      expect(Config.get('errorFactory', override)).to.equal(override);
    });
    it('should NOT use null default', () => {
      expect(Config.get('errorFactory', null)).to.equal(Config.get('errorFactory'));
    });
    it('should use null default', () => {
      expect(Config.get('errorFactory', null, true)).to.equal(null);
    });
  });
  describe('errorFactory', () => {
    it('should format SequelizeUniqueConstraintError', () => {
      const err = new Error();
      err.name = 'SequelizeUniqueConstraintError';
      (err as any).errors = [{ path: 'foo' }];
      expect((Config.get('errorFactory')(err) as RestError).statusCode).to.equal(409);
    });
    it('should format SequelizeValidationError', () => {
      const err = new Error();
      err.name = 'SequelizeValidationError';
      (err as any).errors = [{ message: 'foo' }];
      expect((Config.get('errorFactory')(err) as RestError).statusCode).to.equal(400);
    });
    it('should format SequelizeForeignKeyConstraintError', () => {
      const err = new Error();
      err.name = 'SequelizeForeignKeyConstraintError';
      (err as any).index = 'foo';
      expect((Config.get('errorFactory')(err) as RestError).statusCode).to.equal(400);
    });
  });
});