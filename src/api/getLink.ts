import { getHttpProtocol } from "./getHttpProtocol";
export function getLink({
  host,
  entity,
  type,
}: {
  host: string;
  entity: any;
  type: any;
}): string {
  return `${getHttpProtocol() + host}/${type["fibery/name"]}/${
    entity["fibery/public-id"]
  }`;
}
