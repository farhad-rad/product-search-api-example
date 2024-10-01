import { ProductService } from "../../services/ProductService";
import { ICommand } from "../ICommand";
import chalk from "chalk";
import fs from "fs/promises";
import path from "path";

export class SeedCommand implements ICommand {
  getOptions() {
    return {};
  }

  getArguments() {
    return {};
  }

  async run(args: any) {
    const srv = ProductService.getInstance();
    console.log(chalk.green(`Seeding sample data into the database...`));

    const data: any[] = JSON.parse(
      (
        await fs.readFile(
          path.join(__dirname, "..", "data", "seed_001_products.json")
        )
      ).toString()
    );

    for (let product of data) {
      const pr = await srv.createProduct(product);
      console.log("Added:", pr);
    }

    console.log(chalk.green(`All done.`));
  }
}
