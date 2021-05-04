export type User = {
  email: string;
  workspaces: Array<{ name: string }>;
  lastUsedWorkspace?: string;
  lastUsedType?: string;
};

type FiberyField = {
  "fibery/meta": {
    "ui/title?"?: boolean;
  };
  "fibery/name": string;
};

export type FiberyType = {
  "fibery/meta": {
    "fibery/domain?": boolean;
    "sync/source"?: unknown;
  };
  "fibery/name": string;
  "fibery/id": string;
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
