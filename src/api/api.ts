import { apiCall, AppError, unknownErrorMessage } from "./api-call";
import { getValue } from "./storage.api";
import { getHttpProtocol } from "./get-http-protocol";
import { Schema, User } from "../types";

const meUrl = `${import.meta.env.VITE_APP_HOST || ""}/api/users/me`;
const getBaseApiUrl = (host: string) => `${getHttpProtocol()}${host}/api/`;

const getCommandApiUrl = (host: string) => {
  return `${getBaseApiUrl(host)}commands`;
};

export async function getMe(): Promise<User> {
  const me = await apiCall<{
    email: string;
    workspaces: Array<{ name: string; title: string }>;
  }>(meUrl, { method: "GET" });
  return {
    ...me,
    lastUsedTypeName: await getValue("lastUsedTypeName"),
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

type SuccessResult<T> = {
  success: true;
  result: Array<T> | T;
};

type ErrorResult = {
  success: false;
  result: { message: string };
};

export async function getSchema(host: string) {
  return apiCall<Schema>(
    `${getBaseApiUrl(
      host
    )}schema?with-description=false&with-soft-deleted=false`,
    { method: "GET" }
  );
}

export function executeCommands<T>({
  host,
  commands,
  returnFirstResult = true,
}: {
  host: string;
  commands: Array<unknown>;
  returnFirstResult?: boolean;
}): Promise<T> {
  return apiCall<[SuccessResult<T> | ErrorResult]>(getCommandApiUrl(host), {
    method: "POST",
    body: commands,
  }).then(([{ success, result }]) => {
    if (success) {
      if (returnFirstResult) {
        return Array.isArray(result) && result.length > 0
          ? (result[0] as T)
          : (result as T);
      }
      return result as T;
    }
    throw new AppError(
      (result as { message: string }).message || unknownErrorMessage
    );
  });
}
