import { apiCall } from "./api-call";

const meUrl = `${process.env.REACT_APP_HOST || ""}/api/users/me`;

const getProtocol = () =>
  window.location.protocol !== "http:" ? "https://" : "http://";
const getCommandApiUrl = (host: string) =>
  `${getProtocol()}${host}/api/commands`;

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
  return apiCall(`${getProtocol()}${host}/api/documents/${secret}`, {
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
