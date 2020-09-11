function logger (...args) {
  args.unshift('[stream.new]');
  console.log(...args); // eslint-disable-line no-console
}

logger.warn = function loggerWarn (...args) {
  args.unshift('[stream.new]');
  console.warn(...args); // eslint-disable-line no-console
};

logger.error = function loggerError (...args) {
  args.unshift('[stream.new]');
  console.error(...args); // eslint-disable-line no-console
};

export default logger;
