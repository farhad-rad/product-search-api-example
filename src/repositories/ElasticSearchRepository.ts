import { Client } from "@elastic/elasticsearch";
import { IModelFilters } from "../contracts/IModelFilters";
import { NotImplementedError } from "../contracts/NotImplementedError";
import { IProductFilters } from "../models/IProductFilters";
import { Product } from "../models/Product";

export class ElasticSearchRepository {
  private static instance: ElasticSearchRepository;
  private client: Client;

  private constructor() {
    this.client = new Client({ node: "http://localhost:3203" });
  }

  public static getInstance(): ElasticSearchRepository {
    return (ElasticSearchRepository.instance ??= new ElasticSearchRepository());
  }

  public async initializeIndexes(): Promise<void> {
    await this.client.indices.delete({ index: "products" });
    if (!(await this.client.indices.exists({ index: "products" }))) {
      await this.client.indices.create({
        index: "products",
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
        },
      });
      await this.client.indices.putSettings({
        index: "products",
        body: {
          settings: {
            number_of_replicas: 1,
          },
        },
      });
      await this.client.indices.putMapping({
        index: "products",
        body: {
          properties: {
            productId: { type: "keyword" }, // Unique identifier for filtering
            name: { type: "text" }, // Text field for full-text search
            description: { type: "text" },
            category: { type: "keyword" }, // Category filter
          },
        },
      });
    }
  }

  public async indexNewProduct(product: Product): Promise<void> {
    await this.client.index({
      index: "products",
      id: product.id?.toString(),
      body: {
        name: product.name,
        description: product.description,
        category: product.category,
      },
    });
  }

  public async searchAmongProducts(
    filters?: IProductFilters
  ): Promise<{ ids: number[]; total: number }> {
    filters ??= {};
    const must: any[] = [];
    const filter: any[] = [];

    if (filters.search) {
      must.push({
        multi_match: {
          query: filters.search,
          fields: ["name^2", "description"],
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
      // TODO: Sync pagination with mysql. HOW?!
      size: 10000,
    });

    const ids = body.hits.hits.map((hit: any) => parseInt(hit._id));

    return {
      ids,
      total:
        typeof body.hits.total == "number"
          ? body.hits.total
          : body.hits.total?.value ?? 0,
    };
  }
}
