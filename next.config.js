const { createSecureHeaders } = require('next-secure-headers');

const secureHeaderOptions = {
  contentSecurityPolicy: {
    directives: {
      frameSrc: ['; frame-ancestors', "'self'", '*'],
      frameGuard: false,
    },
  },
};

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: createSecureHeaders(),
      },
      {
        source: '/(.*)/embed',
        headers: createSecureHeaders(secureHeaderOptions),
      },
    ];
  },
};
