export const getHttpProtocol = (): string =>
  window.location.protocol !== "http:" ? "https://" : "http://";
