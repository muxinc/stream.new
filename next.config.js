import createSecureHeaders from "next-secure-headers";

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: createSecureHeaders() }];
  },
};
