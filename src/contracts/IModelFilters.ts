import { IModel } from "./IModel";

export interface IModelFilters<
  TModel extends IModel<TPrimaryKey>,
  TPrimaryKey = TModel["id"]
> {
  limit?: number;
  offset?: number;
}
