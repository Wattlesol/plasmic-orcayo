module.exports = {
  type: "postgres",
  host: process.env.WAB_DBHOST || "142.44.136.233",
  username: process.env.WAB_DBUSER || "wab",
  database: process.env.WAB_DBNAME || "plasmic-db",
  password: process.env.WAB_DBPASSWORD || "SEKRET",
  port: parseInt(process.env.WAB_DBPORT || "5432", 10),
  synchronize: false,
  dropSchema: false,
  logging: false,
  entities: [
    "src/wab/server/entities/**/*.ts"
  ],
  migrations: [
    "src/wab/server/migrations/**/*.ts"
  ],
  subscribers: [
    "src/wab/server/subscribers/**/*.ts"
  ],
  cli: {
    entitiesDir: "src/wab/server/entities",
    migrationsDir: "src/wab/server/migrations",
    subscribersDir: "src/wab/server/subscribers"
  }
};