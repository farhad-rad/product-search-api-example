import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { ControllerBase } from "../contracts/ControllerBase";
import { CacheService } from "../services/CacheService";
import { IProductFilters } from "../models/IProductFilters";

export class ProductController extends ControllerBase {
  private _productService: ProductService | null = null;
  private get productService(): ProductService {
    return (this._productService ??= ProductService.getInstance());
  }

  private _cacheService: CacheService | null = null;
  private get cacheService(): CacheService {
    return (this._cacheService ??= CacheService.getInstance());
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);
      this.cacheService.invalidateAffectedResults(product);

      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const offset = (page - 1) * limit;
      const filters: IProductFilters = {
        search: req.query.search?.toString(),
        category: req.query.category?.toString(),
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        offset,
        limit,
      };

      const cachedResult = await this.cacheService.getCachedResult(filters);
      if (cachedResult) {
        res.json(cachedResult);
        return;
      }

      const result = await this.productService.getProducts(filters);
      await this.cacheService.cacheResult(filters, result);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
