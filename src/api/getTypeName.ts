import { Schema } from "../types";

export function getTypeName({
  schema,
  typeId,
  lastUsedTypeName,
}: {
  schema?: Schema;
  typeId?: string;
  lastUsedTypeName?: string;
}): string {
  if (schema && typeId) {
    for (const type of schema["fibery/types"]) {
      const [, name] = type["fibery/name"].split("/");
      const id = type["fibery/id"];
      if (id === typeId) {
        return name;
      }
    }
  }
  return lastUsedTypeName || "Entity";
}
