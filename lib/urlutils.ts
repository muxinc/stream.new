const deliveryDomain = process.env.NEXT_PUBLIC_MUX_BYO_DOMAIN || "mux.com";

export function getStreamBaseUrl():string {
  return `https://stream.${deliveryDomain}`;
}

export function getImageBaseUrl():string {
  return `https://image.${deliveryDomain}`;
}
