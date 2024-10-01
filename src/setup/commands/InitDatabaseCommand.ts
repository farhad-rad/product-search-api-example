import chalk from "chalk";
import fs from "fs/promises";
import path from "path";
import { ICommand } from "../ICommand";
import { getMySqlClient } from "../../lib/mysqlClient";
import { getElasticsearchClient } from "../../lib/elasticsearchClient";
import { SeedCommand } from "./SeedCommand";

export class InitDatabaseCommand implements ICommand {
  getOptions() {
    return {
      seed: {
        type: "confirm",
        message: "Do you want to seed the database?",
        required: false,
        default: false,
      },
    };
  }

  getArguments() {
    return {};
  }

  async run(args: { seed?: boolean }) {
    const { seed } = args;

    const dbPool = getMySqlClient();
    const esClient = getElasticsearchClient();

    console.log(chalk.green(`Initializing the database...`));

    try {
      console.log(chalk.cyan(`Creating MySql Tables`));

      const sql = (
        await fs.readFile(
          path.join(
            __dirname,
            "..",
            "data",
            "migration_001_create_products_table.sql"
          )
        )
      ).toString();

      for (const partition of sql
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean)) {
        await dbPool.query(partition);
      }
    } catch (error) {
      console.error(error);
      process.exit(1);
    }

    try {
      console.log(chalk.cyan(`Creating Elasticsearch Indexes`));

      const index = JSON.parse(
        (
          await fs.readFile(
            path.join(
              __dirname,
              "..",
              "data",
              "es_index_001_products_index.json"
            )
          )
        ).toString()
      );

      if (await esClient.indices.exists({ index: "products" })) {
        await esClient.indices.delete({ index: "products" });
      }

      await esClient.indices.create(index);
    } catch (error) {
      console.error(error);
      return;
    }

    if (seed) {
      await new SeedCommand().run({});
      process.exit(1);
    }

    console.log(chalk.green(`All done.`));
  }
}
