const deliveryDomain = process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || "mux.com";

export function getStreamBaseUrl() {
  return `https://stream.${deliveryDomain}`;
}

export function getImageBaseUrl() {
  return `https://image.${deliveryDomain}`;
}
