import { FiberyType, Entity } from "../types";
import { getHttpProtocol } from "./getHttpProtocol";
export function getLink({
  host,
  entity,
  type,
}: {
  host: string;
  entity: Entity;
  type: FiberyType;
}): string {
  return `${getHttpProtocol() + host}/${type["fibery/name"]}/${
    entity["fibery/public-id"]
  }`;
}
