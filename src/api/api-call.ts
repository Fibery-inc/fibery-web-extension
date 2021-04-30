class AppError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

const unknownErrorMessage = "Oops, something has gone wrong.";
export async function apiCall<T>(
  url: string,
  {
    method,
    body = null,
  }: { method: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown }
): Promise<T> {
  const init = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
    ...(body !== null && { body: JSON.stringify(body) }),
  };
  try {
    const response = await fetch(url, { ...init, credentials: "same-origin" });
    if (response.status === 401) {
      throw new AppError("Unauthorized", 401);
    }
    const data = await response.json();
    if (!response.ok) {
      // noinspection ExceptionCaughtLocallyJS
      throw new AppError(data.message || unknownErrorMessage);
    }
    return data;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new AppError("Network error. Check your internet connection.");
    }
    debugger;
    throw new Error(unknownErrorMessage);
  }
}
