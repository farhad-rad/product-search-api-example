import { IModelFilters } from "../contracts/IModelFilters";
import { Product } from "./Product";

export interface IProductFilters extends IModelFilters<Product> {
  ids?: number[];
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
