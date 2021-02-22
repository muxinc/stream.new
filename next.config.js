const { createSecureHeaders } = require("next-secure-headers");

const secureHeaderOptions = {
  contentSecurityPolicy: {
    directives: {
      frameSrc: ["frame-ancestors", "'self'", "*.mux.com"],
    },
  }
};

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: createSecureHeaders(secureHeaderOptions) }];
  },
};
