import { IModel } from "./IModel";
import { IModelFilters } from "./IModelFilters";

export interface IRepository<
  TModel extends IModel<TPrimaryKey>,
  TPrimaryKey = TModel["id"]
> {
  getPaginatedList(
    filters?: IModelFilters<TModel, TPrimaryKey> & {
      limit: number;
      offset: number;
    }
  ): Promise<TModel[]>;
  getList(filters?: IModelFilters<TModel, TPrimaryKey>): Promise<TModel[]>;
  create(model: Omit<TModel, "id">): Promise<TModel>;
  getById(id: TPrimaryKey): Promise<TModel | undefined>;
  update(model: TModel): Promise<TModel>;
  delete(id: TPrimaryKey): Promise<boolean>;
}
