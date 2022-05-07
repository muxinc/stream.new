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
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
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
