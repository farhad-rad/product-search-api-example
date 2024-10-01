import dotenv from "dotenv";
import { Command } from "commander";
import { prompt } from "enquirer";
import { ICommand } from "./ICommand";
import { InitDatabaseCommand } from "./commands/InitDatabaseCommand";
import { SeedCommand } from "./commands/SeedCommand";
import chalk from "chalk";

dotenv.config({ override: false });

const availableCommands: { [key: string]: ICommand } = {
  "db:init": new InitDatabaseCommand(),
  "db:seed": new SeedCommand(),
};

async function promptForMissingInputs(
  command: ICommand,
  providedArgs: {
    parameters: string[];
    options: { [key: string]: string | boolean };
  }
) {
  const questions: any[] = [];
  const options = command.getOptions();
  const args = command.getArguments();

  for (const [key, option] of Object.entries(options)) {
    if (option.required && providedArgs.options[key] === undefined) {
      questions.push({
        type: option.type || "input",
        name: key,
        message: option.message,
        initial: option.default,
      });
    }
  }

  let convertedArgs: { [key: string]: any } = {};
  let idx = 0;
  for (const [key, arg] of Object.entries(args)) {
    if (providedArgs.parameters[idx] !== undefined) {
      convertedArgs[key] = providedArgs.parameters[idx];
    } else {
      if (!arg.required) {
        break;
      }
      questions.push({
        type: "input",
        name: key,
        message: arg.message,
      });
    }
    idx++;
  }

  if (questions.length > 0) {
    const answers = await prompt(questions);
    return { ...convertedArgs, ...answers, ...providedArgs.options };
  }

  return { ...convertedArgs, ...providedArgs.options };
}

const program = new Command();

program
  .argument("<action>", "The action to perform")
  .allowUnknownOption()
  .action(async (action: string) => {
    const args = program.args.slice(1).reduce(
      (all, x) => {
        if (x.startsWith("-")) {
          const optionName = x.split("=")[0].replace(/^-+/, "");
          if (x.includes("=")) {
            const val = x.split("=")[1];
            all.options[optionName] =
              val.toLowerCase() === "true"
                ? true
                : val.toLowerCase() === "false"
                ? false
                : val;
          } else {
            all.options[optionName] = true;
          }
        } else {
          all.parameters.push(x);
        }
        return all;
      },
      { parameters: [], options: {} } as {
        parameters: string[];
        options: { [key: string]: string | boolean };
      }
    );

    const command = availableCommands[action];
    if (!command) {
      console.log(chalk.red(`Unknown action: ${action}`));
      return;
    }

    const finalArgs = await promptForMissingInputs(command, args);

    await command.run(finalArgs);
    process.exit(0);
  });

if (process.argv.length <= 2) {
  (async () => {
    const { action } = await prompt<{ action: string }>({
      type: "select",
      name: "action",
      message: "Please select an action:",
      choices: Object.keys(availableCommands),
    });

    const command = availableCommands[action];
    const finalArgs = await promptForMissingInputs(command, {
      parameters: [],
      options: {},
    });

    await command.run(finalArgs);
    process.exit(0);
  })();
} else {
  program.parse(process.argv);
}
