import got, { Options } from 'got';

const options = {} as Options;

if (process.env.NODE_ENV === 'test') {
  options.retry = { limit: 0 };
}

export default got.extend(options);
