export interface IApiResult<T = null> {
  data: T;
  messages: string[];
  ok: boolean;
}
