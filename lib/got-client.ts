import got from 'got';

const options = {};

if (process.env.NODE_ENV === 'test') {
  options.retry = 0;
}

export default got.extend(options);
