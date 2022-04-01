const deliveryDomain = process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || "mux.com";

export function getStreamBaseUrl() { // eslint-disable-line
  return `https://stream.${deliveryDomain}`;
}

export function getImageBaseUrl() { // eslint-disable-line
  return `https://image.${deliveryDomain}`; 
}
