import { Product } from "../models/Product";
import { ElasticSearchRepository } from "../repositories/ElasticSearchRepository";
import { MySqlProductRepository } from "../repositories/MySqlProductRepository";
import { CacheService } from "./CacheService";
import { fork } from "child_process";
import path from "path";

export class ProductService {
  private static instance: ProductService;
  private mysqlRepo: MySqlProductRepository;
  private elasticRepo: ElasticSearchRepository;
  // private cacheService: CacheService;

  private constructor() {
    this.mysqlRepo = MySqlProductRepository.getInstance();
    this.elasticRepo = ElasticSearchRepository.getInstance();
    // this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): ProductService {
    return (ProductService.instance ??= new ProductService());
  }

  async createProduct(productData: Omit<Product, "id">): Promise<Product> {
    const connection = await this.mysqlRepo.getConnection();
    await connection.beginTransaction();
    try {
      console.log("adding product", productData);
      const product = await this.mysqlRepo.create(productData);
      await this.elasticRepo.indexNewProduct(product);
      await connection.commit();

      // this.cacheService.invalidateAffectedResults(product);
      return product;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getProducts(filters: any): Promise<any> {
    // const cachedResult = await this.cacheService.getCachedResult(filters);
    // if (cachedResult) {
    //   return cachedResult;
    // }

    const { ids, total } = await this.elasticRepo.searchAmongProducts(filters);

    if (ids.length === 0) {
      return { products: [], total: 0 };
    }

    filters.ids = ids;

    const products = await this.mysqlRepo.getPaginatedList(filters);

    const result = { products, total };

    // await this.cacheService.cacheResult(filters, result);
    return result;
  }
}
