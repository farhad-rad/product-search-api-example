import { IModelFilters } from "../contracts/IModelFilters";
import { IRepository } from "../contracts/IRepository";
import { NotImplementedError } from "../contracts/NotImplementedError";
import { IProductFilters } from "../models/IProductFilters";
import { Product } from "../models/Product";
import { createPool, Pool, PoolConnection } from "mysql2/promise";
import { Configuration } from "../utils/Configuration";
import { getMySqlClient } from "../lib/mysqlClient";

export class MySqlProductRepository implements IRepository<Product> {
  private static instance: MySqlProductRepository;
  public static getInstance(): MySqlProductRepository {
    return (MySqlProductRepository.instance ??= new MySqlProductRepository());
  }

  private _pool: Pool | null = null;
  public get pool() {
    return (this._pool ??= getMySqlClient());
  }

  public async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  async getList(filters?: IProductFilters): Promise<Product[]> {
    // TODO: For further implementations
    throw new NotImplementedError();
  }

  async create(model: Omit<Product, "id">): Promise<Product> {
    const [result] = await this.pool.execute(
      "INSERT INTO `products` (`name`, `description`, `category`, `price`, `created_at`) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP())",
      [model.name, model.description, model.category, model.price]
    );
    const insertId = (result as any).insertId;
    return { ...model, id: insertId } as Product;
  }

  async getById(id: number): Promise<Product | undefined> {
    // TODO: For further implementations
    throw new NotImplementedError();
  }

  async update(model: Product): Promise<Product> {
    // TODO: For further implementations
    throw new NotImplementedError();
  }

  async delete(id: number): Promise<boolean> {
    // TODO: For further implementations
    throw new NotImplementedError();
  }
}
