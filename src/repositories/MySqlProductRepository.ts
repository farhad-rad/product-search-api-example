import { IModelFilters } from "../contracts/IModelFilters";
import { IRepository } from "../contracts/IRepository";
import { NotImplementedError } from "../contracts/NotImplementedError";
import { IProductFilters } from "../models/IProductFilters";
import { Product } from "../models/Product";
import { createPool, Pool, PoolConnection } from "mysql2/promise";

export class MySqlProductRepository implements IRepository<Product> {
  private static instance: MySqlProductRepository;
  private pool: Pool;

  private constructor() {
    this.pool = createPool({
      host: "localhost",
      user: "root",
      port: 3201,
      password: "rootpassword",
      database: "products_db",
    });
  }

  public static getInstance(): MySqlProductRepository {
    return (MySqlProductRepository.instance ??= new MySqlProductRepository());
  }

  public getPool(): Pool {
    return this.pool;
  }
  public async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  async getList(filters?: IProductFilters): Promise<Product[]> {
    // TODO: For further implementations
    throw new NotImplementedError();
  }

  async getPaginatedList(filters?: IProductFilters): Promise<Product[]> {
    filters ??= {};

    let sql = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];

    if (filters.ids) {
      sql += " AND `id` IN (?)";
      params.push(filters.ids);
    }
    if (filters.minPrice) {
      sql += " AND `price` >= ?";
      params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
      sql += " AND `price` <= ?";
      params.push(filters.maxPrice);
    }

    const fomattedCountQuery = this.pool.format(
      `select count(*) as c from (${sql}) as a`,
      params
    );

    filters.offset ??= 0;
    filters.limit ??= 10;
    sql += " LIMIT ? OFFSET ?";
    params.push(filters.limit, filters.offset);
    const formattedQuery = this.pool.format(sql, params);

    const [_c] = await this.pool.execute(fomattedCountQuery);
    const total = (_c as any)[0]?.c ?? 0;
    const [rows] = await this.pool.execute(formattedQuery);
    return rows as Product[];
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
