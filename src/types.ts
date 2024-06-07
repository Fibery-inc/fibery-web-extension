export type User = {
  email: string;
  workspaces: Array<{ name: string; title: string }>;
  lastUsedWorkspace?: string;
  lastUsedType?: string;
  lastUsedTypeName?: string;
};

export type FiberyField = {
  "fibery/meta": {
    "ui/title?"?: boolean;
    "ui/type"?: "url";
  };
  "fibery/name": string;
  "fibery/type": "Collaboration~Documents/Document" | string;
};

export type FiberyType = {
  "fibery/meta": {
    "fibery/domain?": boolean;
    "sync/source"?: unknown;
    "fibery/highlight?"?: boolean;
  };
  "fibery/name": string;
  "fibery/id": string;
  "fibery/deleted?": boolean;
  "fibery/fields": Array<FiberyField>;
};

export type Entity = {
  "fibery/name": string;
  "fibery/id": string;
  "fibery/public-id": string;
} & Record<string, unknown>;

export type Schema = {
  "fibery/types": Array<FiberyType>;
};
