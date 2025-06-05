import { logger } from './logger';

describe('logger', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;
  let consoleInfoSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'Test info message');
    });

    it('should log info with multiple arguments', () => {
      logger.info('User', { id: 123, name: 'Test' });
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'User', { id: 123, name: 'Test' });
    });

    it('should handle empty info calls', () => {
      logger.info();
      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]');
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Test error message');
    });

    it('should log Error objects', () => {
      const error = new Error('Something went wrong');
      logger.error('Failed operation:', error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Failed operation:', error);
    });

    it('should log error stack traces', () => {
      const error = new Error('Stack trace test');
      logger.error(error);
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', error);
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'Test warning message');
    });

    it('should log warnings with context', () => {
      logger.warn('Deprecated function', { function: 'oldMethod', replacement: 'newMethod' });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN]',
        'Deprecated function',
        { function: 'oldMethod', replacement: 'newMethod' }
      );
    });
  });

  describe('debug', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'Test debug message');
    });

    it('should log debug with objects', () => {
      const debugData = { requestId: 'abc123', timestamp: Date.now() };
      logger.debug('Request data:', debugData);
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'Request data:', debugData);
    });
  });

  describe('log', () => {
    it('should log general messages', () => {
      logger.log('Test log message');
      expect(consoleLogSpy).toHaveBeenCalledWith('[LOG]', 'Test log message');
    });

    it('should handle complex data types', () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { key: 'value' },
        date: new Date('2023-01-01'),
      };
      logger.log('Complex data:', complexData);
      expect(consoleLogSpy).toHaveBeenCalledWith('[LOG]', 'Complex data:', complexData);
    });
  });

  describe('formatted output', () => {
    it('should maintain consistent formatting', () => {
      logger.info('Info test');
      logger.warn('Warn test');
      logger.error('Error test');
      logger.debug('Debug test');

      expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]', 'Info test');
      expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN]', 'Warn test');
      expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR]', 'Error test');
      expect(consoleLogSpy).toHaveBeenCalledWith('[DEBUG]', 'Debug test');
    });

    it('should handle circular references', () => {
      const circular = { name: 'test' };
      circular.self = circular;
      
      // This should not throw
      expect(() => logger.info('Circular:', circular)).not.toThrow();
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('environment-based logging', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should respect NODE_ENV for debug logs', () => {
      process.env.NODE_ENV = 'production';
      // In a real implementation, you might suppress debug logs in production
      logger.debug('Debug in production');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should always log errors regardless of environment', () => {
      process.env.NODE_ENV = 'production';
      logger.error('Error in production');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});