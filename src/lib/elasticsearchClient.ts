import { Client } from "@elastic/elasticsearch";
import { Configuration } from "../utils/Configuration";

let esClient: Client;

export const getElasticsearchClient = () => {
  const esConfig = Configuration.get("elasticsearch");
  if (!esClient) {
    esClient = new Client({
      node: `http://${esConfig.host}:${esConfig.port}`,
    });
  }
  return esClient;
};
