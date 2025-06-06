/**
 * @jest-environment node
 */
import logger from './logger';

describe('logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exports logger function', () => {
    expect(logger).toBeDefined();
    expect(typeof logger).toBe('function');
  });

  it('has warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('has error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('logs messages with prefix', () => {
    logger('test message');
    expect(consoleLogSpy).toHaveBeenCalledWith('[stream.new]', 'test message');
  });

  it('logs errors with prefix', () => {
    logger.error('error message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[stream.new]', 'error message');
  });

  it('logs warnings with prefix', () => {
    logger.warn('warning message');
    expect(consoleWarnSpy).toHaveBeenCalledWith('[stream.new]', 'warning message');
  });

  it('handles multiple arguments', () => {
    logger('message', { data: 'test' }, 123);
    expect(consoleLogSpy).toHaveBeenCalledWith('[stream.new]', 'message', { data: 'test' }, 123);
  });

  it('handles error objects', () => {
    const error = new Error('test error');
    logger.error(error);
    expect(consoleWarnSpy).toHaveBeenCalledWith('[stream.new]', error);
  });
});