import { IModel } from "../contracts/IModel";

export interface Product extends IModel<number> {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  created_at?: Date;
}
