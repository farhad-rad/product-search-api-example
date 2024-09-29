export class ActionResolver {
  private static controllers: { [key: string]: any } = {};
  static resolve(controllerClass: any, actionName: any) {
    return (...args: any[]) => {
      const controller = (this.controllers[controllerClass.name] ??=
        new controllerClass());
      return controller[actionName].call(controller, ...args);
    };
  }
}
