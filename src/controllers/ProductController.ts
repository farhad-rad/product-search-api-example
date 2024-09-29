import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { ControllerBase } from "../contracts/ControllerBase";

export class ProductController extends ControllerBase {
  private _productService: ProductService | null = null;
  private get productService(): ProductService {
    return (this._productService ??= ProductService.getInstance());
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const product = await this.productService.createProduct(productData);
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
      const filters = {
        search: req.query.search,
        category: req.query.category,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
        offset,
        limit,
      };
      const result = await this.productService.getProducts(filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
