/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

function logger (...args: any): void {
  args.unshift('[stream.new]');
  console.log(...args); // eslint-disable-line no-console
}

logger.warn = function loggerWarn (...args: any) {
  args.unshift('[stream.new]');
  console.warn(...args); // eslint-disable-line no-console
};

logger.error = function loggerError (...args: any) {
  args.unshift('[stream.new]');
  console.warn(...args); // eslint-disable-line no-console
};

export default logger;
