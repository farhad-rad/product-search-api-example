import database from "./database";
import cache from "./cache";
import elasticsearch from "./elasticsearch";

export default () =>
  ({
    database: database(),
    cache: cache(),
    elasticsearch: elasticsearch(),
  } as const);
