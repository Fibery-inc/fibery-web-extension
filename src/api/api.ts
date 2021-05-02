import { apiCall } from "./api-call";
import { getHttpProtocol } from "./getHttpProtocol";

const meUrl = `${process.env.REACT_APP_HOST || ""}/api/users/me`;
const getBaseApiUrl = (host: string) => `${getHttpProtocol()}${host}/api/`;

const getCommandApiUrl = (host: string) => {
  return `${getBaseApiUrl(host)}commands`;
};

export const getMe = () => {
  return apiCall(meUrl, { method: "GET" });
};

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
