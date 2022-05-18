const { createSecureHeaders } = require('next-secure-headers');

const secureHeaderOptions = {
  frameGuard: false,
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", '*']
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
