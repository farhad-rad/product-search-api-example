import { createPool } from "mysql2/promise";
import { Configuration } from "../utils/Configuration";

let mysqlPool: ReturnType<typeof createPool>;

export const getMySqlClient = () => {
  const mysqlConfig = Configuration.get("database");
  if (!mysqlPool) {
    mysqlPool = createPool({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
      database: mysqlConfig.database,
      connectionLimit: 10,
    });
  }
  return mysqlPool;
};
