export default () => ({
  host: process.env.MYSQL_HOST || "localhost",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASS || "",
  database: process.env.MYSQL_DB || "products",
});
