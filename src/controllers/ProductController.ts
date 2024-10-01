import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { ControllerBase } from "../contracts/ControllerBase";
import { CacheService } from "../services/CacheService";
import { IProductFilters } from "../models/IProductFilters";
import { ChildProcessService } from "../services/ChildProcessService";
import { Configuration } from "../utils/Configuration";

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

      res.addMessage("Product created successfully");
      res.apiResult(product, [], 201);

      ChildProcessService.signal("invalidateCache", {
        configs: Configuration.get("cache"),
        product,
      });
    } catch (error: any) {
      res.apiResult(null, [error.message], 500);
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
        after: req.query.after
          ? new Date(req.query.after.toString())
          : undefined,
        before: req.query.before
          ? new Date(req.query.before.toString())
          : undefined,
        offset,
        limit,
      };

      const cachedResult = await this.cacheService.getCachedResult(filters);
      if (cachedResult) {
        res.apiResult(cachedResult);
        return;
      }

      const result = await this.productService.getProducts(filters);
      await this.cacheService.cacheResult(filters, result);

      res.apiResult(result);

      // TODO: Must run in an scheduled job instead of here
      ChildProcessService.signal("pruneCache", {
        configs: Configuration.get("cache"),
      });
    } catch (error: any) {
      res.apiResult(null, [error.message], 500);
    }
  }
}
