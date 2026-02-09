const { withWorkflow } = require('@workflow/next');
const { createSecureHeaders } = require('next-secure-headers');

const secureHeaderOptions = {
  frameGuard: false,
  contentSecurityPolicy: {
    directives: {
      frameAncestors: ["'self'", '*']
    },
  },
};

const config = {
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

module.exports = withWorkflow(config);
