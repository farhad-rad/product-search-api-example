import { Request, Response, NextFunction } from "express";

export const apiMessageHolder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (res as any)._pipeMessages = [];
  res.getPipeMessages = () => {
    return (res as any)._pipeMessages;
  };
  res.addMessage = (message: string) => {
    (res as any)._pipeMessages.push(message);
    return res;
  };

  next();
};

declare module "express-serve-static-core" {
  interface Response {
    getPipeMessages(): string[];
    addMessage(message: string): this;
  }
}
