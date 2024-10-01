import { IPagedList } from "../contracts/IPagedList";
import { Product } from "../models/Product";
import { ElasticSearchRepository } from "../repositories/ElasticSearchRepository";
import { MySqlProductRepository } from "../repositories/MySqlProductRepository";

export class ProductService {
  private static instance: ProductService;
  private mysqlRepo: MySqlProductRepository;
  private elasticRepo: ElasticSearchRepository;

  private constructor() {
    this.mysqlRepo = MySqlProductRepository.getInstance();
    this.elasticRepo = ElasticSearchRepository.getInstance();
  }

  public static getInstance(): ProductService {
    return (ProductService.instance ??= new ProductService());
  }

  async createProduct(productData: Omit<Product, "id">): Promise<Product> {
    const connection = await this.mysqlRepo.getConnection();
    await connection.beginTransaction();
    try {
      const product = await this.mysqlRepo.create(productData);
      await this.elasticRepo.indexNewProduct(product);
      await connection.commit();

      return product;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getProducts(filters: any): Promise<IPagedList<Product>> {
    const data = await this.elasticRepo.search(filters);

    const pageSize = filters.limit ?? 10;
    const currentPage = (filters.offset ?? 0) / pageSize + 1;

    return {
      items: data.hits,
      totalItems: data.total,
      pageSize,
      currentPage,
      totalPages: Math.ceil(data.total / pageSize),
    } as any;
  }
}
