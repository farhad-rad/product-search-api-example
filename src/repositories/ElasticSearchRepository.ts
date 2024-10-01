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
