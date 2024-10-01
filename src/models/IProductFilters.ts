import { IModelFilters } from "../contracts/IModelFilters";
import { Product } from "./Product";

export interface IProductFilters extends IModelFilters<Product> {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  after?: Date | string;
  before?: Date | string;
}
