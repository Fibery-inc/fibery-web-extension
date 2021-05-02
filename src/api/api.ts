import { apiCall } from "./api-call";
import { getValue } from "./storage.api";
import { getHttpProtocol } from "./getHttpProtocol";
import { User } from "../types";

const meUrl = `${process.env.REACT_APP_HOST || ""}/api/users/me`;
const getBaseApiUrl = (host: string) => `${getHttpProtocol()}${host}/api/`;

const getCommandApiUrl = (host: string) => {
  return `${getBaseApiUrl(host)}commands`;
};

export async function getMe(): Promise<User> {
  const me = await apiCall<{
    email: string;
    workspaces: Array<{ name: string }>;
  }>(meUrl, { method: "GET" });
  return {
    ...me,
    lastUsedType: await getValue("lastUsedType"),
    lastUsedWorkspace: await getValue("lastUsedWorkspace"),
  };
}

export function updateDocument({
  host,
  content,
  secret,
}: {
  host: string;
  content: string;
  secret: string;
}) {
  return apiCall(`${getBaseApiUrl(host)}documents/${secret}`, {
    method: "PUT",
    body: {
      content,
    },
  });
}

export const schemaPayload = [{ command: "fibery.schema/query", args: {} }];
export const getSchema = (host: string) => {
  return apiCall(getCommandApiUrl(host), {
    method: "POST",
    body: schemaPayload,
  });
};

export function executeCommands({
  host,
  commands,
}: {
  host: string;
  commands: Array<unknown>;
}) {
  return apiCall(getCommandApiUrl(host), {
    method: "POST",
    body: commands,
  });
}
