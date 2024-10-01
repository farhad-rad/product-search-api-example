import { Request, Response, NextFunction } from "express";
import { IApiResult } from "../contracts/IApiResult";

function isApiResult(body: any): body is IApiResult<any> {
  return (
    body &&
    typeof body === "object" &&
    "data" in body &&
    "messages" in body &&
    "ok" in body &&
    Array.isArray(body.messages) &&
    typeof body.ok === "boolean"
  );
}

export const ensureApiResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const acceptsJson = req.headers["accept"]?.includes("application/json");
  const originalSend = res.send.bind(res);

  res.apiResult = (
    data: any = null,
    messages: string[] = [],
    statusCode = 200
  ) => {
    const pipeMessages = "getPipeMessages" in res ? res.getPipeMessages() : [];
    res.status(statusCode).header("application/json");
    return originalSend({
      data,
      messages: [...pipeMessages, ...messages],
      ok: statusCode >= 200 && statusCode < 300,
    });
  };

  res.send = (body: any) => {
    const contentTypeJson = res
      .getHeader("Content-Type")
      ?.toString()
      .includes("application/json");

    if (acceptsJson || contentTypeJson) {
      let parsedBody: any;

      try {
        parsedBody = typeof body === "string" ? JSON.parse(body) : body;
      } catch (e) {
        parsedBody = body;
      }

      if (!isApiResult(parsedBody)) {
        const wrappedResponse: IApiResult<typeof parsedBody> = {
          data: parsedBody,
          messages: [],
          ok: res.statusCode >= 200 && res.statusCode < 300,
        };

        return originalSend(JSON.stringify(wrappedResponse));
      }
    }

    return originalSend(body);
  };

  next();
};

declare module "express-serve-static-core" {
  interface Response {
    apiResult<T>(data: T, messages?: string[], statusCode?: number): this;
  }
}
