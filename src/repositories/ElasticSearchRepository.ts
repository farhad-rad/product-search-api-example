import { Client } from "@elastic/elasticsearch";
import { IProductFilters } from "../models/IProductFilters";
import { Product } from "../models/Product";
import { getElasticsearchClient } from "../lib/elasticsearchClient";

export class ElasticSearchRepository {
  private static instance: ElasticSearchRepository;
  public static getInstance(): ElasticSearchRepository {
    return (ElasticSearchRepository.instance ??= new ElasticSearchRepository());
  }

  private _client: Client | null = null;
  public get client() {
    return (this._client ??= getElasticsearchClient());
  }

  public async indexNewProduct(product: Product): Promise<void> {
    await this.client.index({
      index: "products",
      id: product.id?.toString(),
      body: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        createdAt: product.created_at,
      },
    });
  }

  public async search(
    filters?: IProductFilters
  ): Promise<{ hits: Product[]; total: number }> {
    filters ??= {};
    const must: any[] = [];
    const filter: any[] = [];

    if (filters.search) {
      must.push({
        multi_match: {
          query: filters.search,
          fields: ["name", "description"],
        },
      });
    }

    if (filters.category) {
      filter.push({
        term: {
          category: filters.category,
        },
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      const priceRange: any = {};
      if (filters.minPrice) priceRange.gte = filters.minPrice;
      if (filters.maxPrice) priceRange.lte = filters.maxPrice;
      filter.push({ range: { price: priceRange } });
    }

    if (filters.after || filters.before) {
      const dateRange: any = {};
      if (filters.after) dateRange.gte = filters.after;
      if (filters.before) dateRange.lte = filters.before;
      filter.push({ range: { createdAt: dateRange } });
    }

    filters.limit ??= 10;
    filters.offset ??= 0;

    const body = await this.client.search<any>({
      index: "products",
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
      },
      size: filters.limit,
      from: filters.offset,
    });

    const { hits, total } = body.hits;
    const result: Product[] = hits.map((x) => ({
      id: parseInt(x._id as string),
      name: x._source.name,
      description: x._source.description,
      category: x._source.category,
      price: x._source.price,
      created_at: new Date(x._source.createdAt),
    }));

    return {
      hits: result,
      total: typeof total === "number" ? total : total?.value ?? 0,
    };
  }
}
