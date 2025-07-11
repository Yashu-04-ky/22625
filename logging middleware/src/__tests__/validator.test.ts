import { LogValidator } from '../validator';

describe('LogValidator', () => {
  describe('validateLevel', () => {
    it('should validate correct log levels', () => {
      expect(LogValidator.validateLevel('debug')).toBe(true);
      expect(LogValidator.validateLevel('info')).toBe(true);
      expect(LogValidator.validateLevel('warn')).toBe(true);
      expect(LogValidator.validateLevel('error')).toBe(true);
      expect(LogValidator.validateLevel('fatal')).toBe(true);
    });

    it('should reject invalid log levels', () => {
      expect(LogValidator.validateLevel('invalid')).toBe(false);
      expect(LogValidator.validateLevel('DEBUG')).toBe(false);
      expect(LogValidator.validateLevel('')).toBe(false);
    });
  });

  describe('validateStack', () => {
    it('should validate correct stacks', () => {
      expect(LogValidator.validateStack('backend')).toBe(true);
      expect(LogValidator.validateStack('frontend')).toBe(true);
    });

    it('should reject invalid stacks', () => {
      expect(LogValidator.validateStack('invalid')).toBe(false);
      expect(LogValidator.validateStack('BACKEND')).toBe(false);
      expect(LogValidator.validateStack('')).toBe(false);
    });
  });

  describe('validatePackage', () => {
    it('should validate backend packages', () => {
      expect(LogValidator.validatePackage('backend', 'handler')).toBe(true);
      expect(LogValidator.validatePackage('backend', 'db')).toBe(true);
      expect(LogValidator.validatePackage('backend', 'service')).toBe(true);
    });

    it('should validate frontend packages', () => {
      expect(LogValidator.validatePackage('frontend', 'component')).toBe(true);
      expect(LogValidator.validatePackage('frontend', 'page')).toBe(true);
      expect(LogValidator.validatePackage('frontend', 'hook')).toBe(true);
    });

    it('should validate shared packages for both stacks', () => {
      expect(LogValidator.validatePackage('backend', 'auth')).toBe(true);
      expect(LogValidator.validatePackage('frontend', 'auth')).toBe(true);
      expect(LogValidator.validatePackage('backend', 'utils')).toBe(true);
      expect(LogValidator.validatePackage('frontend', 'utils')).toBe(true);
    });

    it('should reject invalid combinations', () => {
      expect(LogValidator.validatePackage('backend', 'component')).toBe(false);
      expect(LogValidator.validatePackage('frontend', 'handler')).toBe(false);
      expect(LogValidator.validatePackage('backend', 'invalid')).toBe(false);
    });
  });

  describe('validateLogRequest', () => {
    it('should validate correct log requests', () => {
      const result = LogValidator.validateLogRequest('backend', 'error', 'handler', 'Test message');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple validation errors', () => {
      const result = LogValidator.validateLogRequest('invalid', 'INVALID', 'invalid', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});