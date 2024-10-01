export default () => ({
  host: process.env.ES_HOST || "localhost",
  port: process.env.ES_PORT || 9200,
});
