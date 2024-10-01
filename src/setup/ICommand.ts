export interface ICommand {
  run(args: any): Promise<void>;
  getOptions(): { [key: string]: any };
  getArguments(): { [key: string]: any };
}
