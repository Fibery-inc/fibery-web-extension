export type User = {
  email: string;
  workspaces: Array<{ name: string }>;
  lastUsedWorkspace?: string;
  lastUsedType?: string;
};
